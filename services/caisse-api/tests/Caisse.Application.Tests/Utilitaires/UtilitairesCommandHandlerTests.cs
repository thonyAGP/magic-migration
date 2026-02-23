using Caisse.Application.Utilitaires.Commands;
using Xunit;

namespace Caisse.Application.Tests.Utilitaires;

public class UtilitairesCommandHandlerTests
{
    [Fact]
    public async Task InitUtilitaires_Should_Return_Success()
    {
        // Arrange
        var handler = new InitUtilitairesCommandHandler();
        var command = new InitUtilitairesCommand("CS", "ADMIN");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("CS", result.Message.Contains("CS") ? "CS" : "");
        Assert.NotEmpty(result.InitializedComponents);
        Assert.Equal(9, result.InitializedComponents.Count);
    }

    [Fact]
    public async Task BackupConfig_Should_Create_Backup()
    {
        // Arrange
        var handler = new BackupConfigCommandHandler();
        var command = new BackupConfigCommand("CS", "Test Backup", true, true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.NotEmpty(result.BackupId);
        Assert.Contains("BCK_CS_", result.BackupId);
        Assert.NotEmpty(result.BackupPath);
        Assert.Contains(".zip", result.BackupPath);
        Assert.True(result.SizeBytes > 0);
    }

    [Fact]
    public async Task RestoreConfig_Should_Fail_Without_Confirmation()
    {
        // Arrange
        var handler = new RestoreConfigCommandHandler();
        var command = new RestoreConfigCommand("CS", "BCK_CS_20250101", false);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("NOT_CONFIRMED", result.CodeErreur);
    }

    [Fact]
    public async Task RestoreConfig_Should_Succeed_With_Confirmation()
    {
        // Arrange
        var handler = new RestoreConfigCommandHandler();
        var command = new RestoreConfigCommand("CS", "BCK_CS_20250101", true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("BCK_CS_20250101", result.BackupId);
        Assert.True(result.ItemsRestored > 0);
    }

    [Fact]
    public async Task ExportData_Should_Create_Export()
    {
        // Arrange
        var handler = new ExportDataCommandHandler();
        var command = new ExportDataCommand("CS", "CSV", null, null, null, true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.NotEmpty(result.ExportId);
        Assert.Contains("EXP_CS_", result.ExportId);
        Assert.Equal("CSV", result.ExportFormat);
        Assert.Contains(".csv", result.ExportPath);
        Assert.True(result.RowsExported > 0);
    }

    [Fact]
    public async Task ExportData_Should_Support_Multiple_Formats()
    {
        // Arrange
        var handler = new ExportDataCommandHandler();
        var formats = new[] { "CSV", "XML", "JSON", "EXCEL" };

        foreach (var format in formats)
        {
            // Act
            var command = new ExportDataCommand("CS", format);
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.Equal(format, result.ExportFormat);
        }
    }

    [Fact]
    public async Task ImportData_Should_Import_Successfully()
    {
        // Arrange
        var handler = new ImportDataCommandHandler();
        var command = new ImportDataCommand("CS", "/files/data.csv", "CSV", true, true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.NotEmpty(result.ImportId);
        Assert.True(result.RowsImported > 0);
        Assert.True(result.RowsSkipped >= 0);
    }

    [Fact]
    public async Task PurgeData_Should_Fail_Without_Confirmation()
    {
        // Arrange
        var handler = new PurgeDataCommandHandler();
        var command = new PurgeDataCommand("CS", "old_data", 365, false);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("NOT_CONFIRMED", result.CodeErreur);
    }

    [Fact]
    public async Task PurgeData_Should_Succeed_With_Confirmation()
    {
        // Arrange
        var handler = new PurgeDataCommandHandler();
        var command = new PurgeDataCommand("CS", "archive_table", 365, true, true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("archive_table", result.TableName);
        Assert.True(result.RowsDeleted > 0);
        Assert.NotNull(result.BackupId);
    }

    [Fact]
    public async Task MaintenanceDb_Should_Execute_Successfully()
    {
        // Arrange
        var handler = new MaintenanceDbCommandHandler();
        var command = new MaintenanceDbCommand("CS", "FULL", true, true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("FULL", result.MaintenanceType);
        Assert.True(result.TablesProcessed > 0);
        Assert.True(result.ExecutionTimeSeconds > 0);
    }

    [Fact]
    public async Task PrintTicket_Should_Generate_Ticket()
    {
        // Arrange
        var handler = new PrintTicketCommandHandler();
        var items = new List<TicketLineItem>
        {
            new() { CodeArticle = "ART001", DescriptionArticle = "Item 1", Quantite = 1, PrixUnitaire = 10, MontantHT = 10, TauxTVA = 0.2m, MontantTVA = 2 }
        };

        var command = new PrintTicketCommand(
            "CS", "V001", "John Doe", DateTime.Now, 12, 2, items, "CASH", "TKT001", "C01", "ADMIN");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.NotEmpty(result.TicketId);
        Assert.Contains("TKT_CS_", result.TicketId);
        Assert.NotNull(result.PrintedContent);
        Assert.True(result.PrintedContent.Length > 0);
    }
}
