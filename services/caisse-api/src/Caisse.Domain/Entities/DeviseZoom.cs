namespace Caisse.Domain.Entities;

/// <summary>
/// Devise avec taux de change
/// Table: cafil068_dat (devises__________dev)
/// </summary>
public class DeviseZoom
{
    public string Societe { get; set; } = string.Empty;
    public string CodeEnCours { get; set; } = string.Empty;
    public string CodeDevise { get; set; } = string.Empty;
    public int Numero { get; set; }
    public double Taux { get; set; }
    public string Libelle { get; set; } = string.Empty;
}
