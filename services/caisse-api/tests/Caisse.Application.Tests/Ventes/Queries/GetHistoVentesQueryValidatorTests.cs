using Caisse.Application.Ventes.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Ventes.Queries;

public class GetHistoVentesQueryValidatorTests
{
    private readonly GetHistoVentesQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new GetHistoVentesQuery("CS", 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_With_Dates()
    {
        var query = new GetHistoVentesQuery("CS", 12345678, 1,
            "20250101", "20251231");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_With_Limit()
    {
        var query = new GetHistoVentesQuery("CS", 12345678, 1, Limit: 100);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetHistoVentesQuery(societe!, 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetHistoVentesQuery("ABCDEFGHIJK", 12345678, 1); // > 10 chars
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_CodeGm_Invalid(int codeGm)
    {
        var query = new GetHistoVentesQuery("CS", codeGm, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeGm);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Negative()
    {
        var query = new GetHistoVentesQuery("CS", 12345678, -1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(501)]
    public void Should_Fail_When_Limit_OutOfRange(int limit)
    {
        var query = new GetHistoVentesQuery("CS", 12345678, 1, Limit: limit);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Limit);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(50)]
    [InlineData(500)]
    public void Should_Pass_When_Limit_Valid(int limit)
    {
        var query = new GetHistoVentesQuery("CS", 12345678, 1, Limit: limit);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Limit);
    }
}
