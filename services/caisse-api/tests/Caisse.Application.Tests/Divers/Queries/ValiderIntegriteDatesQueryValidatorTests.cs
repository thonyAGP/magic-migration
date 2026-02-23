using Caisse.Application.Divers.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Divers.Queries;

public class ValiderIntegriteDatesQueryValidatorTests
{
    private readonly ValiderIntegriteDatesQueryValidator _validator = new();

    [Theory]
    [InlineData("O")]
    [InlineData("T")]
    [InlineData("F")]
    public void Should_Pass_When_Valid_TypeOperation(string typeOp)
    {
        var dateOuverture = typeOp == "T" ? DateOnly.FromDateTime(DateTime.Today) : (DateOnly?)null;
        var query = new ValiderIntegriteDatesQuery(
            "CS", typeOp, DateOnly.FromDateTime(DateTime.Today), dateOuverture);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new ValiderIntegriteDatesQuery(societe!, "O", DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new ValiderIntegriteDatesQuery("ABC", "O", DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_TypeOperation_Empty(string? typeOp)
    {
        var query = new ValiderIntegriteDatesQuery("CS", typeOp!, DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.TypeOperation);
    }

    [Theory]
    [InlineData("X")]
    [InlineData("A")]
    [InlineData("B")]
    public void Should_Fail_When_TypeOperation_Invalid(string typeOp)
    {
        var query = new ValiderIntegriteDatesQuery("CS", typeOp, DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.TypeOperation);
    }

    [Fact]
    public void Should_Fail_When_Transaction_Without_DateOuverture()
    {
        var query = new ValiderIntegriteDatesQuery("CS", "T", DateOnly.FromDateTime(DateTime.Today), null);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.DateOuvertureSession);
    }

    [Fact]
    public void Should_Pass_When_Ouverture_Without_DateOuverture()
    {
        var query = new ValiderIntegriteDatesQuery("CS", "O", DateOnly.FromDateTime(DateTime.Today), null);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Fermeture_Without_DateOuverture()
    {
        var query = new ValiderIntegriteDatesQuery("CS", "F", DateOnly.FromDateTime(DateTime.Today), null);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
