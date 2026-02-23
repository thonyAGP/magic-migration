namespace Caisse.Domain.Entities;

/// <summary>
/// Moyen de règlement par devise et type d'opération
/// Table: cafil028_dat (moyens_reglement_mor)
/// </summary>
public class MoyenReglement
{
    public string Societe { get; set; } = string.Empty;
    public string Devise { get; set; } = string.Empty;
    public string TypeOperation { get; set; } = string.Empty;
    public string Mop { get; set; } = string.Empty;
    public string Accepte { get; set; } = string.Empty;
    public double TauxDeChange { get; set; }
}
