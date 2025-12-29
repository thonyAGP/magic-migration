namespace Caisse.Domain.Entities;

/// <summary>
/// Pays et nationalités avec informations téléphoniques
/// Table: cafil097_dat (tables_pays_tel_)
/// </summary>
public class Pays
{
    public string CodeLangue { get; set; } = string.Empty;
    public string Libelle { get; set; } = string.Empty;
    public string CodePays { get; set; } = string.Empty;
    public string LangueParlee { get; set; } = string.Empty;
    public string Monnaie { get; set; } = string.Empty;
    public int CodeTelephone { get; set; }
    public string? FeteNationale { get; set; }
    public int FuseauHoraire { get; set; }
    public int DecalageHoraire { get; set; }
    public string Inscription { get; set; } = string.Empty;
    public string AccesStandard { get; set; } = string.Empty;
    public string AccesPlanning { get; set; } = string.Empty;
    public string AccesCaisse { get; set; } = string.Empty;
    public string CodePaysNormalise { get; set; } = string.Empty;
}
