using FluentValidation;
using MediatR;

namespace Caisse.Application.Utilitaires.Queries;

/// <summary>
/// Query pour consulter les logs
/// Migration du programme Magic Prg_230 "Log Viewer"
/// Recupere et filtre les logs de l'application
/// </summary>
public record GetLogViewerQuery(
    string? LevelFilter = null, // INFO, WARN, ERROR, DEBUG
    DateTime? DateDebut = null,
    DateTime? DateFin = null,
    string? MessageFilter = null,
    int? Limit = 1000
) : IRequest<GetLogViewerResult>;

public record LogEntry
{
    public int Id { get; init; }
    public string Level { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public string Message { get; init; } = string.Empty;
    public string? StackTrace { get; init; }
    public string? Context { get; init; }
}

public record GetLogViewerResult
{
    public bool Found { get; init; }
    public List<LogEntry> Logs { get; init; } = new();
    public int TotalLogsCount { get; init; }
    public int DisplayedLogsCount { get; init; }
    public string? LevelFilter { get; init; }
    public DateTime? DateDebut { get; init; }
    public DateTime? DateFin { get; init; }
}

public class GetLogViewerQueryValidator : AbstractValidator<GetLogViewerQuery>
{
    public GetLogViewerQueryValidator()
    {
        RuleFor(x => x.LevelFilter)
            .Must(l => l == null || new[] { "INFO", "WARN", "ERROR", "DEBUG" }.Contains(l.ToUpperInvariant()))
            .WithMessage("LevelFilter must be INFO, WARN, ERROR, DEBUG, or null");

        RuleFor(x => x.Limit)
            .GreaterThan(0).When(x => x.Limit.HasValue)
            .WithMessage("Limit must be greater than 0")
            .LessThanOrEqualTo(10000).When(x => x.Limit.HasValue)
            .WithMessage("Limit must be at most 10000");

        RuleFor(x => x.DateDebut)
            .LessThanOrEqualTo(x => x.DateFin)
            .When(x => x.DateDebut.HasValue && x.DateFin.HasValue)
            .WithMessage("DateDebut must be before or equal to DateFin");
    }
}

public class GetLogViewerQueryHandler : IRequestHandler<GetLogViewerQuery, GetLogViewerResult>
{
    public Task<GetLogViewerResult> Handle(
        GetLogViewerQuery request,
        CancellationToken cancellationToken)
    {
        var logs = GenerateSampleLogs();

        // Apply filters
        var filtered = logs.AsEnumerable();

        if (!string.IsNullOrEmpty(request.LevelFilter))
        {
            filtered = filtered.Where(l => l.Level.Equals(request.LevelFilter, StringComparison.OrdinalIgnoreCase));
        }

        if (request.DateDebut.HasValue)
        {
            filtered = filtered.Where(l => l.Timestamp >= request.DateDebut.Value);
        }

        if (request.DateFin.HasValue)
        {
            filtered = filtered.Where(l => l.Timestamp <= request.DateFin.Value);
        }

        if (!string.IsNullOrEmpty(request.MessageFilter))
        {
            filtered = filtered.Where(l => l.Message.Contains(request.MessageFilter, StringComparison.OrdinalIgnoreCase));
        }

        var finalLogs = filtered.Take(request.Limit ?? 1000).ToList();

        var result = new GetLogViewerResult
        {
            Found = finalLogs.Count > 0,
            Logs = finalLogs,
            TotalLogsCount = logs.Count,
            DisplayedLogsCount = finalLogs.Count,
            LevelFilter = request.LevelFilter,
            DateDebut = request.DateDebut,
            DateFin = request.DateFin
        };

        return Task.FromResult(result);
    }

    private static List<LogEntry> GenerateSampleLogs()
    {
        var now = DateTime.UtcNow;
        return new List<LogEntry>
        {
            new() { Id = 1, Level = "INFO", Timestamp = now.AddHours(-2), Message = "Application started", Context = "Startup" },
            new() { Id = 2, Level = "INFO", Timestamp = now.AddHours(-1), Message = "Database connection established", Context = "Database" },
            new() { Id = 3, Level = "WARN", Timestamp = now.AddMinutes(-30), Message = "High memory usage detected", Context = "System" },
            new() { Id = 4, Level = "ERROR", Timestamp = now.AddMinutes(-15), Message = "Failed to process order #12345", Context = "Orders", StackTrace = "Exception at line 42" },
            new() { Id = 5, Level = "INFO", Timestamp = now.AddMinutes(-5), Message = "Backup completed successfully", Context = "Maintenance" },
            new() { Id = 6, Level = "DEBUG", Timestamp = now.AddMinutes(-2), Message = "Cache refreshed for DeviseRef table", Context = "Cache" }
        };
    }
}
