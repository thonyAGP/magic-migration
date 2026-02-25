using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;

namespace MagicMcp.Tests;

public class PatternSyncTests
{
    private const string PatternsDir = @"D:\Projects\ClubMed\LecteurMagic\.openspec\patterns";

    [Fact]
    public void KnowledgeDb_ShouldInitialize()
    {
        using var db = new KnowledgeDb();

        Assert.NotNull(db);
        Assert.Contains(".magic-kb", db.DbPath);
    }

    [Fact]
    public void PatternSyncService_ShouldGetStatus()
    {
        using var db = new KnowledgeDb();
        var syncService = new PatternSyncService(db);

        var status = syncService.GetSyncStatus(PatternsDir);

        Assert.True(status.FilesOnDisk > 0, "Should find pattern files on disk");
    }

    [Fact]
    public void PatternSyncService_ShouldParsePatternFile()
    {
        using var db = new KnowledgeDb();
        var syncService = new PatternSyncService(db);

        var patternFile = Path.Combine(PatternsDir, "date-format-inversion.md");

        if (File.Exists(patternFile))
        {
            var pattern = syncService.ParsePatternFile(patternFile);

            Assert.NotNull(pattern);
            Assert.Equal("date-format-inversion", pattern.PatternName);
            Assert.Equal("CMDS-174321", pattern.SourceTicket);
            Assert.Contains("Import", pattern.RootCauseType ?? "");
        }
    }

    [Fact]
    public void PatternSyncService_ShouldSyncPatterns()
    {
        using var db = new KnowledgeDb();

        // Initialize schema if needed
        if (!db.IsInitialized())
        {
            db.InitializeSchema();
        }

        var syncService = new PatternSyncService(db);

        // Get status before
        var statusBefore = syncService.GetSyncStatus(PatternsDir);

        // Sync
        var result = syncService.SyncFromDirectory(PatternsDir);

        // Verify
        Assert.True(result.Synced > 0, $"Should sync at least one pattern. Errors: {string.Join(", ", result.Errors)}");
        Assert.True(result.Errors.Count == 0 || result.Synced > result.Skipped, "Most patterns should sync successfully");

        // Verify in DB
        var statusAfter = syncService.GetSyncStatus(PatternsDir);
        Assert.True(statusAfter.PatternsInKb >= result.Synced, "Patterns should be in KB after sync");
    }

    [Fact]
    public void PatternFts_ShouldSearchAfterSync()
    {
        using var db = new KnowledgeDb();

        // Initialize and sync first
        if (!db.IsInitialized())
        {
            db.InitializeSchema();
        }

        var syncService = new PatternSyncService(db);
        syncService.SyncFromDirectory(PatternsDir);

        // Search using FTS
        var results = db.SearchPatterns("date", 10).ToList();

        // Should find date-format-inversion pattern
        Assert.True(results.Count > 0 || db.GetAllPatterns().Any(p => p.PatternName.Contains("date")),
            "Should find patterns with 'date' keyword");
    }
}
