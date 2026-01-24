using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Dead code detection in the Magic Knowledge Base
/// </summary>
[McpServerToolType]
public static class KbDeadCodeTool
{
    [McpServerTool(Name = "magic_kb_dead_code")]
    [Description(@"Get dead code statistics for a program.

Returns:
- Total logic lines
- Disabled lines ([D] marker in IDE)
- Disabled ratio (percentage)

Use this to identify programs with high amounts of dead code.")]
    public static string GetDeadCodeStats(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position")] int idePosition)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var service = new OrphanDetectionService(db);
        var stats = service.GetDeadCodeStats(project, idePosition);

        if (stats.TotalLogicLines == 0)
        {
            return $"No logic lines found for {project} IDE {idePosition}";
        }

        var sb = new StringBuilder();
        sb.AppendLine($"## Dead Code Stats: {project} IDE {idePosition}");
        sb.AppendLine();
        sb.AppendLine($"| Metric | Value |");
        sb.AppendLine($"|--------|-------|");
        sb.AppendLine($"| Total logic lines | {stats.TotalLogicLines} |");
        sb.AppendLine($"| Disabled lines [D] | {stats.DisabledLines} |");
        sb.AppendLine($"| Disabled ratio | {stats.DisabledRatio * 100:F1}% |");
        sb.AppendLine();

        if (stats.DisabledRatio > 0.5)
        {
            sb.AppendLine("**WARNING**: More than 50% of logic is disabled. Consider reviewing this program.");
        }
        else if (stats.DisabledRatio > 0.2)
        {
            sb.AppendLine("**NOTE**: Significant amount of disabled code. May need cleanup.");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_disabled_blocks")]
    [Description(@"List all disabled logic lines in a project.

Returns all lines marked as [D] (Disabled) with their location.
Useful for identifying dead code across a project.")]
    public static string GetDisabledBlocks(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Maximum number of results (default: 100)")] int limit = 100)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var service = new OrphanDetectionService(db);
        var blocks = service.GetDisabledBlocks(project);

        if (blocks.Count == 0)
        {
            return $"No disabled blocks found in {project}";
        }

        var sb = new StringBuilder();
        sb.AppendLine($"## Disabled Blocks: {project}");
        sb.AppendLine();
        sb.AppendLine($"Found {blocks.Count} disabled line(s)");
        sb.AppendLine();

        // Group by program
        var byProgram = blocks.GroupBy(b => b.ProgramIdePosition);
        sb.AppendLine("### Summary by Program");
        sb.AppendLine();
        sb.AppendLine("| Program IDE | Name | Disabled Lines |");
        sb.AppendLine("|-------------|------|----------------|");

        foreach (var group in byProgram.OrderByDescending(g => g.Count()).Take(20))
        {
            var first = group.First();
            sb.AppendLine($"| {group.Key} | {first.ProgramName} | {group.Count()} |");
        }

        sb.AppendLine();
        sb.AppendLine("### Details (first " + Math.Min(limit, blocks.Count) + " lines)");
        sb.AppendLine();
        sb.AppendLine("| Prog IDE | Task | Line | Handler | Operation |");
        sb.AppendLine("|----------|------|------|---------|-----------|");

        foreach (var block in blocks.Take(limit))
        {
            sb.AppendLine($"| {block.ProgramIdePosition} | {block.TaskIdePosition} | {block.LineNumber} | {block.Handler} | {block.Operation} |");
        }

        if (blocks.Count > limit)
        {
            sb.AppendLine();
            sb.AppendLine($"*... and {blocks.Count - limit} more. Use a higher limit to see all.*");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_dead_expressions")]
    [Description(@"Find potentially dead expressions in a program.

Dead expressions are defined but never referenced in logic line conditions.
This can indicate unused code that can be cleaned up.")]
    public static string GetDeadExpressions(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position")] int idePosition)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var service = new OrphanDetectionService(db);
        var deadExpressions = service.GetDeadExpressions(project, idePosition);

        if (deadExpressions.Count == 0)
        {
            return $"No dead expressions found in {project} IDE {idePosition}";
        }

        var sb = new StringBuilder();
        sb.AppendLine($"## Dead Expressions: {project} IDE {idePosition}");
        sb.AppendLine();
        sb.AppendLine($"Found {deadExpressions.Count} potentially dead expression(s)");
        sb.AppendLine();
        sb.AppendLine("| Expr IDE | Content (truncated) | Reason |");
        sb.AppendLine("|----------|---------------------|--------|");

        foreach (var expr in deadExpressions.OrderBy(e => e.IdePosition))
        {
            var truncated = expr.Content.Length > 50
                ? expr.Content.Substring(0, 47) + "..."
                : expr.Content;
            // Escape pipes for markdown table
            truncated = truncated.Replace("|", "\\|");

            sb.AppendLine($"| {expr.IdePosition} | `{truncated}` | {expr.Reason} |");
        }

        sb.AppendLine();
        sb.AppendLine("**Note**: These expressions may still be used via:");
        sb.AppendLine("- Expression table references");
        sb.AppendLine("- Dynamic ProgIdx() calls");
        sb.AppendLine("- Parameters to external programs");
        sb.AppendLine();
        sb.AppendLine("Review before cleanup.");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_project_health")]
    [Description(@"Get overall code health metrics for a project.

Combines orphan detection and dead code analysis into a single health report.
Useful for project-level code quality assessment.")]
    public static string GetProjectHealth(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var service = new OrphanDetectionService(db);
        var orphanStats = service.GetOrphanStats(project);
        var disabledBlocks = service.GetDisabledBlocks(project);

        // Group disabled by program for ratio calculation
        var disabledByProgram = disabledBlocks.GroupBy(b => b.ProgramIdePosition).ToList();
        var programsWithDisabled = disabledByProgram.Count;
        var totalDisabledLines = disabledBlocks.Count;

        var sb = new StringBuilder();
        sb.AppendLine($"## Project Health Report: {project}");
        sb.AppendLine();
        sb.AppendLine("### Program Status");
        sb.AppendLine();
        sb.AppendLine("```");
        sb.AppendLine($"Total Programs:     {orphanStats.TotalPrograms}");
        sb.AppendLine($"├── Active:         {orphanStats.UsedPrograms + orphanStats.CallableByName} ({Percent(orphanStats.UsedPrograms + orphanStats.CallableByName, orphanStats.TotalPrograms)})");
        sb.AppendLine($"├── Cross-project:  {orphanStats.CrossProjectPossible} ({Percent(orphanStats.CrossProjectPossible, orphanStats.TotalPrograms)})");
        sb.AppendLine($"├── Empty:          {orphanStats.EmptyPrograms} ({Percent(orphanStats.EmptyPrograms, orphanStats.TotalPrograms)})");
        sb.AppendLine($"└── Orphan:         {orphanStats.ConfirmedOrphans} ({Percent(orphanStats.ConfirmedOrphans, orphanStats.TotalPrograms)})");
        sb.AppendLine("```");
        sb.AppendLine();

        sb.AppendLine("### Dead Code");
        sb.AppendLine();
        sb.AppendLine($"| Metric | Value |");
        sb.AppendLine($"|--------|-------|");
        sb.AppendLine($"| Programs with disabled code | {programsWithDisabled} |");
        sb.AppendLine($"| Total disabled lines | {totalDisabledLines} |");
        sb.AppendLine();

        // Health score calculation
        var orphanPenalty = orphanStats.ConfirmedOrphans * 2;
        var emptyPenalty = orphanStats.EmptyPrograms;
        var disabledPenalty = totalDisabledLines / 10;
        var healthScore = Math.Max(0, 100 - orphanPenalty - emptyPenalty - disabledPenalty);

        sb.AppendLine("### Health Score");
        sb.AppendLine();
        var grade = healthScore switch
        {
            >= 90 => "A (Excellent)",
            >= 80 => "B (Good)",
            >= 70 => "C (Fair)",
            >= 60 => "D (Needs Work)",
            _ => "F (Critical)"
        };
        sb.AppendLine($"**Score: {healthScore}/100** - {grade}");
        sb.AppendLine();

        if (orphanStats.ConfirmedOrphans > 0)
        {
            sb.AppendLine($"**Recommendation**: Review {orphanStats.ConfirmedOrphans} orphan program(s)");
        }

        if (totalDisabledLines > 50)
        {
            sb.AppendLine($"**Recommendation**: Clean up {totalDisabledLines} disabled line(s)");
        }

        return sb.ToString();
    }

    private static string Percent(int part, int total)
    {
        if (total == 0) return "0%";
        return $"{(double)part / total * 100:F1}%";
    }
}
