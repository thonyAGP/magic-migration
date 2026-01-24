using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Queries;

/// <summary>
/// Service for tracking data lineage (table and field usage)
/// </summary>
public class LineageService
{
    private readonly KnowledgeDb _db;

    public LineageService(KnowledgeDb db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all usages of a table
    /// </summary>
    public List<TableUsageResult> GetTableUsage(int tableId)
    {
        var results = new List<TableUsageResult>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                proj.name as project_name,
                p.ide_position,
                p.name as program_name,
                t.ide_position as task_ide,
                tu.usage_type,
                tu.link_number
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects proj ON p.project_id = proj.id
            WHERE tu.table_id = @tableId
            ORDER BY proj.name, p.ide_position, t.ide_position";

        cmd.Parameters.AddWithValue("@tableId", tableId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new TableUsageResult
            {
                ProjectName = reader.GetString(0),
                ProgramIdePosition = reader.GetInt32(1),
                ProgramName = reader.GetString(2),
                TaskIdePosition = reader.GetString(3),
                UsageType = reader.GetString(4),
                LinkNumber = reader.IsDBNull(5) ? null : reader.GetInt32(5)
            });
        }

        return results;
    }

    /// <summary>
    /// Get all usages of a table by IDE position
    /// </summary>
    public List<TableUsageResult> GetTableUsageByIde(int idePosition)
    {
        // First find the table by IDE position
        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = "SELECT xml_id FROM tables WHERE ide_position = @ide";
        cmd.Parameters.AddWithValue("@ide", idePosition);

        var xmlId = cmd.ExecuteScalar();
        if (xmlId == null) return new List<TableUsageResult>();

        return GetTableUsage(Convert.ToInt32(xmlId));
    }

    /// <summary>
    /// Get all usages of a table by name
    /// </summary>
    public List<TableUsageResult> GetTableUsageByName(string tableName)
    {
        var results = new List<TableUsageResult>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                proj.name as project_name,
                p.ide_position,
                p.name as program_name,
                t.ide_position as task_ide,
                tu.usage_type,
                tu.link_number
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects proj ON p.project_id = proj.id
            JOIN tables tbl ON tu.table_id = tbl.xml_id
            WHERE tbl.logical_name LIKE @name OR tbl.public_name LIKE @name
            ORDER BY proj.name, p.ide_position, t.ide_position";

        cmd.Parameters.AddWithValue("@name", $"%{tableName}%");

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new TableUsageResult
            {
                ProjectName = reader.GetString(0),
                ProgramIdePosition = reader.GetInt32(1),
                ProgramName = reader.GetString(2),
                TaskIdePosition = reader.GetString(3),
                UsageType = reader.GetString(4),
                LinkNumber = reader.IsDBNull(5) ? null : reader.GetInt32(5)
            });
        }

        return results;
    }

    /// <summary>
    /// Get field usage (where a specific column is referenced)
    /// </summary>
    public List<FieldUsageResult> GetFieldUsage(string fieldName)
    {
        var results = new List<FieldUsageResult>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                proj.name as project_name,
                p.ide_position as program_ide,
                p.name as program_name,
                t.ide_position as task_ide,
                c.variable,
                c.name,
                c.data_type,
                c.definition
            FROM dataview_columns c
            JOIN tasks t ON c.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects proj ON p.project_id = proj.id
            WHERE c.name LIKE @name
            ORDER BY proj.name, p.ide_position, t.ide_position";

        cmd.Parameters.AddWithValue("@name", $"%{fieldName}%");

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new FieldUsageResult
            {
                ProjectName = reader.GetString(0),
                ProgramIdePosition = reader.GetInt32(1),
                ProgramName = reader.GetString(2),
                TaskIdePosition = reader.GetString(3),
                Variable = reader.GetString(4),
                FieldName = reader.GetString(5),
                DataType = reader.GetString(6),
                Definition = reader.GetString(7)
            });
        }

        return results;
    }

    /// <summary>
    /// Get table information by ID
    /// </summary>
    public DbTable? GetTable(int tableId)
    {
        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM tables WHERE xml_id = @id";
        cmd.Parameters.AddWithValue("@id", tableId);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return new DbTable
        {
            Id = reader.GetInt64(0),
            XmlId = reader.GetInt32(1),
            IdePosition = reader.GetInt32(2),
            PublicName = reader.IsDBNull(3) ? null : reader.GetString(3),
            LogicalName = reader.GetString(4),
            PhysicalName = reader.IsDBNull(5) ? null : reader.GetString(5),
            ColumnCount = reader.GetInt32(6)
        };
    }

    /// <summary>
    /// Get table by IDE position
    /// </summary>
    public DbTable? GetTableByIde(int idePosition)
    {
        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM tables WHERE ide_position = @ide";
        cmd.Parameters.AddWithValue("@ide", idePosition);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return new DbTable
        {
            Id = reader.GetInt64(0),
            XmlId = reader.GetInt32(1),
            IdePosition = reader.GetInt32(2),
            PublicName = reader.IsDBNull(3) ? null : reader.GetString(3),
            LogicalName = reader.GetString(4),
            PhysicalName = reader.IsDBNull(5) ? null : reader.GetString(5),
            ColumnCount = reader.GetInt32(6)
        };
    }

    /// <summary>
    /// Search tables by name
    /// </summary>
    public List<DbTable> SearchTables(string query, int limit = 20)
    {
        var results = new List<DbTable>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT * FROM tables
            WHERE logical_name LIKE @query
               OR public_name LIKE @query
               OR physical_name LIKE @query
            ORDER BY ide_position
            LIMIT @limit";

        cmd.Parameters.AddWithValue("@query", $"%{query}%");
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new DbTable
            {
                Id = reader.GetInt64(0),
                XmlId = reader.GetInt32(1),
                IdePosition = reader.GetInt32(2),
                PublicName = reader.IsDBNull(3) ? null : reader.GetString(3),
                LogicalName = reader.GetString(4),
                PhysicalName = reader.IsDBNull(5) ? null : reader.GetString(5),
                ColumnCount = reader.GetInt32(6)
            });
        }

        return results;
    }

    /// <summary>
    /// Get usage statistics for a table
    /// </summary>
    public TableUsageStats GetTableUsageStats(int tableId)
    {
        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                usage_type,
                COUNT(*) as count
            FROM table_usage
            WHERE table_id = @tableId
            GROUP BY usage_type";

        cmd.Parameters.AddWithValue("@tableId", tableId);

        var stats = new TableUsageStats { TableId = tableId };

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var usageType = reader.GetString(0);
            var count = reader.GetInt32(1);

            switch (usageType)
            {
                case "READ":
                    stats = stats with { ReadCount = count };
                    break;
                case "WRITE":
                    stats = stats with { WriteCount = count };
                    break;
                case "MODIFY":
                    stats = stats with { ModifyCount = count };
                    break;
                case "DELETE":
                    stats = stats with { DeleteCount = count };
                    break;
                case "LINK":
                    stats = stats with { LinkCount = count };
                    break;
            }
        }

        return stats;
    }
}

/// <summary>
/// Field usage result
/// </summary>
public record FieldUsageResult
{
    public required string ProjectName { get; init; }
    public int ProgramIdePosition { get; init; }
    public required string ProgramName { get; init; }
    public required string TaskIdePosition { get; init; }
    public required string Variable { get; init; }
    public required string FieldName { get; init; }
    public required string DataType { get; init; }
    public required string Definition { get; init; }
}

/// <summary>
/// Table usage statistics
/// </summary>
public record TableUsageStats
{
    public int TableId { get; init; }
    public int ReadCount { get; init; }
    public int WriteCount { get; init; }
    public int ModifyCount { get; init; }
    public int DeleteCount { get; init; }
    public int LinkCount { get; init; }

    public int TotalCount => ReadCount + WriteCount + ModifyCount + DeleteCount + LinkCount;
}
