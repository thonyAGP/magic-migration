using System.ComponentModel;
using System.Text.Json;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class SpecReaderTool
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    [McpServerTool(Name = "magic_get_spec")]
    [Description("Get program specification from .openspec/specs/ folder. Returns tables, parameters, variables and expressions in structured format.")]
    public static string GetSpec(
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("IDE position (e.g., 238)")] int idePosition,
        [Description("Optional: Filter to specific section (tables, parameters, variables, expressions). Default: all")] string? section = null)
    {
        // Find .openspec path - search from current directory up
        var openspecPath = FindOpenspecPath();
        if (openspecPath == null)
            return "ERROR: .openspec folder not found in current directory or parents";

        var parser = new SpecParserService(openspecPath);

        if (!parser.SpecExists(project, idePosition))
            return $"ERROR: Spec not found for {project.ToUpper()} IDE {idePosition}. " +
                   $"Expected path: {parser.GetSpecPath(project, idePosition)}";

        var spec = parser.ParseSpec(project, idePosition);
        if (spec == null)
            return "ERROR: Failed to parse spec file";

        // Return specific section if requested
        if (!string.IsNullOrEmpty(section))
        {
            return section.ToLower() switch
            {
                "tables" => FormatTables(spec),
                "parameters" or "params" => FormatParameters(spec),
                "variables" or "vars" => FormatVariables(spec),
                "expressions" or "expr" => FormatExpressions(spec),
                "summary" => FormatSummary(spec),
                _ => $"ERROR: Unknown section '{section}'. Valid: tables, parameters, variables, expressions, summary"
            };
        }

        // Return full spec
        return FormatFullSpec(spec);
    }

    [McpServerTool(Name = "magic_spec_exists")]
    [Description("Check if a program specification exists in .openspec/specs/ folder")]
    public static string SpecExists(
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("IDE position (e.g., 238)")] int idePosition)
    {
        var openspecPath = FindOpenspecPath();
        if (openspecPath == null)
            return "ERROR: .openspec folder not found";

        var parser = new SpecParserService(openspecPath);
        var exists = parser.SpecExists(project, idePosition);
        var path = parser.GetSpecPath(project, idePosition);

        return exists
            ? $"YES: Spec exists at {path}"
            : $"NO: Spec not found at {path}";
    }

    [McpServerTool(Name = "magic_spec_tables")]
    [Description("Get tables used by a program, optionally filtered by access mode (R/W)")]
    public static string GetSpecTables(
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("IDE position (e.g., 238)")] int idePosition,
        [Description("Optional: Filter by access mode (R=Read, W=Write)")] string? access = null)
    {
        var openspecPath = FindOpenspecPath();
        if (openspecPath == null)
            return "ERROR: .openspec folder not found";

        var parser = new SpecParserService(openspecPath);
        var spec = parser.ParseSpec(project, idePosition);
        if (spec == null)
            return $"ERROR: Spec not found for {project.ToUpper()} IDE {idePosition}";

        var tables = spec.Tables;
        if (!string.IsNullOrEmpty(access))
            tables = tables.Where(t => t.Access.Equals(access, StringComparison.OrdinalIgnoreCase)).ToList();

        if (tables.Count == 0)
            return $"No tables found" + (access != null ? $" with access={access}" : "");

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"**{project.ToUpper()} IDE {idePosition}** - {tables.Count} tables" +
                     (access != null ? $" (access={access.ToUpper()})" : ""));
        sb.AppendLine();
        sb.AppendLine("| IDE# | Physical | Logical | Access | Usage |");
        sb.AppendLine("|------|----------|---------|--------|-------|");

        foreach (var t in tables.OrderBy(t => t.Access == "W" ? 0 : 1).ThenBy(t => t.Id))
        {
            var accessMark = t.Access == "W" ? "**W**" : "R";
            sb.AppendLine($"| #{t.Id} | `{t.PhysicalName}` | {t.LogicalName} | {accessMark} | {t.UsageCount}x |");
        }

        return sb.ToString();
    }

    private static string FormatFullSpec(SpecData spec)
    {
        var sb = new System.Text.StringBuilder();

        // Header
        sb.AppendLine($"# {spec.Project} IDE {spec.IdePosition}");
        if (!string.IsNullOrEmpty(spec.Description))
            sb.AppendLine($"> {spec.Description}");
        sb.AppendLine();

        // Summary
        sb.AppendLine("## Summary");
        sb.AppendLine($"- **Type**: {spec.Type ?? "Unknown"}");
        sb.AppendLine($"- **Version**: {spec.SpecVersion ?? "1.0"}");
        sb.AppendLine($"- **XML**: {spec.XmlFile ?? "-"}");
        sb.AppendLine($"- **Tables**: {spec.Tables.Count} ({spec.WriteTableCount} Write / {spec.ReadTableCount} Read)");
        sb.AppendLine($"- **Parameters**: {spec.Parameters.Count}");
        sb.AppendLine($"- **Variables**: {spec.Variables.Count}");
        sb.AppendLine($"- **Expressions**: {spec.ExpressionCount}");
        sb.AppendLine();

        // Tables (write first)
        if (spec.Tables.Count > 0)
        {
            sb.AppendLine(FormatTables(spec));
            sb.AppendLine();
        }

        // Parameters
        if (spec.Parameters.Count > 0)
        {
            sb.AppendLine(FormatParameters(spec));
            sb.AppendLine();
        }

        return sb.ToString();
    }

    private static string FormatSummary(SpecData spec)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"**{spec.Project} IDE {spec.IdePosition}** - {spec.Description ?? ""}");
        sb.AppendLine();
        sb.AppendLine("| Metric | Value |");
        sb.AppendLine("|--------|-------|");
        sb.AppendLine($"| Type | {spec.Type ?? "-"} |");
        sb.AppendLine($"| Version | {spec.SpecVersion ?? "1.0"} |");
        sb.AppendLine($"| Tables (Total) | {spec.Tables.Count} |");
        sb.AppendLine($"| Tables (Write) | {spec.WriteTableCount} |");
        sb.AppendLine($"| Tables (Read) | {spec.ReadTableCount} |");
        sb.AppendLine($"| Parameters | {spec.Parameters.Count} |");
        sb.AppendLine($"| Variables | {spec.Variables.Count} |");
        sb.AppendLine($"| Expressions | {spec.ExpressionCount} |");
        return sb.ToString();
    }

    private static string FormatTables(SpecData spec)
    {
        if (spec.Tables.Count == 0)
            return "No tables found in spec.";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"## Tables ({spec.Tables.Count} total - {spec.WriteTableCount} Write / {spec.ReadTableCount} Read)");
        sb.AppendLine();
        sb.AppendLine("| IDE# | Physical | Logical | Access | Usage |");
        sb.AppendLine("|------|----------|---------|--------|-------|");

        // Write tables first
        foreach (var t in spec.Tables.Where(t => t.Access == "W").OrderBy(t => t.Id))
        {
            sb.AppendLine($"| #{t.Id} | `{t.PhysicalName}` | {t.LogicalName} | **W** | {t.UsageCount}x |");
        }

        // Then read tables
        foreach (var t in spec.Tables.Where(t => t.Access == "R").OrderBy(t => t.Id))
        {
            sb.AppendLine($"| #{t.Id} | `{t.PhysicalName}` | {t.LogicalName} | R | {t.UsageCount}x |");
        }

        return sb.ToString();
    }

    private static string FormatParameters(SpecData spec)
    {
        if (spec.Parameters.Count == 0)
            return "No parameters found in spec.";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"## Parameters ({spec.Parameters.Count})");
        sb.AppendLine();
        sb.AppendLine("| # | Name | Type |");
        sb.AppendLine("|---|------|------|");

        foreach (var p in spec.Parameters.OrderBy(p => p.Index))
        {
            sb.AppendLine($"| P{p.Index} | {p.Name} | {p.Type} |");
        }

        return sb.ToString();
    }

    private static string FormatVariables(SpecData spec)
    {
        if (spec.Variables.Count == 0)
            return "No variables found in spec.";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"## Variables ({spec.Variables.Count})");
        sb.AppendLine();

        // Work variables (non-global)
        var workVars = spec.Variables.Where(v => v.Type != "GLOBAL").ToList();
        if (workVars.Any())
        {
            sb.AppendLine("### Work Variables");
            sb.AppendLine("| Ref | Name | Type |");
            sb.AppendLine("|-----|------|------|");
            foreach (var v in workVars.Take(20))
            {
                sb.AppendLine($"| `{v.Reference}` | {v.Name} | {v.Type} |");
            }
            if (workVars.Count > 20)
                sb.AppendLine($"... and {workVars.Count - 20} more");
            sb.AppendLine();
        }

        // Global variables
        var globalVars = spec.Variables.Where(v => v.Type == "GLOBAL").ToList();
        if (globalVars.Any())
        {
            sb.AppendLine("### Global Variables (VG)");
            sb.AppendLine("| Ref | Name |");
            sb.AppendLine("|-----|------|");
            foreach (var v in globalVars.Take(15))
            {
                sb.AppendLine($"| `{v.Reference}` | {v.Name} |");
            }
            if (globalVars.Count > 15)
                sb.AppendLine($"... and {globalVars.Count - 15} more");
        }

        return sb.ToString();
    }

    private static string FormatExpressions(SpecData spec)
    {
        return $"**Expressions**: {spec.ExpressionCount} total\n\n" +
               "Use `magic_get_spec {project} {ide}` to see the full spec file with expression details.";
    }

    private static string? FindOpenspecPath()
    {
        var dir = new DirectoryInfo(Environment.CurrentDirectory);

        while (dir != null)
        {
            var openspecPath = Path.Combine(dir.FullName, ".openspec");
            if (Directory.Exists(openspecPath))
                return openspecPath;
            dir = dir.Parent;
        }

        return null;
    }
}
