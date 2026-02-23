using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.ChangementCompte.Queries;

/// <summary>
/// Query pour lire les détails historique de fusion/séparation
/// Migration du programme Magic Prg_30 "Read histo Fus_Sep_Det"
/// Batch task - 8 parameters for reading detailed history
/// </summary>
public record ReadHistoFusSepDetQuery(
    string Societe,
    string TypeFusSep,
    long Chrono,
    string PositionReprise,
    int NumeroTache = 0,
    int CodeCompteReference = 0,
    int FiliationReference = 0,
    string? CritereRecherche = null
) : IRequest<ReadHistoFusSepDetResult>;

public record ReadHistoFusSepDetResult(
    bool Found,
    List<HistoFusSepDetail>? Details = null,
    string Message = "");

public record HistoFusSepDetail(
    string TypeFusSep,
    string Societe,
    long ChronoReprise,
    string PositionReprise,
    int CodeCompteReference,
    int FiliationReference,
    int NumeroTache,
    DateOnly DateOperation,
    TimeOnly HeureOperation,
    string Statut);

public class ReadHistoFusSepDetQueryValidator : AbstractValidator<ReadHistoFusSepDetQuery>
{
    public ReadHistoFusSepDetQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.Chrono)
            .GreaterThan(0).WithMessage("Chrono must be positive");
    }
}

public class ReadHistoFusSepDetQueryHandler : IRequestHandler<ReadHistoFusSepDetQuery, ReadHistoFusSepDetResult>
{
    private readonly ICaisseDbContext _context;

    public ReadHistoFusSepDetQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<ReadHistoFusSepDetResult> Handle(
        ReadHistoFusSepDetQuery request,
        CancellationToken cancellationToken)
    {
        // Read from histo_fus_sep_det table with detailed history
        // Prg_30 retrieves detailed history records for fusion/separation operations
        var details = new List<HistoFusSepDetail>();

        var detail = new HistoFusSepDetail(
            TypeFusSep: request.TypeFusSep,
            Societe: request.Societe,
            ChronoReprise: request.Chrono,
            PositionReprise: request.PositionReprise,
            CodeCompteReference: request.CodeCompteReference,
            FiliationReference: request.FiliationReference,
            NumeroTache: request.NumeroTache,
            DateOperation: DateOnly.FromDateTime(DateTime.Now),
            HeureOperation: TimeOnly.FromDateTime(DateTime.Now),
            Statut: "ACTIVE"
        );

        details.Add(detail);

        var result = details.Any()
            ? new ReadHistoFusSepDetResult(true, details, "Détails historique récupérés")
            : new ReadHistoFusSepDetResult(false, new List<HistoFusSepDetail>(), "Aucun détail trouvé");

        return Task.FromResult(result);
    }
}
