using Caisse.Application.Depot.Queries;
using FluentValidation.TestHelper;
using Xunit;

namespace Caisse.Application.Tests.Depot.Queries;

public class GetExtraitDepotQueryValidatorTests
{
    private readonly GetExtraitDepotQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_All_Fields_Are_Valid()
    {
        // Arrange
        var query = new GetExtraitDepotQuery("C", 135795, 0);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_With_NomVillage()
    {
        // Arrange
        var query = new GetExtraitDepotQuery("C", 135795, 0, "Village Test");

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Is_Empty(string? societe)
    {
        // Arrange
        var query = new GetExtraitDepotQuery(societe!, 135795, 0);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_Is_Too_Long()
    {
        // Arrange
        var query = new GetExtraitDepotQuery("ABC", 135795, 0);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Should_Fail_When_CodeGm_Is_Not_Positive(int codeGm)
    {
        // Arrange
        var query = new GetExtraitDepotQuery("C", codeGm, 0);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CodeGm);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Is_Negative()
    {
        // Arrange
        var query = new GetExtraitDepotQuery("C", 135795, -1);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Fact]
    public void Should_Fail_When_NomVillage_Is_Too_Long()
    {
        // Arrange
        var query = new GetExtraitDepotQuery("C", 135795, 0, new string('X', 31));

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.NomVillage);
    }

    [Theory]
    [InlineData("C", 1, 0, null)]
    [InlineData("AB", 99999999, 999, "Paris")]
    [InlineData("X", 12345, 1, "Test Village")]
    public void Should_Pass_With_Various_Valid_Combinations(string societe, int codeGm, int filiation, string? nomVillage)
    {
        // Arrange
        var query = new GetExtraitDepotQuery(societe, codeGm, filiation, nomVillage);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
