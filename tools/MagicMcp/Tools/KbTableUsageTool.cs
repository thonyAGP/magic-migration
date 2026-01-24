using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Queries;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Table and field usage analysis in the Magic Knowledge Base
/// </summary>
[McpServerToolType]
public static class KbTableUsageTool
{
    [McpServerTool(Name = "magic_kb_table_usage")]
    [Description("Find all programs that use a specific table. Shows READ, WRITE, MODIFY, DELETE, and LINK operations.")]
    public static string GetTableUsage(
        KnowledgeDb db,
        [Description("Table name to search for (partial match supported)")] string tableName,
        [Description("Filter by usage type: all, READ, WRITE, MODIFY, DELETE, LINK (default: all)")] string usageType = "all")
    {
        if (string.IsNullOrWhiteSpace(tableName))
            return "ERROR: Table name is required";

        var lineageService = new LineageService(db);
        var usages = lineageService.GetTableUsageByName(tableName);

        if (!string.IsNullOrWhiteSpace(usageType) && usageType.ToUpperInvariant() != "ALL")
        {
            usages = usages.Where(u => u.UsageType.Equals(usageType, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (usages.Count == 0)
        {
            return $"No usages found for table '{tableName}'";
        }

        var sb = new StringBuilder();
        sb.AppendLine($"## Table Usage: '{tableName}'");
        sb.AppendLine();
        sb.AppendLine($"Found {usages.Count} usage(s)");
        sb.AppendLine();

        // Group by usage type
        var grouped = usages.GroupBy(u => u.UsageType).OrderBy(g => g.Key);

        foreach (var group in grouped)
        {
            sb.AppendLine($"### {group.Key} ({group.Count()})");
            sb.AppendLine();
            sb.AppendLine("| Project | Program IDE | Program Name | Task |");
            sb.AppendLine("|---------|-------------|--------------|------|");

            foreach (var usage in group)
            {
                var linkInfo = usage.LinkNumber.HasValue ? $" (Link #{usage.LinkNumber})" : "";
                sb.AppendLine($"| {usage.ProjectName} | {usage.ProgramIdePosition} | {usage.ProgramName} | {usage.TaskIdePosition}{linkInfo} |");
            }
            sb.AppendLine();
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_field_usage")]
    [Description("Find all programs that use a specific field/column name. Shows where the field appears in DataViews.")]
    public static string GetFieldUsage(
        KnowledgeDb db,
        [Description("Field/column name to search for (partial match supported)")] string fieldName,
        [Description("Filter by definition: all, R (Real), V (Virtual), P (Parameter) (default: all)")] string definition = "all")
    {
        if (string.IsNullOrWhiteSpace(fieldName))
            return "ERROR: Field name is required";

        var lineageService = new LineageService(db);
        var usages = lineageService.GetFieldUsage(fieldName);

        if (!string.IsNullOrWhiteSpace(definition) && definition.ToUpperInvariant() != "ALL")
        {
            usages = usages.Where(u => u.Definition.Equals(definition, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (usages.Count == 0)
        {
            return $"No usages found for field '{fieldName}'";
        }

        var sb = new StringBuilder();
        sb.AppendLine($"## Field Usage: '{fieldName}'");
        sb.AppendLine();
        sb.AppendLine($"Found {usages.Count} usage(s)");
        sb.AppendLine();
        sb.AppendLine("| Project | Program IDE | Task | Var | Name | Type | Def |");
        sb.AppendLine("|---------|-------------|------|-----|------|------|-----|");

        foreach (var usage in usages)
        {
            sb.AppendLine($"| {usage.ProjectName} | {usage.ProgramIdePosition} | {usage.TaskIdePosition} | {usage.Variable} | {usage.FieldName} | {usage.DataType} | {usage.Definition} |");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_table_info")]
    [Description("Get information about a specific table from the Knowledge Base.")]
    public static string GetTableInfo(
        KnowledgeDb db,
        [Description("Table IDE position")] int idePosition)
    {
        var lineageService = new LineageService(db);
        var table = lineageService.GetTableByIde(idePosition);

        if (table == null)
        {
            return $"Table with IDE position {idePosition} not found";
        }

        var stats = lineageService.GetTableUsageStats(table.XmlId);

        var sb = new StringBuilder();
        sb.AppendLine($"## Table #{table.IdePosition}: {table.LogicalName}");
        sb.AppendLine();
        sb.AppendLine("| Property | Value |");
        sb.AppendLine("|----------|-------|");
        sb.AppendLine($"| XML ID | {table.XmlId} |");
        sb.AppendLine($"| IDE Position | {table.IdePosition} |");
        sb.AppendLine($"| Logical Name | {table.LogicalName} |");
        sb.AppendLine($"| Public Name | {table.PublicName ?? "(none)"} |");
        sb.AppendLine($"| Physical Name | {table.PhysicalName ?? "(none)"} |");
        sb.AppendLine();
        sb.AppendLine("### Usage Statistics");
        sb.AppendLine();
        sb.AppendLine("| Operation | Count |");
        sb.AppendLine("|-----------|-------|");
        sb.AppendLine($"| READ | {stats.ReadCount} |");
        sb.AppendLine($"| WRITE | {stats.WriteCount} |");
        sb.AppendLine($"| MODIFY | {stats.ModifyCount} |");
        sb.AppendLine($"| DELETE | {stats.DeleteCount} |");
        sb.AppendLine($"| LINK | {stats.LinkCount} |");
        sb.AppendLine($"| **TOTAL** | **{stats.TotalCount}** |");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_kb_search_tables")]
    [Description("Search for tables in the Knowledge Base by name.")]
    public static string SearchTables(
        KnowledgeDb db,
        [Description("Search query for table name")] string query,
        [Description("Maximum results (default: 20)")] int limit = 20)
    {
        if (string.IsNullOrWhiteSpace(query))
            return "ERROR: Query is required";

        var lineageService = new LineageService(db);
        var tables = lineageService.SearchTables(query, limit);

        if (tables.Count == 0)
        {
            return $"No tables found matching '{query}'";
        }

        var sb = new StringBuilder();
        sb.AppendLine($"## Tables matching '{query}'");
        sb.AppendLine();
        sb.AppendLine($"Found {tables.Count} table(s)");
        sb.AppendLine();
        sb.AppendLine("| IDE | Logical Name | Public Name | Physical Name |");
        sb.AppendLine("|-----|--------------|-------------|---------------|");

        foreach (var table in tables)
        {
            sb.AppendLine($"| {table.IdePosition} | {table.LogicalName} | {table.PublicName ?? ""} | {table.PhysicalName ?? ""} |");
        }

        return sb.ToString();
    }
}
