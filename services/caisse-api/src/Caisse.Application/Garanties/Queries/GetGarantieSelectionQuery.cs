using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Garanties.Queries;

/// <summary>
/// Query pour obtenir une selection de garanties
/// Migration du programme Magic Prg_110 "Garantie SELECTION"
/// </summary>
public record GetGarantieSelectionQuery(
    string Societe,
    string? TypeDepot = null,
    string? CodeDevise = null,
    string? EtatDepot = null) : IRequest<GetGarantieSelectionResult>;

public record GetGarantieSelectionResult
{
    public List<GarantieSelectionDto> Garanties { get; init; } = new();
    public int Total { get; init; }
    public double TotalMontant { get; init; }
    public List<string> TypesDisponibles { get; init; } = new();
    public List<string> DevisesDisponibles { get; init; } = new();
    public List<string> EtatsDisponibles { get; init; } = new();
}

public record GarantieSelectionDto
{
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public string NomCompte { get; init; } = string.Empty;
    public DateOnly? DateDepot { get; init; }
    public TimeOnly? HeureDepot { get; init; }
    public string TypeDepot { get; init; } = string.Empty;
    public string Devise { get; init; } = string.Empty;
    public double Montant { get; init; }
    public string Etat { get; init; } = string.Empty;
    public string Operateur { get; init; } = string.Empty;
    public int JoursDepot { get; init; }
}

public class GetGarantieSelectionQueryValidator : AbstractValidator<GetGarantieSelectionQuery>
{
    public GetGarantieSelectionQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");
    }
}

public class GetGarantieSelectionQueryHandler : IRequestHandler<GetGarantieSelectionQuery, GetGarantieSelectionResult>
{
    private readonly ICaisseDbContext _context;

    public GetGarantieSelectionQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetGarantieSelectionResult> Handle(
        GetGarantieSelectionQuery request,
        CancellationToken cancellationToken)
    {
        // Recuperer tous les depots de garantie avec filtres optionnels
        var query = _context.DepotGaranties
            .AsNoTracking()
            .Where(d => d.Societe == request.Societe);

        if (!string.IsNullOrEmpty(request.TypeDepot))
        {
            query = query.Where(d => d.TypeDepot == request.TypeDepot);
        }

        if (!string.IsNullOrEmpty(request.CodeDevise))
        {
            query = query.Where(d => d.Devise == request.CodeDevise);
        }

        if (!string.IsNullOrEmpty(request.EtatDepot))
        {
            query = query.Where(d => d.Etat == request.EtatDepot);
        }

        var depots = await query
            .OrderByDescending(d => d.DateDepot)
            .ThenByDescending(d => d.HeureDepot)
            .ToListAsync(cancellationToken);

        // Recuperer les noms des comptes
        var codeGms = depots.Select(d => d.CodeGm).Distinct().ToList();
        var comptes = await _context.ComptesGm
            .AsNoTracking()
            .Where(c =>
                c.Societe == request.Societe &&
                codeGms.Contains(c.CodeAdherent))
            .ToDictionaryAsync(c => c.CodeAdherent, cancellationToken);

        var garanties = depots.Select(d =>
        {
            var compte = comptes.TryGetValue(d.CodeGm, out var c) ? c : null;
            return new GarantieSelectionDto
            {
                Societe = d.Societe,
                CodeGm = d.CodeGm,
                Filiation = d.Filiation,
                NomCompte = compte?.NomPrenom ?? "Unknown",
                DateDepot = d.DateDepot,
                HeureDepot = d.HeureDepot,
                TypeDepot = d.TypeDepot,
                Devise = d.Devise,
                Montant = d.Montant,
                Etat = d.Etat,
                Operateur = d.Operateur,
                JoursDepot = d.DateDepot.HasValue ? (int)(DateTime.Now.Date - d.DateDepot.Value.ToDateTime(TimeOnly.MinValue)).TotalDays : 0
            };
        }).ToList();

        // Recuperer les valeurs distinctes pour les filtres
        var typesDisponibles = await _context.DepotGaranties
            .AsNoTracking()
            .Where(d => d.Societe == request.Societe)
            .Select(d => d.TypeDepot)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync(cancellationToken);

        var devisesDisponibles = await _context.DepotGaranties
            .AsNoTracking()
            .Where(d => d.Societe == request.Societe)
            .Select(d => d.Devise)
            .Distinct()
            .OrderBy(d => d)
            .ToListAsync(cancellationToken);

        var etatsDisponibles = await _context.DepotGaranties
            .AsNoTracking()
            .Where(d => d.Societe == request.Societe)
            .Select(d => d.Etat)
            .Distinct()
            .OrderBy(e => e)
            .ToListAsync(cancellationToken);

        return new GetGarantieSelectionResult
        {
            Garanties = garanties,
            Total = garanties.Count,
            TotalMontant = garanties.Sum(g => g.Montant),
            TypesDisponibles = typesDisponibles,
            DevisesDisponibles = devisesDisponibles,
            EtatsDisponibles = etatsDisponibles
        };
    }
}
