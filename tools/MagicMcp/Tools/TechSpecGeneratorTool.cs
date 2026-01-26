using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Generate comprehensive technical specifications from KB
/// </summary>
[McpServerToolType]
public static class TechSpecGeneratorTool
{
    [McpServerTool(Name = "magic_generate_spec")]
    [Description("Generate a complete technical specification document for a program. " +
                 "Outputs Markdown with metadata, tasks, tables, variables, expressions, call graph, and forms.")]
    public static string GenerateProgramSpec(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position")] int idePosition,
        [Description("Include expressions (default: true)")] bool includeExpressions = true,
        [Description("Include call graph (default: true)")] bool includeCallGraph = true)
    {
        // Get program info
        using var progCmd = db.Connection.CreateCommand();
        progCmd.CommandText = @"
            SELECT p.id, p.name, p.public_name, p.xml_id, p.task_count, p.expression_count, p.file_path, pr.main_offset
            FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        progCmd.Parameters.AddWithValue("@project", project);
        progCmd.Parameters.AddWithValue("@ide", idePosition);

        long programId = 0;
        string? name = null, publicName = null, filePath = null;
        int xmlId = 0, taskCount = 0, exprCount = 0, mainOffset = 0;

        using (var reader = progCmd.ExecuteReader())
        {
            if (!reader.Read())
                return $"ERROR: Program {project} IDE {idePosition} not found";

            programId = reader.GetInt64(0);
            name = reader.GetString(1);
            publicName = reader.IsDBNull(2) ? null : reader.GetString(2);
            xmlId = reader.GetInt32(3);
            taskCount = reader.GetInt32(4);
            exprCount = reader.GetInt32(5);
            filePath = reader.GetString(6);
            mainOffset = reader.GetInt32(7);
        }

        var sb = new StringBuilder();

        // Header
        sb.AppendLine($"# Technical Specification: {project} IDE {idePosition}");
        sb.AppendLine();
        sb.AppendLine($"*Generated: {DateTime.Now:yyyy-MM-dd HH:mm}*");
        sb.AppendLine();

        // Section 1: Program Metadata
        sb.AppendLine("## 1. Program Metadata");
        sb.AppendLine();
        sb.AppendLine("| Attribute | Value |");
        sb.AppendLine("|-----------|-------|");
        sb.AppendLine($"| **Project** | {project} |");
        sb.AppendLine($"| **IDE Position** | {idePosition} |");
        sb.AppendLine($"| **Internal Name** | {name} |");
        sb.AppendLine($"| **Public Name** | {publicName ?? "-"} |");
        sb.AppendLine($"| **XML ID** | {xmlId} |");
        sb.AppendLine($"| **Tasks** | {taskCount} |");
        sb.AppendLine($"| **Expressions** | {exprCount} |");
        sb.AppendLine($"| **Main Offset** | {mainOffset} |");
        sb.AppendLine($"| **Complexity Score** | {taskCount * exprCount} |");
        sb.AppendLine();

        // Section 2: Task Hierarchy
        AppendTaskHierarchy(db, sb, programId, idePosition);

        // Section 3: Tables Used
        AppendTablesUsed(db, sb, programId);

        // Section 4: Variables (DataView columns)
        AppendVariables(db, sb, programId, idePosition, mainOffset);

        // Section 5: Expressions
        if (includeExpressions)
        {
            AppendExpressions(db, sb, programId);
        }

        // Section 6: Call Graph
        if (includeCallGraph)
        {
            AppendCallGraph(db, sb, project, idePosition);
        }

        // Section 7: UI Forms
        AppendForms(db, sb, programId, idePosition);

        // Section 8: Logic Summary
        AppendLogicSummary(db, sb, programId);

        return sb.ToString();
    }

    private static void AppendTaskHierarchy(KnowledgeDb db, StringBuilder sb, long programId, int progIde)
    {
        sb.AppendLine("## 2. Task Hierarchy");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT isn2, ide_position, description, level, task_type, main_source_table_id, column_count, logic_line_count
            FROM tasks
            WHERE program_id = @progId
            ORDER BY isn2";
        cmd.Parameters.AddWithValue("@progId", programId);

        sb.AppendLine("| Task | Description | Type | Main Table | Columns | Lines |");
        sb.AppendLine("|------|-------------|------|------------|---------|-------|");

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var isn2 = reader.GetInt32(0);
            var idePos = reader.GetString(1);
            var desc = reader.IsDBNull(2) ? "-" : reader.GetString(2);
            var level = reader.GetInt32(3);
            var type = reader.IsDBNull(4) ? "-" : reader.GetString(4);
            var mainTable = reader.IsDBNull(5) ? "-" : reader.GetInt32(5).ToString();
            var cols = reader.GetInt32(6);
            var lines = reader.GetInt32(7);

            var indent = new string(' ', level * 2);
            if (desc.Length > 25) desc = desc[..22] + "...";

            sb.AppendLine($"| {progIde}.{isn2} | {indent}{desc} | {type} | {mainTable} | {cols} | {lines} |");
        }
        sb.AppendLine();
    }

    private static void AppendTablesUsed(KnowledgeDb db, StringBuilder sb, long programId)
    {
        sb.AppendLine("## 3. Tables Used");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT
                tu.table_id,
                tu.table_name,
                tu.usage_type,
                tu.link_number,
                t.physical_name
            FROM table_usage tu
            JOIN tasks tk ON tu.task_id = tk.id
            LEFT JOIN tables t ON tu.table_id = t.xml_id
            WHERE tk.program_id = @progId
            ORDER BY tu.usage_type, tu.table_id";
        cmd.Parameters.AddWithValue("@progId", programId);

        var tables = new List<(int Id, string Name, string Type, int? Link, string? Physical)>();
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                tables.Add((
                    reader.GetInt32(0),
                    reader.IsDBNull(1) ? "-" : reader.GetString(1),
                    reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetInt32(3),
                    reader.IsDBNull(4) ? null : reader.GetString(4)
                ));
            }
        }

        if (tables.Count == 0)
        {
            sb.AppendLine("*No tables used*");
            sb.AppendLine();
            return;
        }

        sb.AppendLine("| Table ID | Name | Physical | Access | Link |");
        sb.AppendLine("|----------|------|----------|--------|------|");

        foreach (var t in tables)
        {
            var accessType = t.Type switch
            {
                "R" => "Read",
                "W" => "Write",
                "L" => "Link",
                _ => t.Type
            };
            var link = t.Link?.ToString() ?? "-";
            var physical = t.Physical ?? "-";
            sb.AppendLine($"| {t.Id} | {t.Name} | {physical} | {accessType} | {link} |");
        }
        sb.AppendLine();
    }

    private static void AppendVariables(KnowledgeDb db, StringBuilder sb, long programId, int progIde, int mainOffset)
    {
        sb.AppendLine("## 4. Variables (DataView Columns)");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                tk.isn2,
                c.line_number,
                c.variable,
                c.name,
                c.data_type,
                c.picture,
                c.definition
            FROM columns c
            JOIN tasks tk ON c.task_id = tk.id
            WHERE tk.program_id = @progId
            ORDER BY tk.isn2, c.line_number
            LIMIT 50";
        cmd.Parameters.AddWithValue("@progId", programId);

        sb.AppendLine("| Task | Line | Variable | Name | Type | Definition |");
        sb.AppendLine("|------|------|----------|------|------|------------|");

        var count = 0;
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            count++;
            var isn2 = reader.GetInt32(0);
            var line = reader.GetInt32(1);
            var variable = reader.GetString(2);
            var name = reader.IsDBNull(3) ? "-" : reader.GetString(3);
            var type = reader.IsDBNull(4) ? "-" : reader.GetString(4);
            var definition = reader.IsDBNull(6) ? "-" : reader.GetString(6);

            if (name.Length > 20) name = name[..17] + "...";
            if (definition.Length > 20) definition = definition[..17] + "...";

            sb.AppendLine($"| {progIde}.{isn2} | {line} | {variable} | {name} | {type} | {definition} |");
        }

        sb.AppendLine();
        sb.AppendLine($"*Showing {count} variables (limited to 50)*");
        sb.AppendLine();
    }

    private static void AppendExpressions(KnowledgeDb db, StringBuilder sb, long programId)
    {
        sb.AppendLine("## 5. Key Expressions");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT xml_id, ide_position, content, comment
            FROM expressions
            WHERE program_id = @progId
            ORDER BY xml_id
            LIMIT 20";
        cmd.Parameters.AddWithValue("@progId", programId);

        var exprs = new List<(int Id, string Ide, string Content, string? Comment)>();
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                exprs.Add((
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3)
                ));
            }
        }

        if (exprs.Count == 0)
        {
            sb.AppendLine("*No expressions*");
            sb.AppendLine();
            return;
        }

        sb.AppendLine("| Expression | Content | Comment |");
        sb.AppendLine("|------------|---------|---------|");

        foreach (var e in exprs)
        {
            var content = e.Content.Length > 40 ? e.Content[..37] + "..." : e.Content;
            var comment = e.Comment?.Length > 20 ? e.Comment[..17] + "..." : e.Comment ?? "-";
            sb.AppendLine($"| {e.Ide} | `{content}` | {comment} |");
        }
        sb.AppendLine();
        sb.AppendLine($"*Showing {exprs.Count} expressions (limited to 20)*");
        sb.AppendLine();
    }

    private static void AppendCallGraph(KnowledgeDb db, StringBuilder sb, string project, int idePosition)
    {
        sb.AppendLine("## 6. Call Graph");
        sb.AppendLine();

        var callGraphService = new CallGraphService(db);
        var graph = callGraphService.GetCallGraph(project, idePosition, 2);

        // Callers
        sb.AppendLine("### Programs that call this (Callers)");
        sb.AppendLine();
        if (graph.Callers.Count == 0)
        {
            sb.AppendLine("*No callers found*");
        }
        else
        {
            sb.AppendLine("| Project | IDE | Name |");
            sb.AppendLine("|---------|-----|------|");
            foreach (var c in graph.Callers.Take(10))
            {
                sb.AppendLine($"| {c.ProjectName} | {c.ProgramIdePosition} | {c.ProgramName} |");
            }
            if (graph.Callers.Count > 10)
                sb.AppendLine($"*... and {graph.Callers.Count - 10} more*");
        }
        sb.AppendLine();

        // Callees
        sb.AppendLine("### Programs called by this (Callees)");
        sb.AppendLine();
        if (graph.Callees.Count == 0)
        {
            sb.AppendLine("*No callees found*");
        }
        else
        {
            sb.AppendLine("| Project | IDE | Name |");
            sb.AppendLine("|---------|-----|------|");
            foreach (var c in graph.Callees.Take(10))
            {
                sb.AppendLine($"| {c.ProjectName} | {c.ProgramIdePosition} | {c.ProgramName} |");
            }
            if (graph.Callees.Count > 10)
                sb.AppendLine($"*... and {graph.Callees.Count - 10} more*");
        }
        sb.AppendLine();
    }

    private static void AppendForms(KnowledgeDb db, StringBuilder sb, long programId, int progIde)
    {
        sb.AppendLine("## 7. UI Forms");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                tk.isn2,
                f.form_name,
                f.window_type,
                f.width,
                f.height
            FROM task_forms f
            JOIN tasks tk ON f.task_id = tk.id
            WHERE tk.program_id = @progId
            ORDER BY tk.isn2";
        cmd.Parameters.AddWithValue("@progId", programId);

        var forms = new List<(int TaskIsn2, string Name, int? WindowType, int? Width, int? Height)>();
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                forms.Add((
                    reader.GetInt32(0),
                    reader.IsDBNull(1) ? "-" : reader.GetString(1),
                    reader.IsDBNull(2) ? null : reader.GetInt32(2),
                    reader.IsDBNull(3) ? null : reader.GetInt32(3),
                    reader.IsDBNull(4) ? null : reader.GetInt32(4)
                ));
            }
        }

        if (forms.Count == 0)
        {
            sb.AppendLine("*No UI forms*");
            sb.AppendLine();
            return;
        }

        sb.AppendLine("| Task | Form Name | Window Type | Size (DLU) |");
        sb.AppendLine("|------|-----------|-------------|------------|");

        foreach (var f in forms)
        {
            var windowDesc = f.WindowType switch
            {
                1 => "Modal",
                2 => "SDI",
                3 => "MDI Child",
                _ => f.WindowType?.ToString() ?? "-"
            };
            var size = f.Width.HasValue && f.Height.HasValue
                ? $"{f.Width}x{f.Height}"
                : "-";
            sb.AppendLine($"| {progIde}.{f.TaskIsn2} | {f.Name} | {windowDesc} | {size} |");
        }
        sb.AppendLine();
    }

    private static void AppendLogicSummary(KnowledgeDb db, StringBuilder sb, long programId)
    {
        sb.AppendLine("## 8. Logic Summary");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                operation,
                COUNT(*) as count,
                SUM(CASE WHEN is_disabled = 1 THEN 1 ELSE 0 END) as disabled
            FROM logic_lines ll
            JOIN tasks t ON ll.task_id = t.id
            WHERE t.program_id = @progId
            GROUP BY operation
            ORDER BY count DESC";
        cmd.Parameters.AddWithValue("@progId", programId);

        sb.AppendLine("| Operation | Count | Disabled |");
        sb.AppendLine("|-----------|-------|----------|");

        var total = 0;
        var totalDisabled = 0;

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var op = reader.GetString(0);
            var count = reader.GetInt32(1);
            var disabled = reader.GetInt32(2);

            sb.AppendLine($"| {op} | {count} | {disabled} |");
            total += count;
            totalDisabled += disabled;
        }

        sb.AppendLine($"| **TOTAL** | **{total}** | **{totalDisabled}** |");
        sb.AppendLine();

        if (totalDisabled > 0)
        {
            var pct = total > 0 ? totalDisabled * 100.0 / total : 0;
            sb.AppendLine($"> **Note:** {pct:F1}% of logic lines are disabled.");
        }
    }

    [McpServerTool(Name = "magic_generate_migration_doc")]
    [Description("Generate a migration documentation for all programs in a project. " +
                 "Returns summary with complexity ranking and migration recommendations.")]
    public static string GenerateProjectMigrationDoc(
        KnowledgeDb db,
        MigrationExtractor extractor,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project)
    {
        var stats = extractor.GetProjectStats(project);
        if (stats == null)
            return $"ERROR: Project {project} not found";

        var programs = extractor.GetProgramInventory(project);
        var deps = extractor.GetCrossProjectDependencies(project);

        var sb = new StringBuilder();
        sb.AppendLine($"# Migration Documentation: {project}");
        sb.AppendLine();
        sb.AppendLine($"*Generated: {DateTime.Now:yyyy-MM-dd HH:mm}*");
        sb.AppendLine();

        // Executive Summary
        sb.AppendLine("## Executive Summary");
        sb.AppendLine();
        sb.AppendLine($"- **Total programs:** {stats.ProgramCount}");
        sb.AppendLine($"- **Total tasks:** {stats.TotalTasks}");
        sb.AppendLine($"- **Total expressions:** {stats.TotalExpressions}");
        sb.AppendLine($"- **Average complexity:** {stats.AverageComplexity:F1}");
        sb.AppendLine();

        // Complexity distribution
        var high = programs.Count(p => p.ComplexityScore > 1000);
        var medium = programs.Count(p => p.ComplexityScore >= 100 && p.ComplexityScore <= 1000);
        var low = programs.Count(p => p.ComplexityScore < 100);

        sb.AppendLine("### Effort Breakdown");
        sb.AppendLine();
        sb.AppendLine("| Complexity | Programs | % | Recommendation |");
        sb.AppendLine("|------------|----------|---|----------------|");
        sb.AppendLine($"| Simple (<100) | {low} | {(programs.Count > 0 ? low * 100 / programs.Count : 0)}% | Direct migration |");
        sb.AppendLine($"| Standard (100-1000) | {medium} | {(programs.Count > 0 ? medium * 100 / programs.Count : 0)}% | Careful analysis |");
        sb.AppendLine($"| Complex (>1000) | {high} | {(programs.Count > 0 ? high * 100 / programs.Count : 0)}% | Deep refactoring |");
        sb.AppendLine();

        // Migration order recommendation
        sb.AppendLine("## Migration Order");
        sb.AppendLine();

        // Start with standalone programs (no incoming calls, low complexity)
        var standalone = programs
            .Where(p => p.ComplexityScore < 100)
            .Where(p => !deps.IncomingCalls.Any(c => c.CalleeIde == p.IdePosition))
            .Take(10);

        sb.AppendLine("### Phase 1: Quick Wins (standalone, simple)");
        sb.AppendLine();
        if (standalone.Any())
        {
            foreach (var p in standalone)
            {
                sb.AppendLine($"- IDE {p.IdePosition}: {p.Name} (complexity: {p.ComplexityScore})");
            }
        }
        else
        {
            sb.AppendLine("*No standalone simple programs*");
        }
        sb.AppendLine();

        // Then shared components (many incoming calls)
        var shared = programs
            .Where(p => deps.IncomingCalls.Count(c => c.CalleeIde == p.IdePosition) > 2)
            .OrderByDescending(p => deps.IncomingCalls.Count(c => c.CalleeIde == p.IdePosition))
            .Take(10);

        sb.AppendLine("### Phase 2: Shared Components (frequently called)");
        sb.AppendLine();
        if (shared.Any())
        {
            foreach (var p in shared)
            {
                var callerCount = deps.IncomingCalls.Count(c => c.CalleeIde == p.IdePosition);
                sb.AppendLine($"- IDE {p.IdePosition}: {p.Name} ({callerCount} callers)");
            }
        }
        else
        {
            sb.AppendLine("*No shared components identified*");
        }
        sb.AppendLine();

        // Complex programs last
        sb.AppendLine("### Phase 3: Complex Programs (require deep analysis)");
        sb.AppendLine();
        foreach (var p in programs.Where(p => p.ComplexityScore > 1000).Take(10))
        {
            sb.AppendLine($"- IDE {p.IdePosition}: {p.Name} (complexity: {p.ComplexityScore})");
        }
        sb.AppendLine();

        // Dependencies
        sb.AppendLine("## Cross-Project Dependencies");
        sb.AppendLine();
        sb.AppendLine($"- **Incoming:** {deps.IncomingCalls.Count} calls from other projects");
        sb.AppendLine($"- **Outgoing:** {deps.OutgoingCalls.Count} calls to other projects");
        sb.AppendLine();

        if (deps.IncomingCalls.Count > 0)
        {
            var callerProjects = deps.IncomingCalls.GroupBy(c => c.CallerProject);
            sb.AppendLine("### Who depends on this project?");
            sb.AppendLine();
            foreach (var g in callerProjects)
            {
                sb.AppendLine($"- **{g.Key}:** {g.Count()} calls");
            }
            sb.AppendLine();
        }

        return sb.ToString();
    }
}
