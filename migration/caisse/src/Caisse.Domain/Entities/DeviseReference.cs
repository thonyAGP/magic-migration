namespace Caisse.Domain.Entities;

/// <summary>
/// Currency reference table (devisein_par).
/// Maps to Magic table 693.
/// </summary>
public class DeviseReference
{
    public string CodeDevise { get; private set; } = string.Empty;
    public string Libelle { get; private set; } = string.Empty;
    public short NombreDeDecimales { get; private set; }
    public double Taux { get; private set; }

    private DeviseReference() { }

    public static DeviseReference Create(
        string codeDevise,
        string libelle,
        short decimales = 2,
        double taux = 1.0)
    {
        return new DeviseReference
        {
            CodeDevise = codeDevise,
            Libelle = libelle,
            NombreDeDecimales = decimales,
            Taux = taux
        };
    }
}
