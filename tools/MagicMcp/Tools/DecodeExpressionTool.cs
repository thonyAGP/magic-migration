using System.ComponentModel;
using System.Text.RegularExpressions;
using MagicMcp.Models;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// Tool to decode {N,Y} references in Magic expressions to global variable names.
/// Uses ExpressionCacheService for persistent caching to avoid recalculating offsets.
/// </summary>
[McpServerToolType]
public static class DecodeExpressionTool
{
    /// <summary>
    /// Decode an expression by replacing {N,Y} references with global variable names.
    /// Offset is calculated automatically using the validated formula.
    /// Results are cached for performance.
    /// </summary>
    [McpServerTool(Name = "magic_decode_expression")]
    [Description("Decode {N,Y} references in a Magic expression to global variable names. " +
                 "Offset is calculated automatically using validated formula: Main_VG + Σ(Selects, excluding Access=W). " +
                 "Results are cached in Knowledge Base.")]
    public static string DecodeExpression(
        IndexCache cache,
        OffsetCalculator offsetCalculator,
        ExpressionCacheService expressionCache,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program ID (e.g., 180)")] int programId,
        [Description("Task ISN_2 where the expression is used")] int taskIsn2,
        [Description("Expression ID to decode")] int expressionId)
    {
        // Try to get from cache first
        var cachedResult = expressionCache.Get(project, programId, expressionId);
        if (cachedResult != null)
        {
            return FormatCachedResult(cachedResult, expressionId);
        }

        // Not in cache - compute
        var expression = cache.GetExpression(project, programId, expressionId);
        if (expression == null)
            return $"ERROR: Expression #{expressionId} not found in program {programId}";

        var task = cache.GetTask(project, programId, taskIsn2);
        if (task == null)
            return $"ERROR: Task ISN_2={taskIsn2} not found in program {programId}";

        var offsetResult = offsetCalculator.CalculateOffset(project, programId, taskIsn2);
        var cumulativeOffset = offsetResult.Success ? offsetResult.Offset : 0;

        var result = DecodeExpressionContent(expression.Content, task, cumulativeOffset, cache, project, programId);

        // Convert mappings to VariableInfo for caching
        var variables = result.Mappings
            .Where(m => m.Variable != "?")
            .Select(m => new VariableInfo
            {
                Variable = m.Variable,
                Name = m.LogicalName,
                Position = m.GlobalIndex
            })
            .ToList();

        // Cache the result
        expressionCache.Set(project, programId, expressionId,
            expression.Content, result.DecodedExpression, variables, cumulativeOffset);

        return FormatDecodeResult(expression.Id, expression.Content, result, cumulativeOffset, false);
    }

    private static string FormatCachedResult(CachedDecodedExpression cached, int expressionId)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"## Expression {expressionId} decodee (from cache)");
        sb.AppendLine();
        sb.AppendLine("### Formule originale");
        sb.AppendLine("```");
        sb.AppendLine(cached.RawExpression ?? "[N/A]");
        sb.AppendLine("```");
        sb.AppendLine();
        sb.AppendLine("### Formule decodee");
        sb.AppendLine("```");
        sb.AppendLine(cached.DecodedText);
        sb.AppendLine("```");
        sb.AppendLine();

        if (cached.Variables != null && cached.Variables.Count > 0)
        {
            sb.AppendLine("### Variables utilisees");
            sb.AppendLine();
            sb.AppendLine("| Variable | Nom logique | Position |");
            sb.AppendLine("|----------|-------------|----------|");
            foreach (var v in cached.Variables)
            {
                sb.AppendLine($"| **{v.Variable}** | {v.Name} | {v.Position} |");
            }
            sb.AppendLine();
        }

        if (cached.OffsetUsed.HasValue)
        {
            sb.AppendLine($"**Offset cumulatif utilise:** {cached.OffsetUsed.Value}");
        }
        sb.AppendLine();
        sb.AppendLine($"*Cached at: {cached.CachedAt:yyyy-MM-dd HH:mm:ss}*");

        return sb.ToString();
    }

    private static string FormatDecodeResult(int exprId, string original, DecodeResult result, int offset, bool fromCache)
    {
        var sb = new System.Text.StringBuilder();
        var cacheNote = fromCache ? " (from cache)" : "";
        sb.AppendLine($"## Expression {exprId} decodee{cacheNote}");
        sb.AppendLine();
        sb.AppendLine("### Formule originale");
        sb.AppendLine("```");
        sb.AppendLine(original);
        sb.AppendLine("```");
        sb.AppendLine();
        sb.AppendLine("### Formule decodee");
        sb.AppendLine("```");
        sb.AppendLine(result.DecodedExpression);
        sb.AppendLine("```");
        sb.AppendLine();

        if (result.Mappings.Count > 0)
        {
            sb.AppendLine("### Correspondances {N,Y} -> Variables");
            sb.AppendLine();
            sb.AppendLine("| Reference | Niveau | ColumnID | Position | Index Global | Variable | Nom logique |");
            sb.AppendLine("|-----------|--------|----------|----------|--------------|----------|-------------|");
            foreach (var m in result.Mappings)
            {
                sb.AppendLine($"| `{{{m.Level},{m.ColumnId}}}` | {m.Level} | {m.ColumnId} | {m.LocalPosition} | {m.GlobalIndex} | **{m.Variable}** | {m.LogicalName} |");
            }
            sb.AppendLine();
            sb.AppendLine($"**Offset cumulatif utilise:** {offset}");
        }

        return sb.ToString();
    }

    /// <summary>
    /// Decode all {N,Y} references in an expression
    /// </summary>
    private static DecodeResult DecodeExpressionContent(string content, MagicTask task, int cumulativeOffset, IndexCache cache, string project, int programId)
    {
        var mappings = new List<VariableMapping>();
        var decoded = content;

        // Pattern: {level,columnId} where level is typically 0-9 and columnId is any number
        var regex = new Regex(@"\{(\d+),(\d+)\}");
        var matches = regex.Matches(content);

        foreach (Match match in matches)
        {
            var level = int.Parse(match.Groups[1].Value);
            var columnId = int.Parse(match.Groups[2].Value);

            // Find the column in DataView by matching columnId to XmlId
            int localPosition = -1;
            string logicalName = "?";

            if (level == 0 && task.DataView?.Columns != null)
            {
                // Level 0 = current task's DataView
                for (int i = 0; i < task.DataView.Columns.Count; i++)
                {
                    if (task.DataView.Columns[i].XmlId == columnId)
                    {
                        localPosition = i;
                        logicalName = task.DataView.Columns[i].Name;
                        break;
                    }
                }
            }
            else if (level > 0)
            {
                // Level > 0 = parent task's DataView (level 1 = immediate parent, etc.)
                // For now, mark as parent reference
                logicalName = $"Parent(L{level})";
            }

            if (localPosition >= 0)
            {
                var globalIndex = cumulativeOffset + localPosition;
                var variable = MagicColumn.IndexToVariable(globalIndex);

                mappings.Add(new VariableMapping
                {
                    Level = level,
                    ColumnId = columnId,
                    LocalPosition = localPosition,
                    GlobalIndex = globalIndex,
                    Variable = variable,
                    LogicalName = logicalName
                });

                // Replace in decoded expression
                decoded = decoded.Replace(match.Value, variable);
            }
            else if (level == 32768)
            {
                // Special case: 32768 = Global Variable (VG.)
                // ColumnId is the column number in Main
                var globalVar = MagicColumn.IndexToVariable(columnId);
                mappings.Add(new VariableMapping
                {
                    Level = level,
                    ColumnId = columnId,
                    LocalPosition = columnId,
                    GlobalIndex = columnId,
                    Variable = $"VG.{globalVar}",
                    LogicalName = "Variable Globale Main"
                });
                decoded = decoded.Replace(match.Value, $"VG.{globalVar}");
            }
            else
            {
                // Could not resolve - keep original
                mappings.Add(new VariableMapping
                {
                    Level = level,
                    ColumnId = columnId,
                    LocalPosition = -1,
                    GlobalIndex = -1,
                    Variable = "?",
                    LogicalName = logicalName
                });
            }
        }

        return new DecodeResult
        {
            DecodedExpression = decoded,
            Mappings = mappings
        };
    }

    private class DecodeResult
    {
        public required string DecodedExpression { get; init; }
        public required List<VariableMapping> Mappings { get; init; }
    }

    private class VariableMapping
    {
        public int Level { get; init; }
        public int ColumnId { get; init; }
        public int LocalPosition { get; init; }
        public int GlobalIndex { get; init; }
        public required string Variable { get; init; }
        public required string LogicalName { get; init; }
    }
}
