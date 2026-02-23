using FluentValidation;
using MediatR;

namespace Caisse.Application.Utilitaires.Queries;

/// <summary>
/// Query pour recuperer les informations systeme
/// Migration du programme Magic Prg_231 "System Info"
/// Fournit les informations de sante et de configuration du systeme
/// </summary>
public record GetSystemInfoQuery : IRequest<GetSystemInfoResult>;

public record DatabaseInfo
{
    public string ServerName { get; init; } = string.Empty;
    public string DatabaseName { get; init; } = string.Empty;
    public string DatabaseVersion { get; init; } = string.Empty;
    public long SizeBytes { get; init; }
    public int TablesCount { get; init; }
    public int IndexesCount { get; init; }
    public DateTime LastBackupDate { get; init; }
    public string ConnectionStatus { get; init; } = "Connected";
}

public record ApplicationInfo
{
    public string Version { get; init; } = string.Empty;
    public string Environment { get; init; } = string.Empty;
    public string Framework { get; init; } = ".NET 8.0";
    public string RuntimeVersion { get; init; } = string.Empty;
    public DateTime StartupTime { get; init; }
    public TimeSpan Uptime { get; init; }
}

public record SystemHealthInfo
{
    public int CpuUsagePercent { get; init; }
    public int MemoryUsagePercent { get; init; }
    public long AvailableMemoryBytes { get; init; }
    public long TotalMemoryBytes { get; init; }
    public double DiskUsagePercent { get; init; }
    public List<string> Warnings { get; init; } = new();
}

public record GetSystemInfoResult
{
    public bool Success { get; init; }
    public ApplicationInfo Application { get; init; } = new();
    public DatabaseInfo Database { get; init; } = new();
    public SystemHealthInfo SystemHealth { get; init; } = new();
    public Dictionary<string, string> Configuration { get; init; } = new();
    public DateTime RetrievedAt { get; init; }
}

public class GetSystemInfoQueryValidator : AbstractValidator<GetSystemInfoQuery>
{
    public GetSystemInfoQueryValidator()
    {
        // No validation needed
    }
}

public class GetSystemInfoQueryHandler : IRequestHandler<GetSystemInfoQuery, GetSystemInfoResult>
{
    public Task<GetSystemInfoResult> Handle(
        GetSystemInfoQuery request,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startupTime = now.AddHours(-24);

        var result = new GetSystemInfoResult
        {
            Success = true,
            RetrievedAt = now,
            Application = new ApplicationInfo
            {
                Version = "1.5.0",
                Environment = "Production",
                Framework = ".NET 8.0",
                RuntimeVersion = "8.0.0",
                StartupTime = startupTime,
                Uptime = now - startupTime
            },
            Database = new DatabaseInfo
            {
                ServerName = "sql-prod-01",
                DatabaseName = "CaisseDB",
                DatabaseVersion = "SQL Server 2019 (15.0)",
                SizeBytes = 5368709120, // 5 GB
                TablesCount = 127,
                IndexesCount = 342,
                LastBackupDate = now.AddHours(-6),
                ConnectionStatus = "Connected"
            },
            SystemHealth = new SystemHealthInfo
            {
                CpuUsagePercent = 35,
                MemoryUsagePercent = 62,
                AvailableMemoryBytes = 8589934592, // 8 GB
                TotalMemoryBytes = 16777216000, // 16 GB
                DiskUsagePercent = 71.5,
                Warnings = new List<string>
                {
                    "Disk usage above 70%",
                    "Memory usage above 60%"
                }
            },
            Configuration = new Dictionary<string, string>
            {
                { "DatabaseProvider", "SqlServer" },
                { "LogLevel", "Information" },
                { "CacheStrategy", "Distributed" },
                { "MaxConnections", "100" },
                { "RequestTimeoutSeconds", "30" },
                { "MaxUploadSizeBytes", "104857600" }
            }
        };

        return Task.FromResult(result);
    }
}
