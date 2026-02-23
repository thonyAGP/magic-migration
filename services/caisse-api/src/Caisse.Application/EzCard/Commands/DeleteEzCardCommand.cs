using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EzCard.Commands;

/// <summary>
/// Command pour supprimer une carte EzCard
/// Migration du programme Magic Prg_81 "Suppression EzCard"
/// </summary>
public record DeleteEzCardCommand(
    string Societe,
    string CardCode
) : IRequest<DeleteEzCardResult>;

public record DeleteEzCardResult(
    bool Success,
    string? Error = null);

public class DeleteEzCardCommandValidator : AbstractValidator<DeleteEzCardCommand>
{
    public DeleteEzCardCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CardCode)
            .NotEmpty().WithMessage("CardCode is required")
            .MaximumLength(20).WithMessage("CardCode must be at most 20 characters");
    }
}

public class DeleteEzCardCommandHandler : IRequestHandler<DeleteEzCardCommand, DeleteEzCardResult>
{
    private readonly ICaisseDbContext _context;

    public DeleteEzCardCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<DeleteEzCardResult> Handle(
        DeleteEzCardCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var card = await _context.EzCards
                .FirstOrDefaultAsync(c =>
                    c.Societe == request.Societe &&
                    c.CardCode == request.CardCode,
                    cancellationToken);

            if (card == null)
            {
                return new DeleteEzCardResult(false, Error: "Carte non trouvee");
            }

            // Check if card is in a state that allows deletion
            if (card.Status != "D" && card.Status != "I")
            {
                return new DeleteEzCardResult(false, Error: "Impossible de supprimer une carte active");
            }

            _context.EzCards.Remove(card);
            await _context.SaveChangesAsync(cancellationToken);

            return new DeleteEzCardResult(true);
        }
        catch (Exception ex)
        {
            return new DeleteEzCardResult(false, Error: ex.Message);
        }
    }
}
