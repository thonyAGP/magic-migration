namespace Caisse.Domain.Entities;

/// <summary>
/// Global cash register parameters (caisse_parametres).
/// Maps to Magic table 677.
/// </summary>
public class CaisseParametres
{
    public string Cle { get; private set; } = string.Empty;
    public string MopCmp { get; private set; } = string.Empty;
    public string ClassOd { get; private set; } = string.Empty;
    public int CompteEcartGain { get; private set; }
    public int CompteEcartPerte { get; private set; }
    public bool SupprimeComptesFinCentralise { get; private set; }
    public bool SupprimeMopCentralise { get; private set; }
    public int ArticleCompteDerniereMinute { get; private set; }
    public int CompteApproCaisse { get; private set; }
    public int CompteRemiseCaisse { get; private set; }
    public int CompteFdrReceptionniste { get; private set; }
    public int CompteBilanMini1 { get; private set; }
    public int CompteBilanMaxi1 { get; private set; }
    public int SessionsCaisseAConserver { get; private set; }
    public int ComptagesCoffreAConserver { get; private set; }
    public int NumTerminalCaisseMini { get; private set; }
    public int NumTerminalCaisseMaxi { get; private set; }
    public int CompteVersretraitNonCash { get; private set; }
    public int CompteVersretraitCash { get; private set; }
    public string SeparateurDecimalExcel { get; private set; } = string.Empty;
    public bool InitialisationAutomatique { get; private set; }
    public int PositionImsDansMagicini { get; private set; }
    public string GestionCaisseAvec2Coffres { get; private set; } = string.Empty;
    public int PositionXtrackDansMagicini { get; private set; }
    public string Service1SansSessionIms { get; private set; } = string.Empty;
    public string Service2SansSessionIms { get; private set; } = string.Empty;
    public string Service3SansSessionIms { get; private set; } = string.Empty;
    public string Service4SansSessionIms { get; private set; } = string.Empty;
    public string Service5SansSessionIms { get; private set; } = string.Empty;
    public int CompteBoutique { get; private set; }
    public string ClotureAutomatique { get; private set; } = string.Empty;
    public int ActiviteBoutique { get; private set; }
    public bool CodeABarresIms { get; private set; }
    public string Buffer { get; private set; } = string.Empty;

    private CaisseParametres() { }
}
