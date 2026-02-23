namespace Caisse.Domain.Entities;

/// <summary>
/// Table cafil009_dat - Donnees completes GM (Great Member)
/// Source: Magic Table ID 31
/// </summary>
public class GmComplet
{
    public string Societe { get; private set; } = string.Empty;
    public int Compte { get; private set; }
    public int FiliationCompte { get; private set; }
    public string Titre { get; private set; } = string.Empty;
    public string NomComplet { get; private set; } = string.Empty;
    public string PrenomComplet { get; private set; } = string.Empty;
    public string Bebe { get; private set; } = string.Empty;
    public string TypeDeClient { get; private set; } = string.Empty;
    public int NumeroAdherent { get; private set; }
    public string LettreControle { get; private set; } = string.Empty;
    public int FiliationClub { get; private set; }
    public DateOnly? DateNaissance { get; private set; }
    public string VilleNaissance { get; private set; } = string.Empty;
    public string PaysNaissance { get; private set; } = string.Empty;
    public string CodeInscription { get; private set; } = string.Empty;
    public string CodeVente { get; private set; } = string.Empty;
    public string CodeNationalite { get; private set; } = string.Empty;
    public string Profession { get; private set; } = string.Empty;
    public string PieceId { get; private set; } = string.Empty;
    public string NumeroPiece { get; private set; } = string.Empty;
    public DateOnly? DateDelivrance { get; private set; }
    public DateOnly? DateValidite { get; private set; }
    public string VilleDelivrance { get; private set; } = string.Empty;

    private GmComplet() { }
}
