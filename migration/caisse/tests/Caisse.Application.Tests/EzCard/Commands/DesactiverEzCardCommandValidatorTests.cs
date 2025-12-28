using Caisse.Application.EzCard.Commands;
using FluentValidation.TestHelper;
using Xunit;

namespace Caisse.Application.Tests.EzCard.Commands;

public class DesactiverEzCardCommandValidatorTests
{
    private readonly DesactiverEzCardCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_All_Fields_Are_Valid()
    {
        // Arrange
        var command = new DesactiverEzCardCommand("C", "CARD123456", "Perdu");

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
        var command = new DesactiverEzCardCommand(societe!, "CARD123", "Motif");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_Is_Too_Long()
    {
        // Arrange
        var command = new DesactiverEzCardCommand("ABC", "CARD123", "Motif");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_CardCode_Is_Empty(string? cardCode)
    {
        // Arrange
        var command = new DesactiverEzCardCommand("C", cardCode!, "Motif");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CardCode);
    }

    [Fact]
    public void Should_Fail_When_CardCode_Is_Too_Long()
    {
        // Arrange
        var command = new DesactiverEzCardCommand("C", new string('X', 21), "Motif");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CardCode);
    }

    [Fact]
    public void Should_Fail_When_Motif_Is_Too_Long()
    {
        // Arrange
        var command = new DesactiverEzCardCommand("C", "CARD123", new string('X', 101));

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Motif);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Perdu")]
    [InlineData("Vol")]
    [InlineData("Demande client")]
    public void Should_Pass_With_Various_Motifs(string motif)
    {
        // Arrange
        var command = new DesactiverEzCardCommand("C", "CARD123", motif);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Motif);
    }

    [Theory]
    [InlineData("C", "CARD1", "")]
    [InlineData("AB", "CARD123456789012345", "Motif de test")]
    [InlineData("X", "12345", "Vol")]
    public void Should_Pass_With_Various_Valid_Combinations(string societe, string cardCode, string motif)
    {
        // Arrange
        var command = new DesactiverEzCardCommand(societe, cardCode, motif);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
