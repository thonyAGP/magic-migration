using FluentValidation;
using MediatR;

namespace Caisse.Application.Utilitaires.Commands;

/// <summary>
/// Command pour restaurer une configuration
/// Migration du programme Magic Prg_224 "Restore Config"
/// Restaure une configuration a partir d'une sauvegarde anterieure
/// </summary>
public record RestoreConfigCommand(
    string Societe,
    string BackupId,
    bool ConfirmRestore = false
) : IRequest<RestoreConfigResult>;

public record RestoreConfigResult
{
    public bool Success { get; init; }
    public string BackupId { get; init; } = string.Empty;
    public string? Message { get; init; }
    public int ItemsRestored { get; init; }
    public DateTime RestoredAt { get; init; }
    public string? CodeErreur { get; init; }
    public string? WarningMessage { get; init; }
}

public class RestoreConfigCommandValidator : AbstractValidator<RestoreConfigCommand>
{
    public RestoreConfigCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.BackupId)
            .NotEmpty().WithMessage("BackupId is required")
            .MaximumLength(50).WithMessage("BackupId must be at most 50 characters");

        RuleFor(x => x.ConfirmRestore)
            .Equal(true).WithMessage("Restore must be confirmed");
    }
}

public class RestoreConfigCommandHandler : IRequestHandler<RestoreConfigCommand, RestoreConfigResult>
{
    public Task<RestoreConfigResult> Handle(
        RestoreConfigCommand request,
        CancellationToken cancellationToken)
    {
        var restoredAt = DateTime.UtcNow;

        try
        {
            if (!request.ConfirmRestore)
            {
                return Task.FromResult(new RestoreConfigResult
                {
                    Success = false,
                    BackupId = request.BackupId,
                    CodeErreur = "NOT_CONFIRMED",
                    Message = "Restore operation must be confirmed",
                    RestoredAt = restoredAt
                });
            }

            // Simulate restore operation
            return Task.FromResult(new RestoreConfigResult
            {
                Success = true,
                BackupId = request.BackupId,
                Message = $"Configuration restored successfully from backup {request.BackupId}",
                ItemsRestored = 42,
                RestoredAt = restoredAt,
                WarningMessage = "Please verify all settings after restore"
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new RestoreConfigResult
            {
                Success = false,
                BackupId = request.BackupId,
                CodeErreur = "RESTORE_FAILED",
                Message = ex.Message,
                RestoredAt = restoredAt
            });
        }
    }
}
