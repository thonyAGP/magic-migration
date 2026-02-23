using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Coverage metrics dashboard for ecosystem monitoring
/// </summary>
[McpServerToolType]
public static class CoverageDashboardTool
{
    [McpServerTool(Name = "magic_dashboard")]
    [Description("Show comprehensive coverage metrics dashboard: programs indexed, patterns, tickets, ECF registry status. Use for ecosystem health monitoring.")]
    public static string GetDashboard(KnowledgeDb db)
    {
        var sb = new StringBuilder();
        sb.AppendLine("# Magic Ecosystem Dashboard");
        sb.AppendLine();
        sb.AppendLine($"*Generated: {DateTime.Now:yyyy-MM-dd HH:mm}*");
        sb.AppendLine();

        // Section 1: Knowledge Base Overview
        AppendKbOverview(db, sb);

        // Section 2: Program Coverage by Project
        AppendProgramCoverage(db, sb);

        // Section 3: Tables Coverage
        AppendTablesCoverage(db, sb);

        // Section 4: Patterns Status
        AppendPatternsStatus(db, sb);

        // Section 5: ECF Registry
        AppendEcfRegistry(db, sb);

        // Section 6: Ticket Metrics
        AppendTicketMetrics(db, sb);

        // Section 7: Overall Health Score
        AppendHealthScore(db, sb);

        return sb.ToString();
    }

    private static void AppendKbOverview(KnowledgeDb db, StringBuilder sb)
    {
        sb.AppendLine("## 1. Knowledge Base Overview");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                (SELECT COUNT(*) FROM projects) as projects,
                (SELECT COUNT(*) FROM programs) as programs,
                (SELECT COUNT(*) FROM tasks) as tasks,
                (SELECT COUNT(*) FROM expressions) as expressions,
                (SELECT COUNT(*) FROM tables) as tables,
                (SELECT COUNT(*) FROM resolution_patterns) as patterns";

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            sb.AppendLine("| Metric | Count |");
            sb.AppendLine("|--------|-------|");
            sb.AppendLine($"| Projects | {reader.GetInt32(0)} |");
            sb.AppendLine($"| Programs | {reader.GetInt32(1)} |");
            sb.AppendLine($"| Tasks | {reader.GetInt32(2)} |");
            sb.AppendLine($"| Expressions | {reader.GetInt32(3)} |");
            sb.AppendLine($"| Tables | {reader.GetInt32(4)} |");
            sb.AppendLine($"| Patterns | {reader.GetInt32(5)} |");
        }
        sb.AppendLine();
    }

    private static void AppendProgramCoverage(KnowledgeDb db, StringBuilder sb)
    {
        sb.AppendLine("## 2. Program Coverage by Project");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                pr.name,
                pr.program_count,
                COUNT(DISTINCT t.id) as task_count,
                COUNT(DISTINCT e.id) as expr_count,
                SUM(t.logic_line_count) as total_lines
            FROM projects pr
            LEFT JOIN programs p ON p.project_id = pr.id
            LEFT JOIN tasks t ON t.program_id = p.id
            LEFT JOIN expressions e ON e.program_id = p.id
            GROUP BY pr.id
            ORDER BY pr.program_count DESC";

        sb.AppendLine("| Project | Programs | Tasks | Expressions | Logic Lines |");
        sb.AppendLine("|---------|----------|-------|-------------|-------------|");

        using var reader = cmd.ExecuteReader();
        var totalProgs = 0;
        var totalTasks = 0;
        var totalExprs = 0;
        var totalLines = 0L;

        while (reader.Read())
        {
            var name = reader.GetString(0);
            var progs = reader.GetInt32(1);
            var tasks = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
            var exprs = reader.IsDBNull(3) ? 0 : reader.GetInt32(3);
            var lines = reader.IsDBNull(4) ? 0 : reader.GetInt64(4);

            sb.AppendLine($"| {name} | {progs} | {tasks} | {exprs} | {lines} |");

            totalProgs += progs;
            totalTasks += tasks;
            totalExprs += exprs;
            totalLines += lines;
        }

        sb.AppendLine($"| **TOTAL** | **{totalProgs}** | **{totalTasks}** | **{totalExprs}** | **{totalLines}** |");
        sb.AppendLine();
    }

    private static void AppendTablesCoverage(KnowledgeDb db, StringBuilder sb)
    {
        sb.AppendLine("## 3. Tables Coverage");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                COUNT(*) as total_tables,
                SUM(column_count) as total_columns,
                (SELECT COUNT(DISTINCT table_id) FROM table_usage) as tables_used
            FROM tables";

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            var totalTables = reader.GetInt32(0);
            var totalCols = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
            var tablesUsed = reader.GetInt32(2);
            var coverage = totalTables > 0 ? (tablesUsed * 100.0 / totalTables) : 0;

            sb.AppendLine($"- **Total tables:** {totalTables}");
            sb.AppendLine($"- **Total columns:** {totalCols}");
            sb.AppendLine($"- **Tables referenced in programs:** {tablesUsed}");
            sb.AppendLine($"- **Reference coverage:** {coverage:F1}%");
        }
        sb.AppendLine();

        // Top used tables
        using var topCmd = db.Connection.CreateCommand();
        topCmd.CommandText = @"
            SELECT t.public_name, t.physical_name, COUNT(*) as usage_count
            FROM table_usage tu
            JOIN tables t ON tu.table_id = t.xml_id
            GROUP BY tu.table_id
            ORDER BY usage_count DESC
            LIMIT 5";

        sb.AppendLine("**Top 5 Most Used Tables:**");
        sb.AppendLine();
        sb.AppendLine("| Table | Physical | Usage |");
        sb.AppendLine("|-------|----------|-------|");

        using var topReader = topCmd.ExecuteReader();
        while (topReader.Read())
        {
            var pubName = topReader.IsDBNull(0) ? "-" : topReader.GetString(0);
            var physName = topReader.IsDBNull(1) ? "-" : topReader.GetString(1);
            var usage = topReader.GetInt32(2);
            sb.AppendLine($"| {pubName} | {physName} | {usage} |");
        }
        sb.AppendLine();
    }

    private static void AppendPatternsStatus(KnowledgeDb db, StringBuilder sb)
    {
        sb.AppendLine("## 4. Resolution Patterns");
        sb.AppendLine();

        var patterns = db.GetAllPatterns().ToList();
        var usedPatterns = patterns.Count(p => p.UsageCount > 0);
        var totalUsage = patterns.Sum(p => p.UsageCount);

        sb.AppendLine($"- **Total patterns:** {patterns.Count}");
        sb.AppendLine($"- **Patterns used:** {usedPatterns} ({(patterns.Count > 0 ? usedPatterns * 100.0 / patterns.Count : 0):F0}%)");
        sb.AppendLine($"- **Total usage:** {totalUsage}");
        sb.AppendLine();

        if (patterns.Count > 0)
        {
            sb.AppendLine("**Recent Patterns:**");
            sb.AppendLine();
            sb.AppendLine("| Pattern | Type | Usage | Source |");
            sb.AppendLine("|---------|------|-------|--------|");

            foreach (var p in patterns.OrderByDescending(x => x.CreatedAt).Take(5))
            {
                var causeType = p.RootCauseType ?? "-";
                var source = p.SourceTicket ?? "-";
                sb.AppendLine($"| {p.PatternName} | {causeType} | {p.UsageCount} | {source} |");
            }
        }
        sb.AppendLine();
    }

    private static void AppendEcfRegistry(KnowledgeDb db, StringBuilder sb)
    {
        sb.AppendLine("## 5. ECF Shared Components Registry");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT ecf_name, COUNT(*) as count, owner_project
            FROM shared_components
            GROUP BY ecf_name
            ORDER BY count DESC";

        var hasEcf = false;
        sb.AppendLine("| ECF File | Components | Owner |");
        sb.AppendLine("|----------|------------|-------|");

        using var reader = cmd.ExecuteReader();
        var totalComponents = 0;
        while (reader.Read())
        {
            hasEcf = true;
            var ecfName = reader.GetString(0);
            var count = reader.GetInt32(1);
            var owner = reader.GetString(2);
            sb.AppendLine($"| {ecfName} | {count} | {owner} |");
            totalComponents += count;
        }

        if (!hasEcf)
        {
            sb.AppendLine("| *No ECF registered* | - | - |");
            sb.AppendLine();
            sb.AppendLine("> Run `KbIndexRunner populate-ecf` to populate the registry.");
        }
        else
        {
            sb.AppendLine($"| **TOTAL** | **{totalComponents}** | |");
        }
        sb.AppendLine();
    }

    private static void AppendTicketMetrics(KnowledgeDb db, StringBuilder sb)
    {
        sb.AppendLine("## 6. Ticket Analysis Metrics");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN pattern_matched IS NOT NULL THEN 1 ELSE 0 END) as with_pattern,
                AVG(CASE WHEN success = 1 THEN resolution_time_minutes END) as avg_time,
                AVG(phases_completed) as avg_phases
            FROM ticket_metrics";

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            var total = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
            var resolved = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
            var withPattern = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
            var avgTime = reader.IsDBNull(3) ? 0 : reader.GetDouble(3);
            var avgPhases = reader.IsDBNull(4) ? 0 : reader.GetDouble(4);

            sb.AppendLine($"- **Tickets tracked:** {total}");
            sb.AppendLine($"- **Resolved:** {resolved} ({(total > 0 ? resolved * 100.0 / total : 0):F0}%)");
            sb.AppendLine($"- **With pattern match:** {withPattern} ({(total > 0 ? withPattern * 100.0 / total : 0):F0}%)");
            sb.AppendLine($"- **Avg resolution time:** {avgTime:F0} minutes");
            sb.AppendLine($"- **Avg phases completed:** {avgPhases:F1}/6");
        }
        sb.AppendLine();
    }

    private static void AppendHealthScore(KnowledgeDb db, StringBuilder sb)
    {
        sb.AppendLine("## 7. Ecosystem Health Score");
        sb.AppendLine();

        // Calculate sub-scores
        var kbScore = CalculateKbScore(db);
        var patternScore = CalculatePatternScore(db);
        var ticketScore = CalculateTicketScore(db);
        var ecfScore = CalculateEcfScore(db);

        var overallScore = (kbScore + patternScore + ticketScore + ecfScore) / 4;

        sb.AppendLine("| Area | Score | Status |");
        sb.AppendLine("|------|-------|--------|");
        sb.AppendLine($"| Knowledge Base | {kbScore:F0}/100 | {GetStatusIcon(kbScore)} |");
        sb.AppendLine($"| Pattern System | {patternScore:F0}/100 | {GetStatusIcon(patternScore)} |");
        sb.AppendLine($"| Ticket Tracking | {ticketScore:F0}/100 | {GetStatusIcon(ticketScore)} |");
        sb.AppendLine($"| ECF Registry | {ecfScore:F0}/100 | {GetStatusIcon(ecfScore)} |");
        sb.AppendLine($"| **OVERALL** | **{overallScore:F0}/100** | **{GetStatusIcon(overallScore)}** |");
        sb.AppendLine();

        // Recommendations
        sb.AppendLine("### Recommendations");
        sb.AppendLine();

        if (kbScore < 50)
            sb.AppendLine("- Run `KbIndexRunner full-index` to populate the Knowledge Base");
        if (patternScore < 50)
            sb.AppendLine("- Add more patterns with `/ticket-learn` or `magic_pattern_sync`");
        if (ticketScore < 50)
            sb.AppendLine("- Track more tickets with the pipeline for better metrics");
        if (ecfScore < 50)
            sb.AppendLine("- Run `KbIndexRunner populate-ecf` to register shared components");
        if (overallScore >= 70)
            sb.AppendLine("- Ecosystem is healthy - continue maintaining and improving");
    }

    private static double CalculateKbScore(KnowledgeDb db)
    {
        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                (SELECT COUNT(*) FROM programs) as programs,
                (SELECT COUNT(*) FROM tables) as tables,
                (SELECT COUNT(*) FROM expressions) as expressions";

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            var programs = reader.GetInt32(0);
            var tables = reader.GetInt32(1);
            var expressions = reader.GetInt32(2);

            // Thresholds: 2000 programs, 500 tables, 50000 expressions = 100%
            var progScore = Math.Min(programs / 2000.0 * 100, 100);
            var tableScore = Math.Min(tables / 500.0 * 100, 100);
            var exprScore = Math.Min(expressions / 50000.0 * 100, 100);

            return (progScore + tableScore + exprScore) / 3;
        }
        return 0;
    }

    private static double CalculatePatternScore(KnowledgeDb db)
    {
        var patterns = db.GetAllPatterns().ToList();
        if (patterns.Count == 0) return 0;

        var usedCount = patterns.Count(p => p.UsageCount > 0);
        var usageRate = usedCount * 100.0 / patterns.Count;
        var countScore = Math.Min(patterns.Count / 20.0 * 100, 100); // 20 patterns = 100%

        return (usageRate + countScore) / 2;
    }

    private static double CalculateTicketScore(KnowledgeDb db)
    {
        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN pattern_matched IS NOT NULL THEN 1 ELSE 0 END) as with_pattern
            FROM ticket_metrics";

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            var total = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
            if (total == 0) return 0;

            var resolved = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
            var withPattern = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);

            var resolveRate = resolved * 100.0 / total;
            var patternRate = withPattern * 100.0 / total;

            return (resolveRate + patternRate) / 2;
        }
        return 0;
    }

    private static double CalculateEcfScore(KnowledgeDb db)
    {
        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM shared_components";
        var count = (long)(cmd.ExecuteScalar() ?? 0);

        // 700 components = 100%
        return Math.Min(count / 700.0 * 100, 100);
    }

    private static string GetStatusIcon(double score) =>
        score >= 80 ? "Excellent" :
        score >= 60 ? "Good" :
        score >= 40 ? "Fair" :
        score >= 20 ? "Developing" : "Starting";

    [McpServerTool(Name = "magic_coverage_summary")]
    [Description("Get a quick summary of ecosystem coverage metrics (compact version of dashboard).")]
    public static string GetCoverageSummary(KnowledgeDb db)
    {
        var sb = new StringBuilder();
        sb.AppendLine("## Coverage Summary");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                (SELECT COUNT(*) FROM projects) as projects,
                (SELECT COUNT(*) FROM programs) as programs,
                (SELECT COUNT(*) FROM tables) as tables,
                (SELECT COUNT(*) FROM resolution_patterns) as patterns,
                (SELECT COUNT(*) FROM shared_components) as ecf,
                (SELECT COUNT(*) FROM ticket_metrics WHERE success = 1) as resolved_tickets";

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            sb.AppendLine($"**{reader.GetInt32(0)}** projects | **{reader.GetInt32(1)}** programs | **{reader.GetInt32(2)}** tables");
            sb.AppendLine($"**{reader.GetInt32(3)}** patterns | **{reader.GetInt32(4)}** ECF components | **{reader.GetInt32(5)}** resolved tickets");
        }

        return sb.ToString();
    }
}
