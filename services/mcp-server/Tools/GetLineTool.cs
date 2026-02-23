using System.ComponentModel;
using MagicMcp.Models;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class GetLineTool
{
    [McpServerTool(Name = "magic_get_line")]
    [Description("Get both DataView column AND Logic operation for a specific line number in a Magic task. Line numbers are independent in each tab. Variable offset is calculated automatically using the validated formula.")]
    public static string GetLine(
        MagicQueryService queryService,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Task position in IDE format (e.g., '69.3' for subtask 3 of program 69)")] string taskPosition,
        [Description("Line number (1-based)")] int lineNumber)
    {
        return queryService.GetLine(project, taskPosition, lineNumber);
    }
}
