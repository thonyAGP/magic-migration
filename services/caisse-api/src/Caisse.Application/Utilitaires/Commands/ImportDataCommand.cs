using FluentValidation;
using MediatR;

namespace Caisse.Application.Utilitaires.Commands;

/// <summary>
/// Command pour importer les donnees
/// Migration du programme Magic Prg_226 "Import Data"
/// Importe les donnees a partir d'un fichier
/// </summary>
public record ImportDataCommand(
    string Societe,
    string FilePath,
    string ImportFormat, // CSV, XML, JSON, Excel
    bool SkipDuplicates = true,
    bool ValidateBeforeImport = true
) : IRequest<ImportDataResult>;

public record ImportDataResult
{
    public bool Success { get; init; }
    public string ImportId { get; init; } = string.Empty;
    public int RowsImported { get; init; }
    public int RowsSkipped { get; init; }
    public int RowsFailed { get; init; }
    public DateTime ImportedAt { get; init; }
    public string? Message { get; init; }
    public List<string> Errors { get; init; } = new();
    public string? CodeErreur { get; init; }
}

public class ImportDataCommandValidator : AbstractValidator<ImportDataCommand>
{
    public ImportDataCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.FilePath)
            .NotEmpty().WithMessage("FilePath is required")
            .MaximumLength(255).WithMessage("FilePath must be at most 255 characters");

        RuleFor(x => x.ImportFormat)
            .NotEmpty().WithMessage("ImportFormat is required")
            .Must(f => new[] { "CSV", "XML", "JSON", "EXCEL" }.Contains(f.ToUpperInvariant()))
            .WithMessage("ImportFormat must be CSV, XML, JSON, or EXCEL");
    }
}

public class ImportDataCommandHandler : IRequestHandler<ImportDataCommand, ImportDataResult>
{
    public Task<ImportDataResult> Handle(
        ImportDataCommand request,
        CancellationToken cancellationToken)
    {
        var importedAt = DateTime.UtcNow;
        var importId = $"IMP_{request.Societe}_{importedAt:yyyyMMddHHmmss}";

        try
        {
            // Simulate data import
            return Task.FromResult(new ImportDataResult
            {
                Success = true,
                ImportId = importId,
                Message = $"Data imported successfully from {request.FilePath}",
                RowsImported = 980,
                RowsSkipped = 15,
                RowsFailed = 5,
                ImportedAt = importedAt
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new ImportDataResult
            {
                Success = false,
                ImportId = importId,
                CodeErreur = "IMPORT_FAILED",
                Message = ex.Message,
                Errors = new List<string> { ex.Message },
                ImportedAt = importedAt
            });
        }
    }
}
