using System.ComponentModel;
using System.Text;
using MagicKnowledgeBase.Database;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Enhanced pattern scoring with multi-factor weighting
/// </summary>
[McpServerToolType]
public static class PatternScoringTool
{
    /// <summary>
    /// Scoring weights configuration
    /// </summary>
    private static class Weights
    {
        public const double FtsRelevance = 0.35;    // FTS5 match score
        public const double UsageCount = 0.25;      // How often pattern was used
        public const double Recency = 0.20;         // How recently used
        public const double DomainMatch = 0.20;     // Domain keyword match

        // Symptom/keyword sub-weights
        public const int SymptomMatch = 3;
        public const int KeywordMatch = 1;
        public const int DomainKeywordMatch = 2;
    }

    /// <summary>
    /// Domain to keyword mapping
    /// </summary>
    private static readonly Dictionary<string, string[]> DomainKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        ["import"] = ["import", "fichier", "na", "booker", "interface", "externe", "csv", "xml"],
        ["display"] = ["affiche", "ecran", "mauvais", "incorrect", "format", "visible", "ui"],
        ["date"] = ["date", "arrivee", "depart", "timestamp", "jour", "mois", "annee", "datetime"],
        ["calcul"] = ["calcul", "montant", "total", "prix", "remise", "somme", "moyenne", "math"],
        ["data"] = ["jointure", "link", "table", "manquant", "incomplet", "colonne", "donnee"],
        ["session"] = ["session", "ouverture", "fermeture", "caisse", "login", "logout"],
        ["config"] = ["config", "parametre", "ini", "setting", "option", "magic.ini"],
        ["condition"] = ["if", "condition", "filtre", "range", "locate", "where"],
        ["ski"] = ["ski", "location", "materiel", "duree", "rental", "sejour"]
    };

    [McpServerTool(Name = "magic_pattern_score")]
    [Description("Score patterns against symptoms using multi-factor weighted algorithm. Returns ranked patterns with detailed scoring breakdown.")]
    public static string ScorePatterns(
        KnowledgeDb db,
        [Description("Symptom description (e.g., 'date affichee incorrecte, mauvais format')")] string symptom,
        [Description("Comma-separated keywords (e.g., 'date,format,affichage')")] string? keywords = null,
        [Description("Minimum score threshold 0-100 (default: 20)")] int minScore = 20,
        [Description("Maximum results (default: 5)")] int limit = 5)
    {
        if (string.IsNullOrWhiteSpace(symptom))
            return "ERROR: Symptom description required";

        var sb = new StringBuilder();
        sb.AppendLine("## Multi-Factor Pattern Scoring");
        sb.AppendLine();
        sb.AppendLine($"**Symptom:** {symptom}");
        if (!string.IsNullOrEmpty(keywords))
            sb.AppendLine($"**Keywords:** {keywords}");
        sb.AppendLine();

        // Parse keywords
        var keywordList = string.IsNullOrEmpty(keywords)
            ? Array.Empty<string>()
            : keywords.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        // Get all patterns from KB
        var allPatterns = db.GetAllPatterns().ToList();

        if (allPatterns.Count == 0)
        {
            sb.AppendLine("*No patterns in Knowledge Base.*");
            sb.AppendLine();
            sb.AppendLine("> Use `/ticket-learn` or `magic_pattern_sync` to add patterns.");
            return sb.ToString();
        }

        // Score each pattern
        var scoredPatterns = new List<PatternScore>();
        var symptomLower = symptom.ToLowerInvariant();

        foreach (var pattern in allPatterns)
        {
            var score = CalculatePatternScore(pattern, symptomLower, keywordList);
            if (score.TotalScore > 0)
            {
                scoredPatterns.Add(score);
            }
        }

        // Sort by total score descending
        scoredPatterns = scoredPatterns
            .OrderByDescending(s => s.TotalScore)
            .Take(limit)
            .ToList();

        // Filter by minimum score
        var filtered = scoredPatterns.Where(s => s.NormalizedScore >= minScore).ToList();

        if (filtered.Count == 0)
        {
            sb.AppendLine($"*No patterns scored above {minScore}.*");
            sb.AppendLine();

            if (scoredPatterns.Count > 0)
            {
                sb.AppendLine("**Below threshold:**");
                foreach (var p in scoredPatterns.Take(3))
                {
                    sb.AppendLine($"- {p.PatternName}: {p.NormalizedScore:F0} (threshold: {minScore})");
                }
            }

            sb.AppendLine();
            sb.AppendLine("> Lower the threshold or add more patterns with `/ticket-learn`.");
            return sb.ToString();
        }

        // Output results
        sb.AppendLine("### Scoring Breakdown");
        sb.AppendLine();
        sb.AppendLine("| Pattern | Score | FTS | Usage | Recency | Domain | Matches |");
        sb.AppendLine("|---------|-------|-----|-------|---------|--------|---------|");

        foreach (var p in filtered)
        {
            var matchSummary = p.Matches.Count > 3
                ? string.Join(", ", p.Matches.Take(3)) + "..."
                : string.Join(", ", p.Matches);

            sb.AppendLine($"| **{p.PatternName}** | {p.NormalizedScore:F0} | {p.FtsScore:F0} | {p.UsageScore:F0} | {p.RecencyScore:F0} | {p.DomainScore:F0} | {matchSummary} |");
        }

        sb.AppendLine();
        sb.AppendLine("### Score Legend");
        sb.AppendLine();
        sb.AppendLine("| Factor | Weight | Description |");
        sb.AppendLine("|--------|--------|-------------|");
        sb.AppendLine($"| FTS | {Weights.FtsRelevance:P0} | Full-text search relevance |");
        sb.AppendLine($"| Usage | {Weights.UsageCount:P0} | Times pattern was used |");
        sb.AppendLine($"| Recency | {Weights.Recency:P0} | How recently used |");
        sb.AppendLine($"| Domain | {Weights.DomainMatch:P0} | Domain keyword match |");

        // Show top pattern solution if available
        if (filtered.Count > 0)
        {
            var topPattern = db.GetPattern(filtered[0].PatternName);
            if (topPattern != null)
            {
                sb.AppendLine();
                sb.AppendLine($"### Top Match: {topPattern.PatternName}");
                sb.AppendLine();
                sb.AppendLine($"**Type:** {topPattern.RootCauseType ?? "-"}");
                sb.AppendLine($"**Source:** {topPattern.SourceTicket ?? "-"}");
                sb.AppendLine($"**Usage:** {topPattern.UsageCount} time(s)");

                if (!string.IsNullOrWhiteSpace(topPattern.SolutionTemplate))
                {
                    sb.AppendLine();
                    sb.AppendLine("**Solution:**");
                    sb.AppendLine("```");
                    var solution = topPattern.SolutionTemplate.Length > 400
                        ? topPattern.SolutionTemplate[..400] + "..."
                        : topPattern.SolutionTemplate;
                    sb.AppendLine(solution);
                    sb.AppendLine("```");
                }
            }
        }

        sb.AppendLine();
        sb.AppendLine($"*Evaluated {allPatterns.Count} patterns, {filtered.Count} above threshold*");

        return sb.ToString();
    }

    private static PatternScore CalculatePatternScore(
        MagicKnowledgeBase.Models.DbResolutionPattern pattern,
        string symptomLower,
        string[] keywords)
    {
        var score = new PatternScore
        {
            PatternName = pattern.PatternName,
            Matches = new List<string>()
        };

        // 1. FTS-style relevance (symptom + keyword matching)
        var ftsPoints = 0.0;

        // Check pattern's stored keywords against symptom
        if (!string.IsNullOrEmpty(pattern.SymptomKeywords))
        {
            var patternKeywords = pattern.SymptomKeywords
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            foreach (var pk in patternKeywords)
            {
                if (symptomLower.Contains(pk.ToLowerInvariant()))
                {
                    ftsPoints += Weights.SymptomMatch;
                    score.Matches.Add($"symptom:{pk}");
                }
            }
        }

        // Check pattern name against symptom
        var nameParts = pattern.PatternName.Split('-', '_', ' ');
        foreach (var part in nameParts.Where(p => p.Length > 2))
        {
            if (symptomLower.Contains(part.ToLowerInvariant()))
            {
                ftsPoints += Weights.KeywordMatch;
                score.Matches.Add($"name:{part}");
            }
        }

        // Check user-provided keywords
        foreach (var kw in keywords)
        {
            if (pattern.PatternName.Contains(kw, StringComparison.OrdinalIgnoreCase) ||
                (pattern.SymptomKeywords?.Contains(kw, StringComparison.OrdinalIgnoreCase) ?? false))
            {
                ftsPoints += Weights.KeywordMatch;
                score.Matches.Add($"kw:{kw}");
            }
        }

        // Normalize FTS score (max 100)
        score.FtsScore = Math.Min(ftsPoints * 10, 100);

        // 2. Usage count score
        var maxUsage = 20; // Assume 20 is a high usage count
        score.UsageScore = Math.Min((pattern.UsageCount / (double)maxUsage) * 100, 100);

        // 3. Recency score
        if (pattern.LastUsedAt.HasValue)
        {
            var daysSinceUse = (DateTime.UtcNow - pattern.LastUsedAt.Value).TotalDays;
            score.RecencyScore = daysSinceUse <= 7 ? 100 :
                                 daysSinceUse <= 30 ? 70 :
                                 daysSinceUse <= 90 ? 40 : 20;
        }
        else
        {
            score.RecencyScore = 0;
        }

        // 4. Domain match score
        var rootCause = pattern.RootCauseType?.ToLowerInvariant() ?? "";
        if (!string.IsNullOrEmpty(rootCause) && DomainKeywords.TryGetValue(rootCause, out var domainKws))
        {
            foreach (var dk in domainKws)
            {
                if (symptomLower.Contains(dk))
                {
                    score.DomainScore = 100;
                    score.Matches.Add($"domain:{dk}");
                    break;
                }
            }
        }

        // Also check all domains against symptom
        if (score.DomainScore == 0)
        {
            foreach (var kvp in DomainKeywords)
            {
                foreach (var dk in kvp.Value)
                {
                    if (symptomLower.Contains(dk))
                    {
                        score.DomainScore = 50; // Partial match
                        score.Matches.Add($"domain:{dk}");
                        break;
                    }
                }
                if (score.DomainScore > 0) break;
            }
        }

        // Calculate weighted total
        score.TotalScore =
            (score.FtsScore * Weights.FtsRelevance) +
            (score.UsageScore * Weights.UsageCount) +
            (score.RecencyScore * Weights.Recency) +
            (score.DomainScore * Weights.DomainMatch);

        // Normalize to 0-100 scale
        score.NormalizedScore = score.TotalScore;

        return score;
    }

    [McpServerTool(Name = "magic_pattern_weights")]
    [Description("Show the current scoring weights configuration for pattern matching.")]
    public static string GetScoringWeights()
    {
        var sb = new StringBuilder();
        sb.AppendLine("## Pattern Scoring Weights");
        sb.AppendLine();
        sb.AppendLine("### Factor Weights");
        sb.AppendLine();
        sb.AppendLine("| Factor | Weight | Description |");
        sb.AppendLine("|--------|--------|-------------|");
        sb.AppendLine($"| FTS Relevance | **{Weights.FtsRelevance:P0}** | Full-text search match against symptom/keywords |");
        sb.AppendLine($"| Usage Count | **{Weights.UsageCount:P0}** | How often the pattern has been used |");
        sb.AppendLine($"| Recency | **{Weights.Recency:P0}** | How recently the pattern was used |");
        sb.AppendLine($"| Domain Match | **{Weights.DomainMatch:P0}** | Domain-specific keyword matching |");

        sb.AppendLine();
        sb.AppendLine("### Sub-Weights (FTS Calculation)");
        sb.AppendLine();
        sb.AppendLine("| Match Type | Points |");
        sb.AppendLine("|------------|--------|");
        sb.AppendLine($"| Symptom keyword match | +{Weights.SymptomMatch} |");
        sb.AppendLine($"| Pattern name match | +{Weights.KeywordMatch} |");
        sb.AppendLine($"| User keyword match | +{Weights.KeywordMatch} |");
        sb.AppendLine($"| Domain keyword match | +{Weights.DomainKeywordMatch} |");

        sb.AppendLine();
        sb.AppendLine("### Recency Scoring");
        sb.AppendLine();
        sb.AppendLine("| Days Since Use | Score |");
        sb.AppendLine("|----------------|-------|");
        sb.AppendLine("| 0-7 days | 100 |");
        sb.AppendLine("| 8-30 days | 70 |");
        sb.AppendLine("| 31-90 days | 40 |");
        sb.AppendLine("| >90 days | 20 |");
        sb.AppendLine("| Never used | 0 |");

        sb.AppendLine();
        sb.AppendLine("### Domain Keywords");
        sb.AppendLine();
        sb.AppendLine("| Domain | Keywords |");
        sb.AppendLine("|--------|----------|");
        foreach (var kvp in DomainKeywords)
        {
            sb.AppendLine($"| {kvp.Key} | {string.Join(", ", kvp.Value.Take(5))}... |");
        }

        return sb.ToString();
    }

    private class PatternScore
    {
        public string PatternName { get; set; } = "";
        public double FtsScore { get; set; }
        public double UsageScore { get; set; }
        public double RecencyScore { get; set; }
        public double DomainScore { get; set; }
        public double TotalScore { get; set; }
        public double NormalizedScore { get; set; }
        public List<string> Matches { get; set; } = new();
    }
}
