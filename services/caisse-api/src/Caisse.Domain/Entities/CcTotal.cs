namespace Caisse.Domain.Entities;

/// <summary>
/// Total Compte Courant - Table cctotal
/// Utilisé par: Prg_192 (Solde), Prg_233-236 (Ventes)
/// </summary>
public class CcTotal
{
    public string Societe { get; private set; } = string.Empty;
    public int CodeGm { get; private set; }
    public int Filiation { get; private set; }
    public DateOnly DateComptable { get; private set; }
    public string TypeMouvement { get; private set; } = string.Empty;
    public string CodeService { get; private set; } = string.Empty;
    public string CodeDevise { get; private set; } = string.Empty;
    public double Montant { get; private set; }
    public double MontantDevise { get; private set; }
    public int NumeroTicket { get; private set; }
    public string Operateur { get; private set; } = string.Empty;
    public DateOnly? DateOperation { get; private set; }
    public TimeOnly? HeureOperation { get; private set; }
    public string Commentaire { get; private set; } = string.Empty;
    public string CodeArticle { get; private set; } = string.Empty;
    public int Quantite { get; private set; }
    public string Reference { get; private set; } = string.Empty;

    private CcTotal() { }

    // Type mouvement: V=Vente, A=Annulation, D=Depot, R=Retrait
    public bool IsVente => TypeMouvement == "V";
    public bool IsAnnulation => TypeMouvement == "A";
    public bool IsDepot => TypeMouvement == "D";
    public bool IsRetrait => TypeMouvement == "R";
}
