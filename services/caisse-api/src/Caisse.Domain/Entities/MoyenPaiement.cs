namespace Caisse.Domain.Entities;

/// <summary>
/// Moyen de Paiement - Table cafil015_dat (moyen_paiement___mop)
/// Utilisé par: Prg_192 (Solde), Prg_111-112 (Garantie), Prg_233-236 (Ventes)
/// </summary>
public class MoyenPaiement
{
    public string Societe { get; private set; } = string.Empty;
    public string CodeMop { get; private set; } = string.Empty;
    public string Libelle { get; private set; } = string.Empty;
    public string Classe { get; private set; } = string.Empty;
    public string Type { get; private set; } = string.Empty;
    public bool Actif { get; private set; }
    public bool AccepteDevise { get; private set; }
    public bool RequiertReference { get; private set; }
    public string CodeComptable { get; private set; } = string.Empty;
    public int OrdreAffichage { get; private set; }

    private MoyenPaiement() { }

    // Classes: ESP=Espèces, CHQ=Chèque, CB=Carte Bancaire, VIR=Virement
    public bool IsEspeces => Classe == "ESP";
    public bool IsCheque => Classe == "CHQ";
    public bool IsCarteBancaire => Classe == "CB";
}
