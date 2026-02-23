using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Find program across all projects without specifying the project name
/// </summary>
[McpServerToolType]
public static class FindProgramTool
{
    [McpServerTool(Name = "magic_find_program")]
    [Description("Find Magic programs by name or public name across ALL projects (no need to specify project). Supports fuzzy search.")]
    public static string FindProgram(
        GlobalIndex globalIndex,
        [Description("Search query (name, public name, or keywords)")] string query,
        [Description("Optional: filter by project (ADH, PBP, REF, VIL, PBG, PVE)")] string? project = null,
        [Description("Maximum results to return (default: 10)")] int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            return "ERROR: Query is required";

        var results = globalIndex.Search(query, limit, project);

        if (results.Count == 0)
            return $"No programs found matching '{query}'";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"**Found {results.Count} program(s) matching '{query}':**");
        sb.AppendLine();
        sb.AppendLine("| Project | IDE | ID | Name | Public | Score |");
        sb.AppendLine("|---------|-----|-----|------|--------|-------|");

        foreach (var result in results)
        {
            var prog = result.Program;
            var publicName = prog.PublicName ?? "";
            sb.AppendLine($"| {prog.Project} | {prog.IdePosition} | {prog.ProgramId} | {prog.Name} | {publicName} | {result.Score}% |");
        }

        // Show usage hint for top result
        if (results.Count > 0)
        {
            var top = results[0].Program;
            sb.AppendLine();
            sb.AppendLine("**To inspect the top result:**");
            sb.AppendLine($"- Position: `magic_get_position(project=\"{top.Project}\", programId={top.ProgramId})`");
            sb.AppendLine($"- Tree: `magic_get_tree(project=\"{top.Project}\", programId={top.ProgramId})`");
        }

        return sb.ToString();
    }
}
