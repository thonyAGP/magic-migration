using Caisse.Application.EasyCheckOut.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.EasyCheckOut.Queries;

public class EditionEasyCheckOutQueryValidatorTests
{
    private readonly EditionEasyCheckOutQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var query = new EditionEasyCheckOutQuery(false, true, false, DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_ErreursSeules_True()
    {
        var query = new EditionEasyCheckOutQuery(true, false, false, DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_TestPes_True()
    {
        var query = new EditionEasyCheckOutQuery(false, true, true, DateOnly.FromDateTime(DateTime.Today));
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_DateEdition_Default()
    {
        var query = new EditionEasyCheckOutQuery(false, false, false, default);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.DateEdition);
    }
}
