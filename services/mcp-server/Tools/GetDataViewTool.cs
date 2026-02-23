using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class GetDataViewTool
{
    [McpServerTool(Name = "magic_get_dataview")]
    [Description("Get DataView details (Main Source, Links, Range, Locate) for a Magic task.")]
    public static string GetDataView(
        MagicQueryService queryService,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program ID (e.g., 121)")] int programId,
        [Description("Optional: Task ISN_2 (default: 1 = root task)")] int? isn2 = null)
    {
        return queryService.GetDataView(project, programId, isn2);
    }
}
