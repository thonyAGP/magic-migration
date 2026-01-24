using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Queries;

/// <summary>
/// Full-text search service using FTS5
/// </summary>
public class SearchService
{
    private readonly KnowledgeDb _db;

    public SearchService(KnowledgeDb db)
    {
        _db = db;
    }

    /// <summary>
    /// Search programs by name
    /// </summary>
    public List<ProgramSearchResult> SearchPrograms(string query, int limit = 20)
    {
        var results = new List<ProgramSearchResult>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                p.id,
                proj.name as project_name,
                p.ide_position,
                p.name,
                p.public_name,
                bm25(programs_fts) as score
            FROM programs_fts
            JOIN programs p ON programs_fts.rowid = p.id
            JOIN projects proj ON p.project_id = proj.id
            WHERE programs_fts MATCH @query
            ORDER BY score
            LIMIT @limit";

        cmd.Parameters.AddWithValue("@query", EscapeFtsQuery(query));
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new ProgramSearchResult
            {
                ProgramId = reader.GetInt64(0),
                ProjectName = reader.GetString(1),
                IdePosition = reader.GetInt32(2),
                Name = reader.GetString(3),
                PublicName = reader.IsDBNull(4) ? null : reader.GetString(4),
                Score = Math.Abs(reader.GetDouble(5))
            });
        }

        return results;
    }

    /// <summary>
    /// Search expressions by content
    /// </summary>
    public List<ExpressionSearchResult> SearchExpressions(string query, int limit = 50)
    {
        var results = new List<ExpressionSearchResult>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                e.id,
                e.program_id,
                proj.name as project_name,
                p.name as program_name,
                p.ide_position as program_ide,
                e.ide_position as expr_ide,
                e.content,
                e.comment,
                bm25(expressions_fts) as score
            FROM expressions_fts
            JOIN expressions e ON expressions_fts.rowid = e.id
            JOIN programs p ON e.program_id = p.id
            JOIN projects proj ON p.project_id = proj.id
            WHERE expressions_fts MATCH @query
            ORDER BY score
            LIMIT @limit";

        cmd.Parameters.AddWithValue("@query", EscapeFtsQuery(query));
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new ExpressionSearchResult
            {
                ExpressionId = reader.GetInt64(0),
                ProgramId = reader.GetInt64(1),
                ProjectName = reader.GetString(2),
                ProgramName = reader.GetString(3),
                ProgramIdePosition = reader.GetInt32(4),
                ExpressionIdePosition = reader.GetInt32(5),
                Content = reader.GetString(6),
                Comment = reader.IsDBNull(7) ? null : reader.GetString(7),
                Score = Math.Abs(reader.GetDouble(8))
            });
        }

        return results;
    }

    /// <summary>
    /// Search columns by name
    /// </summary>
    public List<ColumnSearchResult> SearchColumns(string query, int limit = 50)
    {
        var results = new List<ColumnSearchResult>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                c.id,
                proj.name as project_name,
                p.ide_position as program_ide,
                p.name as program_name,
                t.ide_position as task_ide,
                c.variable,
                c.name,
                c.data_type,
                c.definition,
                bm25(columns_fts) as score
            FROM columns_fts
            JOIN dataview_columns c ON columns_fts.rowid = c.id
            JOIN tasks t ON c.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects proj ON p.project_id = proj.id
            WHERE columns_fts MATCH @query
            ORDER BY score
            LIMIT @limit";

        cmd.Parameters.AddWithValue("@query", EscapeFtsQuery(query));
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new ColumnSearchResult
            {
                ColumnId = reader.GetInt64(0),
                ProjectName = reader.GetString(1),
                ProgramIdePosition = reader.GetInt32(2),
                ProgramName = reader.GetString(3),
                TaskIdePosition = reader.GetString(4),
                Variable = reader.GetString(5),
                Name = reader.GetString(6),
                DataType = reader.GetString(7),
                Definition = reader.GetString(8),
                Score = Math.Abs(reader.GetDouble(9))
            });
        }

        return results;
    }

    /// <summary>
    /// Global search across programs, expressions, and columns
    /// </summary>
    public GlobalSearchResult SearchAll(string query, int limitPerType = 10)
    {
        return new GlobalSearchResult
        {
            Programs = SearchPrograms(query, limitPerType),
            Expressions = SearchExpressions(query, limitPerType),
            Columns = SearchColumns(query, limitPerType)
        };
    }

    /// <summary>
    /// Find program by project and IDE position
    /// </summary>
    public DbProgram? FindProgramByIde(string projectName, int idePosition)
    {
        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT p.*
            FROM programs p
            JOIN projects proj ON p.project_id = proj.id
            WHERE proj.name = @project AND p.ide_position = @ide";

        cmd.Parameters.AddWithValue("@project", projectName);
        cmd.Parameters.AddWithValue("@ide", idePosition);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return new DbProgram
        {
            Id = reader.GetInt64(0),
            ProjectId = reader.GetInt64(1),
            XmlId = reader.GetInt32(2),
            IdePosition = reader.GetInt32(3),
            Name = reader.GetString(4),
            PublicName = reader.IsDBNull(5) ? null : reader.GetString(5),
            FilePath = reader.GetString(6),
            TaskCount = reader.GetInt32(7),
            ExpressionCount = reader.GetInt32(8),
            IndexedAt = DateTime.Parse(reader.GetString(9))
        };
    }

    private static string EscapeFtsQuery(string query)
    {
        // Escape special FTS5 characters and wrap in quotes for phrase search
        if (query.Contains('"') || query.Contains('*') || query.Contains('-'))
        {
            // Complex query - let FTS5 handle it
            return query;
        }

        // Simple query - escape and use prefix matching
        var escaped = query.Replace("\"", "\"\"");
        return $"\"{escaped}\"*";
    }
}

/// <summary>
/// Column search result
/// </summary>
public record ColumnSearchResult
{
    public long ColumnId { get; init; }
    public required string ProjectName { get; init; }
    public int ProgramIdePosition { get; init; }
    public required string ProgramName { get; init; }
    public required string TaskIdePosition { get; init; }
    public required string Variable { get; init; }
    public required string Name { get; init; }
    public required string DataType { get; init; }
    public required string Definition { get; init; }
    public double Score { get; init; }
}

/// <summary>
/// Global search result
/// </summary>
public record GlobalSearchResult
{
    public List<ProgramSearchResult> Programs { get; init; } = new();
    public List<ExpressionSearchResult> Expressions { get; init; } = new();
    public List<ColumnSearchResult> Columns { get; init; } = new();

    public int TotalCount => Programs.Count + Expressions.Count + Columns.Count;
}
