namespace MagicMcp.Models;

/// <summary>
/// Represents a Magic DataView (Main Source, Links, Range, Locate, Columns)
/// </summary>
public record MagicDataView
{
    public MagicMainSource? MainSource { get; init; }
    public List<MagicLink> Links { get; init; } = new();
    public List<MagicColumn> Columns { get; init; } = new();
    public MagicRange? Range { get; init; }
    public MagicLocate? Locate { get; init; }
}

public class MagicMainSource
{
    public required int TableId { get; init; }
    public string? ComponentId { get; init; }
    public required string TableName { get; init; }
    public int? IndexId { get; init; }
    public string AccessMode { get; init; } = "R";
}

public class MagicLink
{
    public required int Id { get; init; }
    public required int TableId { get; init; }
    public required string TableName { get; init; }
    public required string LinkType { get; init; }
    public int? IndexId { get; init; }
    public string? Condition { get; init; }
}

public class MagicRange
{
    public string Direction { get; init; } = "A";
    public List<MagicRangeSegment> Segments { get; init; } = new();
}

public class MagicRangeSegment
{
    public required int Id { get; init; }
    public required string Mode { get; init; }
    public required string MinExpression { get; init; }
    public required string MaxExpression { get; init; }
}

public class MagicLocate
{
    public List<MagicLocateSegment> Segments { get; init; } = new();
}

public class MagicLocateSegment
{
    public required int Id { get; init; }
    public required string Expression { get; init; }
}
