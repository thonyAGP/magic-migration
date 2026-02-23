namespace MagicMcp.Services;

/// <summary>
/// Fuzzy string matching using Levenshtein distance and trigram similarity
/// </summary>
public static class FuzzySearch
{
    /// <summary>
    /// Calculate Levenshtein distance between two strings
    /// </summary>
    public static int LevenshteinDistance(string s1, string s2)
    {
        if (string.IsNullOrEmpty(s1)) return s2?.Length ?? 0;
        if (string.IsNullOrEmpty(s2)) return s1.Length;

        var n = s1.Length;
        var m = s2.Length;
        var d = new int[n + 1, m + 1];

        for (var i = 0; i <= n; i++) d[i, 0] = i;
        for (var j = 0; j <= m; j++) d[0, j] = j;

        for (var i = 1; i <= n; i++)
        {
            for (var j = 1; j <= m; j++)
            {
                var cost = s1[i - 1] == s2[j - 1] ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost
                );
            }
        }

        return d[n, m];
    }

    /// <summary>
    /// Calculate similarity score (0-100) based on Levenshtein distance
    /// </summary>
    public static int LevenshteinSimilarity(string s1, string s2)
    {
        if (string.IsNullOrEmpty(s1) && string.IsNullOrEmpty(s2)) return 100;
        if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2)) return 0;

        var distance = LevenshteinDistance(s1.ToLowerInvariant(), s2.ToLowerInvariant());
        var maxLen = Math.Max(s1.Length, s2.Length);
        return (int)((1 - (double)distance / maxLen) * 100);
    }

    /// <summary>
    /// Generate trigrams from a string
    /// </summary>
    public static HashSet<string> GetTrigrams(string s)
    {
        var trigrams = new HashSet<string>();
        if (string.IsNullOrEmpty(s) || s.Length < 3) return trigrams;

        var padded = $"  {s.ToLowerInvariant()}  ";
        for (var i = 0; i < padded.Length - 2; i++)
        {
            trigrams.Add(padded.Substring(i, 3));
        }
        return trigrams;
    }

    /// <summary>
    /// Calculate trigram similarity (Jaccard coefficient)
    /// </summary>
    public static double TrigramSimilarity(string s1, string s2)
    {
        var t1 = GetTrigrams(s1);
        var t2 = GetTrigrams(s2);

        if (t1.Count == 0 && t2.Count == 0) return 1.0;
        if (t1.Count == 0 || t2.Count == 0) return 0.0;

        var intersection = t1.Intersect(t2).Count();
        var union = t1.Union(t2).Count();

        return (double)intersection / union;
    }

    /// <summary>
    /// Combined fuzzy match score (0-100)
    /// Uses substring match, trigram similarity, and Levenshtein
    /// </summary>
    public static int FuzzyMatchScore(string text, string query)
    {
        if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(query)) return 0;

        var textLower = text.ToLowerInvariant();
        var queryLower = query.ToLowerInvariant();

        // Exact match
        if (textLower == queryLower) return 100;

        // Starts with query
        if (textLower.StartsWith(queryLower)) return 95;

        // Contains query as substring
        if (textLower.Contains(queryLower)) return 90;

        // Word match (any word in text matches query)
        var words = textLower.Split(new[] { ' ', '_', '-', '/' }, StringSplitOptions.RemoveEmptyEntries);
        foreach (var word in words)
        {
            if (word == queryLower) return 85;
            if (word.StartsWith(queryLower)) return 80;
        }

        // Trigram similarity (good for typos)
        var trigramScore = TrigramSimilarity(textLower, queryLower);
        if (trigramScore >= 0.5) return (int)(trigramScore * 75);

        // Levenshtein for short strings
        if (query.Length <= 10)
        {
            var levenScore = LevenshteinSimilarity(textLower, queryLower);
            if (levenScore >= 50) return levenScore;
        }

        return 0;
    }

    /// <summary>
    /// Check if query matches text with multi-word support
    /// Example: "planning gm" matches "Affich arrivant planning GM"
    /// </summary>
    public static int MultiWordMatchScore(string text, string query)
    {
        if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(query)) return 0;

        var queryWords = query.ToLowerInvariant()
            .Split(new[] { ' ', '_', '-' }, StringSplitOptions.RemoveEmptyEntries);

        if (queryWords.Length == 0) return 0;

        var textLower = text.ToLowerInvariant();

        // All query words must be present
        var allMatch = queryWords.All(w => textLower.Contains(w));
        if (!allMatch) return 0;

        // Score based on how close together the words are
        var score = 70; // Base score for containing all words

        // Bonus if words appear in order
        var lastIndex = -1;
        var inOrder = true;
        foreach (var word in queryWords)
        {
            var index = textLower.IndexOf(word, StringComparison.Ordinal);
            if (index <= lastIndex) inOrder = false;
            lastIndex = index;
        }
        if (inOrder) score += 15;

        // Bonus for exact phrase match
        if (textLower.Contains(query.ToLowerInvariant())) score += 15;

        return Math.Min(score, 100);
    }
}
