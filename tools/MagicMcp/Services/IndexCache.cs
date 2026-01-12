using System.Collections.Concurrent;
using MagicMcp.Models;

namespace MagicMcp.Services;

/// <summary>
/// In-memory cache for indexed Magic projects
/// </summary>
public class IndexCache
{
    private readonly ConcurrentDictionary<string, MagicProject> _projects = new();
    private readonly XmlIndexer _indexer;
    private readonly string[] _projectNames;
    private readonly TableMappingService _tableMappingService;

    /// <summary>
    /// Main program offset per project (number of Select operations in Prg_1.xml).
    /// Variables in all programs inherit these VG (Virtual Global) variables.
    /// </summary>
    private static readonly Dictionary<string, int> MainOffsets = new(StringComparer.OrdinalIgnoreCase)
    {
        ["ADH"] = 117,
        ["PVE"] = 143,
        ["PBG"] = 91,
        ["VIL"] = 52,
        ["PBP"] = 88,
        ["REF"] = 107
    };

    /// <summary>
    /// Get the Main program offset for a project.
    /// This is the count of VG variables that are loaded for all programs.
    /// </summary>
    public static int GetMainOffset(string projectName)
    {
        return MainOffsets.GetValueOrDefault(projectName.ToUpperInvariant(), 0);
    }

    public IndexCache(string projectsBasePath, string[] projectNames, TableMappingService tableMappingService)
    {
        _tableMappingService = tableMappingService;
        _indexer = new XmlIndexer(projectsBasePath, tableMappingService);
        _projectNames = projectNames;
    }

    public TableMappingService TableMapping => _tableMappingService;

    public void LoadAllProjects()
    {
        foreach (var name in _projectNames)
        {
            try
            {
                var project = _indexer.IndexProject(name);
                _projects[name.ToUpperInvariant()] = project;
                Console.Error.WriteLine($"[IndexCache] Loaded project {name}: {project.ProgramCount} programs");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IndexCache] Failed to load project {name}: {ex.Message}");
            }
        }
    }

    public MagicProject? GetProject(string name)
    {
        _projects.TryGetValue(name.ToUpperInvariant(), out var project);
        return project;
    }

    public MagicProgram? GetProgram(string projectName, int programId)
    {
        var project = GetProject(projectName);
        if (project == null) return null;

        project.Programs.TryGetValue(programId, out var program);
        return program;
    }

    public MagicTask? GetTask(string projectName, int programId, int isn2)
    {
        var program = GetProgram(projectName, programId);
        if (program == null) return null;

        program.Tasks.TryGetValue(isn2, out var task);
        return task;
    }

    public MagicExpression? GetExpression(string projectName, int programId, int expressionId)
    {
        var program = GetProgram(projectName, programId);
        if (program == null) return null;

        program.Expressions.TryGetValue(expressionId, out var expression);
        return expression;
    }

    public IEnumerable<string> GetProjectNames() => _projects.Keys;

    public int GetTotalProgramCount() => _projects.Values.Sum(p => p.ProgramCount);
}
