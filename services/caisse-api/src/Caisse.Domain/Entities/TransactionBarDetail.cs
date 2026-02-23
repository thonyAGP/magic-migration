namespace Caisse.Domain.Entities;

/// <summary>
/// Détail Transaction Bar - Table bartransacdet
/// Utilisé par: Prg_233-236 (Ventes), Prg_243 (Déversement)
/// </summary>
public class TransactionBarDetail
{
    public long Id { get; private set; }
    public long TransactionId { get; private set; }
    public string Societe { get; private set; } = string.Empty;
    public string CodeArticle { get; private set; } = string.Empty;
    public string LibelleArticle { get; private set; } = string.Empty;
    public int Quantite { get; private set; }
    public double PrixUnitaire { get; private set; }
    public double MontantLigne { get; private set; }
    public double TauxTva { get; private set; }
    public double MontantTva { get; private set; }
    public string CodeTva { get; private set; } = string.Empty;
    public string CodeService { get; private set; } = string.Empty;
    public int NumeroLigne { get; private set; }
    public string TypeLigne { get; private set; } = string.Empty;
    public string Reference { get; private set; } = string.Empty;

    private TransactionBarDetail() { }

    // Type ligne: A=Article, S=Service, R=Remise, T=Taxe
    public bool IsArticle => TypeLigne == "A";
    public bool IsService => TypeLigne == "S";
    public bool IsRemise => TypeLigne == "R";
}
