using Caisse.Application.Divers.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Divers.Queries;

public class VerifierAccesInformaticienQueryValidatorTests
{
    private readonly VerifierAccesInformaticienQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new VerifierAccesInformaticienQuery("CS", "ADMIN");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_With_SupprimerMessages()
    {
        var query = new VerifierAccesInformaticienQuery("CS", "ADMIN", true);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new VerifierAccesInformaticienQuery(societe!, "ADMIN");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new VerifierAccesInformaticienQuery("ABC", "ADMIN");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_CodeUtilisateur_Empty(string? codeUtilisateur)
    {
        var query = new VerifierAccesInformaticienQuery("CS", codeUtilisateur!);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeUtilisateur);
    }

    [Fact]
    public void Should_Fail_When_CodeUtilisateur_TooLong()
    {
        var query = new VerifierAccesInformaticienQuery("CS", new string('A', 21));
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeUtilisateur);
    }
}
