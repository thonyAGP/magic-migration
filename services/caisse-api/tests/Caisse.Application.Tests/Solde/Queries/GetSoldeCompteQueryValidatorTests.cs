using Caisse.Application.Solde.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Solde.Queries;

public class GetSoldeCompteQueryValidatorTests
{
    private readonly GetSoldeCompteQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new GetSoldeCompteQuery("CS", 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_With_DateSolde()
    {
        var query = new GetSoldeCompteQuery("CS", 12345678, 1, new DateOnly(2025, 1, 15));
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetSoldeCompteQuery(societe!, 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetSoldeCompteQuery("ABC", 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_CodeAdherent_Invalid(int codeAdherent)
    {
        var query = new GetSoldeCompteQuery("CS", codeAdherent, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeAdherent);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Negative()
    {
        var query = new GetSoldeCompteQuery("CS", 12345678, -1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Fact]
    public void Should_Pass_When_Filiation_Zero()
    {
        var query = new GetSoldeCompteQuery("CS", 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Filiation);
    }
}
