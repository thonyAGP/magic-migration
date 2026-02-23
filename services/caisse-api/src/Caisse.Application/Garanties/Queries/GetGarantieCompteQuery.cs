using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Garanties.Queries;

/// <summary>
/// Query pour récupérer les garanties d'un compte
/// Migration du programme Magic Prg_111 "Garantie sur compte"
/// </summary>
public record GetGarantieCompteQuery(
    string Societe,
    int CodeAdherent,
    int Filiation) : IRequest<GetGarantieCompteResult>;

public record GetGarantieCompteResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public string EtatCompte { get; init; } = string.Empty;
    public bool CompteGaranti { get; init; }
    public double SoldeCompte { get; init; }
    public double TotalDepotsActifs { get; init; }
    public int NombreDepotsActifs { get; init; }
    public List<DepotGarantieDto> Depots { get; init; } = new();
    public List<TypeGarantieDto> TypesGarantieDisponibles { get; init; } = new();
}

public record DepotGarantieDto
{
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public DateOnly? DateDepot { get; init; }
    public TimeOnly? HeureDepot { get; init; }
    public DateOnly? DateRetrait { get; init; }
    public TimeOnly? HeureRetrait { get; init; }
    public string TypeDepot { get; init; } = string.Empty;
    public string LibelleType { get; init; } = string.Empty;
    public string Devise { get; init; } = string.Empty;
    public double Montant { get; init; }
    public string Etat { get; init; } = string.Empty;
    public string Operateur { get; init; } = string.Empty;
    public bool IsActif { get; init; }
}

public record TypeGarantieDto
{
    public string CodeGarantie { get; init; } = string.Empty;
    public string Libelle { get; init; } = string.Empty;
    public double MontantDefaut { get; init; }
    public string Classe { get; init; } = string.Empty;
}

public class GetGarantieCompteQueryValidator : AbstractValidator<GetGarantieCompteQuery>
{
    public GetGarantieCompteQueryValidator()
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

public class GetGarantieCompteQueryHandler : IRequestHandler<GetGarantieCompteQuery, GetGarantieCompteResult>
{
    private readonly ICaisseDbContext _context;

    public GetGarantieCompteQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetGarantieCompteResult> Handle(
        GetGarantieCompteQuery request,
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
            return new GetGarantieCompteResult { Found = false };
        }

        // 2. Récupérer les dépôts de garantie
        var depots = await _context.DepotGaranties
            .AsNoTracking()
            .Where(d =>
                d.Societe == request.Societe &&
                d.CodeGm == request.CodeAdherent &&
                d.Filiation == request.Filiation)
            .OrderByDescending(d => d.DateDepot)
            .ThenByDescending(d => d.HeureDepot)
            .ToListAsync(cancellationToken);

        // 3. Récupérer les types de garantie disponibles
        var typesGarantie = await _context.Garanties
            .AsNoTracking()
            .Where(g => g.Societe == request.Societe)
            .OrderBy(g => g.CodeGarantie)
            .Select(g => new TypeGarantieDto
            {
                CodeGarantie = g.CodeGarantie,
                Libelle = g.Libelle,
                MontantDefaut = g.Montant,
                Classe = g.CodeClasse
            })
            .ToListAsync(cancellationToken);

        var depotsDto = depots.Select(d => new DepotGarantieDto
        {
            Societe = d.Societe,
            CodeGm = d.CodeGm,
            Filiation = d.Filiation,
            DateDepot = d.DateDepot,
            HeureDepot = d.HeureDepot,
            DateRetrait = d.DateRetrait,
            HeureRetrait = d.HeureRetrait,
            TypeDepot = d.TypeDepot,
            Devise = d.Devise,
            Montant = d.Montant,
            Etat = d.Etat,
            Operateur = d.Operateur,
            IsActif = d.DateRetrait == null
        }).ToList();

        var depotsActifs = depotsDto.Where(d => d.IsActif).ToList();

        return new GetGarantieCompteResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeAdherent = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomPrenom = compte.NomPrenom,
            EtatCompte = compte.Etat,
            CompteGaranti = compte.HasGarantie,
            SoldeCompte = compte.SoldeDuCompte,
            TotalDepotsActifs = depotsActifs.Sum(d => d.Montant),
            NombreDepotsActifs = depotsActifs.Count(),
            Depots = depotsDto,
            TypesGarantieDisponibles = typesGarantie
        };
    }
}
