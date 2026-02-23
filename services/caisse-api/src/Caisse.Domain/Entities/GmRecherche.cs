namespace Caisse.Domain.Entities;

/// <summary>
/// Table cafil008_dat - Recherche GM (Great Member)
/// Source: Magic Table ID 30
/// </summary>
public class GmRecherche
{
    public string Societe { get; private set; } = string.Empty;
    public int CodeGm { get; private set; }
    public int FiliationVillag { get; private set; }
    public string Acces { get; private set; } = string.Empty;
    public string TypeDeClient { get; private set; } = string.Empty;
    public int NumClub { get; private set; }
    public string LettreControle { get; private set; } = string.Empty;
    public int FiliationClub { get; private set; }
    public string Nom { get; private set; } = string.Empty;
    public string Prenom { get; private set; } = string.Empty;
    public string Sexe { get; private set; } = string.Empty;
    public string Age { get; private set; } = string.Empty;
    public string LangueParlee { get; private set; } = string.Empty;
    public string Qualite { get; private set; } = string.Empty;

    private GmRecherche() { }
}
