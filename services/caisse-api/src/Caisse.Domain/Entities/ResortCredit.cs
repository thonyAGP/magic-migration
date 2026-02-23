namespace Caisse.Domain.Entities;

/// <summary>
/// Resort Credit balance per client/service.
/// Table SQL: resort_credit
/// Migrated from: Magic Prg_250 "Solde Resort Credit"
/// </summary>
public class ResortCredit
{
    public string Societe { get; private set; } = string.Empty;
    public int NumCompte { get; private set; }
    public double Filiation { get; private set; }
    public string Service { get; private set; } = string.Empty;
    public double MontantAttribue { get; private set; }
    public double MontantUtilise { get; private set; }

    /// <summary>
    /// Calculated balance: IF(attribue > utilise, attribue - utilise, 0)
    /// </summary>
    public double Solde => MontantAttribue > MontantUtilise
        ? MontantAttribue - MontantUtilise
        : 0;

    private ResortCredit() { }
}
