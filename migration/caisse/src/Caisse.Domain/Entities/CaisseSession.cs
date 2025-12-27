namespace Caisse.Domain.Entities;

/// <summary>
/// Represents a cash register session (caisse_session).
/// Maps to Magic table 246.
/// </summary>
public class CaisseSession
{
    public string Utilisateur { get; private set; } = string.Empty;
    public double Chrono { get; private set; }
    public string DateDebutSession { get; private set; } = string.Empty; // YYYYMMDD
    public string HeureDebutSession { get; private set; } = string.Empty; // HHMMSS
    public string DateFinSession { get; private set; } = string.Empty;
    public string HeureFinSession { get; private set; } = string.Empty;
    public string DateComptable { get; private set; } = string.Empty;
    public bool Pointage { get; private set; }

    // Navigation properties
    public ICollection<CaisseSessionDetail> Details { get; private set; } = new List<CaisseSessionDetail>();
    public ICollection<CaisseSessionArticle> Articles { get; private set; } = new List<CaisseSessionArticle>();
    public ICollection<CaisseSessionDevise> Devises { get; private set; } = new List<CaisseSessionDevise>();

    private CaisseSession() { } // EF Core

    public static CaisseSession Create(
        string utilisateur,
        double chrono,
        string dateDebut,
        string heureDebut,
        string dateComptable)
    {
        return new CaisseSession
        {
            Utilisateur = utilisateur,
            Chrono = chrono,
            DateDebutSession = dateDebut,
            HeureDebutSession = heureDebut,
            DateFinSession = "00000000",
            HeureFinSession = "000000",
            DateComptable = dateComptable,
            Pointage = false
        };
    }

    public void Fermer(string dateFin, string heureFin)
    {
        DateFinSession = dateFin;
        HeureFinSession = heureFin;
    }

    public void Pointer() => Pointage = true;

    public bool EstOuverte => DateFinSession == "00000000";
}
