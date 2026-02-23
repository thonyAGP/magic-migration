using Caisse.Application.Ventes.Commands;
using FluentValidation;
using Xunit;

namespace Caisse.Application.Tests.Ventes;

public class InitiateNewSaleCommandTests
{
    private readonly InitiateNewSaleCommandValidator _validator = new();

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var command = new InitiateNewSaleCommand(
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            ModePaiement: "CASH",
            Operateur: "USER001",
            DateVente: DateOnly.FromDateTime(DateTime.Now),
            HeureVente: TimeOnly.FromDateTime(DateTime.Now));

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WithEmptySociete_ReturnsFail()
    {
        // Arrange
        var command = new InitiateNewSaleCommand(
            Societe: string.Empty,
            CodeGm: 123,
            Filiation: 1,
            ModePaiement: "CASH",
            Operateur: "USER001",
            DateVente: DateOnly.FromDateTime(DateTime.Now),
            HeureVente: TimeOnly.FromDateTime(DateTime.Now));

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_WithEmptyModePaiement_ReturnsFail()
    {
        // Arrange
        var command = new InitiateNewSaleCommand(
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            ModePaiement: string.Empty,
            Operateur: "USER001",
            DateVente: DateOnly.FromDateTime(DateTime.Now),
            HeureVente: TimeOnly.FromDateTime(DateTime.Now));

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_WithInvalidCodeGm_ReturnsFail()
    {
        // Arrange
        var command = new InitiateNewSaleCommand(
            Societe: "PMS",
            CodeGm: 0,
            Filiation: 1,
            ModePaiement: "CASH",
            Operateur: "USER001",
            DateVente: DateOnly.FromDateTime(DateTime.Now),
            HeureVente: TimeOnly.FromDateTime(DateTime.Now));

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
    }
}
