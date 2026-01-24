using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Queries;

/// <summary>
/// Extracts data from Knowledge Base for migration specification generation.
/// Provides queries for inventories, dependencies, and complexity analysis.
/// </summary>
public class MigrationExtractor
{
    private readonly KnowledgeDb _db;

    public MigrationExtractor(KnowledgeDb db)
    {
        _db = db;
    }

    /// <summary>
    /// Get program inventory for a project with complexity scores.
    /// </summary>
    public List<ProgramInventory> GetProgramInventory(string projectName)
    {
        var results = new List<ProgramInventory>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                p.ide_position,
                p.name,
                p.public_name,
                p.task_count,
                p.expression_count,
                (p.task_count * p.expression_count) as complexity_score
            FROM programs p
            JOIN projects proj ON p.project_id = proj.id
            WHERE proj.name = @project
            ORDER BY complexity_score DESC";

        cmd.Parameters.AddWithValue("@project", projectName);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new ProgramInventory
            {
                IdePosition = reader.GetInt32(0),
                Name = reader.GetString(1),
                PublicName = reader.IsDBNull(2) ? null : reader.GetString(2),
                TaskCount = reader.GetInt32(3),
                ExpressionCount = reader.GetInt32(4),
                ComplexityScore = reader.GetInt32(5)
            });
        }

        return results;
    }

    /// <summary>
    /// Get tables used by a project.
    /// </summary>
    public List<TableUsageSummary> GetTableInventory(string projectName)
    {
        var results = new List<TableUsageSummary>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT
                tu.table_id,
                tu.table_name,
                tu.usage_type,
                COUNT(DISTINCT t.program_id) as used_by_programs
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects proj ON p.project_id = proj.id
            WHERE proj.name = @project
            GROUP BY tu.table_id, tu.table_name, tu.usage_type
            ORDER BY used_by_programs DESC, tu.table_name";

        cmd.Parameters.AddWithValue("@project", projectName);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new TableUsageSummary
            {
                TableId = reader.GetInt32(0),
                TableName = reader.IsDBNull(1) ? $"Table_{reader.GetInt32(0)}" : reader.GetString(1),
                UsageType = reader.GetString(2),
                UsedByPrograms = reader.GetInt32(3)
            });
        }

        return results;
    }

    /// <summary>
    /// Get cross-project dependencies (incoming and outgoing calls).
    /// </summary>
    public ProjectDependencies GetCrossProjectDependencies(string projectName)
    {
        var deps = new ProjectDependencies
        {
            ProjectName = projectName,
            IncomingCalls = new List<CrossProjectCall>(),
            OutgoingCalls = new List<CrossProjectCall>()
        };

        // Outgoing calls (this project calls others)
        using var cmdOut = _db.Connection.CreateCommand();
        cmdOut.CommandText = @"
            SELECT DISTINCT
                caller_proj.name as caller_project,
                caller_p.ide_position as caller_ide,
                caller_p.name as caller_name,
                pc.callee_project_name,
                pc.callee_xml_id
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs caller_p ON t.program_id = caller_p.id
            JOIN projects caller_proj ON caller_p.project_id = caller_proj.id
            WHERE caller_proj.name = @project
              AND pc.callee_project_name IS NOT NULL
              AND pc.callee_project_name != @project
            ORDER BY pc.callee_project_name, pc.callee_xml_id";

        cmdOut.Parameters.AddWithValue("@project", projectName);

        using var readerOut = cmdOut.ExecuteReader();
        while (readerOut.Read())
        {
            deps.OutgoingCalls.Add(new CrossProjectCall
            {
                CallerProject = readerOut.GetString(0),
                CallerIde = readerOut.GetInt32(1),
                CallerName = readerOut.GetString(2),
                CalleeProject = readerOut.IsDBNull(3) ? "UNKNOWN" : readerOut.GetString(3),
                CalleeXmlId = readerOut.GetInt32(4)
            });
        }

        // Incoming calls (others call this project)
        using var cmdIn = _db.Connection.CreateCommand();
        cmdIn.CommandText = @"
            SELECT DISTINCT
                caller_proj.name as caller_project,
                caller_p.ide_position as caller_ide,
                caller_p.name as caller_name,
                callee_p.ide_position as callee_ide,
                callee_p.name as callee_name
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs caller_p ON t.program_id = caller_p.id
            JOIN projects caller_proj ON caller_p.project_id = caller_proj.id
            JOIN programs callee_p ON pc.callee_program_id = callee_p.id
            JOIN projects callee_proj ON callee_p.project_id = callee_proj.id
            WHERE callee_proj.name = @project
              AND caller_proj.name != @project
            ORDER BY caller_proj.name, caller_p.ide_position";

        cmdIn.Parameters.AddWithValue("@project", projectName);

        using var readerIn = cmdIn.ExecuteReader();
        while (readerIn.Read())
        {
            deps.IncomingCalls.Add(new CrossProjectCall
            {
                CallerProject = readerIn.GetString(0),
                CallerIde = readerIn.GetInt32(1),
                CallerName = readerIn.GetString(2),
                CalleeProject = projectName,
                CalleeIde = readerIn.GetInt32(3),
                CalleeName = readerIn.GetString(4)
            });
        }

        return deps;
    }

    /// <summary>
    /// Get UI screens (forms) for a project.
    /// </summary>
    public List<FormInfo> GetFormInventory(string projectName)
    {
        var results = new List<FormInfo>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                p.ide_position as program_ide,
                p.name as program_name,
                tf.form_name,
                tf.window_type,
                tf.width,
                tf.height
            FROM task_forms tf
            JOIN tasks t ON tf.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects proj ON p.project_id = proj.id
            WHERE proj.name = @project
              AND tf.form_name IS NOT NULL
            ORDER BY p.ide_position, tf.form_name";

        cmd.Parameters.AddWithValue("@project", projectName);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new FormInfo
            {
                ProgramIde = reader.GetInt32(0),
                ProgramName = reader.GetString(1),
                FormName = reader.IsDBNull(2) ? null : reader.GetString(2),
                WindowType = reader.IsDBNull(3) ? null : reader.GetInt32(3),
                Width = reader.IsDBNull(4) ? null : reader.GetInt32(4),
                Height = reader.IsDBNull(5) ? null : reader.GetInt32(5)
            });
        }

        return results;
    }

    /// <summary>
    /// Get summary statistics for a project.
    /// </summary>
    public ProjectStats? GetProjectStats(string projectName)
    {
        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                proj.program_count,
                proj.main_offset,
                SUM(p.task_count) as total_tasks,
                SUM(p.expression_count) as total_expressions,
                AVG(p.task_count * p.expression_count) as avg_complexity
            FROM projects proj
            LEFT JOIN programs p ON proj.id = p.project_id
            WHERE proj.name = @project
            GROUP BY proj.id";

        cmd.Parameters.AddWithValue("@project", projectName);

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new ProjectStats
            {
                ProjectName = projectName,
                ProgramCount = reader.GetInt32(0),
                MainOffset = reader.GetInt32(1),
                TotalTasks = reader.IsDBNull(2) ? 0 : reader.GetInt32(2),
                TotalExpressions = reader.IsDBNull(3) ? 0 : reader.GetInt32(3),
                AverageComplexity = reader.IsDBNull(4) ? 0 : reader.GetDouble(4)
            };
        }

        return null;
    }

    /// <summary>
    /// Get all available projects.
    /// </summary>
    public List<string> GetAvailableProjects()
    {
        var projects = new List<string>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = "SELECT name FROM projects ORDER BY name";

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            projects.Add(reader.GetString(0));
        }

        return projects;
    }
}

// ============================================================================
// MODELS
// ============================================================================

public record ProgramInventory
{
    public int IdePosition { get; init; }
    public required string Name { get; init; }
    public string? PublicName { get; init; }
    public int TaskCount { get; init; }
    public int ExpressionCount { get; init; }
    public int ComplexityScore { get; init; }
}

public record TableUsageSummary
{
    public int TableId { get; init; }
    public required string TableName { get; init; }
    public required string UsageType { get; init; }
    public int UsedByPrograms { get; init; }
}

public class ProjectDependencies
{
    public required string ProjectName { get; init; }
    public List<CrossProjectCall> IncomingCalls { get; set; } = new();
    public List<CrossProjectCall> OutgoingCalls { get; set; } = new();
}

public record CrossProjectCall
{
    public required string CallerProject { get; init; }
    public int CallerIde { get; init; }
    public required string CallerName { get; init; }
    public required string CalleeProject { get; init; }
    public int CalleeXmlId { get; init; }
    public int? CalleeIde { get; init; }
    public string? CalleeName { get; init; }
}

public record FormInfo
{
    public int ProgramIde { get; init; }
    public required string ProgramName { get; init; }
    public string? FormName { get; init; }
    public int? WindowType { get; init; }
    public int? Width { get; init; }
    public int? Height { get; init; }
}

public record ProjectStats
{
    public required string ProjectName { get; init; }
    public int ProgramCount { get; init; }
    public int MainOffset { get; init; }
    public int TotalTasks { get; init; }
    public int TotalExpressions { get; init; }
    public double AverageComplexity { get; init; }
}
