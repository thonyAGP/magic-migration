using Caisse.Application.Divers.Queries;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Divers.Queries;

public class GetTitreEcranQueryValidatorTests
{
    private readonly GetTitreEcranQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid_Minimal()
    {
        var query = new GetTitreEcranQuery("DASHBOARD");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_Full()
    {
        var query = new GetTitreEcranQuery("DASHBOARD", "CA", "FRA");
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_CodeEcran_Empty(string? codeEcran)
    {
        var query = new GetTitreEcranQuery(codeEcran!);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeEcran);
    }

    [Fact]
    public void Should_Fail_When_CodeEcran_TooLong()
    {
        var query = new GetTitreEcranQuery(new string('A', 21));
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeEcran);
    }

    [Fact]
    public void Should_Fail_When_TypeProgramme_TooLong()
    {
        var query = new GetTitreEcranQuery("DASHBOARD", "ABCDEF", "FRA");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.TypeProgramme);
    }

    [Fact]
    public void Should_Fail_When_CodeLangue_TooLong()
    {
        var query = new GetTitreEcranQuery("DASHBOARD", "CA", "FRAN");
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CodeLangue);
    }
}
