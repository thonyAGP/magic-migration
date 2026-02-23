using Caisse.Application.Articles.Commands;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Validators;

public class AddSessionArticleCommandValidatorTests
{
    private readonly AddSessionArticleCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var command = new AddSessionArticleCommand("LISE", 55, 1001, "Cafe", 2.50, 2);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_CodeArticle_Invalid(int codeArticle)
    {
        var command = new AddSessionArticleCommand("LISE", 55, codeArticle, "Cafe", 2.50, 2);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeArticle);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_LibelleArticle_Empty(string? libelle)
    {
        var command = new AddSessionArticleCommand("LISE", 55, 1001, libelle!, 2.50, 2);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.LibelleArticle);
    }

    [Fact]
    public void Should_Fail_When_LibelleArticle_TooLong()
    {
        var command = new AddSessionArticleCommand("LISE", 55, 1001, new string('X', 33), 2.50, 2);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.LibelleArticle);
    }

    [Fact]
    public void Should_Fail_When_PrixUnitaire_Negative()
    {
        var command = new AddSessionArticleCommand("LISE", 55, 1001, "Cafe", -2.50, 2);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.PrixUnitaire);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Should_Fail_When_Quantite_NotPositive(int quantite)
    {
        var command = new AddSessionArticleCommand("LISE", 55, 1001, "Cafe", 2.50, quantite);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Quantite);
    }
}
