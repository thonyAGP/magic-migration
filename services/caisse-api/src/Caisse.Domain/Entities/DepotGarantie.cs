namespace Caisse.Domain.Entities;

/// <summary>
/// Table cafil017_dat - Depot de garantie
/// Source: Magic Table ID 39
/// </summary>
public class DepotGarantie
{
    public string Societe { get; private set; } = string.Empty;
    public int CodeGm { get; private set; }
    public int Filiation { get; private set; }
    public DateOnly? DateDepot { get; private set; }
    public TimeOnly? HeureDepot { get; private set; }
    public DateOnly? DateRetrait { get; private set; }
    public TimeOnly? HeureRetrait { get; private set; }
    public string TypeDepot { get; private set; } = string.Empty;
    public string Devise { get; private set; } = string.Empty;
    public double Montant { get; private set; }
    public string Etat { get; private set; } = string.Empty;
    public string Operateur { get; private set; } = string.Empty;
    public string NumDossierPms { get; private set; } = string.Empty;
    public string NumDossierAxis { get; private set; } = string.Empty;
    public string NumDossierNa { get; private set; } = string.Empty;

    private DepotGarantie() { }

    /// <summary>
    /// Marque le depot comme retire
    /// </summary>
    public void Retirer(string operateur)
    {
        DateRetrait = DateOnly.FromDateTime(DateTime.Now);
        HeureRetrait = TimeOnly.FromDateTime(DateTime.Now);
        Etat = "R"; // Retire
    }
}
