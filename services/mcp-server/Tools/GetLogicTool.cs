using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class GetLogicTool
{
    [McpServerTool(Name = "magic_get_logic")]
    [Description("Get logic operations for a Magic task. Shows operations, conditions, and disabled status.")]
    public static string GetLogic(
        MagicQueryService queryService,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program ID (e.g., 121)")] int programId,
        [Description("Task ISN_2")] int isn2,
        [Description("Optional: Specific line number for detailed view")] int? lineNumber = null)
    {
        return queryService.GetLogic(project, programId, isn2, lineNumber);
    }
}
