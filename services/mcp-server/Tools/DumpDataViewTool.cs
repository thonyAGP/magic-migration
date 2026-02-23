using System.ComponentModel;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using MagicMcp.Models;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static partial class DumpDataViewTool
{
    // Regex to match invalid XML character entities
    [GeneratedRegex(@"&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);|&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);")]
    private static partial Regex InvalidXmlEntityRegex();

    private static XDocument LoadXmlSafe(string path)
    {
        var content = System.IO.File.ReadAllText(path, Encoding.UTF8);
        var cleanContent = InvalidXmlEntityRegex().Replace(content, "");
        return XDocument.Parse(cleanContent);
    }

    [McpServerTool(Name = "magic_dump_dataview")]
    [Description("Dump the complete Data View structure as seen in Magic IDE. Built from Logic operations (DATAVIEW_SRC, Select, LNK, END_LINK, Remark).")]
    public static string DumpDataView(
        IndexCache cache,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Task position in IDE format (e.g., '69' for program 69 root task, '69.3' for subtask)")] string taskPosition)
    {
        // Parse task position
        var parts = taskPosition.Split('.');
        if (parts.Length == 0 || !int.TryParse(parts[0], out int prgIdePosition))
            return $"ERROR: Invalid task position format '{taskPosition}'";

        // Find project
        var projectData = cache.GetProject(project);
        if (projectData == null)
            return $"ERROR: Project {project} not found. Available: {string.Join(", ", cache.GetProjectNames())}";

        // Find program by IDE position
        var program = projectData.Programs.Values.FirstOrDefault(p => p.IdePosition == prgIdePosition);
        if (program == null)
            return $"ERROR: No program found at IDE position {prgIdePosition} in {project}";

        // Find task by IDE position
        MagicTask? task = null;
        if (parts.Length == 1)
        {
            // Root task
            task = program.Tasks.Values.FirstOrDefault(t => t.IdePosition == taskPosition)
                ?? program.Tasks.GetValueOrDefault(1);
        }
        else
        {
            task = program.Tasks.Values.FirstOrDefault(t => t.IdePosition == taskPosition);
        }

        if (task is null)
            return $"ERROR: Task {taskPosition} not found in program {program.Id}";

        // Load the XML file directly to parse Data View from Logic
        var xmlPath = System.IO.Path.Combine(projectData.SourcePath, $"Prg_{program.Id}.xml");
        if (!System.IO.File.Exists(xmlPath))
            return $"ERROR: XML file not found: {xmlPath}";

        var doc = LoadXmlSafe(xmlPath);

        // Find the task element by ISN_2
        var taskElement = doc.Descendants("Task")
            .FirstOrDefault(t =>
            {
                var header = t.Element("Header");
                var isn2Attr = header?.Attribute("ISN_2");
                return isn2Attr != null && isn2Attr.Value == task.Isn2.ToString();
            });

        if (taskElement == null)
            return $"ERROR: Task element with ISN_2={task.Isn2} not found in XML";

        // Build Data View using the correct algorithm
        var dvLines = DataViewBuilder.BuildFromTask(taskElement);

        // Format output
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"## Data View: {project.ToUpper()} IDE {taskPosition}");
        sb.AppendLine($"**Task:** {task.Description} (ISN_2={task.Isn2})");
        sb.AppendLine($"**Source:** Prg_{program.Id}.xml");
        sb.AppendLine();

        if (dvLines.Count == 0)
        {
            sb.AppendLine("*No Data View lines found*");
            return sb.ToString();
        }

        sb.AppendLine("| Line | Type | Var | Name | DataType | Picture |");
        sb.AppendLine("|------|------|-----|------|----------|---------|");

        foreach (var line in dvLines)
        {
            var varStr = line.Variable ?? "";
            var nameStr = line.Name ?? line.RemarkText ?? "";
            if (nameStr.Length > 30) nameStr = nameStr.Substring(0, 30) + "...";

            var typeStr = line.DataType ?? "";
            var pictureStr = line.Picture ?? "";
            if (pictureStr.Length > 15) pictureStr = pictureStr.Substring(0, 15) + "...";

            switch (line.LineType)
            {
                case "Empty":
                    sb.AppendLine($"| {line.LineNumber} | *(empty)* | | | | |");
                    break;
                case "Remark":
                    sb.AppendLine($"| {line.LineNumber} | Remark | | {nameStr} | | |");
                    break;
                default:
                    sb.AppendLine($"| {line.LineNumber} | {line.LineType} | {varStr} | {nameStr} | {typeStr} | {pictureStr} |");
                    break;
            }
        }

        sb.AppendLine();
        sb.AppendLine($"**Total lines:** {dvLines.Count}");

        return sb.ToString();
    }
}
