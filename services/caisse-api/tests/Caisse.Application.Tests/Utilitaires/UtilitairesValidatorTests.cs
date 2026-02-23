using Caisse.Application.Utilitaires.Commands;
using FluentValidation.TestHelper;
using Xunit;

namespace Caisse.Application.Tests.Utilitaires;

public class UtilitairesValidatorTests
{
    [Fact]
    public void InitUtilitairesCommandValidator_Should_Pass_With_Valid_Data()
    {
        // Arrange
        var validator = new InitUtilitairesCommandValidator();
        var command = new InitUtilitairesCommand("CS", "ADMIN");

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void InitUtilitairesCommandValidator_Should_Fail_Empty_Societe(string? societe)
    {
        // Arrange
        var validator = new InitUtilitairesCommandValidator();
        var command = new InitUtilitairesCommand(societe ?? "", "ADMIN");

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void BackupConfigCommandValidator_Should_Pass_With_Valid_Data()
    {
        // Arrange
        var validator = new BackupConfigCommandValidator();
        var command = new BackupConfigCommand("CS", "Test Backup", true, true);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void BackupConfigCommandValidator_Should_Fail_Without_Societe()
    {
        // Arrange
        var validator = new BackupConfigCommandValidator();
        var command = new BackupConfigCommand("", "Test");

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Societe);
    }

    [Fact]
    public void RestoreConfigCommandValidator_Should_Pass_With_Valid_Data()
    {
        // Arrange
        var validator = new RestoreConfigCommandValidator();
        var command = new RestoreConfigCommand("CS", "BCK_CS_20250101", true);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void RestoreConfigCommandValidator_Should_Fail_Without_Confirmation()
    {
        // Arrange
        var validator = new RestoreConfigCommandValidator();
        var command = new RestoreConfigCommand("CS", "BCK_CS_20250101", false);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ConfirmRestore);
    }

    [Theory]
    [InlineData("CSV")]
    [InlineData("XML")]
    [InlineData("JSON")]
    [InlineData("EXCEL")]
    public void ExportDataCommandValidator_Should_Pass_With_Valid_Format(string format)
    {
        // Arrange
        var validator = new ExportDataCommandValidator();
        var command = new ExportDataCommand("CS", format);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ExportDataCommandValidator_Should_Fail_With_Invalid_Format()
    {
        // Arrange
        var validator = new ExportDataCommandValidator();
        var command = new ExportDataCommand("CS", "INVALID");

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ExportFormat);
    }

    [Fact]
    public void ExportDataCommandValidator_Should_Fail_When_DateDebut_After_DateFin()
    {
        // Arrange
        var validator = new ExportDataCommandValidator();
        var now = DateTime.Now;
        var command = new ExportDataCommand("CS", "CSV", null, now.AddDays(1), now);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.DateDebut);
    }

    [Fact]
    public void ImportDataCommandValidator_Should_Pass_With_Valid_Data()
    {
        // Arrange
        var validator = new ImportDataCommandValidator();
        var command = new ImportDataCommand("CS", "/files/data.csv", "CSV");

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void ImportDataCommandValidator_Should_Fail_Empty_FilePath(string? filePath)
    {
        // Arrange
        var validator = new ImportDataCommandValidator();
        var command = new ImportDataCommand("CS", filePath ?? "", "CSV");

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.FilePath);
    }

    [Fact]
    public void PurgeDataCommandValidator_Should_Pass_With_Valid_Data()
    {
        // Arrange
        var validator = new PurgeDataCommandValidator();
        var command = new PurgeDataCommand("CS", "archive_table", 365, true);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void PurgeDataCommandValidator_Should_Fail_Without_Confirmation()
    {
        // Arrange
        var validator = new PurgeDataCommandValidator();
        var command = new PurgeDataCommand("CS", "archive_table", 365, false);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ConfirmPurge);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void PurgeDataCommandValidator_Should_Fail_With_Invalid_RetentionDays(int days)
    {
        // Arrange
        var validator = new PurgeDataCommandValidator();
        var command = new PurgeDataCommand("CS", "archive_table", days, true);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RetentionDays);
    }

    [Theory]
    [InlineData("FULL")]
    [InlineData("ANALYZE")]
    [InlineData("REBUILD")]
    [InlineData("OPTIMIZE")]
    public void MaintenanceDbCommandValidator_Should_Pass_With_Valid_Type(string type)
    {
        // Arrange
        var validator = new MaintenanceDbCommandValidator();
        var command = new MaintenanceDbCommand("CS", type);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void MaintenanceDbCommandValidator_Should_Fail_With_Invalid_Type()
    {
        // Arrange
        var validator = new MaintenanceDbCommandValidator();
        var command = new MaintenanceDbCommand("CS", "INVALID");

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.MaintenanceType);
    }

    [Fact]
    public void PrintTicketCommandValidator_Should_Pass_With_Valid_Data()
    {
        // Arrange
        var validator = new PrintTicketCommandValidator();
        var items = new List<TicketLineItem>
        {
            new() { CodeArticle = "ART001", DescriptionArticle = "Item", Quantite = 1, PrixUnitaire = 10, MontantHT = 10 }
        };
        var command = new PrintTicketCommand("CS", "V001", "John", DateTime.Now, 10, 0, items, "CASH");

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void PrintTicketCommandValidator_Should_Fail_Empty_Items()
    {
        // Arrange
        var validator = new PrintTicketCommandValidator();
        var command = new PrintTicketCommand("CS", "V001", "John", DateTime.Now, 10, 0, new(), "CASH");

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Items);
    }
}
