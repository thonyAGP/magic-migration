using Caisse.Application.Telephone.Commands;
using FluentValidation.TestHelper;
using Xunit;

namespace Caisse.Application.Tests.Telephone.Commands;

public class InitPhoneLineCommandValidatorTests
{
    private readonly InitPhoneLineCommandValidator _validator;

    public InitPhoneLineCommandValidatorTests()
    {
        _validator = new InitPhoneLineCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldSucceed()
    {
        var command = new InitPhoneLineCommand(
            Societe: "FR",
            CodeGm: 100,
            Filiation: 1,
            CodePoste: 1,
            NumLigne: 1,
            NumPoste: 1,
            Existe: true
        );

        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptySociete_ShouldFail()
    {
        var command = new InitPhoneLineCommand(
            Societe: "",
            CodeGm: 100,
            Filiation: 1,
            CodePoste: 1,
            NumLigne: 1,
            NumPoste: 1,
            Existe: true
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Validate_WithInvalidCodeGm_ShouldFail()
    {
        var command = new InitPhoneLineCommand(
            Societe: "FR",
            CodeGm: 0,
            Filiation: 1,
            CodePoste: 1,
            NumLigne: 1,
            NumPoste: 1,
            Existe: true
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeGm);
    }
}
