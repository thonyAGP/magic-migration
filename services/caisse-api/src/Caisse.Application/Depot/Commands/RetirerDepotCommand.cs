using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Depot.Commands;

/// <summary>
/// Command pour retirer un depot garantie
/// Migration du programme Magic Prg_40 "Comptes de depot"
/// </summary>
public record RetirerDepotCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    string TypeDepot,
    string Devise,
    string Operateur
) : IRequest<RetirerDepotResult>;

public record RetirerDepotResult(
    bool Success,
    string? Error = null,
    double? MontantRetire = null);

public class RetirerDepotCommandValidator : AbstractValidator<RetirerDepotCommand>
{
    public RetirerDepotCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be greater than 0");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be >= 0");

        RuleFor(x => x.TypeDepot)
            .NotEmpty().WithMessage("TypeDepot is required")
            .Must(t => t == "O" || t == "D" || t == "S" || t == "G")
            .WithMessage("TypeDepot must be O (Objet), D (Devise), S (Scelle) or G (Garantie)");

        RuleFor(x => x.Devise)
            .NotEmpty().WithMessage("Devise is required")
            .MaximumLength(3).WithMessage("Devise must be at most 3 characters");

        RuleFor(x => x.Operateur)
            .NotEmpty().WithMessage("Operateur is required")
            .MaximumLength(20).WithMessage("Operateur must be at most 20 characters");
    }
}

public class RetirerDepotCommandHandler : IRequestHandler<RetirerDepotCommand, RetirerDepotResult>
{
    private readonly ICaisseDbContext _context;

    public RetirerDepotCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<RetirerDepotResult> Handle(
        RetirerDepotCommand request,
        CancellationToken cancellationToken)
    {
        // Trouver le depot actif correspondant
        var depot = await _context.DepotGaranties
            .FirstOrDefaultAsync(d =>
                d.Societe == request.Societe &&
                d.CodeGm == request.CodeGm &&
                d.Filiation == request.Filiation &&
                d.TypeDepot == request.TypeDepot &&
                d.Devise == request.Devise &&
                d.Etat != "R", // Pas deja retire
                cancellationToken);

        if (depot == null)
        {
            return new RetirerDepotResult(false, Error: "Depot non trouve ou deja retire");
        }

        if (depot.Etat == "B")
        {
            return new RetirerDepotResult(false, Error: "Depot bloque, impossible de retirer");
        }

        var montant = depot.Montant;

        // Marquer le depot comme retire
        depot.Retirer(request.Operateur);

        await _context.SaveChangesAsync(cancellationToken);

        return new RetirerDepotResult(true, MontantRetire: montant);
    }
}
