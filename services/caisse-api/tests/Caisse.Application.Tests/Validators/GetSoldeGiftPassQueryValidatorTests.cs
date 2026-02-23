using Caisse.Application.Ventes.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Validators;

public class GetSoldeGiftPassQueryValidatorTests
{
    private readonly GetSoldeGiftPassQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new GetSoldeGiftPassQuery("CS", 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetSoldeGiftPassQuery(societe!, 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetSoldeGiftPassQuery("ABC", 12345678, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_Compte_Invalid(int compte)
    {
        var query = new GetSoldeGiftPassQuery("CS", compte, 1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Compte);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Negative()
    {
        var query = new GetSoldeGiftPassQuery("CS", 12345678, -1);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Fact]
    public void Should_Pass_When_Filiation_Zero()
    {
        var query = new GetSoldeGiftPassQuery("CS", 12345678, 0);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Filiation);
    }
}
