using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: List programs with filtering and pagination
/// </summary>
[McpServerToolType]
public static class ListProgramsTool
{
    [McpServerTool(Name = "magic_list_programs")]
    [Description("List Magic programs across all projects or filtered by project. Shows IDE position, name, and public name.")]
    public static string ListPrograms(
        GlobalIndex globalIndex,
        [Description("Optional: filter by project (ADH, PBP, REF, VIL, PBG, PVE)")] string? project = null,
        [Description("Number of results to skip (for pagination)")] int skip = 0,
        [Description("Number of results to return (max 100)")] int take = 50)
    {
        take = Math.Min(take, 100);
        var programs = globalIndex.ListPrograms(project, skip, take);

        if (programs.Count == 0)
            return project != null
                ? $"No programs found in project {project}"
                : "No programs found";

        var sb = new System.Text.StringBuilder();

        // Header
        var stats = globalIndex.GetStats();
        if (project != null)
        {
            var projectCount = stats.ProjectStats.GetValueOrDefault(project.ToUpperInvariant(), 0);
            sb.AppendLine($"**Programs in {project.ToUpperInvariant()}** (showing {skip + 1}-{skip + programs.Count} of {projectCount})");
        }
        else
        {
            sb.AppendLine($"**All Programs** (showing {skip + 1}-{skip + programs.Count} of {stats.TotalPrograms})");
        }
        sb.AppendLine();

        sb.AppendLine("| Project | IDE | ID | Name | Public | Tasks |");
        sb.AppendLine("|---------|-----|-----|------|--------|-------|");

        foreach (var prog in programs)
        {
            var publicName = prog.PublicName ?? "";
            sb.AppendLine($"| {prog.Project} | {prog.IdePosition} | {prog.ProgramId} | {prog.Name} | {publicName} | {prog.TaskCount} |");
        }

        // Pagination hint
        if (programs.Count == take)
        {
            sb.AppendLine();
            sb.AppendLine($"*More results available. Use skip={skip + take} to see next page.*");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_index_stats")]
    [Description("Get statistics about the Magic index (program count per project, total keywords, etc.)")]
    public static string GetIndexStats(GlobalIndex globalIndex)
    {
        var stats = globalIndex.GetStats();

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("**Magic Index Statistics**");
        sb.AppendLine();
        sb.AppendLine($"- **Total Programs:** {stats.TotalPrograms}");
        sb.AppendLine($"- **Total Public Names:** {stats.TotalPublicNames}");
        sb.AppendLine($"- **Total Keywords:** {stats.TotalKeywords}");
        sb.AppendLine();
        sb.AppendLine("**Programs per Project:**");
        sb.AppendLine();
        sb.AppendLine("| Project | Programs |");
        sb.AppendLine("|---------|----------|");

        foreach (var (projectName, count) in stats.ProjectStats.OrderByDescending(x => x.Value))
        {
            sb.AppendLine($"| {projectName} | {count} |");
        }

        return sb.ToString();
    }
}
