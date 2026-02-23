namespace Caisse.Domain.Entities;

/// <summary>
/// Mouvement comptable - Table mouvement_dat
/// Utilisé par: Prg_192 (Solde), Prg_233-236 (Ventes)
/// </summary>
public class Mouvement
{
    public long Id { get; private set; }
    public string Societe { get; private set; } = string.Empty;
    public int CodeGm { get; private set; }
    public int Filiation { get; private set; }
    public DateOnly DateComptable { get; private set; }
    public TimeOnly HeureOperation { get; private set; }
    public string TypeMouvement { get; private set; } = string.Empty;
    public string CodeDevise { get; private set; } = string.Empty;
    public double Montant { get; private set; }
    public double MontantDeviseLocale { get; private set; }
    public double TauxChange { get; private set; }
    public string CodeMop { get; private set; } = string.Empty;
    public string Operateur { get; private set; } = string.Empty;
    public string Reference { get; private set; } = string.Empty;
    public string Commentaire { get; private set; } = string.Empty;
    public int NumeroTicket { get; private set; }
    public string CodeService { get; private set; } = string.Empty;
    public string EtatMouvement { get; private set; } = string.Empty;
    public DateOnly? DateAnnulation { get; private set; }

    private Mouvement() { }

    // Types: C=Crédit, D=Débit, A=Annulation
    public bool IsCredit => TypeMouvement == "C";
    public bool IsDebit => TypeMouvement == "D";
    public bool IsAnnule => EtatMouvement == "A";

    public double MontantSigne => IsDebit ? -Montant : Montant;
}
