using System.Text.Json;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicMcp.Services;

/// <summary>
/// Caches decoded expressions to avoid recalculating offsets.
/// Uses SQLite Knowledge Base for persistent storage.
/// </summary>
public class ExpressionCacheService
{
    private readonly KnowledgeDb _db;
    private int _hitCount;
    private int _missCount;

    public ExpressionCacheService(KnowledgeDb? db = null)
    {
        _db = db ?? new KnowledgeDb();
    }

    /// <summary>
    /// Get a cached decoded expression, or null if not found.
    /// </summary>
    public CachedDecodedExpression? Get(string project, int programId, int expressionId)
    {
        var cached = _db.GetCachedExpression(project, programId, expressionId);
        if (cached != null)
        {
            _hitCount++;
            return new CachedDecodedExpression
            {
                Project = cached.Project,
                ProgramId = cached.ProgramId,
                ExpressionId = cached.ExpressionId,
                RawExpression = cached.RawExpression,
                DecodedText = cached.DecodedText,
                Variables = ParseVariables(cached.VariablesJson),
                OffsetUsed = cached.OffsetUsed,
                CachedAt = cached.CachedAt,
                FromCache = true
            };
        }
        _missCount++;
        return null;
    }

    /// <summary>
    /// Cache a decoded expression.
    /// </summary>
    public void Set(string project, int programId, int expressionId,
                   string rawExpression, string decodedText,
                   List<VariableInfo>? variables = null, int? offsetUsed = null)
    {
        var expr = new DbDecodedExpression
        {
            Project = project,
            ProgramId = programId,
            ExpressionId = expressionId,
            RawExpression = rawExpression,
            DecodedText = decodedText,
            VariablesJson = variables != null ? JsonSerializer.Serialize(variables) : null,
            OffsetUsed = offsetUsed,
            CachedAt = DateTime.UtcNow
        };
        _db.UpsertCachedExpression(expr);
    }

    /// <summary>
    /// Try to get from cache, or compute and cache.
    /// </summary>
    public CachedDecodedExpression GetOrCompute(
        string project, int programId, int expressionId,
        Func<(string raw, string decoded, List<VariableInfo>? vars, int? offset)> computeFunc)
    {
        var cached = Get(project, programId, expressionId);
        if (cached != null)
            return cached;

        var (raw, decoded, vars, offset) = computeFunc();
        Set(project, programId, expressionId, raw, decoded, vars, offset);

        return new CachedDecodedExpression
        {
            Project = project,
            ProgramId = programId,
            ExpressionId = expressionId,
            RawExpression = raw,
            DecodedText = decoded,
            Variables = vars,
            OffsetUsed = offset,
            CachedAt = DateTime.UtcNow,
            FromCache = false
        };
    }

    /// <summary>
    /// Get cache statistics.
    /// </summary>
    public CacheStats GetStats()
    {
        return new CacheStats
        {
            TotalCached = _db.GetCachedExpressionCount(),
            SessionHits = _hitCount,
            SessionMisses = _missCount,
            HitRate = _hitCount + _missCount > 0
                ? (double)_hitCount / (_hitCount + _missCount)
                : 0
        };
    }

    private static List<VariableInfo>? ParseVariables(string? json)
    {
        if (string.IsNullOrEmpty(json)) return null;
        try
        {
            return JsonSerializer.Deserialize<List<VariableInfo>>(json);
        }
        catch
        {
            return null;
        }
    }
}

/// <summary>
/// Cached decoded expression result.
/// </summary>
public class CachedDecodedExpression
{
    public required string Project { get; init; }
    public int ProgramId { get; init; }
    public int ExpressionId { get; init; }
    public string? RawExpression { get; init; }
    public required string DecodedText { get; init; }
    public List<VariableInfo>? Variables { get; init; }
    public int? OffsetUsed { get; init; }
    public DateTime CachedAt { get; init; }
    public bool FromCache { get; init; }
}

/// <summary>
/// Variable information extracted during decoding.
/// </summary>
public class VariableInfo
{
    public required string Variable { get; init; }
    public required string Name { get; init; }
    public string? DataType { get; init; }
    public int? Position { get; init; }
}

/// <summary>
/// Cache statistics.
/// </summary>
public class CacheStats
{
    public int TotalCached { get; init; }
    public int SessionHits { get; init; }
    public int SessionMisses { get; init; }
    public double HitRate { get; init; }

    public override string ToString()
    {
        return $"Cache: {TotalCached} entries, Session: {SessionHits} hits / {SessionMisses} misses ({HitRate:P0})";
    }
}
