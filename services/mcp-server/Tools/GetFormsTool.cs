using System.ComponentModel;
using System.Text;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Get Forms (UI screens) for a Magic task
/// </summary>
[McpServerToolType]
public static class GetFormsTool
{
    [McpServerTool(Name = "magic_get_forms")]
    [Description("Get Forms (UI screens) attached to a Magic task. Shows form names, dimensions, window types. Useful for identifying visible screens in ticket analysis.")]
    public static string GetForms(
        MagicQueryService queryService,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position (e.g., 121)")] int programId,
        [Description("Task ISN_2 (optional, default: 1 for root task)")] int? taskIsn2 = null)
    {
        return queryService.GetForms(project, programId, taskIsn2);
    }
}
