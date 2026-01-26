using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Regression Detection - Compare current program state vs saved spec
/// P2-C: Detects changes that could indicate regressions or need spec update
/// </summary>
[McpServerToolType]
public static class RegressionDetectionTool
{
    [McpServerTool(Name = "magic_detect_regression")]
    [Description(@"Compare current program state (from KB) vs saved spec. Detects:
- Expression count changes (code added/removed)
- New tables not in spec
- Access mode changes (R→W or W→R)
- Parameter count changes

Returns CHANGE_DETECTED, NO_CHANGES, or SPEC_NOT_FOUND.
Use BEFORE committing changes to verify against spec baseline.")]
    public static string DetectRegression(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("IDE position (e.g., 238)")] int idePosition)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Regression Detection: {project.ToUpper()} IDE {idePosition}");
        sb.AppendLine();

        // 1. Load saved spec
        var openspecPath = FindOpenspecPath();
        if (openspecPath == null)
        {
            sb.AppendLine("**Result**: SPEC_NOT_FOUND");
            sb.AppendLine();
            sb.AppendLine("> `.openspec` folder not found. Cannot compare against baseline.");
            return sb.ToString();
        }

        var parser = new SpecParserService(openspecPath);
        if (!parser.SpecExists(project, idePosition))
        {
            sb.AppendLine("**Result**: SPEC_NOT_FOUND");
            sb.AppendLine();
            sb.AppendLine($"> No spec found for {project.ToUpper()} IDE {idePosition}");
            sb.AppendLine($"> Expected: {parser.GetSpecPath(project, idePosition)}");
            sb.AppendLine();
            sb.AppendLine("**Recommendation**: Generate spec with `Generate-ProgramSpecV2.ps1`");
            return sb.ToString();
        }

        var spec = parser.ParseSpec(project, idePosition);
        if (spec == null)
        {
            sb.AppendLine("**Result**: ERROR");
            sb.AppendLine("> Failed to parse spec file");
            return sb.ToString();
        }

        sb.AppendLine($"**Spec Loaded**: v{spec.SpecVersion ?? "1.0"}");
        sb.AppendLine();

        // 2. Get current state from KB
        var currentState = GetCurrentStateFromKb(db, project, idePosition);
        if (currentState == null)
        {
            sb.AppendLine("**Result**: ERROR");
            sb.AppendLine($"> Program {project.ToUpper()} IDE {idePosition} not found in Knowledge Base");
            sb.AppendLine();
            sb.AppendLine("**Recommendation**: Re-index the project with KbIndexRunner");
            return sb.ToString();
        }

        // 3. Compare and detect changes
        var changes = new List<ChangeRecord>();

        // Compare expression count
        if (currentState.ExpressionCount != spec.ExpressionCount)
        {
            var delta = currentState.ExpressionCount - spec.ExpressionCount;
            var changeType = delta > 0 ? "NEW_CODE" : "REMOVED_CODE";
            var severity = Math.Abs(delta) > 10 ? "HIGH" : "MEDIUM";

            changes.Add(new ChangeRecord(
                "EXPRESSION_COUNT",
                changeType,
                severity,
                $"Spec: {spec.ExpressionCount}, Current: {currentState.ExpressionCount} ({(delta > 0 ? "+" : "")}{delta})"
            ));
        }

        // Compare table count
        if (currentState.TableCount != spec.Tables.Count)
        {
            var delta = currentState.TableCount - spec.Tables.Count;
            var changeType = delta > 0 ? "NEW_TABLES" : "REMOVED_TABLES";
            var severity = Math.Abs(delta) > 3 ? "HIGH" : "MEDIUM";

            changes.Add(new ChangeRecord(
                "TABLE_COUNT",
                changeType,
                severity,
                $"Spec: {spec.Tables.Count}, Current: {currentState.TableCount} ({(delta > 0 ? "+" : "")}{delta})"
            ));
        }

        // Compare write table count
        if (currentState.WriteTableCount != spec.WriteTableCount)
        {
            var delta = currentState.WriteTableCount - spec.WriteTableCount;
            var changeType = delta > 0 ? "NEW_WRITES" : "REMOVED_WRITES";
            var severity = "HIGH"; // Write changes are always high-risk

            changes.Add(new ChangeRecord(
                "WRITE_TABLE_COUNT",
                changeType,
                severity,
                $"Spec: {spec.WriteTableCount} write tables, Current: {currentState.WriteTableCount}"
            ));
        }

        // Check for new tables not in spec
        var specTableIds = spec.Tables.Select(t => t.Id).ToHashSet();
        foreach (var currentTable in currentState.Tables)
        {
            if (!specTableIds.Contains(currentTable.Id))
            {
                changes.Add(new ChangeRecord(
                    "NEW_TABLE",
                    "NOT_IN_SPEC",
                    currentTable.Access == "W" ? "HIGH" : "MEDIUM",
                    $"Table #{currentTable.Id} ({currentTable.Name ?? "?"}) [{currentTable.Access}] not in spec"
                ));
            }
        }

        // Check for access mode changes (R→W is critical)
        var currentTableMap = currentState.Tables.ToDictionary(t => t.Id, t => t);
        foreach (var specTable in spec.Tables)
        {
            if (currentTableMap.TryGetValue(specTable.Id, out var currentTable))
            {
                if (currentTable.Access != specTable.Access)
                {
                    var severity = currentTable.Access == "W" ? "CRITICAL" : "MEDIUM";
                    changes.Add(new ChangeRecord(
                        "ACCESS_CHANGE",
                        $"{specTable.Access}→{currentTable.Access}",
                        severity,
                        $"Table #{specTable.Id} ({specTable.LogicalName}) was {specTable.Access}, now {currentTable.Access}"
                    ));
                }
            }
        }

        // Compare parameter count (if available)
        if (currentState.ParameterCount > 0 && spec.Parameters.Count > 0 &&
            currentState.ParameterCount != spec.Parameters.Count)
        {
            var delta = currentState.ParameterCount - spec.Parameters.Count;
            changes.Add(new ChangeRecord(
                "PARAMETER_COUNT",
                delta > 0 ? "NEW_PARAMS" : "REMOVED_PARAMS",
                "HIGH",
                $"Spec: {spec.Parameters.Count} params, Current: {currentState.ParameterCount}"
            ));
        }

        // 4. Build report
        if (changes.Count == 0)
        {
            sb.AppendLine("**Result**: NO_CHANGES");
            sb.AppendLine();
            sb.AppendLine("✓ Current state matches spec baseline");
            sb.AppendLine();
            sb.AppendLine("| Metric | Spec | Current | Match |");
            sb.AppendLine("|--------|------|---------|-------|");
            sb.AppendLine($"| Expressions | {spec.ExpressionCount} | {currentState.ExpressionCount} | ✓ |");
            sb.AppendLine($"| Tables | {spec.Tables.Count} | {currentState.TableCount} | ✓ |");
            sb.AppendLine($"| Write Tables | {spec.WriteTableCount} | {currentState.WriteTableCount} | ✓ |");
            return sb.ToString();
        }

        sb.AppendLine($"**Result**: CHANGE_DETECTED ({changes.Count} difference(s))");
        sb.AppendLine();

        // Group by severity
        var criticalChanges = changes.Where(c => c.Severity == "CRITICAL").ToList();
        var highChanges = changes.Where(c => c.Severity == "HIGH").ToList();
        var mediumChanges = changes.Where(c => c.Severity == "MEDIUM").ToList();

        if (criticalChanges.Count > 0)
        {
            sb.AppendLine("### 🔴 CRITICAL CHANGES");
            sb.AppendLine();
            foreach (var c in criticalChanges)
            {
                sb.AppendLine($"- **{c.Category}** [{c.ChangeType}]: {c.Description}");
            }
            sb.AppendLine();
        }

        if (highChanges.Count > 0)
        {
            sb.AppendLine("### 🟠 HIGH RISK CHANGES");
            sb.AppendLine();
            foreach (var c in highChanges)
            {
                sb.AppendLine($"- **{c.Category}** [{c.ChangeType}]: {c.Description}");
            }
            sb.AppendLine();
        }

        if (mediumChanges.Count > 0)
        {
            sb.AppendLine("### 🟡 MEDIUM CHANGES");
            sb.AppendLine();
            foreach (var c in mediumChanges)
            {
                sb.AppendLine($"- **{c.Category}** [{c.ChangeType}]: {c.Description}");
            }
            sb.AppendLine();
        }

        // Recommendations
        sb.AppendLine("### Recommendations");
        sb.AppendLine();

        if (criticalChanges.Count > 0 || highChanges.Count >= 3)
        {
            sb.AppendLine("1. **STOP** - Review changes before proceeding");
            sb.AppendLine("2. Run `magic_impact_program {project} {idePosition}` for impact analysis");
            sb.AppendLine("3. Update spec with `Generate-ProgramSpecV2.ps1` after validation");
        }
        else if (changes.Any(c => c.Category == "NEW_TABLE"))
        {
            sb.AppendLine("1. Verify new tables are intentional");
            sb.AppendLine("2. Check write permissions are necessary");
            sb.AppendLine("3. Regenerate spec to update baseline");
        }
        else
        {
            sb.AppendLine("1. Review expression changes");
            sb.AppendLine("2. Regenerate spec with `Generate-ProgramSpecV2.ps1`");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_spec_drift_report")]
    [Description("Generate a drift report for all specs in a project. Shows which specs are out of sync with current code.")]
    public static string GenerateDriftReport(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Limit results (default: 50)")] int limit = 50)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Spec Drift Report: {project.ToUpper()}");
        sb.AppendLine();

        var openspecPath = FindOpenspecPath();
        if (openspecPath == null)
        {
            sb.AppendLine("ERROR: `.openspec` folder not found");
            return sb.ToString();
        }

        var parser = new SpecParserService(openspecPath);
        var specsDir = Path.Combine(openspecPath, "specs");

        if (!Directory.Exists(specsDir))
        {
            sb.AppendLine("ERROR: No specs directory found");
            return sb.ToString();
        }

        // Find all specs for this project
        var specFiles = Directory.GetFiles(specsDir, $"{project.ToUpper()}-IDE-*.md")
            .Take(limit)
            .ToList();

        if (specFiles.Count == 0)
        {
            sb.AppendLine($"No specs found for project {project.ToUpper()}");
            return sb.ToString();
        }

        var driftItems = new List<DriftItem>();

        foreach (var file in specFiles)
        {
            var fileName = Path.GetFileNameWithoutExtension(file);
            var match = System.Text.RegularExpressions.Regex.Match(fileName, @"IDE-(\d+)$");
            if (!match.Success)
                continue;

            var ide = int.Parse(match.Groups[1].Value);
            var spec = parser.ParseSpec(project, ide);
            if (spec == null)
                continue;

            var currentState = GetCurrentStateFromKb(db, project, ide);
            if (currentState == null)
            {
                driftItems.Add(new DriftItem(ide, spec.Title ?? "?", "NOT_IN_KB", 0, "Program not indexed"));
                continue;
            }

            // Calculate drift score
            var driftScore = 0;
            var driftReasons = new List<string>();

            var exprDiff = Math.Abs(currentState.ExpressionCount - spec.ExpressionCount);
            if (exprDiff > 0)
            {
                driftScore += exprDiff > 10 ? 3 : 1;
                driftReasons.Add($"Expr: {spec.ExpressionCount}→{currentState.ExpressionCount}");
            }

            var tableDiff = Math.Abs(currentState.TableCount - spec.Tables.Count);
            if (tableDiff > 0)
            {
                driftScore += tableDiff * 2;
                driftReasons.Add($"Tables: {spec.Tables.Count}→{currentState.TableCount}");
            }

            var writeDiff = Math.Abs(currentState.WriteTableCount - spec.WriteTableCount);
            if (writeDiff > 0)
            {
                driftScore += writeDiff * 3;
                driftReasons.Add($"Writes: {spec.WriteTableCount}→{currentState.WriteTableCount}");
            }

            var status = driftScore == 0 ? "IN_SYNC" :
                        driftScore <= 2 ? "MINOR_DRIFT" :
                        driftScore <= 5 ? "MODERATE_DRIFT" : "MAJOR_DRIFT";

            driftItems.Add(new DriftItem(
                ide,
                spec.Title ?? "?",
                status,
                driftScore,
                string.Join(", ", driftReasons)
            ));
        }

        // Summary
        var inSync = driftItems.Count(d => d.Status == "IN_SYNC");
        var minorDrift = driftItems.Count(d => d.Status == "MINOR_DRIFT");
        var moderateDrift = driftItems.Count(d => d.Status == "MODERATE_DRIFT");
        var majorDrift = driftItems.Count(d => d.Status == "MAJOR_DRIFT");
        var notInKb = driftItems.Count(d => d.Status == "NOT_IN_KB");

        sb.AppendLine("### Summary");
        sb.AppendLine();
        sb.AppendLine($"| Status | Count |");
        sb.AppendLine($"|--------|-------|");
        sb.AppendLine($"| ✓ In Sync | {inSync} |");
        sb.AppendLine($"| 🟡 Minor Drift | {minorDrift} |");
        sb.AppendLine($"| 🟠 Moderate Drift | {moderateDrift} |");
        sb.AppendLine($"| 🔴 Major Drift | {majorDrift} |");
        sb.AppendLine($"| ⚠️ Not in KB | {notInKb} |");
        sb.AppendLine();

        // Detailed table (only drifted ones)
        var driftedItems = driftItems
            .Where(d => d.Status != "IN_SYNC")
            .OrderByDescending(d => d.DriftScore)
            .ToList();

        if (driftedItems.Count > 0)
        {
            sb.AppendLine("### Drifted Specs");
            sb.AppendLine();
            sb.AppendLine("| IDE | Title | Status | Score | Changes |");
            sb.AppendLine("|-----|-------|--------|-------|---------|");

            foreach (var item in driftedItems)
            {
                var emoji = item.Status switch
                {
                    "MINOR_DRIFT" => "🟡",
                    "MODERATE_DRIFT" => "🟠",
                    "MAJOR_DRIFT" => "🔴",
                    "NOT_IN_KB" => "⚠️",
                    _ => ""
                };
                var title = item.Title.Length > 30 ? item.Title[..27] + "..." : item.Title;
                sb.AppendLine($"| {item.Ide} | {title} | {emoji} {item.Status} | {item.DriftScore} | {item.Changes} |");
            }
            sb.AppendLine();

            sb.AppendLine("### Actions");
            sb.AppendLine();
            sb.AppendLine("1. For major drift: Run `magic_detect_regression {project} {ide}` for details");
            sb.AppendLine("2. To update: `Generate-ProgramSpecV2.ps1 -Project {project} -IDE {ide}`");
            sb.AppendLine("3. To update all: `Batch-GenerateSpecs.ps1 -Project {project}`");
        }
        else
        {
            sb.AppendLine("✓ All specs are in sync with current code");
        }

        return sb.ToString();
    }

    private static ProgramState? GetCurrentStateFromKb(KnowledgeDb db, string project, int idePosition)
    {
        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT p.id, p.expression_count, p.task_count
            FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        cmd.Parameters.AddWithValue("@project", project);
        cmd.Parameters.AddWithValue("@ide", idePosition);

        long programId;
        int expressionCount;
        using (var reader = cmd.ExecuteReader())
        {
            if (!reader.Read())
                return null;

            programId = reader.GetInt64(0);
            expressionCount = reader.GetInt32(1);
        }

        // Get tables
        var tables = new List<TableState>();
        using var tablesCmd = db.Connection.CreateCommand();
        tablesCmd.CommandText = @"
            SELECT DISTINCT tu.table_id, tu.table_name, tu.usage_type
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            WHERE t.program_id = @prog_id";
        tablesCmd.Parameters.AddWithValue("@prog_id", programId);

        using (var reader = tablesCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                tables.Add(new TableState
                {
                    Id = reader.GetInt32(0),
                    Name = reader.IsDBNull(1) ? null : reader.GetString(1),
                    Access = reader.GetString(2)
                });
            }
        }

        // Get parameter count from first task
        int parameterCount = 0;
        using var paramCmd = db.Connection.CreateCommand();
        paramCmd.CommandText = @"
            SELECT column_count
            FROM tasks
            WHERE program_id = @prog_id AND isn2 = 1
            LIMIT 1";
        paramCmd.Parameters.AddWithValue("@prog_id", programId);
        var paramResult = paramCmd.ExecuteScalar();
        if (paramResult != null)
            parameterCount = Convert.ToInt32(paramResult);

        return new ProgramState
        {
            ExpressionCount = expressionCount,
            TableCount = tables.Count,
            WriteTableCount = tables.Count(t => t.Access == "W"),
            Tables = tables,
            ParameterCount = parameterCount
        };
    }

    private static string? FindOpenspecPath()
    {
        var dir = new DirectoryInfo(Environment.CurrentDirectory);

        while (dir != null)
        {
            var openspecPath = Path.Combine(dir.FullName, ".openspec");
            if (Directory.Exists(openspecPath))
                return openspecPath;
            dir = dir.Parent;
        }

        return null;
    }

    private record ChangeRecord(string Category, string ChangeType, string Severity, string Description);
    private record DriftItem(int Ide, string Title, string Status, int DriftScore, string Changes);

    private class ProgramState
    {
        public int ExpressionCount { get; set; }
        public int TableCount { get; set; }
        public int WriteTableCount { get; set; }
        public int ParameterCount { get; set; }
        public List<TableState> Tables { get; set; } = new();
    }

    private class TableState
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string Access { get; set; } = "R";
    }
}
