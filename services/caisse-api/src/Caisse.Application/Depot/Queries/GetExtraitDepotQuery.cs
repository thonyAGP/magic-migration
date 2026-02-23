using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Depot.Queries;

/// <summary>
/// Query pour obtenir l'extrait des depots (objets, devises, scelles)
/// Migration du programme Magic Prg_39 "Print extrait ObjDevSce"
/// </summary>
public record GetExtraitDepotQuery(
    string Societe,
    int CodeGm,
    int Filiation,
    string? NomVillage = null
) : IRequest<GetExtraitDepotResult>;

public record GetExtraitDepotResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public string? NomVillage { get; init; }

    // Depots par type
    public bool ExisteObjet { get; init; }
    public bool ExisteDevise { get; init; }
    public bool ExisteScelle { get; init; }

    public List<DepotDto> Depots { get; init; } = new();

    public double TotalDepot { get; init; }
    public double TotalRetrait { get; init; }
    public double SoldeNet { get; init; }
}

public record DepotDto
{
    public string TypeDepot { get; init; } = string.Empty;
    public string TypeDepotLibelle { get; init; } = string.Empty;
    public string Devise { get; init; } = string.Empty;
    public double Montant { get; init; }
    public DateOnly? DateDepot { get; init; }
    public TimeOnly? HeureDepot { get; init; }
    public DateOnly? DateRetrait { get; init; }
    public string Etat { get; init; } = string.Empty;
    public string EtatLibelle { get; init; } = string.Empty;
    public bool EstActif { get; init; }
}

public class GetExtraitDepotQueryValidator : AbstractValidator<GetExtraitDepotQuery>
{
    public GetExtraitDepotQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be greater than 0");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be >= 0");

        RuleFor(x => x.NomVillage)
            .MaximumLength(30).WithMessage("NomVillage must be at most 30 characters");
    }
}

public class GetExtraitDepotQueryHandler : IRequestHandler<GetExtraitDepotQuery, GetExtraitDepotResult>
{
    private readonly ICaisseDbContext _context;

    public GetExtraitDepotQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetExtraitDepotResult> Handle(
        GetExtraitDepotQuery request,
        CancellationToken cancellationToken)
    {
        // Rechercher les depots garantie pour cet adherent
        var depots = await _context.DepotGaranties
            .AsNoTracking()
            .Where(d =>
                d.Societe == request.Societe &&
                d.CodeGm == request.CodeGm &&
                d.Filiation == request.Filiation)
            .OrderByDescending(d => d.DateDepot)
            .ToListAsync(cancellationToken);

        if (!depots.Any())
        {
            return new GetExtraitDepotResult
            {
                Found = false,
                Societe = request.Societe,
                CodeGm = request.CodeGm,
                Filiation = request.Filiation
            };
        }

        // Categoriser les depots par type
        var existeObjet = depots.Any(d => d.TypeDepot == "O");
        var existeDevise = depots.Any(d => d.TypeDepot == "D");
        var existeScelle = depots.Any(d => d.TypeDepot == "S");

        // Calcul des totaux
        var depotsActifs = depots.Where(d => d.Etat != "R").ToList();
        var depotsRetires = depots.Where(d => d.Etat == "R").ToList();

        var totalDepot = depotsActifs.Sum(d => d.Montant);
        var totalRetrait = depotsRetires.Sum(d => d.Montant);
        var soldeNet = totalDepot;

        return new GetExtraitDepotResult
        {
            Found = true,
            Societe = request.Societe,
            CodeGm = request.CodeGm,
            Filiation = request.Filiation,
            NomVillage = request.NomVillage,
            ExisteObjet = existeObjet,
            ExisteDevise = existeDevise,
            ExisteScelle = existeScelle,
            Depots = depots.Select(d => new DepotDto
            {
                TypeDepot = d.TypeDepot,
                TypeDepotLibelle = GetTypeDepotLibelle(d.TypeDepot),
                Devise = d.Devise,
                Montant = d.Montant,
                DateDepot = d.DateDepot,
                HeureDepot = d.HeureDepot,
                DateRetrait = d.DateRetrait,
                Etat = d.Etat,
                EtatLibelle = GetEtatLibelle(d.Etat),
                EstActif = d.Etat != "R"
            }).ToList(),
            TotalDepot = depots.Sum(d => d.Montant),
            TotalRetrait = totalRetrait,
            SoldeNet = soldeNet
        };
    }

    private static string GetTypeDepotLibelle(string typeDepot) => typeDepot switch
    {
        "O" => "Objet",
        "D" => "Devise",
        "S" => "Scelle",
        "G" => "Garantie",
        _ => typeDepot
    };

    private static string GetEtatLibelle(string etat) => etat switch
    {
        "A" => "Actif",
        "R" => "Retire",
        "B" => "Bloque",
        _ => etat
    };
}
