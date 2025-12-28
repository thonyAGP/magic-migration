using Caisse.Application.EzCard.Queries;
using FluentValidation.TestHelper;
using Xunit;

namespace Caisse.Application.Tests.EzCard.Queries;

public class ValiderCaracteresQueryValidatorTests
{
    private readonly ValiderCaracteresQueryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Texte_Is_Valid()
    {
        // Arrange
        var query = new ValiderCaracteresQuery("Hello World", null, false);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_When_Texte_Is_Empty()
    {
        // Arrange
        var query = new ValiderCaracteresQuery("", null, false);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_Texte_Is_Null()
    {
        // Arrange
        var query = new ValiderCaracteresQuery(null!, null, false);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Texte);
    }

    [Theory]
    [InlineData("Test<script>", false)]
    [InlineData("Hello'World", true)]
    [InlineData("Normal text", false)]
    public void Should_Pass_With_Various_Textes(string texte, bool strictMode)
    {
        // Arrange
        var query = new ValiderCaracteresQuery(texte, null, strictMode);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_With_Custom_Forbidden_Chars()
    {
        // Arrange
        var query = new ValiderCaracteresQuery("Test", "XYZ", true);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}

public class ValiderCaracteresQueryHandlerTests
{
    private readonly ValiderCaracteresQueryHandler _handler = new();

    [Fact]
    public async Task Should_Return_Valid_When_No_Forbidden_Chars()
    {
        // Arrange
        var query = new ValiderCaracteresQuery("Hello World", null, false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.IsValid);
        Assert.Empty(result.CaracteresDetectes);
        Assert.Equal("Hello World", result.TexteNettoye);
    }

    [Fact]
    public async Task Should_Detect_Forbidden_Chars_With_Default_List()
    {
        // Arrange
        var query = new ValiderCaracteresQuery("Hello<World>", null, false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains('<', result.CaracteresDetectes);
        Assert.Contains('>', result.CaracteresDetectes);
    }

    [Fact]
    public async Task Should_Replace_With_Space_In_NonStrict_Mode()
    {
        // Arrange
        var query = new ValiderCaracteresQuery("A<B", null, false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Equal("A B", result.TexteNettoye);
    }

    [Fact]
    public async Task Should_Remove_In_Strict_Mode()
    {
        // Arrange
        var query = new ValiderCaracteresQuery("A<B", null, true);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Equal("AB", result.TexteNettoye);
    }

    [Fact]
    public async Task Should_Use_Custom_Forbidden_Chars()
    {
        // Arrange
        var query = new ValiderCaracteresQuery("Hello X World", "X", false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains('X', result.CaracteresDetectes);
    }

    [Fact]
    public async Task Should_Return_Valid_For_Empty_Text()
    {
        // Arrange
        var query = new ValiderCaracteresQuery("", null, false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.IsValid);
        Assert.Equal("Texte vide", result.Message);
    }

    [Theory]
    [InlineData("<script>alert('XSS')</script>")]
    [InlineData("DROP TABLE; --")]
    [InlineData("${cmd}")]
    [InlineData("`rm -rf`")]
    public async Task Should_Detect_Security_Patterns(string dangerousText)
    {
        // Arrange
        var query = new ValiderCaracteresQuery(dangerousText, null, false);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.False(result.IsValid);
        Assert.NotEmpty(result.CaracteresDetectes);
    }
}
