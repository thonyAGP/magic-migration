using Caisse.Application.CaisseDevises.Commands;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Validators;

public class UpdateCaisseDeviseCommandValidatorTests
{
    private readonly UpdateCaisseDeviseCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var command = new UpdateCaisseDeviseCommand("LISE", "EUR", "CASH", "O", "C", 100);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Utilisateur_Empty(string? utilisateur)
    {
        var command = new UpdateCaisseDeviseCommand(utilisateur!, "EUR", "CASH", "O", "C", 100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Utilisateur);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_CodeDevise_Empty(string? codeDevise)
    {
        var command = new UpdateCaisseDeviseCommand("LISE", codeDevise!, "CASH", "O", "C", 100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeDevise);
    }

    [Fact]
    public void Should_Fail_When_CodeDevise_TooLong()
    {
        var command = new UpdateCaisseDeviseCommand("LISE", "TOOOLONG", "CASH", "O", "C", 100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeDevise);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_ModePaiement_Empty(string? modePaiement)
    {
        var command = new UpdateCaisseDeviseCommand("LISE", "EUR", modePaiement!, "O", "C", 100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ModePaiement);
    }

    [Fact]
    public void Should_Fail_When_ModePaiement_TooLong()
    {
        var command = new UpdateCaisseDeviseCommand("LISE", "EUR", "VERYLONGMODE", "O", "C", 100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ModePaiement);
    }

    [Fact]
    public void Should_Fail_When_Quantite_Negative()
    {
        var command = new UpdateCaisseDeviseCommand("LISE", "EUR", "CASH", "O", "C", -100);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Quantite);
    }
}
