namespace MagicMcp.Models;

/// <summary>
/// Represents a Control element inside a FormEntry (button, field, table, etc.)
/// </summary>
public class MagicFormControl
{
    public required int ControlId { get; init; }

    /// <summary>
    /// Control type: EDIT, PUSH_BUTTON, STATIC, TABLE, COLUMN, IMAGE, CHECK_BOX, COMBO_BOX, etc.
    /// </summary>
    public required string ControlType { get; init; }

    /// <summary>
    /// X position in DLU (Dialog Logical Units)
    /// </summary>
    public int X { get; init; }

    /// <summary>
    /// Y position in DLU
    /// </summary>
    public int Y { get; init; }

    /// <summary>
    /// Width in DLU
    /// </summary>
    public int Width { get; init; }

    /// <summary>
    /// Height in DLU
    /// </summary>
    public int Height { get; init; }

    /// <summary>
    /// Label text (from Format or Text property)
    /// </summary>
    public string? Label { get; init; }

    /// <summary>
    /// Linked DataView column FieldID (for EDIT controls)
    /// </summary>
    public int? FieldId { get; init; }

    /// <summary>
    /// Expression ID for Visible condition
    /// </summary>
    public int? VisibleExprId { get; init; }

    /// <summary>
    /// Expression ID for Enabled condition
    /// </summary>
    public int? EnabledExprId { get; init; }

    /// <summary>
    /// Tab order for navigation
    /// </summary>
    public int? TabOrder { get; init; }

    /// <summary>
    /// Internal event ID for buttons (RaiseEvent)
    /// </summary>
    public int? RaiseEventId { get; init; }

    /// <summary>
    /// Parent control ID (ISN_FATHER) for columns inside tables
    /// </summary>
    public int? ParentControlId { get; init; }

    /// <summary>
    /// Column title (for TABLE/COLUMN controls)
    /// </summary>
    public string? ColumnTitle { get; init; }

    /// <summary>
    /// Is control disabled/hidden by default?
    /// </summary>
    public bool IsDisabled { get; init; }

    /// <summary>
    /// Additional properties dictionary for control-specific attributes
    /// </summary>
    public Dictionary<string, string> Properties { get; init; } = new();

    /// <summary>
    /// Human-readable control type name
    /// </summary>
    public string ControlTypeName => ControlType switch
    {
        "EDIT" => "Text Field",
        "PUSH_BUTTON" => "Button",
        "STATIC" => "Label",
        "TABLE" => "Table/Grid",
        "COLUMN" => "Column",
        "IMAGE" => "Image",
        "CHECK_BOX" => "Checkbox",
        "COMBO_BOX" => "Dropdown",
        "LIST_BOX" => "List",
        "RADIO_BUTTON" => "Radio",
        "GROUP" => "Group Box",
        "LINE" => "Line",
        "BROWSER" => "Browser",
        "TAB" => "Tab Control",
        "RICH_EDIT" => "Rich Text",
        _ => ControlType
    };

    /// <summary>
    /// Returns a summary string for display
    /// </summary>
    public string ToSummary()
    {
        var parts = new List<string> { $"[{ControlTypeName}]" };

        if (!string.IsNullOrEmpty(Label))
            parts.Add($"\"{Label}\"");

        if (FieldId.HasValue)
            parts.Add($"Field:{FieldId}");

        parts.Add($"@({X},{Y})");

        if (Width > 0 || Height > 0)
            parts.Add($"{Width}x{Height}");

        return string.Join(" ", parts);
    }
}
