namespace Caisse.Domain.Entities;

/// <summary>
/// Table email - Emails des clients
/// Source: Magic Table ID 285
/// </summary>
public class Email
{
    public string Societe { get; private set; } = string.Empty;
    public int Compte { get; private set; }
    public int Filiation { get; private set; }
    public string EmailAddress { get; private set; } = string.Empty;
    public string Cnil { get; private set; } = string.Empty;
    public bool ReportFiliation { get; private set; }
    public string EtatCode { get; private set; } = string.Empty;
    public DateOnly? DateImport { get; private set; }
    public TimeOnly? HeureImport { get; private set; }
    public DateOnly? DateDerniereSaisiePms { get; private set; }
    public TimeOnly? HeureDerniereSaisiePms { get; private set; }
    public string UserDerniereSaisiePms { get; private set; } = string.Empty;
    public DateOnly? DateExport { get; private set; }
    public TimeOnly? TimeExport { get; private set; }
    public string TelephonePortable { get; private set; } = string.Empty;

    private Email() { }
}
