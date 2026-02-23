using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Extrait.Queries;

/// <summary>
/// Query pour générer un extrait de compte détaillé par ligne
/// Migration du programme Magic Prg_67 "Extrait DETAIL"
/// </summary>
public record GetExtraitDetailQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    DateOnly? DateDebut = null,
    DateOnly? DateFin = null) : IRequest<GetExtraitDetailResult>;

public record GetExtraitDetailResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public DateOnly DateExtrait { get; init; }
    public double SoldeInitial { get; init; }
    public double SoldeFinal { get; init; }
    public List<LigneDetailDto> Lignes { get; init; } = new();
}

public record LigneDetailDto
{
    public DateOnly DateOperation { get; init; }
    public TimeOnly? HeureOperation { get; init; }
    public string CodeService { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public double Montant { get; init; }
    public string TypeMouvement { get; init; } = string.Empty;
    public int NumeroTicket { get; init; }
}

public class GetExtraitDetailQueryValidator : AbstractValidator<GetExtraitDetailQuery>
{
    public GetExtraitDetailQueryValidator()
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

public class GetExtraitDetailQueryHandler : IRequestHandler<GetExtraitDetailQuery, GetExtraitDetailResult>
{
    private readonly ICaisseDbContext _context;

    public GetExtraitDetailQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetExtraitDetailResult> Handle(
        GetExtraitDetailQuery request,
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
            return new GetExtraitDetailResult { Found = false };
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

        var lignes = mouvements.Select(mvt => new LigneDetailDto
        {
            DateOperation = mvt.DateComptable,
            HeureOperation = mvt.HeureOperation,
            CodeService = mvt.CodeService,
            Description = mvt.Commentaire,
            Montant = mvt.Montant,
            TypeMouvement = mvt.TypeMouvement,
            NumeroTicket = mvt.NumeroTicket
        }).ToList();

        double totalMouvements = lignes.Sum(l => l.TypeMouvement == "D" ? -l.Montant : l.Montant);
        double soldeFinal = compte.SoldeDuCompte + totalMouvements;

        return new GetExtraitDetailResult
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
