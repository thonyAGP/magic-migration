namespace Caisse.Domain.Entities;

/// <summary>
/// Devise acceptée pour les dépôts
/// Table: cafil078_dat (depot_devise_____ddv)
/// </summary>
public class DepotDevise
{
    public string Societe { get; set; } = string.Empty;
    public string MoyenPaiement { get; set; } = string.Empty;
    public string Libelle { get; set; } = string.Empty;
    public string CodeModif { get; set; } = string.Empty;
}
