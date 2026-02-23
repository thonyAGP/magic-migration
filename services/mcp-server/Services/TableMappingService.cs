using System.Text.RegularExpressions;

namespace MagicMcp.Services;

/// <summary>
/// Service for mapping table XML ids to IDE positions.
/// Position IDE = id - (number of tables without PublicName with id less than this id)
/// </summary>
public partial class TableMappingService
{
    private readonly string _refDataSourcesPath;
    private Dictionary<int, TableInfo> _tableMapping = new();
    private List<int> _idsWithoutPublic = new();
    private DateTime _lastLoadTime = DateTime.MinValue;

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

    public TableMappingService(string projectsBasePath)
    {
        _refDataSourcesPath = Path.Combine(projectsBasePath, "REF", "Source", "DataSources.xml");
        LoadMapping();
    }

    /// <summary>
    /// Reload mapping if DataSources.xml has changed
    /// </summary>
    public void ReloadIfNeeded()
    {
        if (!File.Exists(_refDataSourcesPath)) return;

        var lastWrite = File.GetLastWriteTime(_refDataSourcesPath);
        if (lastWrite > _lastLoadTime)
        {
            LoadMapping();
        }
    }

    private void LoadMapping()
    {
        _tableMapping.Clear();
        _idsWithoutPublic.Clear();

        Console.Error.WriteLine($"[TableMapping] Checking file: {_refDataSourcesPath}");
        Console.Error.Flush();

        if (!File.Exists(_refDataSourcesPath))
        {
            Console.Error.WriteLine($"[TableMapping] DataSources.xml not found: {_refDataSourcesPath}");
            Console.Error.Flush();
            return;
        }

        Console.Error.WriteLine($"[TableMapping] Reading file...");
        Console.Error.Flush();
        var content = File.ReadAllText(_refDataSourcesPath);
        Console.Error.WriteLine($"[TableMapping] File read: {content.Length} chars");
        Console.Error.Flush();

        Console.Error.WriteLine($"[TableMapping] Running regex...");
        Console.Error.Flush();
        var matches = DataObjectRegex().Matches(content);
        Console.Error.WriteLine($"[TableMapping] Found {matches.Count} DataObject tags");
        Console.Error.Flush();

        var tablesWithPublic = new List<(int Id, string PublicName, string Name, string PhysicalName)>();

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
                _idsWithoutPublic.Add(id);
            }
        }

        _idsWithoutPublic.Sort();

        // Calculate IDE position for each table
        foreach (var (id, publicName, name, physicalName) in tablesWithPublic)
        {
            var noPublicBefore = _idsWithoutPublic.Count(x => x < id);
            var idePosition = id - noPublicBefore;

            _tableMapping[id] = new TableInfo
            {
                XmlId = id,
                IdePosition = idePosition,
                PublicName = publicName,
                LogicalName = name,
                PhysicalName = physicalName
            };
        }

        _lastLoadTime = DateTime.Now;
        Console.Error.WriteLine($"[TableMapping] Loaded {_tableMapping.Count} tables, {_idsWithoutPublic.Count} without PublicName (ids: {string.Join(", ", _idsWithoutPublic)})");
    }

    /// <summary>
    /// Get table info by XML id (obj= attribute value)
    /// </summary>
    public TableInfo? GetTableById(int xmlId)
    {
        ReloadIfNeeded();
        return _tableMapping.GetValueOrDefault(xmlId);
    }

    /// <summary>
    /// Get IDE position for a table XML id
    /// </summary>
    public int? GetIdePosition(int xmlId)
    {
        return GetTableById(xmlId)?.IdePosition;
    }

    /// <summary>
    /// Get formatted table info string: "IDE #123 table_name"
    /// </summary>
    public string GetTableDisplayName(int xmlId)
    {
        var info = GetTableById(xmlId);
        if (info == null)
            return $"Table XML id={xmlId} (no mapping)";

        return $"IDE #{info.IdePosition} {info.LogicalName}";
    }

    /// <summary>
    /// Get all tables
    /// </summary>
    public IEnumerable<TableInfo> GetAllTables()
    {
        ReloadIfNeeded();
        return _tableMapping.Values.OrderBy(t => t.IdePosition);
    }

    /// <summary>
    /// Search tables by name (partial match)
    /// </summary>
    public IEnumerable<TableInfo> SearchTables(string query)
    {
        ReloadIfNeeded();
        var lowerQuery = query.ToLowerInvariant();
        return _tableMapping.Values
            .Where(t => t.LogicalName.ToLowerInvariant().Contains(lowerQuery)
                     || t.PublicName.ToLowerInvariant().Contains(lowerQuery)
                     || t.PhysicalName.ToLowerInvariant().Contains(lowerQuery))
            .OrderBy(t => t.IdePosition);
    }

    /// <summary>
    /// Get statistics
    /// </summary>
    public (int Total, int WithPublic, int WithoutPublic) GetStats()
    {
        ReloadIfNeeded();
        return (_tableMapping.Count + _idsWithoutPublic.Count, _tableMapping.Count, _idsWithoutPublic.Count);
    }
}

public record TableInfo
{
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public string PublicName { get; init; } = "";
    public string LogicalName { get; init; } = "";
    public string PhysicalName { get; init; } = "";
}
