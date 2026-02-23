using System.ComponentModel;
using System.Text;
using System.Text.Json;
using MagicKnowledgeBase.Database;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Variable lineage tracing - track where variable values come from
/// </summary>
[McpServerToolType]
public static class VariableLineageTool
{
    [McpServerTool(Name = "magic_variable_lineage")]
    [Description("Trace all modifications of a variable across a program. Answers 'where does this value come from?'")]
    public static string TraceVariableLineage(
        KnowledgeDb db,
        [Description("Project name (e.g., ADH, PBP)")] string project,
        [Description("Program IDE position")] int programId,
        [Description("Variable letter to trace (e.g., D, QQ, SOLDE). Use * for all.")] string variableName)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Variable Lineage: {variableName} in {project} IDE {programId}");
        sb.AppendLine();

        // Get program info
        using var progCmd = db.Connection.CreateCommand();
        progCmd.CommandText = @"
            SELECT p.id, p.name, p.public_name
            FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        progCmd.Parameters.AddWithValue("@project", project);
        progCmd.Parameters.AddWithValue("@ide", programId);

        long dbProgramId = 0;
        string? programName = null;

        using (var reader = progCmd.ExecuteReader())
        {
            if (!reader.Read())
            {
                return $"ERROR: Program {project} IDE {programId} not found in KB";
            }
            dbProgramId = reader.GetInt64(0);
            programName = reader.GetString(1);
        }

        sb.AppendLine($"Program: **{programName}**");
        sb.AppendLine();

        // Find all logic lines with Update/VarSet operations that might modify variables
        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT t.isn2, ll.line_number, ll.handler, ll.operation, ll.parameters, ll.is_disabled, ll.condition_expr
            FROM logic_lines ll
            JOIN tasks t ON ll.task_id = t.id
            WHERE t.program_id = @prog_id
              AND ll.operation IN ('Update', 'VarSet', 'VarReset', 'VarInit', 'Action')
              AND ll.is_disabled = 0
            ORDER BY t.isn2, ll.line_number";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        var modifications = new List<VariableModification>();
        var searchAll = variableName == "*";
        var searchPattern = variableName.ToUpperInvariant();

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                var taskIsn2 = reader.GetInt32(0);
                var lineNum = reader.GetInt32(1);
                var handler = reader.GetString(2);
                var operation = reader.GetString(3);
                var paramsJson = reader.IsDBNull(4) ? null : reader.GetString(4);
                var conditionExpr = reader.IsDBNull(6) ? null : reader.GetString(6);

                if (string.IsNullOrEmpty(paramsJson)) continue;

                // Parse parameters to find variable assignments
                var mods = ParseVariableModifications(operation, paramsJson, searchPattern, searchAll);

                foreach (var mod in mods)
                {
                    mod.TaskIsn2 = taskIsn2;
                    mod.LineNumber = lineNum;
                    mod.Handler = handler;
                    mod.Operation = operation;
                    mod.Condition = conditionExpr;
                    modifications.Add(mod);
                }
            }
        }

        if (modifications.Count == 0)
        {
            sb.AppendLine($"*No modifications found for variable '{variableName}'*");
            sb.AppendLine();
            sb.AppendLine("> **Tip**: The variable might be:");
            sb.AppendLine("> - A DataView column (check magic_get_dataview)");
            sb.AppendLine("> - Set in a parent task or called program");
            sb.AppendLine("> - A parameter passed from caller");
            return sb.ToString();
        }

        sb.AppendLine($"Found **{modifications.Count}** modification(s):");
        sb.AppendLine();

        // Group by task
        var byTask = modifications.GroupBy(m => m.TaskIsn2).OrderBy(g => g.Key);

        foreach (var taskGroup in byTask)
        {
            sb.AppendLine($"### Task {programId}.{taskGroup.Key}");
            sb.AppendLine();
            sb.AppendLine("| Line | Handler | Variable | Source | Condition |");
            sb.AppendLine("|------|---------|----------|--------|-----------|");

            foreach (var mod in taskGroup.OrderBy(m => m.LineNumber))
            {
                var condition = !string.IsNullOrEmpty(mod.Condition) ? $"Exp {mod.Condition}" : "-";
                var source = mod.SourceDescription ?? mod.SourceType ?? "-";
                if (source.Length > 30) source = source[..27] + "...";
                sb.AppendLine($"| {mod.LineNumber} | {mod.Handler} | **{mod.VariableName}** | {source} | {condition} |");
            }
            sb.AppendLine();
        }

        // Summary
        var varGroups = modifications.GroupBy(m => m.VariableName);
        sb.AppendLine("### Summary");
        sb.AppendLine();
        foreach (var vg in varGroups.OrderByDescending(g => g.Count()))
        {
            sb.AppendLine($"- **{vg.Key}**: {vg.Count()} modification(s)");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_variable_sources")]
    [Description("Find where a variable value could originate from (columns, expressions, parameters).")]
    public static string FindVariableSources(
        KnowledgeDb db,
        [Description("Project name")] string project,
        [Description("Program IDE position")] int programId,
        [Description("Variable letter to find (e.g., D, QQ)")] string variableLetter)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Variable Sources: {variableLetter} in {project} IDE {programId}");
        sb.AppendLine();

        // Get program DB ID
        using var progCmd = db.Connection.CreateCommand();
        progCmd.CommandText = @"
            SELECT p.id FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        progCmd.Parameters.AddWithValue("@project", project);
        progCmd.Parameters.AddWithValue("@ide", programId);

        var dbProgramId = (long?)progCmd.ExecuteScalar();
        if (dbProgramId == null)
        {
            return $"ERROR: Program {project} IDE {programId} not found";
        }

        // 1. Check DataView columns
        sb.AppendLine("### DataView Columns");
        sb.AppendLine();

        using var colCmd = db.Connection.CreateCommand();
        colCmd.CommandText = @"
            SELECT t.isn2, c.line_number, c.variable, c.name, c.definition, c.source
            FROM columns c
            JOIN tasks t ON c.task_id = t.id
            WHERE t.program_id = @prog_id AND c.variable = @var
            ORDER BY t.isn2, c.line_number";
        colCmd.Parameters.AddWithValue("@prog_id", dbProgramId);
        colCmd.Parameters.AddWithValue("@var", variableLetter.ToUpperInvariant());

        var foundColumns = false;
        using (var reader = colCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                if (!foundColumns)
                {
                    sb.AppendLine("| Task | Col# | Variable | Name | Definition | Source |");
                    sb.AppendLine("|------|------|----------|------|------------|--------|");
                    foundColumns = true;
                }
                var taskIsn2 = reader.GetInt32(0);
                var colNum = reader.GetInt32(1);
                var variable = reader.GetString(2);
                var name = reader.GetString(3);
                var definition = reader.GetString(4);
                var source = reader.IsDBNull(5) ? "-" : reader.GetString(5);
                sb.AppendLine($"| {programId}.{taskIsn2} | {colNum} | {variable} | {name} | {definition} | {source} |");
            }
        }

        if (!foundColumns)
        {
            sb.AppendLine($"*No DataView column found with variable '{variableLetter}'*");
        }
        sb.AppendLine();

        // 2. Check expressions referencing this variable
        sb.AppendLine("### Expressions Using This Variable");
        sb.AppendLine();

        using var exprCmd = db.Connection.CreateCommand();
        exprCmd.CommandText = @"
            SELECT e.xml_id, e.content
            FROM expressions e
            WHERE e.program_id = @prog_id
              AND e.content LIKE @pattern
            LIMIT 10";
        exprCmd.Parameters.AddWithValue("@prog_id", dbProgramId);
        exprCmd.Parameters.AddWithValue("@pattern", $"%{{{variableLetter.ToUpperInvariant()}%");

        var foundExprs = false;
        using (var reader = exprCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                if (!foundExprs)
                {
                    sb.AppendLine("| Expression ID | Content (truncated) |");
                    sb.AppendLine("|---------------|---------------------|");
                    foundExprs = true;
                }
                var xmlId = reader.GetInt32(0);
                var content = reader.GetString(1);
                if (content.Length > 50) content = content[..47] + "...";
                sb.AppendLine($"| {xmlId} | `{content}` |");
            }
        }

        if (!foundExprs)
        {
            sb.AppendLine($"*No expressions found referencing variable '{variableLetter}'*");
        }

        return sb.ToString();
    }

    private static List<VariableModification> ParseVariableModifications(
        string operation, string paramsJson, string searchPattern, bool searchAll)
    {
        var mods = new List<VariableModification>();

        try
        {
            var doc = JsonDocument.Parse(paramsJson);
            var root = doc.RootElement;

            // Handle different operation types
            switch (operation)
            {
                case "Update":
                    // Update operations have Field and Value
                    if (root.TryGetProperty("Field", out var fieldProp))
                    {
                        var field = fieldProp.GetString();
                        if (!string.IsNullOrEmpty(field))
                        {
                            var varName = ExtractVariableName(field);
                            if (searchAll || MatchesPattern(varName, searchPattern))
                            {
                                var source = root.TryGetProperty("Value", out var valProp)
                                    ? valProp.GetString()
                                    : null;
                                mods.Add(new VariableModification
                                {
                                    VariableName = varName,
                                    SourceType = DetermineSourceType(source),
                                    SourceDescription = source?.Length > 50 ? source[..47] + "..." : source
                                });
                            }
                        }
                    }
                    break;

                case "VarSet":
                case "VarReset":
                case "VarInit":
                    // Variable operations
                    if (root.TryGetProperty("Variable", out var varProp))
                    {
                        var varName = varProp.GetString() ?? "";
                        if (searchAll || MatchesPattern(varName, searchPattern))
                        {
                            var source = root.TryGetProperty("Value", out var valProp)
                                ? valProp.GetString()
                                : (operation == "VarReset" ? "RESET" : null);
                            mods.Add(new VariableModification
                            {
                                VariableName = varName,
                                SourceType = operation == "VarReset" ? "reset" : DetermineSourceType(source),
                                SourceDescription = source
                            });
                        }
                    }
                    break;

                case "Action":
                    // Actions can have side effects on variables
                    if (root.TryGetProperty("Type", out var typeProp))
                    {
                        var actionType = typeProp.GetString();
                        // Some actions modify variables (e.g., "Evaluate", "Exit")
                        if (actionType == "Evaluate" && root.TryGetProperty("Expression", out var exprProp))
                        {
                            var expr = exprProp.GetString();
                            if (!string.IsNullOrEmpty(expr))
                            {
                                // Try to find variable being assigned
                                var assignMatch = System.Text.RegularExpressions.Regex.Match(expr, @"\{([A-Z]+)\}\s*=");
                                if (assignMatch.Success)
                                {
                                    var varName = assignMatch.Groups[1].Value;
                                    if (searchAll || MatchesPattern(varName, searchPattern))
                                    {
                                        mods.Add(new VariableModification
                                        {
                                            VariableName = varName,
                                            SourceType = "expression",
                                            SourceDescription = expr?.Length > 50 ? expr[..47] + "..." : expr
                                        });
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
        }
        catch
        {
            // Ignore JSON parse errors
        }

        return mods;
    }

    private static string ExtractVariableName(string field)
    {
        // Field can be "{D}" or "D" or "{N,3}" etc.
        var match = System.Text.RegularExpressions.Regex.Match(field, @"\{?([A-Z]+)(?:,\d+)?\}?");
        return match.Success ? match.Groups[1].Value : field;
    }

    private static bool MatchesPattern(string varName, string pattern)
    {
        return varName.Equals(pattern, StringComparison.OrdinalIgnoreCase) ||
               varName.Contains(pattern, StringComparison.OrdinalIgnoreCase);
    }

    private static string DetermineSourceType(string? source)
    {
        if (string.IsNullOrEmpty(source)) return "unknown";
        if (source.StartsWith("{") && source.Contains(",")) return "table_column";
        if (source.StartsWith("{")) return "variable";
        if (source.Contains("(")) return "expression";
        if (double.TryParse(source, out _)) return "constant";
        return "literal";
    }

    private class VariableModification
    {
        public int TaskIsn2 { get; set; }
        public int LineNumber { get; set; }
        public string Handler { get; set; } = "";
        public string Operation { get; set; } = "";
        public string VariableName { get; set; } = "";
        public string? SourceType { get; set; }
        public string? SourceDescription { get; set; }
        public string? Condition { get; set; }
    }
}
