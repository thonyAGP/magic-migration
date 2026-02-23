namespace Caisse.Domain.Entities;

/// <summary>
/// Article sold in a cash session (caisse_session_article).
/// Maps to Magic table 247.
/// </summary>
public class CaisseSessionArticle
{
    public string Utilisateur { get; private set; } = string.Empty;
    public double ChronoSession { get; private set; }
    public int ChronoDetail { get; private set; }
    public int CodeArticle { get; private set; }
    public string LibelleArticle { get; private set; } = string.Empty;
    public double PrixUnitaire { get; private set; }
    public int Quantite { get; private set; }
    public double Montant { get; private set; }
    public string Date { get; private set; } = string.Empty;
    public string Heure { get; private set; } = string.Empty;

    // Navigation
    public CaisseSession? Session { get; private set; }

    private CaisseSessionArticle() { }

    public static CaisseSessionArticle Create(
        string utilisateur,
        double chronoSession,
        int chronoDetail,
        int codeArticle,
        string libelleArticle,
        double prixUnitaire,
        int quantite,
        string date,
        string heure)
    {
        return new CaisseSessionArticle
        {
            Utilisateur = utilisateur,
            ChronoSession = chronoSession,
            ChronoDetail = chronoDetail,
            CodeArticle = codeArticle,
            LibelleArticle = libelleArticle,
            PrixUnitaire = prixUnitaire,
            Quantite = quantite,
            Montant = prixUnitaire * quantite,
            Date = date,
            Heure = heure
        };
    }
}
