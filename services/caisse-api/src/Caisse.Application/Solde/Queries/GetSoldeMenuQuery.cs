using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Solde.Queries;

/// <summary>
/// Query to fetch balance menu with account and balance information
/// Migration of Magic program Prg_189 "Menu Solde"
/// Returns menu options and current balance details for account selection
/// </summary>
public record GetSoldeMenuQuery(
    string Societe,
    int CodeAdherent,
    int Filiation) : IRequest<GetSoldeMenuResult>;

public record GetSoldeMenuResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public string EtatCompte { get; init; } = string.Empty;
    public double SoldeTotal { get; init; }
    public double SoldeCompte { get; init; }
    public double SoldeVentes { get; init; }
    public double SoldeDepots { get; init; }
    public string DeviseCompte { get; init; } = string.Empty;
    public int NbDecimales { get; init; }
    public DateOnly? DateDebutSejour { get; init; }
    public DateOnly? DateFinSejour { get; init; }
    public string NumChambre { get; init; } = string.Empty;
    public List<MenuOptionDto> MenuOptions { get; init; } = new();
}

public record MenuOptionDto
{
    public string Code { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public bool Available { get; init; }
    public string? Action { get; init; }
}

public class GetSoldeMenuQueryValidator : AbstractValidator<GetSoldeMenuQuery>
{
    public GetSoldeMenuQueryValidator()
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

public class GetSoldeMenuQueryHandler : IRequestHandler<GetSoldeMenuQuery, GetSoldeMenuResult>
{
    private readonly ICaisseDbContext _context;

    public GetSoldeMenuQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetSoldeMenuResult> Handle(
        GetSoldeMenuQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch account
        var compte = await _context.ComptesGm
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Societe == request.Societe &&
                c.CodeAdherent == request.CodeAdherent &&
                c.Filiation == request.Filiation,
                cancellationToken);

        if (compte == null)
        {
            return new GetSoldeMenuResult { Found = false };
        }

        // 2. Calculate balances
        var totauxVentes = await _context.CcTotaux
            .AsNoTracking()
            .Where(t =>
                t.Societe == request.Societe &&
                t.CodeGm == request.CodeAdherent &&
                t.Filiation == request.Filiation)
            .GroupBy(t => t.TypeMouvement)
            .Select(g => new { Type = g.Key, Total = g.Sum(t => t.Montant) })
            .ToListAsync(cancellationToken);

        var soldeVentes = totauxVentes
            .Where(t => t.Type == "V")
            .Sum(t => t.Total);

        var soldeAnnulations = totauxVentes
            .Where(t => t.Type == "A")
            .Sum(t => t.Total);

        var soldeDepots = await _context.DepotGaranties
            .AsNoTracking()
            .Where(d =>
                d.Societe == request.Societe &&
                d.CodeGm == request.CodeAdherent &&
                d.Filiation == request.Filiation &&
                d.DateRetrait == null)
            .SumAsync(d => d.Montant, cancellationToken);

        var soldeTotal = compte.SoldeDuCompte + (soldeVentes - soldeAnnulations) - soldeDepots;

        // 3. Build menu options based on account state
        var menuOptions = BuildMenuOptions(compte, soldeDepots);

        return new GetSoldeMenuResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeAdherent = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomPrenom = compte.NomPrenom,
            EtatCompte = compte.Etat,
            SoldeTotal = soldeTotal,
            SoldeCompte = compte.SoldeDuCompte,
            SoldeVentes = soldeVentes - soldeAnnulations,
            SoldeDepots = soldeDepots,
            DeviseCompte = compte.DeviseCompte,
            NbDecimales = compte.NbDecimales,
            DateDebutSejour = compte.DateDebutSejour,
            DateFinSejour = compte.DateFinSejour,
            NumChambre = compte.NumChambre,
            MenuOptions = menuOptions
        };
    }

    private static List<MenuOptionDto> BuildMenuOptions(
        dynamic compte,
        double soldeDepots)
    {
        var options = new List<MenuOptionDto>
        {
            new()
            {
                Code = "PRINT_SOLDE",
                Label = "Print Balance",
                Description = "Print account balance statement",
                Available = true,
                Action = "print_solde_compte"
            },
            new()
            {
                Code = "PRINT_GUARANTEE",
                Label = "Print Guarantee",
                Description = "Print guarantee deposit balance",
                Available = soldeDepots > 0,
                Action = "print_solde_garantie"
            },
            new()
            {
                Code = "VIEW_DETAILS",
                Label = "View Details",
                Description = "View transaction details",
                Available = true,
                Action = "view_solde_details"
            },
            new()
            {
                Code = "VIEW_EXTRACT",
                Label = "View Extract",
                Description = "View account extract",
                Available = true,
                Action = "view_extrait"
            },
            new()
            {
                Code = "VIEW_HISTORY",
                Label = "View History",
                Description = "View transaction history",
                Available = true,
                Action = "view_historique"
            },
            new()
            {
                Code = "EXPORT_DATA",
                Label = "Export Data",
                Description = "Export balance and transactions",
                Available = true,
                Action = "export_solde"
            }
        };

        return options;
    }
}
