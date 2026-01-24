using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace MagicKnowledgeBase.Indexing;

/// <summary>
/// Parses Magic program XML files.
/// NOTE: Variables are stored with raw local indices (no offset applied).
/// OffsetCalculator in MagicMcp applies correct offset at display time.
/// </summary>
public partial class ProgramParser
{
    [GeneratedRegex(@"&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);|&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);")]
    private static partial Regex InvalidXmlEntityRegex();

    public ParsedProgram ParseProgram(string filePath, int xmlId, int idePosition, ProgramHeaderInfo? header, string projectName)
    {
        var doc = LoadXmlSafe(filePath);

        // BUG FIX: Read Public Name from XML if not in header (ProgramHeaders.xml incomplete)
        string? publicName = header?.PublicName;
        if (string.IsNullOrEmpty(publicName))
        {
            // Look for <Public val="..."/> in the XML
            publicName = doc.Descendants("Public").FirstOrDefault()?.Attribute("val")?.Value;
        }

        // BUG FIX: Read program Name from XML if not in header (ProgramHeaders.xml incomplete)
        // The name is in the first Task's Header Description attribute
        string name = header?.Name ?? $"Program_{xmlId}";
        if (header == null || string.IsNullOrEmpty(header.Name) || header.Name == $"Program_{xmlId}")
        {
            var firstTaskHeader = doc.Descendants("Task").FirstOrDefault()?.Element("Header");
            var descFromXml = firstTaskHeader?.Attribute("Description")?.Value;
            if (!string.IsNullOrEmpty(descFromXml))
            {
                name = descFromXml;
            }
        }

        var program = new ParsedProgram
        {
            XmlId = xmlId,
            IdePosition = idePosition,
            Name = name,
            PublicName = publicName,
            ProjectName = projectName
        };

        // Parse tasks
        ParseTasks(doc, program, idePosition, projectName);

        // Parse expressions
        ParseExpressions(doc, program);

        return program;
    }

    private void ParseTasks(XDocument doc, ParsedProgram program, int prgIdePosition, string projectName)
    {
        var allTasks = doc.Descendants("Task").ToList();
        var levelCounters = new Dictionary<int, int>();

        foreach (var taskElement in allTasks)
        {
            var headerElement = taskElement.Element("Header");
            if (headerElement == null) continue;

            var isn2Attr = headerElement.Attribute("ISN_2");
            if (isn2Attr == null || !int.TryParse(isn2Attr.Value, out int isn2)) continue;

            var description = headerElement.Attribute("Description")?.Value ?? "";
            var taskTypeElement = headerElement.Element("TaskType");
            var taskType = taskTypeElement?.Attribute("val")?.Value ?? "B";

            // Calculate level
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
                idePosition = prgIdePosition.ToString();
                levelCounters.Clear();
            }
            else
            {
                if (!levelCounters.ContainsKey(level))
                    levelCounters[level] = 0;
                levelCounters[level]++;

                var keysToRemove = levelCounters.Keys.Where(k => k > level).ToList();
                foreach (var k in keysToRemove)
                    levelCounters.Remove(k);

                idePosition = BuildIdePosition(prgIdePosition, levelCounters);
            }

            // Determine parent ISN_2
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

            // Parse DataView
            var (columns, mainSourceTableId, mainSourceAccess, tableUsages) = ParseDataView(taskElement);

            // Parse Logic
            var (logicLines, programCalls) = ParseLogicLines(taskElement, projectName);

            program.Tasks[isn2] = new ParsedTask
            {
                Isn2 = isn2,
                IdePosition = idePosition,
                Description = description,
                Level = level,
                ParentIsn2 = parentIsn2,
                TaskType = taskType,
                MainSourceTableId = mainSourceTableId,
                MainSourceAccess = mainSourceAccess,
                Columns = columns,
                LogicLines = logicLines,
                TableUsages = tableUsages,
                ProgramCalls = programCalls
            };
        }

        // NOTE: Offset is NOT applied at indexing time.
        // Variables are stored with raw LOCAL indices (A=0, B=1, C=2...).
        // OffsetCalculator (in MagicMcp) applies correct offset at display time.
    }

    private (List<ParsedColumn> columns, int? mainSourceTableId, string? mainSourceAccess, List<ParsedTableUsage> tableUsages) ParseDataView(XElement taskElement)
    {
        var columns = new List<ParsedColumn>();
        var tableUsages = new List<ParsedTableUsage>();
        int? mainSourceTableId = null;
        string? mainSourceAccess = null;

        var resourceElement = taskElement.Element("Resource");
        if (resourceElement == null) return (columns, mainSourceTableId, mainSourceAccess, tableUsages);

        // Parse DB elements (tables)
        var dbElements = resourceElement.Elements("DB").ToList();
        if (dbElements.Count > 0)
        {
            // First DB is main source
            var firstDb = dbElements[0];
            var dataObjElement = firstDb.Element("DataObject");
            if (dataObjElement != null)
            {
                var objAttr = dataObjElement.Attribute("obj");
                if (objAttr != null && int.TryParse(objAttr.Value, out int tableId))
                {
                    mainSourceTableId = tableId;
                    var accessElement = firstDb.Element("Access");
                    mainSourceAccess = accessElement?.Attribute("val")?.Value ?? "R";

                    tableUsages.Add(new ParsedTableUsage
                    {
                        TableId = tableId,
                        UsageType = mainSourceAccess switch
                        {
                            "W" => "WRITE",
                            "M" => "MODIFY",
                            "D" => "DELETE",
                            _ => "READ"
                        }
                    });
                }
            }

            // Additional DBs are links
            for (int i = 1; i < dbElements.Count; i++)
            {
                var dbElement = dbElements[i];
                var dataObj = dbElement.Element("DataObject");
                if (dataObj != null)
                {
                    var objAttr = dataObj.Attribute("obj");
                    if (objAttr != null && int.TryParse(objAttr.Value, out int tableId))
                    {
                        tableUsages.Add(new ParsedTableUsage
                        {
                            TableId = tableId,
                            UsageType = "LINK",
                            LinkNumber = i
                        });
                    }
                }
            }
        }

        // Parse columns
        var columnsElement = resourceElement.Element("Columns");
        if (columnsElement != null)
        {
            columns = ParseColumns(taskElement, columnsElement);
        }

        return (columns, mainSourceTableId, mainSourceAccess, tableUsages);
    }

    private List<ParsedColumn> ParseColumns(XElement taskElement, XElement columnsElement)
    {
        var columns = new List<ParsedColumn>();
        var columnElements = columnsElement.Elements("Column").ToList();

        // Parse remarks for interleaving
        var remarksByFlowIsn = ParseRemarksFlowIsn(taskElement);

        int dvLine = 1;
        for (int i = 0; i < columnElements.Count; i++)
        {
            var colElement = columnElements[i];
            var idAttr = colElement.Attribute("id");
            var nameAttr = colElement.Attribute("name");

            if (idAttr == null || !int.TryParse(idAttr.Value, out int xmlId)) continue;

            var propList = colElement.Element("PropertyList");
            var modelElement = propList?.Element("Model");
            var dataType = ParseFieldType(modelElement?.Attribute("attr_obj")?.Value);

            var pictureElement = propList?.Element("Picture");
            var picture = pictureElement?.Attribute("valUnicode")?.Value
                       ?? pictureElement?.Attribute("val")?.Value;

            var defElement = propList?.Element("Definition");
            var defVal = defElement?.Attribute("val")?.Value;

            var name = nameAttr?.Value ?? $"Col_{xmlId}";
            string definition;
            if (name.StartsWith(">") || name.StartsWith("&gt;") || name.StartsWith("<") || name.StartsWith("&lt;"))
            {
                definition = "P";
            }
            else if (defVal == "1")
            {
                definition = "R";
            }
            else
            {
                definition = "V";
            }

            columns.Add(new ParsedColumn
            {
                LineNumber = dvLine,
                XmlId = xmlId,
                Variable = IndexToVariable(i),
                Name = name,
                DataType = dataType,
                Picture = picture,
                Definition = definition
            });

            int currentPosition = dvLine;
            dvLine++;

            if (remarksByFlowIsn.TryGetValue(currentPosition, out var remarksAtPos))
            {
                dvLine += remarksAtPos;
            }
        }

        return columns;
    }

    private Dictionary<int, int> ParseRemarksFlowIsn(XElement taskElement)
    {
        var remarkCounts = new Dictionary<int, int>();

        var taskLogic = taskElement.Element("TaskLogic");
        if (taskLogic == null) return remarkCounts;

        var mainUnit = taskLogic.Elements("LogicUnit")
            .FirstOrDefault(u =>
            {
                var level = u.Element("Level")?.Attribute("val")?.Value;
                var type = u.Element("Type")?.Attribute("val")?.Value;
                return level == "R" && type == "M";
            }) ?? taskLogic.Elements("LogicUnit").FirstOrDefault();

        if (mainUnit == null) return remarkCounts;

        var logicLines = mainUnit.Element("LogicLines");
        if (logicLines == null) return remarkCounts;

        foreach (var logicLine in logicLines.Elements("LogicLine"))
        {
            var remarkEl = logicLine.Element("Remark");
            if (remarkEl == null) continue;

            var flowIsnAttr = remarkEl.Attribute("FlowIsn");
            if (flowIsnAttr == null || !int.TryParse(flowIsnAttr.Value, out int flowIsn)) continue;

            if (!remarkCounts.ContainsKey(flowIsn))
                remarkCounts[flowIsn] = 0;
            remarkCounts[flowIsn]++;
        }

        return remarkCounts;
    }

    private (List<ParsedLogicLine> lines, List<ParsedProgramCall> calls) ParseLogicLines(XElement taskElement, string projectName)
    {
        var lines = new List<ParsedLogicLine>();
        var calls = new List<ParsedProgramCall>();
        int lineNum = 1;

        var taskLogic = taskElement.Element("TaskLogic");
        if (taskLogic == null) return (lines, calls);

        foreach (var logicUnit in taskLogic.Elements("LogicUnit"))
        {
            var handlerType = GetHandlerType(logicUnit);
            var logicLinesElement = logicUnit.Element("LogicLines");
            if (logicLinesElement == null) continue;

            foreach (var logicLine in logicLinesElement.Elements("LogicLine"))
            {
                var operation = logicLine.Elements().FirstOrDefault();
                if (operation == null) continue;

                var opName = operation.Name.LocalName;
                var isDisabled = operation.Attribute("Disabled")?.Value == "1";

                var parameters = new Dictionary<string, string> { ["Handler"] = handlerType };
                foreach (var attr in operation.Attributes())
                {
                    if (attr.Name.LocalName != "Disabled")
                        parameters[attr.Name.LocalName] = attr.Value;
                }

                var conditionElement = operation.Element("Condition");
                var condition = conditionElement?.Attribute("val")?.Value;

                // BUG FIX: Extract CallTask info - XML uses <CallTask> with <TaskID> and <OperationType>
                if (opName == "CallTask")
                {
                    var opType = operation.Element("OperationType")?.Attribute("val")?.Value;
                    // P = Program call, T = SubTask call - only track program calls
                    if (opType == "P")
                    {
                        var taskId = operation.Element("TaskID");
                        if (taskId != null)
                        {
                            var compAttr = taskId.Attribute("comp")?.Value ?? "-1";
                            var objAttr = taskId.Attribute("obj")?.Value;

                            if (objAttr != null && int.TryParse(objAttr, out int targetPrgId))
                            {
                                // comp="-1" means same project, otherwise it's a component reference
                                var targetProject = compAttr == "-1" ? projectName : $"Comp{compAttr}";
                                // BUG FIX: XML uses <Argument> not <Arg>
                                var argCount = operation.Element("Arguments")?.Elements("Argument").Count() ?? 0;

                                calls.Add(new ParsedProgramCall
                                {
                                    LineNumber = lineNum,
                                    TargetProject = targetProject,
                                    TargetProgramXmlId = targetPrgId,
                                    ArgCount = argCount
                                });

                                parameters["TargetComp"] = targetProject;
                                parameters["TargetPrg"] = targetPrgId.ToString();
                                if (argCount > 0) parameters["ArgCount"] = argCount.ToString();
                            }
                        }
                    }
                }

                lines.Add(new ParsedLogicLine
                {
                    LineNumber = lineNum++,
                    Handler = handlerType,
                    Operation = MapOperationName(opName),
                    Condition = condition,
                    IsDisabled = isDisabled,
                    Parameters = parameters
                });
            }
        }

        return (lines, calls);
    }

    private static string GetHandlerType(XElement logicUnit)
    {
        var level = logicUnit.Element("Level")?.Attribute("val")?.Value ?? "R";
        var type = logicUnit.Element("Type")?.Attribute("val")?.Value ?? "M";

        return (level, type) switch
        {
            ("T", "P") => "TP",
            ("T", "S") => "TS",
            ("R", "P") => "RP",
            ("R", "M") => "RM",
            ("R", "S") => "RS",
            ("H", _) => "H",
            _ => $"{level}{type}"
        };
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

    private void ParseExpressions(XDocument doc, ParsedProgram program)
    {
        // BUG FIX: Parse ALL Expressions sections from ALL tasks, not just the first one
        // Each Task in Magic XML has its own <Expressions> section
        var allExpressionsElements = doc.Descendants("Expressions").ToList();
        if (allExpressionsElements.Count == 0) return;

        int globalIdePosition = 1;

        foreach (var exprsElement in allExpressionsElements)
        {
            var expressions = exprsElement.Elements("Expression").ToList();

            foreach (var expr in expressions)
            {
                var idAttr = expr.Attribute("id");
                if (idAttr == null || !int.TryParse(idAttr.Value, out int id)) continue;

                // Content is in <ExpSyntax val="..."/>
                var content = expr.Element("ExpSyntax")?.Attribute("val")?.Value ?? "";
                // Comment is in <Remark val="..."/>
                var comment = expr.Element("Remark")?.Attribute("val")?.Value;

                // Use a unique key combining task context to avoid collisions
                // The XML id might repeat across tasks, so we use globalIdePosition as unique key
                var uniqueKey = globalIdePosition;

                program.Expressions[uniqueKey] = new ParsedExpression
                {
                    Id = id,
                    IdePosition = globalIdePosition++,
                    Content = content,
                    Comment = comment
                };
            }
        }
    }

    private static string BuildIdePosition(int prgPosition, Dictionary<int, int> levelCounters)
    {
        var parts = new List<string> { prgPosition.ToString() };
        foreach (var level in levelCounters.Keys.OrderBy(k => k))
        {
            parts.Add(levelCounters[level].ToString());
        }
        return string.Join(".", parts);
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

    private static XDocument LoadXmlSafe(string path)
    {
        var content = File.ReadAllText(path, Encoding.UTF8);
        var cleanContent = InvalidXmlEntityRegex().Replace(content, "");
        return XDocument.Parse(cleanContent);
    }

    public static string IndexToVariable(int index)
    {
        if (index < 0) return "?";
        if (index < 26)
            return ((char)('A' + index)).ToString();

        int first = index / 26;
        int second = index % 26;
        return $"{(char)('A' + first)}{(char)('A' + second)}";
    }

    public static int VariableToIndex(string variable)
    {
        if (string.IsNullOrEmpty(variable)) return -1;
        variable = variable.ToUpperInvariant();

        if (variable.Length == 1)
        {
            return variable[0] - 'A';
        }
        else if (variable.Length == 2)
        {
            int first = variable[0] - 'A';
            int second = variable[1] - 'A';
            return first * 26 + second;
        }

        return -1;
    }
}

// ============================================================================
// PARSED MODELS
// ============================================================================

public record ParsedProgram
{
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public required string Name { get; init; }
    public string? PublicName { get; init; }
    public required string ProjectName { get; init; }
    public Dictionary<int, ParsedTask> Tasks { get; } = new();
    public Dictionary<int, ParsedExpression> Expressions { get; } = new();
}

public record ParsedTask
{
    public int Isn2 { get; init; }
    public required string IdePosition { get; init; }
    public required string Description { get; init; }
    public int Level { get; init; }
    public int? ParentIsn2 { get; init; }
    public string TaskType { get; init; } = "B";
    public int? MainSourceTableId { get; init; }
    public string? MainSourceAccess { get; init; }
    public List<ParsedColumn> Columns { get; init; } = new();
    public List<ParsedLogicLine> LogicLines { get; init; } = new();
    public List<ParsedTableUsage> TableUsages { get; init; } = new();
    public List<ParsedProgramCall> ProgramCalls { get; init; } = new();
}

public record ParsedColumn
{
    public int LineNumber { get; init; }
    public int XmlId { get; init; }
    public required string Variable { get; init; }
    public required string Name { get; init; }
    public required string DataType { get; init; }
    public string? Picture { get; init; }
    public required string Definition { get; init; }
    public string? Source { get; init; }
    public int? SourceColumnNumber { get; init; }
    public int? LocateExpressionId { get; init; }
}

public record ParsedLogicLine
{
    public int LineNumber { get; init; }
    public required string Handler { get; init; }
    public required string Operation { get; init; }
    public string? Condition { get; init; }
    public bool IsDisabled { get; init; }
    public Dictionary<string, string>? Parameters { get; init; }
}

public record ParsedTableUsage
{
    public int TableId { get; init; }
    public string? TableName { get; init; }
    public required string UsageType { get; init; }
    public int? LinkNumber { get; init; }
}

public record ParsedProgramCall
{
    public int LineNumber { get; init; }
    public required string TargetProject { get; init; }
    public int TargetProgramXmlId { get; init; }
    public int ArgCount { get; init; }
}

public record ParsedExpression
{
    public int Id { get; init; }
    public int IdePosition { get; init; }
    public required string Content { get; init; }
    public string? Comment { get; init; }
}
