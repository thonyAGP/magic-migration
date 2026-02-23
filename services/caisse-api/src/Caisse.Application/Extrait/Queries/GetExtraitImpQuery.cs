using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Extrait.Queries;

/// <summary>
/// Query pour générer un extrait de compte à imprimer (Prg_73 - EXTRAIT_IMP)
/// </summary>
public record GetExtraitImpQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    DateOnly? DateDebut = null,
    DateOnly? DateFin = null) : IRequest<GetExtraitImpResult>;

public record GetExtraitImpResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public DateOnly DateExtrait { get; init; }
    public double SoldeInitial { get; init; }
    public double SoldeFinal { get; init; }
    public List<LigneExtraitImpDto> Lignes { get; init; } = new();
    public List<TotalServiceImpDto> TotauxParService { get; init; } = new();
}

public record LigneExtraitImpDto
{
    public DateOnly DateOperation { get; init; }
    public string CodeService { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public double MontantDebit { get; init; }
    public double MontantCredit { get; init; }
}

public record TotalServiceImpDto
{
    public string CodeService { get; init; } = string.Empty;
    public double TotalDebit { get; init; }
    public double TotalCredit { get; init; }
}

public class GetExtraitImpQueryValidator : AbstractValidator<GetExtraitImpQuery>
{
    public GetExtraitImpQueryValidator()
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

public class GetExtraitImpQueryHandler : IRequestHandler<GetExtraitImpQuery, GetExtraitImpResult>
{
    private readonly ICaisseDbContext _context;

    public GetExtraitImpQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetExtraitImpResult> Handle(
        GetExtraitImpQuery request,
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
            return new GetExtraitImpResult { Found = false };
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
            .ThenBy(t => t.CodeService)
            .ToListAsync(cancellationToken);

        var lignes = new List<LigneExtraitImpDto>();
        double totalMovements = 0;

        foreach (var mvt in mouvements)
        {
            double debit = mvt.IsVente || mvt.IsRetrait ? mvt.Montant : 0;
            double credit = mvt.IsDepot || mvt.IsAnnulation ? mvt.Montant : 0;

            totalMovements += credit - debit;

            lignes.Add(new LigneExtraitImpDto
            {
                DateOperation = mvt.DateComptable,
                CodeService = mvt.CodeService,
                Description = mvt.Commentaire,
                MontantDebit = debit,
                MontantCredit = credit
            });
        }

        var totauxParService = mouvements
            .GroupBy(m => m.CodeService)
            .Select(g => new TotalServiceImpDto
            {
                CodeService = g.Key,
                TotalDebit = g.Where(m => m.IsVente || m.IsRetrait).Sum(m => m.Montant),
                TotalCredit = g.Where(m => m.IsDepot || m.IsAnnulation).Sum(m => m.Montant)
            })
            .OrderBy(t => t.CodeService)
            .ToList();

        return new GetExtraitImpResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeAdherent = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomPrenom = compte.NomPrenom,
            DateExtrait = DateOnly.FromDateTime(DateTime.Today),
            SoldeInitial = compte.SoldeDuCompte,
            SoldeFinal = compte.SoldeDuCompte + totalMovements,
            Lignes = lignes,
            TotauxParService = totauxParService
        };
    }
}
