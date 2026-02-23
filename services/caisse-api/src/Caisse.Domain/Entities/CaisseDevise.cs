namespace Caisse.Domain.Entities;

/// <summary>
/// Currency configuration for session (caisse_devise).
/// Maps to Magic table 232.
/// </summary>
public class CaisseDevise
{
    public string Utilisateur { get; private set; } = string.Empty;
    public string CodeDevise { get; private set; } = string.Empty;
    public string ModePaiement { get; private set; } = string.Empty;
    public string Quand { get; private set; } = string.Empty;
    public string Type { get; private set; } = string.Empty;
    public double Quantite { get; private set; }

    private CaisseDevise() { }

    public static CaisseDevise Create(
        string utilisateur,
        string codeDevise,
        string modePaiement,
        string quand,
        string type,
        double quantite)
    {
        return new CaisseDevise
        {
            Utilisateur = utilisateur,
            CodeDevise = codeDevise,
            ModePaiement = modePaiement,
            Quand = quand,
            Type = type,
            Quantite = quantite
        };
    }

    public void UpdateQuantite(double quantite) => Quantite = quantite;
}
