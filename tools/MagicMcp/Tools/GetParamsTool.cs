using System.ComponentModel;
using System.Text;
using System.Xml.Linq;
using MagicMcp.Services;
using ModelContextProtocol.Server;

namespace MagicMcp.Tools;

[McpServerToolType]
public static class GetParamsTool
{
    [McpServerTool(Name = "magic_get_params")]
    [Description("Get the input/output parameters of a Magic program. Shows parameter name, type, direction (I=Input, O=Output, IO=Both).")]
    public static string GetParams(
        IndexCache cache,
        [Description("Project name (ADH, PBP, REF, VIL, PBG, PVE)")] string project,
        [Description("Program IDE number (e.g., 69, 181)")] int programId)
    {
        var proj = cache.GetProject(project);
        if (proj == null)
            return $"Project {project} not found";

        var prg = cache.GetProgram(project, programId);
        if (prg == null)
            return $"Program {project} IDE {programId} not found";

        var sb = new StringBuilder();
        sb.AppendLine($"# {project} IDE {programId} - {prg.PublicName ?? prg.Name}");
        sb.AppendLine();

        try
        {
            var sourcePath = Path.Combine(proj.SourcePath, $"Prg_{prg.Id}.xml");
            if (!File.Exists(sourcePath))
            {
                return $"Source file not found: {sourcePath}";
            }

            var doc = XDocument.Load(sourcePath);
            var mainTask = doc.Descendants("Task").FirstOrDefault();
            if (mainTask == null)
                return "No main task found";

            // Get parameters from Resource/Columns where _FieldStyle = 1 (parameter)
            var resource = mainTask.Element("Resource");
            var columns = resource?.Element("Columns")?.Elements("Column").ToList() ?? new List<XElement>();

            // Get ReturnValue info for direction
            var header = mainTask.Element("Header");
            var returnValue = header?.Element("ReturnValue");
            var paramAttrs = returnValue?.Element("ParametersAttributes")?.Elements("Attr").ToList() ?? new List<XElement>();
            var paramCount = int.TryParse(returnValue?.Element("ParametersCount")?.Attribute("val")?.Value, out var pc) ? pc : 0;

            // Filter columns that are parameters (FieldStyle = 1)
            var parameters = columns
                .Where(c => c.Descendants("_FieldStyle").Any(fs => fs.Attribute("val")?.Value == "1"))
                .ToList();

            if (parameters.Count == 0)
            {
                sb.AppendLine("No parameters defined.");
                return sb.ToString();
            }

            sb.AppendLine($"| # | Name | Type | Direction |");
            sb.AppendLine($"|---|------|------|-----------|");

            int idx = 0;
            foreach (var param in parameters)
            {
                var id = param.Attribute("id")?.Value ?? "?";
                var name = param.Attribute("name")?.Value ?? "Unknown";

                // Determine type from Model
                var model = param.Descendants("Model").FirstOrDefault();
                var attrObj = model?.Attribute("attr_obj")?.Value ?? "UNKNOWN";
                var type = attrObj switch
                {
                    "FIELD_ALPHA" => "Alpha",
                    "FIELD_NUMERIC" => "Numeric",
                    "FIELD_LOGICAL" => "Boolean",
                    "FIELD_DATE" => "Date",
                    "FIELD_TIME" => "Time",
                    "FIELD_BLOB" => "Blob",
                    "FIELD_MEMO" => "Memo",
                    "FIELD_UNICODE" => "Unicode",
                    _ => attrObj.Replace("FIELD_", "")
                };

                // Get direction from ParametersAttributes if available
                var direction = "I"; // Default input
                if (idx < paramAttrs.Count)
                {
                    var attr = paramAttrs[idx].Attribute("MgAttr")?.Value;
                    direction = attr switch
                    {
                        "A" => "I",      // Alpha input
                        "N" => "I",      // Numeric input
                        "B" => "I",      // Boolean input
                        "D" => "I",      // Date input
                        "T" => "I",      // Time input
                        "a" => "O",      // Alpha output
                        "n" => "O",      // Numeric output
                        "b" => "O",      // Boolean output
                        "d" => "O",      // Date output
                        "t" => "O",      // Time output
                        _ => "I"
                    };
                }

                sb.AppendLine($"| {id} | {name} | {type} | {direction} |");
                idx++;
            }

            sb.AppendLine();
            sb.AppendLine($"**Total parameters**: {parameters.Count}");

            // Add source info
            sb.AppendLine();
            sb.AppendLine($"**Source**: `{sourcePath}`");
        }
        catch (Exception ex)
        {
            sb.AppendLine($"Error parsing XML: {ex.Message}");
        }

        return sb.ToString();
    }
}
