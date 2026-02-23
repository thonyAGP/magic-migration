using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Solde.Queries;

/// <summary>
/// Query pour calculer le solde d'un compte GM
/// Migration du programme Magic Prg_192 "Solde compte fin sejour"
/// </summary>
public record GetSoldeCompteQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    DateOnly? DateSolde = null) : IRequest<GetSoldeCompteResult>;

public record GetSoldeCompteResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public string EtatCompte { get; init; } = string.Empty;
    public double SoldeCompte { get; init; }
    public double SoldeVentes { get; init; }
    public double SoldeDepots { get; init; }
    public double SoldeGaranties { get; init; }
    public double SoldeTotal { get; init; }
    public string DeviseCompte { get; init; } = string.Empty;
    public int NbDecimales { get; init; }
    public DateOnly? DateDebutSejour { get; init; }
    public DateOnly? DateFinSejour { get; init; }
    public string NumChambre { get; init; } = string.Empty;
    public bool HasGarantie { get; init; }
    public bool CanSettle { get; init; }
    public List<MouvementDto> DerniersMouvements { get; init; } = new();
}

public record MouvementDto
{
    public DateOnly DateComptable { get; init; }
    public string TypeMouvement { get; init; } = string.Empty;
    public double Montant { get; init; }
    public string CodeService { get; init; } = string.Empty;
    public string Commentaire { get; init; } = string.Empty;
}

public class GetSoldeCompteQueryValidator : AbstractValidator<GetSoldeCompteQuery>
{
    public GetSoldeCompteQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeAdherent)
            .GreaterThan(0).WithMessage("CodeAdherent must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");
    }
}

public class GetSoldeCompteQueryHandler : IRequestHandler<GetSoldeCompteQuery, GetSoldeCompteResult>
{
    private readonly ICaisseDbContext _context;

    public GetSoldeCompteQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetSoldeCompteResult> Handle(
        GetSoldeCompteQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Récupérer le compte GM
        var compte = await _context.ComptesGm
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Societe == request.Societe &&
                c.CodeAdherent == request.CodeAdherent &&
                c.Filiation == request.Filiation,
                cancellationToken);

        if (compte == null)
        {
            return new GetSoldeCompteResult { Found = false };
        }

        // 2. Calculer le solde des ventes (CcTotal)
        var dateSolde = request.DateSolde ?? DateOnly.FromDateTime(DateTime.Today);

        var totauxVentes = await _context.CcTotaux
            .AsNoTracking()
            .Where(t =>
                t.Societe == request.Societe &&
                t.CodeGm == request.CodeAdherent &&
                t.Filiation == request.Filiation &&
                t.DateComptable <= dateSolde)
            .GroupBy(t => t.TypeMouvement)
            .Select(g => new { Type = g.Key, Total = g.Sum(t => t.Montant) })
            .ToListAsync(cancellationToken);

        var soldeVentes = totauxVentes
            .Where(t => t.Type == "V")
            .Sum(t => t.Total);

        var soldeAnnulations = totauxVentes
            .Where(t => t.Type == "A")
            .Sum(t => t.Total);

        // 3. Calculer le solde des dépôts/garanties
        var depots = await _context.DepotGaranties
            .AsNoTracking()
            .Where(d =>
                d.Societe == request.Societe &&
                d.CodeGm == request.CodeAdherent &&
                d.Filiation == request.Filiation &&
                d.DateRetrait == null) // Dépôts non retirés
            .SumAsync(d => d.Montant, cancellationToken);

        // 4. Récupérer les derniers mouvements
        var derniersMouvements = await _context.CcTotaux
            .AsNoTracking()
            .Where(t =>
                t.Societe == request.Societe &&
                t.CodeGm == request.CodeAdherent &&
                t.Filiation == request.Filiation)
            .OrderByDescending(t => t.DateComptable)
            .ThenByDescending(t => t.NumeroTicket)
            .Take(10)
            .Select(t => new MouvementDto
            {
                DateComptable = t.DateComptable,
                TypeMouvement = t.TypeMouvement,
                Montant = t.Montant,
                CodeService = t.CodeService,
                Commentaire = t.Commentaire
            })
            .ToListAsync(cancellationToken);

        // 5. Calculer le solde total
        var soldeTotal = compte.SoldeDuCompte + soldeVentes - soldeAnnulations - depots;

        return new GetSoldeCompteResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeAdherent = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomPrenom = compte.NomPrenom,
            EtatCompte = compte.Etat,
            SoldeCompte = compte.SoldeDuCompte,
            SoldeVentes = soldeVentes - soldeAnnulations,
            SoldeDepots = depots,
            SoldeGaranties = depots, // Simplification - à affiner selon logique métier
            SoldeTotal = soldeTotal,
            DeviseCompte = compte.DeviseCompte,
            NbDecimales = compte.NbDecimales,
            DateDebutSejour = compte.DateDebutSejour,
            DateFinSejour = compte.DateFinSejour,
            NumChambre = compte.NumChambre,
            HasGarantie = compte.HasGarantie,
            CanSettle = compte.CanSettle,
            DerniersMouvements = derniersMouvements
        };
    }
}
