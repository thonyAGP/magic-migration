using Caisse.Application.Ecarts.Services;
using Caisse.Domain.Entities;
using Caisse.Domain.ValueObjects;

namespace Caisse.Application.Tests.Ecarts;

public class EcartCalculatorTests
{
    private readonly EcartCalculator _calculator = new();

    #region Helper Methods

    private static CaisseSessionDetail CreateDetail(
        string type, string quand,
        double? montant = null, double? monnaie = null,
        double? produits = null, double? cartes = null,
        double? cheques = null, double? od = null)
    {
        var detail = CaisseSessionDetail.Create("TEST", 1, 1, type, quand, "20251227", "120000");
        detail.SetMontants(montant, monnaie, produits, cartes, cheques, od);
        return detail;
    }

    private static CaisseSessionDevise CreateDevise(
        string type, string quand, string codeDevise, string modePaiement, double quantite)
    {
        return CaisseSessionDevise.Create(
            "TEST", 1, 1, type, quand, codeDevise, modePaiement, quantite, "20251227", "120000");
    }

    #endregion

    #region Basic Calculations

    [Fact]
    public void Should_Return_Zero_Ecart_When_No_Data()
    {
        var result = _calculator.Calculer([], []);

        Assert.True(result.EstEquilibre);
        Assert.Equal(0, result.Ecart.Total);
    }

    [Fact]
    public void Should_Calculate_Zero_Ecart_When_Balanced()
    {
        // Opening: 100
        // Closing count: 100
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 100),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 100)
        };

        var result = _calculator.Calculer(details, []);

        Assert.True(result.EstEquilibre);
        Assert.Equal(0, result.Ecart.Total);
        Assert.Equal(100, result.Attendu.Total);
        Assert.Equal(100, result.Compte.Total);
    }

    [Fact]
    public void Should_Calculate_Positive_Ecart_When_Surplus()
    {
        // Opening: 100
        // Closing count: 120 (20 more than expected = surplus)
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 100),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 120)
        };

        var result = _calculator.Calculer(details, []);

        Assert.False(result.EstEquilibre);
        Assert.Equal(20, result.Ecart.Total);
        Assert.Equal(100, result.Attendu.Total);
        Assert.Equal(120, result.Compte.Total);
    }

    [Fact]
    public void Should_Calculate_Negative_Ecart_When_Shortage()
    {
        // Opening: 100
        // Closing count: 80 (20 less than expected = shortage)
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 100),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 80)
        };

        var result = _calculator.Calculer(details, []);

        Assert.False(result.EstEquilibre);
        Assert.Equal(-20, result.Ecart.Total);
        Assert.Equal(100, result.Attendu.Total);
        Assert.Equal(80, result.Compte.Total);
    }

    #endregion

    #region Movement Type Tests

    [Fact]
    public void Should_Add_Sales_To_Expected()
    {
        // Opening: 100, Sales during day: 50
        // Expected: 150
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 100),
            CreateDetail(TypesMouvements.Vente, MomentOperation.Pendant, montant: 50),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 150)
        };

        var result = _calculator.Calculer(details, []);

        Assert.True(result.EstEquilibre);
        Assert.Equal(150, result.Attendu.Total);
    }

    [Fact]
    public void Should_Add_Invoices_To_Expected()
    {
        // Opening: 100, Invoice: 75
        // Expected: 175
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 100),
            CreateDetail(TypesMouvements.Facture, MomentOperation.Pendant, montant: 75),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 175)
        };

        var result = _calculator.Calculer(details, []);

        Assert.True(result.EstEquilibre);
        Assert.Equal(175, result.Attendu.Total);
    }

    [Fact]
    public void Should_Subtract_Refunds_From_Expected()
    {
        // Opening: 100, Refund: 20
        // Expected: 80
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 100),
            CreateDetail(TypesMouvements.Avoir, MomentOperation.Pendant, montant: 20),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 80)
        };

        var result = _calculator.Calculer(details, []);

        Assert.True(result.EstEquilibre);
        Assert.Equal(80, result.Attendu.Total);
    }

    [Fact]
    public void Should_Subtract_Safe_Deposits_From_Expected()
    {
        // Opening: 500, Deposit to safe: 200 (money leaves cash register)
        // Expected: 300
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 500),
            CreateDetail(TypesMouvements.CoffretVers, MomentOperation.Pendant, montant: 200),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 300)
        };

        var result = _calculator.Calculer(details, []);

        Assert.True(result.EstEquilibre);
        Assert.Equal(300, result.Attendu.Total);
    }

    [Fact]
    public void Should_Add_Safe_Withdrawals_To_Expected()
    {
        // Opening: 100, Withdrawal from safe: 50 (money enters cash register)
        // Expected: 150
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 100),
            CreateDetail(TypesMouvements.CoffretLeve, MomentOperation.Pendant, montant: 50),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 150)
        };

        var result = _calculator.Calculer(details, []);

        Assert.True(result.EstEquilibre);
        Assert.Equal(150, result.Attendu.Total);
    }

    [Fact]
    public void Should_Add_Deposits_To_Expected()
    {
        // Opening: 100, Customer deposit: 30
        // Expected: 130
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 100),
            CreateDetail(TypesMouvements.Depot, MomentOperation.Pendant, montant: 30),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 130)
        };

        var result = _calculator.Calculer(details, []);

        Assert.True(result.EstEquilibre);
        Assert.Equal(130, result.Attendu.Total);
    }

    #endregion

    #region Complex Scenarios

    [Fact]
    public void Should_Handle_Full_Day_Operations()
    {
        // Opening: 100
        // + Sales: 200
        // + Invoice: 50
        // - Refund: 25
        // - To safe: 100
        // Expected: 100 + 200 + 50 - 25 - 100 = 225
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, montant: 100),
            CreateDetail(TypesMouvements.Vente, MomentOperation.Pendant, montant: 200),
            CreateDetail(TypesMouvements.Facture, MomentOperation.Pendant, montant: 50),
            CreateDetail(TypesMouvements.Avoir, MomentOperation.Pendant, montant: 25),
            CreateDetail(TypesMouvements.CoffretVers, MomentOperation.Pendant, montant: 100),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, montant: 225)
        };

        var result = _calculator.Calculer(details, []);

        Assert.True(result.EstEquilibre);
        Assert.Equal(225, result.Attendu.Total);
        Assert.Equal(225, result.Compte.Total);
    }

    [Fact]
    public void Should_Calculate_Ecart_By_Payment_Type()
    {
        // Opening: Cash 100, Cards 50
        // Sales: Cash +30, Cards +20
        // Closing: Cash 140 (10 more), Cards 65 (5 short)
        var details = new List<CaisseSessionDetail>
        {
            CreateDetail(TypesMouvements.Initial, MomentOperation.Ouverture, monnaie: 100, cartes: 50),
            CreateDetail(TypesMouvements.Vente, MomentOperation.Pendant, monnaie: 30, cartes: 20),
            CreateDetail(TypesMouvements.Comptage, MomentOperation.Fermeture, monnaie: 140, cartes: 65)
        };

        var result = _calculator.Calculer(details, []);

        Assert.Equal(130, result.Attendu.Monnaie);  // 100 + 30
        Assert.Equal(70, result.Attendu.Cartes);    // 50 + 20
        Assert.Equal(140, result.Compte.Monnaie);
        Assert.Equal(65, result.Compte.Cartes);
        Assert.Equal(10, result.Ecart.Monnaie);     // 140 - 130
        Assert.Equal(-5, result.Ecart.Cartes);      // 65 - 70
    }

    #endregion

    #region Currency (Devise) Tests

    [Fact]
    public void Should_Calculate_Ecart_By_Currency()
    {
        var devises = new List<CaisseSessionDevise>
        {
            CreateDevise(TypesMouvements.Initial, MomentOperation.Ouverture, "EUR", "CASH", 100),
            CreateDevise(TypesMouvements.Comptage, MomentOperation.Fermeture, "EUR", "CASH", 95)
        };

        var result = _calculator.CalculerEcartsDevises(devises);

        Assert.Single(result);
        Assert.Equal("EUR", result[0].CodeDevise);
        Assert.Equal("CASH", result[0].ModePaiement);
        Assert.Equal(100, result[0].Attendu);
        Assert.Equal(95, result[0].Compte);
        Assert.Equal(-5, result[0].Ecart);
        Assert.False(result[0].EstEquilibre);
    }

    [Fact]
    public void Should_Calculate_Multiple_Currencies()
    {
        var devises = new List<CaisseSessionDevise>
        {
            CreateDevise(TypesMouvements.Initial, MomentOperation.Ouverture, "EUR", "CASH", 100),
            CreateDevise(TypesMouvements.Comptage, MomentOperation.Fermeture, "EUR", "CASH", 100),
            CreateDevise(TypesMouvements.Initial, MomentOperation.Ouverture, "USD", "CASH", 50),
            CreateDevise(TypesMouvements.Comptage, MomentOperation.Fermeture, "USD", "CASH", 55)
        };

        var result = _calculator.CalculerEcartsDevises(devises);

        Assert.Equal(2, result.Count);

        var eur = result.First(d => d.CodeDevise == "EUR");
        Assert.True(eur.EstEquilibre);

        var usd = result.First(d => d.CodeDevise == "USD");
        Assert.Equal(5, usd.Ecart);
        Assert.False(usd.EstEquilibre);
    }

    [Fact]
    public void Should_Group_By_Currency_And_PaymentMode()
    {
        var devises = new List<CaisseSessionDevise>
        {
            CreateDevise(TypesMouvements.Initial, MomentOperation.Ouverture, "EUR", "CASH", 100),
            CreateDevise(TypesMouvements.Initial, MomentOperation.Ouverture, "EUR", "CARD", 200),
            CreateDevise(TypesMouvements.Comptage, MomentOperation.Fermeture, "EUR", "CASH", 100),
            CreateDevise(TypesMouvements.Comptage, MomentOperation.Fermeture, "EUR", "CARD", 200)
        };

        var result = _calculator.CalculerEcartsDevises(devises);

        Assert.Equal(2, result.Count);
        Assert.Contains(result, d => d.CodeDevise == "EUR" && d.ModePaiement == "CASH");
        Assert.Contains(result, d => d.CodeDevise == "EUR" && d.ModePaiement == "CARD");
    }

    #endregion

    #region Threshold Tests

    [Fact]
    public void Should_Be_Within_Threshold_For_Small_Ecart()
    {
        var ecart = EcartSession.Create(
            new EcartMontants { Total = 100 },
            new EcartMontants { Total = 100.005 },
            []);

        Assert.True(_calculator.EstDansSeuilAcceptable(ecart, 0.01));
    }

    [Fact]
    public void Should_Be_Outside_Threshold_For_Large_Ecart()
    {
        var ecart = EcartSession.Create(
            new EcartMontants { Total = 100 },
            new EcartMontants { Total = 100.05 },
            []);

        Assert.False(_calculator.EstDansSeuilAcceptable(ecart, 0.01));
    }

    [Fact]
    public void Should_Use_Custom_Threshold()
    {
        var ecart = EcartSession.Create(
            new EcartMontants { Total = 100 },
            new EcartMontants { Total = 105 },
            []);

        Assert.False(_calculator.EstDansSeuilAcceptable(ecart, 1));
        Assert.True(_calculator.EstDansSeuilAcceptable(ecart, 10));
    }

    #endregion
}
