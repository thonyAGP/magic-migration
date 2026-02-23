using Caisse.Application.Details.Commands;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Validators;

public class AddSessionDetailCommandValidatorTests
{
    private readonly AddSessionDetailCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var command = new AddSessionDetailCommand("LISE", 55, "C", "O");
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
        var command = new AddSessionDetailCommand("LISE", 55, type, "O");
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Type);
    }

    [Theory]
    [InlineData("X")]
    [InlineData("")]
    public void Should_Fail_When_Type_Invalid(string type)
    {
        var command = new AddSessionDetailCommand("LISE", 55, type, "O");
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Type);
    }

    [Theory]
    [InlineData("O")]
    [InlineData("F")]
    [InlineData("P")]
    public void Should_Pass_When_Quand_Valid(string quand)
    {
        var command = new AddSessionDetailCommand("LISE", 55, "C", quand);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Quand);
    }

    [Theory]
    [InlineData("X")]
    [InlineData("")]
    public void Should_Fail_When_Quand_Invalid(string quand)
    {
        var command = new AddSessionDetailCommand("LISE", 55, "C", quand);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Quand);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_ChronoSession_Invalid(double chrono)
    {
        var command = new AddSessionDetailCommand("LISE", chrono, "C", "O");
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ChronoSession);
    }
}
