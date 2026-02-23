namespace MagicMcp.Models;

/// <summary>
/// Represents a single line in the Magic IDE Data View tab.
/// The Data View is built from Logic operations, not just Columns.
/// </summary>
public class MagicDataViewLine
{
    /// <summary>Line number in the Data View (1-based, sequential)</summary>
    public required int LineNumber { get; init; }

    /// <summary>Type of line: MainSource, Parameter, Column, LinkQuery, EndLink, Virtual, Empty</summary>
    public required string LineType { get; init; }

    /// <summary>Variable letter (A-Z, AA-ZZ) for Parameter/Column/Virtual</summary>
    public string? Variable { get; init; }

    /// <summary>Column number within the table (for Real columns)</summary>
    public int? TableColumnNumber { get; init; }

    /// <summary>Column/Variable name</summary>
    public string? Name { get; init; }

    /// <summary>Data type (Alpha, Numeric, Date, etc.)</summary>
    public string? DataType { get; init; }

    /// <summary>Picture/Format string</summary>
    public string? Picture { get; init; }

    /// <summary>Table ID for Link Query</summary>
    public int? TableId { get; init; }

    /// <summary>Table name for Link Query</summary>
    public string? TableName { get; init; }

    /// <summary>Index number for Link Query</summary>
    public int? IndexNumber { get; init; }

    /// <summary>Direction for Link Query (A=Ascending)</summary>
    public string? Direction { get; init; }

    /// <summary>Locate expression IDs (Min, Max)</summary>
    public int? LocateMin { get; init; }
    public int? LocateMax { get; init; }

    /// <summary>Range values</summary>
    public string? RangeMin { get; init; }
    public string? RangeMax { get; init; }

    /// <summary>Init expression</summary>
    public string? InitExpression { get; init; }

    /// <summary>Remark text (for empty lines or comments)</summary>
    public string? RemarkText { get; init; }

    /// <summary>XML FieldID reference</summary>
    public int? FieldId { get; init; }

    /// <summary>Component ID for external tables</summary>
    public string? ComponentId { get; init; }
}
