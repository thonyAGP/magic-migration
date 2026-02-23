using Caisse.Application.EasyCheckOut.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.EasyCheckOut.Queries;

public class ExtraitEasyCheckOutQueryValidatorTests
{
    private readonly ExtraitEasyCheckOutQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new ExtraitEasyCheckOutQuery("CS", DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var query = new ExtraitEasyCheckOutQuery(societe!, DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var query = new ExtraitEasyCheckOutQuery("ABC", DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_DateDepart_Default()
    {
        var query = new ExtraitEasyCheckOutQuery("CS", default);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.DateDepart);
    }
}
