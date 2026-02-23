namespace MagicMcp.Models;

/// <summary>
/// Represents a line in Magic task logic (operation).
/// In Magic IDE, the Logic tab shows handlers with:
/// - Line 1: Handler header (e.g., "Record Suffix")
/// - Line 2+: Operations
/// </summary>
public class MagicLogicLine
{
    /// <summary>Global line number across all handlers (for backward compat)</summary>
    public required int LineNumber { get; init; }

    /// <summary>Line number within the current handler section (1=header, 2+=operations)</summary>
    public required int HandlerLineNumber { get; init; }

    /// <summary>Handler type code (TP=Task Prefix, TS=Task Suffix, RP=Record Prefix, RM=Record Main, RS=Record Suffix, H=Handler)</summary>
    public required string HandlerType { get; init; }

    /// <summary>Human-readable handler name (e.g., "Record Suffix")</summary>
    public required string HandlerName { get; init; }

    /// <summary>Is this line a handler header (first line of each section)?</summary>
    public bool IsHandlerHeader { get; init; }

    public required string Operation { get; init; }
    public string? Condition { get; init; }
    public bool IsDisabled { get; init; }
    public Dictionary<string, string> Parameters { get; init; } = new();
}
