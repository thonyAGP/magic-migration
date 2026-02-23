using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Change.Commands;

/// <summary>
/// Command pour imprimer un reçu de vente de devises
/// Migration du programme Magic Prg_24 "Print Receipt Sale"
/// </summary>
public record PrintReceiptSaleCommand(
    string Societe,
    string Utilisateur,
    double ChronoSession,
    string DeviseVendue,
    string DeviseRecue,
    double MontantDevise,
    double MontantEquivalent,
    double TauxApplique,
    string ModePaiement,
    string? NumeroChequeBancaire = null,
    string? ReferenceTransaction = null
) : IRequest<PrintReceiptSaleResult>;

public record PrintReceiptSaleResult(
    bool Success,
    string ReceiptNumber = "",
    string Message = "",
    string? PrintContent = null);

public class PrintReceiptSaleCommandValidator : AbstractValidator<PrintReceiptSaleCommand>
{
    public PrintReceiptSaleCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.Utilisateur)
            .NotEmpty().WithMessage("Utilisateur is required")
            .MaximumLength(10).WithMessage("Utilisateur must be at most 10 characters");

        RuleFor(x => x.ChronoSession)
            .GreaterThan(0).WithMessage("ChronoSession must be positive");

        RuleFor(x => x.DeviseVendue)
            .NotEmpty().WithMessage("DeviseVendue is required")
            .MaximumLength(3).WithMessage("DeviseVendue must be at most 3 characters");

        RuleFor(x => x.DeviseRecue)
            .NotEmpty().WithMessage("DeviseRecue is required")
            .MaximumLength(3).WithMessage("DeviseRecue must be at most 3 characters");

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

public class PrintReceiptSaleCommandHandler : IRequestHandler<PrintReceiptSaleCommand, PrintReceiptSaleResult>
{
    private readonly ICaisseDbContext _context;

    public PrintReceiptSaleCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<PrintReceiptSaleResult> Handle(
        PrintReceiptSaleCommand request,
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
                return new PrintReceiptSaleResult(false, Message: "Session non trouvée");

            if (!session.EstOuverte)
                return new PrintReceiptSaleResult(false, Message: "Session est fermée");

            // Get currency info for both currencies
            var deviseVendue = await _context.DevisesZoom
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.CodeDevise == request.DeviseVendue
                    && d.Societe == request.Societe, cancellationToken);

            var deviseRecue = await _context.DevisesZoom
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.CodeDevise == request.DeviseRecue
                    && d.Societe == request.Societe, cancellationToken);

            if (deviseVendue == null || deviseRecue == null)
                return new PrintReceiptSaleResult(false, Message: "Devise non trouvée");

            // Generate receipt number (based on session and timestamp)
            var receiptNumber = $"VEN-{session.Chrono:D8}-{DateTime.Now:HHmmss}";

            // Build receipt content
            var receiptContent = GenerateReceiptContent(
                session,
                request,
                deviseVendue,
                deviseRecue,
                receiptNumber);

            return new PrintReceiptSaleResult(
                true,
                receiptNumber,
                "Reçu de vente généré avec succès",
                receiptContent);
        }
        catch (Exception ex)
        {
            return new PrintReceiptSaleResult(false, Message: $"Erreur: {ex.Message}");
        }
    }

    private string GenerateReceiptContent(
        dynamic session,
        PrintReceiptSaleCommand request,
        dynamic deviseVendue,
        dynamic deviseRecue,
        string receiptNumber)
    {
        var now = DateTime.Now;
        var content = new System.Text.StringBuilder();

        content.AppendLine("========================================");
        content.AppendLine("         REÇU DE VENTE DE DEVISES");
        content.AppendLine("========================================");
        content.AppendLine($"Numéro: {receiptNumber}");
        content.AppendLine($"Date: {now:dd/MM/yyyy}");
        content.AppendLine($"Heure: {now:HH:mm:ss}");
        content.AppendLine($"Société: {request.Societe}");
        content.AppendLine($"Caissier: {request.Utilisateur}");
        content.AppendLine("----------------------------------------");
        content.AppendLine("TRANSACTION");
        content.AppendLine("----------------------------------------");
        content.AppendLine($"Devise vendue: {request.DeviseVendue} - {deviseVendue.Libelle}");
        content.AppendLine($"Devise reçue: {request.DeviseRecue} - {deviseRecue.Libelle}");
        content.AppendLine($"Montant vendu: {request.MontantDevise} {request.DeviseVendue}");
        content.AppendLine($"Montant reçu: {request.MontantEquivalent} {request.DeviseRecue}");
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
