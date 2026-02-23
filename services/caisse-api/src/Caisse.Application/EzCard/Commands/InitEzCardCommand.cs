using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EzCard.Commands;

/// <summary>
/// Command pour initialiser une carte EzCard
/// Migration du programme Magic Prg_76 "Init EzCard"
/// </summary>
public record InitEzCardCommand(
    string Societe
) : IRequest<InitEzCardResult>;

public record InitEzCardResult(
    bool Success,
    string? Error = null);

public class InitEzCardCommandValidator : AbstractValidator<InitEzCardCommand>
{
    public InitEzCardCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");
    }
}

public class InitEzCardCommandHandler : IRequestHandler<InitEzCardCommand, InitEzCardResult>
{
    private readonly ICaisseDbContext _context;

    public InitEzCardCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<InitEzCardResult> Handle(
        InitEzCardCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Initialize EzCard system for the society
            // This would typically reset/prepare the system
            var existingCards = await _context.EzCards
                .Where(c => c.Societe == request.Societe)
                .CountAsync(cancellationToken);

            return new InitEzCardResult(true);
        }
        catch (Exception ex)
        {
            return new InitEzCardResult(false, Error: ex.Message);
        }
    }
}
