namespace Caisse.Domain.Entities;

/// <summary>
/// Table pi_dat - Poste téléphonique/Interface
/// Source: Magic Table ID 80
/// </summary>
public class LigneTelephone
{
    public string Societe { get; private set; } = string.Empty;
    public int CodeGm { get; private set; }
    public int Filiation { get; private set; }
    public string NumeroPoste { get; private set; } = string.Empty;
    public string NumeroLigne { get; private set; } = string.Empty;
    public string CodeAutocom { get; private set; } = string.Empty;
    public string Etat { get; private set; } = string.Empty; // O=Ouvert, F=Fermé, B=Bloqué
    public DateOnly? DateOuverture { get; private set; }
    public TimeOnly? HeureOuverture { get; private set; }
    public DateOnly? DateFermeture { get; private set; }
    public TimeOnly? HeureFermeture { get; private set; }
    public string OperateurOuverture { get; private set; } = string.Empty;
    public string OperateurFermeture { get; private set; } = string.Empty;
    public string NumChambre { get; private set; } = string.Empty;

    private LigneTelephone() { }

    public bool IsOpen => Etat == "O";
    public bool IsClosed => Etat == "F";
    public bool IsBlocked => Etat == "B";

    public void Ouvrir(string operateur)
    {
        Etat = "O";
        DateOuverture = DateOnly.FromDateTime(DateTime.Now);
        HeureOuverture = TimeOnly.FromDateTime(DateTime.Now);
        OperateurOuverture = operateur;
    }

    public void Fermer(string operateur)
    {
        Etat = "F";
        DateFermeture = DateOnly.FromDateTime(DateTime.Now);
        HeureFermeture = TimeOnly.FromDateTime(DateTime.Now);
        OperateurFermeture = operateur;
    }
}
