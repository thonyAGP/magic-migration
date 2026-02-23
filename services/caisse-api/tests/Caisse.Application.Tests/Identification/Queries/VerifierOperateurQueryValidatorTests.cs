using Caisse.Application.Identification.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Identification.Queries;

public class VerifierOperateurQueryValidatorTests
{
    private readonly VerifierOperateurQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new VerifierOperateurQuery("CS", "ADMIN", "password123");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new VerifierOperateurQuery(societe!, "ADMIN", "password123");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new VerifierOperateurQuery("ABC", "ADMIN", "password123");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_CodeOperateur_Empty(string? codeOperateur)
    {
        var query = new VerifierOperateurQuery("CS", codeOperateur!, "password123");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeOperateur);
    }

    [Fact]
    public void Should_Fail_When_CodeOperateur_TooLong()
    {
        var query = new VerifierOperateurQuery("CS", "OPERATEUR123", "password123");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeOperateur);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_MotDePasse_Empty(string? motDePasse)
    {
        var query = new VerifierOperateurQuery("CS", "ADMIN", motDePasse!);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.MotDePasse);
    }

    [Fact]
    public void Should_Fail_When_MotDePasse_TooLong()
    {
        var longPassword = new string('a', 51);
        var query = new VerifierOperateurQuery("CS", "ADMIN", longPassword);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.MotDePasse);
    }
}
