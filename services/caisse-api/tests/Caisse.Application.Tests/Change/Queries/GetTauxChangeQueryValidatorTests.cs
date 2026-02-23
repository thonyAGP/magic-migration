using Caisse.Application.Change.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Change.Queries;

public class GetTauxChangeQueryValidatorTests
{
    private readonly GetTauxChangeQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid_MinimalParams()
    {
        var query = new GetTauxChangeQuery("CS");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_WithCodeDevise()
    {
        var query = new GetTauxChangeQuery("CS", "EUR");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_WithDateReference()
    {
        var query = new GetTauxChangeQuery("CS", null, new DateOnly(2025, 1, 1));
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetTauxChangeQuery(societe!);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetTauxChangeQuery("ABC");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_CodeDevise_TooLong()
    {
        var query = new GetTauxChangeQuery("CS", "EURO");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeDevise);
    }

    [Theory]
    [InlineData("E")]
    [InlineData("EU")]
    [InlineData("EUR")]
    public void Should_Pass_When_CodeDevise_Valid(string codeDevise)
    {
        var query = new GetTauxChangeQuery("CS", codeDevise);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
