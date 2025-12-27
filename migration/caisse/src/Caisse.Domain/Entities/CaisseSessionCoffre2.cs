namespace Caisse.Domain.Entities;

/// <summary>
/// Safe reserve tracking (caisse_session_coffre2).
/// Maps to Magic table 248.
/// </summary>
public class CaisseSessionCoffre2
{
    public string DateOuvertureCaisse90 { get; private set; } = string.Empty;
    public string HeureOuvertureCaisse90 { get; private set; } = string.Empty;
    public double Chrono { get; private set; }
    public string Utilisateur { get; private set; } = string.Empty;

    private CaisseSessionCoffre2() { }

    public static CaisseSessionCoffre2 Create(
        string utilisateur,
        double chrono,
        string dateOuverture,
        string heureOuverture)
    {
        return new CaisseSessionCoffre2
        {
            Utilisateur = utilisateur,
            Chrono = chrono,
            DateOuvertureCaisse90 = dateOuverture,
            HeureOuvertureCaisse90 = heureOuverture
        };
    }
}
