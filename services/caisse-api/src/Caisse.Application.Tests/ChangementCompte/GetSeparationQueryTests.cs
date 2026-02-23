using Caisse.Application.ChangementCompte.Queries;
using Caisse.Application.Common;
using Moq;
using Xunit;

namespace Caisse.Application.Tests.ChangementCompte;

public class GetSeparationQueryTests
{
    private readonly Mock<ICaisseDbContext> _mockContext;

    public GetSeparationQueryTests()
    {
        _mockContext = new Mock<ICaisseDbContext>();
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsSeparationDetails()
    {
        // Arrange
        var query = new GetSeparationQuery("1", 1000, 1);
        var handler = new GetSeparationQueryHandler(_mockContext.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.Found);
        Assert.NotNull(result.Details);
        Assert.Single(result.Details);
        Assert.Equal("Détails de séparation récupérés", result.Message);
    }

    [Fact]
    public async Task Handle_DetailHasCorrectStructure()
    {
        // Arrange
        var query = new GetSeparationQuery("1", 1000, 1);
        var handler = new GetSeparationQueryHandler(_mockContext.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var detail = result.Details.First();
        Assert.Equal(1000, detail.CodeAdherent);
        Assert.Equal(1, detail.Filiation);
        Assert.NotNull(detail.LibelleFiliation);
        Assert.Equal("ACTIVE", detail.Statut);
        Assert.NotNull(detail.ComptesDependants);
    }

    [Theory]
    [InlineData("1", 1000, 1)]
    [InlineData("2", 2000, 5)]
    public async Task Handle_WithVariousParameters_ReturnsValidResults(
        string societe,
        int codeAdherent,
        int filiation)
    {
        // Arrange
        var query = new GetSeparationQuery(societe, codeAdherent, filiation);
        var handler = new GetSeparationQueryHandler(_mockContext.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.Found);
        Assert.NotEmpty(result.Details);
    }
}
