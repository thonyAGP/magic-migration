using MagicKnowledgeBase.Database;

namespace MagicKnowledgeBase.Indexing;

/// <summary>
/// Resolves cross-references between programs after initial indexing
/// </summary>
public class RelationshipResolver
{
    private readonly KnowledgeDb _db;

    public RelationshipResolver(KnowledgeDb db)
    {
        _db = db;
    }

    /// <summary>
    /// Resolve program call references (set callee_program_id based on project name and xml_id)
    /// </summary>
    public void ResolveProgramCalls()
    {
        // Update program_calls with resolved callee_program_id
        _db.ExecuteNonQuery(@"
            UPDATE program_calls
            SET callee_program_id = (
                SELECT p.id
                FROM programs p
                JOIN projects proj ON p.project_id = proj.id
                WHERE proj.name = program_calls.callee_project_name
                  AND p.xml_id = program_calls.callee_xml_id
            )
            WHERE callee_program_id IS NULL
              AND callee_project_name IS NOT NULL");
    }

    /// <summary>
    /// Resolve subtask call references within programs
    /// </summary>
    public void ResolveSubtaskCalls()
    {
        _db.ExecuteNonQuery(@"
            UPDATE subtask_calls
            SET callee_task_id = (
                SELECT t2.id
                FROM tasks t1
                JOIN tasks t2 ON t1.program_id = t2.program_id
                WHERE t1.id = subtask_calls.caller_task_id
                  AND t2.isn2 = subtask_calls.callee_isn2
            )
            WHERE callee_task_id IS NULL");
    }

    /// <summary>
    /// Update table names in table_usage based on tables table
    /// </summary>
    public void ResolveTableNames()
    {
        _db.ExecuteNonQuery(@"
            UPDATE table_usage
            SET table_name = (
                SELECT logical_name
                FROM tables
                WHERE tables.xml_id = table_usage.table_id
            )
            WHERE table_name IS NULL");
    }

    /// <summary>
    /// Run all resolution steps
    /// </summary>
    public void ResolveAll()
    {
        ResolveProgramCalls();
        ResolveSubtaskCalls();
        ResolveTableNames();
    }
}
