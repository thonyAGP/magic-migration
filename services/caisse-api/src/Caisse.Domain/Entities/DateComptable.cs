namespace Caisse.Domain.Entities;

/// <summary>
/// Table cafil048_dat - Date comptable par societe
/// Source: Magic Table ID 70
/// </summary>
public class DateComptable
{
    public string Societe { get; private set; } = string.Empty;
    public DateOnly Date { get; private set; }

    private DateComptable() { }
}
