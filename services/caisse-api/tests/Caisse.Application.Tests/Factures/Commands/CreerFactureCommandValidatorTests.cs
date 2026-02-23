using Caisse.Application.Factures.Commands;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Factures.Commands;

public class CreerFactureCommandValidatorTests
{
    private readonly CreerFactureCommandValidator _validator = new();

    private static CreerFactureCommand CreateValidCommand() =>
        new("CS", 12345678, 0, "VTE", true, DateOnly.FromDateTime(DateTime.Today), 100.00m, 20.00m, "Test facture");

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var command = CreateValidCommand();
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var command = CreateValidCommand() with { Societe = societe! };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var command = CreateValidCommand() with { Societe = "ABC" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_CodeGm_Invalid(int codeGm)
    {
        var command = CreateValidCommand() with { CodeGm = codeGm };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeGm);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Negative()
    {
        var command = CreateValidCommand() with { Filiation = -1 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_TypeFacture_Empty(string? typeFacture)
    {
        var command = CreateValidCommand() with { TypeFacture = typeFacture! };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.TypeFacture);
    }

    [Fact]
    public void Should_Fail_When_TypeFacture_TooLong()
    {
        var command = CreateValidCommand() with { TypeFacture = "VERYLONGTYPEFACTURE" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.TypeFacture);
    }

    [Fact]
    public void Should_Fail_When_DateFacture_Default()
    {
        var command = CreateValidCommand() with { DateFacture = default };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.DateFacture);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-100)]
    public void Should_Fail_When_MontantHT_Invalid(decimal montantHT)
    {
        var command = CreateValidCommand() with { MontantHT = montantHT };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.MontantHT);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public void Should_Fail_When_TauxTVA_OutOfRange(decimal tauxTVA)
    {
        var command = CreateValidCommand() with { TauxTVA = tauxTVA };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.TauxTVA);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(20)]
    [InlineData(100)]
    public void Should_Pass_When_TauxTVA_Valid(decimal tauxTVA)
    {
        var command = CreateValidCommand() with { TauxTVA = tauxTVA };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.TauxTVA);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Libelle_Empty(string? libelle)
    {
        var command = CreateValidCommand() with { Libelle = libelle! };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Libelle);
    }

    [Fact]
    public void Should_Fail_When_Libelle_TooLong()
    {
        var command = CreateValidCommand() with { Libelle = new string('A', 101) };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Libelle);
    }
}
