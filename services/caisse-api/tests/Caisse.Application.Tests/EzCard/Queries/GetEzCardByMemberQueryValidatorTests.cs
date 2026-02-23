using Caisse.Application.EzCard.Queries;
using FluentValidation.TestHelper;
using Xunit;

namespace Caisse.Application.Tests.EzCard.Queries;

public class GetEzCardByMemberQueryValidatorTests
{
    private readonly GetEzCardByMemberQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_All_Fields_Are_Valid()
    {
        // Arrange
        var query = new GetEzCardByMemberQuery("C", 135795, 0);

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
        var query = new GetEzCardByMemberQuery(societe!, 135795, 0);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_Is_Too_Long()
    {
        // Arrange
        var query = new GetEzCardByMemberQuery("ABC", 135795, 0);

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
        var query = new GetEzCardByMemberQuery("C", codeGm, 0);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CodeGm);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Is_Negative()
    {
        // Arrange
        var query = new GetEzCardByMemberQuery("C", 135795, -1);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(999)]
    public void Should_Pass_When_Filiation_Is_Non_Negative(int filiation)
    {
        // Arrange
        var query = new GetEzCardByMemberQuery("C", 135795, filiation);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Filiation);
    }

    [Theory]
    [InlineData("C", 1, 0)]
    [InlineData("AB", 99999999, 999)]
    [InlineData("X", 12345, 1)]
    public void Should_Pass_With_Various_Valid_Combinations(string societe, int codeGm, int filiation)
    {
        // Arrange
        var query = new GetEzCardByMemberQuery(societe, codeGm, filiation);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
