using Caisse.Application.Ventes.Queries;
using FluentValidation;
using Xunit;

namespace Caisse.Application.Tests.Ventes;

public class GetHistoVentesQueryTests
{
    private readonly GetHistoVentesQueryValidator _validator = new();

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var query = new GetHistoVentesQuery(
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            DateDebut: DateTime.Now.AddDays(-30).ToString("yyyyMMdd"),
            DateFin: DateTime.Now.ToString("yyyyMMdd"),
            Limit: 50);

        // Act
        var result = _validator.Validate(query);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WithMinimalData_ReturnsSuccess()
    {
        // Arrange
        var query = new GetHistoVentesQuery(
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1);

        // Act
        var result = _validator.Validate(query);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WithEmptySociete_ReturnsFail()
    {
        // Arrange
        var query = new GetHistoVentesQuery(
            Societe: string.Empty,
            CodeGm: 123,
            Filiation: 1);

        // Act
        var result = _validator.Validate(query);

        // Assert
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_WithInvalidCodeGm_ReturnsFail()
    {
        // Arrange
        var query = new GetHistoVentesQuery(
            Societe: "PMS",
            CodeGm: 0,
            Filiation: 1);

        // Act
        var result = _validator.Validate(query);

        // Assert
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_WithInvalidLimit_ReturnsFail()
    {
        // Arrange
        var query = new GetHistoVentesQuery(
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            Limit: 1000); // Exceeds max of 500

        // Act
        var result = _validator.Validate(query);

        // Assert
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_WithLimitZero_ReturnsFail()
    {
        // Arrange
        var query = new GetHistoVentesQuery(
            Societe: "PMS",
            CodeGm: 123,
            Filiation: 1,
            Limit: 0);

        // Act
        var result = _validator.Validate(query);

        // Assert
        Assert.False(result.IsValid);
    }
}
