using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Extrait.Queries;

/// <summary>
/// Query pour générer un extrait de compte trié par nom (Prg_70 - EXTRAIT_NOM)
/// </summary>
public record GetExtraitNomQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    DateOnly? DateDebut = null,
    DateOnly? DateFin = null) : IRequest<GetExtraitNomResult>;

public record GetExtraitNomResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public DateOnly DateExtrait { get; init; }
    public double SoldeInitial { get; init; }
    public double SoldeFinal { get; init; }
    public List<LigneExtraitNomDto> Lignes { get; init; } = new();
}

public record LigneExtraitNomDto
{
    public DateOnly DateOperation { get; init; }
    public string Nom { get; init; } = string.Empty;
    public double Montant { get; init; }
    public string TypeMouvement { get; init; } = string.Empty;
}

public class GetExtraitNomQueryValidator : AbstractValidator<GetExtraitNomQuery>
{
    public GetExtraitNomQueryValidator()
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

public class GetExtraitNomQueryHandler : IRequestHandler<GetExtraitNomQuery, GetExtraitNomResult>
{
    private readonly ICaisseDbContext _context;

    public GetExtraitNomQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetExtraitNomResult> Handle(
        GetExtraitNomQuery request,
        CancellationToken cancellationToken)
    {
        var compte = await _context.ComptesGm
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Societe == request.Societe &&
                c.CodeAdherent == request.CodeAdherent &&
                c.Filiation == request.Filiation,
                cancellationToken);

        if (compte == null)
        {
            return new GetExtraitNomResult { Found = false };
        }

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

        var mouvements = await query
            .OrderBy(t => t.Commentaire)
            .ThenBy(t => t.DateComptable)
            .ToListAsync(cancellationToken);

        var lignes = mouvements.Select(mvt => new LigneExtraitNomDto
        {
            DateOperation = mvt.DateComptable,
            Nom = mvt.Commentaire,
            Montant = mvt.Montant,
            TypeMouvement = mvt.TypeMouvement
        }).ToList();

        double totalMovements = mouvements.Sum(m => (m.IsDepot || m.IsAnnulation ? m.Montant : 0) - (m.IsVente || m.IsRetrait ? m.Montant : 0));
        double soldeFinal = compte.SoldeDuCompte + totalMovements;

        return new GetExtraitNomResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeAdherent = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomPrenom = compte.NomPrenom,
            DateExtrait = DateOnly.FromDateTime(DateTime.Today),
            SoldeInitial = compte.SoldeDuCompte,
            SoldeFinal = soldeFinal,
            Lignes = lignes
        };
    }
}
