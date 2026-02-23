using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Orphan program detection in the Magic Knowledge Base
/// </summary>
[McpServerToolType]
public static class KbOrphanTool
{
    [McpServerTool(Name = "magic_kb_orphan_programs")]
    [Description(@"Detect orphan programs in a Magic project.

A program is NOT orphan if:
1. Called by other programs (callers > 0)
2. Has PublicName (callable via ProgIdx('name'))
3. Is in ECF shared component (ADH.ecf, REF.ecf)
4. Is empty (ISEMPTY_TSK)

Returns programs classified by status: ORPHAN (confirmed), CALLABLE_BY_NAME, CROSS_PROJECT_POSSIBLE, EMPTY, USED.")]
    public static string GetOrphanPrograms(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Include ECF shared programs (default: false)")] bool includeEcf = false,
        [Description("Only show confirmed orphans (default: false)")] bool onlyOrphans = false)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var service = new OrphanDetectionService(db);
        var all = service.GetOrphanPrograms(project, includeEcf);
        var stats = service.GetOrphanStats(project);

        if (onlyOrphans)
        {
            all = all.Where(a => a.Status == OrphanStatus.Orphan).ToList();
        }

        var sb = new StringBuilder();
        sb.AppendLine($"## Orphan Analysis: {project}");
        sb.AppendLine();
        sb.AppendLine("### Statistics");
        sb.AppendLine($"- Total programs: {stats.TotalPrograms}");
        sb.AppendLine($"- Used (has callers): {stats.UsedPrograms}");
        sb.AppendLine($"- Callable by name: {stats.CallableByName}");
        sb.AppendLine($"- Cross-project possible (ECF): {stats.CrossProjectPossible}");
        sb.AppendLine($"- Empty programs: {stats.EmptyPrograms}");
        sb.AppendLine($"- **Confirmed orphans**: {stats.ConfirmedOrphans}");
        sb.AppendLine();

        if (all.Count == 0)
        {
            sb.AppendLine("*No programs matching criteria*");
            return sb.ToString();
        }

        sb.AppendLine("### Programs");
        sb.AppendLine();
        sb.AppendLine("| IDE | Name | PublicName | Callers | Status |");
        sb.AppendLine("|-----|------|------------|---------|--------|");

        foreach (var prog in all.OrderBy(p => p.Status).ThenBy(p => p.IdePosition))
        {
            var statusIcon = prog.Status switch
            {
                OrphanStatus.Orphan => "ORPHAN",
                OrphanStatus.CallableByName => "CALLABLE",
                OrphanStatus.CrossProjectPossible => "ECF",
                OrphanStatus.EmptyProgram => "EMPTY",
                OrphanStatus.Used => "USED",
                _ => "?"
            };

            sb.AppendLine($"| {prog.IdePosition} | {prog.Name} | {prog.PublicName ?? "-"} | {prog.CallerCount} | {statusIcon} |");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_orphan_stats")]
    [Description("Get orphan program statistics for a project (quick summary without details).")]
    public static string GetOrphanStats(
        KnowledgeDb db,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var service = new OrphanDetectionService(db);
        var stats = service.GetOrphanStats(project);

        var sb = new StringBuilder();
        sb.AppendLine($"## Orphan Stats: {project}");
        sb.AppendLine();
        sb.AppendLine($"| Category | Count | % |");
        sb.AppendLine($"|----------|-------|---|");
        sb.AppendLine($"| Used (has callers) | {stats.UsedPrograms} | {Percent(stats.UsedPrograms, stats.TotalPrograms)} |");
        sb.AppendLine($"| Callable by name | {stats.CallableByName} | {Percent(stats.CallableByName, stats.TotalPrograms)} |");
        sb.AppendLine($"| Cross-project (ECF) | {stats.CrossProjectPossible} | {Percent(stats.CrossProjectPossible, stats.TotalPrograms)} |");
        sb.AppendLine($"| Empty programs | {stats.EmptyPrograms} | {Percent(stats.EmptyPrograms, stats.TotalPrograms)} |");
        sb.AppendLine($"| **Confirmed orphans** | **{stats.ConfirmedOrphans}** | **{Percent(stats.ConfirmedOrphans, stats.TotalPrograms)}** |");
        sb.AppendLine($"|----------|-------|---|");
        sb.AppendLine($"| **Total** | **{stats.TotalPrograms}** | 100% |");

        return sb.ToString();
    }

    private static string Percent(int part, int total)
    {
        if (total == 0) return "0%";
        return $"{(double)part / total * 100:F1}%";
    }
}
