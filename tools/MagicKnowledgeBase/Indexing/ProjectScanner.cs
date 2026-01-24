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
}

/// <summary>
/// Program header information from ProgramHeaders.xml
/// </summary>
public record ProgramHeaderInfo
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public string? PublicName { get; init; }
}
