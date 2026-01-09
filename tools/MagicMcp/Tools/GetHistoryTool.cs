using System.ComponentModel;
using System.Diagnostics;
using System.Text;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class GetHistoryTool
{
    [McpServerTool(Name = "magic_get_history")]
    [Description("Get Git commit history for a Magic program. Shows recent commits that modified the program.")]
    public static string GetHistory(
        IndexCache cache,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE number (e.g., 69, 181)")] int programId,
        [Description("Maximum number of commits to show (default 10)")] int limit = 10)
    {
        var proj = cache.GetProject(project);
        if (proj == null)
            return $"Project {project} not found";

        var prg = cache.GetProgram(project, programId);
        if (prg == null)
            return $"Program {project} IDE {programId} not found";

        var sb = new StringBuilder();
        sb.AppendLine($"# Git History: {project} IDE {programId} - {prg.PublicName ?? prg.Name}");
        sb.AppendLine();

        try
        {
            // Build source path
            var sourcePath = Path.Combine(proj.SourcePath, $"Prg_{prg.Id}.xml");
            var pmsRoot = @"D:\Data\Migration\XPA\PMS";

            if (!sourcePath.StartsWith(pmsRoot, StringComparison.OrdinalIgnoreCase))
            {
                return $"Source path not in PMS repository: {sourcePath}";
            }

            var relativePath = sourcePath.Substring(pmsRoot.Length).TrimStart('\\', '/').Replace("\\", "/");

            // Run git log
            var psi = new ProcessStartInfo
            {
                FileName = "git",
                Arguments = $"log --oneline -{limit} -- \"{relativePath}\"",
                WorkingDirectory = pmsRoot,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(psi);
            if (process == null)
                return "Failed to start git process";

            var output = process.StandardOutput.ReadToEnd();
            var error = process.StandardError.ReadToEnd();
            process.WaitForExit();

            if (!string.IsNullOrEmpty(error))
            {
                sb.AppendLine($"Git error: {error}");
            }

            if (string.IsNullOrWhiteSpace(output))
            {
                sb.AppendLine("No commits found for this file.");
            }
            else
            {
                sb.AppendLine("| Commit | Message |");
                sb.AppendLine("|--------|---------|");

                var lines = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    var parts = line.Split(' ', 2);
                    if (parts.Length >= 2)
                    {
                        var commit = parts[0];
                        var message = parts[1].Length > 80 ? parts[1].Substring(0, 77) + "..." : parts[1];
                        sb.AppendLine($"| `{commit}` | {message} |");
                    }
                }
            }

            sb.AppendLine();
            sb.AppendLine($"**File**: `{relativePath}`");
        }
        catch (Exception ex)
        {
            sb.AppendLine($"Error: {ex.Message}");
        }

        return sb.ToString();
    }
}
