using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace MagicMcp.Services;

/// <summary>
/// Calculates the global variable offset for a task based on its ancestor chain.
///
/// Formula: Offset = Main_VG + Σ(Selects from ancestors, EXCLUDING those with Access=W)
///
/// Rules:
/// - Tasks without MainSource: count all Selects
/// - Tasks with MainSource Access=R: count all Selects
/// - Tasks with MainSource Access=W: SKIP (0 contribution)
/// </summary>
public class OffsetCalculator
{
    private readonly string _projectsBasePath;
    private readonly IndexCache _cache;

    public OffsetCalculator(string projectsBasePath, IndexCache cache)
    {
        _projectsBasePath = projectsBasePath;
        _cache = cache;
    }

    /// <summary>
    /// Calculate the global offset for a task.
    /// </summary>
    /// <param name="projectName">Project name (ADH, VIL, etc.)</param>
    /// <param name="programId">Program ID (numeric, e.g., 348)</param>
    /// <param name="taskIsn2">Task ISN_2 value</param>
    /// <returns>Offset calculation result</returns>
    public OffsetResult CalculateOffset(string projectName, int programId, int taskIsn2)
    {
        var result = new OffsetResult();

        // Get Main_VG from cache
        var project = _cache.GetProject(projectName);
        if (project == null)
        {
            result.Error = $"Project {projectName} not found";
            return result;
        }

        result.MainVG = IndexCache.GetMainOffset(projectName);
        result.Offset = result.MainVG;

        // Load program XML
        var programPath = Path.Combine(_projectsBasePath, projectName, "Source", $"Prg_{programId}.xml");
        if (!File.Exists(programPath))
        {
            result.Error = $"Program file not found: {programPath}";
            return result;
        }

        XDocument doc;
        try
        {
            var content = File.ReadAllText(programPath, Encoding.UTF8);
            content = Regex.Replace(content, @"&#x[0-9A-Fa-f]+;", "");
            content = Regex.Replace(content, @"&#\d+;", "");
            doc = XDocument.Parse(content);
        }
        catch (Exception ex)
        {
            result.Error = $"Failed to parse XML: {ex.Message}";
            return result;
        }

        // Find target task and build ancestor chain
        var targetTask = doc.Descendants("Header")
            .FirstOrDefault(h => h.Attribute("ISN_2")?.Value == taskIsn2.ToString())?
            .Parent;

        if (targetTask == null)
        {
            result.Error = $"Task ISN_2={taskIsn2} not found in Prg_{programId}.xml";
            return result;
        }

        // Build ancestor chain by traversing XML parents
        var chain = new List<TaskContribution>();
        var current = targetTask;

        while (current != null && current.Name == "Task")
        {
            var header = current.Element("Header");
            if (header == null) break;

            var isn2Str = header.Attribute("ISN_2")?.Value;
            if (!int.TryParse(isn2Str, out int isn2)) break;

            var desc = header.Attribute("Description")?.Value ?? "";

            // Count Selects in this task's TaskLogic (not nested tasks)
            int selectCount = CountSelectsInTask(current);

            // Check for MainSource with Write access
            bool hasWriteAccess = HasMainSourceWriteAccess(current);

            chain.Add(new TaskContribution
            {
                Isn2 = isn2,
                Description = desc,
                SelectCount = selectCount,
                HasWriteAccess = hasWriteAccess,
                Contributes = !hasWriteAccess && isn2 != taskIsn2
            });

            // Move to parent Task
            var parent = current.Parent;
            while (parent != null && parent.Name != "Task")
                parent = parent.Parent;
            current = parent;
        }

        // Reverse to get root-to-target order
        chain.Reverse();
        result.AncestorChain = chain;

        // Calculate total offset
        foreach (var task in chain)
        {
            if (task.Contributes)
            {
                result.Offset += task.SelectCount;
                task.Contribution = task.SelectCount;
            }
        }

        return result;
    }

    /// <summary>
    /// Count Select operations in a task's TaskLogic (direct children only, not nested tasks).
    /// </summary>
    private static int CountSelectsInTask(XElement taskElement)
    {
        var taskLogic = taskElement.Element("TaskLogic");
        if (taskLogic == null) return 0;

        int count = 0;
        foreach (var logicUnit in taskLogic.Elements("LogicUnit"))
        {
            var logicLines = logicUnit.Element("LogicLines");
            if (logicLines != null)
            {
                count += logicLines.Elements("LogicLine")
                    .Count(ll => ll.Element("Select") != null);
            }
        }

        return count;
    }

    /// <summary>
    /// Check if task has MainSource (comp=2) with Write access (Access=W).
    /// </summary>
    private static bool HasMainSourceWriteAccess(XElement taskElement)
    {
        var resource = taskElement.Element("Resource");
        var db = resource?.Element("DB");
        var dataObj = db?.Element("DataObject");
        var comp = dataObj?.Attribute("comp")?.Value;
        var access = db?.Element("Access")?.Attribute("val")?.Value;

        return comp == "2" && access == "W";
    }
}

/// <summary>
/// Result of offset calculation.
/// </summary>
public class OffsetResult
{
    /// <summary>Main VG count from main program.</summary>
    public int MainVG { get; set; }

    /// <summary>Calculated global offset.</summary>
    public int Offset { get; set; }

    /// <summary>Chain of ancestors with their contributions.</summary>
    public List<TaskContribution> AncestorChain { get; set; } = new();

    /// <summary>Error message if calculation failed.</summary>
    public string? Error { get; set; }

    /// <summary>Whether calculation succeeded.</summary>
    public bool Success => string.IsNullOrEmpty(Error);

    public override string ToString()
    {
        if (!Success) return $"ERROR: {Error}";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"Offset: {Offset}");
        sb.AppendLine($"Main_VG: {MainVG}");
        sb.AppendLine("Ancestor chain:");

        foreach (var task in AncestorChain)
        {
            var status = task.HasWriteAccess ? "SKIP (Access=W)" : $"+{task.Contribution}";
            var marker = task.Contributes ? "" : " [TARGET or SKIP]";
            sb.AppendLine($"  ISN_2={task.Isn2} '{task.Description}': {task.SelectCount} Selects → {status}{marker}");
        }

        return sb.ToString();
    }
}

/// <summary>
/// Information about a task's contribution to the offset.
/// </summary>
public class TaskContribution
{
    public int Isn2 { get; set; }
    public string Description { get; set; } = "";
    public int SelectCount { get; set; }
    public bool HasWriteAccess { get; set; }
    public bool Contributes { get; set; }
    public int Contribution { get; set; }
}
