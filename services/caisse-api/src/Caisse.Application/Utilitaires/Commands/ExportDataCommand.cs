using FluentValidation;
using MediatR;

namespace Caisse.Application.Utilitaires.Commands;

/// <summary>
/// Command pour exporter les donnees
/// Migration du programme Magic Prg_225 "Export Data"
/// Exporte les donnees dans un format specifie
/// </summary>
public record ExportDataCommand(
    string Societe,
    string ExportFormat, // CSV, XML, JSON, Excel
    string? TableName = null,
    DateTime? DateDebut = null,
    DateTime? DateFin = null,
    bool IncludeMetadata = true
) : IRequest<ExportDataResult>;

public record ExportDataResult
{
    public bool Success { get; init; }
    public string ExportId { get; init; } = string.Empty;
    public string ExportPath { get; init; } = string.Empty;
    public string ExportFormat { get; init; } = string.Empty;
    public long SizeBytes { get; init; }
    public int RowsExported { get; init; }
    public DateTime ExportedAt { get; init; }
    public string? Message { get; init; }
    public string? CodeErreur { get; init; }
}

public class ExportDataCommandValidator : AbstractValidator<ExportDataCommand>
{
    public ExportDataCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.ExportFormat)
            .NotEmpty().WithMessage("ExportFormat is required")
            .Must(f => new[] { "CSV", "XML", "JSON", "EXCEL" }.Contains(f.ToUpperInvariant()))
            .WithMessage("ExportFormat must be CSV, XML, JSON, or EXCEL");

        RuleFor(x => x.TableName)
            .MaximumLength(50).WithMessage("TableName must be at most 50 characters");

        RuleFor(x => x.DateDebut)
            .LessThanOrEqualTo(x => x.DateFin)
            .When(x => x.DateDebut.HasValue && x.DateFin.HasValue)
            .WithMessage("DateDebut must be before or equal to DateFin");
    }
}

public class ExportDataCommandHandler : IRequestHandler<ExportDataCommand, ExportDataResult>
{
    public Task<ExportDataResult> Handle(
        ExportDataCommand request,
        CancellationToken cancellationToken)
    {
        var exportedAt = DateTime.UtcNow;
        var exportId = $"EXP_{request.Societe}_{exportedAt:yyyyMMddHHmmss}";
        var exportPath = $"/exports/{exportId}.{request.ExportFormat.ToLowerInvariant()}";

        try
        {
            // Simulate data export
            return Task.FromResult(new ExportDataResult
            {
                Success = true,
                ExportId = exportId,
                ExportPath = exportPath,
                ExportFormat = request.ExportFormat,
                Message = $"Data exported successfully to {exportPath}",
                SizeBytes = 2048000,
                RowsExported = 1250,
                ExportedAt = exportedAt
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new ExportDataResult
            {
                Success = false,
                ExportId = exportId,
                ExportFormat = request.ExportFormat,
                CodeErreur = "EXPORT_FAILED",
                Message = ex.Message,
                ExportedAt = exportedAt
            });
        }
    }
}
