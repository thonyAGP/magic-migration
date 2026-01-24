using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Full-text search in the Magic Knowledge Base
/// </summary>
[McpServerToolType]
public static class KbSearchTool
{
    [McpServerTool(Name = "magic_kb_search")]
    [Description("Search the Magic Knowledge Base using full-text search. Searches programs, expressions, and columns.")]
    public static string Search(
        KnowledgeDb db,
        [Description("Search query (supports FTS5 syntax)")] string query,
        [Description("Search scope: 'all', 'programs', 'expressions', 'columns' (default: all)")] string scope = "all",
        [Description("Maximum results per category (default: 10)")] int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            return "ERROR: Query is required";

        var searchService = new SearchService(db);
        var sb = new StringBuilder();

        scope = scope.ToLowerInvariant();

        if (scope == "all" || scope == "programs")
        {
            var programs = searchService.SearchPrograms(query, limit);
            if (programs.Count > 0)
            {
                sb.AppendLine($"## Programs ({programs.Count} results)");
                sb.AppendLine();
                sb.AppendLine("| Project | IDE | Name | Public | Score |");
                sb.AppendLine("|---------|-----|------|--------|-------|");

                foreach (var p in programs)
                {
                    var publicName = p.PublicName ?? "";
                    sb.AppendLine($"| {p.ProjectName} | {p.IdePosition} | {p.Name} | {publicName} | {p.Score:F2} |");
                }
                sb.AppendLine();
            }
        }

        if (scope == "all" || scope == "expressions")
        {
            var expressions = searchService.SearchExpressions(query, limit);
            if (expressions.Count > 0)
            {
                sb.AppendLine($"## Expressions ({expressions.Count} results)");
                sb.AppendLine();
                sb.AppendLine("| Project | Program IDE | Expr IDE | Content (truncated) | Score |");
                sb.AppendLine("|---------|-------------|----------|---------------------|-------|");

                foreach (var e in expressions)
                {
                    var content = e.Content.Length > 50 ? e.Content[..50] + "..." : e.Content;
                    content = content.Replace("|", "\\|").Replace("\n", " ");
                    sb.AppendLine($"| {e.ProjectName} | {e.ProgramIdePosition} | {e.ExpressionIdePosition} | `{content}` | {e.Score:F2} |");
                }
                sb.AppendLine();
            }
        }

        if (scope == "all" || scope == "columns")
        {
            var columns = searchService.SearchColumns(query, limit);
            if (columns.Count > 0)
            {
                sb.AppendLine($"## Columns ({columns.Count} results)");
                sb.AppendLine();
                sb.AppendLine("| Project | Program | Task | Var | Name | Type | Def |");
                sb.AppendLine("|---------|---------|------|-----|------|------|-----|");

                foreach (var c in columns)
                {
                    sb.AppendLine($"| {c.ProjectName} | {c.ProgramIdePosition} | {c.TaskIdePosition} | {c.Variable} | {c.Name} | {c.DataType} | {c.Definition} |");
                }
                sb.AppendLine();
            }
        }

        if (sb.Length == 0)
        {
            return $"No results found for '{query}'";
        }

        return sb.ToString();
    }
}
