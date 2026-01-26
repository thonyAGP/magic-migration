using System.Text.Json;
using System.Text.RegularExpressions;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Queries;

/// <summary>
/// Service to synchronize resolution patterns from Markdown files to KB
/// </summary>
public class PatternSyncService
{
    private readonly KnowledgeDb _db;

    public PatternSyncService(KnowledgeDb db)
    {
        _db = db;
    }

    /// <summary>
    /// Sync all patterns from a directory of Markdown files
    /// </summary>
    /// <param name="patternsDirectory">Path to .openspec/patterns/ directory</param>
    /// <returns>Sync result with counts</returns>
    public PatternSyncResult SyncFromDirectory(string patternsDirectory)
    {
        var result = new PatternSyncResult();

        if (!Directory.Exists(patternsDirectory))
        {
            result.Errors.Add($"Directory not found: {patternsDirectory}");
            return result;
        }

        var mdFiles = Directory.GetFiles(patternsDirectory, "*.md")
            .Where(f => !Path.GetFileName(f).Equals("README.md", StringComparison.OrdinalIgnoreCase))
            .ToList();

        result.TotalFiles = mdFiles.Count;

        using var tx = _db.BeginTransaction();
        try
        {
            foreach (var file in mdFiles)
            {
                try
                {
                    var pattern = ParsePatternFile(file);
                    if (pattern != null)
                    {
                        UpsertPattern(pattern, tx);
                        result.Synced++;
                        result.SyncedPatterns.Add(pattern.PatternName);
                    }
                    else
                    {
                        result.Skipped++;
                        result.Errors.Add($"Could not parse: {Path.GetFileName(file)}");
                    }
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"{Path.GetFileName(file)}: {ex.Message}");
                    result.Skipped++;
                }
            }

            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }

        return result;
    }

    /// <summary>
    /// Parse a single pattern Markdown file
    /// </summary>
    public DbResolutionPattern? ParsePatternFile(string filePath)
    {
        var content = File.ReadAllText(filePath);
        var fileName = Path.GetFileNameWithoutExtension(filePath);

        // Extract all fields first
        string? sourceTicket = null;
        string? rootCauseType = null;
        string? symptomKeywords = null;
        string? solutionTemplate = null;

        // Extract Source ticket (> **Source**: CMDS-174321)
        var sourceMatch = Regex.Match(content, @"\*\*Source\*\*:\s*(\S+)", RegexOptions.IgnoreCase);
        if (sourceMatch.Success)
        {
            sourceTicket = sourceMatch.Groups[1].Value.Trim();
        }

        // Extract Domain (> **Domaine**: Import / Parsing)
        var domainMatch = Regex.Match(content, @"\*\*Domaine?\*\*:\s*(.+?)(?:\r?\n|$)", RegexOptions.IgnoreCase);
        if (domainMatch.Success)
        {
            rootCauseType = domainMatch.Groups[1].Value.Trim();
        }

        // Extract Symptoms section
        var symptomsMatch = Regex.Match(content, @"##\s*Sympt[oô]mes?\s+typiques?\s*\r?\n([\s\S]*?)(?=\r?\n##|\z)", RegexOptions.IgnoreCase);
        var keywords = new List<string>();
        if (symptomsMatch.Success)
        {
            keywords = ExtractListItems(symptomsMatch.Groups[1].Value);
        }

        // Extract Keywords from Detection section
        var keywordsMatch = Regex.Match(content, @"###?\s*Mots[- ]cl[eé]s.*?\r?\n([\s\S]*?)(?=\r?\n###|\r?\n##|\z)", RegexOptions.IgnoreCase);
        if (keywordsMatch.Success)
        {
            var detectionKeywords = ExtractListItems(keywordsMatch.Groups[1].Value);
            keywords.AddRange(detectionKeywords);
        }

        if (keywords.Count > 0)
        {
            symptomKeywords = JsonSerializer.Serialize(keywords.Distinct().ToList());
        }

        // Extract Solution section
        var solutionMatch = Regex.Match(content, @"##\s*Solution\s+type\s*\r?\n([\s\S]*?)(?=\r?\n##|\z)", RegexOptions.IgnoreCase);
        if (solutionMatch.Success)
        {
            solutionTemplate = solutionMatch.Groups[1].Value.Trim();
        }
        else
        {
            // Try alternative: Cause racine typique section
            var causeMatch = Regex.Match(content, @"##\s*Cause\s+racine\s+typique\s*\r?\n([\s\S]*?)(?=\r?\n##|\z)", RegexOptions.IgnoreCase);
            if (causeMatch.Success)
            {
                solutionTemplate = causeMatch.Groups[1].Value.Trim();
            }
        }

        // Validate we have minimum required fields
        if (string.IsNullOrEmpty(fileName))
        {
            return null;
        }

        // Create pattern with object initializer (required for records with init properties)
        return new DbResolutionPattern
        {
            PatternName = fileName,
            SourceTicket = sourceTicket,
            RootCauseType = rootCauseType,
            SymptomKeywords = symptomKeywords,
            SolutionTemplate = solutionTemplate
        };
    }

    private void UpsertPattern(DbResolutionPattern pattern, Microsoft.Data.Sqlite.SqliteTransaction tx)
    {
        // Check if pattern exists
        var existing = _db.GetPattern(pattern.PatternName);

        if (existing != null)
        {
            // Update existing pattern (preserve usage_count)
            _db.ExecuteNonQuery(@"
                UPDATE resolution_patterns
                SET symptom_keywords = @keywords,
                    root_cause_type = @cause,
                    solution_template = @solution,
                    source_ticket = @ticket
                WHERE pattern_name = @name",
                new Dictionary<string, object?>
                {
                    ["@name"] = pattern.PatternName,
                    ["@keywords"] = pattern.SymptomKeywords,
                    ["@cause"] = pattern.RootCauseType,
                    ["@solution"] = pattern.SolutionTemplate,
                    ["@ticket"] = pattern.SourceTicket
                }, tx);
        }
        else
        {
            // Insert new pattern
            _db.InsertPattern(pattern, tx);
        }
    }

    private static List<string> ExtractListItems(string content)
    {
        var items = new List<string>();
        var lines = content.Split('\n');

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (trimmed.StartsWith("-") || trimmed.StartsWith("*"))
            {
                var item = trimmed.TrimStart('-', '*', ' ').Trim();
                if (!string.IsNullOrEmpty(item) && !item.StartsWith("["))
                {
                    // Clean up quotes and special chars
                    item = item.Trim('"', '\'');
                    items.Add(item);
                }
            }
        }

        return items;
    }

    /// <summary>
    /// Get sync status (patterns in KB vs files)
    /// </summary>
    public PatternSyncStatus GetSyncStatus(string patternsDirectory)
    {
        // Count files
        int filesOnDisk = 0;
        if (Directory.Exists(patternsDirectory))
        {
            filesOnDisk = Directory.GetFiles(patternsDirectory, "*.md")
                .Count(f => !Path.GetFileName(f).Equals("README.md", StringComparison.OrdinalIgnoreCase));
        }

        // Count in KB
        var patternsInKb = _db.GetAllPatterns().Select(p => p.PatternName).ToHashSet();
        var patternsInKbCount = patternsInKb.Count;

        // Get details
        var missingInKb = new List<string>();
        var extraInKb = new List<string>();

        if (Directory.Exists(patternsDirectory))
        {
            var filesOnDiskSet = Directory.GetFiles(patternsDirectory, "*.md")
                .Where(f => !Path.GetFileName(f).Equals("README.md", StringComparison.OrdinalIgnoreCase))
                .Select(f => Path.GetFileNameWithoutExtension(f))
                .ToHashSet();

            missingInKb = filesOnDiskSet.Except(patternsInKb).ToList();
            extraInKb = patternsInKb.Except(filesOnDiskSet).ToList();
        }

        var isSynced = missingInKb.Count == 0 && extraInKb.Count == 0;

        return new PatternSyncStatus
        {
            FilesOnDisk = filesOnDisk,
            PatternsInKb = patternsInKbCount,
            MissingInKb = missingInKb,
            ExtraInKb = extraInKb,
            IsSynced = isSynced
        };
    }

    /// <summary>
    /// Rebuild FTS5 index for patterns (manual rebuild if needed)
    /// </summary>
    public void RebuildFtsIndex()
    {
        // Delete all from FTS
        _db.ExecuteNonQuery("DELETE FROM patterns_fts");

        // Reinsert all patterns
        _db.ExecuteNonQuery(@"
            INSERT INTO patterns_fts(rowid, pattern_name, symptom_keywords, solution_template)
            SELECT id, pattern_name, symptom_keywords, solution_template
            FROM resolution_patterns");
    }
}

/// <summary>
/// Result of pattern sync operation
/// </summary>
public record PatternSyncResult
{
    public int TotalFiles { get; set; }
    public int Synced { get; set; }
    public int Skipped { get; set; }
    public List<string> SyncedPatterns { get; } = new();
    public List<string> Errors { get; } = new();

    public bool Success => Errors.Count == 0;
}

/// <summary>
/// Status of pattern synchronization
/// </summary>
public record PatternSyncStatus
{
    public int FilesOnDisk { get; init; }
    public int PatternsInKb { get; init; }
    public List<string> MissingInKb { get; init; } = new();
    public List<string> ExtraInKb { get; init; } = new();
    public bool IsSynced { get; init; }
}
