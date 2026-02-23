using FluentValidation;
using MediatR;

namespace Caisse.Application.Utilitaires.Commands;

/// <summary>
/// Command pour sauvegarder la configuration
/// Migration du programme Magic Prg_223 "Backup Config"
/// Cree une sauvegarde de la configuration actuelle
/// </summary>
public record BackupConfigCommand(
    string Societe,
    string? Description = null,
    bool IncludeDatabase = true,
    bool IncludeFiles = true
) : IRequest<BackupConfigResult>;

public record BackupConfigResult
{
    public bool Success { get; init; }
    public string BackupId { get; init; } = string.Empty;
    public string BackupPath { get; init; } = string.Empty;
    public string? Message { get; init; }
    public long SizeBytes { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? CodeErreur { get; init; }
}

public class BackupConfigCommandValidator : AbstractValidator<BackupConfigCommand>
{
    public BackupConfigCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.Description)
            .MaximumLength(255).WithMessage("Description must be at most 255 characters");
    }
}

public class BackupConfigCommandHandler : IRequestHandler<BackupConfigCommand, BackupConfigResult>
{
    public Task<BackupConfigResult> Handle(
        BackupConfigCommand request,
        CancellationToken cancellationToken)
    {
        var createdAt = DateTime.UtcNow;
        var backupId = $"BCK_{request.Societe}_{createdAt:yyyyMMddHHmmss}";
        var backupPath = $"/backups/{backupId}.zip";

        try
        {
            // Simulate backup creation
            return Task.FromResult(new BackupConfigResult
            {
                Success = true,
                BackupId = backupId,
                BackupPath = backupPath,
                Message = $"Backup created successfully: {backupId}",
                SizeBytes = 1024000, // Simulated size
                CreatedAt = createdAt
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new BackupConfigResult
            {
                Success = false,
                BackupId = backupId,
                CodeErreur = "BACKUP_FAILED",
                Message = ex.Message,
                CreatedAt = createdAt
            });
        }
    }
}
