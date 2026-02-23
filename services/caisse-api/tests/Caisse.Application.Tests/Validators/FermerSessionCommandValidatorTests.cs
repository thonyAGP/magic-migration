using Caisse.Application.Sessions.Commands;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Validators;

public class FermerSessionCommandValidatorTests
{
    private readonly FermerSessionCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var command = new FermerSessionCommand("LISE", 55);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Utilisateur_Empty(string? utilisateur)
    {
        var command = new FermerSessionCommand(utilisateur!, 55);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Utilisateur);
    }

    [Fact]
    public void Should_Fail_When_Utilisateur_TooLong()
    {
        var command = new FermerSessionCommand("UTILISATEUR_TROP_LONG", 55);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Utilisateur);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_ChronoSession_Invalid(double chrono)
    {
        var command = new FermerSessionCommand("LISE", chrono);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ChronoSession);
    }

    [Fact]
    public void Should_Pass_With_Optional_Parameters()
    {
        var command = new FermerSessionCommand(
            "LISE", 55,
            MontantCompteCaisse: 1000,
            CommentaireEcart: "Test",
            ForceClosureOnEcart: true,
            SeuilAlerte: 50);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_MontantCompteCaisse_Negative()
    {
        var command = new FermerSessionCommand("LISE", 55, MontantCompteCaisse: -100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.MontantCompteCaisse);
    }

    [Fact]
    public void Should_Pass_When_MontantCompteCaisse_Zero()
    {
        var command = new FermerSessionCommand("LISE", 55, MontantCompteCaisse: 0);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.MontantCompteCaisse);
    }

    [Fact]
    public void Should_Fail_When_SeuilAlerte_Negative()
    {
        var command = new FermerSessionCommand("LISE", 55, SeuilAlerte: -10);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.SeuilAlerte);
    }

    [Fact]
    public void Should_Fail_When_CommentaireEcart_TooLong()
    {
        var command = new FermerSessionCommand("LISE", 55, CommentaireEcart: "Ce commentaire depasse 30 caracteres limite");
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CommentaireEcart);
    }

    [Fact]
    public void Should_Pass_When_CommentaireEcart_AtLimit()
    {
        var command = new FermerSessionCommand("LISE", 55, CommentaireEcart: "123456789012345678901234567890"); // exactly 30
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.CommentaireEcart);
    }
}
