using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Change Impact Analysis - "If I modify X, what breaks?"
/// </summary>
[McpServerToolType]
public static class ChangeImpactTool
{
    [McpServerTool(Name = "magic_impact_program")]
    [Description("Analyze impact of modifying a program. Shows all callers, callees, and shared dependencies.")]
    public static string AnalyzeProgramImpact(
        KnowledgeDb db,
        [Description("Project name (e.g., ADH, PBP)")] string project,
        [Description("Program IDE position")] int programId)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Change Impact Analysis: {project} IDE {programId}");
        sb.AppendLine();

        // Get program info
        using var progCmd = db.Connection.CreateCommand();
        progCmd.CommandText = @"
            SELECT p.id, p.name, p.public_name, p.task_count, p.expression_count
            FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        progCmd.Parameters.AddWithValue("@project", project);
        progCmd.Parameters.AddWithValue("@ide", programId);

        long dbProgramId = 0;
        string? programName = null;
        string? publicName = null;

        using (var reader = progCmd.ExecuteReader())
        {
            if (!reader.Read())
            {
                return $"ERROR: Program {project} IDE {programId} not found";
            }
            dbProgramId = reader.GetInt64(0);
            programName = reader.GetString(1);
            publicName = reader.IsDBNull(2) ? null : reader.GetString(2);
        }

        sb.AppendLine($"**Program**: {programName}");
        if (!string.IsNullOrEmpty(publicName))
            sb.AppendLine($"**Public Name**: {publicName}");
        sb.AppendLine();

        var impacts = new List<ImpactRecord>();

        // 1. Direct callers (who calls this program?)
        sb.AppendLine("### 1. Direct Callers (programs that call this)");
        sb.AppendLine();

        using var callersCmd = db.Connection.CreateCommand();
        callersCmd.CommandText = @"
            SELECT DISTINCT pr.name, p.ide_position, p.name, p.public_name
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects pr ON p.project_id = pr.id
            WHERE pc.callee_program_id = @prog_id
            ORDER BY pr.name, p.ide_position";
        callersCmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        var callers = new List<(string Project, int Ide, string Name, string? Public)>();
        using (var reader = callersCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                callers.Add((
                    reader.GetString(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3)
                ));
            }
        }

        if (callers.Count > 0)
        {
            sb.AppendLine("| Project | IDE | Program | Severity |");
            sb.AppendLine("|---------|-----|---------|----------|");
            foreach (var c in callers)
            {
                var severity = c.Project == project ? "HIGH" : "CRITICAL";
                sb.AppendLine($"| {c.Project} | {c.Ide} | {c.Name} | **{severity}** |");
                impacts.Add(new ImpactRecord("called_by", c.Project, c.Ide, severity));
            }
            sb.AppendLine();
            sb.AppendLine($"> **{callers.Count} caller(s)** would be affected by changes to this program's interface.");
        }
        else
        {
            sb.AppendLine("*No callers found - this program is a leaf or entry point.*");
        }
        sb.AppendLine();

        // 2. Direct callees (what does this program call?)
        sb.AppendLine("### 2. Direct Callees (programs this calls)");
        sb.AppendLine();

        using var calleesCmd = db.Connection.CreateCommand();
        calleesCmd.CommandText = @"
            SELECT DISTINCT pr.name, p.ide_position, p.name, p.public_name
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs p ON pc.callee_program_id = p.id
            JOIN projects pr ON p.project_id = pr.id
            WHERE t.program_id = @prog_id
            ORDER BY pr.name, p.ide_position";
        calleesCmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        var callees = new List<(string Project, int Ide, string Name, string? Public)>();
        using (var reader = calleesCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                callees.Add((
                    reader.GetString(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3)
                ));
            }
        }

        if (callees.Count > 0)
        {
            sb.AppendLine("| Project | IDE | Program | Impact |");
            sb.AppendLine("|---------|-----|---------|--------|");
            foreach (var c in callees)
            {
                var impact = c.Project != project ? "cross-project" : "internal";
                sb.AppendLine($"| {c.Project} | {c.Ide} | {c.Name} | {impact} |");
                impacts.Add(new ImpactRecord("calls", c.Project, c.Ide, "medium"));
            }
            sb.AppendLine();
            sb.AppendLine($"> Changes to **{callees.Count} callee(s)** could affect this program.");
        }
        else
        {
            sb.AppendLine("*No callees - this program doesn't call other programs.*");
        }
        sb.AppendLine();

        // 3. Table dependencies
        sb.AppendLine("### 3. Table Dependencies");
        sb.AppendLine();

        using var tablesCmd = db.Connection.CreateCommand();
        tablesCmd.CommandText = @"
            SELECT DISTINCT tu.table_id, tu.table_name, tu.usage_type
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            WHERE t.program_id = @prog_id
            ORDER BY tu.table_name";
        tablesCmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        var tables = new List<(int Id, string? Name, string Usage)>();
        using (var reader = tablesCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                tables.Add((
                    reader.GetInt32(0),
                    reader.IsDBNull(1) ? null : reader.GetString(1),
                    reader.GetString(2)
                ));
            }
        }

        if (tables.Count > 0)
        {
            sb.AppendLine("| Table ID | Name | Usage |");
            sb.AppendLine("|----------|------|-------|");
            foreach (var t in tables)
            {
                var usageDesc = t.Usage switch
                {
                    "R" => "Read",
                    "W" => "Write",
                    "L" => "Link",
                    _ => t.Usage
                };
                sb.AppendLine($"| {t.Id} | {t.Name ?? "-"} | {usageDesc} |");
            }
            sb.AppendLine();

            // Find other programs using same tables (potential conflicts)
            var writeTableIds = tables.Where(t => t.Usage == "W").Select(t => t.Id).ToList();
            if (writeTableIds.Count > 0)
            {
                sb.AppendLine("**Programs sharing WRITE tables (potential conflicts):**");
                sb.AppendLine();

                using var conflictCmd = db.Connection.CreateCommand();
                conflictCmd.CommandText = $@"
                    SELECT DISTINCT pr.name, p.ide_position, p.name, tu.table_name
                    FROM table_usage tu
                    JOIN tasks t ON tu.task_id = t.id
                    JOIN programs p ON t.program_id = p.id
                    JOIN projects pr ON p.project_id = pr.id
                    WHERE tu.table_id IN ({string.Join(",", writeTableIds)})
                      AND tu.usage_type = 'W'
                      AND p.id != @prog_id
                    ORDER BY pr.name, p.ide_position
                    LIMIT 20";
                conflictCmd.Parameters.AddWithValue("@prog_id", dbProgramId);

                using var conflictReader = conflictCmd.ExecuteReader();
                var hasConflicts = false;
                while (conflictReader.Read())
                {
                    if (!hasConflicts)
                    {
                        sb.AppendLine("| Project | IDE | Program | Table |");
                        sb.AppendLine("|---------|-----|---------|-------|");
                        hasConflicts = true;
                    }
                    sb.AppendLine($"| {conflictReader[0]} | {conflictReader[1]} | {conflictReader[2]} | {conflictReader[3]} |");
                }

                if (!hasConflicts)
                {
                    sb.AppendLine("*No other programs write to the same tables.*");
                }
            }
        }
        else
        {
            sb.AppendLine("*No table dependencies found.*");
        }
        sb.AppendLine();

        // 4. ECF membership
        sb.AppendLine("### 4. ECF Membership");
        sb.AppendLine();

        using var ecfCmd = db.Connection.CreateCommand();
        ecfCmd.CommandText = @"
            SELECT ecf_name, component_group, used_by_projects
            FROM shared_components
            WHERE owner_project = @project AND program_ide_position = @ide";
        ecfCmd.Parameters.AddWithValue("@project", project);
        ecfCmd.Parameters.AddWithValue("@ide", programId);

        using (var reader = ecfCmd.ExecuteReader())
        {
            if (reader.Read())
            {
                var ecfName = reader.GetString(0);
                var group = reader.IsDBNull(1) ? "-" : reader.GetString(1);
                var usedBy = reader.IsDBNull(2) ? "[]" : reader.GetString(2);

                sb.AppendLine($"**This program is shared via {ecfName}**");
                sb.AppendLine();
                sb.AppendLine($"- Component group: {group}");
                sb.AppendLine($"- Used by projects: {usedBy}");
                sb.AppendLine();
                sb.AppendLine("> **WARNING**: Changes to this program affect ALL projects using this ECF!");
            }
            else
            {
                sb.AppendLine("*This program is not part of a shared ECF component.*");
            }
        }
        sb.AppendLine();

        // Summary
        sb.AppendLine("### Impact Summary");
        sb.AppendLine();

        var criticalCount = impacts.Count(i => i.Severity == "CRITICAL");
        var highCount = impacts.Count(i => i.Severity == "HIGH");
        var totalCount = impacts.Count;

        string overallRisk;
        if (criticalCount > 0)
            overallRisk = "CRITICAL - Cross-project dependencies";
        else if (highCount > 3)
            overallRisk = "HIGH - Many internal dependencies";
        else if (totalCount > 0)
            overallRisk = "MEDIUM - Some dependencies";
        else
            overallRisk = "LOW - Minimal dependencies";

        sb.AppendLine($"| Metric | Value |");
        sb.AppendLine($"|--------|-------|");
        sb.AppendLine($"| Callers | {callers.Count} |");
        sb.AppendLine($"| Callees | {callees.Count} |");
        sb.AppendLine($"| Tables | {tables.Count} |");
        sb.AppendLine($"| Cross-project callers | {callers.Count(c => c.Project != project)} |");
        sb.AppendLine($"| **Overall Risk** | **{overallRisk}** |");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_impact_table")]
    [Description("Analyze impact of modifying a table. Shows all programs that read/write this table.")]
    public static string AnalyzeTableImpact(
        KnowledgeDb db,
        [Description("Table ID or name")] string tableIdOrName)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Change Impact Analysis: Table {tableIdOrName}");
        sb.AppendLine();

        // Try to find table by ID or name
        using var tableCmd = db.Connection.CreateCommand();
        if (int.TryParse(tableIdOrName, out var tableId))
        {
            tableCmd.CommandText = @"
                SELECT xml_id, logical_name, physical_name, column_count
                FROM tables WHERE xml_id = @id OR ide_position = @id";
            tableCmd.Parameters.AddWithValue("@id", tableId);
        }
        else
        {
            tableCmd.CommandText = @"
                SELECT xml_id, logical_name, physical_name, column_count
                FROM tables WHERE logical_name LIKE @name OR physical_name LIKE @name";
            tableCmd.Parameters.AddWithValue("@name", $"%{tableIdOrName}%");
        }

        int foundTableId = 0;
        string? tableName = null;
        string? physicalName = null;

        using (var reader = tableCmd.ExecuteReader())
        {
            if (!reader.Read())
            {
                return $"ERROR: Table '{tableIdOrName}' not found";
            }
            foundTableId = reader.GetInt32(0);
            tableName = reader.GetString(1);
            physicalName = reader.IsDBNull(2) ? null : reader.GetString(2);
        }

        sb.AppendLine($"**Table**: {tableName}");
        if (!string.IsNullOrEmpty(physicalName))
            sb.AppendLine($"**Physical**: {physicalName}");
        sb.AppendLine($"**ID**: {foundTableId}");
        sb.AppendLine();

        // Find all programs using this table
        using var usageCmd = db.Connection.CreateCommand();
        usageCmd.CommandText = @"
            SELECT pr.name, p.ide_position, p.name, tu.usage_type,
                   COUNT(*) as usage_count
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects pr ON p.project_id = pr.id
            WHERE tu.table_id = @table_id
            GROUP BY pr.name, p.ide_position, p.name, tu.usage_type
            ORDER BY tu.usage_type, pr.name, p.ide_position";
        usageCmd.Parameters.AddWithValue("@table_id", foundTableId);

        var readers = new List<(string Project, int Ide, string Name, int Count)>();
        var writers = new List<(string Project, int Ide, string Name, int Count)>();
        var links = new List<(string Project, int Ide, string Name, int Count)>();

        using (var reader = usageCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                var entry = (
                    reader.GetString(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.GetInt32(4)
                );
                var usageType = reader.GetString(3);
                switch (usageType)
                {
                    case "R": readers.Add(entry); break;
                    case "W": writers.Add(entry); break;
                    case "L": links.Add(entry); break;
                }
            }
        }

        // Writers (highest risk)
        sb.AppendLine("### Writers (HIGH RISK)");
        sb.AppendLine();
        if (writers.Count > 0)
        {
            sb.AppendLine("| Project | IDE | Program | Uses |");
            sb.AppendLine("|---------|-----|---------|------|");
            foreach (var w in writers)
            {
                sb.AppendLine($"| {w.Project} | {w.Ide} | {w.Name} | {w.Count} |");
            }
            sb.AppendLine();
            sb.AppendLine($"> **{writers.Count} program(s)** write to this table. Schema changes are HIGH RISK.");
        }
        else
        {
            sb.AppendLine("*No programs write to this table.*");
        }
        sb.AppendLine();

        // Readers
        sb.AppendLine("### Readers (MEDIUM RISK)");
        sb.AppendLine();
        if (readers.Count > 0)
        {
            sb.AppendLine("| Project | IDE | Program | Uses |");
            sb.AppendLine("|---------|-----|---------|------|");
            foreach (var r in readers.Take(20))
            {
                sb.AppendLine($"| {r.Project} | {r.Ide} | {r.Name} | {r.Count} |");
            }
            if (readers.Count > 20)
                sb.AppendLine($"| ... | ... | *{readers.Count - 20} more* | ... |");
            sb.AppendLine();
            sb.AppendLine($"> **{readers.Count} program(s)** read from this table.");
        }
        else
        {
            sb.AppendLine("*No programs read from this table.*");
        }
        sb.AppendLine();

        // Links
        if (links.Count > 0)
        {
            sb.AppendLine("### Links");
            sb.AppendLine();
            sb.AppendLine($"{links.Count} program(s) use this table as a link.");
        }

        // Summary
        sb.AppendLine();
        sb.AppendLine("### Impact Summary");
        sb.AppendLine();

        var projectsAffected = writers.Concat(readers).Concat(links)
            .Select(x => x.Project).Distinct().ToList();

        string risk;
        if (writers.Count > 5 || projectsAffected.Count > 2)
            risk = "CRITICAL";
        else if (writers.Count > 0)
            risk = "HIGH";
        else if (readers.Count > 10)
            risk = "MEDIUM";
        else
            risk = "LOW";

        sb.AppendLine($"| Metric | Value |");
        sb.AppendLine($"|--------|-------|");
        sb.AppendLine($"| Writers | {writers.Count} |");
        sb.AppendLine($"| Readers | {readers.Count} |");
        sb.AppendLine($"| Links | {links.Count} |");
        sb.AppendLine($"| Projects affected | {string.Join(", ", projectsAffected)} |");
        sb.AppendLine($"| **Risk Level** | **{risk}** |");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_impact_expression")]
    [Description("Find all programs using a specific expression pattern or function.")]
    public static string AnalyzeExpressionImpact(
        KnowledgeDb db,
        [Description("Expression pattern to search (e.g., 'ProgIdx', 'SOLDE')")] string pattern,
        [Description("Limit results (default: 30)")] int limit = 30)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Expression Impact Analysis: '{pattern}'");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT pr.name, p.ide_position, p.name, e.xml_id, e.content
            FROM expressions e
            JOIN programs p ON e.program_id = p.id
            JOIN projects pr ON p.project_id = pr.id
            WHERE e.content LIKE @pattern
            ORDER BY pr.name, p.ide_position
            LIMIT @limit";
        cmd.Parameters.AddWithValue("@pattern", $"%{pattern}%");
        cmd.Parameters.AddWithValue("@limit", limit);

        var results = new List<(string Project, int Ide, string Name, int ExprId, string Content)>();
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                results.Add((
                    reader.GetString(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.GetInt32(3),
                    reader.GetString(4)
                ));
            }
        }

        if (results.Count == 0)
        {
            sb.AppendLine($"*No expressions found matching '{pattern}'*");
            return sb.ToString();
        }

        sb.AppendLine($"Found **{results.Count}** expression(s) matching '{pattern}':");
        sb.AppendLine();

        // Group by project
        var byProject = results.GroupBy(r => r.Project);
        foreach (var group in byProject)
        {
            sb.AppendLine($"### {group.Key} ({group.Count()} matches)");
            sb.AppendLine();
            sb.AppendLine("| IDE | Program | Expr ID | Content (truncated) |");
            sb.AppendLine("|-----|---------|---------|---------------------|");

            foreach (var r in group)
            {
                var content = r.Content.Length > 40 ? r.Content[..37] + "..." : r.Content;
                content = content.Replace("|", "\\|").Replace("\n", " ");
                sb.AppendLine($"| {r.Ide} | {r.Name} | {r.ExprId} | `{content}` |");
            }
            sb.AppendLine();
        }

        // Summary
        sb.AppendLine("### Impact Summary");
        sb.AppendLine();
        sb.AppendLine($"| Metric | Value |");
        sb.AppendLine($"|--------|-------|");
        sb.AppendLine($"| Total matches | {results.Count} |");
        sb.AppendLine($"| Projects | {byProject.Count()} ({string.Join(", ", byProject.Select(g => g.Key))}) |");
        sb.AppendLine($"| Programs | {results.Select(r => (r.Project, r.Ide)).Distinct().Count()} |");

        if (results.Count >= limit)
        {
            sb.AppendLine();
            sb.AppendLine($"> *Results limited to {limit}. Use a more specific pattern for complete analysis.*");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_impact_crossproject")]
    [Description("Show all cross-project dependencies for a given project.")]
    public static string AnalyzeCrossProjectImpact(
        KnowledgeDb db,
        [Description("Project to analyze (e.g., ADH)")] string project)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Cross-Project Impact Analysis: {project}");
        sb.AppendLine();

        // Incoming calls (other projects calling this one)
        sb.AppendLine("### Incoming Dependencies (other projects → this)");
        sb.AppendLine();

        using var inCmd = db.Connection.CreateCommand();
        inCmd.CommandText = @"
            SELECT caller_pr.name as caller_project, caller_p.ide_position, caller_p.name,
                   callee_p.ide_position as callee_ide, callee_p.name as callee_name
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs caller_p ON t.program_id = caller_p.id
            JOIN projects caller_pr ON caller_p.project_id = caller_pr.id
            JOIN programs callee_p ON pc.callee_program_id = callee_p.id
            JOIN projects callee_pr ON callee_p.project_id = callee_pr.id
            WHERE callee_pr.name = @project AND caller_pr.name != @project
            ORDER BY caller_pr.name, caller_p.ide_position";
        inCmd.Parameters.AddWithValue("@project", project);

        var incoming = new List<(string CallerProject, int CallerIde, string CallerName, int CalleeIde, string CalleeName)>();
        using (var reader = inCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                incoming.Add((
                    reader.GetString(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.GetInt32(3),
                    reader.GetString(4)
                ));
            }
        }

        if (incoming.Count > 0)
        {
            var byCallerProject = incoming.GroupBy(i => i.CallerProject);
            foreach (var group in byCallerProject)
            {
                sb.AppendLine($"**From {group.Key}** ({group.Count()} calls):");
                sb.AppendLine();
                sb.AppendLine("| Caller IDE | Caller Program | → | Target IDE | Target Program |");
                sb.AppendLine("|------------|----------------|---|------------|----------------|");
                foreach (var call in group.Take(10))
                {
                    sb.AppendLine($"| {call.CallerIde} | {call.CallerName} | → | {call.CalleeIde} | {call.CalleeName} |");
                }
                if (group.Count() > 10)
                    sb.AppendLine($"| ... | *{group.Count() - 10} more* | | | |");
                sb.AppendLine();
            }
        }
        else
        {
            sb.AppendLine("*No other projects call programs in this project.*");
            sb.AppendLine();
        }

        // Outgoing calls (this project calling others)
        sb.AppendLine("### Outgoing Dependencies (this → other projects)");
        sb.AppendLine();

        using var outCmd = db.Connection.CreateCommand();
        outCmd.CommandText = @"
            SELECT caller_p.ide_position, caller_p.name,
                   callee_pr.name as callee_project, callee_p.ide_position, callee_p.name
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs caller_p ON t.program_id = caller_p.id
            JOIN projects caller_pr ON caller_p.project_id = caller_pr.id
            JOIN programs callee_p ON pc.callee_program_id = callee_p.id
            JOIN projects callee_pr ON callee_p.project_id = callee_pr.id
            WHERE caller_pr.name = @project AND callee_pr.name != @project
            ORDER BY callee_pr.name, caller_p.ide_position";
        outCmd.Parameters.AddWithValue("@project", project);

        var outgoing = new List<(int CallerIde, string CallerName, string CalleeProject, int CalleeIde, string CalleeName)>();
        using (var reader = outCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                outgoing.Add((
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetInt32(3),
                    reader.GetString(4)
                ));
            }
        }

        if (outgoing.Count > 0)
        {
            var byCalleeProject = outgoing.GroupBy(o => o.CalleeProject);
            foreach (var group in byCalleeProject)
            {
                sb.AppendLine($"**To {group.Key}** ({group.Count()} calls):");
                sb.AppendLine();
                sb.AppendLine("| Caller IDE | Caller Program | → | Target IDE | Target Program |");
                sb.AppendLine("|------------|----------------|---|------------|----------------|");
                foreach (var call in group.Take(10))
                {
                    sb.AppendLine($"| {call.CallerIde} | {call.CallerName} | → | {call.CalleeIde} | {call.CalleeName} |");
                }
                if (group.Count() > 10)
                    sb.AppendLine($"| ... | *{group.Count() - 10} more* | | | |");
                sb.AppendLine();
            }
        }
        else
        {
            sb.AppendLine("*This project doesn't call programs in other projects.*");
            sb.AppendLine();
        }

        // Summary
        sb.AppendLine("### Cross-Project Summary");
        sb.AppendLine();

        var inProjects = incoming.Select(i => i.CallerProject).Distinct().ToList();
        var outProjects = outgoing.Select(o => o.CalleeProject).Distinct().ToList();

        sb.AppendLine($"| Direction | Projects | Calls |");
        sb.AppendLine($"|-----------|----------|-------|");
        sb.AppendLine($"| Incoming | {string.Join(", ", inProjects)} | {incoming.Count} |");
        sb.AppendLine($"| Outgoing | {string.Join(", ", outProjects)} | {outgoing.Count} |");
        sb.AppendLine();

        string coupling;
        if (incoming.Count > 50 || outgoing.Count > 50)
            coupling = "CRITICAL - Very high coupling";
        else if (incoming.Count > 20 || outgoing.Count > 20)
            coupling = "HIGH - Significant coupling";
        else if (incoming.Count > 0 || outgoing.Count > 0)
            coupling = "MEDIUM - Some coupling";
        else
            coupling = "LOW - Isolated project";

        sb.AppendLine($"**Coupling Level**: {coupling}");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_precheck_change")]
    [Description(@"Pre-flight check before making changes. Returns PASS/WARN/BLOCK with recommendations.
Use BEFORE modifying any program, table, or expression to prevent regressions.

Examples:
- magic_precheck_change('table', '849') - Check impact of modifying table 849
- magic_precheck_change('program', 'ADH:238') - Check impact of modifying ADH IDE 238
- magic_precheck_change('expression', 'ProgIdx') - Check programs using ProgIdx()")]
    public static string PrecheckChange(
        KnowledgeDb db,
        [Description("Change type: 'table', 'program', or 'expression'")] string changeType,
        [Description("Target: table ID, program (PROJECT:IDE), or expression pattern")] string target)
    {
        var sb = new StringBuilder();
        sb.AppendLine("# Pre-Change Check Report");
        sb.AppendLine();

        var warnings = new List<string>();
        var blockers = new List<string>();
        var recommendations = new List<string>();

        switch (changeType.ToLower())
        {
            case "table":
                PrecheckTableChange(db, target, sb, warnings, blockers, recommendations);
                break;

            case "program":
                PrecheckProgramChange(db, target, sb, warnings, blockers, recommendations);
                break;

            case "expression":
                PrecheckExpressionChange(db, target, sb, warnings, blockers, recommendations);
                break;

            default:
                return $"ERROR: Unknown change type '{changeType}'. Use 'table', 'program', or 'expression'.";
        }

        // Verdict
        sb.AppendLine();
        sb.AppendLine("## Verdict");
        sb.AppendLine();

        if (blockers.Count > 0)
        {
            sb.AppendLine("### **BLOCKED** - Do NOT proceed without review");
            sb.AppendLine();
            foreach (var b in blockers)
                sb.AppendLine($"- {b}");
            sb.AppendLine();
            sb.AppendLine("> Contact tech lead before making this change.");
        }
        else if (warnings.Count >= 3)
        {
            sb.AppendLine("### **CAUTION** - High-impact change");
            sb.AppendLine();
            foreach (var w in warnings)
                sb.AppendLine($"- {w}");
        }
        else if (warnings.Count > 0)
        {
            sb.AppendLine("### **PASS WITH WARNINGS**");
            sb.AppendLine();
            foreach (var w in warnings)
                sb.AppendLine($"- {w}");
        }
        else
        {
            sb.AppendLine("### **PASS** - Low-risk change");
            sb.AppendLine();
            sb.AppendLine("No significant impact detected.");
        }

        if (recommendations.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("## Recommendations");
            sb.AppendLine();
            for (int i = 0; i < recommendations.Count; i++)
            {
                sb.AppendLine($"{i + 1}. {recommendations[i]}");
            }
        }

        return sb.ToString();
    }

    private static void PrecheckTableChange(
        KnowledgeDb db, string tableIdOrName,
        StringBuilder sb, List<string> warnings, List<string> blockers, List<string> recommendations)
    {
        sb.AppendLine($"## Checking Table: {tableIdOrName}");
        sb.AppendLine();

        // Find table
        using var tableCmd = db.Connection.CreateCommand();
        if (int.TryParse(tableIdOrName, out var tableId))
        {
            tableCmd.CommandText = @"SELECT xml_id, logical_name FROM tables WHERE xml_id = @id OR ide_position = @id";
            tableCmd.Parameters.AddWithValue("@id", tableId);
        }
        else
        {
            tableCmd.CommandText = @"SELECT xml_id, logical_name FROM tables WHERE logical_name LIKE @name OR physical_name LIKE @name LIMIT 1";
            tableCmd.Parameters.AddWithValue("@name", $"%{tableIdOrName}%");
        }

        int foundTableId;
        string? tableName = null;
        using (var reader = tableCmd.ExecuteReader())
        {
            if (!reader.Read())
            {
                sb.AppendLine($"*Table '{tableIdOrName}' not found in KB*");
                warnings.Add("Table not indexed - manual verification required");
                return;
            }
            foundTableId = reader.GetInt32(0);
            tableName = reader.GetString(1);
        }

        sb.AppendLine($"**Table**: {tableName} (#{foundTableId})");
        sb.AppendLine();

        // Count writers
        using var writerCmd = db.Connection.CreateCommand();
        writerCmd.CommandText = @"
            SELECT COUNT(DISTINCT p.id)
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            WHERE tu.table_id = @table_id AND tu.usage_type = 'W'";
        writerCmd.Parameters.AddWithValue("@table_id", foundTableId);
        var writerCount = Convert.ToInt32(writerCmd.ExecuteScalar() ?? 0);

        // Count readers
        using var readerCmd = db.Connection.CreateCommand();
        readerCmd.CommandText = @"
            SELECT COUNT(DISTINCT p.id)
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            WHERE tu.table_id = @table_id AND tu.usage_type = 'R'";
        readerCmd.Parameters.AddWithValue("@table_id", foundTableId);
        var readerCount = Convert.ToInt32(readerCmd.ExecuteScalar() ?? 0);

        // Count projects
        using var projCmd = db.Connection.CreateCommand();
        projCmd.CommandText = @"
            SELECT COUNT(DISTINCT pr.id)
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects pr ON p.project_id = pr.id
            WHERE tu.table_id = @table_id";
        projCmd.Parameters.AddWithValue("@table_id", foundTableId);
        var projectCount = Convert.ToInt32(projCmd.ExecuteScalar() ?? 0);

        sb.AppendLine($"| Metric | Value |");
        sb.AppendLine($"|--------|-------|");
        sb.AppendLine($"| Writers | {writerCount} |");
        sb.AppendLine($"| Readers | {readerCount} |");
        sb.AppendLine($"| Projects | {projectCount} |");
        sb.AppendLine();

        // Apply rules
        if (projectCount > 2)
        {
            blockers.Add($"Table #{foundTableId} is used by {projectCount} projects - cross-project impact");
        }
        else if (writerCount > 5)
        {
            blockers.Add($"Table #{foundTableId} has {writerCount} writers - schema change is HIGH RISK");
        }

        if (writerCount > 3)
        {
            warnings.Add($"{writerCount} programs write to this table");
        }

        if (readerCount > 10)
        {
            warnings.Add($"{readerCount} programs read from this table");
        }

        // Get top writers for recommendations
        using var topWritersCmd = db.Connection.CreateCommand();
        topWritersCmd.CommandText = @"
            SELECT pr.name, p.ide_position, p.name
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects pr ON p.project_id = pr.id
            WHERE tu.table_id = @table_id AND tu.usage_type = 'W'
            GROUP BY p.id
            ORDER BY COUNT(*) DESC
            LIMIT 5";
        topWritersCmd.Parameters.AddWithValue("@table_id", foundTableId);

        var priority = new List<string>();
        using (var reader = topWritersCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                priority.Add($"{reader.GetString(0)} IDE {reader.GetInt32(1)}");
            }
        }

        if (priority.Count > 0)
        {
            recommendations.Add($"Test writers first: {string.Join(", ", priority)}");
        }
        recommendations.Add($"Run `magic_impact_table {foundTableId}` for full analysis");
    }

    private static void PrecheckProgramChange(
        KnowledgeDb db, string programRef,
        StringBuilder sb, List<string> warnings, List<string> blockers, List<string> recommendations)
    {
        sb.AppendLine($"## Checking Program: {programRef}");
        sb.AppendLine();

        // Parse PROJECT:IDE format
        if (!System.Text.RegularExpressions.Regex.IsMatch(programRef, @"^([A-Z]+):(\d+)$"))
        {
            sb.AppendLine($"*Invalid format '{programRef}'. Use PROJECT:IDE (e.g., ADH:238)*");
            return;
        }

        var parts = programRef.Split(':');
        var project = parts[0];
        var ide = int.Parse(parts[1]);

        // Find program
        using var progCmd = db.Connection.CreateCommand();
        progCmd.CommandText = @"
            SELECT p.id, p.name, p.public_name
            FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        progCmd.Parameters.AddWithValue("@project", project);
        progCmd.Parameters.AddWithValue("@ide", ide);

        long dbProgId;
        string? progName = null;
        string? publicName = null;
        using (var reader = progCmd.ExecuteReader())
        {
            if (!reader.Read())
            {
                sb.AppendLine($"*Program {project} IDE {ide} not found in KB*");
                warnings.Add("Program not indexed - manual verification required");
                return;
            }
            dbProgId = reader.GetInt64(0);
            progName = reader.GetString(1);
            publicName = reader.IsDBNull(2) ? null : reader.GetString(2);
        }

        sb.AppendLine($"**Program**: {progName}");
        if (!string.IsNullOrEmpty(publicName))
            sb.AppendLine($"**Public Name**: {publicName}");
        sb.AppendLine();

        // Count callers
        using var callerCmd = db.Connection.CreateCommand();
        callerCmd.CommandText = @"
            SELECT COUNT(DISTINCT t.program_id)
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            WHERE pc.callee_program_id = @prog_id";
        callerCmd.Parameters.AddWithValue("@prog_id", dbProgId);
        var callerCount = Convert.ToInt32(callerCmd.ExecuteScalar() ?? 0);

        // Check cross-project callers
        using var crossCallerCmd = db.Connection.CreateCommand();
        crossCallerCmd.CommandText = @"
            SELECT COUNT(DISTINCT t.program_id)
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects pr ON p.project_id = pr.id
            WHERE pc.callee_program_id = @prog_id AND pr.name != @project";
        crossCallerCmd.Parameters.AddWithValue("@prog_id", dbProgId);
        crossCallerCmd.Parameters.AddWithValue("@project", project);
        var crossCallerCount = Convert.ToInt32(crossCallerCmd.ExecuteScalar() ?? 0);

        // Check ECF membership
        using var ecfCmd = db.Connection.CreateCommand();
        ecfCmd.CommandText = @"SELECT ecf_name FROM shared_components WHERE owner_project = @project AND program_ide_position = @ide";
        ecfCmd.Parameters.AddWithValue("@project", project);
        ecfCmd.Parameters.AddWithValue("@ide", ide);
        var ecfName = ecfCmd.ExecuteScalar() as string;

        sb.AppendLine($"| Metric | Value |");
        sb.AppendLine($"|--------|-------|");
        sb.AppendLine($"| Callers | {callerCount} |");
        sb.AppendLine($"| Cross-project callers | {crossCallerCount} |");
        sb.AppendLine($"| ECF | {ecfName ?? "-"} |");
        sb.AppendLine();

        // Apply rules
        if (!string.IsNullOrEmpty(ecfName))
        {
            blockers.Add($"Program is shared via {ecfName} - affects multiple projects");
        }

        if (crossCallerCount > 0)
        {
            blockers.Add($"{crossCallerCount} cross-project caller(s) - breaking change affects other projects");
        }

        if (callerCount > 10)
        {
            warnings.Add($"{callerCount} programs call this one - interface changes are high-risk");
        }
        else if (callerCount > 3)
        {
            warnings.Add($"{callerCount} programs call this one");
        }

        recommendations.Add($"Run `magic_impact_program {project} {ide}` for full analysis");
        if (callerCount > 0)
        {
            recommendations.Add($"Test all callers after changes");
        }
    }

    private static void PrecheckExpressionChange(
        KnowledgeDb db, string pattern,
        StringBuilder sb, List<string> warnings, List<string> blockers, List<string> recommendations)
    {
        sb.AppendLine($"## Checking Expression Pattern: {pattern}");
        sb.AppendLine();

        // Count occurrences
        using var countCmd = db.Connection.CreateCommand();
        countCmd.CommandText = @"SELECT COUNT(*) FROM expressions WHERE content LIKE @pattern";
        countCmd.Parameters.AddWithValue("@pattern", $"%{pattern}%");
        var count = Convert.ToInt32(countCmd.ExecuteScalar() ?? 0);

        // Count affected programs
        using var progCountCmd = db.Connection.CreateCommand();
        progCountCmd.CommandText = @"
            SELECT COUNT(DISTINCT e.program_id)
            FROM expressions e
            WHERE e.content LIKE @pattern";
        progCountCmd.Parameters.AddWithValue("@pattern", $"%{pattern}%");
        var programCount = Convert.ToInt32(progCountCmd.ExecuteScalar() ?? 0);

        // Count affected projects
        using var projCountCmd = db.Connection.CreateCommand();
        projCountCmd.CommandText = @"
            SELECT COUNT(DISTINCT pr.id)
            FROM expressions e
            JOIN programs p ON e.program_id = p.id
            JOIN projects pr ON p.project_id = pr.id
            WHERE e.content LIKE @pattern";
        projCountCmd.Parameters.AddWithValue("@pattern", $"%{pattern}%");
        var projectCount = Convert.ToInt32(projCountCmd.ExecuteScalar() ?? 0);

        sb.AppendLine($"| Metric | Value |");
        sb.AppendLine($"|--------|-------|");
        sb.AppendLine($"| Expressions matching | {count} |");
        sb.AppendLine($"| Programs affected | {programCount} |");
        sb.AppendLine($"| Projects affected | {projectCount} |");
        sb.AppendLine();

        // Apply rules
        if (projectCount > 2)
        {
            blockers.Add($"Pattern found in {projectCount} projects - cross-project change");
        }

        if (count > 50)
        {
            warnings.Add($"{count} expressions match this pattern - mass change required");
        }
        else if (count > 10)
        {
            warnings.Add($"{count} expressions match this pattern");
        }

        if (count > 0)
        {
            recommendations.Add($"Run `magic_impact_expression '{pattern}'` for full analysis");
            recommendations.Add($"Test {Math.Min(count, 5)} representative programs after changes");
        }
    }

    private record ImpactRecord(string Type, string Project, int Ide, string Severity);
}
