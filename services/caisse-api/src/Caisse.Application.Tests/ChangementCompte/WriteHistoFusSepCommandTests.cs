using Caisse.Application.ChangementCompte.Commands;
using Caisse.Application.Common;
using Moq;
using Xunit;

namespace Caisse.Application.Tests.ChangementCompte;

public class WriteHistoFusSepCommandTests
{
    private readonly Mock<ICaisseDbContext> _mockContext;

    public WriteHistoFusSepCommandTests()
    {
        _mockContext = new Mock<ICaisseDbContext>();
    }

    [Fact]
    public async Task Handle_WithValidCommand_WritesHistorySuccessfully()
    {
        // Arrange
        var command = new WriteHistoFusSepCommand(
            societe: "1",
            typeMiseAJour: "SEPARATION",
            chrono: 12345,
            dateOperation: DateOnly.FromDateTime(DateTime.Now),
            heureOperation: TimeOnly.FromDateTime(DateTime.Now),
            estValide: true);

        var handler = new WriteHistoFusSepCommandHandler(_mockContext.Object);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(12345, result.ChromoEnregistre);
        Assert.Equal("Historique fusion/séparation enregistré avec succès", result.Message);
    }

    [Theory]
    [InlineData("SEPARATION")]
    [InlineData("FUSION")]
    [InlineData("UPDATE")]
    public async Task Handle_WithDifferentTypes_HandlesSuccessfully(string typeUpdate)
    {
        // Arrange
        var command = new WriteHistoFusSepCommand(
            societe: "1",
            typeMiseAJour: typeUpdate,
            chrono: 12345,
            dateOperation: DateOnly.FromDateTime(DateTime.Now),
            heureOperation: TimeOnly.FromDateTime(DateTime.Now),
            estValide: true);

        var handler = new WriteHistoFusSepCommandHandler(_mockContext.Object);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(12345, result.ChromoEnregistre);
    }

    [Fact]
    public async Task Handle_WithMultipleCalls_RecordsAllData()
    {
        // Arrange
        var commands = new[]
        {
            new WriteHistoFusSepCommand("1", "SEPARATION", 100, DateOnly.FromDateTime(DateTime.Now), TimeOnly.FromDateTime(DateTime.Now), true),
            new WriteHistoFusSepCommand("1", "FUSION", 101, DateOnly.FromDateTime(DateTime.Now), TimeOnly.FromDateTime(DateTime.Now), true),
            new WriteHistoFusSepCommand("1", "UPDATE", 102, DateOnly.FromDateTime(DateTime.Now), TimeOnly.FromDateTime(DateTime.Now), true)
        };

        var handler = new WriteHistoFusSepCommandHandler(_mockContext.Object);

        // Act
        var results = new List<WriteHistoFusSepResult>();
        foreach (var cmd in commands)
        {
            var result = await handler.Handle(cmd, CancellationToken.None);
            results.Add(result);
        }

        // Assert
        Assert.Equal(3, results.Count);
        Assert.True(results.All(r => r.Success));
    }
}
