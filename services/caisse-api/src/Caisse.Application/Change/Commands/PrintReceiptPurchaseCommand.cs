using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Change.Commands;

/// <summary>
/// Command pour imprimer un reçu d'achat de devises
/// Migration du programme Magic Prg_23 "Print Receipt Purchase"
/// </summary>
public record PrintReceiptPurchaseCommand(
    string Societe,
    string Utilisateur,
    double ChronoSession,
    string DeviseAchetee,
    string DevisePayee,
    double MontantDevise,
    double MontantEquivalent,
    double TauxApplique,
    string ModePaiement,
    string? NumeroChequeBancaire = null,
    string? ReferenceTransaction = null
) : IRequest<PrintReceiptPurchaseResult>;

public record PrintReceiptPurchaseResult(
    bool Success,
    string ReceiptNumber = "",
    string Message = "",
    string? PrintContent = null);

public class PrintReceiptPurchaseCommandValidator : AbstractValidator<PrintReceiptPurchaseCommand>
{
    public PrintReceiptPurchaseCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.Utilisateur)
            .NotEmpty().WithMessage("Utilisateur is required")
            .MaximumLength(10).WithMessage("Utilisateur must be at most 10 characters");

        RuleFor(x => x.ChronoSession)
            .GreaterThan(0).WithMessage("ChronoSession must be positive");

        RuleFor(x => x.DeviseAchetee)
            .NotEmpty().WithMessage("DeviseAchetee is required")
            .MaximumLength(3).WithMessage("DeviseAchetee must be at most 3 characters");

        RuleFor(x => x.DevisePayee)
            .NotEmpty().WithMessage("DevisePayee is required")
            .MaximumLength(3).WithMessage("DevisePayee must be at most 3 characters");

        RuleFor(x => x.MontantDevise)
            .GreaterThan(0).WithMessage("MontantDevise must be positive");

        RuleFor(x => x.MontantEquivalent)
            .GreaterThan(0).WithMessage("MontantEquivalent must be positive");

        RuleFor(x => x.TauxApplique)
            .GreaterThan(0).WithMessage("TauxApplique must be positive");

        RuleFor(x => x.ModePaiement)
            .NotEmpty().WithMessage("ModePaiement is required")
            .MaximumLength(4).WithMessage("ModePaiement must be at most 4 characters");
    }
}

public class PrintReceiptPurchaseCommandHandler : IRequestHandler<PrintReceiptPurchaseCommand, PrintReceiptPurchaseResult>
{
    private readonly ICaisseDbContext _context;

    public PrintReceiptPurchaseCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<PrintReceiptPurchaseResult> Handle(
        PrintReceiptPurchaseCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verify session exists and is open
            var session = await _context.Sessions
                .FirstOrDefaultAsync(s => s.Utilisateur == request.Utilisateur
                            && s.Chrono == request.ChronoSession,
                    cancellationToken);

            if (session == null)
                return new PrintReceiptPurchaseResult(false, Message: "Session non trouvée");

            if (!session.EstOuverte)
                return new PrintReceiptPurchaseResult(false, Message: "Session est fermée");

            // Get currency info for both currencies
            var deviseAchetee = await _context.DevisesZoom
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.CodeDevise == request.DeviseAchetee
                    && d.Societe == request.Societe, cancellationToken);

            var devisePayee = await _context.DevisesZoom
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.CodeDevise == request.DevisePayee
                    && d.Societe == request.Societe, cancellationToken);

            if (deviseAchetee == null || devisePayee == null)
                return new PrintReceiptPurchaseResult(false, Message: "Devise non trouvée");

            // Generate receipt number (based on session and timestamp)
            var receiptNumber = $"ACH-{session.Chrono:D8}-{DateTime.Now:HHmmss}";

            // Build receipt content
            var receiptContent = GenerateReceiptContent(
                session,
                request,
                deviseAchetee,
                devisePayee,
                receiptNumber);

            return new PrintReceiptPurchaseResult(
                true,
                receiptNumber,
                "Reçu d'achat généré avec succès",
                receiptContent);
        }
        catch (Exception ex)
        {
            return new PrintReceiptPurchaseResult(false, Message: $"Erreur: {ex.Message}");
        }
    }

    private string GenerateReceiptContent(
        dynamic session,
        PrintReceiptPurchaseCommand request,
        dynamic deviseAchetee,
        dynamic devisePayee,
        string receiptNumber)
    {
        var now = DateTime.Now;
        var content = new System.Text.StringBuilder();

        content.AppendLine("========================================");
        content.AppendLine("         REÇU D'ACHAT DE DEVISES");
        content.AppendLine("========================================");
        content.AppendLine($"Numéro: {receiptNumber}");
        content.AppendLine($"Date: {now:dd/MM/yyyy}");
        content.AppendLine($"Heure: {now:HH:mm:ss}");
        content.AppendLine($"Société: {request.Societe}");
        content.AppendLine($"Caissier: {request.Utilisateur}");
        content.AppendLine("----------------------------------------");
        content.AppendLine("TRANSACTION");
        content.AppendLine("----------------------------------------");
        content.AppendLine($"Devise achetée: {request.DeviseAchetee} - {deviseAchetee.Libelle}");
        content.AppendLine($"Devise payée: {request.DevisePayee} - {devisePayee.Libelle}");
        content.AppendLine($"Montant acheté: {request.MontantDevise} {request.DeviseAchetee}");
        content.AppendLine($"Montant payé: {request.MontantEquivalent} {request.DevisePayee}");
        content.AppendLine($"Taux appliqué: {request.TauxApplique}");
        content.AppendLine($"Mode paiement: {request.ModePaiement}");

        if (!string.IsNullOrEmpty(request.NumeroChequeBancaire))
        {
            content.AppendLine($"Chèque/Référence: {request.NumeroChequeBancaire}");
        }

        content.AppendLine("========================================");
        content.AppendLine("Signature caissier: ___________________");
        content.AppendLine("========================================");

        return content.ToString();
    }
}
