using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Commands;

/// <summary>
/// Command to create the ticket footer/bottom section with regulatory information.
/// Migrated from Magic Prg_247 "Creation pied Ticket"
/// </summary>
public record CreationPiedTicketCommand(
    string Societe,
    long TransactionId,
    string ContenuFooter,
    bool IncludeConditionsGenerales = true,
    bool IncludeMentionsLegales = true) : IRequest<CreationPiedTicketResult>;

public record CreationPiedTicketResult
{
    public bool Success { get; init; }
    public long TransactionId { get; init; }
    public string FooterContent { get; init; } = string.Empty;
    public int LignesFooter { get; init; }
    public string Message { get; init; } = string.Empty;
}

public class CreationPiedTicketCommandValidator : AbstractValidator<CreationPiedTicketCommand>
{
    public CreationPiedTicketCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.TransactionId)
            .GreaterThan(0).WithMessage("TransactionId must be positive");

        RuleFor(x => x.ContenuFooter)
            .NotEmpty().WithMessage("ContenuFooter is required");
    }
}

public class CreationPiedTicketCommandHandler : IRequestHandler<CreationPiedTicketCommand, CreationPiedTicketResult>
{
    public CreationPiedTicketCommandHandler()
    {
    }

    public async Task<CreationPiedTicketResult> Handle(
        CreationPiedTicketCommand request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Build footer content with:
        //    - Thank you message
        //    - Legal mentions if required
        //    - General conditions reference if required
        //    - Company contact information
        //    - Return/exchange policy
        // 2. Format footer for receipt printer (line breaks, formatting)
        // 3. Store footer content in transaction footer field
        // 4. Count lines for printer configuration
        // 5. Return formatted footer

        var footer = request.ContenuFooter;
        if (request.IncludeConditionsGenerales)
            footer += "\nConditions générales disponibles sur demande";

        if (request.IncludeMentionsLegales)
            footer += "\nMentions légales: Conformité données personnelles";

        var lignesFooter = footer.Split("\n").Length;

        return await Task.FromResult(new CreationPiedTicketResult
        {
            Success = true,
            TransactionId = request.TransactionId,
            FooterContent = footer,
            LignesFooter = lignesFooter,
            Message = "Ticket footer created successfully"
        });
    }
}
