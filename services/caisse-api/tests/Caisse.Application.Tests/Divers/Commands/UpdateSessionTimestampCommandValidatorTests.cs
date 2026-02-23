using Caisse.Application.Divers.Commands;
using FluentValidation.TestHelper;

namespace Caisse.Application.Tests.Divers.Commands;

public class UpdateSessionTimestampCommandValidatorTests
{
    private readonly UpdateSessionTimestampCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var command = new UpdateSessionTimestampCommand("CS", "C01", "ADMIN");
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Valid_With_DateTime()
    {
        var command = new UpdateSessionTimestampCommand("CS", "C01", "ADMIN", DateTime.Now);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_Societe_Empty(string? societe)
    {
        var command = new UpdateSessionTimestampCommand(societe!, "C01", "ADMIN");
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void Should_Fail_When_Societe_TooLong()
    {
        var command = new UpdateSessionTimestampCommand("ABC", "C01", "ADMIN");
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_CodeCaisse_Empty(string? codeCaisse)
    {
        var command = new UpdateSessionTimestampCommand("CS", codeCaisse!, "ADMIN");
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeCaisse);
    }

    [Fact]
    public void Should_Fail_When_CodeCaisse_TooLong()
    {
        var command = new UpdateSessionTimestampCommand("CS", new string('C', 11), "ADMIN");
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeCaisse);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Fail_When_CodeOperateur_Empty(string? codeOperateur)
    {
        var command = new UpdateSessionTimestampCommand("CS", "C01", codeOperateur!);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeOperateur);
    }

    [Fact]
    public void Should_Fail_When_CodeOperateur_TooLong()
    {
        var command = new UpdateSessionTimestampCommand("CS", "C01", new string('A', 21));
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CodeOperateur);
    }
}
