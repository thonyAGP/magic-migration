namespace Caisse.Domain.Entities;

/// <summary>
/// Table cafil069_dat - Types de garantie
/// Source: Magic Table ID 91
/// </summary>
public class Garantie
{
    public string Societe { get; private set; } = string.Empty;
    public int CodeNum { get; private set; }
    public string CodeGarantie { get; private set; } = string.Empty;
    public string CodeClasse { get; private set; } = string.Empty;
    public string Libelle { get; private set; } = string.Empty;
    public double Montant { get; private set; }
    public string CodeModif { get; private set; } = string.Empty;

    private Garantie() { }
}
