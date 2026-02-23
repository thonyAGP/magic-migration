namespace Caisse.Domain.Entities;

/// <summary>
/// Table appels_telephone_dat - Historique des appels téléphoniques
/// Pour Prg_211: Detail appels autocom
/// </summary>
public class AppelTelephone
{
    public int Id { get; set; }
    public string Societe { get; set; } = string.Empty;
    public int CodeAutocom { get; set; }
    public DateTime DateAppel { get; set; }
    public string? HeureAppel { get; set; }
    public string? NumeroAppele { get; set; }
    public string? TypeAppel { get; set; } // L=Local, N=National, I=International
    public int DureeSecondes { get; set; }
    public decimal Montant { get; set; }
    public string? Etat { get; set; } // F=Facturé, N=Non facturé
    public string? NomVillage { get; set; }
    public string? NomClient { get; set; }
    public string? PrenomClient { get; set; }
    public int? CodeGm { get; set; }
    public int? Filiation { get; set; }
}
