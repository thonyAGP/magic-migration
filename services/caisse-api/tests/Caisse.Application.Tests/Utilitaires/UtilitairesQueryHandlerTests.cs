using Caisse.Application.Utilitaires.Queries;
using Xunit;

namespace Caisse.Application.Tests.Utilitaires;

public class UtilitairesQueryHandlerTests
{
    [Fact]
    public async Task GetLogViewer_Should_Return_Logs()
    {
        // Arrange
        var handler = new GetLogViewerQueryHandler();
        var query = new GetLogViewerQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.Found);
        Assert.NotEmpty(result.Logs);
        Assert.True(result.TotalLogsCount > 0);
        Assert.True(result.DisplayedLogsCount > 0);
    }

    [Fact]
    public async Task GetLogViewer_Should_Filter_By_Level()
    {
        // Arrange
        var handler = new GetLogViewerQueryHandler();
        var query = new GetLogViewerQuery(LevelFilter: "ERROR");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.Found);
        foreach (var log in result.Logs)
        {
            Assert.Equal("ERROR", log.Level);
        }
    }

    [Fact]
    public async Task GetLogViewer_Should_Filter_By_DateRange()
    {
        // Arrange
        var handler = new GetLogViewerQueryHandler();
        var now = DateTime.UtcNow;
        var query = new GetLogViewerQuery(DateDebut: now.AddHours(-1), DateFin: now);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        foreach (var log in result.Logs)
        {
            Assert.True(log.Timestamp >= now.AddHours(-1));
            Assert.True(log.Timestamp <= now);
        }
    }

    [Fact]
    public async Task GetLogViewer_Should_Respect_Limit()
    {
        // Arrange
        var handler = new GetLogViewerQueryHandler();
        var query = new GetLogViewerQuery(Limit: 2);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.DisplayedLogsCount <= 2);
    }

    [Fact]
    public async Task GetSystemInfo_Should_Return_System_Information()
    {
        // Arrange
        var handler = new GetSystemInfoQueryHandler();
        var query = new GetSystemInfoQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Application);
        Assert.NotNull(result.Database);
        Assert.NotNull(result.SystemHealth);
        Assert.NotEmpty(result.Configuration);
    }

    [Fact]
    public async Task GetSystemInfo_Application_Should_Have_Required_Fields()
    {
        // Arrange
        var handler = new GetSystemInfoQueryHandler();
        var query = new GetSystemInfoQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var app = result.Application;
        Assert.NotEmpty(app.Version);
        Assert.NotEmpty(app.Environment);
        Assert.NotEmpty(app.Framework);
        Assert.NotEmpty(app.RuntimeVersion);
        Assert.True(app.Uptime.TotalSeconds > 0);
    }

    [Fact]
    public async Task GetSystemInfo_Database_Should_Have_Required_Fields()
    {
        // Arrange
        var handler = new GetSystemInfoQueryHandler();
        var query = new GetSystemInfoQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var db = result.Database;
        Assert.NotEmpty(db.ServerName);
        Assert.NotEmpty(db.DatabaseName);
        Assert.True(db.SizeBytes > 0);
        Assert.True(db.TablesCount > 0);
        Assert.NotEmpty(db.ConnectionStatus);
    }

    [Fact]
    public async Task GetSystemInfo_SystemHealth_Should_Have_Metrics()
    {
        // Arrange
        var handler = new GetSystemInfoQueryHandler();
        var query = new GetSystemInfoQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var health = result.SystemHealth;
        Assert.True(health.CpuUsagePercent >= 0 && health.CpuUsagePercent <= 100);
        Assert.True(health.MemoryUsagePercent >= 0 && health.MemoryUsagePercent <= 100);
        Assert.True(health.TotalMemoryBytes > 0);
        Assert.True(health.DiskUsagePercent >= 0 && health.DiskUsagePercent <= 100);
    }

    [Fact]
    public async Task GetSystemInfo_Configuration_Should_Have_Expected_Keys()
    {
        // Arrange
        var handler = new GetSystemInfoQueryHandler();
        var query = new GetSystemInfoQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var config = result.Configuration;
        Assert.Contains("DatabaseProvider", config.Keys);
        Assert.Contains("LogLevel", config.Keys);
        Assert.Contains("CacheStrategy", config.Keys);
        Assert.Contains("MaxConnections", config.Keys);
    }
}
