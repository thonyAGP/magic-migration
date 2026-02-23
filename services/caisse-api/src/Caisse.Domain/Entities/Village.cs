namespace Caisse.Domain.Entities;

/// <summary>
/// Village - Table pms_village
/// Utilisé par: Prg_192 (Solde), Prg_107-108 (Garantie)
/// </summary>
public class Village
{
    public string Societe { get; private set; } = string.Empty;
    public string CodeVillage { get; private set; } = string.Empty;
    public string NomVillage { get; private set; } = string.Empty;
    public string Adresse1 { get; private set; } = string.Empty;
    public string Adresse2 { get; private set; } = string.Empty;
    public string CodePostal { get; private set; } = string.Empty;
    public string Ville { get; private set; } = string.Empty;
    public string CodePays { get; private set; } = string.Empty;
    public string Telephone { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string DeviseLocale { get; private set; } = string.Empty;
    public int NbDecimales { get; private set; }
    public bool VillageAuTel { get; private set; }
    public bool TelAuCam { get; private set; }
    public bool VillageBiBop { get; private set; }
    public string TypeEtablissement { get; private set; } = string.Empty;

    private Village() { }

    // UNI = monnaie unique, BI = double devise
    public bool IsUniDevise => TypeEtablissement == "UNI";
    public bool IsBiDevise => TypeEtablissement == "BI";
}
