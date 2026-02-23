using Caisse.Application.Telephone.Commands;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Telephone.Commands;

public class GererLigneTelephoneCommandValidatorTests
{
    private readonly GererLigneTelephoneCommandValidator _validator = new();

    private static GererLigneTelephoneCommand CreateValidCommand() =>
        new("CS", 12345678, 0, "101", "OPEN", "ADMIN");

    [Fact]
    public void Should_Pass_When_Valid_Open()
    {
        var command = CreateValidCommand();
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_Close()
    {
        var command = CreateValidCommand() with { Operation = "CLOSE" };
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
    public void Should_Fail_When_NumeroPoste_Empty(string? numeroPoste)
    {
        var command = CreateValidCommand() with { NumeroPoste = numeroPoste! };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.NumeroPoste);
    }

    [Fact]
    public void Should_Fail_When_NumeroPoste_TooLong()
    {
        var command = CreateValidCommand() with { NumeroPoste = "12345678901" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.NumeroPoste);
    }

    [Theory]
    [InlineData("")]
    [InlineData("INVALID")]
    [InlineData("open")]
    [InlineData("close")]
    public void Should_Fail_When_Operation_Invalid(string operation)
    {
        var command = CreateValidCommand() with { Operation = operation };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Operation);
    }

    [Theory]
    [InlineData("OPEN")]
    [InlineData("CLOSE")]
    public void Should_Pass_When_Operation_Valid(string operation)
    {
        var command = CreateValidCommand() with { Operation = operation };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Operation);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Operateur_Empty(string? operateur)
    {
        var command = CreateValidCommand() with { Operateur = operateur! };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Operateur);
    }

    [Fact]
    public void Should_Fail_When_Operateur_TooLong()
    {
        var command = CreateValidCommand() with { Operateur = "OPERATEUR123" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Operateur);
    }
}
