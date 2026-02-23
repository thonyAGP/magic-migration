using Caisse.Application.Devises.Commands;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Validators;

public class AddSessionDeviseCommandValidatorTests
{
    private readonly AddSessionDeviseCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var command = new AddSessionDeviseCommand("LISE", 55, "C", "O", "EUR", "CASH", 100);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("I")]
    [InlineData("C")]
    [InlineData("K")]
    [InlineData("L")]
    [InlineData("A")]
    [InlineData("D")]
    [InlineData("F")]
    [InlineData("V")]
    public void Should_Pass_When_Type_Valid(string type)
    {
        var command = new AddSessionDeviseCommand("LISE", 55, type, "O", "EUR", "CASH", 100);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Type);
    }

    [Theory]
    [InlineData("X")]
    [InlineData("Z")]
    [InlineData("")]
    public void Should_Fail_When_Type_Invalid(string type)
    {
        var command = new AddSessionDeviseCommand("LISE", 55, type, "O", "EUR", "CASH", 100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Type);
    }

    [Theory]
    [InlineData("O")]
    [InlineData("F")]
    [InlineData("P")]
    public void Should_Pass_When_Quand_Valid(string quand)
    {
        var command = new AddSessionDeviseCommand("LISE", 55, "C", quand, "EUR", "CASH", 100);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Quand);
    }

    [Theory]
    [InlineData("X")]
    [InlineData("")]
    public void Should_Fail_When_Quand_Invalid(string quand)
    {
        var command = new AddSessionDeviseCommand("LISE", 55, "C", quand, "EUR", "CASH", 100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Quand);
    }

    [Fact]
    public void Should_Fail_When_CodeDevise_TooLong()
    {
        var command = new AddSessionDeviseCommand("LISE", 55, "C", "O", "EURO", "CASH", 100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeDevise);
    }

    [Fact]
    public void Should_Fail_When_Quantite_Negative()
    {
        var command = new AddSessionDeviseCommand("LISE", 55, "C", "O", "EUR", "CASH", -100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Quantite);
    }

    [Fact]
    public void Should_Pass_When_Quantite_Zero()
    {
        var command = new AddSessionDeviseCommand("LISE", 55, "C", "O", "EUR", "CASH", 0);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Quantite);
    }
}
