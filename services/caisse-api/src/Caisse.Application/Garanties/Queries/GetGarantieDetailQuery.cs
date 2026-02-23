using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Garanties.Queries;

/// <summary>
/// Query pour récupérer les details de garantie
/// Migration du programme Magic Prg_107 "Garantie DETAIL"
/// </summary>
public record GetGarantieDetailQuery(
    string Societe,
    int CodeGm,
    int Filiation) : IRequest<GetGarantieDetailResult>;

public record GetGarantieDetailResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public string NomCompte { get; init; } = string.Empty;
    public string EtatCompte { get; init; } = string.Empty;
    public double SoldeCompte { get; init; }
    public List<DetailDepotDto> Details { get; init; } = new();
    public int TotalDepots { get; init; }
    public double TotalMontant { get; init; }
}

public record DetailDepotDto
{
    public DateOnly? DateDepot { get; init; }
    public TimeOnly? HeureDepot { get; init; }
    public DateOnly? DateRetrait { get; init; }
    public TimeOnly? HeureRetrait { get; init; }
    public string TypeDepot { get; init; } = string.Empty;
    public string Devise { get; init; } = string.Empty;
    public double Montant { get; init; }
    public string Etat { get; init; } = string.Empty;
    public string Operateur { get; init; } = string.Empty;
    public int JoursDepot { get; init; }
}

public class GetGarantieDetailQueryValidator : AbstractValidator<GetGarantieDetailQuery>
{
    public GetGarantieDetailQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");
    }
}

public class GetGarantieDetailQueryHandler : IRequestHandler<GetGarantieDetailQuery, GetGarantieDetailResult>
{
    private readonly ICaisseDbContext _context;

    public GetGarantieDetailQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetGarantieDetailResult> Handle(
        GetGarantieDetailQuery request,
        CancellationToken cancellationToken)
    {
        // Recuperer le compte
        var compte = await _context.ComptesGm
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Societe == request.Societe &&
                c.CodeAdherent == request.CodeGm &&
                c.Filiation == request.Filiation,
                cancellationToken);

        if (compte == null)
        {
            return new GetGarantieDetailResult { Found = false };
        }

        // Recuperer tous les depots de garantie
        var depots = await _context.DepotGaranties
            .AsNoTracking()
            .Where(d =>
                d.Societe == request.Societe &&
                d.CodeGm == request.CodeGm &&
                d.Filiation == request.Filiation)
            .OrderByDescending(d => d.DateDepot)
            .ThenByDescending(d => d.HeureDepot)
            .ToListAsync(cancellationToken);

        var details = depots.Select(d => new DetailDepotDto
        {
            DateDepot = d.DateDepot,
            HeureDepot = d.HeureDepot,
            DateRetrait = d.DateRetrait,
            HeureRetrait = d.HeureRetrait,
            TypeDepot = d.TypeDepot,
            Devise = d.Devise,
            Montant = d.Montant,
            Etat = d.Etat,
            Operateur = d.Operateur,
            JoursDepot = d.DateDepot.HasValue ? (int)(DateTime.Now.Date - d.DateDepot.Value.ToDateTime(TimeOnly.MinValue)).TotalDays : 0
        }).ToList();

        return new GetGarantieDetailResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeGm = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomCompte = compte.NomPrenom,
            EtatCompte = compte.Etat,
            SoldeCompte = compte.SoldeDuCompte,
            Details = details,
            TotalDepots = depots.Count,
            TotalMontant = depots.Sum(d => d.Montant)
        };
    }
}
