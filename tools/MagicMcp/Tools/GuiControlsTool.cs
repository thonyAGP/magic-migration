using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using Microsoft.Data.Sqlite;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Get GUI Control types from DataView columns (Schema v8)
/// Shows how variables are displayed in Forms (EDIT, COMBO, CHECKBOX, etc.)
/// </summary>
[McpServerToolType]
public static class GuiControlsTool
{
    [McpServerTool(Name = "magic_get_gui_controls")]
    [Description("Get GUI control types for DataView columns (how variables are displayed in forms). Shows control types like EDIT, COMBO, CHECKBOX, TABLE for each variable.")]
    public static string GetGuiControls(
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position (e.g., 121)")] int programId,
        [Description("Task ISN_2 (optional, default: all tasks)")] int? taskIsn2 = null,
        [Description("Filter by control type: EDIT, COMBO, CHECKBOX, TABLE, etc. (optional)")] string? controlType = null)
    {
        using var db = new KnowledgeDb();
        var sb = new StringBuilder();

        // Get project ID
        var dbProject = db.GetProject(project);
        if (dbProject == null)
        {
            return $"ERROR: Project '{project}' not found in KB";
        }

        // Build query
        var sql = @"
            SELECT
                t.isn2,
                t.description as task_name,
                dc.variable,
                dc.name,
                dc.data_type,
                dc.picture,
                dc.definition,
                dc.gui_control_type,
                dc.gui_table_control_type
            FROM dataview_columns dc
            JOIN tasks t ON dc.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            WHERE p.project_id = @projectId
              AND p.ide_position = @programId";

        if (taskIsn2.HasValue)
        {
            sql += " AND t.isn2 = @taskIsn2";
        }

        if (!string.IsNullOrEmpty(controlType))
        {
            sql += " AND (dc.gui_control_type = @controlType OR dc.gui_table_control_type = @controlType)";
        }

        sql += " ORDER BY t.isn2, dc.line_number";

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = sql;
        cmd.Parameters.AddWithValue("@projectId", dbProject.Id);
        cmd.Parameters.AddWithValue("@programId", programId);

        if (taskIsn2.HasValue)
        {
            cmd.Parameters.AddWithValue("@taskIsn2", taskIsn2.Value);
        }

        if (!string.IsNullOrEmpty(controlType))
        {
            cmd.Parameters.AddWithValue("@controlType", controlType.ToUpperInvariant());
        }

        using var reader = cmd.ExecuteReader();

        sb.AppendLine($"=== GUI Controls for {project} IDE {programId} ===");
        sb.AppendLine();

        int currentTaskIsn2 = -1;
        int columnCount = 0;
        var controlStats = new Dictionary<string, int>();

        while (reader.Read())
        {
            var isn2 = reader.GetInt32(0);
            var taskName = reader.GetString(1);
            var variable = reader.GetString(2);
            var name = reader.GetString(3);
            var dataType = reader.GetString(4);
            var picture = reader.IsDBNull(5) ? "" : reader.GetString(5);
            var definition = reader.GetString(6);
            var guiControl = reader.IsDBNull(7) ? "-" : reader.GetString(7);
            var guiTableControl = reader.IsDBNull(8) ? "-" : reader.GetString(8);

            // Track stats
            if (!reader.IsDBNull(7))
            {
                var ctrl = reader.GetString(7);
                controlStats[ctrl] = controlStats.GetValueOrDefault(ctrl, 0) + 1;
            }

            // Print task header when it changes
            if (isn2 != currentTaskIsn2)
            {
                if (currentTaskIsn2 != -1) sb.AppendLine();
                sb.AppendLine($"### Task {isn2}: {taskName}");
                sb.AppendLine("| Var | Name | Type | Def | GUI Form | GUI Table |");
                sb.AppendLine("|-----|------|------|-----|----------|-----------|");
                currentTaskIsn2 = isn2;
            }

            // Truncate name if too long
            var displayName = name.Length > 25 ? name[..22] + "..." : name;

            sb.AppendLine($"| {variable} | {displayName} | {dataType} | {definition} | {guiControl} | {guiTableControl} |");
            columnCount++;
        }

        if (columnCount == 0)
        {
            return $"No columns found for {project} IDE {programId}" + (taskIsn2.HasValue ? $" Task {taskIsn2}" : "");
        }

        sb.AppendLine();
        sb.AppendLine("### Statistics");
        sb.AppendLine($"- Total columns: {columnCount}");

        if (controlStats.Count > 0)
        {
            sb.AppendLine("- Control types distribution:");
            foreach (var (ctrl, count) in controlStats.OrderByDescending(kv => kv.Value))
            {
                sb.AppendLine($"  - {ctrl}: {count}");
            }
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_gui_control_stats")]
    [Description("Get statistics on GUI control types used across all programs or a specific project.")]
    public static string GetGuiControlStats(
        [Description("Project name (optional - all projects if not specified)")] string? project = null)
    {
        using var db = new KnowledgeDb();
        var sb = new StringBuilder();

        var sql = @"
            SELECT
                dc.gui_control_type,
                COUNT(*) as cnt
            FROM dataview_columns dc
            JOIN tasks t ON dc.task_id = t.id
            JOIN programs p ON t.program_id = p.id";

        if (!string.IsNullOrEmpty(project))
        {
            sql += @"
            JOIN projects proj ON p.project_id = proj.id
            WHERE proj.name = @project";
        }

        sql += @"
            GROUP BY dc.gui_control_type
            ORDER BY cnt DESC";

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = sql;

        if (!string.IsNullOrEmpty(project))
        {
            cmd.Parameters.AddWithValue("@project", project);
        }

        using var reader = cmd.ExecuteReader();

        sb.AppendLine(string.IsNullOrEmpty(project)
            ? "=== GUI Control Types - All Projects ==="
            : $"=== GUI Control Types - {project} ===");
        sb.AppendLine();
        sb.AppendLine("| Control Type | Count |");
        sb.AppendLine("|--------------|-------|");

        int total = 0;
        while (reader.Read())
        {
            var controlType = reader.IsDBNull(0) ? "(none)" : reader.GetString(0);
            var count = reader.GetInt64(1);
            total += (int)count;
            sb.AppendLine($"| {controlType} | {count:N0} |");
        }

        sb.AppendLine();
        sb.AppendLine($"**Total columns:** {total:N0}");

        return sb.ToString();
    }
}
