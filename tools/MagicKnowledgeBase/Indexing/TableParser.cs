using System.Text.RegularExpressions;

namespace MagicKnowledgeBase.Indexing;

/// <summary>
/// Parses DataSources.xml to extract table definitions
/// </summary>
public partial class TableParser
{
    private readonly string _projectsBasePath;

    [GeneratedRegex(@"<DataObject[^>]+>")]
    private static partial Regex DataObjectRegex();

    [GeneratedRegex(@"\bid=""(\d+)""")]
    private static partial Regex IdRegex();

    [GeneratedRegex(@"Public=""([^""]+)""")]
    private static partial Regex PublicRegex();

    [GeneratedRegex(@"name=""([^""]+)""")]
    private static partial Regex NameRegex();

    [GeneratedRegex(@"PhysicalName=""([^""]+)""")]
    private static partial Regex PhysicalNameRegex();

    public TableParser(string projectsBasePath)
    {
        _projectsBasePath = projectsBasePath;
    }

    /// <summary>
    /// Parse DataSources.xml from REF project
    /// </summary>
    public List<ParsedTable> ParseDataSources()
    {
        var tables = new List<ParsedTable>();
        var dataSourcesPath = Path.Combine(_projectsBasePath, "REF", "Source", "DataSources.xml");

        if (!File.Exists(dataSourcesPath))
        {
            return tables;
        }

        var content = File.ReadAllText(dataSourcesPath);
        var matches = DataObjectRegex().Matches(content);

        var tablesWithPublic = new List<(int Id, string PublicName, string Name, string PhysicalName)>();
        var idsWithoutPublic = new List<int>();

        foreach (Match m in matches)
        {
            var tag = m.Value;

            var idMatch = IdRegex().Match(tag);
            if (!idMatch.Success) continue;
            var id = int.Parse(idMatch.Groups[1].Value);

            var publicMatch = PublicRegex().Match(tag);
            var nameMatch = NameRegex().Match(tag);
            var physMatch = PhysicalNameRegex().Match(tag);

            if (publicMatch.Success)
            {
                tablesWithPublic.Add((
                    id,
                    publicMatch.Groups[1].Value,
                    nameMatch.Success ? nameMatch.Groups[1].Value : $"Table_{id}",
                    physMatch.Success ? physMatch.Groups[1].Value : ""
                ));
            }
            else
            {
                idsWithoutPublic.Add(id);
            }
        }

        idsWithoutPublic.Sort();

        // Calculate IDE positions and create table records
        foreach (var (id, publicName, name, physicalName) in tablesWithPublic)
        {
            var noPublicBefore = idsWithoutPublic.Count(x => x < id);
            var idePosition = id - noPublicBefore;

            tables.Add(new ParsedTable
            {
                XmlId = id,
                IdePosition = idePosition,
                PublicName = publicName,
                LogicalName = name,
                PhysicalName = physicalName
            });
        }

        return tables.OrderBy(t => t.IdePosition).ToList();
    }
}

/// <summary>
/// Parsed table from DataSources.xml
/// </summary>
public record ParsedTable
{
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public string? PublicName { get; init; }
    public required string LogicalName { get; init; }
    public string? PhysicalName { get; init; }
    public List<ParsedTableColumn> Columns { get; init; } = new();
}

/// <summary>
/// Parsed table column
/// </summary>
public record ParsedTableColumn
{
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public required string Name { get; init; }
    public required string DataType { get; init; }
    public string? Picture { get; init; }
}
