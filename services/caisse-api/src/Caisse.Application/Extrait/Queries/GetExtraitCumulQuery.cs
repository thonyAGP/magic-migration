using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Extrait.Queries;

/// <summary>
/// Query pour générer un extrait de compte avec cumuls (Prg_72 - EXTRAIT_CUM)
/// </summary>
public record GetExtraitCumulQuery(
    string Societe,
    int CodeAdherent,
    int Filiation,
    DateOnly? DateDebut = null,
    DateOnly? DateFin = null) : IRequest<GetExtraitCumulResult>;

public record GetExtraitCumulResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeAdherent { get; init; }
    public int Filiation { get; init; }
    public string NomPrenom { get; init; } = string.Empty;
    public DateOnly DateExtrait { get; init; }
    public double SoldeInitial { get; init; }
    public double SoldeFinal { get; init; }
    public double TotalDebits { get; init; }
    public double TotalCredits { get; init; }
    public List<LigneExtraitCumulDto> Lignes { get; init; } = new();
}

public record LigneExtraitCumulDto
{
    public DateOnly DateOperation { get; init; }
    public string Description { get; init; } = string.Empty;
    public double Montant { get; init; }
    public string TypeMouvement { get; init; } = string.Empty;
    public double SoldeCumule { get; init; }
}

public class GetExtraitCumulQueryValidator : AbstractValidator<GetExtraitCumulQuery>
{
    public GetExtraitCumulQueryValidator()
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

public class GetExtraitCumulQueryHandler : IRequestHandler<GetExtraitCumulQuery, GetExtraitCumulResult>
{
    private readonly ICaisseDbContext _context;

    public GetExtraitCumulQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetExtraitCumulResult> Handle(
        GetExtraitCumulQuery request,
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
            return new GetExtraitCumulResult { Found = false };
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

        var lignes = new List<LigneExtraitCumulDto>();
        double soldeCumule = compte.SoldeDuCompte;
        double totalDebits = 0;
        double totalCredits = 0;

        foreach (var mvt in mouvements)
        {
            double debit = mvt.IsVente || mvt.IsRetrait ? mvt.Montant : 0;
            double credit = mvt.IsDepot || mvt.IsAnnulation ? mvt.Montant : 0;

            totalDebits += debit;
            totalCredits += credit;
            soldeCumule += credit - debit;

            lignes.Add(new LigneExtraitCumulDto
            {
                DateOperation = mvt.DateComptable,
                Description = mvt.Commentaire,
                Montant = mvt.Montant,
                TypeMouvement = mvt.TypeMouvement,
                SoldeCumule = soldeCumule
            });
        }

        return new GetExtraitCumulResult
        {
            Found = true,
            Societe = compte.Societe,
            CodeAdherent = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomPrenom = compte.NomPrenom,
            DateExtrait = DateOnly.FromDateTime(DateTime.Today),
            SoldeInitial = compte.SoldeDuCompte,
            SoldeFinal = soldeCumule,
            TotalDebits = totalDebits,
            TotalCredits = totalCredits,
            Lignes = lignes
        };
    }
}
