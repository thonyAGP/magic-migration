using Caisse.Application.Garanties.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Garanties.Queries;

public class GetGarantieCompteQueryValidatorTests
{
    private readonly GetGarantieCompteQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new GetGarantieCompteQuery("CS", 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetGarantieCompteQuery(societe!, 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetGarantieCompteQuery("ABC", 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_CodeAdherent_Invalid(int codeAdherent)
    {
        var query = new GetGarantieCompteQuery("CS", codeAdherent, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeAdherent);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Negative()
    {
        var query = new GetGarantieCompteQuery("CS", 12345678, -1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Fact]
    public void Should_Pass_When_Filiation_Zero()
    {
        var query = new GetGarantieCompteQuery("CS", 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Filiation);
    }

    [Theory]
    [InlineData("C")]
    [InlineData("AB")]
    public void Should_Pass_When_Societe_Valid_Length(string societe)
    {
        var query = new GetGarantieCompteQuery(societe, 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Societe);
    }
}
