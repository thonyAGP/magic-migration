namespace Caisse.Domain.Entities;

/// <summary>
/// Table ez_card (ezcard) - Cartes EzCard / Club Med Pass
/// Source: Magic Table ID 312 (REF component)
/// </summary>
public class EzCard
{
    public string Societe { get; set; } = string.Empty;
    public int CodeGm { get; set; }
    public int Filiation { get; set; }
    public string CardCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double Plafond { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? DateCreation { get; set; }
    public string? DateExpiration { get; set; }
    public string? DateDesactivation { get; set; }
    public DateOnly? DateOperation { get; set; }
    public TimeOnly? TimeOperation { get; set; }
    public string Utilisateur { get; set; } = string.Empty;

    public EzCard() { }

    /// <summary>
    /// Indique si la carte est valide (pas en opposition ni desactivee)
    /// </summary>
    public bool IsValid => Status != "O" && Status != "D";

    /// <summary>
    /// Desactive la carte
    /// </summary>
    public void Desactiver()
    {
        Status = "D";
        DateDesactivation = DateTime.Now.ToString("yyyyMMdd");
    }

    /// <summary>
    /// Met en opposition
    /// </summary>
    public void MettreEnOpposition()
    {
        Status = "O";
    }
}
