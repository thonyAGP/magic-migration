using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Extrait.Queries;

/// <summary>
/// Query pour générer un extrait de compte trié par service (Prg_76 - EXTRAIT_SERVICE)
/// </summary>
public record GetExtraitServiceQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    DateOnly? DateDebut = null,
    DateOnly? DateFin = null,
    string? CodeService = null) : IRequest<GetExtraitServiceResult>;

public record GetExtraitServiceResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public DateOnly DateExtrait { get; init; }
    public double SoldeInitial { get; init; }
    public double SoldeFinal { get; init; }
    public List<LigneExtraitServiceDto> Lignes { get; init; } = new();
    public Dictionary<string, double> TotauxParService { get; init; } = new();
}

public record LigneExtraitServiceDto
{
    public DateOnly DateOperation { get; init; }
    public string CodeService { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public double MontantDebit { get; init; }
    public double MontantCredit { get; init; }
}

public class GetExtraitServiceQueryValidator : AbstractValidator<GetExtraitServiceQuery>
{
    public GetExtraitServiceQueryValidator()
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

public class GetExtraitServiceQueryHandler : IRequestHandler<GetExtraitServiceQuery, GetExtraitServiceResult>
{
    private readonly ICaisseDbContext _context;

    public GetExtraitServiceQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetExtraitServiceResult> Handle(
        GetExtraitServiceQuery request,
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
            return new GetExtraitServiceResult { Found = false };
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

        if (!string.IsNullOrEmpty(request.CodeService))
            query = query.Where(t => t.CodeService == request.CodeService);

        var mouvements = await query
            .OrderBy(t => t.CodeService)
            .ThenBy(t => t.DateComptable)
            .ToListAsync(cancellationToken);

        var lignes = new List<LigneExtraitServiceDto>();
        var totauxParService = new Dictionary<string, double>();
        double totalMovements = 0;

        foreach (var mvt in mouvements)
        {
            double debit = mvt.IsVente || mvt.IsRetrait ? mvt.Montant : 0;
            double credit = mvt.IsDepot || mvt.IsAnnulation ? mvt.Montant : 0;

            totalMovements += credit - debit;

            lignes.Add(new LigneExtraitServiceDto
            {
                DateOperation = mvt.DateComptable,
                CodeService = mvt.CodeService,
                Description = mvt.Commentaire,
                MontantDebit = debit,
                MontantCredit = credit
            });

            if (!totauxParService.ContainsKey(mvt.CodeService))
                totauxParService[mvt.CodeService] = 0;

            totauxParService[mvt.CodeService] += credit - debit;
        }

        return new GetExtraitServiceResult
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
