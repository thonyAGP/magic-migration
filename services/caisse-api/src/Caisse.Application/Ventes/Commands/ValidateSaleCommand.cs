using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Commands;

/// <summary>
/// Command to validate and finalize a sale transaction.
/// Migrated from Magic Prg_236 "Transaction Nouv vente PMS-710" validation logic
/// </summary>
public record ValidateSaleCommand(
    long TransactionId,
    string Societe,
    int CodeGm,
    int Filiation,
    decimal MontantTotal,
    decimal MontantTva,
    string DeviseTransaction,
    string? CommentaireVente = null) : IRequest<ValidateSaleResult>;

public record ValidateSaleResult
{
    public bool Success { get; init; }
    public bool ValidationPassed { get; init; }
    public long TransactionId { get; init; }
    public string EtatTransaction { get; init; } = string.Empty;
    public List<string> ValidationErrors { get; init; } = new();
    public string Message { get; init; } = string.Empty;
}

public class ValidateSaleCommandValidator : AbstractValidator<ValidateSaleCommand>
{
    public ValidateSaleCommandValidator()
    {
        RuleFor(x => x.TransactionId)
            .GreaterThan(0).WithMessage("TransactionId must be positive");

        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(10).WithMessage("Societe must be at most 10 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.MontantTotal)
            .GreaterThanOrEqualTo(0).WithMessage("MontantTotal must be non-negative");

        RuleFor(x => x.MontantTva)
            .GreaterThanOrEqualTo(0).WithMessage("MontantTva must be non-negative");

        RuleFor(x => x.DeviseTransaction)
            .NotEmpty().WithMessage("DeviseTransaction is required")
            .MaximumLength(3).WithMessage("DeviseTransaction must be at most 3 characters");
    }
}

public class ValidateSaleCommandHandler : IRequestHandler<ValidateSaleCommand, ValidateSaleResult>
{
    public ValidateSaleCommandHandler()
    {
    }

    public async Task<ValidateSaleResult> Handle(
        ValidateSaleCommand request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Load transaction and all associated detail lines
        // 2. Validate business rules:
        //    - Transaction has at least one detail line
        //    - Total amount matches sum of line items
        //    - VAT calculation is correct
        //    - All amounts are positive
        //    - Required fields are populated
        // 3. If validation passes:
        //    - Set transaction state to "V" (Validated)
        //    - Lock transaction for modification
        // 4. Return validation result with any errors

        var validationErrors = new List<string>();

        // Example validation checks
        if (request.MontantTotal < 0)
            validationErrors.Add("Total amount cannot be negative");

        if (request.MontantTva < 0)
            validationErrors.Add("VAT amount cannot be negative");

        if (request.MontantTva > request.MontantTotal)
            validationErrors.Add("VAT amount cannot exceed total amount");

        var validationPassed = validationErrors.Count == 0;
        var etatTransaction = validationPassed ? "V" : "E"; // V=Validated, E=Error

        return await Task.FromResult(new ValidateSaleResult
        {
            Success = true,
            ValidationPassed = validationPassed,
            TransactionId = request.TransactionId,
            EtatTransaction = etatTransaction,
            ValidationErrors = validationErrors,
            Message = validationPassed ? "Sale validated successfully" : "Sale validation failed"
        });
    }
}
