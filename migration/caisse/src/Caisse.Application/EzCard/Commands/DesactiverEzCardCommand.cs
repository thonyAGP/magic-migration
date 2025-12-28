using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EzCard.Commands;

/// <summary>
/// Command pour desactiver une carte EzCard
/// Migration du programme Magic Prg_83 "Deactivate all cards"
/// </summary>
public record DesactiverEzCardCommand(
    string Societe,
    string CardCode,
    string Motif
) : IRequest<DesactiverEzCardResult>;

public record DesactiverEzCardResult(
    bool Success,
    string? Error = null,
    string? CardCode = null);

public class DesactiverEzCardCommandValidator : AbstractValidator<DesactiverEzCardCommand>
{
    public DesactiverEzCardCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CardCode)
            .NotEmpty().WithMessage("CardCode is required")
            .MaximumLength(20).WithMessage("CardCode must be at most 20 characters");

        RuleFor(x => x.Motif)
            .MaximumLength(100).WithMessage("Motif must be at most 100 characters");
    }
}

public class DesactiverEzCardCommandHandler : IRequestHandler<DesactiverEzCardCommand, DesactiverEzCardResult>
{
    private readonly ICaisseDbContext _context;

    public DesactiverEzCardCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<DesactiverEzCardResult> Handle(
        DesactiverEzCardCommand request,
        CancellationToken cancellationToken)
    {
        var card = await _context.EzCards
            .FirstOrDefaultAsync(c =>
                c.Societe == request.Societe &&
                c.CardCode == request.CardCode,
                cancellationToken);

        if (card == null)
        {
            return new DesactiverEzCardResult(false, Error: "Carte non trouvee");
        }

        if (card.Status == "D")
        {
            return new DesactiverEzCardResult(false, Error: "Carte deja desactivee");
        }

        if (card.Status == "O")
        {
            return new DesactiverEzCardResult(false, Error: "Carte en opposition, impossible de desactiver");
        }

        // Desactiver la carte
        card.Desactiver();

        await _context.SaveChangesAsync(cancellationToken);

        return new DesactiverEzCardResult(true, CardCode: request.CardCode);
    }
}
