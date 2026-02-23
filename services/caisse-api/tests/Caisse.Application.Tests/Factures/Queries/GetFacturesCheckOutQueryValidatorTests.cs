using Caisse.Application.Factures.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Factures.Queries;

public class GetFacturesCheckOutQueryValidatorTests
{
    private readonly GetFacturesCheckOutQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new GetFacturesCheckOutQuery("CS", 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetFacturesCheckOutQuery(societe!, 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetFacturesCheckOutQuery("ABC", 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_CodeGm_Invalid(int codeGm)
    {
        var query = new GetFacturesCheckOutQuery("CS", codeGm, 0);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeGm);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Negative()
    {
        var query = new GetFacturesCheckOutQuery("CS", 12345678, -1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Fact]
    public void Should_Pass_When_Filiation_Zero()
    {
        var query = new GetFacturesCheckOutQuery("CS", 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Filiation);
    }
}
