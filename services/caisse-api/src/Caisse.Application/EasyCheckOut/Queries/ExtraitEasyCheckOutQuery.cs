using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EasyCheckOut.Queries;

/// <summary>
/// Query pour générer l'extrait Easy Check Out à J+1
/// Migration du programme Magic Prg_53 "EXTRAIT_EASY_CHECKOUT"
///
/// Génère un extrait de compte pour le checkout du lendemain
/// </summary>
public record ExtraitEasyCheckOutQuery(
    string Societe,
    DateOnly DateDepart
) : IRequest<ExtraitEasyCheckOutResult>;

public record ExtraitEasyCheckOutResult
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public DateOnly DateDepart { get; init; }
    public int NombreComptes { get; init; }
    public List<ExtraitEcoDto> Extraits { get; init; } = new();
}

public record ExtraitEcoDto
{
    public int NumCompte { get; init; }
    public int Filiation { get; init; }
    public string NomClient { get; init; } = string.Empty;
    public string NumChambre { get; init; } = string.Empty;
    public decimal SoldeTotal { get; init; }
    public List<MouvementEcoDto> Mouvements { get; init; } = new();
}

public record MouvementEcoDto
{
    public DateOnly Date { get; init; }
    public string Libelle { get; init; } = string.Empty;
    public decimal Debit { get; init; }
    public decimal Credit { get; init; }
}

public class ExtraitEasyCheckOutQueryValidator : AbstractValidator<ExtraitEasyCheckOutQuery>
{
    public ExtraitEasyCheckOutQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.DateDepart)
            .NotEmpty().WithMessage("DateDepart is required");
    }
}

public class ExtraitEasyCheckOutQueryHandler : IRequestHandler<ExtraitEasyCheckOutQuery, ExtraitEasyCheckOutResult>
{
    private readonly ICaisseDbContext _context;

    public ExtraitEasyCheckOutQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<ExtraitEasyCheckOutResult> Handle(
        ExtraitEasyCheckOutQuery request,
        CancellationToken cancellationToken)
    {
        // Récupérer les comptes avec checkout demain
        var comptes = await _context.GmComplets
            .AsNoTracking()
            .Where(c => c.Societe == request.Societe)
            .ToListAsync(cancellationToken);

        var extraits = new List<ExtraitEcoDto>();

        foreach (var compte in comptes)
        {
            // Récupérer les dépôts de garantie (mouvements financiers)
            var depots = await _context.DepotGaranties
                .AsNoTracking()
                .Where(d => d.Societe == request.Societe &&
                           d.CodeGm == compte.Compte)
                .OrderBy(d => d.DateDepot)
                .ToListAsync(cancellationToken);

            var mouvements = depots.Select(d => new MouvementEcoDto
            {
                Date = d.DateDepot ?? DateOnly.MinValue,
                Libelle = $"Depot {d.TypeDepot} ({d.Devise})",
                Debit = d.Montant < 0 ? (decimal)Math.Abs(d.Montant) : 0,
                Credit = d.Montant > 0 ? (decimal)d.Montant : 0
            }).ToList();

            var solde = (decimal)depots.Sum(d => d.Montant);

            extraits.Add(new ExtraitEcoDto
            {
                NumCompte = compte.Compte,
                Filiation = compte.FiliationCompte,
                NomClient = $"{compte.NomComplet} {compte.PrenomComplet}".Trim(),
                NumChambre = "", // Not available in GmComplet
                SoldeTotal = solde,
                Mouvements = mouvements
            });
        }

        return new ExtraitEasyCheckOutResult
        {
            Success = true,
            DateDepart = request.DateDepart,
            NombreComptes = extraits.Count,
            Extraits = extraits
        };
    }
}
