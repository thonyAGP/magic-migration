namespace MagicMcp.Models;

/// <summary>
/// Represents a Magic task (ISN_2 based)
/// </summary>
public class MagicTask
{
    public required int Isn2 { get; init; }
    public required string Description { get; init; }
    public required int Level { get; init; }
    public required string IdePosition { get; init; }
    public int? ParentIsn2 { get; init; }
    public string TaskType { get; init; } = "B";
    public MagicDataView? DataView { get; set; }
    public List<MagicLogicLine> LogicLines { get; init; } = new();
}
