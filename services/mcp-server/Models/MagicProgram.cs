namespace MagicMcp.Models;

/// <summary>
/// Represents a Magic program with its tasks and metadata
/// </summary>
public class MagicProgram
{
    public required int Id { get; init; }
    public required string Name { get; init; }
    public string? PublicName { get; init; }
    public required int IdePosition { get; init; }
    public Dictionary<int, MagicTask> Tasks { get; init; } = new();
    public Dictionary<int, MagicExpression> Expressions { get; init; } = new();
}
