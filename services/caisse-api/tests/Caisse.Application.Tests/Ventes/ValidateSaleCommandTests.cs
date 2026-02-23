using Caisse.Application.Ventes.Commands;
using FluentValidation;
using Xunit;

namespace Caisse.Application.Tests.Ventes;

public class ValidateSaleCommandTests
{
    private readonly ValidateSaleCommandValidator _validator = new();

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var command = new ValidateSaleCommand(
            TransactionId: 1001,
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            MontantTotal: 100.00m,
            MontantTva: 20.00m,
            DeviseTransaction: "EUR");

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WithNegativeAmount_ReturnsFail()
    {
        // Arrange
        var command = new ValidateSaleCommand(
            TransactionId: 1001,
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            MontantTotal: -100.00m,
            MontantTva: 20.00m,
            DeviseTransaction: "EUR");

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_WithNegativeVat_ReturnsFail()
    {
        // Arrange
        var command = new ValidateSaleCommand(
            TransactionId: 1001,
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            MontantTotal: 100.00m,
            MontantTva: -20.00m,
            DeviseTransaction: "EUR");

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_WithEmptyDevise_ReturnsFail()
    {
        // Arrange
        var command = new ValidateSaleCommand(
            TransactionId: 1001,
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            MontantTotal: 100.00m,
            MontantTva: 20.00m,
            DeviseTransaction: string.Empty);

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_WithZeroTransactionId_ReturnsFail()
    {
        // Arrange
        var command = new ValidateSaleCommand(
            TransactionId: 0,
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            MontantTotal: 100.00m,
            MontantTva: 20.00m,
            DeviseTransaction: "EUR");

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
    }
}
