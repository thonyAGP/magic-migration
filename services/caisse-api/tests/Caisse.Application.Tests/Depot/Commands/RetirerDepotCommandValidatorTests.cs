using Caisse.Application.Depot.Commands;
using FluentValidation.TestHelper;
using Xunit;

namespace Caisse.Application.Tests.Depot.Commands;

public class RetirerDepotCommandValidatorTests
{
    private readonly RetirerDepotCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_All_Fields_Are_Valid()
    {
        // Arrange
        var command = new RetirerDepotCommand("C", 135795, 0, "D", "EUR", "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Is_Empty(string? societe)
    {
        // Arrange
        var command = new RetirerDepotCommand(societe!, 135795, 0, "D", "EUR", "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_Is_Too_Long()
    {
        // Arrange
        var command = new RetirerDepotCommand("ABC", 135795, 0, "D", "EUR", "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_CodeGm_Is_Not_Positive(int codeGm)
    {
        // Arrange
        var command = new RetirerDepotCommand("C", codeGm, 0, "D", "EUR", "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CodeGm);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Is_Negative()
    {
        // Arrange
        var command = new RetirerDepotCommand("C", 135795, -1, "D", "EUR", "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_TypeDepot_Is_Empty(string? typeDepot)
    {
        // Arrange
        var command = new RetirerDepotCommand("C", 135795, 0, typeDepot!, "EUR", "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.TypeDepot);
    }

    [Theory]
    [InlineData("X")]
    [InlineData("A")]
    [InlineData("Z")]
    public void Should_Fail_When_TypeDepot_Is_Invalid(string typeDepot)
    {
        // Arrange
        var command = new RetirerDepotCommand("C", 135795, 0, typeDepot, "EUR", "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.TypeDepot);
    }

    [Theory]
    [InlineData("O")] // Objet
    [InlineData("D")] // Devise
    [InlineData("S")] // Scelle
    [InlineData("G")] // Garantie
    public void Should_Pass_With_Valid_TypeDepot(string typeDepot)
    {
        // Arrange
        var command = new RetirerDepotCommand("C", 135795, 0, typeDepot, "EUR", "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.TypeDepot);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Devise_Is_Empty(string? devise)
    {
        // Arrange
        var command = new RetirerDepotCommand("C", 135795, 0, "D", devise!, "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Devise);
    }

    [Fact]
    public void Should_Fail_When_Devise_Is_Too_Long()
    {
        // Arrange
        var command = new RetirerDepotCommand("C", 135795, 0, "D", "EURO", "OP001");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Devise);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Operateur_Is_Empty(string? operateur)
    {
        // Arrange
        var command = new RetirerDepotCommand("C", 135795, 0, "D", "EUR", operateur!);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Operateur);
    }

    [Fact]
    public void Should_Fail_When_Operateur_Is_Too_Long()
    {
        // Arrange
        var command = new RetirerDepotCommand("C", 135795, 0, "D", "EUR", new string('X', 21));

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Operateur);
    }

    [Theory]
    [InlineData("C", 1, 0, "O", "EUR", "OP1")]
    [InlineData("AB", 99999, 999, "D", "USD", "OP_TEST")]
    [InlineData("X", 12345, 1, "S", "GBP", "ADMIN")]
    public void Should_Pass_With_Various_Valid_Combinations(
        string societe, int codeGm, int filiation, string typeDepot, string devise, string operateur)
    {
        // Arrange
        var command = new RetirerDepotCommand(societe, codeGm, filiation, typeDepot, devise, operateur);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
