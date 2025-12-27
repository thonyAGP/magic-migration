using Caisse.Application.Ventes.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Validators;

public class GetSoldeResortCreditQueryValidatorTests
{
    private readonly GetSoldeResortCreditQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new GetSoldeResortCreditQuery("CC", 135795, 0, "GOUR");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new GetSoldeResortCreditQuery(societe!, 135795, 0, "GOUR");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new GetSoldeResortCreditQuery("ABC", 135795, 0, "GOUR");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_Compte_Invalid(int compte)
    {
        var query = new GetSoldeResortCreditQuery("CC", compte, 0, "GOUR");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Compte);
    }

    [Fact]
    public void Should_Fail_When_Filiation_Negative()
    {
        var query = new GetSoldeResortCreditQuery("CC", 135795, -1, "GOUR");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Filiation);
    }

    [Fact]
    public void Should_Pass_When_Filiation_Zero()
    {
        var query = new GetSoldeResortCreditQuery("CC", 135795, 0, "GOUR");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Filiation);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Service_Empty(string? service)
    {
        var query = new GetSoldeResortCreditQuery("CC", 135795, 0, service!);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Service);
    }

    [Fact]
    public void Should_Fail_When_Service_TooLong()
    {
        var query = new GetSoldeResortCreditQuery("CC", 135795, 0, "ABCDE");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Service);
    }

    [Theory]
    [InlineData("A")]
    [InlineData("AB")]
    [InlineData("ABC")]
    [InlineData("ABCD")]
    public void Should_Pass_When_Service_ValidLength(string service)
    {
        var query = new GetSoldeResortCreditQuery("CC", 135795, 0, service);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveValidationErrorFor(x => x.Service);
    }
}
