namespace Caisse.Domain.Entities;

/// <summary>
/// Type d'objet pour dépôt de garantie
/// Table: cafil077_dat (depot_objet______obj)
/// </summary>
public class DepotObjet
{
    public string Societe { get; set; } = string.Empty;
    public int CodeObjet { get; set; }
    public string Libelle { get; set; } = string.Empty;
    public string CodeDroitModif { get; set; } = string.Empty;
}
