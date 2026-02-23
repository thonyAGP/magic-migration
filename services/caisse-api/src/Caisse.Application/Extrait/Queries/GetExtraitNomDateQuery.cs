using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Extrait.Queries;

/// <summary>
/// Query pour générer un extrait avec saisie de dates
/// Migration du programme Magic Prg_68 "Extrait NOM_DATE"
/// </summary>
public record GetExtraitNomDateQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    DateOnly? DateDebut = null,
    DateOnly? DateFin = null) : IRequest<GetExtraitNomDateResult>;

public record GetExtraitNomDateResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public DateOnly? DateDebut { get; init; }
    public DateOnly? DateFin { get; init; }
    public DateOnly DateExtrait { get; init; }
    public double SoldeFinal { get; init; }
    public List<LigneExtraitNomDateDto> Lignes { get; init; } = new();
}

public record LigneExtraitNomDateDto
{
    public DateOnly DateOperation { get; init; }
    public string Description { get; init; } = string.Empty;
    public double MontantDebit { get; init; }
    public double MontantCredit { get; init; }
}

public class GetExtraitNomDateQueryValidator : AbstractValidator<GetExtraitNomDateQuery>
{
    public GetExtraitNomDateQueryValidator()
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

public class GetExtraitNomDateQueryHandler : IRequestHandler<GetExtraitNomDateQuery, GetExtraitNomDateResult>
{
    private readonly ICaisseDbContext _context;

    public GetExtraitNomDateQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetExtraitNomDateResult> Handle(
        GetExtraitNomDateQuery request,
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
            return new GetExtraitNomDateResult { Found = false };
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

        var lignes = new List<LigneExtraitNomDateDto>();
        foreach (var mvt in mouvements)
        {
            double debit = mvt.IsVente || mvt.IsRetrait ? mvt.Montant : 0;
            double credit = mvt.IsDepot || mvt.IsAnnulation ? mvt.Montant : 0;

            lignes.Add(new LigneExtraitNomDateDto
            {
                DateOperation = mvt.DateComptable,
                Description = mvt.Commentaire,
                MontantDebit = debit,
                MontantCredit = credit
            });
        }

        double totalMovements = mouvements.Sum(m => (m.IsDepot || m.IsAnnulation ? m.Montant : 0) - (m.IsVente || m.IsRetrait ? m.Montant : 0));
        double soldeFinal = compte.SoldeDuCompte + totalMovements;

        return new GetExtraitNomDateResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeAdherent = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomPrenom = compte.NomPrenom,
            DateDebut = request.DateDebut,
            DateFin = request.DateFin,
            DateExtrait = DateOnly.FromDateTime(DateTime.Today),
            SoldeFinal = soldeFinal,
            Lignes = lignes
        };
    }
}
