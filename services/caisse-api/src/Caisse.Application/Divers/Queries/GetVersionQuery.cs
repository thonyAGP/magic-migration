using FluentValidation;
using MediatR;
using System.Reflection;

namespace Caisse.Application.Divers.Queries;

/// <summary>
/// Query pour recuperer la version de l'application
/// Migration du programme Magic Prg_46 "Display Version"
/// Retourne les informations de version de l'API et des composants
/// </summary>
public record GetVersionQuery : IRequest<GetVersionResult>;

public record GetVersionResult
{
    public string ApiVersion { get; init; } = string.Empty;
    public string ApplicationName { get; init; } = "Caisse API";
    public string EnvironmentName { get; init; } = "Production";
    public DateTime BuildDateTime { get; init; }
    public string? CommitHash { get; init; }
    public List<ComponentVersionDto> Components { get; init; } = new();
    public Dictionary<string, string> Frameworks { get; init; } = new();
}

public record ComponentVersionDto
{
    public string ComponentName { get; init; } = string.Empty;
    public string Version { get; init; } = string.Empty;
    public string AssemblyVersion { get; init; } = string.Empty;
}

public class GetVersionQueryValidator : AbstractValidator<GetVersionQuery>
{
    public GetVersionQueryValidator()
    {
        // Aucune validation necessaire pour cette query
    }
}

public class GetVersionQueryHandler : IRequestHandler<GetVersionQuery, GetVersionResult>
{
    public Task<GetVersionResult> Handle(
        GetVersionQuery request,
        CancellationToken cancellationToken)
    {
        // Recuperer la version de l'assembly principal
        var assembly = Assembly.GetExecutingAssembly();
        var version = assembly.GetName().Version?.ToString() ?? "1.0.0.0";
        var fileVersion = assembly.GetCustomAttribute<AssemblyFileVersionAttribute>()?.Version ?? version;
        var informationalVersion = assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? fileVersion;

        // Recuperer les informations de build (a personnaliser selon le CI/CD)
        var buildDateTime = GetBuildDateTime(assembly);
        var commitHash = GetEnvironmentVariable("COMMIT_HASH");
        var environmentName = GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (string.IsNullOrEmpty(environmentName)) environmentName = "Production";

        // Composants
        var components = new List<ComponentVersionDto>
        {
            new()
            {
                ComponentName = "Caisse.Application",
                Version = informationalVersion,
                AssemblyVersion = version
            },
            new()
            {
                ComponentName = "Caisse.Domain",
                Version = informationalVersion,
                AssemblyVersion = version
            },
            new()
            {
                ComponentName = "Caisse.Infrastructure",
                Version = informationalVersion,
                AssemblyVersion = version
            }
        };

        // Frameworks et dependances cles
        var frameworks = new Dictionary<string, string>
        {
            { ".NET", ".NET 8.0" },
            { "MediatR", GetAssemblyVersion("MediatR") },
            { "Entity Framework Core", GetAssemblyVersion("Microsoft.EntityFrameworkCore") },
            { "Serilog", GetAssemblyVersion("Serilog") },
            { "FluentValidation", GetAssemblyVersion("FluentValidation") }
        };

        return Task.FromResult(new GetVersionResult
        {
            ApiVersion = informationalVersion,
            ApplicationName = "Caisse API",
            EnvironmentName = environmentName,
            BuildDateTime = buildDateTime,
            CommitHash = commitHash,
            Components = components,
            Frameworks = frameworks
        });
    }

    private static DateTime GetBuildDateTime(Assembly assembly)
    {
        try
        {
            // Essayer de recuperer la date de build depuis l'attribut personnalise
            var buildDate = assembly.GetCustomAttribute<AssemblyMetadataAttribute>()?
                .Value ?? string.Empty;

            if (DateTime.TryParse(buildDate, out var result))
            {
                return result;
            }

            // Sinon, utiliser la date du fichier
            var assemblyPath = assembly.Location;
            if (File.Exists(assemblyPath))
            {
                return File.GetLastWriteTime(assemblyPath);
            }

            return DateTime.UtcNow;
        }
        catch
        {
            return DateTime.UtcNow;
        }
    }

    private static string GetEnvironmentVariable(string name)
    {
        return Environment.GetEnvironmentVariable(name) ?? string.Empty;
    }

    private static string GetAssemblyVersion(string assemblyName)
    {
        try
        {
            var assembly = AppDomain.CurrentDomain.GetAssemblies()
                .FirstOrDefault(a => a.GetName().Name == assemblyName);

            if (assembly != null)
            {
                return assembly.GetName().Version?.ToString() ?? "Unknown";
            }

            return "Not loaded";
        }
        catch
        {
            return "Unknown";
        }
    }
}
