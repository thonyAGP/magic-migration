using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class GetPositionTool
{
    [McpServerTool(Name = "magic_get_position")]
    [Description("Get IDE position for a Magic program or task. Returns format: PROJECT IDE_POS Nom: DESCRIPTION")]
    public static string GetPosition(
        MagicQueryService queryService,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program ID (e.g., 121)")] int programId,
        [Description("Optional: Task ISN_2 for specific task position")] int? isn2 = null)
    {
        return queryService.GetPosition(project, programId, isn2);
    }
}
