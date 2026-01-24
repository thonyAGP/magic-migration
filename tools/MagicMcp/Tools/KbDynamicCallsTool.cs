using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Detect dynamic ProgIdx() calls in Magic programs
/// </summary>
[McpServerToolType]
public static class KbDynamicCallsTool
{
    [McpServerTool(Name = "magic_kb_dynamic_calls")]
    [Description(@"Find dynamic program calls via ProgIdx() in expressions.

ProgIdx('program_name') is a Magic function that returns the program number
for a given PublicName. This allows dynamic CallTask operations.

These calls are NOT detected by the normal call graph (which only tracks
static CallTask with explicit program IDs).

Returns:
- Expression location
- Target PublicName
- Resolution to program IDE (if found)

Use this to find hidden dependencies not in the normal call graph.")]
    public static string GetDynamicCalls(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Optional: Program IDE position (omit for full project)")] int? idePosition = null)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        // Query expressions that contain ProgIdx
        using var cmd = db.Connection.CreateCommand();

        if (idePosition.HasValue)
        {
            cmd.CommandText = @"
                SELECT
                    p.ide_position as prog_ide,
                    p.name as prog_name,
                    e.ide_position as expr_ide,
                    e.content
                FROM expressions e
                JOIN programs p ON e.program_id = p.id
                JOIN projects proj ON p.project_id = proj.id
                WHERE proj.name = @project
                AND p.ide_position = @ide
                AND e.content LIKE '%ProgIdx%'
                ORDER BY p.ide_position, e.ide_position";
            cmd.Parameters.AddWithValue("@ide", idePosition.Value);
        }
        else
        {
            cmd.CommandText = @"
                SELECT
                    p.ide_position as prog_ide,
                    p.name as prog_name,
                    e.ide_position as expr_ide,
                    e.content
                FROM expressions e
                JOIN programs p ON e.program_id = p.id
                JOIN projects proj ON p.project_id = proj.id
                WHERE proj.name = @project
                AND e.content LIKE '%ProgIdx%'
                ORDER BY p.ide_position, e.ide_position";
        }

        cmd.Parameters.AddWithValue("@project", project);

        var results = new List<(int ProgIde, string ProgName, int ExprIde, string Content)>();
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                results.Add((
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetInt32(2),
                    reader.GetString(3)
                ));
            }
        }

        if (results.Count == 0)
        {
            var scope = idePosition.HasValue ? $"{project} IDE {idePosition}" : project;
            return $"No ProgIdx() calls found in {scope}";
        }

        // Extract ProgIdx targets
        var progIdxPattern = new System.Text.RegularExpressions.Regex(
            @"ProgIdx\s*\(\s*['""]([^'""]+)['""]",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        var dynamicCalls = new List<(int ProgIde, string ProgName, int ExprIde, string TargetName)>();

        foreach (var (progIde, progName, exprIde, content) in results)
        {
            var matches = progIdxPattern.Matches(content);
            foreach (System.Text.RegularExpressions.Match match in matches)
            {
                dynamicCalls.Add((progIde, progName, exprIde, match.Groups[1].Value));
            }
        }

        // Try to resolve PublicNames to IDE positions
        var publicNames = dynamicCalls.Select(d => d.TargetName).Distinct().ToList();
        var resolutions = ResolvePublicNames(db, publicNames);

        var sb = new StringBuilder();
        var scope2 = idePosition.HasValue ? $"{project} IDE {idePosition}" : project;
        sb.AppendLine($"## Dynamic Calls (ProgIdx): {scope2}");
        sb.AppendLine();
        sb.AppendLine($"Found **{dynamicCalls.Count}** ProgIdx() call(s)");
        sb.AppendLine();

        sb.AppendLine("| Caller Prog IDE | Caller Name | Expr IDE | Target PublicName | Resolves To |");
        sb.AppendLine("|-----------------|-------------|----------|-------------------|-------------|");

        foreach (var (progIde, progName, exprIde, targetName) in dynamicCalls.Take(50))
        {
            var resolution = resolutions.TryGetValue(targetName, out var res)
                ? $"{res.Project} IDE {res.IdePosition}"
                : "NOT FOUND";

            sb.AppendLine($"| {progIde} | {TruncateForTable(progName, 20)} | {exprIde} | {targetName} | {resolution} |");
        }

        if (dynamicCalls.Count > 50)
        {
            sb.AppendLine();
            sb.AppendLine($"*... and {dynamicCalls.Count - 50} more.*");
        }

        // Summary by target
        sb.AppendLine();
        sb.AppendLine("### Targets Summary");
        sb.AppendLine();
        var byTarget = dynamicCalls.GroupBy(d => d.TargetName).OrderByDescending(g => g.Count());
        sb.AppendLine("| Target PublicName | Call Count | Resolves To |");
        sb.AppendLine("|-------------------|------------|-------------|");

        foreach (var group in byTarget.Take(20))
        {
            var resolution = resolutions.TryGetValue(group.Key, out var res)
                ? $"{res.Project} IDE {res.IdePosition}"
                : "NOT FOUND";
            sb.AppendLine($"| {group.Key} | {group.Count()} | {resolution} |");
        }

        // Unresolved warnings
        var unresolved = publicNames.Where(n => !resolutions.ContainsKey(n)).ToList();
        if (unresolved.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine($"**WARNING**: {unresolved.Count} target(s) could not be resolved:");
            foreach (var name in unresolved.Take(10))
            {
                sb.AppendLine($"- `{name}` - may be in external ECF or misspelled");
            }
        }

        return sb.ToString();
    }

    private static Dictionary<string, (string Project, int IdePosition)> ResolvePublicNames(KnowledgeDb db, List<string> publicNames)
    {
        var resolutions = new Dictionary<string, (string Project, int IdePosition)>();

        if (publicNames.Count == 0) return resolutions;

        // Build IN clause
        var placeholders = string.Join(",", publicNames.Select((_, i) => $"@p{i}"));

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = $@"
            SELECT proj.name, p.ide_position, p.public_name
            FROM programs p
            JOIN projects proj ON p.project_id = proj.id
            WHERE p.public_name IN ({placeholders})";

        for (int i = 0; i < publicNames.Count; i++)
        {
            cmd.Parameters.AddWithValue($"@p{i}", publicNames[i]);
        }

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var project = reader.GetString(0);
            var idePos = reader.GetInt32(1);
            var pubName = reader.GetString(2);

            if (!resolutions.ContainsKey(pubName))
            {
                resolutions[pubName] = (project, idePos);
            }
        }

        return resolutions;
    }

    private static string TruncateForTable(string value, int maxLength)
    {
        if (string.IsNullOrEmpty(value)) return "";
        return value.Length > maxLength ? value.Substring(0, maxLength - 3) + "..." : value;
    }
}
