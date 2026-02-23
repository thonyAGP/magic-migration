namespace Caisse.Domain.Entities;

/// <summary>
/// Table cafil047_dat - Parametres d'initialisation village
/// Source: Magic Table ID 69
/// </summary>
public class Initialisation
{
    public string CodeVillage3 { get; private set; } = string.Empty;
    public string NomVillage { get; private set; } = string.Empty;
    public string Telephone { get; private set; } = string.Empty;
    public string Fax { get; private set; } = string.Empty;
    public string DeviseLocale { get; private set; } = string.Empty;
    public int NbreDecimales { get; private set; }

    private Initialisation() { }
}
