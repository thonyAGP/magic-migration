using Caisse.Domain.Entities;
using Caisse.Domain.Services;
using Caisse.Domain.ValueObjects;

namespace Caisse.Application.Ecarts.Services;

/// <summary>
/// Implementation of écart calculation logic.
///
/// Business rules:
/// - Attendu (Expected) = Opening amount + All movements during session
/// - Compté (Counted) = What cashier counted at closing
/// - Écart (Discrepancy) = Compté - Attendu
///
/// Movement types affecting the expected amount:
/// - I (Initial): Opening balance
/// - V (Vente): Sales add to expected
/// - A (Avoir): Refunds subtract from expected
/// - D (Dépôt): Deposits add to expected
/// - K (Coffre versement): Safe deposits subtract from expected (money moved to safe)
/// - L (Coffre levée): Safe withdrawals add to expected (money taken from safe)
/// - F (Facture): Invoices add to expected
/// - C (Comptage): Counting (only used for verification)
/// </summary>
public class EcartCalculator : IEcartCalculator
{
    public EcartSession Calculer(
        IEnumerable<CaisseSessionDetail> details,
        IEnumerable<CaisseSessionDevise> devises)
    {
        var detailsList = details.ToList();
        var devisesList = devises.ToList();

        var attendu = CalculerAttendu(detailsList);
        var compte = CalculerCompte(detailsList);
        var ecartsDevises = CalculerEcartsDevises(devisesList);

        // Get comment from closing detail if exists
        var commentaire = detailsList
            .FirstOrDefault(d => d.Quand == MomentOperation.Fermeture && !string.IsNullOrEmpty(d.CommentaireEcart))
            ?.CommentaireEcart;

        return EcartSession.Create(attendu, compte, ecartsDevises, commentaire);
    }

    public EcartMontants CalculerAttendu(IEnumerable<CaisseSessionDetail> details)
    {
        var detailsList = details.ToList();

        // Opening balance (Type I or any at O)
        var ouverture = detailsList
            .Where(d => d.Quand == MomentOperation.Ouverture)
            .Aggregate(EcartMontants.Zero, (acc, d) => acc + ToMontants(d));

        // Movements during session (Type V, F add; Type A, K subtract; Type L, D add)
        var mouvements = EcartMontants.Zero;

        foreach (var detail in detailsList.Where(d => d.Quand == MomentOperation.Pendant))
        {
            var montant = ToMontants(detail);
            mouvements = detail.Type switch
            {
                TypesMouvements.Vente => mouvements + montant,      // Sales add
                TypesMouvements.Facture => mouvements + montant,    // Invoices add
                TypesMouvements.Depot => mouvements + montant,      // Deposits add
                TypesMouvements.CoffretLeve => mouvements + montant, // Safe withdrawal adds (money comes in)
                TypesMouvements.Avoir => mouvements - montant,      // Refunds subtract
                TypesMouvements.CoffretVers => mouvements - montant, // Safe deposit subtracts (money goes out)
                _ => mouvements
            };
        }

        return ouverture + mouvements;
    }

    public EcartMontants CalculerCompte(IEnumerable<CaisseSessionDetail> details)
    {
        // Counted amount at closing (Type C at F, or any at F)
        return details
            .Where(d => d.Quand == MomentOperation.Fermeture)
            .Aggregate(EcartMontants.Zero, (acc, d) => acc + ToMontants(d));
    }

    public IReadOnlyList<EcartDevise> CalculerEcartsDevises(IEnumerable<CaisseSessionDevise> devises)
    {
        var devisesList = devises.ToList();

        return devisesList
            .GroupBy(d => new { d.CodeDevise, d.ModePaiement })
            .Select(g =>
            {
                var ouverture = g.Where(d => d.Quand == MomentOperation.Ouverture).Sum(d => d.Quantite);
                var mouvements = g.Where(d => d.Quand == MomentOperation.Pendant)
                    .Sum(d => GetMouvementSign(d.Type) * d.Quantite);
                var fermeture = g.Where(d => d.Quand == MomentOperation.Fermeture).Sum(d => d.Quantite);

                var attendu = ouverture + mouvements;

                return new EcartDevise
                {
                    CodeDevise = g.Key.CodeDevise,
                    ModePaiement = g.Key.ModePaiement,
                    Attendu = attendu,
                    Compte = fermeture
                };
            })
            .Where(e => e.Attendu != 0 || e.Compte != 0) // Only include non-zero
            .ToList();
    }

    public bool EstDansSeuilAcceptable(EcartSession ecart, double seuilTolerance = 0.01)
    {
        return Math.Abs(ecart.Ecart.Total) <= seuilTolerance;
    }

    private static EcartMontants ToMontants(CaisseSessionDetail detail)
    {
        return new EcartMontants
        {
            Total = detail.Montant,
            Monnaie = detail.MontantMonnaie,
            Produits = detail.MontantProduits,
            Cartes = detail.MontantCartes,
            Cheques = detail.MontantCheques,
            Od = detail.MontantOd,
            Libre1 = detail.MontantLibre1,
            Libre2 = detail.MontantLibre2,
            Libre3 = detail.MontantLibre3
        };
    }

    private static double GetMouvementSign(string type)
    {
        return type switch
        {
            TypesMouvements.Vente => 1,
            TypesMouvements.Facture => 1,
            TypesMouvements.Depot => 1,
            TypesMouvements.CoffretLeve => 1,
            TypesMouvements.Avoir => -1,
            TypesMouvements.CoffretVers => -1,
            _ => 0
        };
    }
}
