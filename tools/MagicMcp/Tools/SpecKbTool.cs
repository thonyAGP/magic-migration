using System.ComponentModel;
using Microsoft.Data.Sqlite;
using System.Text.Json;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class SpecKbTool
{
    private static string GetKbPath() =>
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".magic-kb", "knowledge.db");

    [McpServerTool(Name = "magic_kb_spec_search")]
    [Description(@"Search indexed specs in Knowledge Base using FTS5 full-text search.
Much faster than file-based search for large queries.

Examples:
- magic_kb_spec_search vente
- magic_kb_spec_search table:849
- magic_kb_spec_search type:Online folder:Ventes")]
    public static string KbSpecSearch(
        [Description("Search query (supports: table:ID, type:Online|Batch, folder:Name, or free text)")] string query,
        [Description("Max results (default 20)")] int limit = 20)
    {
        var kbPath = GetKbPath();
        if (!File.Exists(kbPath))
            return "ERROR: Knowledge Base not found. Run KbIndexRunner to create it.";

        try
        {
            using var conn = new SqliteConnection($"Data Source={kbPath};");
            conn.Open();

            // Parse query for special filters
            var tableFilter = ExtractFilter(query, "table:");
            var typeFilter = ExtractFilter(query, "type:");
            var folderFilter = ExtractFilter(query, "folder:");
            var textQuery = RemoveFilters(query);

            var sql = new System.Text.StringBuilder();
            sql.Append(@"
                SELECT ps.project, ps.ide_position, ps.title, ps.program_type, ps.folder,
                       ps.table_count, ps.write_table_count, ps.expression_count
                FROM program_specs ps
                WHERE 1=1");

            var parameters = new Dictionary<string, object>();

            // Table filter - join with spec_tables
            if (!string.IsNullOrEmpty(tableFilter))
            {
                if (int.TryParse(tableFilter, out var tableId))
                {
                    sql.Append(@"
                        AND ps.id IN (SELECT spec_id FROM spec_tables WHERE table_id = @tableId)");
                    parameters["tableId"] = tableId;
                }
                else
                {
                    sql.Append(@"
                        AND ps.id IN (SELECT spec_id FROM spec_tables
                                      WHERE table_physical_name LIKE @tableName
                                         OR table_logical_name LIKE @tableName)");
                    parameters["tableName"] = $"%{tableFilter}%";
                }
            }

            // Type filter
            if (!string.IsNullOrEmpty(typeFilter))
            {
                sql.Append(" AND ps.program_type = @type COLLATE NOCASE");
                parameters["type"] = typeFilter;
            }

            // Folder filter
            if (!string.IsNullOrEmpty(folderFilter))
            {
                sql.Append(" AND ps.folder LIKE @folder COLLATE NOCASE");
                parameters["folder"] = $"%{folderFilter}%";
            }

            // Full-text search
            if (!string.IsNullOrEmpty(textQuery))
            {
                sql.Append(@"
                    AND ps.id IN (SELECT rowid FROM specs_fts WHERE specs_fts MATCH @text)");
                parameters["text"] = textQuery + "*";
            }

            sql.Append(" ORDER BY ps.write_table_count DESC, ps.project, ps.ide_position");
            sql.Append($" LIMIT {limit}");

            using var cmd = new SqliteCommand(sql.ToString(), conn);
            foreach (var p in parameters)
                cmd.Parameters.AddWithValue($"@{p.Key}", p.Value);

            using var reader = cmd.ExecuteReader();
            var results = new List<(string Project, int Ide, string Title, string Type, string Folder, int Tables, int Writes, int Expr)>();

            while (reader.Read())
            {
                results.Add((
                    reader.GetString(0),
                    reader.GetInt32(1),
                    reader.IsDBNull(2) ? "-" : reader.GetString(2),
                    reader.IsDBNull(3) ? "-" : reader.GetString(3),
                    reader.IsDBNull(4) ? "-" : reader.GetString(4),
                    reader.GetInt32(5),
                    reader.GetInt32(6),
                    reader.GetInt32(7)
                ));
            }

            if (results.Count == 0)
                return $"No specs found matching: {query}";

            var sb = new System.Text.StringBuilder();
            sb.AppendLine($"## Found {results.Count} specs matching: `{query}`");
            sb.AppendLine();
            sb.AppendLine("| Program | Title | Type | Folder | Tables | Write | Expr |");
            sb.AppendLine("|---------|-------|------|--------|--------|-------|------|");

            foreach (var r in results)
            {
                sb.AppendLine($"| {r.Project} IDE {r.Ide} | {Truncate(r.Title, 30)} | {r.Type} | {r.Folder} | {r.Tables} | {r.Writes} | {r.Expr} |");
            }

            return sb.ToString();
        }
        catch (Exception ex)
        {
            return $"ERROR: {ex.Message}";
        }
    }

    [McpServerTool(Name = "magic_kb_table_impact")]
    [Description(@"Find all programs that use a specific table ID. Categorizes by access mode (R/W).
Use BEFORE modifying table schema or data logic to prevent regressions.

Returns:
- CRITICAL: Programs that WRITE to the table (must test before changes)
- HIGH: Programs that READ from the table (verify data compatibility)")]
    public static string KbTableImpact(
        [Description("Table IDE number (e.g., 849)")] int tableId)
    {
        var kbPath = GetKbPath();
        if (!File.Exists(kbPath))
            return "ERROR: Knowledge Base not found.";

        try
        {
            using var conn = new SqliteConnection($"Data Source={kbPath};");
            conn.Open();

            // Get table info if available
            string? tableName = null;
            using (var cmd = new SqliteCommand(@"
                SELECT DISTINCT table_physical_name FROM spec_tables WHERE table_id = @tableId LIMIT 1", conn))
            {
                cmd.Parameters.AddWithValue("@tableId", tableId);
                tableName = cmd.ExecuteScalar() as string;
            }

            // Get writers
            var writers = new List<(string Project, int Ide, string Title, int Usage)>();
            using (var cmd = new SqliteCommand(@"
                SELECT ps.project, ps.ide_position, ps.title, st.usage_count
                FROM program_specs ps
                JOIN spec_tables st ON ps.id = st.spec_id
                WHERE st.table_id = @tableId AND st.access_mode = 'W'
                ORDER BY st.usage_count DESC", conn))
            {
                cmd.Parameters.AddWithValue("@tableId", tableId);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    writers.Add((
                        reader.GetString(0),
                        reader.GetInt32(1),
                        reader.IsDBNull(2) ? "-" : reader.GetString(2),
                        reader.GetInt32(3)
                    ));
                }
            }

            // Get readers
            var readers = new List<(string Project, int Ide, string Title, int Usage)>();
            using (var cmd = new SqliteCommand(@"
                SELECT ps.project, ps.ide_position, ps.title, st.usage_count
                FROM program_specs ps
                JOIN spec_tables st ON ps.id = st.spec_id
                WHERE st.table_id = @tableId AND st.access_mode = 'R'
                ORDER BY st.usage_count DESC", conn))
            {
                cmd.Parameters.AddWithValue("@tableId", tableId);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    readers.Add((
                        reader.GetString(0),
                        reader.GetInt32(1),
                        reader.IsDBNull(2) ? "-" : reader.GetString(2),
                        reader.GetInt32(3)
                    ));
                }
            }

            if (writers.Count == 0 && readers.Count == 0)
                return $"No indexed specs found using table #{tableId}. Run Sync-SpecsToKb.ps1 to index specs.";

            var sb = new System.Text.StringBuilder();
            sb.AppendLine($"# Impact Analysis: Table #{tableId}" + (tableName != null ? $" ({tableName})" : ""));
            sb.AppendLine();

            // Severity
            var severity = writers.Count switch
            {
                0 => "LOW",
                1 => "MEDIUM",
                <= 3 => "HIGH",
                _ => "**CRITICAL**"
            };

            sb.AppendLine($"## Risk Level: {severity}");
            sb.AppendLine($"- Writers: {writers.Count} programs");
            sb.AppendLine($"- Readers: {readers.Count} programs");
            sb.AppendLine();

            // Writers
            if (writers.Count > 0)
            {
                sb.AppendLine("## Writers (CRITICAL - test before changes)");
                sb.AppendLine();
                sb.AppendLine("| Program | Title | Usage |");
                sb.AppendLine("|---------|-------|-------|");
                foreach (var w in writers.Take(15))
                    sb.AppendLine($"| {w.Project} IDE {w.Ide} | {Truncate(w.Title, 35)} | {w.Usage}x |");
                if (writers.Count > 15)
                    sb.AppendLine($"_... and {writers.Count - 15} more_");
                sb.AppendLine();
            }

            // Readers
            if (readers.Count > 0)
            {
                sb.AppendLine("## Readers (verify data compatibility)");
                sb.AppendLine();
                sb.AppendLine("| Program | Title | Usage |");
                sb.AppendLine("|---------|-------|-------|");
                foreach (var r in readers.Take(15))
                    sb.AppendLine($"| {r.Project} IDE {r.Ide} | {Truncate(r.Title, 35)} | {r.Usage}x |");
                if (readers.Count > 15)
                    sb.AppendLine($"_... and {readers.Count - 15} more_");
            }

            return sb.ToString();
        }
        catch (Exception ex)
        {
            return $"ERROR: {ex.Message}";
        }
    }

    [McpServerTool(Name = "magic_kb_spec_stats")]
    [Description("Get statistics about indexed specs in Knowledge Base")]
    public static string KbSpecStats()
    {
        var kbPath = GetKbPath();
        if (!File.Exists(kbPath))
            return "ERROR: Knowledge Base not found.";

        try
        {
            using var conn = new SqliteConnection($"Data Source={kbPath};");
            conn.Open();

            var sb = new System.Text.StringBuilder();
            sb.AppendLine("# Spec Index Statistics");
            sb.AppendLine();

            // Total specs
            using (var cmd = new SqliteCommand("SELECT COUNT(*) FROM program_specs", conn))
                sb.AppendLine($"- **Total specs indexed**: {cmd.ExecuteScalar()}");

            // By project
            sb.AppendLine();
            sb.AppendLine("## By Project");
            using (var cmd = new SqliteCommand(@"
                SELECT project, COUNT(*), SUM(write_table_count), SUM(expression_count)
                FROM program_specs GROUP BY project ORDER BY COUNT(*) DESC", conn))
            {
                using var reader = cmd.ExecuteReader();
                sb.AppendLine("| Project | Specs | Write Tables | Expressions |");
                sb.AppendLine("|---------|-------|--------------|-------------|");
                while (reader.Read())
                {
                    sb.AppendLine($"| {reader.GetString(0)} | {reader.GetInt32(1)} | {reader.GetInt32(2)} | {reader.GetInt32(3)} |");
                }
            }

            // By type
            sb.AppendLine();
            sb.AppendLine("## By Type");
            using (var cmd = new SqliteCommand(@"
                SELECT COALESCE(program_type, 'Unknown'), COUNT(*)
                FROM program_specs GROUP BY program_type ORDER BY COUNT(*) DESC", conn))
            {
                using var reader = cmd.ExecuteReader();
                sb.AppendLine("| Type | Count |");
                sb.AppendLine("|------|-------|");
                while (reader.Read())
                {
                    sb.AppendLine($"| {reader.GetString(0)} | {reader.GetInt32(1)} |");
                }
            }

            // Top tables by usage
            sb.AppendLine();
            sb.AppendLine("## Most Used Tables (Write)");
            using (var cmd = new SqliteCommand(@"
                SELECT table_id, table_physical_name, COUNT(*) as spec_count, SUM(usage_count) as total_usage
                FROM spec_tables
                WHERE access_mode = 'W'
                GROUP BY table_id
                ORDER BY spec_count DESC
                LIMIT 10", conn))
            {
                using var reader = cmd.ExecuteReader();
                sb.AppendLine("| Table | Name | Specs | Total Usage |");
                sb.AppendLine("|-------|------|-------|-------------|");
                while (reader.Read())
                {
                    sb.AppendLine($"| #{reader.GetInt32(0)} | {reader.GetString(1)} | {reader.GetInt32(2)} | {reader.GetInt32(3)}x |");
                }
            }

            return sb.ToString();
        }
        catch (Exception ex)
        {
            return $"ERROR: {ex.Message}";
        }
    }

    private static string? ExtractFilter(string query, string prefix)
    {
        var match = System.Text.RegularExpressions.Regex.Match(query, $@"{prefix}(\S+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value : null;
    }

    private static string RemoveFilters(string query)
    {
        var result = System.Text.RegularExpressions.Regex.Replace(query, @"(table:|type:|folder:)\S+", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        return result.Trim();
    }

    private static string Truncate(string text, int maxLength)
    {
        if (string.IsNullOrEmpty(text))
            return "-";
        return text.Length <= maxLength ? text : text.Substring(0, maxLength - 3) + "...";
    }
}
