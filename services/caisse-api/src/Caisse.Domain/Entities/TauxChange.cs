namespace Caisse.Domain.Entities;

/// <summary>
/// Table taux_change_dat - Taux de change
/// Source: Magic Table ID 50
/// </summary>
public class TauxChange
{
    public string Societe { get; private set; } = string.Empty;
    public string TypeDevise { get; private set; } = string.Empty;
    public string CodeDevise { get; private set; } = string.Empty;
    public string ModePaiement { get; private set; } = string.Empty;
    public double TauxAchat { get; private set; }
    public double TauxVente { get; private set; }
    public DateOnly DateValidite { get; private set; }
    public DateOnly? DateFin { get; private set; }
    public string Operateur { get; private set; } = string.Empty;
    public DateTime DateModification { get; private set; }

    private TauxChange() { }

    /// <summary>
    /// Calcule l'équivalent en devise locale
    /// </summary>
    public double CalculerEquivalent(double montant, bool isAchat, int decimales)
    {
        var taux = isAchat ? TauxAchat : TauxVente;
        var result = montant * taux;
        return Math.Round(result, decimales);
    }

    /// <summary>
    /// Calcule l'inverse (conversion inverse)
    /// </summary>
    public double CalculerInverse(double montant, int decimales)
    {
        if (TauxVente == 0) return 0;
        var result = montant / TauxVente;
        return Math.Round(result, decimales);
    }
}
