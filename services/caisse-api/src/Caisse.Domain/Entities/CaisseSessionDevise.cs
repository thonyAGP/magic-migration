namespace Caisse.Domain.Entities;

/// <summary>
/// Currency detail for a cash session (caisse_session_devise).
/// Maps to Magic table 250.
/// Types: I=Initial, C=Comptage, K=?, L=?
/// Quand: O=Ouverture, F=Fermeture
/// </summary>
public class CaisseSessionDevise
{
    public string Utilisateur { get; private set; } = string.Empty;
    public double ChronoSession { get; private set; }
    public int ChronoDetail { get; private set; }
    public string Type { get; private set; } = string.Empty;  // 1 char: I, C, K, L
    public string Quand { get; private set; } = string.Empty; // 1 char: O, F
    public string CodeDevise { get; private set; } = string.Empty; // 3 chars: EUR
    public string ModePaiement { get; private set; } = string.Empty; // 4 chars: CASH
    public double Quantite { get; private set; }
    public string Date { get; private set; } = string.Empty;
    public string Heure { get; private set; } = string.Empty;

    // Navigation
    public CaisseSession? Session { get; private set; }

    private CaisseSessionDevise() { }

    public static CaisseSessionDevise Create(
        string utilisateur,
        double chronoSession,
        int chronoDetail,
        string type,
        string quand,
        string codeDevise,
        string modePaiement,
        double quantite,
        string date,
        string heure)
    {
        return new CaisseSessionDevise
        {
            Utilisateur = utilisateur,
            ChronoSession = chronoSession,
            ChronoDetail = chronoDetail,
            Type = type,
            Quand = quand,
            CodeDevise = codeDevise,
            ModePaiement = modePaiement,
            Quantite = quantite,
            Date = date,
            Heure = heure
        };
    }

    public void UpdateQuantite(double quantite) => Quantite = quantite;
}
