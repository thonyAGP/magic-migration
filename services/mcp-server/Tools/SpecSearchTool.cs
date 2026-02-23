using System.ComponentModel;
using System.Text.Json;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class SpecSearchTool
{
    [McpServerTool(Name = "magic_spec_search")]
    [Description(@"Search across all program specifications. Supports filters:
- table:849 or table:cafil001 - Find programs using specific table
- access:W - Find programs with write access to any table
- type:Online or type:Batch - Filter by program type
- Free text search in titles/descriptions

Examples:
- magic_spec_search table:849 access:W
- magic_spec_search table:stat_lieu_vente
- magic_spec_search vente")]
    public static string SearchSpecs(
        [Description("Search query with optional filters (table:, access:, type:)")] string query)
    {
        var openspecPath = FindOpenspecPath();
        if (openspecPath == null)
            return "ERROR: .openspec folder not found";

        var parser = new SpecParserService(openspecPath);
        var results = parser.SearchSpecs(query);

        if (results.Count == 0)
            return $"No specs found matching: {query}";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"## Found {results.Count} specs matching: `{query}`");
        sb.AppendLine();
        sb.AppendLine("| Program | Title | Type | Tables | Write | Expressions | Match |");
        sb.AppendLine("|---------|-------|------|--------|-------|-------------|-------|");

        foreach (var r in results)
        {
            sb.AppendLine($"| {r.Project} IDE {r.IdePosition} | {Truncate(r.Title, 30)} | {r.Type ?? "-"} | {r.TableCount} | {r.WriteTableCount} | {r.ExpressionCount} | {r.MatchReason ?? "-"} |");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_spec_impact")]
    [Description(@"Analyze impact of modifying a table. Returns all programs that read or write to the specified table.

Use BEFORE making changes to a table schema or data logic to prevent regressions.

Example: magic_spec_impact 849
Returns: All programs using table #849 with their access mode (R/W)")]
    public static string AnalyzeTableImpact(
        [Description("Table IDE number (e.g., 849)")] int tableId)
    {
        var openspecPath = FindOpenspecPath();
        if (openspecPath == null)
            return "ERROR: .openspec folder not found";

        var parser = new SpecParserService(openspecPath);
        var specsDir = Path.Combine(openspecPath, "specs");

        if (!Directory.Exists(specsDir))
            return "ERROR: specs folder not found";

        var writers = new List<(string Project, int Ide, string Title, int UsageCount)>();
        var readers = new List<(string Project, int Ide, string Title, int UsageCount)>();

        foreach (var file in Directory.GetFiles(specsDir, "*-IDE-*.md"))
        {
            var fileName = Path.GetFileNameWithoutExtension(file);
            var match = System.Text.RegularExpressions.Regex.Match(fileName, @"^([A-Z]+)-IDE-(\d+)$");
            if (!match.Success)
                continue;

            var project = match.Groups[1].Value;
            var idePos = int.Parse(match.Groups[2].Value);

            var spec = parser.ParseSpec(project, idePos);
            if (spec == null)
                continue;

            var table = spec.Tables.FirstOrDefault(t => t.Id == tableId);
            if (table == null)
                continue;

            var entry = (project, idePos, spec.Description ?? spec.Title ?? "", table.UsageCount);
            if (table.Access == "W")
                writers.Add(entry);
            else
                readers.Add(entry);
        }

        if (writers.Count == 0 && readers.Count == 0)
            return $"No programs found using table #{tableId}. Note: Only specs in .openspec/specs/ are searched.";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"# Impact Analysis: Table #{tableId}");
        sb.AppendLine();

        // Severity assessment
        var severity = writers.Count switch
        {
            0 => "LOW",
            1 => "MEDIUM",
            <= 3 => "HIGH",
            _ => "**CRITICAL**"
        };

        sb.AppendLine($"## Risk Level: {severity}");
        sb.AppendLine();
        sb.AppendLine($"- **Writers**: {writers.Count} programs");
        sb.AppendLine($"- **Readers**: {readers.Count} programs");
        sb.AppendLine();

        // Writers (critical)
        if (writers.Count > 0)
        {
            sb.AppendLine("## Writers (CRITICAL - verify before change)");
            sb.AppendLine();
            sb.AppendLine("| Program | Description | Usage |");
            sb.AppendLine("|---------|-------------|-------|");
            foreach (var w in writers.OrderByDescending(x => x.UsageCount))
            {
                sb.AppendLine($"| {w.Project} IDE {w.Ide} | {Truncate(w.Title, 40)} | {w.UsageCount}x |");
            }
            sb.AppendLine();
        }

        // Readers
        if (readers.Count > 0)
        {
            sb.AppendLine("## Readers (verify data compatibility)");
            sb.AppendLine();
            sb.AppendLine("| Program | Description | Usage |");
            sb.AppendLine("|---------|-------------|-------|");
            foreach (var r in readers.OrderByDescending(x => x.UsageCount))
            {
                sb.AppendLine($"| {r.Project} IDE {r.Ide} | {Truncate(r.Title, 40)} | {r.UsageCount}x |");
            }
            sb.AppendLine();
        }

        // Recommendations
        sb.AppendLine("## Recommendations");
        sb.AppendLine();
        if (writers.Count > 0)
        {
            sb.AppendLine($"1. **Test all {writers.Count} writing programs** before deploying changes");
            foreach (var w in writers.Take(3))
                sb.AppendLine($"   - {w.Project} IDE {w.Ide}");
        }
        if (readers.Count > 0)
        {
            sb.AppendLine($"2. Verify data format compatibility with {readers.Count} reading programs");
        }
        sb.AppendLine("3. Consider adding regression tests for affected programs");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_spec_list")]
    [Description("List all available program specifications with summary stats")]
    public static string ListSpecs(
        [Description("Optional: Filter by project (ADH, PBP, etc.)")] string? project = null)
    {
        var openspecPath = FindOpenspecPath();
        if (openspecPath == null)
            return "ERROR: .openspec folder not found";

        var parser = new SpecParserService(openspecPath);
        var specsDir = Path.Combine(openspecPath, "specs");

        if (!Directory.Exists(specsDir))
            return "ERROR: specs folder not found";

        var specs = new List<(string Project, int Ide, string Title, string Type, int Tables, int WriteCount, int Expressions)>();

        foreach (var file in Directory.GetFiles(specsDir, "*-IDE-*.md"))
        {
            var fileName = Path.GetFileNameWithoutExtension(file);
            var match = System.Text.RegularExpressions.Regex.Match(fileName, @"^([A-Z]+)-IDE-(\d+)$");
            if (!match.Success)
                continue;

            var proj = match.Groups[1].Value;
            if (!string.IsNullOrEmpty(project) && !proj.Equals(project, StringComparison.OrdinalIgnoreCase))
                continue;

            var idePos = int.Parse(match.Groups[2].Value);
            var spec = parser.ParseSpec(proj, idePos);
            if (spec == null)
                continue;

            specs.Add((proj, idePos, spec.Description ?? "", spec.Type ?? "-", spec.Tables.Count, spec.WriteTableCount, spec.ExpressionCount));
        }

        if (specs.Count == 0)
            return project != null ? $"No specs found for project {project}" : "No specs found";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"## Available Specs ({specs.Count})");
        if (!string.IsNullOrEmpty(project))
            sb.AppendLine($"Filtered by project: {project.ToUpper()}");
        sb.AppendLine();
        sb.AppendLine("| Program | Title | Type | Tables | Write | Expr |");
        sb.AppendLine("|---------|-------|------|--------|-------|------|");

        foreach (var s in specs.OrderBy(x => x.Project).ThenBy(x => x.Ide))
        {
            sb.AppendLine($"| {s.Project} IDE {s.Ide} | {Truncate(s.Title, 35)} | {s.Type} | {s.Tables} | {s.WriteCount} | {s.Expressions} |");
        }

        // Summary stats
        sb.AppendLine();
        sb.AppendLine("### Summary");
        sb.AppendLine($"- Total specs: {specs.Count}");
        sb.AppendLine($"- Total tables referenced: {specs.Sum(s => s.Tables)}");
        sb.AppendLine($"- Total write operations: {specs.Sum(s => s.WriteCount)}");
        sb.AppendLine($"- Total expressions: {specs.Sum(s => s.Expressions)}");

        var byProject = specs.GroupBy(s => s.Project).OrderBy(g => g.Key);
        sb.AppendLine();
        sb.AppendLine("### By Project");
        foreach (var g in byProject)
        {
            sb.AppendLine($"- **{g.Key}**: {g.Count()} specs");
        }

        return sb.ToString();
    }

    private static string? FindOpenspecPath()
    {
        var dir = new DirectoryInfo(Environment.CurrentDirectory);

        while (dir != null)
        {
            var openspecPath = Path.Combine(dir.FullName, ".openspec");
            if (Directory.Exists(openspecPath))
                return openspecPath;
            dir = dir.Parent;
        }

        return null;
    }

    private static string Truncate(string text, int maxLength)
    {
        if (string.IsNullOrEmpty(text))
            return "-";
        return text.Length <= maxLength ? text : text.Substring(0, maxLength - 3) + "...";
    }
}
