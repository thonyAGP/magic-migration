using System.ComponentModel;
using System.Text;
using System.Text.Json;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP tools for migration specification extraction.
/// Uses MigrationExtractor to query Knowledge Base for project inventories,
/// dependencies, and statistics.
/// </summary>
[McpServerToolType]
public static class MigrationSpecTool
{
    /// <summary>
    /// Get program inventory for a project with complexity scores.
    /// </summary>
    [McpServerTool(Name = "magic_migration_inventory")]
    [Description("Get program inventory for a project including complexity scores. " +
                 "Returns list of programs sorted by complexity (tasks × expressions).")]
    public static string GetProgramInventory(
        MigrationExtractor extractor,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project)
    {
        var programs = extractor.GetProgramInventory(project);

        if (programs.Count == 0)
            return $"No programs found for project {project}";

        var sb = new StringBuilder();
        sb.AppendLine($"## Program Inventory - {project}");
        sb.AppendLine();
        sb.AppendLine($"**Total programs:** {programs.Count}");
        sb.AppendLine();

        // Complexity distribution
        var high = programs.Count(p => p.ComplexityScore > 1000);
        var medium = programs.Count(p => p.ComplexityScore >= 100 && p.ComplexityScore <= 1000);
        var low = programs.Count(p => p.ComplexityScore < 100);

        sb.AppendLine("### Complexity Distribution");
        sb.AppendLine();
        sb.AppendLine($"| Level | Count | Description |");
        sb.AppendLine($"|-------|-------|-------------|");
        sb.AppendLine($"| 🔴 High (>1000) | {high} | Deep analysis required |");
        sb.AppendLine($"| 🟡 Medium (100-1000) | {medium} | Standard migration |");
        sb.AppendLine($"| 🟢 Low (<100) | {low} | Quick migration |");
        sb.AppendLine();

        sb.AppendLine("### Programs (sorted by complexity)");
        sb.AppendLine();
        sb.AppendLine("| IDE | Name | Public Name | Tasks | Expressions | Complexity |");
        sb.AppendLine("|-----|------|-------------|-------|-------------|------------|");

        foreach (var p in programs.Take(50)) // Top 50
        {
            var icon = p.ComplexityScore > 1000 ? "🔴" :
                       p.ComplexityScore >= 100 ? "🟡" : "🟢";
            var publicName = string.IsNullOrEmpty(p.PublicName) ? "-" : p.PublicName;
            sb.AppendLine($"| {p.IdePosition} | {p.Name} | {publicName} | {p.TaskCount} | {p.ExpressionCount} | {icon} {p.ComplexityScore} |");
        }

        if (programs.Count > 50)
        {
            sb.AppendLine();
            sb.AppendLine($"*Showing top 50 of {programs.Count} programs*");
        }

        return sb.ToString();
    }

    /// <summary>
    /// Get cross-project dependencies (calls between projects).
    /// </summary>
    [McpServerTool(Name = "magic_migration_dependencies")]
    [Description("Get cross-project dependencies showing which programs call or are called by other projects. " +
                 "Critical for understanding migration order and integration points.")]
    public static string GetCrossProjectDependencies(
        MigrationExtractor extractor,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project)
    {
        var deps = extractor.GetCrossProjectDependencies(project);

        var sb = new StringBuilder();
        sb.AppendLine($"## Cross-Project Dependencies - {project}");
        sb.AppendLine();

        // Incoming calls
        sb.AppendLine("### Incoming Calls (other projects call this project)");
        sb.AppendLine();
        if (deps.IncomingCalls.Count == 0)
        {
            sb.AppendLine("*No incoming calls from other projects*");
        }
        else
        {
            sb.AppendLine("| Caller Project | Caller IDE | Caller Name | Callee IDE | Callee Name |");
            sb.AppendLine("|----------------|------------|-------------|------------|-------------|");
            foreach (var call in deps.IncomingCalls)
            {
                sb.AppendLine($"| {call.CallerProject} | {call.CallerIde} | {call.CallerName} | {call.CalleeIde} | {call.CalleeName ?? "-"} |");
            }
        }
        sb.AppendLine();

        // Outgoing calls
        sb.AppendLine("### Outgoing Calls (this project calls other projects)");
        sb.AppendLine();
        if (deps.OutgoingCalls.Count == 0)
        {
            sb.AppendLine("*No outgoing calls to other projects*");
        }
        else
        {
            sb.AppendLine("| Caller IDE | Caller Name | Callee Project | Callee XML ID |");
            sb.AppendLine("|------------|-------------|----------------|---------------|");
            foreach (var call in deps.OutgoingCalls)
            {
                sb.AppendLine($"| {call.CallerIde} | {call.CallerName} | {call.CalleeProject} | {call.CalleeXmlId} |");
            }
        }
        sb.AppendLine();

        // Summary
        var callerProjects = deps.IncomingCalls.Select(c => c.CallerProject).Distinct().ToList();
        var calleeProjects = deps.OutgoingCalls.Select(c => c.CalleeProject).Distinct().ToList();

        sb.AppendLine("### Dependency Summary");
        sb.AppendLine();
        sb.AppendLine($"- **Incoming calls:** {deps.IncomingCalls.Count} from {callerProjects.Count} project(s)");
        if (callerProjects.Count > 0)
            sb.AppendLine($"  - Projects: {string.Join(", ", callerProjects)}");
        sb.AppendLine($"- **Outgoing calls:** {deps.OutgoingCalls.Count} to {calleeProjects.Count} project(s)");
        if (calleeProjects.Count > 0)
            sb.AppendLine($"  - Projects: {string.Join(", ", calleeProjects)}");

        return sb.ToString();
    }

    /// <summary>
    /// Get project statistics summary.
    /// </summary>
    [McpServerTool(Name = "magic_migration_stats")]
    [Description("Get summary statistics for a project including program count, task count, " +
                 "expression count, and average complexity.")]
    public static string GetProjectStats(
        MigrationExtractor extractor,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project)
    {
        var stats = extractor.GetProjectStats(project);

        if (stats == null)
            return $"Project {project} not found in Knowledge Base";

        var tables = extractor.GetTableInventory(project);
        var forms = extractor.GetFormInventory(project);
        var deps = extractor.GetCrossProjectDependencies(project);

        var sb = new StringBuilder();
        sb.AppendLine($"## Project Statistics - {project}");
        sb.AppendLine();

        sb.AppendLine("### Overview");
        sb.AppendLine();
        sb.AppendLine("| Metric | Value |");
        sb.AppendLine("|--------|-------|");
        sb.AppendLine($"| **Programs** | {stats.ProgramCount} |");
        sb.AppendLine($"| **Total Tasks** | {stats.TotalTasks} |");
        sb.AppendLine($"| **Total Expressions** | {stats.TotalExpressions} |");
        sb.AppendLine($"| **Average Complexity** | {stats.AverageComplexity:F1} |");
        sb.AppendLine($"| **Main Offset** | {stats.MainOffset} |");
        sb.AppendLine();

        // Tables
        sb.AppendLine("### Tables Used");
        sb.AppendLine();
        var readTables = tables.Count(t => t.UsageType == "R");
        var writeTables = tables.Count(t => t.UsageType == "W");
        var linkTables = tables.Count(t => t.UsageType == "L");
        sb.AppendLine($"- Read (R): {readTables}");
        sb.AppendLine($"- Write (W): {writeTables}");
        sb.AppendLine($"- Link (L): {linkTables}");
        sb.AppendLine($"- **Total unique tables:** {tables.Select(t => t.TableId).Distinct().Count()}");
        sb.AppendLine();

        // Forms
        sb.AppendLine("### UI Forms");
        sb.AppendLine();
        sb.AppendLine($"- **Total forms:** {forms.Count}");
        var mdiCount = forms.Count(f => f.WindowType == 2);
        var modalCount = forms.Count(f => f.WindowType == 1);
        sb.AppendLine($"- MDI windows (type 2): {mdiCount}");
        sb.AppendLine($"- Modal windows (type 1): {modalCount}");
        sb.AppendLine();

        // Dependencies
        sb.AppendLine("### Cross-Project Dependencies");
        sb.AppendLine();
        sb.AppendLine($"- **Incoming calls:** {deps.IncomingCalls.Count}");
        sb.AppendLine($"- **Outgoing calls:** {deps.OutgoingCalls.Count}");
        sb.AppendLine();

        // Migration effort estimate
        var programs = extractor.GetProgramInventory(project);
        var high = programs.Count(p => p.ComplexityScore > 1000);
        var medium = programs.Count(p => p.ComplexityScore >= 100 && p.ComplexityScore <= 1000);
        var low = programs.Count(p => p.ComplexityScore < 100);

        sb.AppendLine("### Migration Effort Estimate");
        sb.AppendLine();
        sb.AppendLine("| Category | Programs | Estimated Effort |");
        sb.AppendLine("|----------|----------|------------------|");
        sb.AppendLine($"| 🟢 Simple (<100) | {low} | Low |");
        sb.AppendLine($"| 🟡 Standard (100-1000) | {medium} | Medium |");
        sb.AppendLine($"| 🔴 Complex (>1000) | {high} | High |");
        sb.AppendLine($"| **Total** | **{stats.ProgramCount}** | - |");

        return sb.ToString();
    }

    /// <summary>
    /// List all available projects in the Knowledge Base.
    /// </summary>
    [McpServerTool(Name = "magic_migration_projects")]
    [Description("List all available projects in the Knowledge Base with basic stats.")]
    public static string ListProjects(MigrationExtractor extractor)
    {
        var projects = extractor.GetAvailableProjects();

        if (projects.Count == 0)
            return "No projects found in Knowledge Base";

        var sb = new StringBuilder();
        sb.AppendLine("## Available Projects");
        sb.AppendLine();
        sb.AppendLine("| Project | Programs | Tasks | Expressions | Avg Complexity |");
        sb.AppendLine("|---------|----------|-------|-------------|----------------|");

        foreach (var projectName in projects)
        {
            var stats = extractor.GetProjectStats(projectName);
            if (stats != null)
            {
                sb.AppendLine($"| {projectName} | {stats.ProgramCount} | {stats.TotalTasks} | {stats.TotalExpressions} | {stats.AverageComplexity:F1} |");
            }
            else
            {
                sb.AppendLine($"| {projectName} | - | - | - | - |");
            }
        }

        sb.AppendLine();
        sb.AppendLine($"**Total projects:** {projects.Count}");

        return sb.ToString();
    }
}
