using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class DumpDataViewTool
{
    [McpServerTool(Name = "magic_dump_dataview")]
    [Description("Dump ALL DataView columns for a task to verify parsing. Shows line number, XML id, variable letter, name, and type for every column.")]
    public static string DumpDataView(
        MagicQueryService queryService,
        IndexCache cache,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Task position in IDE format (e.g., '69.3' for subtask 3 of program 69)")] string taskPosition)
    {
        // Parse task position
        var parts = taskPosition.Split('.');
        if (parts.Length == 0 || !int.TryParse(parts[0], out int prgIdePosition))
            return $"ERROR: Invalid task position format '{taskPosition}'";

        // Find project
        var projectData = cache.GetProject(project);
        if (projectData == null)
            return $"ERROR: Project {project} not found";

        // Find program by IDE position
        var program = projectData.Programs.Values.FirstOrDefault(p => p.IdePosition == prgIdePosition);
        if (program == null)
            return $"ERROR: No program found at IDE position {prgIdePosition}";

        // Find task by IDE position
        var task = program.Tasks.Values.FirstOrDefault(t => t.IdePosition == taskPosition);
        if (task == null)
        {
            // If only program number, get root task
            if (parts.Length == 1)
                task = program.Tasks.GetValueOrDefault(1);
        }

        if (task == null)
            return $"ERROR: Task {taskPosition} not found";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"## DataView Dump: {project.ToUpper()} IDE {taskPosition}");
        sb.AppendLine($"**Task:** {task.Description} (ISN_2={task.Isn2})");
        sb.AppendLine();

        // Dump DB/Tables
        if (task.DataView?.MainSource != null)
        {
            var main = task.DataView.MainSource;
            sb.AppendLine($"**Main Source:** Table {main.TableId} (comp={main.ComponentId ?? "local"})");
        }

        if (task.DataView?.Links.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("**Links:**");
            foreach (var link in task.DataView.Links)
            {
                sb.AppendLine($"  - Link #{link.Id}: Table {link.TableId}");
            }
        }

        sb.AppendLine();
        sb.AppendLine("### Columns (DataView lines)");
        sb.AppendLine();

        if (task.DataView?.Columns == null || task.DataView.Columns.Count == 0)
        {
            sb.AppendLine("*No columns in this task*");
            return sb.ToString();
        }

        sb.AppendLine("| Line | XmlId | Var | Name | Type | Def |");
        sb.AppendLine("|------|-------|-----|------|------|-----|");

        foreach (var col in task.DataView.Columns.OrderBy(c => c.LineNumber))
        {
            var name = col.Name.Length > 30 ? col.Name.Substring(0, 30) + "..." : col.Name;
            sb.AppendLine($"| {col.LineNumber} | {col.XmlId} | {col.Variable} | {name} | {col.DataType} | {col.Definition} |");
        }

        sb.AppendLine();
        sb.AppendLine($"**Total columns:** {task.DataView.Columns.Count}");

        return sb.ToString();
    }
}
