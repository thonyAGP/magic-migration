using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Queries;

/// <summary>
/// Service for analyzing program call graphs
/// </summary>
public class CallGraphService
{
    private readonly KnowledgeDb _db;

    public CallGraphService(KnowledgeDb db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all programs that call the specified program (callers)
    /// </summary>
    public List<CallGraphNode> GetCallers(string projectName, int idePosition, int maxDepth = 3)
    {
        var results = new List<CallGraphNode>();
        var visited = new HashSet<long>();

        // Find the target program
        var targetProgram = FindProgram(projectName, idePosition);
        if (targetProgram == null) return results;

        GetCallersRecursive(targetProgram.Id, 1, maxDepth, visited, results);

        return results.OrderBy(r => r.Depth)
            .ThenBy(r => r.ProjectName)
            .ThenBy(r => r.ProgramIdePosition)
            .ToList();
    }

    private void GetCallersRecursive(long programId, int currentDepth, int maxDepth, HashSet<long> visited, List<CallGraphNode> results)
    {
        if (currentDepth > maxDepth || visited.Contains(programId)) return;
        visited.Add(programId);

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT
                proj.name as project_name,
                p.ide_position,
                p.name as program_name,
                t.ide_position as task_ide,
                pc.caller_line_number,
                p.id as program_id
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects proj ON p.project_id = proj.id
            WHERE pc.callee_program_id = @programId";

        cmd.Parameters.AddWithValue("@programId", programId);

        var callers = new List<(string ProjectName, int IdePosition, string ProgramName, string TaskIde, int LineNumber, long ProgramId)>();

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                callers.Add((
                    reader.GetString(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetInt32(4),
                    reader.GetInt64(5)
                ));
            }
        }

        foreach (var caller in callers)
        {
            results.Add(new CallGraphNode
            {
                ProjectName = caller.ProjectName,
                ProgramIdePosition = caller.IdePosition,
                ProgramName = caller.ProgramName,
                TaskIdePosition = caller.TaskIde,
                LineNumber = caller.LineNumber,
                Depth = currentDepth
            });

            // Recurse for deeper levels
            GetCallersRecursive(caller.ProgramId, currentDepth + 1, maxDepth, visited, results);
        }
    }

    /// <summary>
    /// Get all programs called by the specified program (callees)
    /// </summary>
    public List<CallGraphNode> GetCallees(string projectName, int idePosition, int maxDepth = 3)
    {
        var results = new List<CallGraphNode>();
        var visited = new HashSet<long>();

        // Find the source program
        var sourceProgram = FindProgram(projectName, idePosition);
        if (sourceProgram == null) return results;

        GetCalleesRecursive(sourceProgram.Id, 1, maxDepth, visited, results);

        return results.OrderBy(r => r.Depth)
            .ThenBy(r => r.ProjectName)
            .ThenBy(r => r.ProgramIdePosition)
            .ToList();
    }

    private void GetCalleesRecursive(long programId, int currentDepth, int maxDepth, HashSet<long> visited, List<CallGraphNode> results)
    {
        if (currentDepth > maxDepth || visited.Contains(programId)) return;
        visited.Add(programId);

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT
                proj.name as project_name,
                p2.ide_position,
                p2.name as program_name,
                t.ide_position as task_ide,
                pc.caller_line_number,
                p2.id as program_id
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs p1 ON t.program_id = p1.id
            JOIN programs p2 ON pc.callee_program_id = p2.id
            JOIN projects proj ON p2.project_id = proj.id
            WHERE p1.id = @programId";

        cmd.Parameters.AddWithValue("@programId", programId);

        var callees = new List<(string ProjectName, int IdePosition, string ProgramName, string TaskIde, int LineNumber, long ProgramId)>();

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                callees.Add((
                    reader.GetString(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetInt32(4),
                    reader.GetInt64(5)
                ));
            }
        }

        foreach (var callee in callees)
        {
            results.Add(new CallGraphNode
            {
                ProjectName = callee.ProjectName,
                ProgramIdePosition = callee.IdePosition,
                ProgramName = callee.ProgramName,
                TaskIdePosition = callee.TaskIde,
                LineNumber = callee.LineNumber,
                Depth = currentDepth
            });

            // Recurse for deeper levels
            GetCalleesRecursive(callee.ProgramId, currentDepth + 1, maxDepth, visited, results);
        }
    }

    /// <summary>
    /// Get the full call graph for a program (both callers and callees)
    /// </summary>
    public CallGraph GetCallGraph(string projectName, int idePosition, int maxDepth = 2)
    {
        return new CallGraph
        {
            ProjectName = projectName,
            IdePosition = idePosition,
            Callers = GetCallers(projectName, idePosition, maxDepth),
            Callees = GetCallees(projectName, idePosition, maxDepth)
        };
    }

    /// <summary>
    /// Get call statistics for a program
    /// </summary>
    public CallStats GetCallStats(string projectName, int idePosition)
    {
        var program = FindProgram(projectName, idePosition);
        if (program == null)
        {
            return new CallStats();
        }

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                (SELECT COUNT(*) FROM program_calls WHERE callee_program_id = @pid) as caller_count,
                (SELECT COUNT(DISTINCT callee_program_id) FROM program_calls pc
                 JOIN tasks t ON pc.caller_task_id = t.id
                 WHERE t.program_id = @pid) as callee_count";

        cmd.Parameters.AddWithValue("@pid", program.Id);

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new CallStats
            {
                CallerCount = reader.GetInt32(0),
                CalleeCount = reader.GetInt32(1)
            };
        }

        return new CallStats();
    }

    private DbProgram? FindProgram(string projectName, int idePosition)
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
}

/// <summary>
/// Full call graph for a program
/// </summary>
public record CallGraph
{
    public required string ProjectName { get; init; }
    public int IdePosition { get; init; }
    public List<CallGraphNode> Callers { get; init; } = new();
    public List<CallGraphNode> Callees { get; init; } = new();
}

/// <summary>
/// Call statistics for a program
/// </summary>
public record CallStats
{
    public int CallerCount { get; init; }
    public int CalleeCount { get; init; }
}
