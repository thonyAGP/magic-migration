using Caisse.Application.Extrait.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Extrait.Queries;

public class GetExtraitCompteQueryValidatorTests
{
    private readonly GetExtraitCompteQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new GetExtraitCompteQuery("CS", 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_With_All_Options()
    {
        var query = new GetExtraitCompteQuery("CS", 12345678, 1,
            new DateOnly(2025, 1, 1), new DateOnly(2025, 12, 31), "Date", "BAR");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetExtraitCompteQuery(societe!, 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetExtraitCompteQuery("ABC", 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_CodeAdherent_Invalid(int codeAdherent)
    {
        var query = new GetExtraitCompteQuery("CS", codeAdherent, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeAdherent);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Negative()
    {
        var query = new GetExtraitCompteQuery("CS", 12345678, -1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Theory]
    [InlineData("Date")]
    [InlineData("Nom")]
    [InlineData("Service")]
    [InlineData("Cumul")]
    [InlineData("Imprime")]
    [InlineData(null)]
    public void Should_Pass_When_TriPar_Valid(string? triPar)
    {
        var query = new GetExtraitCompteQuery("CS", 12345678, 1, TriPar: triPar);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.TriPar);
    }

    [Theory]
    [InlineData("Invalid")]
    [InlineData("date")]
    [InlineData("NOM")]
    public void Should_Fail_When_TriPar_Invalid(string triPar)
    {
        var query = new GetExtraitCompteQuery("CS", 12345678, 1, TriPar: triPar);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.TriPar);
    }

    [Fact]
    public void Should_Pass_When_CodeService_Provided()
    {
        var query = new GetExtraitCompteQuery("CS", 12345678, 1, CodeService: "BAR");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
