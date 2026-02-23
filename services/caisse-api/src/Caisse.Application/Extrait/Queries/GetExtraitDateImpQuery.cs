using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Extrait.Queries;

/// <summary>
/// Query pour générer un extrait de compte avec date d'impression (Prg_74 - Print extrait DateImp /O)
/// </summary>
public record GetExtraitDateImpQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    DateOnly? DateDebut = null,
    DateOnly? DateFin = null) : IRequest<GetExtraitDateImpResult>;

public record GetExtraitDateImpResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public DateOnly DateExtrait { get; init; }
    public DateOnly DateImpression { get; init; }
    public double SoldeInitial { get; init; }
    public double SoldeFinal { get; init; }
    public List<LigneExtraitDateImpDto> Lignes { get; init; } = new();
}

public record LigneExtraitDateImpDto
{
    public DateOnly DateOperation { get; init; }
    public TimeOnly? HeureOperation { get; init; }
    public string Description { get; init; } = string.Empty;
    public double MontantDebit { get; init; }
    public double MontantCredit { get; init; }
    public double SoldeCumule { get; init; }
}

public class GetExtraitDateImpQueryValidator : AbstractValidator<GetExtraitDateImpQuery>
{
    public GetExtraitDateImpQueryValidator()
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

public class GetExtraitDateImpQueryHandler : IRequestHandler<GetExtraitDateImpQuery, GetExtraitDateImpResult>
{
    private readonly ICaisseDbContext _context;

    public GetExtraitDateImpQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetExtraitDateImpResult> Handle(
        GetExtraitDateImpQuery request,
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
            return new GetExtraitDateImpResult { Found = false };
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
            .OrderBy(t => t.DateComptable)
            .ThenBy(t => t.NumeroTicket)
            .ToListAsync(cancellationToken);

        var lignes = new List<LigneExtraitDateImpDto>();
        double soldeCumule = compte.SoldeDuCompte;

        foreach (var mvt in mouvements)
        {
            double debit = mvt.IsVente || mvt.IsRetrait ? mvt.Montant : 0;
            double credit = mvt.IsDepot || mvt.IsAnnulation ? mvt.Montant : 0;

            soldeCumule += credit - debit;

            lignes.Add(new LigneExtraitDateImpDto
            {
                DateOperation = mvt.DateComptable,
                HeureOperation = mvt.HeureOperation,
                Description = mvt.Commentaire,
                MontantDebit = debit,
                MontantCredit = credit,
                SoldeCumule = soldeCumule
            });
        }

        return new GetExtraitDateImpResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeAdherent = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomPrenom = compte.NomPrenom,
            DateExtrait = DateOnly.FromDateTime(DateTime.Today),
            DateImpression = DateOnly.FromDateTime(DateTime.Today),
            SoldeInitial = compte.SoldeDuCompte,
            SoldeFinal = soldeCumule,
            Lignes = lignes
        };
    }
}
