using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Detect constant conditions (dead code not marked [D])
/// </summary>
[McpServerToolType]
public static class KbConstantConditionsTool
{
    [McpServerTool(Name = "magic_kb_constant_conditions")]
    [Description(@"Detect constant conditions in Magic programs that indicate dead code.

Finds logic lines with conditions that are always FALSE or TRUE:
- IF(0,...) - Numeric 0 is always FALSE
- IF('',...) - Empty string is always FALSE
- IF(0=1,...) - Comparison always FALSE
- IF(1=1,...) - Comparison always TRUE (redundant)

These represent dead code that is NOT marked with [D] in the IDE.

Returns:
- Location (program, task, line)
- Condition expression
- Why it's constant (reason)
- Whether already disabled

Use magic_kb_dead_code for [D]-marked disabled lines.
Use this tool for hidden dead code with constant conditions.")]
    public static string DetectConstantConditions(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Optional: Program IDE position to analyze (omit for full project)")] int? idePosition = null,
        [Description("Maximum results to return (default: 50)")] int limit = 50)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var analyzer = new ConstantConditionAnalyzer(db);
        var blocks = analyzer.FindConstantConditions(project, idePosition);

        if (blocks.Count == 0)
        {
            var scope = idePosition.HasValue ? $"{project} IDE {idePosition}" : project;
            return $"No constant conditions found in {scope}. Code appears clean.";
        }

        var sb = new StringBuilder();
        var scope2 = idePosition.HasValue ? $"{project} IDE {idePosition}" : project;
        sb.AppendLine($"## Constant Conditions: {scope2}");
        sb.AppendLine();

        // Summary
        var alwaysFalse = blocks.Count(b => b.ConstantType == ConstantType.AlwaysFalse);
        var alwaysTrue = blocks.Count(b => b.ConstantType == ConstantType.AlwaysTrue);
        var alreadyDisabled = blocks.Count(b => b.IsAlreadyDisabled);

        sb.AppendLine($"Found **{blocks.Count}** constant condition(s):");
        sb.AppendLine($"- Always FALSE (dead code): {alwaysFalse}");
        sb.AppendLine($"- Always TRUE (redundant): {alwaysTrue}");
        sb.AppendLine($"- Already [D] disabled: {alreadyDisabled}");
        sb.AppendLine();

        // Group by type
        if (alwaysFalse > 0)
        {
            sb.AppendLine("### Dead Code (Always FALSE)");
            sb.AppendLine();
            sb.AppendLine("These lines will **never execute**:");
            sb.AppendLine();
            sb.AppendLine("| Prog IDE | Task | Line | Operation | Condition | Reason |");
            sb.AppendLine("|----------|------|------|-----------|-----------|--------|");

            foreach (var block in blocks.Where(b => b.ConstantType == ConstantType.AlwaysFalse).Take(limit / 2))
            {
                var disabled = block.IsAlreadyDisabled ? " [D]" : "";
                var cond = TruncateForTable(block.ConditionExpression, 20);
                sb.AppendLine($"| {block.ProgramIdePosition} | {block.TaskIdePosition} | {block.LineNumber}{disabled} | {block.Operation} | `{cond}` | {block.Reason} |");
            }
            sb.AppendLine();
        }

        if (alwaysTrue > 0)
        {
            sb.AppendLine("### Redundant Conditions (Always TRUE)");
            sb.AppendLine();
            sb.AppendLine("These conditions serve no purpose (always execute):");
            sb.AppendLine();
            sb.AppendLine("| Prog IDE | Task | Line | Operation | Condition | Reason |");
            sb.AppendLine("|----------|------|------|-----------|-----------|--------|");

            foreach (var block in blocks.Where(b => b.ConstantType == ConstantType.AlwaysTrue).Take(limit / 2))
            {
                var disabled = block.IsAlreadyDisabled ? " [D]" : "";
                var cond = TruncateForTable(block.ConditionExpression, 20);
                sb.AppendLine($"| {block.ProgramIdePosition} | {block.TaskIdePosition} | {block.LineNumber}{disabled} | {block.Operation} | `{cond}` | {block.Reason} |");
            }
            sb.AppendLine();
        }

        // Affected programs summary
        var affectedProgs = blocks
            .GroupBy(b => b.ProgramIdePosition)
            .OrderByDescending(g => g.Count())
            .Take(10);

        sb.AppendLine("### Most Affected Programs");
        sb.AppendLine();
        sb.AppendLine("| Prog IDE | Name | Constant Conditions |");
        sb.AppendLine("|----------|------|---------------------|");

        foreach (var group in affectedProgs)
        {
            var first = group.First();
            sb.AppendLine($"| {group.Key} | {first.ProgramName} | {group.Count()} |");
        }

        if (blocks.Count > limit)
        {
            sb.AppendLine();
            sb.AppendLine($"*Showing first {limit} results. Total: {blocks.Count}. Increase limit to see more.*");
        }

        sb.AppendLine();
        sb.AppendLine("**Recommendation**: Review these conditions - they may indicate:");
        sb.AppendLine("- Debug code left in production");
        sb.AppendLine("- Feature flags that can be cleaned up");
        sb.AppendLine("- Copy-paste errors");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_constant_stats")]
    [Description(@"Get summary statistics for constant conditions in a project.

Quick overview without line-by-line details.
Use magic_kb_constant_conditions for detailed analysis.")]
    public static string GetConstantConditionStats(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var analyzer = new ConstantConditionAnalyzer(db);
        var stats = analyzer.GetStats(project);

        var sb = new StringBuilder();
        sb.AppendLine($"## Constant Condition Stats: {project}");
        sb.AppendLine();
        sb.AppendLine("| Metric | Count |");
        sb.AppendLine("|--------|-------|");
        sb.AppendLine($"| Total constant conditions | {stats.TotalConstantConditions} |");
        sb.AppendLine($"| Always FALSE (dead code) | {stats.AlwaysFalse} |");
        sb.AppendLine($"| Always TRUE (redundant) | {stats.AlwaysTrue} |");
        sb.AppendLine($"| Already [D] disabled | {stats.AlreadyDisabled} |");
        sb.AppendLine($"| Affected programs | {stats.AffectedPrograms} |");
        sb.AppendLine();

        // Severity assessment
        if (stats.TotalConstantConditions == 0)
        {
            sb.AppendLine("**Status**: Clean - No constant conditions detected.");
        }
        else if (stats.AlwaysFalse > 10)
        {
            sb.AppendLine($"**Status**: WARNING - {stats.AlwaysFalse} dead code blocks found.");
            sb.AppendLine("Run `magic_kb_constant_conditions` for details.");
        }
        else if (stats.AlwaysFalse > 0)
        {
            sb.AppendLine($"**Status**: Minor - {stats.AlwaysFalse} dead code blocks found.");
        }

        return sb.ToString();
    }

    private static string TruncateForTable(string value, int maxLength)
    {
        if (string.IsNullOrEmpty(value)) return "";
        var escaped = value.Replace("|", "\\|").Replace("`", "'");
        return escaped.Length > maxLength
            ? escaped.Substring(0, maxLength - 3) + "..."
            : escaped;
    }
}
