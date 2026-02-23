using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Indexing;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Administration and statistics for the Magic Knowledge Base
/// </summary>
[McpServerToolType]
public static class KbAdminTool
{
    [McpServerTool(Name = "magic_kb_stats")]
    [Description("Get statistics about the Magic Knowledge Base: number of projects, programs, tasks, expressions, tables, etc.")]
    public static string GetStats(KnowledgeDb db)
    {
        var stats = db.GetStats();

        var sb = new StringBuilder();
        sb.AppendLine("## Magic Knowledge Base Statistics");
        sb.AppendLine();
        sb.AppendLine("| Metric | Value |");
        sb.AppendLine("|--------|-------|");
        sb.AppendLine($"| Projects | {stats.ProjectCount} |");
        sb.AppendLine($"| Programs | {stats.ProgramCount:N0} |");
        sb.AppendLine($"| Tasks | {stats.TaskCount:N0} |");
        sb.AppendLine($"| Expressions | {stats.ExpressionCount:N0} |");
        sb.AppendLine($"| Tables | {stats.TableCount:N0} |");
        sb.AppendLine($"| DataView Columns | {stats.ColumnCount:N0} |");
        sb.AppendLine($"| Logic Lines | {stats.LogicLineCount:N0} |");
        sb.AppendLine($"| Program Calls | {stats.ProgramCallCount:N0} |");
        sb.AppendLine($"| Database Size | {FormatSize(stats.DatabaseSizeBytes)} |");

        if (stats.LastIndexedAt.HasValue)
        {
            sb.AppendLine($"| Last Indexed | {stats.LastIndexedAt.Value:yyyy-MM-dd HH:mm:ss} |");
        }

        // Get project breakdown
        sb.AppendLine();
        sb.AppendLine("### Projects");
        sb.AppendLine();
        sb.AppendLine("| Project | Programs | Status |");
        sb.AppendLine("|---------|----------|--------|");

        foreach (var project in db.GetAllProjects())
        {
            sb.AppendLine($"| {project.Name} | {project.ProgramCount} | {project.IndexedAt:yyyy-MM-dd HH:mm} |");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_reindex")]
    [Description("Force a full re-indexing of the Magic Knowledge Base. Use when data is out of sync.")]
    public static async Task<string> Reindex(
        KnowledgeDb db,
        [Description("Base path to Magic projects (default: D:/Data/Migration/XPA/PMS)")] string? basePath = null,
        [Description("Only reindex a specific project (optional)")] string? projectName = null)
    {
        var projectsBasePath = basePath ?? "D:/Data/Migration/XPA/PMS";

        if (!Directory.Exists(projectsBasePath))
        {
            return $"ERROR: Projects base path not found: {projectsBasePath}";
        }

        try
        {
            // Initialize schema if needed
            if (!db.IsInitialized())
            {
                db.InitializeSchema();
            }

            var progress = new Progress<IndexProgress>(p =>
            {
                Console.Error.WriteLine($"[KB] {p.Phase}: {p.Message}");
            });

            if (!string.IsNullOrEmpty(projectName))
            {
                // Reindex single project
                var indexer = new BatchIndexer(db, projectsBasePath, progress);
                var result = await indexer.IndexProjectAsync(projectName);

                return $"Reindexed {projectName}: {result.ProgramsIndexed} programs, {result.TasksIndexed} tasks, {result.ExpressionsIndexed} expressions in {result.ElapsedMs}ms";
            }
            else
            {
                // Full reindex
                var indexer = new BatchIndexer(db, projectsBasePath, progress);
                var result = await indexer.IndexAllAsync();

                var sb = new StringBuilder();
                sb.AppendLine("## Reindex Complete");
                sb.AppendLine();
                sb.AppendLine($"- Projects: {result.ProjectsIndexed}");
                sb.AppendLine($"- Programs: {result.ProgramsIndexed}");
                sb.AppendLine($"- Tasks: {result.TasksIndexed}");
                sb.AppendLine($"- Expressions: {result.ExpressionsIndexed}");
                sb.AppendLine($"- Tables: {result.TablesIndexed}");
                sb.AppendLine($"- Time: {result.ElapsedMs}ms");

                if (result.HasErrors)
                {
                    sb.AppendLine();
                    sb.AppendLine("### Errors");
                    foreach (var error in result.Errors.Take(10))
                    {
                        sb.AppendLine($"- {error}");
                    }
                    if (result.Errors.Count > 10)
                    {
                        sb.AppendLine($"- ... and {result.Errors.Count - 10} more");
                    }
                }

                return sb.ToString();
            }
        }
        catch (Exception ex)
        {
            return $"ERROR during reindex: {ex.Message}";
        }
    }

    [McpServerTool(Name = "magic_kb_update")]
    [Description("Incrementally update the Knowledge Base with only changed files. Fast update (< 5 seconds if no changes).")]
    public static async Task<string> IncrementalUpdate(
        KnowledgeDb db,
        [Description("Base path to Magic projects (default: D:/Data/Migration/XPA/PMS)")] string? basePath = null)
    {
        var projectsBasePath = basePath ?? "D:/Data/Migration/XPA/PMS";

        if (!Directory.Exists(projectsBasePath))
        {
            return $"ERROR: Projects base path not found: {projectsBasePath}";
        }

        try
        {
            if (!db.IsInitialized())
            {
                return "ERROR: Knowledge Base not initialized. Run magic_kb_reindex first.";
            }

            var progress = new Progress<IndexProgress>(p =>
            {
                Console.Error.WriteLine($"[KB] {p.Phase}: {p.Message}");
            });

            var indexer = new IncrementalIndexer(db, projectsBasePath, progress);
            var result = await indexer.UpdateAllAsync();

            if (result.FilesUpdated == 0 && result.FilesDeleted == 0 && result.NewProjectsIndexed == 0)
            {
                return $"Knowledge Base is up to date. (checked in {result.ElapsedMs}ms)";
            }

            var sb = new StringBuilder();
            sb.AppendLine("## Incremental Update Complete");
            sb.AppendLine();
            sb.AppendLine($"- New projects: {result.NewProjectsIndexed}");
            sb.AppendLine($"- Projects updated: {result.ProjectsUpdated}");
            sb.AppendLine($"- Files updated: {result.FilesUpdated}");
            sb.AppendLine($"- Files deleted: {result.FilesDeleted}");
            sb.AppendLine($"- Time: {result.ElapsedMs}ms");

            if (result.HasErrors)
            {
                sb.AppendLine();
                sb.AppendLine("### Errors");
                foreach (var error in result.Errors.Take(10))
                {
                    sb.AppendLine($"- {error}");
                }
            }

            return sb.ToString();
        }
        catch (Exception ex)
        {
            return $"ERROR during incremental update: {ex.Message}";
        }
    }

    private static string FormatSize(long bytes)
    {
        if (bytes < 1024) return $"{bytes} B";
        if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
        if (bytes < 1024 * 1024 * 1024) return $"{bytes / (1024.0 * 1024):F1} MB";
        return $"{bytes / (1024.0 * 1024 * 1024):F1} GB";
    }
}
