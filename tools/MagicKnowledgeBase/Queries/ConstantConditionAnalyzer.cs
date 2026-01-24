using System.Text.RegularExpressions;
using MagicKnowledgeBase.Database;

namespace MagicKnowledgeBase.Queries;

/// <summary>
/// Analyzes Magic programs for constant conditions that indicate dead code.
/// Detects patterns like IF(0,...), IF('',...)  that are always false/true.
/// </summary>
public partial class ConstantConditionAnalyzer
{
    private readonly KnowledgeDb _db;

    /// <summary>
    /// Patterns that always evaluate to FALSE
    /// </summary>
    private static readonly Regex[] FalsePatterns = new[]
    {
        NumericZeroPattern(),      // Numeric 0 alone
        EmptyStringPattern(),      // Empty string ''
        LogicalFalsePattern(),     // 'FALSE'LOG
        ZeroEqualsOnePattern(),    // 0=1, 0 = 1
        OneEqualsZeroPattern(),    // 1=0, 1 = 0
        StringNeverEqualPattern()  // 'A'='B' where A != B
    };

    /// <summary>
    /// Patterns that always evaluate to TRUE
    /// </summary>
    private static readonly Regex[] TruePatterns = new[]
    {
        NumericOnePattern(),       // Numeric 1 alone
        LogicalTruePattern(),      // 'TRUE'LOG
        OneEqualsOnePattern(),     // 1=1, 1 = 1
        SameStringPattern()        // 'A'='A'
    };

    // Generated regex patterns for performance
    [GeneratedRegex(@"^0$")]
    private static partial Regex NumericZeroPattern();

    [GeneratedRegex(@"^''$|^""""$")]
    private static partial Regex EmptyStringPattern();

    [GeneratedRegex(@"^'FALSE'LOG$", RegexOptions.IgnoreCase)]
    private static partial Regex LogicalFalsePattern();

    [GeneratedRegex(@"^0\s*=\s*1$")]
    private static partial Regex ZeroEqualsOnePattern();

    [GeneratedRegex(@"^1\s*=\s*0$")]
    private static partial Regex OneEqualsZeroPattern();

    [GeneratedRegex(@"^'([^']+)'\s*=\s*'(?!\1)[^']+'$")]
    private static partial Regex StringNeverEqualPattern();

    [GeneratedRegex(@"^1$")]
    private static partial Regex NumericOnePattern();

    [GeneratedRegex(@"^'TRUE'LOG$", RegexOptions.IgnoreCase)]
    private static partial Regex LogicalTruePattern();

    [GeneratedRegex(@"^1\s*=\s*1$")]
    private static partial Regex OneEqualsOnePattern();

    [GeneratedRegex(@"^'([^']+)'\s*=\s*'\1'$")]
    private static partial Regex SameStringPattern();

    // Pattern to detect variable references {N,X} - these are NOT constants
    [GeneratedRegex(@"\{\d+,[A-Za-z0-9_]+\}")]
    private static partial Regex VariableReferencePattern();

    public ConstantConditionAnalyzer(KnowledgeDb db)
    {
        _db = db;
    }

    /// <summary>
    /// Find all logic lines with constant conditions in a project or program
    /// </summary>
    public List<ConstantConditionBlock> FindConstantConditions(string projectName, int? idePosition = null)
    {
        var results = new List<ConstantConditionBlock>();

        using var cmd = _db.Connection.CreateCommand();

        if (idePosition.HasValue)
        {
            cmd.CommandText = @"
                SELECT
                    p.ide_position as prog_ide,
                    p.name as prog_name,
                    t.ide_position as task_ide,
                    t.description as task_name,
                    ll.line_number,
                    ll.handler,
                    ll.operation,
                    ll.condition_expr,
                    ll.is_disabled
                FROM logic_lines ll
                JOIN tasks t ON ll.task_id = t.id
                JOIN programs p ON t.program_id = p.id
                JOIN projects proj ON p.project_id = proj.id
                WHERE proj.name = @project
                AND p.ide_position = @ide
                AND ll.condition_expr IS NOT NULL
                AND ll.condition_expr != ''
                ORDER BY p.ide_position, t.ide_position, ll.line_number";

            cmd.Parameters.AddWithValue("@ide", idePosition.Value);
        }
        else
        {
            cmd.CommandText = @"
                SELECT
                    p.ide_position as prog_ide,
                    p.name as prog_name,
                    t.ide_position as task_ide,
                    t.description as task_name,
                    ll.line_number,
                    ll.handler,
                    ll.operation,
                    ll.condition_expr,
                    ll.is_disabled
                FROM logic_lines ll
                JOIN tasks t ON ll.task_id = t.id
                JOIN programs p ON t.program_id = p.id
                JOIN projects proj ON p.project_id = proj.id
                WHERE proj.name = @project
                AND ll.condition_expr IS NOT NULL
                AND ll.condition_expr != ''
                ORDER BY p.ide_position, t.ide_position, ll.line_number";
        }

        cmd.Parameters.AddWithValue("@project", projectName);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var conditionExpr = reader.GetString(7);
            var (constantType, reason) = AnalyzeCondition(conditionExpr);

            if (constantType != ConstantType.NotConstant)
            {
                results.Add(new ConstantConditionBlock
                {
                    ProgramIdePosition = reader.GetInt32(0),
                    ProgramName = reader.GetString(1),
                    TaskIdePosition = reader.GetString(2),
                    TaskName = reader.GetString(3),
                    LineNumber = reader.GetInt32(4),
                    Handler = reader.GetString(5),
                    Operation = reader.GetString(6),
                    ConditionExpression = conditionExpr,
                    IsAlreadyDisabled = reader.GetBoolean(8),
                    ConstantType = constantType,
                    Reason = reason
                });
            }
        }

        return results;
    }

    /// <summary>
    /// Get summary statistics for constant conditions
    /// </summary>
    public ConstantConditionStats GetStats(string projectName)
    {
        var allConditions = FindConstantConditions(projectName);

        return new ConstantConditionStats
        {
            TotalConstantConditions = allConditions.Count,
            AlwaysFalse = allConditions.Count(c => c.ConstantType == ConstantType.AlwaysFalse),
            AlwaysTrue = allConditions.Count(c => c.ConstantType == ConstantType.AlwaysTrue),
            AlreadyDisabled = allConditions.Count(c => c.IsAlreadyDisabled),
            AffectedPrograms = allConditions.Select(c => c.ProgramIdePosition).Distinct().Count()
        };
    }

    /// <summary>
    /// Analyze a condition expression to determine if it's a constant
    /// </summary>
    private (ConstantType type, string reason) AnalyzeCondition(string condition)
    {
        if (string.IsNullOrWhiteSpace(condition))
            return (ConstantType.NotConstant, "");

        var trimmed = condition.Trim();

        // Skip if contains variable references {N,X} - not a constant
        if (VariableReferencePattern().IsMatch(trimmed))
            return (ConstantType.NotConstant, "Contains variable references");

        // Check for always FALSE patterns
        foreach (var pattern in FalsePatterns)
        {
            if (pattern.IsMatch(trimmed))
            {
                return (ConstantType.AlwaysFalse, GetPatternDescription(pattern, false));
            }
        }

        // Check for always TRUE patterns
        foreach (var pattern in TruePatterns)
        {
            if (pattern.IsMatch(trimmed))
            {
                return (ConstantType.AlwaysTrue, GetPatternDescription(pattern, true));
            }
        }

        return (ConstantType.NotConstant, "");
    }

    private static string GetPatternDescription(Regex pattern, bool isTrue)
    {
        var patternStr = pattern.ToString();

        if (patternStr.Contains("^0$"))
            return "Numeric 0 = FALSE";
        if (patternStr.Contains("''"))
            return "Empty string = FALSE";
        if (patternStr.Contains("FALSE"))
            return "'FALSE'LOG literal";
        if (patternStr.Contains("0\\s*=\\s*1"))
            return "0=1 comparison always FALSE";
        if (patternStr.Contains("1\\s*=\\s*0"))
            return "1=0 comparison always FALSE";
        if (patternStr.Contains("^1$"))
            return "Numeric 1 = TRUE";
        if (patternStr.Contains("TRUE"))
            return "'TRUE'LOG literal";
        if (patternStr.Contains("1\\s*=\\s*1"))
            return "1=1 comparison always TRUE";

        return isTrue ? "Constant TRUE expression" : "Constant FALSE expression";
    }
}

/// <summary>
/// A logic line with a constant condition
/// </summary>
public record ConstantConditionBlock
{
    public int ProgramIdePosition { get; init; }
    public required string ProgramName { get; init; }
    public required string TaskIdePosition { get; init; }
    public required string TaskName { get; init; }
    public int LineNumber { get; init; }
    public required string Handler { get; init; }
    public required string Operation { get; init; }
    public required string ConditionExpression { get; init; }
    public bool IsAlreadyDisabled { get; init; }
    public ConstantType ConstantType { get; init; }
    public required string Reason { get; init; }
}

/// <summary>
/// Type of constant condition
/// </summary>
public enum ConstantType
{
    /// <summary>Not a constant condition</summary>
    NotConstant,
    /// <summary>Condition always evaluates to FALSE (dead code)</summary>
    AlwaysFalse,
    /// <summary>Condition always evaluates to TRUE (redundant condition)</summary>
    AlwaysTrue
}

/// <summary>
/// Statistics for constant conditions in a project
/// </summary>
public record ConstantConditionStats
{
    public int TotalConstantConditions { get; init; }
    public int AlwaysFalse { get; init; }
    public int AlwaysTrue { get; init; }
    public int AlreadyDisabled { get; init; }
    public int AffectedPrograms { get; init; }
}
