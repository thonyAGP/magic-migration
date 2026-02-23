namespace Caisse.Domain.Entities;

/// <summary>
/// Detail line for a cash session (caisse_session_detail).
/// Maps to Magic table 249.
/// </summary>
public class CaisseSessionDetail
{
    public string Utilisateur { get; private set; } = string.Empty;
    public double ChronoSession { get; private set; }
    public int ChronoDetail { get; private set; }  // int in actual DB
    public string Type { get; private set; } = string.Empty;  // 1 char
    public string Quand { get; private set; } = string.Empty; // 1 char
    public string Date { get; private set; } = string.Empty;
    public string Heure { get; private set; } = string.Empty;
    public double Montant { get; private set; }
    public double MontantMonnaie { get; private set; }
    public double MontantProduits { get; private set; }
    public double MontantCartes { get; private set; }
    public double MontantCheques { get; private set; }
    public double MontantOd { get; private set; }
    public string CommentaireEcart { get; private set; } = string.Empty;
    public int NbreDevises { get; private set; }
    public string CommentaireEcartDevise { get; private set; } = string.Empty;
    public double MontantLibre1 { get; private set; }
    public double MontantLibre2 { get; private set; }
    public double MontantLibre3 { get; private set; }
    public string TypeCaisseRecIms { get; private set; } = string.Empty;
    public string TerminalCaisse { get; private set; } = string.Empty;
    public string OuvertureAuto { get; private set; } = string.Empty;
    public string BufferExtensions { get; private set; } = string.Empty;
    public string HostnameCaisse { get; private set; } = string.Empty;

    // Navigation
    public CaisseSession? Session { get; private set; }

    private CaisseSessionDetail() { }

    public static CaisseSessionDetail Create(
        string utilisateur,
        double chronoSession,
        int chronoDetail,
        string type,
        string quand,
        string date,
        string heure)
    {
        return new CaisseSessionDetail
        {
            Utilisateur = utilisateur,
            ChronoSession = chronoSession,
            ChronoDetail = chronoDetail,
            Type = type,
            Quand = quand,
            Date = date,
            Heure = heure
        };
    }

    public void SetMontants(
        double? montant = null,
        double? monnaie = null,
        double? produits = null,
        double? cartes = null,
        double? cheques = null,
        double? od = null)
    {
        Montant = montant ?? 0;
        MontantMonnaie = monnaie ?? 0;
        MontantProduits = produits ?? 0;
        MontantCartes = cartes ?? 0;
        MontantCheques = cheques ?? 0;
        MontantOd = od ?? 0;
    }

    public void SetEcart(string commentaire) => CommentaireEcart = commentaire;
}
