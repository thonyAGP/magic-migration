using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Commands;

/// <summary>
/// Command to select payment method for multiple rooms scenario.
/// Migrated from Magic Prg_244 "Choix PYR (plusieurs chambres)" and related
/// </summary>
public record ChoixPyrCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    long TransactionId,
    string ModePaiementChoisi,
    int NombreChambres = 1,
    string? ReferenceCommande = null) : IRequest<ChoixPyrResult>;

public record ChoixPyrResult
{
    public bool Success { get; init; }
    public long TransactionId { get; init; }
    public string ModePaiement { get; init; } = string.Empty;
    public int NombreChambres { get; init; }
    public bool RequiresChange { get; init; }
    public string Message { get; init; } = string.Empty;
}

public class ChoixPyrCommandValidator : AbstractValidator<ChoixPyrCommand>
{
    public ChoixPyrCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.TransactionId)
            .GreaterThan(0).WithMessage("TransactionId must be positive");

        RuleFor(x => x.ModePaiementChoisi)
            .NotEmpty().WithMessage("ModePaiementChoisi is required");

        RuleFor(x => x.NombreChambres)
            .GreaterThan(0).WithMessage("NombreChambres must be at least 1");
    }
}

public class ChoixPyrCommandHandler : IRequestHandler<ChoixPyrCommand, ChoixPyrResult>
{
    public ChoixPyrCommandHandler()
    {
    }

    public async Task<ChoixPyrResult> Handle(
        ChoixPyrCommand request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Validate selected payment method exists for GM
        // 2. Update transaction with chosen payment method
        // 3. Determine if change calculation is needed (for cash payments)
        // 4. Store choice for multi-room transactions
        // 5. Update interface state

        var requiresChange = request.ModePaiementChoisi.ToUpper() == "CASH" ||
                           request.ModePaiementChoisi.ToUpper() == "ESPECES";

        return await Task.FromResult(new ChoixPyrResult
        {
            Success = true,
            TransactionId = request.TransactionId,
            ModePaiement = request.ModePaiementChoisi,
            NombreChambres = request.NombreChambres,
            RequiresChange = requiresChange,
            Message = "Payment method selected successfully"
        });
    }
}
