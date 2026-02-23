using Caisse.Application.Telephone.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Telephone.Queries;

public class GetLigneTelephoneQueryValidatorTests
{
    private readonly GetLigneTelephoneQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new GetLigneTelephoneQuery("CS", 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetLigneTelephoneQuery(societe!, 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetLigneTelephoneQuery("ABC", 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_CodeGm_Invalid(int codeGm)
    {
        var query = new GetLigneTelephoneQuery("CS", codeGm, 0);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeGm);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Negative()
    {
        var query = new GetLigneTelephoneQuery("CS", 12345678, -1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Fact]
    public void Should_Pass_When_Filiation_Zero()
    {
        var query = new GetLigneTelephoneQuery("CS", 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Filiation);
    }
}
