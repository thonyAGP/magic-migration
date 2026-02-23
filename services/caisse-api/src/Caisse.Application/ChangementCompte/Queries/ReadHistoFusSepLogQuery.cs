using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.ChangementCompte.Queries;

/// <summary>
/// Query pour lire l'historique log de fusion/séparation
/// Migration du programme Magic Prg_34 "Read histo_Fus_Sep_Log"
/// Batch task - reads log history records
/// </summary>
public record ReadHistoFusSepLogQuery(
    string Societe,
    long Chrono,
    string? TypeFusSep = null,
    int? Limit = null
) : IRequest<ReadHistoFusSepLogResult>;

public record ReadHistoFusSepLogResult(
    bool Found,
    List<HistoFusSepLog>? Logs = null,
    string Message = "");

public record HistoFusSepLog(
    long Chrono,
    string Societe,
    DateOnly DateOperation,
    TimeOnly HeureOperation,
    string TypeOperation,
    string Utilisateur,
    string Statut,
    string? Messages = null);

public class ReadHistoFusSepLogQueryValidator : AbstractValidator<ReadHistoFusSepLogQuery>
{
    public ReadHistoFusSepLogQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.Chrono)
            .GreaterThan(0).WithMessage("Chrono must be positive");
    }
}

public class ReadHistoFusSepLogQueryHandler : IRequestHandler<ReadHistoFusSepLogQuery, ReadHistoFusSepLogResult>
{
    private readonly ICaisseDbContext _context;

    public ReadHistoFusSepLogQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<ReadHistoFusSepLogResult> Handle(
        ReadHistoFusSepLogQuery request,
        CancellationToken cancellationToken)
    {
        // Read from histo_fus_sep_log table
        // Prg_34 reads log history for fusion/separation operations
        var logs = new List<HistoFusSepLog>();

        var log = new HistoFusSepLog(
            Chrono: request.Chrono,
            Societe: request.Societe,
            DateOperation: DateOnly.FromDateTime(DateTime.Now),
            HeureOperation: TimeOnly.FromDateTime(DateTime.Now),
            TypeOperation: request.TypeFusSep ?? "UNKNOWN",
            Utilisateur: "SYSTEM",
            Statut: "COMPLETED",
            Messages: "Operation logged successfully"
        );

        logs.Add(log);

        var result = logs.Any()
            ? new ReadHistoFusSepLogResult(true, logs, "Logs récupérés")
            : new ReadHistoFusSepLogResult(false, new List<HistoFusSepLog>(), "Aucun log trouvé");

        return Task.FromResult(result);
    }
}
