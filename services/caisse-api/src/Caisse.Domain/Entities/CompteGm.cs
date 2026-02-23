namespace Caisse.Domain.Entities;

/// <summary>
/// Compte GM (Gestion Membres) - Table cafil025_dat
/// Utilisé par: Prg_192 (Solde), Prg_111-112 (Garantie), Prg_69-76 (Extrait)
/// </summary>
public class CompteGm
{
    public string Societe { get; private set; } = string.Empty;
    public int CodeAdherent { get; private set; }
    public int Filiation { get; private set; }
    public string Qualite { get; private set; } = string.Empty;
    public string NomPrenom { get; private set; } = string.Empty;
    public string Etat { get; private set; } = string.Empty;
    public string Garanti { get; private set; } = string.Empty;
    public double SoldeDuCompte { get; private set; }
    public DateOnly? DateLimitSolde { get; private set; }
    public DateOnly? DateComptSold { get; private set; }
    public DateOnly? DateLastOperat { get; private set; }
    public TimeOnly? HeureLastOperat { get; private set; }
    public string Operateur { get; private set; } = string.Empty;
    public double? DateTimeLastCheckout { get; private set; }
    public string TypeVoyage { get; private set; } = string.Empty;
    public string CodeLieu { get; private set; } = string.Empty;
    public DateOnly? DateDebutSejour { get; private set; }
    public DateOnly? DateFinSejour { get; private set; }
    public string NumChambre { get; private set; } = string.Empty;
    public string DeviseCompte { get; private set; } = string.Empty;
    public int NbDecimales { get; private set; }

    private CompteGm() { }

    // Business logic
    public bool IsActive => Etat != "F" && Etat != "C";
    public bool HasGarantie => Garanti == "O";
    public bool CanSettle => SoldeDuCompte >= 0 || HasGarantie;
}
