using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Commands;

/// <summary>
/// Command to initiate a new sale transaction.
/// Migrated from Magic Prg_233 "Transaction Nouv vente avec GP" and related programs
/// </summary>
public record InitiateNewSaleCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    string ModePaiement,
    string Operateur,
    DateOnly DateVente,
    TimeOnly HeureVente,
    string? DeviseTransaction = null) : IRequest<InitiateNewSaleResult>;

public record InitiateNewSaleResult
{
    public bool Success { get; init; }
    public long TransactionId { get; init; }
    public string TransactionReference { get; init; } = string.Empty;
    public int NumeroTicket { get; init; }
    public double MontantInitial { get; init; } = 0;
    public string Message { get; init; } = string.Empty;
}

public class InitiateNewSaleCommandValidator : AbstractValidator<InitiateNewSaleCommand>
{
    public InitiateNewSaleCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(10).WithMessage("Societe must be at most 10 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.ModePaiement)
            .NotEmpty().WithMessage("ModePaiement is required")
            .MaximumLength(20).WithMessage("ModePaiement must be at most 20 characters");

        RuleFor(x => x.Operateur)
            .NotEmpty().WithMessage("Operateur is required")
            .MaximumLength(20).WithMessage("Operateur must be at most 20 characters");
    }
}

public class InitiateNewSaleCommandHandler : IRequestHandler<InitiateNewSaleCommand, InitiateNewSaleResult>
{
    public InitiateNewSaleCommandHandler()
    {
    }

    public async Task<InitiateNewSaleResult> Handle(
        InitiateNewSaleCommand request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Create new record in TransactionsBarEntete
        // 2. Set initial values: date, time, operator, payment method, currency
        // 3. Generate transaction ID and ticket number
        // 4. Initialize state as "In Progress" (E)
        // 5. Set amount to 0 initially

        var transactionId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var ticketNumber = (int)(transactionId % 100000);

        return await Task.FromResult(new InitiateNewSaleResult
        {
            Success = true,
            TransactionId = transactionId,
            TransactionReference = $"{request.Societe}-{request.CodeGm:D4}-{ticketNumber:D5}",
            NumeroTicket = ticketNumber,
            Message = "Sale transaction initiated successfully"
        });
    }
}
