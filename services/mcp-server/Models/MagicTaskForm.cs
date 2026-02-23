namespace MagicMcp.Models;

/// <summary>
/// Represents a Form entry attached to a Magic task (UI screen info)
/// </summary>
public class MagicTaskForm
{
    public required int FormEntryId { get; init; }
    public string? FormName { get; init; }
    public int PositionX { get; init; }
    public int PositionY { get; init; }
    public int Width { get; init; }
    public int Height { get; init; }
    public int WindowType { get; init; }
    public string? Font { get; init; }

    /// <summary>
    /// Controls (buttons, fields, tables, etc.) inside this form
    /// </summary>
    public List<MagicFormControl> Controls { get; init; } = new();

    /// <summary>
    /// Get human-readable window type description
    /// </summary>
    public string WindowTypeDescription => WindowType switch
    {
        1 => "Modal",
        2 => "SDI",
        3 => "MDI Child",
        4 => "Floating Toolbar",
        5 => "Modeless",
        6 => "Tool Window",
        7 => "Application Modal",
        10 => "FitToMDI",
        11 => "FitToMDI",
        _ => $"Type {WindowType}"
    };

    /// <summary>
    /// Returns true if this is the main visible screen (SDI or FitToMDI)
    /// </summary>
    public bool IsMainScreen => WindowType == 2 || WindowType == 10 || WindowType == 11;

    /// <summary>
    /// Format for IDE display
    /// </summary>
    public string ToIdeFormat(string projectName, int programIdePosition, string taskDescription)
    {
        var typeDesc = IsMainScreen ? "SDI" : WindowTypeDescription;
        var name = FormName ?? taskDescription;
        return $"{projectName.ToUpper()} IDE {programIdePosition} - {name} ({typeDesc} {Width}x{Height})";
    }
}
