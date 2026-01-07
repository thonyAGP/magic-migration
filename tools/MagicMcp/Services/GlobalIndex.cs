using MagicMcp.Models;

namespace MagicMcp.Services;

/// <summary>
/// Global index for cross-project program search
/// </summary>
public class GlobalIndex
{
    private readonly IndexCache _cache;

    // Reverse indexes
    private readonly Dictionary<string, List<ProgramRef>> _byPublicName = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, List<ProgramRef>> _byKeyword = new(StringComparer.OrdinalIgnoreCase);
    private readonly List<ProgramRef> _allPrograms = new();

    public GlobalIndex(IndexCache cache)
    {
        _cache = cache;
    }

    /// <summary>
    /// Build the global index from all loaded projects
    /// </summary>
    public void BuildIndex()
    {
        _byPublicName.Clear();
        _byKeyword.Clear();
        _allPrograms.Clear();

        foreach (var projectName in _cache.GetProjectNames())
        {
            var project = _cache.GetProject(projectName);
            if (project == null) continue;

            foreach (var program in project.Programs.Values)
            {
                var progRef = new ProgramRef
                {
                    Project = projectName,
                    ProgramId = program.Id,
                    Name = program.Name,
                    PublicName = program.PublicName,
                    IdePosition = program.IdePosition,
                    TaskCount = program.Tasks.Count
                };

                _allPrograms.Add(progRef);

                // Index by public name
                if (!string.IsNullOrEmpty(program.PublicName))
                {
                    if (!_byPublicName.TryGetValue(program.PublicName, out var publicList))
                    {
                        publicList = new List<ProgramRef>();
                        _byPublicName[program.PublicName] = publicList;
                    }
                    publicList.Add(progRef);
                }

                // Index by keywords in name
                var keywords = ExtractKeywords(program.Name);
                foreach (var keyword in keywords)
                {
                    if (!_byKeyword.TryGetValue(keyword, out var keywordList))
                    {
                        keywordList = new List<ProgramRef>();
                        _byKeyword[keyword] = keywordList;
                    }
                    keywordList.Add(progRef);
                }
            }
        }

        Console.Error.WriteLine($"[GlobalIndex] Indexed {_allPrograms.Count} programs, {_byPublicName.Count} public names, {_byKeyword.Count} keywords");
    }

    private HashSet<string> ExtractKeywords(string text)
    {
        var keywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrEmpty(text)) return keywords;

        var words = text.ToLowerInvariant()
            .Split(new[] { ' ', '_', '-', '/', '(', ')', '[', ']', ',', '.' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var word in words)
        {
            if (word.Length >= 3) // Skip very short words
            {
                keywords.Add(word);
            }
        }

        return keywords;
    }

    /// <summary>
    /// Find program by public name (exact match, case insensitive)
    /// </summary>
    public List<ProgramRef> FindByPublicName(string publicName)
    {
        if (_byPublicName.TryGetValue(publicName, out var results))
        {
            return results.ToList();
        }
        return new List<ProgramRef>();
    }

    /// <summary>
    /// Search programs by query (fuzzy matching)
    /// </summary>
    public List<SearchResult> Search(string query, int limit = 20, string? filterProject = null, string? filterType = null)
    {
        var results = new List<SearchResult>();

        // First, check exact public name match
        var publicMatches = FindByPublicName(query);
        foreach (var match in publicMatches)
        {
            if (filterProject != null && !match.Project.Equals(filterProject, StringComparison.OrdinalIgnoreCase))
                continue;

            results.Add(new SearchResult
            {
                Program = match,
                Score = 100,
                MatchType = "PublicName"
            });
        }

        // Then fuzzy search on all programs
        var programs = filterProject != null
            ? _allPrograms.Where(p => p.Project.Equals(filterProject, StringComparison.OrdinalIgnoreCase))
            : _allPrograms;

        foreach (var prog in programs)
        {
            // Skip if already found by public name
            if (results.Any(r => r.Program.Project == prog.Project && r.Program.ProgramId == prog.ProgramId))
                continue;

            // Multi-word matching on name
            var nameScore = FuzzySearch.MultiWordMatchScore(prog.Name, query);
            if (nameScore == 0)
            {
                // Try single-word fuzzy match
                nameScore = FuzzySearch.FuzzyMatchScore(prog.Name, query);
            }

            // Also check public name with fuzzy
            var publicScore = 0;
            if (!string.IsNullOrEmpty(prog.PublicName))
            {
                publicScore = FuzzySearch.FuzzyMatchScore(prog.PublicName, query);
            }

            var bestScore = Math.Max(nameScore, publicScore);
            if (bestScore >= 50) // Threshold
            {
                results.Add(new SearchResult
                {
                    Program = prog,
                    Score = bestScore,
                    MatchType = publicScore > nameScore ? "PublicName" : "Name"
                });
            }
        }

        return results
            .OrderByDescending(r => r.Score)
            .ThenBy(r => r.Program.Name)
            .Take(limit)
            .ToList();
    }

    /// <summary>
    /// List all programs with optional filters
    /// </summary>
    public List<ProgramRef> ListPrograms(
        string? project = null,
        int skip = 0,
        int take = 50)
    {
        IEnumerable<ProgramRef> query = _allPrograms;

        if (!string.IsNullOrEmpty(project))
        {
            query = query.Where(p => p.Project.Equals(project, StringComparison.OrdinalIgnoreCase));
        }

        return query
            .OrderBy(p => p.Project)
            .ThenBy(p => p.IdePosition)
            .Skip(skip)
            .Take(take)
            .ToList();
    }

    /// <summary>
    /// Get statistics about the index
    /// </summary>
    public IndexStats GetStats()
    {
        var stats = new IndexStats
        {
            TotalPrograms = _allPrograms.Count,
            TotalPublicNames = _byPublicName.Count,
            TotalKeywords = _byKeyword.Count,
            ProjectStats = new Dictionary<string, int>()
        };

        foreach (var projectName in _cache.GetProjectNames())
        {
            var project = _cache.GetProject(projectName);
            if (project != null)
            {
                stats.ProjectStats[projectName] = project.ProgramCount;
            }
        }

        return stats;
    }
}

/// <summary>
/// Reference to a program (lightweight, for indexing)
/// </summary>
public record ProgramRef
{
    public required string Project { get; init; }
    public required int ProgramId { get; init; }
    public required string Name { get; init; }
    public string? PublicName { get; init; }
    public required int IdePosition { get; init; }
    public int TaskCount { get; init; }
}

/// <summary>
/// Search result with score
/// </summary>
public record SearchResult
{
    public required ProgramRef Program { get; init; }
    public required int Score { get; init; }
    public required string MatchType { get; init; }
}

/// <summary>
/// Index statistics
/// </summary>
public record IndexStats
{
    public int TotalPrograms { get; init; }
    public int TotalPublicNames { get; init; }
    public int TotalKeywords { get; init; }
    public Dictionary<string, int> ProjectStats { get; init; } = new();
}
