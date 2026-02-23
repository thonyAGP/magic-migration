namespace Caisse.Domain.Entities;

/// <summary>
/// Table de référence générique (services, articles, etc.)
/// Table: cafil045_dat (tables___________tab)
/// </summary>
public class TableReference
{
    public string NomTable { get; set; } = string.Empty;
    public string NomInterneCode { get; set; } = string.Empty;
    public string CodeAlpha5 { get; set; } = string.Empty;
    public int CodeNumeric6 { get; set; }
    public string Classe { get; set; } = string.Empty;
    public double ValeurNumerique { get; set; }
    public string Libelle20 { get; set; } = string.Empty;
    public string Libelle10Upper { get; set; } = string.Empty;
    public string CodeDroitModif { get; set; } = string.Empty;
    public bool RemiseAutorisee { get; set; }
    public bool PrixAutorise { get; set; }
    public bool ImprimerTva { get; set; }
    public bool ActiverBarLimit { get; set; }
    public bool ActiverCreditConso { get; set; }
    public string TypeService { get; set; } = string.Empty;
    public double PourcentCommission { get; set; }
    public bool SaleLabelModifiable { get; set; }
    public bool VoirTel { get; set; }
}
