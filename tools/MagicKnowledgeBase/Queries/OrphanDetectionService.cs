using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Queries;

/// <summary>
/// Service for detecting orphan programs in Magic projects
/// </summary>
public class OrphanDetectionService
{
    private readonly KnowledgeDb _db;

    /// <summary>
    /// Known ECF shared program IDE positions per project
    /// </summary>
    private static readonly Dictionary<string, HashSet<int>> EcfPrograms = new()
    {
        ["ADH"] = new HashSet<int>
        {
            // ADH.ecf - Sessions_Reprises component (30 programs)
            27, 28,             // Separation, Fusion
            53, 54,             // EXTRAIT_EASY_CHECKOUT, FACTURES_CHECK_OUT
            64, 65,             // SOLDE_EASY_CHECK_OUT, EDITION_EASY_CHECK_OUT
            69, 70, 71, 72, 73, 76,  // EXTRAIT_* family
            84,                 // CARACT_INTERDIT
            97,                 // Saisie_facture_tva
            111,                // GARANTIE
            121,                // Gestion_Caisse_142
            149,                // CALC_STOCK_PRODUIT
            152,                // RECUP_CLASSE_MOP
            178, 180, 181,      // GET_PRINTER, SET_LIST_NUMBER, RAZ_PRINTER
            185,                // CHAINED_LIST_DEFAULT
            192,                // SOLDE_COMPTE
            208, 210,           // OPEN_PHONE_LINE, CLOSE_PHONE_LINE
            229,                // PRINT_TICKET
            243                 // DEVERSEMENT
        },
        ["REF"] = new HashSet<int>
        {
            // REF.ecf - shared tables and utilities
            // TODO: Add known REF shared programs
        }
    };

    public OrphanDetectionService(KnowledgeDb db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all orphan programs in a project with detailed status
    /// </summary>
    public List<OrphanAnalysis> GetOrphanPrograms(string projectName, bool includeEcfPrograms = false)
    {
        var results = new List<OrphanAnalysis>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                p.id,
                p.ide_position,
                p.name,
                p.public_name,
                (SELECT COUNT(*) FROM program_calls WHERE callee_program_id = p.id) as caller_count,
                p.task_count
            FROM programs p
            JOIN projects proj ON p.project_id = proj.id
            WHERE proj.name = @project
            ORDER BY p.ide_position";

        cmd.Parameters.AddWithValue("@project", projectName);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var programId = reader.GetInt64(0);
            var idePosition = reader.GetInt32(1);
            var name = reader.GetString(2);
            var publicName = reader.IsDBNull(3) ? null : reader.GetString(3);
            var callerCount = reader.GetInt32(4);
            var taskCount = reader.GetInt32(5);

            // Check if in ECF shared list
            var isInEcf = EcfPrograms.TryGetValue(projectName, out var ecfSet) && ecfSet.Contains(idePosition);

            // Determine status
            OrphanStatus status;
            if (callerCount > 0)
            {
                status = OrphanStatus.Used;
            }
            else if (!string.IsNullOrEmpty(publicName))
            {
                status = OrphanStatus.CallableByName;
            }
            else if (isInEcf)
            {
                status = OrphanStatus.CrossProjectPossible;
            }
            else if (taskCount == 0)
            {
                status = OrphanStatus.EmptyProgram;
            }
            else
            {
                status = OrphanStatus.Orphan;
            }

            // Skip ECF programs unless requested
            if (!includeEcfPrograms && isInEcf && status == OrphanStatus.CrossProjectPossible)
            {
                continue;
            }

            results.Add(new OrphanAnalysis
            {
                ProjectName = projectName,
                ProgramId = programId,
                IdePosition = idePosition,
                Name = name,
                PublicName = publicName,
                CallerCount = callerCount,
                IsInEcf = isInEcf,
                TaskCount = taskCount,
                Status = status
            });
        }

        return results;
    }

    /// <summary>
    /// Get orphan statistics for a project
    /// </summary>
    public OrphanStats GetOrphanStats(string projectName)
    {
        var all = GetOrphanPrograms(projectName, includeEcfPrograms: true);

        return new OrphanStats
        {
            TotalPrograms = all.Count,
            UsedPrograms = all.Count(a => a.Status == OrphanStatus.Used),
            CallableByName = all.Count(a => a.Status == OrphanStatus.CallableByName),
            CrossProjectPossible = all.Count(a => a.Status == OrphanStatus.CrossProjectPossible),
            EmptyPrograms = all.Count(a => a.Status == OrphanStatus.EmptyProgram),
            ConfirmedOrphans = all.Count(a => a.Status == OrphanStatus.Orphan)
        };
    }

    /// <summary>
    /// Get dead code statistics for a program
    /// </summary>
    public DeadCodeStats GetDeadCodeStats(string projectName, int idePosition)
    {
        var program = FindProgram(projectName, idePosition);
        if (program == null)
        {
            return new DeadCodeStats();
        }

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                COUNT(*) as total_lines,
                SUM(CASE WHEN is_disabled = 1 THEN 1 ELSE 0 END) as disabled_lines
            FROM logic_lines ll
            JOIN tasks t ON ll.task_id = t.id
            WHERE t.program_id = @pid";

        cmd.Parameters.AddWithValue("@pid", program.Id);

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            var total = reader.GetInt32(0);
            var disabled = reader.GetInt32(1);
            return new DeadCodeStats
            {
                TotalLogicLines = total,
                DisabledLines = disabled,
                DisabledRatio = total > 0 ? (double)disabled / total : 0
            };
        }

        return new DeadCodeStats();
    }

    /// <summary>
    /// Get all disabled logic lines in a project
    /// </summary>
    public List<DisabledBlock> GetDisabledBlocks(string projectName)
    {
        var results = new List<DisabledBlock>();

        using var cmd = _db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT
                p.ide_position as prog_ide,
                p.name as prog_name,
                t.ide_position as task_ide,
                t.description as task_name,
                ll.line_number,
                ll.handler,
                ll.operation,
                ll.condition_expr
            FROM logic_lines ll
            JOIN tasks t ON ll.task_id = t.id
            JOIN programs p ON t.program_id = p.id
            JOIN projects proj ON p.project_id = proj.id
            WHERE proj.name = @project AND ll.is_disabled = 1
            ORDER BY p.ide_position, t.ide_position, ll.line_number";

        cmd.Parameters.AddWithValue("@project", projectName);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new DisabledBlock
            {
                ProgramIdePosition = reader.GetInt32(0),
                ProgramName = reader.GetString(1),
                TaskIdePosition = reader.GetString(2),
                TaskName = reader.GetString(3),
                LineNumber = reader.GetInt32(4),
                Handler = reader.GetString(5),
                Operation = reader.GetString(6),
                Condition = reader.IsDBNull(7) ? null : reader.GetString(7)
            });
        }

        return results;
    }

    /// <summary>
    /// Get expressions that are never referenced in logic
    /// </summary>
    public List<DeadExpression> GetDeadExpressions(string projectName, int idePosition)
    {
        var program = FindProgram(projectName, idePosition);
        if (program == null)
        {
            return new List<DeadExpression>();
        }

        var results = new List<DeadExpression>();

        // Get all expressions for this program
        using var exprCmd = _db.Connection.CreateCommand();
        exprCmd.CommandText = @"
            SELECT xml_id, ide_position, content, comment
            FROM expressions
            WHERE program_id = @pid";
        exprCmd.Parameters.AddWithValue("@pid", program.Id);

        var allExpressions = new List<(int XmlId, int IdePosition, string Content, string? Comment)>();
        using (var reader = exprCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                allExpressions.Add((
                    reader.GetInt32(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.IsDBNull(3) ? null : reader.GetString(3)
                ));
            }
        }

        // Get all referenced expression IDs from logic lines
        using var refCmd = _db.Connection.CreateCommand();
        refCmd.CommandText = @"
            SELECT DISTINCT ll.condition_expr
            FROM logic_lines ll
            JOIN tasks t ON ll.task_id = t.id
            WHERE t.program_id = @pid AND ll.condition_expr IS NOT NULL";
        refCmd.Parameters.AddWithValue("@pid", program.Id);

        var referencedExprPatterns = new HashSet<string>();
        using (var reader = refCmd.ExecuteReader())
        {
            while (reader.Read())
            {
                referencedExprPatterns.Add(reader.GetString(0));
            }
        }

        // Check each expression for references
        foreach (var (xmlId, idePos, content, comment) in allExpressions)
        {
            // Simple check: is this expression ID referenced anywhere?
            // Expression references look like {N,...} where N is the expression number
            var exprPattern = $"{{{xmlId},";
            var isReferenced = referencedExprPatterns.Any(p => p.Contains(exprPattern));

            if (!isReferenced)
            {
                results.Add(new DeadExpression
                {
                    XmlId = xmlId,
                    IdePosition = idePos,
                    Content = content,
                    Comment = comment,
                    Reason = "Not referenced in any logic line condition"
                });
            }
        }

        return results;
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
/// Orphan analysis result for a single program
/// </summary>
public record OrphanAnalysis
{
    public required string ProjectName { get; init; }
    public long ProgramId { get; init; }
    public int IdePosition { get; init; }
    public required string Name { get; init; }
    public string? PublicName { get; init; }
    public int CallerCount { get; init; }
    public bool IsInEcf { get; init; }
    public int TaskCount { get; init; }
    public OrphanStatus Status { get; init; }
}

/// <summary>
/// Orphan status classification
/// </summary>
public enum OrphanStatus
{
    /// <summary>Program is called by other programs</summary>
    Used,
    /// <summary>Program has PublicName and can be called by ProgIdx()</summary>
    CallableByName,
    /// <summary>Program is in ECF and may be called from other projects</summary>
    CrossProjectPossible,
    /// <summary>Program has no tasks (ISEMPTY_TSK)</summary>
    EmptyProgram,
    /// <summary>Confirmed orphan - no callers, no PublicName, not in ECF</summary>
    Orphan
}

/// <summary>
/// Orphan statistics for a project
/// </summary>
public record OrphanStats
{
    public int TotalPrograms { get; init; }
    public int UsedPrograms { get; init; }
    public int CallableByName { get; init; }
    public int CrossProjectPossible { get; init; }
    public int EmptyPrograms { get; init; }
    public int ConfirmedOrphans { get; init; }
}

/// <summary>
/// Dead code statistics for a program
/// </summary>
public record DeadCodeStats
{
    public int TotalLogicLines { get; init; }
    public int DisabledLines { get; init; }
    public double DisabledRatio { get; init; }
}

/// <summary>
/// A disabled logic line block
/// </summary>
public record DisabledBlock
{
    public int ProgramIdePosition { get; init; }
    public required string ProgramName { get; init; }
    public required string TaskIdePosition { get; init; }
    public required string TaskName { get; init; }
    public int LineNumber { get; init; }
    public required string Handler { get; init; }
    public required string Operation { get; init; }
    public string? Condition { get; init; }
}

/// <summary>
/// A potentially dead expression
/// </summary>
public record DeadExpression
{
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public required string Content { get; init; }
    public string? Comment { get; init; }
    public required string Reason { get; init; }
}
