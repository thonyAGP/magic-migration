namespace Caisse.Domain.Entities;

/// <summary>
/// En-tête Transaction Bar - Table bartransacent
/// Utilisé par: Prg_233-236 (Ventes), Prg_243 (Déversement)
/// </summary>
public class TransactionBarEntete
{
    public string BarId { get; private set; } = string.Empty;
    public string PosId { get; private set; } = string.Empty;
    public string BarmanId { get; private set; } = string.Empty;
    public string TicketNumber { get; private set; } = string.Empty;
    public string DateTicket { get; private set; } = string.Empty;
    public string TimeTicket { get; private set; } = string.Empty;
    public double TotalTicket { get; private set; }
    public double TotalPaye { get; private set; }
    public double TotalCreditConso { get; private set; }
    public string EzCardId { get; private set; } = string.Empty;
    public string Societe { get; private set; } = string.Empty;
    public int Adherent { get; private set; }
    public int Filiation { get; private set; }
    public string TaiCodeForfait { get; private set; } = string.Empty;

    private TransactionBarEntete() { }

    // Business logic - mapped properties for compatibility
    public int CodeGm => Adherent;
    public string NumeroTicket => TicketNumber;
    public double MontantTotal => TotalTicket;
}
