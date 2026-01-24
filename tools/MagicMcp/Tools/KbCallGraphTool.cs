using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Call graph analysis in the Magic Knowledge Base
/// </summary>
[McpServerToolType]
public static class KbCallGraphTool
{
    [McpServerTool(Name = "magic_kb_callers")]
    [Description("Find all programs that call a specific program (who calls this?). Shows the call chain up to N levels deep.")]
    public static string GetCallers(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position")] int idePosition,
        [Description("Maximum depth to traverse (default: 3)")] int maxDepth = 3)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var callGraphService = new CallGraphService(db);
        var callers = callGraphService.GetCallers(project, idePosition, maxDepth);

        if (callers.Count == 0)
        {
            return $"No callers found for {project} IDE {idePosition}";
        }

        var sb = new StringBuilder();
        sb.AppendLine($"## Programs calling {project} IDE {idePosition}");
        sb.AppendLine();
        sb.AppendLine($"Found {callers.Count} caller(s) (max depth: {maxDepth})");
        sb.AppendLine();
        sb.AppendLine("| Depth | Project | Program IDE | Program Name | From Task | Line |");
        sb.AppendLine("|-------|---------|-------------|--------------|-----------|------|");

        foreach (var caller in callers)
        {
            var indent = new string(' ', (caller.Depth - 1) * 2);
            sb.AppendLine($"| {caller.Depth} | {caller.ProjectName} | {indent}{caller.ProgramIdePosition} | {caller.ProgramName} | {caller.TaskIdePosition} | {caller.LineNumber} |");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_callees")]
    [Description("Find all programs called by a specific program (what does this call?). Shows the call chain down to N levels deep.")]
    public static string GetCallees(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position")] int idePosition,
        [Description("Maximum depth to traverse (default: 3)")] int maxDepth = 3)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var callGraphService = new CallGraphService(db);
        var callees = callGraphService.GetCallees(project, idePosition, maxDepth);

        if (callees.Count == 0)
        {
            return $"No callees found for {project} IDE {idePosition}";
        }

        var sb = new StringBuilder();
        sb.AppendLine($"## Programs called by {project} IDE {idePosition}");
        sb.AppendLine();
        sb.AppendLine($"Found {callees.Count} callee(s) (max depth: {maxDepth})");
        sb.AppendLine();
        sb.AppendLine("| Depth | Project | Program IDE | Program Name | Called From Task | Line |");
        sb.AppendLine("|-------|---------|-------------|--------------|------------------|------|");

        foreach (var callee in callees)
        {
            var indent = new string(' ', (callee.Depth - 1) * 2);
            sb.AppendLine($"| {callee.Depth} | {callee.ProjectName} | {indent}{callee.ProgramIdePosition} | {callee.ProgramName} | {callee.TaskIdePosition} | {callee.LineNumber} |");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_callgraph")]
    [Description("Get the full call graph for a program: both callers (who calls this) and callees (what this calls).")]
    public static string GetCallGraph(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position")] int idePosition,
        [Description("Maximum depth to traverse (default: 2)")] int maxDepth = 2)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var callGraphService = new CallGraphService(db);
        var graph = callGraphService.GetCallGraph(project, idePosition, maxDepth);
        var stats = callGraphService.GetCallStats(project, idePosition);

        var sb = new StringBuilder();
        sb.AppendLine($"## Call Graph for {project} IDE {idePosition}");
        sb.AppendLine();
        sb.AppendLine($"**Statistics:** {stats.CallerCount} callers, {stats.CalleeCount} callees");
        sb.AppendLine();

        // Callers section
        sb.AppendLine("### Callers (who calls this?)");
        if (graph.Callers.Count == 0)
        {
            sb.AppendLine("*No callers found*");
        }
        else
        {
            sb.AppendLine();
            sb.AppendLine("| Depth | Project | IDE | Name |");
            sb.AppendLine("|-------|---------|-----|------|");
            foreach (var caller in graph.Callers)
            {
                sb.AppendLine($"| {caller.Depth} | {caller.ProjectName} | {caller.ProgramIdePosition} | {caller.ProgramName} |");
            }
        }
        sb.AppendLine();

        // Callees section
        sb.AppendLine("### Callees (what does this call?)");
        if (graph.Callees.Count == 0)
        {
            sb.AppendLine("*No callees found*");
        }
        else
        {
            sb.AppendLine();
            sb.AppendLine("| Depth | Project | IDE | Name |");
            sb.AppendLine("|-------|---------|-----|------|");
            foreach (var callee in graph.Callees)
            {
                sb.AppendLine($"| {callee.Depth} | {callee.ProjectName} | {callee.ProgramIdePosition} | {callee.ProgramName} |");
            }
        }

        return sb.ToString();
    }
}
