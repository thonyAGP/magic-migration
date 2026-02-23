using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class CalculateOffsetTool
{
    [McpServerTool(Name = "magic_calculate_offset")]
    [Description("Calculate the global variable offset for a Magic task. Uses validated formula: Offset = Main_VG + Σ(Selects from ancestors, EXCLUDING Access=W). Returns offset value and detailed breakdown.")]
    public static string CalculateOffset(
        OffsetCalculator offsetCalculator,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program ID (numeric, e.g., 348 for Prg_348.xml)")] int programId,
        [Description("Task ISN_2 value")] int taskIsn2)
    {
        var result = offsetCalculator.CalculateOffset(project, programId, taskIsn2);

        if (!result.Success)
            return $"ERROR: {result.Error}";

        return result.ToString();
    }
}
