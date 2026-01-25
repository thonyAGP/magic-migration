using System.ComponentModel;
using System.Text;
using System.Text.Json;
using MagicKnowledgeBase.Database;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

/// <summary>
/// MCP Tool: ECF Shared Components Registry - track cross-project dependencies
/// </summary>
[McpServerToolType]
public static class EcfRegistryTool
{
    [McpServerTool(Name = "magic_ecf_list")]
    [Description("List all ECF shared component files and their statistics.")]
    public static string ListEcfFiles(KnowledgeDb db)
    {
        var sb = new StringBuilder();
        sb.AppendLine("## ECF Shared Components Registry");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT ecf_name,
                   COUNT(*) as program_count,
                   COUNT(DISTINCT owner_project) as owner_count,
                   GROUP_CONCAT(DISTINCT component_group) as groups
            FROM shared_components
            GROUP BY ecf_name
            ORDER BY program_count DESC";

        var hasData = false;
        using (var reader = cmd.ExecuteReader())
        {
            if (reader.HasRows)
            {
                sb.AppendLine("| ECF File | Programs | Owner | Groups |");
                sb.AppendLine("|----------|----------|-------|--------|");
                hasData = true;
            }

            while (reader.Read())
            {
                var ecfName = reader.GetString(0);
                var count = reader.GetInt32(1);
                var ownerCount = reader.GetInt32(2);
                var groups = reader.IsDBNull(3) ? "-" : reader.GetString(3);
                sb.AppendLine($"| **{ecfName}** | {count} | {ownerCount} | {groups} |");
            }
        }

        if (!hasData)
        {
            sb.AppendLine("*No ECF components registered.*");
            sb.AppendLine();
            sb.AppendLine("> Use `KbIndexRunner populate-ecf` to populate the registry.");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_ecf_programs")]
    [Description("List all programs in a specific ECF file.")]
    public static string ListEcfPrograms(
        KnowledgeDb db,
        [Description("ECF file name (e.g., ADH.ecf, REF.ecf)")] string ecfName)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Programs in {ecfName}");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT program_ide_position, program_public_name, program_internal_name,
                   owner_project, used_by_projects, component_group
            FROM shared_components
            WHERE ecf_name = @ecf
            ORDER BY component_group, program_ide_position";
        cmd.Parameters.AddWithValue("@ecf", ecfName);

        var hasData = false;
        string? currentGroup = null;

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                var ide = reader.GetInt32(0);
                var publicName = reader.IsDBNull(1) ? "-" : reader.GetString(1);
                var internalName = reader.IsDBNull(2) ? "-" : reader.GetString(2);
                var owner = reader.GetString(3);
                var usedBy = reader.IsDBNull(4) ? "[]" : reader.GetString(4);
                var group = reader.IsDBNull(5) ? "Default" : reader.GetString(5);

                if (group != currentGroup)
                {
                    if (currentGroup != null) sb.AppendLine();
                    sb.AppendLine($"### {group}");
                    sb.AppendLine();
                    sb.AppendLine("| IDE | Public Name | Internal Name | Used By |");
                    sb.AppendLine("|-----|-------------|---------------|---------|");
                    currentGroup = group;
                }

                hasData = true;
                sb.AppendLine($"| {owner} IDE {ide} | {publicName} | {internalName} | {usedBy} |");
            }
        }

        if (!hasData)
        {
            sb.AppendLine($"*No programs found in {ecfName}*");
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_ecf_usedby")]
    [Description("Find which projects use a specific shared program.")]
    public static string FindUsedBy(
        KnowledgeDb db,
        [Description("Public name of the program (e.g., SOLDE_COMPTE)")] string publicName)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## Usage of '{publicName}'");
        sb.AppendLine();

        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT ecf_name, program_ide_position, program_internal_name,
                   owner_project, used_by_projects, component_group
            FROM shared_components
            WHERE program_public_name LIKE @name
               OR program_internal_name LIKE @name
            ORDER BY ecf_name";
        cmd.Parameters.AddWithValue("@name", $"%{publicName}%");

        var results = new List<(string Ecf, int Ide, string Internal, string Owner, string UsedBy, string Group)>();

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                results.Add((
                    reader.GetString(0),
                    reader.GetInt32(1),
                    reader.IsDBNull(2) ? "-" : reader.GetString(2),
                    reader.GetString(3),
                    reader.IsDBNull(4) ? "[]" : reader.GetString(4),
                    reader.IsDBNull(5) ? "-" : reader.GetString(5)
                ));
            }
        }

        if (results.Count == 0)
        {
            sb.AppendLine($"*No shared component found matching '{publicName}'*");
            sb.AppendLine();
            sb.AppendLine("> This program might not be in an ECF, or the registry needs to be populated.");
            return sb.ToString();
        }

        foreach (var r in results)
        {
            sb.AppendLine($"### {r.Owner} IDE {r.Ide}");
            sb.AppendLine();
            sb.AppendLine($"- **ECF**: {r.Ecf}");
            sb.AppendLine($"- **Group**: {r.Group}");
            sb.AppendLine($"- **Internal Name**: {r.Internal}");
            sb.AppendLine();

            // Parse used_by JSON
            try
            {
                var usedBy = JsonSerializer.Deserialize<List<string>>(r.UsedBy) ?? new List<string>();
                if (usedBy.Count > 0)
                {
                    sb.AppendLine("**Used by projects:**");
                    foreach (var project in usedBy)
                    {
                        sb.AppendLine($"- {project}");
                    }
                }
                else
                {
                    sb.AppendLine("*Not used by other projects (or usage not tracked)*");
                }
            }
            catch
            {
                sb.AppendLine($"**Used by**: {r.UsedBy}");
            }
            sb.AppendLine();
        }

        return sb.ToString();
    }

    [McpServerTool(Name = "magic_ecf_dependencies")]
    [Description("Show cross-project dependencies via ECF files.")]
    public static string ShowDependencies(
        KnowledgeDb db,
        [Description("Project to analyze (e.g., PBP, PVE)")] string project)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"## ECF Dependencies for {project}");
        sb.AppendLine();

        // Find ECFs that this project uses
        using var cmd = db.Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT ecf_name, owner_project,
                   COUNT(*) as component_count
            FROM shared_components
            WHERE used_by_projects LIKE @pattern
               OR owner_project = @project
            GROUP BY ecf_name, owner_project
            ORDER BY ecf_name";
        cmd.Parameters.AddWithValue("@pattern", $"%\"{project}\"%");
        cmd.Parameters.AddWithValue("@project", project);

        var dependencies = new List<(string Ecf, string Owner, int Count, bool IsOwner)>();

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                var ecf = reader.GetString(0);
                var owner = reader.GetString(1);
                var count = reader.GetInt32(2);
                dependencies.Add((ecf, owner, count, owner == project));
            }
        }

        if (dependencies.Count == 0)
        {
            sb.AppendLine($"*No ECF dependencies found for {project}*");
            return sb.ToString();
        }

        // Owned ECFs
        var owned = dependencies.Where(d => d.IsOwner).ToList();
        if (owned.Count > 0)
        {
            sb.AppendLine("### ECFs Owned");
            sb.AppendLine();
            sb.AppendLine("| ECF | Components |");
            sb.AppendLine("|-----|------------|");
            foreach (var d in owned)
            {
                sb.AppendLine($"| **{d.Ecf}** | {d.Count} programs |");
            }
            sb.AppendLine();
        }

        // Used ECFs
        var used = dependencies.Where(d => !d.IsOwner).ToList();
        if (used.Count > 0)
        {
            sb.AppendLine("### ECFs Used (from other projects)");
            sb.AppendLine();
            sb.AppendLine("| ECF | Owner | Components Used |");
            sb.AppendLine("|-----|-------|-----------------|");
            foreach (var d in used)
            {
                sb.AppendLine($"| **{d.Ecf}** | {d.Owner} | {d.Count} |");
            }
            sb.AppendLine();
        }

        // Summary
        sb.AppendLine("### Dependency Summary");
        sb.AppendLine();
        sb.AppendLine($"- Owns: {owned.Count} ECF(s) with {owned.Sum(d => d.Count)} programs");
        sb.AppendLine($"- Uses: {used.Count} ECF(s) with {used.Sum(d => d.Count)} programs from other projects");

        return sb.ToString();
    }
}
