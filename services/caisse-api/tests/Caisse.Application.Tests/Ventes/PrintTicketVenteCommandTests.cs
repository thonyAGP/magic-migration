using Caisse.Application.Ventes.Commands;
using FluentValidation;
using Xunit;

namespace Caisse.Application.Tests.Ventes;

public class PrintTicketVenteCommandTests
{
    private readonly PrintTicketVenteCommandValidator _validator = new();

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var command = new PrintTicketVenteCommand(
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            TransactionId: 1001,
            EstAnnulation: false);

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WithEmptySociete_ReturnsFail()
    {
        // Arrange
        var command = new PrintTicketVenteCommand(
            Societe: string.Empty,
            CodeGm: 123,
            Filiation: 1,
            TransactionId: 1001);

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(PrintTicketVenteCommand.Societe));
    }

    [Fact]
    public void Validate_WithInvalidCodeGm_ReturnsFail()
    {
        // Arrange
        var command = new PrintTicketVenteCommand(
            Societe: "PMS",
            CodeGm: 0,
            Filiation: 1,
            TransactionId: 1001);

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(PrintTicketVenteCommand.CodeGm));
    }

    [Fact]
    public void Validate_WithInvalidTransactionId_ReturnsFail()
    {
        // Arrange
        var command = new PrintTicketVenteCommand(
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            TransactionId: 0);

        // Act
        var result = _validator.Validate(command);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(PrintTicketVenteCommand.TransactionId));
    }
}
