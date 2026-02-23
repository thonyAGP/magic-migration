namespace MagicMcp.Models;

/// <summary>
/// Represents a Magic Unipaas project (ADH, PBP, REF, etc.)
/// </summary>
public class MagicProject
{
    public required string Name { get; init; }
    public required string SourcePath { get; init; }
    public Dictionary<int, MagicProgram> Programs { get; init; } = new();
    public int ProgramCount => Programs.Count;

    /// <summary>
    /// Maps program ID to its IDE position (1-based order in Progs.xml)
    /// </summary>
    public Dictionary<int, int> ProgramIdToIdePosition { get; init; } = new();
}
