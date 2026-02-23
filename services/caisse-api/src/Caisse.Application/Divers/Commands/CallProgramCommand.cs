using FluentValidation;
using MediatR;

namespace Caisse.Application.Divers.Commands;

/// <summary>
/// Command pour appeler un programme Magic (orchestrator)
/// Migration du programme Magic Prg_44 "Call Program"
/// Permet d'appeler un autre programme avec des parametres
/// </summary>
public record CallProgramCommand(
    string Societe,
    string CodeProgramme,
    Dictionary<string, object>? Parametres = null,
    string? CodeUtilisateur = null,
    string? CodeCaisse = null
) : IRequest<CallProgramResult>;

public record CallProgramResult
{
    public bool Success { get; init; }
    public string CodeProgramme { get; init; } = string.Empty;
    public string? MessageRetour { get; init; }
    public object? ResultatExecution { get; init; }
    public Dictionary<string, object>? ParametresRetour { get; init; }
    public string? CodeErreur { get; init; }
    public string? DescriptionErreur { get; init; }
    public DateTime DateExecution { get; init; }
    public int TempsExecution { get; init; } // en millisecondes
}

public class CallProgramCommandValidator : AbstractValidator<CallProgramCommand>
{
    public CallProgramCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeProgramme)
            .NotEmpty().WithMessage("CodeProgramme is required")
            .MaximumLength(50).WithMessage("CodeProgramme must be at most 50 characters");

        RuleFor(x => x.CodeUtilisateur)
            .MaximumLength(20).WithMessage("CodeUtilisateur must be at most 20 characters");

        RuleFor(x => x.CodeCaisse)
            .MaximumLength(10).WithMessage("CodeCaisse must be at most 10 characters");
    }
}

public class CallProgramCommandHandler : IRequestHandler<CallProgramCommand, CallProgramResult>
{
    public Task<CallProgramResult> Handle(
        CallProgramCommand request,
        CancellationToken cancellationToken)
    {
        var startTime = DateTime.UtcNow;
        var startWatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            // Valider que le programme existe
            var programmeExists = ProgrammeCatalog.ProgrammesDisponibles.Contains(
                request.CodeProgramme,
                StringComparer.OrdinalIgnoreCase);

            if (!programmeExists)
            {
                startWatch.Stop();
                return Task.FromResult(new CallProgramResult
                {
                    Success = false,
                    CodeProgramme = request.CodeProgramme,
                    CodeErreur = "PRG_NOT_FOUND",
                    DescriptionErreur = $"Programme {request.CodeProgramme} non trouve dans le catalogue",
                    DateExecution = startTime,
                    TempsExecution = (int)startWatch.ElapsedMilliseconds
                });
            }

            // Simuler l'execution du programme avec les parametres fournis
            var resultat = ExecuterProgramme(request.CodeProgramme, request.Parametres);

            startWatch.Stop();

            return Task.FromResult(new CallProgramResult
            {
                Success = true,
                CodeProgramme = request.CodeProgramme,
                MessageRetour = $"Programme {request.CodeProgramme} execute avec succes",
                ResultatExecution = resultat,
                ParametresRetour = request.Parametres,
                DateExecution = startTime,
                TempsExecution = (int)startWatch.ElapsedMilliseconds
            });
        }
        catch (Exception ex)
        {
            startWatch.Stop();
            return Task.FromResult(new CallProgramResult
            {
                Success = false,
                CodeProgramme = request.CodeProgramme,
                CodeErreur = "EXECUTION_ERROR",
                DescriptionErreur = ex.Message,
                DateExecution = startTime,
                TempsExecution = (int)startWatch.ElapsedMilliseconds
            });
        }
    }

    private static object? ExecuterProgramme(string codeProgramme, Dictionary<string, object>? parametres)
    {
        // Simuler l'execution selon le programme
        return codeProgramme.ToUpperInvariant() switch
        {
            "PRG_INIT" => new { Status = "Initialized", Timestamp = DateTime.UtcNow },
            "PRG_SYNC" => new { Status = "Synchronized", RecordsProcessed = parametres?["batchSize"] ?? 0 },
            "PRG_VALIDATE" => new { Status = "Validated", IsValid = true },
            "PRG_EXPORT" => new { Status = "Exported", FileName = parametres?["fileName"] ?? "export.dat" },
            "PRG_IMPORT" => new { Status = "Imported", RecordsImported = parametres?["recordCount"] ?? 0 },
            _ => new { Status = "Executed", ProgramCode = codeProgramme }
        };
    }
}

/// <summary>
/// Catalogue des programmes disponibles
/// A etendre selon les besoins
/// </summary>
public static class ProgrammeCatalog
{
    public static readonly HashSet<string> ProgrammesDisponibles = new(StringComparer.OrdinalIgnoreCase)
    {
        // Programmes utilitaires
        "PRG_INIT",
        "PRG_SYNC",
        "PRG_VALIDATE",
        "PRG_EXPORT",
        "PRG_IMPORT",
        "PRG_BACKUP",
        "PRG_RESTORE",
        "PRG_CLEANUP",
        "PRG_OPTIMIZE",
        "PRG_REPORT",

        // Programmes metier
        "PRG_DAILY_CLOSE",
        "PRG_MONTH_CLOSE",
        "PRG_YEAR_CLOSE",
        "PRG_RECONCILE",
        "PRG_AUDIT",
        "PRG_NOTIFICATION",
        "PRG_BATCH_PROCESS",

        // Programmes de configuration
        "PRG_CONFIG_INIT",
        "PRG_CONFIG_UPDATE",
        "PRG_CONFIG_VALIDATE",
        "PRG_CONFIG_RESET"
    };
}
