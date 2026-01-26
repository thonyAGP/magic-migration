using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Pattern feedback loop - connect ticket resolutions to resolution patterns
/// </summary>
[McpServerToolType]
public static class PatternFeedbackTool
{
    [McpServerTool(Name = "magic_pattern_search")]
    [Description("Search resolution patterns by symptom keywords. Returns ranked matches from the Knowledge Base.")]
    public static string SearchPatterns(
        KnowledgeDb db,
        [Description("Keywords to search (e.g., 'date format incorrect')")] string keywords,
        [Description("Maximum results (default: 5)")] int limit = 5)
    {
        if (string.IsNullOrWhiteSpace(keywords))
        {
            return "ERROR: Keywords required";
        }

        var sb = new StringBuilder();
        sb.AppendLine("## Pattern Search Results");
        sb.AppendLine();
        sb.AppendLine($"Query: `{keywords}`");
        sb.AppendLine();

        // First try FTS search
        var resultList = db.SearchPatterns(keywords, limit).ToList();

        if (resultList.Count == 0)
        {
            // Fallback: get all patterns and filter manually
            var allPatterns = db.GetAllPatterns()
                .Where(p => p.SymptomKeywords?.Contains(keywords, StringComparison.OrdinalIgnoreCase) == true
                         || p.PatternName.Contains(keywords, StringComparison.OrdinalIgnoreCase)
                         || p.RootCauseType?.Contains(keywords, StringComparison.OrdinalIgnoreCase) == true)
                .Take(limit);

            foreach (var p in allPatterns)
            {
                resultList.Add(new PatternSearchResult
                {
                    PatternId = p.Id,
                    PatternName = p.PatternName,
                    RootCauseType = p.RootCauseType,
                    SourceTicket = p.SourceTicket,
                    UsageCount = p.UsageCount,
                    Score = 0
                });
            }
        }

        if (resultList.Count == 0)
        {
            sb.AppendLine("*No matching patterns found.*");
            sb.AppendLine();
            sb.AppendLine("> **Tip**: Use `/ticket-learn` after resolving a ticket to capitalize the resolution as a new pattern.");
            return sb.ToString();
        }

        sb.AppendLine("| Pattern | Type | Source | Usage | Score |");
        sb.AppendLine("|---------|------|--------|-------|-------|");

        foreach (var result in resultList)
        {
            var causeDisplay = result.RootCauseType ?? "-";
            var sourceDisplay = result.SourceTicket ?? "-";
            var scoreDisplay = result.Score != 0 ? $"{result.Score:F2}" : "-";
            sb.AppendLine($"| **{result.PatternName}** | {causeDisplay} | {sourceDisplay} | {result.UsageCount} | {scoreDisplay} |");
        }

        sb.AppendLine();
        sb.AppendLine($"Found {resultList.Count} pattern(s).");

        // Show top pattern details if exists
        if (resultList.Count > 0)
        {
            var topPattern = db.GetPattern(resultList[0].PatternName);
            if (topPattern != null && !string.IsNullOrWhiteSpace(topPattern.SolutionTemplate))
            {
                sb.AppendLine();
                sb.AppendLine($"### Top Match: {topPattern.PatternName}");
                sb.AppendLine();
                sb.AppendLine("**Solution Template:**");
                sb.AppendLine("```");
                sb.AppendLine(topPattern.SolutionTemplate.Length > 500
                    ? topPattern.SolutionTemplate[..500] + "..."
                    : topPattern.SolutionTemplate);
                sb.AppendLine("```");
            }
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_pattern_stats")]
    [Description("Get statistics about resolution patterns usage: most used patterns, success rate, coverage.")]
    public static string GetPatternStats(KnowledgeDb db)
    {
        var sb = new StringBuilder();
        sb.AppendLine("## Resolution Patterns Statistics");
        sb.AppendLine();

        var allPatterns = db.GetAllPatterns().ToList();
        var totalPatterns = allPatterns.Count;
        var totalUsage = allPatterns.Sum(p => p.UsageCount);
        var usedPatterns = allPatterns.Count(p => p.UsageCount > 0);

        sb.AppendLine("### Overview");
        sb.AppendLine();
        sb.AppendLine("| Metric | Value |");
        sb.AppendLine("|--------|-------|");
        sb.AppendLine($"| Total Patterns | {totalPatterns} |");
        sb.AppendLine($"| Patterns Used | {usedPatterns} |");
        sb.AppendLine($"| Total Usage | {totalUsage} |");
        sb.AppendLine($"| Coverage | {(totalPatterns > 0 ? (usedPatterns * 100.0 / totalPatterns) : 0):F1}% |");

        if (allPatterns.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("### Top Patterns (by usage)");
            sb.AppendLine();
            sb.AppendLine("| Pattern | Type | Usage | Last Used | Source |");
            sb.AppendLine("|---------|------|-------|-----------|--------|");

            foreach (var p in allPatterns.OrderByDescending(x => x.UsageCount).Take(10))
            {
                var lastUsed = p.LastUsedAt?.ToString("yyyy-MM-dd") ?? "never";
                var causeType = p.RootCauseType ?? "-";
                var source = p.SourceTicket ?? "-";
                sb.AppendLine($"| **{p.PatternName}** | {causeType} | {p.UsageCount} | {lastUsed} | {source} |");
            }

            // Unused patterns
            var unused = allPatterns.Where(p => p.UsageCount == 0).ToList();
            if (unused.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine($"### Unused Patterns ({unused.Count})");
                sb.AppendLine();
                sb.AppendLine(string.Join(", ", unused.Select(p => p.PatternName)));
            }

            // By root cause type
            var byType = allPatterns
                .Where(p => !string.IsNullOrEmpty(p.RootCauseType))
                .GroupBy(p => p.RootCauseType)
                .OrderByDescending(g => g.Sum(p => p.UsageCount));

            if (byType.Any())
            {
                sb.AppendLine();
                sb.AppendLine("### By Root Cause Type");
                sb.AppendLine();
                sb.AppendLine("| Type | Patterns | Total Usage |");
                sb.AppendLine("|------|----------|-------------|");

                foreach (var g in byType)
                {
                    sb.AppendLine($"| {g.Key} | {g.Count()} | {g.Sum(p => p.UsageCount)} |");
                }
            }
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_pattern_link")]
    [Description("View the link between tickets and patterns - which tickets used which patterns.")]
    public static string GetTicketPatternLinks(
        KnowledgeDb db,
        [Description("Filter by pattern name (optional)")] string? patternName = null,
        [Description("Filter by ticket key (optional)")] string? ticketKey = null)
    {
        var sb = new StringBuilder();
        sb.AppendLine("## Ticket-Pattern Links");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();

        if (!string.IsNullOrEmpty(ticketKey))
        {
            cmd.CommandText = @"
                SELECT ticket_key, project, pattern_matched, phases_completed, success,
                       resolution_time_minutes, completed_at
                FROM ticket_metrics
                WHERE ticket_key = @key";
            cmd.Parameters.AddWithValue("@key", ticketKey);
        }
        else if (!string.IsNullOrEmpty(patternName))
        {
            cmd.CommandText = @"
                SELECT ticket_key, project, pattern_matched, phases_completed, success,
                       resolution_time_minutes, completed_at
                FROM ticket_metrics
                WHERE pattern_matched = @pattern
                ORDER BY completed_at DESC
                LIMIT 20";
            cmd.Parameters.AddWithValue("@pattern", patternName);
        }
        else
        {
            cmd.CommandText = @"
                SELECT ticket_key, project, pattern_matched, phases_completed, success,
                       resolution_time_minutes, completed_at
                FROM ticket_metrics
                WHERE pattern_matched IS NOT NULL
                ORDER BY completed_at DESC
                LIMIT 20";
        }

        var tickets = new List<(string Key, string? Project, string? Pattern, int Phases, int Success, int? Time, string? Completed)>();

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                tickets.Add((
                    reader.GetString(0),
                    reader.IsDBNull(1) ? null : reader.GetString(1),
                    reader.IsDBNull(2) ? null : reader.GetString(2),
                    reader.GetInt32(3),
                    reader.GetInt32(4),
                    reader.IsDBNull(5) ? null : reader.GetInt32(5),
                    reader.IsDBNull(6) ? null : reader.GetString(6)
                ));
            }
        }

        if (tickets.Count == 0)
        {
            sb.AppendLine("*No ticket-pattern links found.*");
            sb.AppendLine();
            sb.AppendLine("> The feedback loop connects ticket resolutions to patterns automatically.");
            sb.AppendLine("> When you run the pipeline, matched patterns are recorded in ticket_metrics.");
            return sb.ToString();
        }

        sb.AppendLine("| Ticket | Project | Pattern | Phases | Status | Time |");
        sb.AppendLine("|--------|---------|---------|--------|--------|------|");

        foreach (var t in tickets)
        {
            var status = t.Success == 1 ? "✅ Resolved" : "⏳ Open";
            var time = t.Time.HasValue ? $"{t.Time}m" : "-";
            var pattern = t.Pattern ?? "-";
            var project = t.Project ?? "-";
            sb.AppendLine($"| {t.Key} | {project} | {pattern} | {t.Phases}/6 | {status} | {time} |");
        }

        sb.AppendLine();
        sb.AppendLine($"Showing {tickets.Count} ticket(s).");

        // Summary
        var resolved = tickets.Count(t => t.Success == 1);
        var avgTime = tickets.Where(t => t.Time.HasValue && t.Success == 1).Select(t => t.Time!.Value).DefaultIfEmpty(0).Average();

        sb.AppendLine();
        sb.AppendLine("### Summary");
        sb.AppendLine($"- Resolved: {resolved}/{tickets.Count} ({(tickets.Count > 0 ? resolved * 100.0 / tickets.Count : 0):F0}%)");
        sb.AppendLine($"- Avg resolution time: {avgTime:F0} minutes");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_pattern_feedback")]
    [Description("Get the feedback loop status: how well patterns are being reused across tickets.")]
    public static string GetFeedbackLoopStatus(KnowledgeDb db)
    {
        var sb = new StringBuilder();
        sb.AppendLine("## Feedback Loop Status");
        sb.AppendLine();

        // Get pattern stats
        var patterns = db.GetAllPatterns().ToList();
        var totalPatterns = patterns.Count;
        var usedPatterns = patterns.Count(p => p.UsageCount > 0);

        // Get ticket stats
        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN pattern_matched IS NOT NULL THEN 1 ELSE 0 END) as with_pattern,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as resolved,
                AVG(CASE WHEN success = 1 THEN resolution_time_minutes END) as avg_time
            FROM ticket_metrics";

        int totalTickets = 0, ticketsWithPattern = 0, resolvedTickets = 0;
        double avgTime = 0;

        using (var reader = cmd.ExecuteReader())
        {
            if (reader.Read())
            {
                totalTickets = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
                ticketsWithPattern = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
                resolvedTickets = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
                avgTime = reader.IsDBNull(3) ? 0 : reader.GetDouble(3);
            }
        }

        sb.AppendLine("### Pattern Reuse");
        sb.AppendLine();
        sb.AppendLine("| Metric | Value | Target |");
        sb.AppendLine("|--------|-------|--------|");
        sb.AppendLine($"| Patterns in KB | {totalPatterns} | 20+ |");
        sb.AppendLine($"| Patterns used | {usedPatterns} ({(totalPatterns > 0 ? usedPatterns * 100.0 / totalPatterns : 0):F0}%) | 80% |");
        sb.AppendLine($"| Tickets tracked | {totalTickets} | - |");
        sb.AppendLine($"| Tickets with pattern | {ticketsWithPattern} ({(totalTickets > 0 ? ticketsWithPattern * 100.0 / totalTickets : 0):F0}%) | 60% |");
        sb.AppendLine($"| Resolved | {resolvedTickets} ({(totalTickets > 0 ? resolvedTickets * 100.0 / totalTickets : 0):F0}%) | 80% |");
        sb.AppendLine($"| Avg resolution time | {avgTime:F0}m | <30m |");

        // Calculate feedback loop health score
        var patternCoverage = totalPatterns > 0 ? usedPatterns * 100.0 / totalPatterns : 0;
        var ticketCoverage = totalTickets > 0 ? ticketsWithPattern * 100.0 / totalTickets : 0;
        var successRate = totalTickets > 0 ? resolvedTickets * 100.0 / totalTickets : 0;

        var healthScore = (patternCoverage * 0.3 + ticketCoverage * 0.4 + successRate * 0.3);

        sb.AppendLine();
        sb.AppendLine("### Feedback Loop Health");
        sb.AppendLine();

        string healthStatus;
        string healthIcon;
        if (healthScore >= 70)
        {
            healthStatus = "EXCELLENT - Patterns are being reused effectively";
            healthIcon = "🟢";
        }
        else if (healthScore >= 50)
        {
            healthStatus = "GOOD - Room for improvement in pattern reuse";
            healthIcon = "🟡";
        }
        else if (healthScore >= 30)
        {
            healthStatus = "DEVELOPING - More patterns need to be capitalized";
            healthIcon = "🟠";
        }
        else
        {
            healthStatus = "STARTING - Begin capitalizing resolutions with /ticket-learn";
            healthIcon = "🔴";
        }

        sb.AppendLine($"**Score: {healthScore:F0}/100** {healthIcon}");
        sb.AppendLine();
        sb.AppendLine($"> {healthStatus}");

        // Recommendations
        sb.AppendLine();
        sb.AppendLine("### Recommendations");
        sb.AppendLine();

        if (totalPatterns < 10)
        {
            sb.AppendLine("- 📝 Add more patterns using `/ticket-learn` after resolving tickets");
        }
        if (patternCoverage < 50)
        {
            sb.AppendLine("- 🔄 Review unused patterns - they may need better keywords");
        }
        if (ticketCoverage < 40)
        {
            sb.AppendLine("- 🔍 Run pipeline more often to match tickets with patterns");
        }
        if (healthScore >= 70)
        {
            sb.AppendLine("- ✅ Keep capitalizing resolutions to maintain the feedback loop");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_pattern_sync")]
    [Description("Synchronize resolution patterns from Markdown files (.openspec/patterns/) to the Knowledge Base. Run this after adding or modifying pattern files.")]
    public static string SyncPatterns(
        KnowledgeDb db,
        [Description("Path to patterns directory (default: .openspec/patterns/)")] string? patternsPath = null)
    {
        var sb = new StringBuilder();
        sb.AppendLine("## Pattern Synchronization");
        sb.AppendLine();

        // Determine patterns directory
        var workingDir = Environment.CurrentDirectory;
        var defaultPath = Path.Combine(workingDir, ".openspec", "patterns");
        var actualPath = patternsPath ?? defaultPath;

        sb.AppendLine($"**Source:** `{actualPath}`");
        sb.AppendLine();

        if (!Directory.Exists(actualPath))
        {
            sb.AppendLine($"❌ **ERROR:** Directory not found: `{actualPath}`");
            sb.AppendLine();
            sb.AppendLine("Make sure the patterns directory exists and contains .md files.");
            return sb.ToString();
        }

        // Get status before sync
        var syncService = new PatternSyncService(db);
        var statusBefore = syncService.GetSyncStatus(actualPath);

        sb.AppendLine("### Before Sync");
        sb.AppendLine($"- Files on disk: {statusBefore.FilesOnDisk}");
        sb.AppendLine($"- Patterns in KB: {statusBefore.PatternsInKb}");

        if (statusBefore.MissingInKb.Count > 0)
        {
            sb.AppendLine($"- Missing in KB: {string.Join(", ", statusBefore.MissingInKb)}");
        }

        sb.AppendLine();

        // Perform sync
        try
        {
            var result = syncService.SyncFromDirectory(actualPath);

            sb.AppendLine("### Sync Result");
            sb.AppendLine();

            if (result.Success)
            {
                sb.AppendLine($"✅ **Synced {result.Synced} pattern(s) successfully**");
            }
            else
            {
                sb.AppendLine($"⚠️ Synced {result.Synced} pattern(s) with {result.Errors.Count} error(s)");
            }

            sb.AppendLine();
            sb.AppendLine($"- Total files: {result.TotalFiles}");
            sb.AppendLine($"- Synced: {result.Synced}");
            sb.AppendLine($"- Skipped: {result.Skipped}");

            if (result.SyncedPatterns.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("**Synced patterns:**");
                foreach (var pattern in result.SyncedPatterns)
                {
                    sb.AppendLine($"- {pattern}");
                }
            }

            if (result.Errors.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("**Errors:**");
                foreach (var error in result.Errors)
                {
                    sb.AppendLine($"- ⚠️ {error}");
                }
            }

            // Get status after sync
            var statusAfter = syncService.GetSyncStatus(actualPath);

            sb.AppendLine();
            sb.AppendLine("### After Sync");
            sb.AppendLine($"- Files on disk: {statusAfter.FilesOnDisk}");
            sb.AppendLine($"- Patterns in KB: {statusAfter.PatternsInKb}");
            sb.AppendLine($"- Synchronized: {(statusAfter.IsSynced ? "✅ Yes" : "❌ No")}");

            // FTS index info
            sb.AppendLine();
            sb.AppendLine("> **Note:** FTS5 index is updated automatically via triggers.");
            sb.AppendLine("> Use `magic_pattern_search` to search patterns by keywords.");
        }
        catch (Exception ex)
        {
            sb.AppendLine($"❌ **ERROR:** {ex.Message}");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_pattern_status")]
    [Description("Check synchronization status between pattern Markdown files and Knowledge Base.")]
    public static string GetSyncStatus(
        KnowledgeDb db,
        [Description("Path to patterns directory (default: .openspec/patterns/)")] string? patternsPath = null)
    {
        var sb = new StringBuilder();
        sb.AppendLine("## Pattern Sync Status");
        sb.AppendLine();

        var workingDir = Environment.CurrentDirectory;
        var defaultPath = Path.Combine(workingDir, ".openspec", "patterns");
        var actualPath = patternsPath ?? defaultPath;

        sb.AppendLine($"**Source:** `{actualPath}`");
        sb.AppendLine();

        if (!Directory.Exists(actualPath))
        {
            sb.AppendLine($"❌ Directory not found: `{actualPath}`");
            return sb.ToString();
        }

        var syncService = new PatternSyncService(db);
        var status = syncService.GetSyncStatus(actualPath);

        sb.AppendLine("| Metric | Value |");
        sb.AppendLine("|--------|-------|");
        sb.AppendLine($"| Files on disk | {status.FilesOnDisk} |");
        sb.AppendLine($"| Patterns in KB | {status.PatternsInKb} |");
        sb.AppendLine($"| Synchronized | {(status.IsSynced ? "✅ Yes" : "❌ No")} |");

        if (status.MissingInKb.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine($"### Missing in KB ({status.MissingInKb.Count})");
            sb.AppendLine("These patterns exist as files but are not in the Knowledge Base:");
            foreach (var p in status.MissingInKb)
            {
                sb.AppendLine($"- `{p}.md`");
            }
            sb.AppendLine();
            sb.AppendLine("> Run `magic_pattern_sync` to import these patterns.");
        }

        if (status.ExtraInKb.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine($"### Extra in KB ({status.ExtraInKb.Count})");
            sb.AppendLine("These patterns exist in KB but have no corresponding file:");
            foreach (var p in status.ExtraInKb)
            {
                sb.AppendLine($"- `{p}`");
            }
        }

        if (status.IsSynced)
        {
            sb.AppendLine();
            sb.AppendLine("✅ **All patterns are synchronized.**");
        }

        return sb.ToString();
    }
}
