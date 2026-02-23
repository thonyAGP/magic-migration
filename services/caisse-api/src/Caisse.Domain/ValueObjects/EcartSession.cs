namespace Caisse.Domain.ValueObjects;

/// <summary>
/// Value object representing the variance/discrepancy calculation for a session.
/// Écart = Montant compté (Fermeture) - Montant attendu (Ouverture + Mouvements)
/// </summary>
public record EcartSession
{
    public EcartMontants Attendu { get; init; } = EcartMontants.Zero;
    public EcartMontants Compte { get; init; } = EcartMontants.Zero;
    public EcartMontants Ecart { get; init; } = EcartMontants.Zero;
    public IReadOnlyList<EcartDevise> EcartsDevises { get; init; } = [];
    public bool EstEquilibre => Math.Abs(Ecart.Total) < 0.01;
    public string? Commentaire { get; init; }

    public static EcartSession Create(
        EcartMontants attendu,
        EcartMontants compte,
        IReadOnlyList<EcartDevise> ecartsDevises,
        string? commentaire = null)
    {
        return new EcartSession
        {
            Attendu = attendu,
            Compte = compte,
            Ecart = compte - attendu,
            EcartsDevises = ecartsDevises,
            Commentaire = commentaire
        };
    }
}

/// <summary>
/// Breakdown of amounts by payment type.
/// </summary>
public record EcartMontants
{
    public double Total { get; init; }
    public double Monnaie { get; init; }
    public double Produits { get; init; }
    public double Cartes { get; init; }
    public double Cheques { get; init; }
    public double Od { get; init; }
    public double Libre1 { get; init; }
    public double Libre2 { get; init; }
    public double Libre3 { get; init; }

    public static EcartMontants Zero => new();

    public static EcartMontants operator -(EcartMontants a, EcartMontants b)
    {
        return new EcartMontants
        {
            Total = a.Total - b.Total,
            Monnaie = a.Monnaie - b.Monnaie,
            Produits = a.Produits - b.Produits,
            Cartes = a.Cartes - b.Cartes,
            Cheques = a.Cheques - b.Cheques,
            Od = a.Od - b.Od,
            Libre1 = a.Libre1 - b.Libre1,
            Libre2 = a.Libre2 - b.Libre2,
            Libre3 = a.Libre3 - b.Libre3
        };
    }

    public static EcartMontants operator +(EcartMontants a, EcartMontants b)
    {
        return new EcartMontants
        {
            Total = a.Total + b.Total,
            Monnaie = a.Monnaie + b.Monnaie,
            Produits = a.Produits + b.Produits,
            Cartes = a.Cartes + b.Cartes,
            Cheques = a.Cheques + b.Cheques,
            Od = a.Od + b.Od,
            Libre1 = a.Libre1 + b.Libre1,
            Libre2 = a.Libre2 + b.Libre2,
            Libre3 = a.Libre3 + b.Libre3
        };
    }
}

/// <summary>
/// Écart for a specific currency/payment mode.
/// </summary>
public record EcartDevise
{
    public string CodeDevise { get; init; } = string.Empty;
    public string ModePaiement { get; init; } = string.Empty;
    public double Attendu { get; init; }
    public double Compte { get; init; }
    public double Ecart => Compte - Attendu;
    public bool EstEquilibre => Math.Abs(Ecart) < 0.01;
}

/// <summary>
/// Types of operations that affect the expected amount.
/// </summary>
public static class TypesMouvements
{
    public const string Initial = "I";      // Fond de caisse initial
    public const string Comptage = "C";     // Comptage (counting)
    public const string CoffretVers = "K";  // Coffre versement
    public const string CoffretLeve = "L";  // Coffre levée
    public const string Avoir = "A";        // Avoir/Credit note
    public const string Depot = "D";        // Dépôt
    public const string Facture = "F";      // Facture
    public const string Vente = "V";        // Vente
}

/// <summary>
/// When the operation occurred.
/// </summary>
public static class MomentOperation
{
    public const string Ouverture = "O";    // At opening
    public const string Fermeture = "F";    // At closing
    public const string Pendant = "P";      // During session
}
