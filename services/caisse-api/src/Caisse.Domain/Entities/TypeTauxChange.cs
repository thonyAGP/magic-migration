namespace Caisse.Domain.Entities;

/// <summary>
/// Types de taux de change
/// Table: cafil102_dat (type_taux_change)
/// </summary>
public class TypeTauxChange
{
    public string Societe { get; set; } = string.Empty;
    public int Code { get; set; }
    public string Utilise { get; set; } = string.Empty;
    public string Libelle { get; set; } = string.Empty;
    public string Modifiable { get; set; } = string.Empty;
}
