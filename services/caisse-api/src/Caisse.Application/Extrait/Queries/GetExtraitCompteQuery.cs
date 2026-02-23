using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Extrait.Queries;

/// <summary>
/// Query pour générer un extrait de compte
/// Migration du programme Magic Prg_69 "Extrait de compte"
/// </summary>
public record GetExtraitCompteQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    DateOnly? DateDebut = null,
    DateOnly? DateFin = null,
    string? TriPar = "Date", // Date, Nom, Service, Cumul
    string? CodeService = null) : IRequest<GetExtraitCompteResult>;

public record GetExtraitCompteResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public string NumChambre { get; init; } = string.Empty;
    public DateOnly? DateDebutSejour { get; init; }
    public DateOnly? DateFinSejour { get; init; }
    public DateOnly DateExtrait { get; init; }
    public double SoldeInitial { get; init; }
    public double TotalDebits { get; init; }
    public double TotalCredits { get; init; }
    public double SoldeFinal { get; init; }
    public List<LigneExtraitDto> Lignes { get; init; } = new();
    public List<TotalServiceDto> TotauxParService { get; init; } = new();
}

public record LigneExtraitDto
{
    public DateOnly DateOperation { get; init; }
    public TimeOnly? HeureOperation { get; init; }
    public string TypeMouvement { get; init; } = string.Empty;
    public string CodeService { get; init; } = string.Empty;
    public string LibelleService { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public double MontantDebit { get; init; }
    public double MontantCredit { get; init; }
    public double SoldeCumule { get; init; }
    public string Reference { get; init; } = string.Empty;
    public int NumeroTicket { get; init; }
}

public record TotalServiceDto
{
    public string CodeService { get; init; } = string.Empty;
    public string LibelleService { get; init; } = string.Empty;
    public double TotalDebit { get; init; }
    public double TotalCredit { get; init; }
    public double Solde { get; init; }
}

public class GetExtraitCompteQueryValidator : AbstractValidator<GetExtraitCompteQuery>
{
    public GetExtraitCompteQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeAdherent)
            .GreaterThan(0).WithMessage("CodeAdherent must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");

        RuleFor(x => x.TriPar)
            .Must(t => t == null || new[] { "Date", "Nom", "Service", "Cumul", "Imprime" }.Contains(t))
            .WithMessage("TriPar must be one of: Date, Nom, Service, Cumul, Imprime");
    }
}

public class GetExtraitCompteQueryHandler : IRequestHandler<GetExtraitCompteQuery, GetExtraitCompteResult>
{
    private readonly ICaisseDbContext _context;

    public GetExtraitCompteQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetExtraitCompteResult> Handle(
        GetExtraitCompteQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Récupérer le compte
        var compte = await _context.ComptesGm
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Societe == request.Societe &&
                c.CodeAdherent == request.CodeAdherent &&
                c.Filiation == request.Filiation,
                cancellationToken);

        if (compte == null)
        {
            return new GetExtraitCompteResult { Found = false };
        }

        // 2. Construire la requête des mouvements
        var query = _context.CcTotaux
            .AsNoTracking()
            .Where(t =>
                t.Societe == request.Societe &&
                t.CodeGm == request.CodeAdherent &&
                t.Filiation == request.Filiation);

        if (request.DateDebut.HasValue)
            query = query.Where(t => t.DateComptable >= request.DateDebut.Value);

        if (request.DateFin.HasValue)
            query = query.Where(t => t.DateComptable <= request.DateFin.Value);

        if (!string.IsNullOrEmpty(request.CodeService))
            query = query.Where(t => t.CodeService == request.CodeService);

        // 3. Appliquer le tri
        query = request.TriPar switch
        {
            "Nom" => query.OrderBy(t => t.Commentaire).ThenBy(t => t.DateComptable),
            "Service" => query.OrderBy(t => t.CodeService).ThenBy(t => t.DateComptable),
            "Cumul" => query.OrderBy(t => t.DateComptable).ThenBy(t => t.NumeroTicket),
            _ => query.OrderBy(t => t.DateComptable).ThenBy(t => t.NumeroTicket)
        };

        var mouvements = await query.ToListAsync(cancellationToken);

        // 4. Calculer le solde cumulé et construire les lignes
        var lignes = new List<LigneExtraitDto>();
        double soldeCumule = compte.SoldeDuCompte;
        double totalDebits = 0;
        double totalCredits = 0;

        foreach (var mvt in mouvements)
        {
            double debit = mvt.IsVente || mvt.IsRetrait ? mvt.Montant : 0;
            double credit = mvt.IsDepot || mvt.IsAnnulation ? mvt.Montant : 0;

            soldeCumule += credit - debit;
            totalDebits += debit;
            totalCredits += credit;

            lignes.Add(new LigneExtraitDto
            {
                DateOperation = mvt.DateComptable,
                HeureOperation = mvt.HeureOperation,
                TypeMouvement = mvt.TypeMouvement,
                CodeService = mvt.CodeService,
                Description = mvt.Commentaire,
                MontantDebit = debit,
                MontantCredit = credit,
                SoldeCumule = soldeCumule,
                Reference = mvt.Reference,
                NumeroTicket = mvt.NumeroTicket
            });
        }

        // 5. Calculer les totaux par service
        var totauxParService = mouvements
            .GroupBy(m => m.CodeService)
            .Select(g => new TotalServiceDto
            {
                CodeService = g.Key,
                TotalDebit = g.Where(m => m.IsVente || m.IsRetrait).Sum(m => m.Montant),
                TotalCredit = g.Where(m => m.IsDepot || m.IsAnnulation).Sum(m => m.Montant),
                Solde = g.Where(m => m.IsDepot || m.IsAnnulation).Sum(m => m.Montant) -
                        g.Where(m => m.IsVente || m.IsRetrait).Sum(m => m.Montant)
            })
            .OrderBy(t => t.CodeService)
            .ToList();

        return new GetExtraitCompteResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeAdherent = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomPrenom = compte.NomPrenom,
            NumChambre = compte.NumChambre,
            DateDebutSejour = compte.DateDebutSejour,
            DateFinSejour = compte.DateFinSejour,
            DateExtrait = DateOnly.FromDateTime(DateTime.Today),
            SoldeInitial = compte.SoldeDuCompte,
            TotalDebits = totalDebits,
            TotalCredits = totalCredits,
            SoldeFinal = soldeCumule,
            Lignes = lignes,
            TotauxParService = totauxParService
        };
    }
}
