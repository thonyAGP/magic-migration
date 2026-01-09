using System.ComponentModel;
using System.Text;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class GetTableTool
{
    [McpServerTool(Name = "magic_get_table")]
    [Description("Get table info by ID or search by name. Returns IDE position, logical name, physical name, and public name.")]
    public static string GetTable(
        TableMappingService tableMappingService,
        [Description("Table XML id (obj= value) OR search query for name")] string query)
    {
        var sb = new StringBuilder();

        // Try to parse as numeric ID first
        if (int.TryParse(query, out int xmlId))
        {
            var table = tableMappingService.GetTableById(xmlId);
            if (table == null)
            {
                return $"Table with XML id={xmlId} not found (may not have PublicName)";
            }

            sb.AppendLine($"Table XML id={xmlId}");
            sb.AppendLine($"  IDE Position: #{table.IdePosition}");
            sb.AppendLine($"  Logical Name: {table.LogicalName}");
            sb.AppendLine($"  Physical Name: {table.PhysicalName}");
            sb.AppendLine($"  Public Name: {table.PublicName}");
            return sb.ToString();
        }

        // Search by name
        var results = tableMappingService.SearchTables(query).Take(20).ToList();
        if (results.Count == 0)
        {
            return $"No tables found matching '{query}'";
        }

        sb.AppendLine($"Tables matching '{query}' ({results.Count} results):");
        sb.AppendLine();
        sb.AppendLine("IDE#  | XML ID | Name");
        sb.AppendLine("------|--------|------");

        foreach (var t in results)
        {
            sb.AppendLine($"{t.IdePosition,5} | {t.XmlId,6} | {t.LogicalName}");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_list_tables")]
    [Description("List all tables or tables in a specific range of IDE positions")]
    public static string ListTables(
        TableMappingService tableMappingService,
        [Description("Start IDE position (default: 1)")] int start = 1,
        [Description("End IDE position (default: 50)")] int end = 50)
    {
        var sb = new StringBuilder();
        var tables = tableMappingService.GetAllTables()
            .Where(t => t.IdePosition >= start && t.IdePosition <= end)
            .ToList();

        sb.AppendLine($"Tables from IDE #{start} to #{end} ({tables.Count} tables):");
        sb.AppendLine();
        sb.AppendLine("IDE#  | XML ID | Logical Name                    | Physical Name");
        sb.AppendLine("------|--------|--------------------------------|---------------");

        foreach (var t in tables)
        {
            sb.AppendLine($"{t.IdePosition,5} | {t.XmlId,6} | {t.LogicalName,-30} | {t.PhysicalName}");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_table_stats")]
    [Description("Get statistics about table mapping")]
    public static string GetTableStats(TableMappingService tableMappingService)
    {
        var stats = tableMappingService.GetStats();
        var sb = new StringBuilder();

        sb.AppendLine("Table Mapping Statistics:");
        sb.AppendLine($"  Total tables: {stats.Total}");
        sb.AppendLine($"  With PublicName: {stats.WithPublic}");
        sb.AppendLine($"  Without PublicName: {stats.WithoutPublic}");
        sb.AppendLine();
        sb.AppendLine("Note: Tables without PublicName create offset in IDE numbering.");
        sb.AppendLine("Formula: IDE Position = XML ID - (tables without PublicName before this ID)");

        return sb.ToString();
    }
}
