namespace Caisse.Domain.Entities;

/// <summary>
/// Compte zoom (Prg_256)
/// Table: cafil050_dat (comptes____________compt)
/// </summary>
public class CompteZoom
{
    public string Societe { get; set; } = string.Empty;
    public string Devise { get; set; } = string.Empty;
    public string TypeOperation { get; set; } = string.Empty;
    public string ModePaiement { get; set; } = string.Empty;
    public string Titre { get; set; } = string.Empty;
}
