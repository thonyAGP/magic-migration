using Caisse.Application.ChangementCompte.Queries;
using Caisse.Application.Common;
using Moq;
using Xunit;

namespace Caisse.Application.Tests.ChangementCompte;

public class InitChangementCompteQueryTests
{
    private readonly Mock<ICaisseDbContext> _mockContext;

    public InitChangementCompteQueryTests()
    {
        _mockContext = new Mock<ICaisseDbContext>();
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsSuccess()
    {
        // Arrange
        var query = new InitChangementCompteQuery("1", 1000, 1);
        var handler = new InitChangementCompteQueryHandler(_mockContext.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.Found);
        Assert.Equal("Initialization du changement de compte effectuée", result.Message);
        Assert.NotNull(result.Data);
    }

    [Fact]
    public async Task Handle_WithInvalidParameters_HandleException()
    {
        // Arrange
        _mockContext
            .Setup(c => c.GetType())
            .Returns(typeof(ICaisseDbContext));

        var query = new InitChangementCompteQuery("1", -1, 1);
        var handler = new InitChangementCompteQueryHandler(_mockContext.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.False(result.Found);
    }

    [Theory]
    [InlineData("1", 1000, 1)]
    [InlineData("2", 2000, 5)]
    [InlineData("A", 5000, 10)]
    public async Task Handle_WithVariousInputs_ReturnsConsistentResult(
        string societe,
        int codeAdherent,
        int filiation)
    {
        // Arrange
        var query = new InitChangementCompteQuery(societe, codeAdherent, filiation);
        var handler = new InitChangementCompteQueryHandler(_mockContext.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.Found);
        Assert.NotNull(result.Data);
    }
}
