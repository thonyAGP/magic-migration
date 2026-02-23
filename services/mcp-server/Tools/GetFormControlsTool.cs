using System.ComponentModel;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: Get Form Controls (buttons, fields, tables) for a Magic task
/// </summary>
[McpServerToolType]
public static class GetFormControlsTool
{
    [McpServerTool(Name = "magic_get_form_controls")]
    [Description("Get Form Controls (buttons, fields, tables) inside a Magic form. Shows control types, positions, labels, linked fields, and visibility conditions. Essential for understanding UI screens in ticket analysis.")]
    public static string GetFormControls(
        MagicQueryService queryService,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE position (e.g., 121)")] int programId,
        [Description("Task ISN_2 (optional, default: 1 for root task)")] int? taskIsn2 = null,
        [Description("Filter to specific form entry ID (optional)")] int? formEntryId = null,
        [Description("Filter by control type: BUTTON, EDIT, TABLE, COLUMN, STATIC, etc. (optional)")] string? controlType = null)
    {
        return queryService.GetFormControls(project, programId, taskIsn2, formEntryId, controlType);
    }
}
