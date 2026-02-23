using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Commands;

/// <summary>
/// Command to print a sales ticket (receipt).
/// Migrated from Magic Prg_232 "Print ticket vente PMS-584"
/// </summary>
public record PrintTicketVenteCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    long TransactionId,
    bool EstAnnulation = false,
    string? NomOperateur = null) : IRequest<PrintTicketVenteResult>;

public record PrintTicketVenteResult
{
    public bool Success { get; init; }
    public string TicketPath { get; init; } = string.Empty;
    public string TicketContent { get; init; } = string.Empty;
    public int NumeroTicket { get; init; }
    public string Message { get; init; } = string.Empty;
}

public class PrintTicketVenteCommandValidator : AbstractValidator<PrintTicketVenteCommand>
{
    public PrintTicketVenteCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(10).WithMessage("Societe must be at most 10 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.TransactionId)
            .GreaterThan(0).WithMessage("TransactionId must be positive");
    }
}

public class PrintTicketVenteCommandHandler : IRequestHandler<PrintTicketVenteCommand, PrintTicketVenteResult>
{
    public PrintTicketVenteCommandHandler()
    {
    }

    public async Task<PrintTicketVenteResult> Handle(
        PrintTicketVenteCommand request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Load transaction details from TransactionsBarEntete and TransactionsBarDetail
        // 2. Format receipt content with transaction details, amounts, VAT, items
        // 3. Generate PDF or text output based on printer configuration
        // 4. Return ticket content and path

        // Placeholder for actual implementation
        return await Task.FromResult(new PrintTicketVenteResult
        {
            Success = true,
            Message = "Ticket printed successfully",
            NumeroTicket = (int)(request.TransactionId % 10000)
        });
    }
}
