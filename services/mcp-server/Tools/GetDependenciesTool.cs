using System.ComponentModel;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Get cross-project dependencies
/// </summary>
[McpServerToolType]
public static partial class GetDependenciesTool
{
    // Regex to match invalid XML character entities
    [GeneratedRegex(@"&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);|&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);")]
    private static partial Regex InvalidXmlEntityRegex();

    private static XDocument LoadXmlSafe(string path)
    {
        var content = File.ReadAllText(path, Encoding.UTF8);
        var cleanContent = InvalidXmlEntityRegex().Replace(content, "");
        return XDocument.Parse(cleanContent);
    }
    private static readonly string ProjectsBasePath =
        Environment.GetEnvironmentVariable("MAGIC_PROJECTS_PATH") ?? @"D:\Data\Migration\XPA\PMS";

    [McpServerTool(Name = "magic_get_dependencies")]
    [Description("Get cross-project dependencies for a Magic project. Shows shared components (ECF files) and referenced tables.")]
    public static string GetDependencies(
        IndexCache cache,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project)
    {
        if (string.IsNullOrWhiteSpace(project))
            return "ERROR: Project name is required";

        var projectUpper = project.ToUpperInvariant();
        var sourcePath = Path.Combine(ProjectsBasePath, projectUpper, "Source");

        if (!Directory.Exists(sourcePath))
            return $"ERROR: Project {projectUpper} not found";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"**Dependencies for {projectUpper}**");
        sb.AppendLine();

        // Parse Comps.xml for component dependencies
        var compsPath = Path.Combine(sourcePath, "Comps.xml");
        if (File.Exists(compsPath))
        {
            var components = ParseComponents(compsPath);
            if (components.Count > 0)
            {
                sb.AppendLine("## Shared Components (ECF)");
                sb.AppendLine();
                sb.AppendLine("| Component | File | Objects | Programs |");
                sb.AppendLine("|-----------|------|---------|----------|");

                foreach (var comp in components)
                {
                    sb.AppendLine($"| {comp.Name} | {comp.FileName} | {comp.ObjectCount} | {comp.ProgramCount} |");
                }
                sb.AppendLine();
            }
        }
        else
        {
            sb.AppendLine("*No Comps.xml found - no external components*");
            sb.AppendLine();
        }

        // Parse DataSources.xml for table overview
        var dsPath = Path.Combine(sourcePath, "DataSources.xml");
        if (File.Exists(dsPath))
        {
            var tables = ParseDataSources(dsPath);
            sb.AppendLine($"## Local Data Sources: {tables.Count} tables");
            sb.AppendLine();

            if (tables.Count > 0)
            {
                sb.AppendLine("| ID | Name | Physical File | Memory |");
                sb.AppendLine("|----|------|---------------|--------|");

                foreach (var table in tables.Take(20))
                {
                    var memory = table.IsMemory ? "Yes" : "";
                    sb.AppendLine($"| {table.Id} | {table.Name} | {table.PhysicalName} | {memory} |");
                }

                if (tables.Count > 20)
                {
                    sb.AppendLine($"| ... | *{tables.Count - 20} more tables* | | |");
                }
            }
        }

        // Show cross-references
        sb.AppendLine();
        sb.AppendLine("## Cross-Project Usage");
        sb.AppendLine();

        var projectProgram = cache.GetProject(projectUpper);
        if (projectProgram != null)
        {
            sb.AppendLine($"- **Programs in {projectUpper}:** {projectProgram.ProgramCount}");

            // Common patterns
            if (projectUpper == "ADH")
            {
                sb.AppendLine("- **Used by:** PBP (via ADH.ecf), PVE (via ADH.ecf)");
                sb.AppendLine("- **Uses:** REF.ecf (shared tables)");
            }
            else if (projectUpper == "PBP" || projectUpper == "PBG" || projectUpper == "PVE" || projectUpper == "VIL")
            {
                sb.AppendLine("- **Uses:** REF.ecf (shared tables)");
                if (projectUpper != "PBP")
                    sb.AppendLine("- **Uses:** ADH.ecf (shared programs)");
            }
            else if (projectUpper == "REF")
            {
                sb.AppendLine("- **Used by:** All other projects (ADH, PBP, PBG, PVE, VIL)");
                sb.AppendLine("- **Role:** Central component with shared tables and utilities");
            }
        }

        return sb.ToString();
    }

    private static List<ComponentInfo> ParseComponents(string path)
    {
        var components = new List<ComponentInfo>();

        try
        {
            var doc = LoadXmlSafe(path);
            var compElements = doc.Descendants("Component");

            foreach (var comp in compElements)
            {
                var nameAttr = comp.Attribute("Name")?.Value;
                var fileAttr = comp.Element("FileName")?.Value;

                if (string.IsNullOrEmpty(nameAttr)) continue;

                var objects = comp.Descendants("Object").Count();
                var programs = comp.Descendants("ProgramHeader").Count();

                components.Add(new ComponentInfo
                {
                    Name = nameAttr,
                    FileName = fileAttr ?? "N/A",
                    ObjectCount = objects,
                    ProgramCount = programs
                });
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[GetDependencies] Error parsing Comps.xml: {ex.Message}");
        }

        return components;
    }

    private static List<TableInfo> ParseDataSources(string path)
    {
        var tables = new List<TableInfo>();

        try
        {
            var doc = LoadXmlSafe(path);
            var sourceElements = doc.Descendants("DataSource");

            foreach (var source in sourceElements)
            {
                var idAttr = source.Attribute("id");
                if (idAttr == null || !int.TryParse(idAttr.Value, out int id)) continue;

                var nameAttr = source.Attribute("RepositoryName")?.Value ?? $"Table_{id}";
                var physicalAttr = source.Attribute("Name")?.Value ?? "";
                var dbTypeAttr = source.Attribute("DbType")?.Value;

                tables.Add(new TableInfo
                {
                    Id = id,
                    Name = nameAttr,
                    PhysicalName = physicalAttr,
                    IsMemory = dbTypeAttr == "4" || physicalAttr.StartsWith("tmp_") || physicalAttr.StartsWith("ptmp_")
                });
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[GetDependencies] Error parsing DataSources.xml: {ex.Message}");
        }

        return tables.OrderBy(t => t.Id).ToList();
    }

    private record ComponentInfo
    {
        public required string Name { get; init; }
        public required string FileName { get; init; }
        public int ObjectCount { get; init; }
        public int ProgramCount { get; init; }
    }

    private record TableInfo
    {
        public required int Id { get; init; }
        public required string Name { get; init; }
        public required string PhysicalName { get; init; }
        public bool IsMemory { get; init; }
    }
}
