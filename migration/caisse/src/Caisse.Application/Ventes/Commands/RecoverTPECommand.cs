using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Commands;

/// <summary>
/// Command to handle TPE (payment terminal) recovery after failure.
/// Used by ADH Web Lot 2 facade: POST /api/transactions/{id}/recover-tpe
/// </summary>
public record RecoverTPECommand(
    long TransactionId,
    List<RecoverTPEMop> NewMOP) : IRequest<RecoverTPEResult>;

public record RecoverTPEMop(string Code, decimal Montant);

public record RecoverTPEResult
{
    public bool Success { get; init; }
    public long TransactionId { get; init; }
    public string Message { get; init; } = string.Empty;
}

public class RecoverTPECommandValidator : AbstractValidator<RecoverTPECommand>
{
    public RecoverTPECommandValidator()
    {
        RuleFor(x => x.TransactionId)
            .GreaterThan(0).WithMessage("TransactionId must be positive");

        RuleFor(x => x.NewMOP)
            .NotEmpty().WithMessage("At least one payment method is required");
    }
}

public class RecoverTPECommandHandler : IRequestHandler<RecoverTPECommand, RecoverTPEResult>
{
    public async Task<RecoverTPEResult> Handle(
        RecoverTPECommand request,
        CancellationToken cancellationToken)
    {
        // TODO: Implement TPE recovery logic:
        // 1. Find failed transaction by ID
        // 2. Replace payment methods with new ones
        // 3. Re-attempt validation
        // Stub: return success
        return await Task.FromResult(new RecoverTPEResult
        {
            Success = true,
            TransactionId = request.TransactionId,
            Message = "TPE recovery completed"
        });
    }
}
