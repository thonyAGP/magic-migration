using Caisse.Application.Change.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Change.Queries;

public class CalculerEquivalentQueryValidatorTests
{
    private readonly CalculerEquivalentQueryValidator _validator = new();

    private static CalculerEquivalentQuery CreateValidQuery() =>
        new("CS", "A", "USD", 2, "EUR", "CB", 100.0, "A");

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = CreateValidQuery();
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = CreateValidQuery() with { Societe = societe! };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = CreateValidQuery() with { Societe = "ABC" };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData("")]
    [InlineData("C")]
    [InlineData("X")]
    public void Should_Fail_When_TypeDevise_Invalid(string typeDevise)
    {
        var query = CreateValidQuery() with { TypeDevise = typeDevise };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.TypeDevise);
    }

    [Theory]
    [InlineData("A")]
    [InlineData("B")]
    public void Should_Pass_When_TypeDevise_Valid(string typeDevise)
    {
        var query = CreateValidQuery() with { TypeDevise = typeDevise };
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.TypeDevise);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_DeviseSource_Empty(string? deviseSource)
    {
        var query = CreateValidQuery() with { DeviseSource = deviseSource! };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.DeviseSource);
    }

    [Fact]
    public void Should_Fail_When_DeviseSource_TooLong()
    {
        var query = CreateValidQuery() with { DeviseSource = "EURO" };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.DeviseSource);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(7)]
    public void Should_Fail_When_NbDecimales_OutOfRange(int nbDecimales)
    {
        var query = CreateValidQuery() with { NbDecimales = nbDecimales };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.NbDecimales);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(2)]
    [InlineData(6)]
    public void Should_Pass_When_NbDecimales_Valid(int nbDecimales)
    {
        var query = CreateValidQuery() with { NbDecimales = nbDecimales };
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.NbDecimales);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_DeviseLocale_Empty(string? deviseLocale)
    {
        var query = CreateValidQuery() with { DeviseLocale = deviseLocale! };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.DeviseLocale);
    }

    [Fact]
    public void Should_Fail_When_ModePaiement_TooLong()
    {
        var query = CreateValidQuery() with { ModePaiement = "CARTE" };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.ModePaiement);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Should_Fail_When_Montant_NotPositive(double montant)
    {
        var query = CreateValidQuery() with { Montant = montant };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Montant);
    }

    [Theory]
    [InlineData(0.01)]
    [InlineData(100)]
    [InlineData(10000.50)]
    public void Should_Pass_When_Montant_Positive(double montant)
    {
        var query = CreateValidQuery() with { Montant = montant };
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Montant);
    }

    [Theory]
    [InlineData("")]
    [InlineData("X")]
    [InlineData("AB")]
    public void Should_Fail_When_TypeOperation_Invalid(string typeOperation)
    {
        var query = CreateValidQuery() with { TypeOperation = typeOperation };
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.TypeOperation);
    }

    [Theory]
    [InlineData("A")]
    [InlineData("V")]
    public void Should_Pass_When_TypeOperation_Valid(string typeOperation)
    {
        var query = CreateValidQuery() with { TypeOperation = typeOperation };
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.TypeOperation);
    }
}
