namespace MagicMcp.Services;

/// <summary>
/// Service for discovering Magic projects dynamically.
/// Eliminates hardcoded project lists across the codebase.
/// </summary>
public class ProjectDiscoveryService
{
    private readonly string _basePath;
    private string[]? _cachedProjects;

    public ProjectDiscoveryService(string basePath)
    {
        _basePath = basePath;
    }

    /// <summary>
    /// Get base path for Magic projects
    /// </summary>
    public string BasePath => _basePath;

    /// <summary>
    /// Discover all Magic projects that have Source folder with Prg_*.xml files
    /// </summary>
    public string[] DiscoverProjects(bool forceRefresh = false)
    {
        if (_cachedProjects != null && !forceRefresh)
            return _cachedProjects;

        if (!Directory.Exists(_basePath))
            return Array.Empty<string>();

        _cachedProjects = Directory.GetDirectories(_basePath)
            .Select(d => Path.GetFileName(d))
            .Where(name => !string.IsNullOrEmpty(name) && IsValidMagicProject(name))
            .OrderBy(n => n)
            .ToArray();

        return _cachedProjects;
    }

    /// <summary>
    /// Check if a directory is a valid Magic project (has Source folder with Prg_*.xml)
    /// </summary>
    public bool IsValidMagicProject(string projectName)
    {
        var sourcePath = GetSourcePath(projectName);
        if (!Directory.Exists(sourcePath))
            return false;

        // Check for at least one Prg_*.xml file
        return Directory.GetFiles(sourcePath, "Prg_*.xml", SearchOption.TopDirectoryOnly).Length > 0;
    }

    /// <summary>
    /// Get the Source path for a project
    /// </summary>
    public string GetSourcePath(string projectName)
    {
        return Path.Combine(_basePath, projectName, "Source");
    }

    /// <summary>
    /// Get the number of programs in a project (count of Prg_*.xml files)
    /// </summary>
    public int GetProgramCount(string projectName)
    {
        var sourcePath = GetSourcePath(projectName);
        if (!Directory.Exists(sourcePath))
            return 0;

        return Directory.GetFiles(sourcePath, "Prg_*.xml", SearchOption.TopDirectoryOnly).Length;
    }

    /// <summary>
    /// Get project statistics
    /// </summary>
    public ProjectStats GetStats()
    {
        var projects = DiscoverProjects();
        var totalPrograms = projects.Sum(GetProgramCount);

        return new ProjectStats
        {
            ProjectCount = projects.Length,
            TotalProgramCount = totalPrograms,
            ProjectNames = projects
        };
    }

    /// <summary>
    /// Get project names formatted for display (e.g., "ADH, PBP, REF, VIL, PBG, PVE")
    /// </summary>
    public string GetProjectNamesDisplay()
    {
        return string.Join(", ", DiscoverProjects());
    }
}

/// <summary>
/// Statistics about discovered projects
/// </summary>
public record ProjectStats
{
    public int ProjectCount { get; init; }
    public int TotalProgramCount { get; init; }
    public string[] ProjectNames { get; init; } = Array.Empty<string>();
}
