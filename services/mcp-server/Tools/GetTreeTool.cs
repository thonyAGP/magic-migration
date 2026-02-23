using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class GetTreeTool
{
    [McpServerTool(Name = "magic_get_tree")]
    [Description("Get full task tree for a Magic program. Shows IDE positions, ISN_2, names and levels.")]
    public static string GetTree(
        MagicQueryService queryService,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program ID (e.g., 121)")] int programId)
    {
        return queryService.GetTree(project, programId);
    }
}
