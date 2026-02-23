namespace MagicMcp.Models;

/// <summary>
/// Represents a Magic expression
/// </summary>
public class MagicExpression
{
    public required int Id { get; init; }
    public required int IdePosition { get; init; }
    public required string Content { get; init; }
    public string? Comment { get; init; }
}
