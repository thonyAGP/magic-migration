using Caisse.Application.Change.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Change.Queries;

public class GetDeviseLocaleQueryValidatorTests
{
    private readonly GetDeviseLocaleQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new GetDeviseLocaleQuery("CS");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetDeviseLocaleQuery(societe!);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetDeviseLocaleQuery("ABC");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData("C")]
    [InlineData("AB")]
    public void Should_Pass_When_Societe_Valid(string societe)
    {
        var query = new GetDeviseLocaleQuery(societe);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
