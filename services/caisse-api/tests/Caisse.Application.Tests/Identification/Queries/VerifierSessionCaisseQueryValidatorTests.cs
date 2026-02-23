using Caisse.Application.Identification.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Identification.Queries;

public class VerifierSessionCaisseQueryValidatorTests
{
    private readonly VerifierSessionCaisseQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new VerifierSessionCaisseQuery("CS", "ADMIN");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new VerifierSessionCaisseQuery(societe!, "ADMIN");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new VerifierSessionCaisseQuery("ABC", "ADMIN");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_CodeOperateur_Empty(string? codeOperateur)
    {
        var query = new VerifierSessionCaisseQuery("CS", codeOperateur!);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeOperateur);
    }

    [Fact]
    public void Should_Fail_When_CodeOperateur_TooLong()
    {
        var query = new VerifierSessionCaisseQuery("CS", "OPERATEUR123");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeOperateur);
    }
}
