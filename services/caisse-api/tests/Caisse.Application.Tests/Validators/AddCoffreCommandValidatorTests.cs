using Caisse.Application.Coffre.Commands;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Validators;

public class AddCoffreCommandValidatorTests
{
    private readonly AddCoffreCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var command = new AddCoffreCommand("LISE", 55);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Utilisateur_Empty(string? utilisateur)
    {
        var command = new AddCoffreCommand(utilisateur!, 55);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Utilisateur);
    }

    [Fact]
    public void Should_Fail_When_Utilisateur_TooLong()
    {
        var command = new AddCoffreCommand("UTILISATEUR_TROP_LONG", 55);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Utilisateur);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_Chrono_Invalid(double chrono)
    {
        var command = new AddCoffreCommand("LISE", chrono);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Chrono);
    }
}
