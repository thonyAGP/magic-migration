using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: SQL Server metadata - query real database structure (columns, types, FK, indexes, sample values)
/// Data imported from Extract-SqlMetadata.ps1 via KbIndexRunner import-sql-metadata
/// </summary>
[McpServerToolType]
public static class SqlMetadataTool
{
    [McpServerTool(Name = "magic_sql_table_info")]
    [Description("Get complete SQL Server table structure: columns with types/sizes, primary keys, foreign keys, indexes, and sample values. Use this BEFORE writing any SQL query to get exact column names.")]
    public static string GetTableInfo(
        KnowledgeDb db,
        [Description("SQL table name (e.g., cafil008_dat, cafil018_dat). Supports LIKE wildcards (%).")] string tableName)
    {
        var sb = new StringBuilder();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT id, database_name, table_name, logical_name, row_count, column_count, primary_key_json
            FROM sql_tables
            WHERE table_name LIKE @name
            ORDER BY table_name";
        cmd.Parameters.AddWithValue("@name", tableName.Contains('%') ? tableName : tableName);

        var tables = new List<(long id, string db, string name, string? logical, int rows, int cols, string? pk)>();
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                tables.Add((
                    reader.GetInt64(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3),
                    reader.GetInt32(4),
                    reader.GetInt32(5),
                    reader.IsDBNull(6) ? null : reader.GetString(6)
                ));
            }
        }

        if (tables.Count == 0)
        {
            sb.AppendLine($"No SQL table found matching '{tableName}'.");
            sb.AppendLine();
            sb.AppendLine("> Run `Extract-SqlMetadata.ps1` then `KbIndexRunner import-sql-metadata` to import metadata.");
            return sb.ToString();
        }

        foreach (var table in tables)
        {
            sb.AppendLine($"# {table.name}");
            if (!string.IsNullOrEmpty(table.logical))
                sb.AppendLine($"**Magic logical name**: `{table.logical}`");
            sb.AppendLine();
            sb.AppendLine($"| Info | Value |");
            sb.AppendLine($"|------|-------|");
            sb.AppendLine($"| Database | {table.db} |");
            sb.AppendLine($"| Rows | {table.rows} |");
            sb.AppendLine($"| Columns | {table.cols} |");
            if (!string.IsNullOrEmpty(table.pk))
                sb.AppendLine($"| Primary Key | {table.pk} |");
            sb.AppendLine();

            // Columns
            sb.AppendLine("## Columns");
            sb.AppendLine();
            sb.AppendLine("| # | Column | Type | Size | Null | PK | Distinct |");
            sb.AppendLine("|---|--------|------|------|------|----|----------|");

            using var colCmd = db.Connection.CreateCommand();
            colCmd.CommandText = @"
                SELECT column_name, ordinal_position, sql_type, max_length, numeric_precision, numeric_scale,
                       is_nullable, is_primary_key, distinct_count, sample_values_json
                FROM sql_columns
                WHERE sql_table_id = @tid
                ORDER BY ordinal_position";
            colCmd.Parameters.AddWithValue("@tid", table.id);

            var columnsWithSamples = new List<(string name, int distinct, string samples)>();

            using (var colReader = colCmd.ExecuteReader())
            {
                while (colReader.Read())
                {
                    var colName = colReader.GetString(0);
                    var pos = colReader.GetInt32(1);
                    var sqlType = colReader.GetString(2);

                    var sizeStr = "";
                    if (!colReader.IsDBNull(3))
                    {
                        var maxLen = colReader.GetInt32(3);
                        sizeStr = maxLen == -1 ? "MAX" : maxLen.ToString();
                    }
                    else if (!colReader.IsDBNull(4))
                    {
                        sizeStr = colReader.GetInt32(4).ToString();
                        if (!colReader.IsDBNull(5) && colReader.GetInt32(5) != 0)
                            sizeStr += $",{colReader.GetInt32(5)}";
                    }

                    var nullable = colReader.GetInt32(6) == 1 ? "Y" : "N";
                    var isPk = colReader.GetInt32(7) == 1 ? "PK" : "";
                    var distinctCnt = colReader.GetInt32(8);
                    var distinctStr = distinctCnt >= 0 ? distinctCnt.ToString() : "?";

                    sb.AppendLine($"| {pos} | `{colName}` | {sqlType} | {sizeStr} | {nullable} | {isPk} | {distinctStr} |");

                    if (!colReader.IsDBNull(9))
                    {
                        columnsWithSamples.Add((colName, distinctCnt, colReader.GetString(9)));
                    }
                }
            }

            // Sample values
            if (columnsWithSamples.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("## Sample Values");
                sb.AppendLine();
                foreach (var (name, distinct, samples) in columnsWithSamples)
                {
                    sb.AppendLine($"### `{name}` ({distinct} values)");
                    sb.AppendLine("```");
                    // Parse JSON array and display
                    try
                    {
                        var arr = System.Text.Json.JsonSerializer.Deserialize<string[]>(samples);
                        if (arr != null)
                            sb.AppendLine(string.Join(", ", arr.Take(30)));
                    }
                    catch
                    {
                        sb.AppendLine(samples);
                    }
                    sb.AppendLine("```");
                    sb.AppendLine();
                }
            }

            // Foreign Keys
            using var fkCmd = db.Connection.CreateCommand();
            fkCmd.CommandText = @"
                SELECT fk_name, columns_json, referenced_table, referenced_columns_json
                FROM sql_foreign_keys
                WHERE sql_table_id = @tid";
            fkCmd.Parameters.AddWithValue("@tid", table.id);

            var hasFks = false;
            using (var fkReader = fkCmd.ExecuteReader())
            {
                while (fkReader.Read())
                {
                    if (!hasFks)
                    {
                        sb.AppendLine("## Foreign Keys");
                        sb.AppendLine();
                        sb.AppendLine("| FK | Column(s) | Referenced Table | Referenced Column(s) |");
                        sb.AppendLine("|----|-----------|------------------|---------------------|");
                        hasFks = true;
                    }
                    sb.AppendLine($"| {fkReader.GetString(0)} | {fkReader.GetString(1)} | {fkReader.GetString(2)} | {fkReader.GetString(3)} |");
                }
            }
            if (hasFks) sb.AppendLine();

            // Indexes
            using var idxCmd = db.Connection.CreateCommand();
            idxCmd.CommandText = @"
                SELECT index_name, index_type, is_unique, columns_json
                FROM sql_indexes
                WHERE sql_table_id = @tid";
            idxCmd.Parameters.AddWithValue("@tid", table.id);

            var hasIdx = false;
            using (var idxReader = idxCmd.ExecuteReader())
            {
                while (idxReader.Read())
                {
                    if (!hasIdx)
                    {
                        sb.AppendLine("## Indexes");
                        sb.AppendLine();
                        sb.AppendLine("| Name | Type | Unique | Columns |");
                        sb.AppendLine("|------|------|--------|---------|");
                        hasIdx = true;
                    }
                    var uStr = idxReader.GetInt32(2) == 1 ? "Y" : "N";
                    sb.AppendLine($"| {idxReader.GetString(0)} | {(idxReader.IsDBNull(1) ? "" : idxReader.GetString(1))} | {uStr} | {idxReader.GetString(3)} |");
                }
            }
            if (hasIdx) sb.AppendLine();

            sb.AppendLine("---");
            sb.AppendLine();
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_sql_search_column")]
    [Description("Search SQL Server columns by name pattern. Use this to find the exact column name before writing SQL. Supports LIKE wildcards (%).")]
    public static string SearchColumn(
        KnowledgeDb db,
        [Description("Column name pattern (e.g., %societe%, %filiation%, cte_%). Uses SQL LIKE syntax.")] string columnPattern,
        [Description("Optional: filter by table name pattern (e.g., cafil008%)")] string? tableFilter = null)
    {
        var sb = new StringBuilder();

        using var cmd = db.Connection.CreateCommand();
        var sql = @"
            SELECT t.table_name, t.logical_name, c.column_name, c.sql_type,
                   c.max_length, c.numeric_precision, c.numeric_scale,
                   c.is_nullable, c.is_primary_key, c.distinct_count
            FROM sql_columns c
            INNER JOIN sql_tables t ON t.id = c.sql_table_id
            WHERE c.column_name LIKE @col";

        if (!string.IsNullOrEmpty(tableFilter))
            sql += " AND t.table_name LIKE @tbl";

        sql += " ORDER BY t.table_name, c.ordinal_position LIMIT 200";

        cmd.CommandText = sql;
        cmd.Parameters.AddWithValue("@col", columnPattern.Contains('%') ? columnPattern : $"%{columnPattern}%");
        if (!string.IsNullOrEmpty(tableFilter))
            cmd.Parameters.AddWithValue("@tbl", tableFilter.Contains('%') ? tableFilter : $"{tableFilter}%");

        sb.AppendLine($"## SQL Column Search: `{columnPattern}`");
        if (!string.IsNullOrEmpty(tableFilter))
            sb.AppendLine($"Table filter: `{tableFilter}`");
        sb.AppendLine();

        int count = 0;
        sb.AppendLine("| Table | Logical Name | Column | Type | Size | Null | PK | Distinct |");
        sb.AppendLine("|-------|--------------|--------|------|------|------|----|----------|");

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                count++;
                var tblName = reader.GetString(0);
                var logical = reader.IsDBNull(1) ? "" : reader.GetString(1);
                var colName = reader.GetString(2);
                var sqlType = reader.GetString(3);

                var sizeStr = "";
                if (!reader.IsDBNull(4))
                {
                    var ml = reader.GetInt32(4);
                    sizeStr = ml == -1 ? "MAX" : ml.ToString();
                }
                else if (!reader.IsDBNull(5))
                {
                    sizeStr = reader.GetInt32(5).ToString();
                    if (!reader.IsDBNull(6) && reader.GetInt32(6) != 0)
                        sizeStr += $",{reader.GetInt32(6)}";
                }

                var nullable = reader.GetInt32(7) == 1 ? "Y" : "N";
                var isPk = reader.GetInt32(8) == 1 ? "PK" : "";
                var dc = reader.GetInt32(9);
                var dcStr = dc >= 0 ? dc.ToString() : "?";

                sb.AppendLine($"| {tblName} | {logical} | `{colName}` | {sqlType} | {sizeStr} | {nullable} | {isPk} | {dcStr} |");
            }
        }

        sb.AppendLine();
        sb.AppendLine($"**{count} column(s) found**");
        if (count >= 200)
            sb.AppendLine("*Results truncated at 200. Use a more specific pattern.*");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_sql_tables")]
    [Description("List all SQL Server tables with row counts and column counts. Overview of the database structure.")]
    public static string ListTables(
        KnowledgeDb db,
        [Description("Optional: filter by table name pattern (e.g., cafil%, pv_%)")] string? tableFilter = null)
    {
        var sb = new StringBuilder();

        using var cmd = db.Connection.CreateCommand();
        var sql = "SELECT table_name, logical_name, row_count, column_count, primary_key_json FROM sql_tables";
        if (!string.IsNullOrEmpty(tableFilter))
            sql += " WHERE table_name LIKE @filter";
        sql += " ORDER BY table_name";

        cmd.CommandText = sql;
        if (!string.IsNullOrEmpty(tableFilter))
            cmd.Parameters.AddWithValue("@filter", tableFilter.Contains('%') ? tableFilter : $"{tableFilter}%");

        sb.AppendLine("## SQL Server Tables");
        sb.AppendLine();

        int count = 0;
        sb.AppendLine("| Table | Magic Name | Rows | Cols | PK |");
        sb.AppendLine("|-------|------------|------|------|----|");

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                count++;
                var name = reader.GetString(0);
                var logical = reader.IsDBNull(1) ? "" : reader.GetString(1);
                var rows = reader.GetInt32(2);
                var cols = reader.GetInt32(3);
                var pk = reader.IsDBNull(4) ? "" : reader.GetString(4);
                sb.AppendLine($"| `{name}` | {logical} | {rows} | {cols} | {pk} |");
            }
        }

        sb.AppendLine();
        sb.AppendLine($"**{count} table(s)**");

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_sql_search_value")]
    [Description("Search for a specific value across all sampled columns. Useful to find which tables/columns contain a specific code or value.")]
    public static string SearchValue(
        KnowledgeDb db,
        [Description("Value to search for in sample data (e.g., EXCHANGE, SMRNS1, SKI). Case-insensitive.")] string value)
    {
        var sb = new StringBuilder();

        // Use FTS if available, fallback to LIKE on sample_values_json
        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT t.table_name, t.logical_name, c.column_name, c.sql_type, c.distinct_count, c.sample_values_json
            FROM sql_columns c
            INNER JOIN sql_tables t ON t.id = c.sql_table_id
            WHERE c.sample_values_json LIKE @val
            ORDER BY t.table_name, c.ordinal_position
            LIMIT 100";
        cmd.Parameters.AddWithValue("@val", $"%{value}%");

        sb.AppendLine($"## Value Search: `{value}`");
        sb.AppendLine();

        int count = 0;
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                count++;
                var tblName = reader.GetString(0);
                var logical = reader.IsDBNull(1) ? "" : $" ({reader.GetString(1)})";
                var colName = reader.GetString(2);
                var sqlType = reader.GetString(3);
                var dc = reader.GetInt32(4);

                sb.AppendLine($"### `{tblName}`.`{colName}`{logical}");
                sb.AppendLine($"Type: {sqlType} | Distinct: {dc}");

                if (!reader.IsDBNull(5))
                {
                    try
                    {
                        var arr = System.Text.Json.JsonSerializer.Deserialize<string[]>(reader.GetString(5));
                        if (arr != null)
                        {
                            var matching = arr.Where(v => v.Contains(value, StringComparison.OrdinalIgnoreCase)).Take(10);
                            sb.AppendLine($"Matching values: `{string.Join("`, `", matching)}`");
                        }
                    }
                    catch { }
                }
                sb.AppendLine();
            }
        }

        if (count == 0)
            sb.AppendLine($"No columns with sampled value matching '{value}'.");
        else
            sb.AppendLine($"**{count} column(s) found containing '{value}'**");

        return sb.ToString();
    }
}
