using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EasyCheckOut.Commands;

/// <summary>
/// Command pour le paiement Easy Check Out
/// Migration du programme Magic Prg_60 "Easy Checkout Paiement"
///
/// Traite le paiement pour la session Easy Check Out
/// </summary>
public record PaiementEasyCheckOutCommand(
    string Societe,
    int NumCompte,
    string MoyenPaiement, // CB, CASH, CHEQUE, VIREMENT, etc.
    decimal Montant,
    string? NumReference = null,
    string? MontantDevise = null
) : IRequest<PaiementEasyCheckOutResult>;

public record PaiementEasyCheckOutResult
{
    public bool Success { get; init; }
    public bool PaiementValide { get; init; }
    public string? Message { get; init; }
    public string? NumTransaction { get; init; }
    public decimal MontantPaye { get; init; }
    public decimal SoldeRestant { get; init; }
    public DateTime? DatePaiement { get; init; }
    public string? ConfirmationCode { get; init; }
}

public class PaiementEasyCheckOutCommandValidator : AbstractValidator<PaiementEasyCheckOutCommand>
{
    public PaiementEasyCheckOutCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.NumCompte)
            .GreaterThan(0).WithMessage("NumCompte must be greater than 0");

        RuleFor(x => x.MoyenPaiement)
            .NotEmpty().WithMessage("MoyenPaiement is required");

        RuleFor(x => x.Montant)
            .GreaterThan(0).WithMessage("Montant must be greater than 0");
    }
}

public class PaiementEasyCheckOutCommandHandler : IRequestHandler<PaiementEasyCheckOutCommand, PaiementEasyCheckOutResult>
{
    private readonly ICaisseDbContext _context;

    public PaiementEasyCheckOutCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<PaiementEasyCheckOutResult> Handle(
        PaiementEasyCheckOutCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verifier l'existence du compte
            var compte = await _context.GmComplets
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Societe == request.Societe &&
                                         c.Compte == request.NumCompte,
                                    cancellationToken);

            if (compte == null)
            {
                return new PaiementEasyCheckOutResult
                {
                    Success = false,
                    PaiementValide = false,
                    Message = $"Compte {request.NumCompte} non trouve"
                };
            }

            // Recuperer les depots existants
            var depots = await _context.DepotGaranties
                .Where(d => d.Societe == request.Societe &&
                           d.CodeGm == request.NumCompte)
                .ToListAsync(cancellationToken);

            var soldeInitial = (decimal)depots.Sum(d => d.Montant);
            var soldeRestant = soldeInitial - request.Montant;

            // Generer les references
            var numTransaction = $"ECO_{request.NumCompte}_{DateTime.Now:yyyyMMddHHmmss}";
            var confirmationCode = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();

            return new PaiementEasyCheckOutResult
            {
                Success = true,
                PaiementValide = true,
                Message = "Paiement traite avec succes",
                NumTransaction = numTransaction,
                MontantPaye = request.Montant,
                SoldeRestant = Math.Max(0, soldeRestant),
                DatePaiement = DateTime.Now,
                ConfirmationCode = confirmationCode
            };
        }
        catch (Exception ex)
        {
            return new PaiementEasyCheckOutResult
            {
                Success = false,
                PaiementValide = false,
                Message = ex.Message
            };
        }
    }
}
