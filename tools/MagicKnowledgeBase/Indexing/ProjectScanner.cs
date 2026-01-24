using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace MagicKnowledgeBase.Indexing;

/// <summary>
/// Discovers and scans Magic project files
/// </summary>
public partial class ProjectScanner
{
    private readonly string _sourcePath;

    [GeneratedRegex(@"&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);|&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);")]
    private static partial Regex InvalidXmlEntityRegex();

    public ProjectScanner(string sourcePath)
    {
        _sourcePath = sourcePath;
    }

    /// <summary>
    /// Discover all program files in the project
    /// </summary>
    public string[] DiscoverPrograms()
    {
        return Directory.GetFiles(_sourcePath, "Prg_*.xml")
            .OrderBy(f => ExtractProgramId(f))
            .ToArray();
    }

    /// <summary>
    /// Validate that all program XML files are properly indexed in headers
    /// Returns orphan programs (XML exists but not in ProgramHeaders.xml)
    /// </summary>
    public OrphanValidationResult ValidateOrphans()
    {
        var result = new OrphanValidationResult();

        // Get all program XML files
        var programFiles = DiscoverPrograms();
        var xmlIds = new HashSet<int>(programFiles.Select(ExtractProgramId).Where(id => id > 0));
        result.TotalXmlFiles = xmlIds.Count;

        // Parse headers and positions
        var headers = ParseProgramHeaders();
        var positions = ParseProgramPositions();
        result.TotalInHeaders = headers.Count;
        result.TotalInProgs = positions.Count;

        // Find orphans (XML exists but not in headers)
        foreach (var xmlId in xmlIds)
        {
            if (!headers.ContainsKey(xmlId))
            {
                // Try to extract info from XML itself
                var xmlPath = programFiles.FirstOrDefault(f => ExtractProgramId(f) == xmlId);
                if (xmlPath != null)
                {
                    var info = ExtractHeaderFromXml(xmlPath, xmlId);
                    result.OrphanPrograms.Add(info);
                }
            }
        }

        // Find ghost entries (in headers but no XML)
        foreach (var headerId in headers.Keys)
        {
            if (!xmlIds.Contains(headerId))
            {
                result.GhostEntries.Add(headerId);
            }
        }

        return result;
    }

    /// <summary>
    /// Extract header info directly from program XML when not in ProgramHeaders.xml
    /// </summary>
    private ProgramHeaderInfo ExtractHeaderFromXml(string xmlPath, int xmlId)
    {
        try
        {
            var doc = LoadXmlSafe(xmlPath);

            // Get name from first task description
            var firstTaskHeader = doc.Descendants("Task").FirstOrDefault()?.Element("Header");
            var name = firstTaskHeader?.Attribute("Description")?.Value ?? $"Program_{xmlId}";

            // Get public name
            var publicName = doc.Descendants("Public").FirstOrDefault()?.Attribute("val")?.Value;

            return new ProgramHeaderInfo
            {
                Id = xmlId,
                Name = name,
                PublicName = publicName,
                IsOrphan = true
            };
        }
        catch
        {
            return new ProgramHeaderInfo
            {
                Id = xmlId,
                Name = $"Program_{xmlId}",
                IsOrphan = true
            };
        }
    }

    /// <summary>
    /// Parse Progs.xml to get IDE positions for each program
    /// </summary>
    public Dictionary<int, int> ParseProgramPositions()
    {
        var positions = new Dictionary<int, int>();
        var progsPath = Path.Combine(_sourcePath, "Progs.xml");

        if (!File.Exists(progsPath)) return positions;

        var doc = LoadXmlSafe(progsPath);
        var programs = doc.Descendants("Program").ToList();

        for (int i = 0; i < programs.Count; i++)
        {
            var idAttr = programs[i].Attribute("id");
            if (idAttr != null && int.TryParse(idAttr.Value, out int id))
            {
                positions[id] = i + 1; // 1-based IDE position
            }
        }

        return positions;
    }

    /// <summary>
    /// Parse ProgramHeaders.xml for program metadata
    /// </summary>
    public Dictionary<int, ProgramHeaderInfo> ParseProgramHeaders()
    {
        var headers = new Dictionary<int, ProgramHeaderInfo>();
        var headersPath = Path.Combine(_sourcePath, "ProgramHeaders.xml");

        if (!File.Exists(headersPath)) return headers;

        var doc = LoadXmlSafe(headersPath);
        foreach (var header in doc.Descendants("Header"))
        {
            var idAttr = header.Attribute("id");
            if (idAttr != null && int.TryParse(idAttr.Value, out int id))
            {
                headers[id] = new ProgramHeaderInfo
                {
                    Id = id,
                    Name = header.Attribute("Description")?.Value ?? $"Program_{id}",
                    PublicName = header.Element("Public")?.Attribute("val")?.Value
                };
            }
        }

        return headers;
    }

    private static XDocument LoadXmlSafe(string path)
    {
        var content = File.ReadAllText(path, Encoding.UTF8);
        var cleanContent = InvalidXmlEntityRegex().Replace(content, "");
        return XDocument.Parse(cleanContent);
    }

    private static int ExtractProgramId(string filePath)
    {
        var fileName = Path.GetFileNameWithoutExtension(filePath);
        if (fileName.StartsWith("Prg_") && int.TryParse(fileName[4..], out int id))
        {
            return id;
        }
        return 0;
    }

    /// <summary>
    /// Calculate the Main offset for a project dynamically.
    /// This counts the columns in the Main task (ISN_2=1) of the first program.
    /// </summary>
    public MainOffsetResult CalculateMainOffset()
    {
        var result = new MainOffsetResult();

        // Find the first program ID from Progs.xml
        var progsPath = Path.Combine(_sourcePath, "Progs.xml");
        if (!File.Exists(progsPath))
        {
            result.Error = "Progs.xml not found";
            return result;
        }

        string content = File.ReadAllText(progsPath);
        var match = System.Text.RegularExpressions.Regex.Match(content, @"<Program id=""(\d+)""");
        if (!match.Success)
        {
            result.Error = "No Program element found in Progs.xml";
            return result;
        }

        result.MainProgramId = int.Parse(match.Groups[1].Value);

        // Load and parse the main program
        var mainPrgPath = Path.Combine(_sourcePath, $"Prg_{result.MainProgramId}.xml");
        if (!File.Exists(mainPrgPath))
        {
            result.Error = $"Main program file not found: Prg_{result.MainProgramId}.xml";
            return result;
        }

        try
        {
            var doc = LoadXmlSafe(mainPrgPath);

            // Find the Main task (ISN_2=1)
            var mainTaskHeader = doc.Descendants("Header")
                .FirstOrDefault(h => h.Attribute("ISN_2")?.Value == "1");

            if (mainTaskHeader == null)
            {
                result.Error = "Main task (ISN_2=1) not found in main program";
                return result;
            }

            var mainTask = mainTaskHeader.Parent;
            if (mainTask == null)
            {
                result.Error = "Invalid XML structure: Header without parent Task";
                return result;
            }

            // Count columns in Resource/Columns
            var columnsElement = mainTask.Element("Resource")?.Element("Columns");
            if (columnsElement == null)
            {
                result.Offset = 0;
                return result;
            }

            result.Offset = columnsElement.Elements("Column").Count();
            return result;
        }
        catch (Exception ex)
        {
            result.Error = $"Failed to parse main program: {ex.Message}";
            return result;
        }
    }
}

/// <summary>
/// Result of Main offset calculation
/// </summary>
public record MainOffsetResult
{
    public int MainProgramId { get; set; }
    public int Offset { get; set; }
    public string? Error { get; set; }
    public bool Success => string.IsNullOrEmpty(Error);
}

/// <summary>
/// Program header information from ProgramHeaders.xml
/// </summary>
public record ProgramHeaderInfo
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public string? PublicName { get; init; }
    /// <summary>True if extracted from XML (not in ProgramHeaders.xml)</summary>
    public bool IsOrphan { get; init; }
}

/// <summary>
/// Result of orphan validation
/// </summary>
public record OrphanValidationResult
{
    public int TotalXmlFiles { get; set; }
    public int TotalInHeaders { get; set; }
    public int TotalInProgs { get; set; }
    public List<ProgramHeaderInfo> OrphanPrograms { get; } = new();
    public List<int> GhostEntries { get; } = new();

    public bool HasOrphans => OrphanPrograms.Count > 0;
    public bool HasGhosts => GhostEntries.Count > 0;
}
