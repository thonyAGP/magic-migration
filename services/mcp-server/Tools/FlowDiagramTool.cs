using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Generate flow diagrams from call graphs
/// </summary>
[McpServerToolType]
public static class FlowDiagramTool
{
    [McpServerTool(Name = "magic_flow_diagram")]
    [Description("Generate ASCII or Mermaid diagram of program call flow. Useful for visualizing how programs call each other.")]
    public static string GenerateFlowDiagram(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position")] int idePosition,
        [Description("Output format: 'ascii' (default) or 'mermaid'")] string format = "ascii",
        [Description("Maximum depth to traverse (default: 2)")] int maxDepth = 2)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var callGraphService = new CallGraphService(db);
        var graph = callGraphService.GetCallGraph(project, idePosition, maxDepth);

        // Get program name
        var programName = GetProgramName(db, project, idePosition);
        if (programName == null)
            return $"ERROR: Program {project} IDE {idePosition} not found";

        return format.ToLowerInvariant() switch
        {
            "mermaid" => GenerateMermaidDiagram(project, idePosition, programName, graph),
            _ => GenerateAsciiDiagram(project, idePosition, programName, graph)
        };
    }

    private static string? GetProgramName(KnowledgeDb db, string project, int idePosition)
    {
        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT p.name FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        cmd.Parameters.AddWithValue("@project", project);
        cmd.Parameters.AddWithValue("@ide", idePosition);
        return cmd.ExecuteScalar() as string;
    }

    private static string GenerateAsciiDiagram(string project, int ide, string name, CallGraph graph)
    {
        var sb = new StringBuilder();
        sb.AppendLine("```");
        sb.AppendLine($"CALL FLOW DIAGRAM: {project} IDE {ide} - {name}");
        sb.AppendLine(new string('=', 50));
        sb.AppendLine();

        // Callers section (who calls this program)
        if (graph.Callers.Count > 0)
        {
            sb.AppendLine("╔══════════════════════════════════════════════╗");
            sb.AppendLine("║              CALLERS (WHO CALLS THIS)        ║");
            sb.AppendLine("╠══════════════════════════════════════════════╣");

            var callersByDepth = graph.Callers.GroupBy(c => c.Depth).OrderByDescending(g => g.Key);
            foreach (var group in callersByDepth)
            {
                foreach (var caller in group.Take(5))
                {
                    var indent = new string(' ', (group.Key - 1) * 2);
                    var label = $"{caller.ProjectName} IDE {caller.ProgramIdePosition}";
                    if (!string.IsNullOrEmpty(caller.ProgramName))
                        label += $" ({caller.ProgramName})";
                    sb.AppendLine($"║ {indent}┌─────────────────────────────────┐      ║");
                    sb.AppendLine($"║ {indent}│ {label.PadRight(33)} │      ║");
                    sb.AppendLine($"║ {indent}└─────────────────────────────────┘      ║");
                    sb.AppendLine($"║ {indent}               │                         ║");
                    sb.AppendLine($"║ {indent}               ▼                         ║");
                }
            }

            if (graph.Callers.Count > 5)
            {
                sb.AppendLine($"║       ... +{graph.Callers.Count - 5} more callers            ║");
            }
        }

        // Target program (center)
        sb.AppendLine("╠══════════════════════════════════════════════╣");
        sb.AppendLine("║              ╔═════════════════════╗         ║");
        var centerLabel = $"{project} IDE {ide}";
        sb.AppendLine($"║     ═══════▶ ║ {centerLabel.PadRight(19)} ║ ◀═══════ ║");
        if (!string.IsNullOrEmpty(name))
        {
            var shortName = name.Length > 17 ? name[..17] + ".." : name;
            sb.AppendLine($"║              ║ {shortName.PadRight(19)} ║         ║");
        }
        sb.AppendLine("║              ╚═════════════════════╝         ║");
        sb.AppendLine("╠══════════════════════════════════════════════╣");

        // Callees section (what this program calls)
        if (graph.Callees.Count > 0)
        {
            sb.AppendLine("║              CALLEES (WHAT THIS CALLS)       ║");
            sb.AppendLine("╠══════════════════════════════════════════════╣");

            var calleesByDepth = graph.Callees.GroupBy(c => c.Depth).OrderBy(g => g.Key);
            foreach (var group in calleesByDepth)
            {
                foreach (var callee in group.Take(5))
                {
                    var indent = new string(' ', (group.Key - 1) * 2);
                    var label = $"{callee.ProjectName} IDE {callee.ProgramIdePosition}";
                    if (!string.IsNullOrEmpty(callee.ProgramName))
                        label += $" ({callee.ProgramName})";
                    sb.AppendLine($"║ {indent}               │                         ║");
                    sb.AppendLine($"║ {indent}               ▼                         ║");
                    sb.AppendLine($"║ {indent}┌─────────────────────────────────┐      ║");
                    sb.AppendLine($"║ {indent}│ {label.PadRight(33)} │      ║");
                    sb.AppendLine($"║ {indent}└─────────────────────────────────┘      ║");
                }
            }

            if (graph.Callees.Count > 5)
            {
                sb.AppendLine($"║       ... +{graph.Callees.Count - 5} more callees            ║");
            }
        }

        sb.AppendLine("╚══════════════════════════════════════════════╝");
        sb.AppendLine();
        sb.AppendLine($"Stats: {graph.Callers.Count} callers | {graph.Callees.Count} callees");
        sb.AppendLine("```");

        return sb.ToString();
    }

    private static string GenerateMermaidDiagram(string project, int ide, string name, CallGraph graph)
    {
        var sb = new StringBuilder();
        sb.AppendLine("```mermaid");
        sb.AppendLine("flowchart TD");
        sb.AppendLine();

        // Generate unique node IDs
        var centerNode = $"{project}_{ide}";
        var shortName = name.Length > 20 ? name[..20] + "..." : name;
        sb.AppendLine($"    {centerNode}[\"<b>{project} IDE {ide}</b><br/>{shortName}\"]");
        sb.AppendLine($"    style {centerNode} fill:#ff9800,stroke:#333,stroke-width:3px");
        sb.AppendLine();

        // Callers
        if (graph.Callers.Count > 0)
        {
            sb.AppendLine("    %% Callers");
            foreach (var caller in graph.Callers.Take(10))
            {
                var callerNode = $"{caller.ProjectName}_{caller.ProgramIdePosition}";
                var callerName = caller.ProgramName?.Length > 15
                    ? caller.ProgramName[..15] + "..."
                    : caller.ProgramName ?? "";
                sb.AppendLine($"    {callerNode}[\"{caller.ProjectName} IDE {caller.ProgramIdePosition}<br/>{callerName}\"]");
                sb.AppendLine($"    {callerNode} --> {centerNode}");
            }
            if (graph.Callers.Count > 10)
            {
                sb.AppendLine($"    more_callers((+{graph.Callers.Count - 10} more))");
                sb.AppendLine($"    more_callers --> {centerNode}");
            }
        }
        sb.AppendLine();

        // Callees
        if (graph.Callees.Count > 0)
        {
            sb.AppendLine("    %% Callees");
            foreach (var callee in graph.Callees.Take(10))
            {
                var calleeNode = $"{callee.ProjectName}_{callee.ProgramIdePosition}";
                var calleeName = callee.ProgramName?.Length > 15
                    ? callee.ProgramName[..15] + "..."
                    : callee.ProgramName ?? "";
                sb.AppendLine($"    {calleeNode}[\"{callee.ProjectName} IDE {callee.ProgramIdePosition}<br/>{calleeName}\"]");
                sb.AppendLine($"    {centerNode} --> {calleeNode}");
            }
            if (graph.Callees.Count > 10)
            {
                sb.AppendLine($"    more_callees((+{graph.Callees.Count - 10} more))");
                sb.AppendLine($"    {centerNode} --> more_callees");
            }
        }

        sb.AppendLine("```");
        sb.AppendLine();
        sb.AppendLine($"*Diagram shows {graph.Callers.Count} callers and {graph.Callees.Count} callees*");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_task_flow")]
    [Description("Generate ASCII diagram of task hierarchy and logic flow within a single program.")]
    public static string GenerateTaskFlow(
        KnowledgeDb db,
        [Description("Project name")] string project,
        [Description("Program IDE position")] int idePosition)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var sb = new StringBuilder();
        sb.AppendLine("```");
        sb.AppendLine($"TASK FLOW: {project} IDE {idePosition}");
        sb.AppendLine(new string('=', 40));
        sb.AppendLine();

        // Get program info
        using var progCmd = db.Connection.CreateCommand();
        progCmd.CommandText = @"
            SELECT p.id, p.name FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        progCmd.Parameters.AddWithValue("@project", project);
        progCmd.Parameters.AddWithValue("@ide", idePosition);

        long programId = 0;
        string? programName = null;

        using (var reader = progCmd.ExecuteReader())
        {
            if (!reader.Read())
                return $"ERROR: Program {project} IDE {idePosition} not found";
            programId = reader.GetInt64(0);
            programName = reader.GetString(1);
        }

        sb.AppendLine($"Program: {programName}");
        sb.AppendLine();

        // Get tasks ordered by ISN_2
        using var taskCmd = db.Connection.CreateCommand();
        taskCmd.CommandText = @"
            SELECT isn2, ide_position, description, level, parent_isn2, task_type, column_count, logic_line_count
            FROM tasks
            WHERE program_id = @progId
            ORDER BY isn2";
        taskCmd.Parameters.AddWithValue("@progId", programId);

        var tasks = new List<(int Isn2, string IdePos, string Desc, int Level, int? Parent, string Type, int Cols, int Lines)>();

        using (var reader = taskCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                tasks.Add((
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.IsDBNull(2) ? "" : reader.GetString(2),
                    reader.GetInt32(3),
                    reader.IsDBNull(4) ? null : reader.GetInt32(4),
                    reader.IsDBNull(5) ? "" : reader.GetString(5),
                    reader.GetInt32(6),
                    reader.GetInt32(7)
                ));
            }
        }

        if (tasks.Count == 0)
        {
            sb.AppendLine("*No tasks found*");
            sb.AppendLine("```");
            return sb.ToString();
        }

        // Draw task tree
        foreach (var task in tasks)
        {
            var indent = new string(' ', task.Level * 2);
            var prefix = task.Level == 0 ? "╔" : "├";
            var desc = string.IsNullOrEmpty(task.Desc) ? "(no name)" : task.Desc;
            if (desc.Length > 25) desc = desc[..22] + "...";

            sb.AppendLine($"{indent}{prefix}── Task {task.IdePos}: {desc}");
            sb.AppendLine($"{indent}│   Type: {task.Type}, Cols: {task.Cols}, Lines: {task.Lines}");
        }

        sb.AppendLine();
        sb.AppendLine($"Total: {tasks.Count} task(s)");
        sb.AppendLine("```");

        return sb.ToString();
    }
}
