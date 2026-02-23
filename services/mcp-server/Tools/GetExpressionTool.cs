using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class GetExpressionTool
{
    [McpServerTool(Name = "magic_get_expression")]
    [Description("Get expression content by ID. Returns both XML ID and IDE position.")]
    public static string GetExpression(
        MagicQueryService queryService,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program ID (e.g., 121)")] int programId,
        [Description("Expression ID (XML id attribute)")] int expressionId)
    {
        return queryService.GetExpression(project, programId, expressionId);
    }
}
