namespace Caisse.Domain.Entities;

/// <summary>
/// Soldes par type de credit client (Gift Pass, Seminaires, etc.)
/// Table SQL: ccpartyp
/// Migre depuis: Magic Prg_237 "Solde Gift Pass"
/// </summary>
public class CcTotalParType
{
    public string Societe { get; private set; } = string.Empty;
    public int Code8Chiffres { get; private set; }
    public int Filiation { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public double SoldeCreditConso { get; private set; }

    private CcTotalParType() { }

    public static CcTotalParType Create(
        string societe,
        int code8Chiffres,
        int filiation,
        string type,
        double soldeCreditConso)
    {
        return new CcTotalParType
        {
            Societe = societe,
            Code8Chiffres = code8Chiffres,
            Filiation = filiation,
            Type = type,
            SoldeCreditConso = soldeCreditConso
        };
    }
}
