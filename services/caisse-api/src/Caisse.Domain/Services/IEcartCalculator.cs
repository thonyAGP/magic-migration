using Caisse.Domain.Entities;
using Caisse.Domain.ValueObjects;

namespace Caisse.Domain.Services;

/// <summary>
/// Domain service for calculating session discrepancies (écarts).
/// </summary>
public interface IEcartCalculator
{
    /// <summary>
    /// Calculate the écart for a session based on details and devises.
    /// </summary>
    EcartSession Calculer(
        IEnumerable<CaisseSessionDetail> details,
        IEnumerable<CaisseSessionDevise> devises);

    /// <summary>
    /// Calculate expected amount at closing based on opening + movements.
    /// Attendu = Ouverture + Ventes - Remises + Dépôts - Retraits
    /// </summary>
    EcartMontants CalculerAttendu(IEnumerable<CaisseSessionDetail> details);

    /// <summary>
    /// Calculate counted amount at closing.
    /// </summary>
    EcartMontants CalculerCompte(IEnumerable<CaisseSessionDetail> details);

    /// <summary>
    /// Calculate écarts by currency/payment mode.
    /// </summary>
    IReadOnlyList<EcartDevise> CalculerEcartsDevises(IEnumerable<CaisseSessionDevise> devises);

    /// <summary>
    /// Validate if the écart is within acceptable threshold.
    /// </summary>
    bool EstDansSeuilAcceptable(EcartSession ecart, double seuilTolerance = 0.01);
}
