using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using System.Xml.Linq;
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
    private readonly string _projectsBasePath;

    /// <summary>
    /// Fallback hardcoded offsets for known projects (validated manually).
    /// Used as fallback when dynamic calculation fails.
    /// </summary>
    private static readonly Dictionary<string, int> HardcodedOffsets = new(StringComparer.OrdinalIgnoreCase)
    {
        ["ADH"] = 117,
        ["PVE"] = 143,
        ["PBG"] = 91,
        ["VIL"] = 52,
        ["PBP"] = 88,
        ["REF"] = 107
    };

    /// <summary>
    /// Dynamically calculated offsets (cached at load time)
    /// </summary>
    private static readonly ConcurrentDictionary<string, int> CalculatedOffsets = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Get the Main program offset for a project.
    /// First tries calculated offset, then hardcoded fallback, then 0.
    /// </summary>
    public static int GetMainOffset(string projectName)
    {
        var key = projectName.ToUpperInvariant();

        // Try calculated first (most accurate)
        if (CalculatedOffsets.TryGetValue(key, out int calcOffset))
            return calcOffset;

        // Fallback to hardcoded
        return HardcodedOffsets.GetValueOrDefault(key, 0);
    }

    public IndexCache(string projectsBasePath, string[] projectNames, TableMappingService tableMappingService)
    {
        _projectsBasePath = projectsBasePath;
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

                // Calculate and cache Main offset dynamically
                var mainOffset = CalculateMainOffsetForProject(name);
                if (mainOffset >= 0)
                {
                    CalculatedOffsets[name.ToUpperInvariant()] = mainOffset;
                    Console.Error.WriteLine($"[IndexCache] Loaded project {name}: {project.ProgramCount} programs, MainOffset={mainOffset}");
                }
                else
                {
                    Console.Error.WriteLine($"[IndexCache] Loaded project {name}: {project.ProgramCount} programs (offset fallback)");
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IndexCache] Failed to load project {name}: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Calculate Main offset by counting columns in Main task (ISN_2=1) of first program.
    /// Returns -1 if calculation fails.
    /// </summary>
    private int CalculateMainOffsetForProject(string projectName)
    {
        try
        {
            var sourcePath = Path.Combine(_projectsBasePath, projectName, "Source");
            var progsPath = Path.Combine(sourcePath, "Progs.xml");

            if (!File.Exists(progsPath)) return -1;

            var content = File.ReadAllText(progsPath);
            var match = System.Text.RegularExpressions.Regex.Match(content, @"<Program id=""(\d+)""");
            if (!match.Success) return -1;

            var mainPrgId = match.Groups[1].Value;
            var mainPrgPath = Path.Combine(sourcePath, $"Prg_{mainPrgId}.xml");
            if (!File.Exists(mainPrgPath)) return -1;

            // Clean and parse XML
            content = File.ReadAllText(mainPrgPath, System.Text.Encoding.UTF8);
            content = Regex.Replace(content, @"&#x[0-9A-Fa-f]+;", "");
            content = Regex.Replace(content, @"&#\d+;", "");
            var doc = XDocument.Parse(content);

            // Find Main task (ISN_2=1)
            var mainTaskHeader = doc.Descendants("Header")
                .FirstOrDefault(h => h.Attribute("ISN_2")?.Value == "1");
            if (mainTaskHeader?.Parent == null) return -1;

            // Count columns
            var columns = mainTaskHeader.Parent.Element("Resource")?.Element("Columns");
            return columns?.Elements("Column").Count() ?? 0;
        }
        catch
        {
            return -1;
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
