using System.Xml.Linq;
using MagicMcp.Models;

namespace MagicMcp.Services;

/// <summary>
/// Parses Magic XML files and builds an index
/// </summary>
public class XmlIndexer
{
    private readonly string _projectsBasePath;

    public XmlIndexer(string projectsBasePath)
    {
        _projectsBasePath = projectsBasePath;
    }

    public MagicProject IndexProject(string projectName)
    {
        var sourcePath = Path.Combine(_projectsBasePath, projectName, "Source");
        if (!Directory.Exists(sourcePath))
            throw new DirectoryNotFoundException($"Project source path not found: {sourcePath}");

        var project = new MagicProject
        {
            Name = projectName,
            SourcePath = sourcePath
        };

        // 1. Parse Progs.xml for IDE positions
        var progsPath = Path.Combine(sourcePath, "Progs.xml");
        var programPositions = ParseProgsXml(progsPath);

        // 2. Parse ProgramHeaders.xml for metadata
        var headersPath = Path.Combine(sourcePath, "ProgramHeaders.xml");
        var programHeaders = ParseProgramHeaders(headersPath);

        // 3. Parse each program file
        foreach (var (prgId, idePosition) in programPositions)
        {
            project.ProgramIdToIdePosition[prgId] = idePosition;

            var prgPath = Path.Combine(sourcePath, $"Prg_{prgId}.xml");
            if (File.Exists(prgPath))
            {
                var header = programHeaders.GetValueOrDefault(prgId);
                var program = ParseProgramFile(prgPath, prgId, idePosition, header);
                project.Programs[prgId] = program;
            }
        }

        return project;
    }

    private Dictionary<int, int> ParseProgsXml(string path)
    {
        var positions = new Dictionary<int, int>();
        if (!File.Exists(path)) return positions;

        var doc = XDocument.Load(path);
        var programs = doc.Descendants("Program").ToList();

        for (int i = 0; i < programs.Count; i++)
        {
            var idAttr = programs[i].Attribute("id");
            if (idAttr != null && int.TryParse(idAttr.Value, out int id))
            {
                positions[id] = i + 1; // 1-based IDE position
            }
        }

        return positions;
    }

    private Dictionary<int, ProgramHeader> ParseProgramHeaders(string path)
    {
        var headers = new Dictionary<int, ProgramHeader>();
        if (!File.Exists(path)) return headers;

        var doc = XDocument.Load(path);
        foreach (var header in doc.Descendants("Header"))
        {
            var idAttr = header.Attribute("id");
            if (idAttr != null && int.TryParse(idAttr.Value, out int id))
            {
                headers[id] = new ProgramHeader
                {
                    Id = id,
                    Name = header.Attribute("Description")?.Value ?? $"Program_{id}",
                    PublicName = header.Element("Public")?.Attribute("val")?.Value
                };
            }
        }

        return headers;
    }

    private MagicProgram ParseProgramFile(string path, int prgId, int idePosition, ProgramHeader? header)
    {
        var doc = XDocument.Load(path);

        var program = new MagicProgram
        {
            Id = prgId,
            Name = header?.Name ?? $"Program_{prgId}",
            PublicName = header?.PublicName,
            IdePosition = idePosition
        };

        // Parse tasks - find all Task elements
        ParseTasks(doc, program, idePosition);

        // Parse expressions
        ParseExpressions(doc, program);

        return program;
    }

    private void ParseTasks(XDocument doc, MagicProgram program, int prgIdePosition)
    {
        // Find all Task elements in the document
        var allTasks = doc.Descendants("Task").ToList();
        var levelCounters = new Dictionary<int, int>();

        foreach (var taskElement in allTasks)
        {
            // Header is direct child of Task element
            var headerElement = taskElement.Element("Header");
            if (headerElement == null) continue;

            var isn2Attr = headerElement.Attribute("ISN_2");
            if (isn2Attr == null || !int.TryParse(isn2Attr.Value, out int isn2)) continue;

            var description = headerElement.Attribute("Description")?.Value ?? "";

            // Get task type from Header
            var taskTypeElement = headerElement.Element("TaskType");
            var taskType = taskTypeElement?.Attribute("val")?.Value ?? "B";

            // Calculate level by XML nesting
            int level = 0;
            var parent = taskElement.Parent;
            while (parent != null)
            {
                if (parent.Name == "Task" || parent.Name == "SubTask") level++;
                parent = parent.Parent;
            }

            // Calculate IDE position
            string idePosition;
            if (isn2 == 1)
            {
                // Root task = program number only
                idePosition = prgIdePosition.ToString();
                levelCounters.Clear();
            }
            else
            {
                // Build IDE position based on hierarchy
                if (!levelCounters.ContainsKey(level))
                    levelCounters[level] = 0;
                levelCounters[level]++;

                // Reset counters for deeper levels
                var keysToRemove = levelCounters.Keys.Where(k => k > level).ToList();
                foreach (var k in keysToRemove)
                    levelCounters.Remove(k);

                idePosition = BuildIdePosition(prgIdePosition, levelCounters);
            }

            // Determine parent ISN_2 by looking at parent Task element
            int? parentIsn2 = null;
            var parentTask = taskElement.Parent;
            while (parentTask != null && parentTask.Name != "Task")
            {
                parentTask = parentTask.Parent;
            }
            if (parentTask != null)
            {
                var parentHeader = parentTask.Element("Header");
                var parentIsn2Attr = parentHeader?.Attribute("ISN_2");
                if (parentIsn2Attr != null && int.TryParse(parentIsn2Attr.Value, out int pIsn2))
                {
                    parentIsn2 = pIsn2;
                }
            }

            // Parse DataView from Resource element
            var dataView = ParseDataView(taskElement);

            // Parse Logic from TaskLogic element
            var logicLines = ParseLogicLines(taskElement);

            program.Tasks[isn2] = new MagicTask
            {
                Isn2 = isn2,
                Description = description,
                Level = level,
                IdePosition = idePosition,
                ParentIsn2 = parentIsn2,
                TaskType = taskType,
                DataView = dataView,
                LogicLines = logicLines
            };
        }
    }

    private string BuildIdePosition(int prgPosition, Dictionary<int, int> levelCounters)
    {
        var parts = new List<string> { prgPosition.ToString() };
        foreach (var level in levelCounters.Keys.OrderBy(k => k))
        {
            parts.Add(levelCounters[level].ToString());
        }
        return string.Join(".", parts);
    }

    private MagicDataView? ParseDataView(XElement taskElement)
    {
        // Resource is direct child of Task
        var resourceElement = taskElement.Element("Resource");
        if (resourceElement == null) return null;

        var dataView = new MagicDataView();

        // Parse DB elements (tables)
        var dbElements = resourceElement.Elements("DB").ToList();
        if (dbElements.Count > 0)
        {
            // First DB is typically the main source
            var firstDb = dbElements[0];
            var dataObjElement = firstDb.Element("DataObject");
            if (dataObjElement != null)
            {
                var compAttr = dataObjElement.Attribute("comp");
                var objAttr = dataObjElement.Attribute("obj");
                if (objAttr != null && int.TryParse(objAttr.Value, out int tableId))
                {
                    var accessElement = firstDb.Element("Access");
                    dataView = dataView with
                    {
                        MainSource = new MagicMainSource
                        {
                            TableId = tableId,
                            ComponentId = compAttr?.Value,
                            TableName = $"Table_{tableId}",
                            AccessMode = accessElement?.Attribute("val")?.Value ?? "R"
                        }
                    };
                }
            }

            // Additional DBs are links
            var links = new List<MagicLink>();
            for (int i = 1; i < dbElements.Count; i++)
            {
                var dbElement = dbElements[i];
                var dataObj = dbElement.Element("DataObject");
                if (dataObj != null)
                {
                    var objAttr = dataObj.Attribute("obj");
                    if (objAttr != null && int.TryParse(objAttr.Value, out int tableId))
                    {
                        links.Add(new MagicLink
                        {
                            Id = i,
                            TableId = tableId,
                            TableName = $"Table_{tableId}",
                            LinkType = "L"
                        });
                    }
                }
            }
            if (links.Count > 0)
            {
                dataView = dataView with { Links = links };
            }
        }

        // Parse Columns
        var columnsElement = resourceElement.Element("Columns");
        var columns = ParseColumns(columnsElement);
        if (columns.Count > 0)
        {
            dataView = dataView with { Columns = columns };
        }

        return dataView;
    }

    private List<MagicColumn> ParseColumns(XElement? columnsElement)
    {
        var columns = new List<MagicColumn>();
        if (columnsElement == null) return columns;

        var columnElements = columnsElement.Elements("Column").ToList();
        for (int i = 0; i < columnElements.Count; i++)
        {
            var colElement = columnElements[i];
            var idAttr = colElement.Attribute("id");
            var nameAttr = colElement.Attribute("name");

            if (idAttr == null || !int.TryParse(idAttr.Value, out int xmlId)) continue;

            // Get PropertyList for field properties
            var propList = colElement.Element("PropertyList");

            // Get data type from Model element
            var modelElement = propList?.Element("Model");
            var dataType = ParseFieldType(modelElement?.Attribute("attr_obj")?.Value);

            // Get picture
            var pictureElement = propList?.Element("Picture");
            var picture = pictureElement?.Attribute("valUnicode")?.Value
                       ?? pictureElement?.Attribute("val")?.Value;

            // Get definition (1=Real, 2=Virtual/Parameter based on name prefix)
            var defElement = propList?.Element("Definition");
            var defVal = defElement?.Attribute("val")?.Value;

            // Determine definition from name prefix and Definition element
            var name = nameAttr?.Value ?? $"Col_{xmlId}";
            string definition;
            if (name.StartsWith(">") || name.StartsWith("&gt;"))
            {
                // Parameter (input)
                definition = "P";
            }
            else if (name.StartsWith("<") || name.StartsWith("&lt;"))
            {
                // Parameter (output)
                definition = "P";
            }
            else if (defVal == "1")
            {
                definition = "R"; // Real (from table)
            }
            else
            {
                definition = "V"; // Virtual
            }

            columns.Add(new MagicColumn
            {
                LineNumber = i + 1,  // 1-based line number in order of appearance
                XmlId = xmlId,
                Variable = MagicColumn.IndexToVariable(i),
                Name = name,
                DataType = dataType,
                Picture = picture,
                Definition = definition
            });
        }

        return columns;
    }

    private static string ParseFieldType(string? attrObj)
    {
        return attrObj switch
        {
            "FIELD_ALPHA" => "Alpha",
            "FIELD_NUMERIC" => "Numeric",
            "FIELD_DATE" => "Date",
            "FIELD_TIME" => "Time",
            "FIELD_LOGICAL" => "Logical",
            "FIELD_BLOB" => "Blob",
            "FIELD_MEMO" => "Memo",
            "FIELD_UNICODE" => "Unicode",
            _ => "Unknown"
        };
    }

    private List<MagicLogicLine> ParseLogicLines(XElement taskElement)
    {
        var lines = new List<MagicLogicLine>();
        int lineNum = 1;  // Continuous numbering across all handlers

        // TaskLogic is direct child of Task
        var taskLogic = taskElement.Element("TaskLogic");
        if (taskLogic == null) return lines;

        // Parse each LogicUnit (handler)
        foreach (var logicUnit in taskLogic.Elements("LogicUnit"))
        {
            var handlerType = GetHandlerType(logicUnit);
            lineNum = ParseLogicUnit(logicUnit, handlerType, lines, lineNum);
        }

        return lines;
    }

    private string GetHandlerType(XElement logicUnit)
    {
        // Determine handler type from Level and Type attributes
        var levelElement = logicUnit.Element("Level");
        var typeElement = logicUnit.Element("Type");

        var level = levelElement?.Attribute("val")?.Value ?? "R";
        var type = typeElement?.Attribute("val")?.Value ?? "M";

        return (level, type) switch
        {
            ("T", "P") => "TP", // Task Prefix
            ("T", "S") => "TS", // Task Suffix
            ("R", "P") => "RP", // Record Prefix
            ("R", "M") => "RM", // Record Main
            ("R", "S") => "RS", // Record Suffix
            ("H", _) => "H",    // Handler
            _ => $"{level}{type}"
        };
    }

    private int ParseLogicUnit(XElement unitElement, string handlerType, List<MagicLogicLine> lines, int startLineNum)
    {
        var lineNum = startLineNum;

        // LogicLines is child of LogicUnit
        var logicLinesElement = unitElement.Element("LogicLines");
        if (logicLinesElement == null) return lineNum;

        foreach (var logicLine in logicLinesElement.Elements("LogicLine"))
        {
            // Get the first child element (the operation)
            var operation = logicLine.Elements().FirstOrDefault();
            if (operation == null) continue;

            var opName = operation.Name.LocalName;
            var isDisabled = operation.Attribute("Disabled")?.Value == "1";

            // Build parameters dictionary
            var parameters = new Dictionary<string, string>
            {
                ["Handler"] = handlerType
            };

            // Copy all attributes as parameters
            foreach (var attr in operation.Attributes())
            {
                if (attr.Name.LocalName != "Disabled")
                    parameters[attr.Name.LocalName] = attr.Value;
            }

            // Extract condition
            var conditionElement = operation.Element("Condition");
            var condition = conditionElement?.Attribute("val")?.Value;

            // Add call target info for Call operations
            if (opName == "Call")
            {
                var callDb = operation.Element("DB");
                if (callDb != null)
                {
                    parameters["TargetComp"] = callDb.Attribute("comp")?.Value ?? "";
                    parameters["TargetPrg"] = callDb.Attribute("obj")?.Value ?? "";
                }

                // Count arguments
                var args = operation.Elements("Arg").Count();
                if (args > 0) parameters["ArgCount"] = args.ToString();
            }

            // Add link table info for LNK operations
            if (opName == "LNK")
            {
                var linkDb = operation.Element("DB");
                if (linkDb != null)
                {
                    parameters["TableComp"] = linkDb.Attribute("comp")?.Value ?? "";
                    parameters["TableId"] = linkDb.Attribute("obj")?.Value ?? "";
                }
            }

            // Add verify message for Verify operations
            if (opName == "Verify")
            {
                var msgAttr = operation.Attribute("Message");
                if (msgAttr != null)
                {
                    parameters["MessageExpr"] = msgAttr.Value;
                }
                var returnAttr = operation.Attribute("ReturnVariable");
                if (returnAttr != null)
                {
                    parameters["ReturnVar"] = returnAttr.Value;
                }
            }

            lines.Add(new MagicLogicLine
            {
                LineNumber = lineNum++,
                Operation = MapOperationName(opName),
                Condition = condition,
                IsDisabled = isDisabled,
                Parameters = parameters
            });
        }

        return lineNum;
    }

    private static string MapOperationName(string xmlName)
    {
        return xmlName switch
        {
            "DATAVIEW_SRC" => "Data View Source",
            "Select" => "Select",
            "Update" => "Update",
            "Call" => "Call Task",
            "LNK" => "Link",
            "END_LINK" => "End Link",
            "Remark" => "Remark",
            "Block" => "Block",
            "EndBlock" => "End Block",
            "Verify" => "Verify",
            "Evaluate" => "Evaluate",
            "Raise" => "Raise Event",
            "Action" => "Action",
            "Input" => "Input",
            "Output" => "Output",
            "Form" => "Form",
            "Browse" => "Browse",
            _ => xmlName
        };
    }

    private void ParseExpressions(XDocument doc, MagicProgram program)
    {
        // Find Expressions element
        var exprsElement = doc.Descendants("Expressions").FirstOrDefault();
        if (exprsElement == null) return;

        var expressions = exprsElement.Elements("Exp").ToList();
        int idePosition = 1;

        foreach (var expr in expressions)
        {
            var idAttr = expr.Attribute("id");
            if (idAttr == null || !int.TryParse(idAttr.Value, out int id)) continue;

            var content = expr.Value ?? "";
            var comment = expr.Attribute("Comment")?.Value;

            program.Expressions[id] = new MagicExpression
            {
                Id = id,
                IdePosition = idePosition++,
                Content = content,
                Comment = comment
            };
        }
    }

    private record ProgramHeader(int Id, string Name, string? PublicName)
    {
        public ProgramHeader() : this(0, "", null) { }
    }
}
