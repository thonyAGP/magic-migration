using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Change.Queries;

/// <summary>
/// Query pour calculer l'équivalent en devise locale
/// Migration du programme Magic Prg_22 "Calcul equivalent"
/// </summary>
public record CalculerEquivalentQuery(
    string Societe,
    string TypeDevise,      // 'A' = Uni, 'B' = Bi
    string DeviseSource,    // Code devise entrée (U3)
    int NbDecimales,        // Précision d'arrondi
    string DeviseLocale,    // Devise de référence
    string ModePaiement,    // Code mode paiement (U4)
    double Montant,         // Quantité à convertir
    string TypeOperation    // 'A' = Achat, 'V' = Vente
) : IRequest<CalculerEquivalentResult>;

public record CalculerEquivalentResult
{
    public bool Success { get; init; }
    public string DeviseSource { get; init; } = string.Empty;
    public string DeviseLocale { get; init; } = string.Empty;
    public double MontantSource { get; init; }
    public double MontantEquivalent { get; init; }
    public double TauxApplique { get; init; }
    public string TypeOperation { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
}

public class CalculerEquivalentQueryValidator : AbstractValidator<CalculerEquivalentQuery>
{
    public CalculerEquivalentQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.TypeDevise)
            .NotEmpty().WithMessage("TypeDevise is required")
            .Must(t => t == "A" || t == "B")
            .WithMessage("TypeDevise must be 'A' (Uni) or 'B' (Bi)");

        RuleFor(x => x.DeviseSource)
            .NotEmpty().WithMessage("DeviseSource is required")
            .MaximumLength(3).WithMessage("DeviseSource must be at most 3 characters");

        RuleFor(x => x.NbDecimales)
            .InclusiveBetween(0, 6).WithMessage("NbDecimales must be between 0 and 6");

        RuleFor(x => x.DeviseLocale)
            .NotEmpty().WithMessage("DeviseLocale is required")
            .MaximumLength(3).WithMessage("DeviseLocale must be at most 3 characters");

        RuleFor(x => x.ModePaiement)
            .MaximumLength(4).WithMessage("ModePaiement must be at most 4 characters");

        RuleFor(x => x.Montant)
            .GreaterThan(0).WithMessage("Montant must be positive");

        RuleFor(x => x.TypeOperation)
            .NotEmpty().WithMessage("TypeOperation is required")
            .Must(t => t == "A" || t == "V")
            .WithMessage("TypeOperation must be 'A' (Achat) or 'V' (Vente)");
    }
}

public class CalculerEquivalentQueryHandler : IRequestHandler<CalculerEquivalentQuery, CalculerEquivalentResult>
{
    private readonly ICaisseDbContext _context;

    public CalculerEquivalentQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<CalculerEquivalentResult> Handle(
        CalculerEquivalentQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Récupérer le taux de change applicable
        var taux = await _context.TauxChanges
            .AsNoTracking()
            .Where(t =>
                t.Societe == request.Societe &&
                t.CodeDevise == request.DeviseSource &&
                (string.IsNullOrEmpty(request.ModePaiement) || t.ModePaiement == request.ModePaiement) &&
                t.DateValidite <= DateOnly.FromDateTime(DateTime.Today) &&
                (t.DateFin == null || t.DateFin >= DateOnly.FromDateTime(DateTime.Today)))
            .OrderByDescending(t => t.DateValidite)
            .FirstOrDefaultAsync(cancellationToken);

        if (taux == null)
        {
            // Fallback: chercher un taux sans filtre mode paiement
            taux = await _context.TauxChanges
                .AsNoTracking()
                .Where(t =>
                    t.Societe == request.Societe &&
                    t.CodeDevise == request.DeviseSource &&
                    t.DateValidite <= DateOnly.FromDateTime(DateTime.Today))
                .OrderByDescending(t => t.DateValidite)
                .FirstOrDefaultAsync(cancellationToken);
        }

        if (taux == null)
        {
            return new CalculerEquivalentResult
            {
                Success = false,
                DeviseSource = request.DeviseSource,
                DeviseLocale = request.DeviseLocale,
                MontantSource = request.Montant,
                Message = $"Aucun taux de change trouvé pour {request.DeviseSource}"
            };
        }

        // 2. Calculer l'équivalent selon le type d'opération
        // Logic from Prg_22:
        // - Achat UNI (A, non-B): montant * tauxAchat
        // - Achat BI (A, B): montant * tauxVente
        // - Vente: montant / tauxVente (ou * tauxVente selon direction)
        double tauxApplique;
        double montantEquivalent;

        if (request.TypeOperation == "A") // Achat
        {
            if (request.TypeDevise != "B")
            {
                // Achat UNI: Quantité * Taux achat
                tauxApplique = taux.TauxAchat;
                montantEquivalent = request.Montant * tauxApplique;
            }
            else
            {
                // Achat BI: Quantité * Taux vente
                tauxApplique = taux.TauxVente;
                montantEquivalent = request.Montant * tauxApplique;
            }
        }
        else // Vente
        {
            // Vente: Quantité / Taux
            tauxApplique = taux.TauxVente;
            montantEquivalent = tauxApplique != 0
                ? request.Montant / tauxApplique
                : 0;
        }

        // 3. Arrondir selon le nombre de décimales
        montantEquivalent = Math.Round(montantEquivalent, request.NbDecimales);

        return new CalculerEquivalentResult
        {
            Success = true,
            DeviseSource = request.DeviseSource,
            DeviseLocale = request.DeviseLocale,
            MontantSource = request.Montant,
            MontantEquivalent = montantEquivalent,
            TauxApplique = tauxApplique,
            TypeOperation = request.TypeOperation == "A" ? "Achat" : "Vente",
            Message = "Calcul effectué avec succès"
        };
    }
}
