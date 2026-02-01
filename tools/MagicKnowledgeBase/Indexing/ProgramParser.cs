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

    /// <summary>
    /// Pattern to detect ProgIdx('program_name') dynamic calls in expressions
    /// </summary>
    [GeneratedRegex(@"ProgIdx\s*\(\s*['""]([^'""]+)['""]", RegexOptions.IgnoreCase)]
    private static partial Regex ProgIdxPattern();

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

        // V9: Parse program metadata
        program.Metadata = ParseProgramMetadata(doc);

        // Parse tasks
        ParseTasks(doc, program, idePosition, projectName);

        // Parse expressions and dynamic calls
        ParseExpressions(doc, program);

        // Detect ProgIdx() calls in expressions
        DetectDynamicCalls(program);

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

            // Parse TaskForms (UI screens)
            var forms = ParseTaskForms(taskElement);

            // V9: Parse extended task properties
            var parameters = ParseTaskParameters(taskElement);
            var information = ParseTaskInformation(taskElement);
            var properties = ParseTaskProperties(taskElement);
            var permissions = ParseTaskPermissions(taskElement);
            var eventHandlers = ParseEventHandlers(taskElement);
            var fieldRanges = ParseFieldRanges(taskElement);

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
                ProgramCalls = programCalls,
                Forms = forms,
                // V9 properties
                Parameters = parameters,
                Information = information,
                Properties = properties,
                Permissions = permissions,
                EventHandlers = eventHandlers,
                FieldRanges = fieldRanges
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

            // Extract GUI control types (Schema v8)
            var guiControlType = ExtractGuiControlType(propList?.Element("GuiDisplay"));
            var guiTableControlType = ExtractGuiControlType(propList?.Element("GuiDisplayTable"));

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
                Definition = definition,
                GuiControlType = guiControlType,
                GuiTableControlType = guiTableControlType
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

    /// <summary>
    /// Extract GUI control type from GuiDisplay or GuiDisplayTable element.
    /// Converts CTRL_GUI0_EDIT -> EDIT, CTRL_GUI0_COMBO -> COMBO, etc.
    /// </summary>
    private static string? ExtractGuiControlType(XElement? guiElement)
    {
        if (guiElement == null) return null;

        var propList = guiElement.Element("PropertyList");
        if (propList == null) return null;

        var model = propList.Attribute("model")?.Value;
        if (string.IsNullOrEmpty(model)) return null;

        // Convert CTRL_GUI0_EDIT -> EDIT, CTRL_GUI0_TABLE -> TABLE, etc.
        return model switch
        {
            "CTRL_GUI0_EDIT" => "EDIT",
            "CTRL_GUI0_TABLE" => "TABLE",
            "CTRL_GUI0_COMBO" => "COMBO",
            "CTRL_GUI0_LISTBOX" => "LISTBOX",
            "CTRL_GUI0_CHECKBOX" => "CHECKBOX",
            "CTRL_GUI0_RADIO" => "RADIO",
            "CTRL_GUI0_BUTTON" => "BUTTON",
            "CTRL_GUI0_LABEL" => "LABEL",
            "CTRL_GUI0_IMAGE" => "IMAGE",
            "CTRL_GUI0_BROWSER" => "BROWSER",
            "CTRL_GUI0_SUBFORM" => "SUBFORM",
            "CTRL_GUI0_FRAME" => "FRAME",
            "CTRL_GUI0_GROUP" => "GROUP",
            "CTRL_GUI0_TAB" => "TAB",
            "CTRL_GUI0_TREE" => "TREE",
            "CTRL_GUI0_RICH_EDIT" => "RICH_EDIT",
            "CTRL_GUI0_RICH_TEXT" => "RICH_TEXT",
            "CTRL_GUI0_LINE" => "LINE",
            "CTRL_GUI0_DOTNET" => "DOTNET",
            _ when model.StartsWith("CTRL_GUI0_") => model[10..], // Strip prefix for unknown types
            _ => model // Return as-is if no prefix
        };
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

    private List<ParsedTaskForm> ParseTaskForms(XElement taskElement)
    {
        var forms = new List<ParsedTaskForm>();

        var taskFormsElement = taskElement.Element("TaskForms");
        if (taskFormsElement == null) return forms;

        foreach (var formEntry in taskFormsElement.Elements("FormEntry"))
        {
            var idAttr = formEntry.Attribute("id");
            if (idAttr == null || !int.TryParse(idAttr.Value, out int formId)) continue;

            var propList = formEntry.Element("PropertyList");
            if (propList == null) continue;

            // Helper: get property element by id
            XElement? GetProp(string pid) => propList.Elements().FirstOrDefault(e => e.Attribute("id")?.Value == pid);
            string? GetPropVal(string pid) => GetProp(pid)?.Attribute("val")?.Value;
            string? GetPropUnicode(string pid) => GetProp(pid)?.Attribute("valUnicode")?.Value ?? GetPropVal(pid);
            bool HasProp(string pid) => GetProp(pid) != null;

            var formName = GetPropUnicode("311");
            int? windowType = ParseInt(GetPropVal("358"));
            int? posX = ParseInt(GetPropVal("21") ?? propList.Element("X")?.Attribute("val")?.Value);
            int? posY = ParseInt(GetPropVal("22") ?? propList.Element("Y")?.Attribute("val")?.Value);
            int? width = ParseInt(GetPropVal("23") ?? propList.Element("Width")?.Attribute("val")?.Value);
            int? height = ParseInt(GetPropVal("24") ?? propList.Element("Height")?.Attribute("val")?.Value);
            var font = GetPropVal("50") ?? GetPropVal("330");
            int? formUnits = ParseInt(GetPropVal("33"));
            int? hFactor = ParseInt(GetPropVal("35"));
            int? vFactor = ParseInt(GetPropVal("34"));
            int? color = ParseInt(GetPropVal("51"));
            bool systemMenu = HasProp("27");
            bool minimizeBox = HasProp("28");
            bool maximizeBox = HasProp("29");

            // Collect ALL remaining properties as JSON
            var extraProps = new Dictionary<string, object>();
            var knownFormIds = new HashSet<string> { "21", "22", "23", "24", "27", "28", "29", "33", "34", "35", "50", "51", "311", "330", "358" };
            foreach (var prop in propList.Elements())
            {
                var pid = prop.Attribute("id")?.Value;
                if (pid == null || knownFormIds.Contains(pid)) continue;
                var val = prop.Attribute("valUnicode")?.Value ?? prop.Attribute("val")?.Value;
                if (val != null)
                    extraProps[prop.Name.LocalName + "_" + pid] = val;
                else
                    extraProps[prop.Name.LocalName + "_" + pid] = true;
            }
            string? propsJson = extraProps.Count > 0
                ? System.Text.Json.JsonSerializer.Serialize(extraProps)
                : null;

            var controls = ParseFormControls(formEntry);

            forms.Add(new ParsedTaskForm
            {
                FormEntryId = formId,
                FormName = formName,
                PositionX = posX,
                PositionY = posY,
                Width = width,
                Height = height,
                WindowType = windowType,
                Font = font,
                FormUnits = formUnits,
                HFactor = hFactor,
                VFactor = vFactor,
                Color = color,
                SystemMenu = systemMenu,
                MinimizeBox = minimizeBox,
                MaximizeBox = maximizeBox,
                PropertiesJson = propsJson,
                Controls = controls
            });
        }

        return forms;
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

                                // V9: Parse call arguments
                                var arguments = ParseCallArguments(operation);

                                calls.Add(new ParsedProgramCall
                                {
                                    LineNumber = lineNum,
                                    TargetProject = targetProject,
                                    TargetProgramXmlId = targetPrgId,
                                    ArgCount = argCount,
                                    Arguments = arguments
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

    /// <summary>
    /// Detect ProgIdx() dynamic calls in expressions
    /// </summary>
    private void DetectDynamicCalls(ParsedProgram program)
    {
        foreach (var (exprKey, expr) in program.Expressions)
        {
            var matches = ProgIdxPattern().Matches(expr.Content);
            foreach (Match match in matches)
            {
                var targetPublicName = match.Groups[1].Value;
                program.DynamicCalls.Add(new ParsedDynamicCall
                {
                    ExpressionIdePosition = expr.IdePosition,
                    TargetPublicName = targetPublicName,
                    FullMatch = match.Value
                });
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

    // ========================================================================
    // V9 PARSING METHODS - Extended XML Enrichment
    // ========================================================================

    /// <summary>V9: Parse program-level metadata from XML</summary>
    private ParsedProgramMetadata ParseProgramMetadata(XDocument doc)
    {
        var firstTask = doc.Descendants("Task").FirstOrDefault();
        var header = firstTask?.Element("Header");

        return new ParsedProgramMetadata
        {
            TaskType = header?.Element("TaskType")?.Attribute("val")?.Value,
            LastModifiedDate = header?.Attribute("Date")?.Value,
            LastModifiedTime = header?.Attribute("Time")?.Value,
            ExecutionRight = ParseInt(header?.Attribute("ExRight")?.Value),
            IsResident = header?.Attribute("Resident")?.Value == "Y",
            IsSql = header?.Attribute("SQL")?.Value == "Y",
            IsExternal = header?.Attribute("External")?.Value == "Y",
            FormType = header?.Attribute("FormType")?.Value,
            HasDotNet = header?.Attribute("DotNet")?.Value == "Y",
            HasSqlWhere = header?.Attribute("SQLWhere")?.Value == "Y",
            IsMainProgram = header?.Attribute("MainPrg")?.Value == "Y",
            LastIsn = ParseInt(header?.Attribute("LastISN")?.Value)
        };
    }

    /// <summary>V9: Parse task parameters (MgAttr types)</summary>
    private List<ParsedTaskParameter> ParseTaskParameters(XElement taskElement)
    {
        var parameters = new List<ParsedTaskParameter>();
        // ParametersAttributes is inside Header > ReturnValue
        var header = taskElement.Element("Header");
        var returnValue = header?.Element("ReturnValue");
        var paramsAttrs = returnValue?.Element("ParametersAttributes");
        if (paramsAttrs == null) return parameters;

        int position = 1;
        foreach (var attr in paramsAttrs.Elements("Attr"))
        {
            var mgAttr = attr.Attribute("MgAttr")?.Value;
            if (!string.IsNullOrEmpty(mgAttr))
            {
                parameters.Add(new ParsedTaskParameter
                {
                    Position = position++,
                    MgAttr = mgAttr,
                    IsOutput = attr.Attribute("TSK_PARAMS")?.Value == "Y"
                });
            }
        }
        return parameters;
    }

    /// <summary>V9: Parse task information block</summary>
    private ParsedTaskInformation? ParseTaskInformation(XElement taskElement)
    {
        var info = taskElement.Element("Information");
        if (info == null) return null;

        return new ParsedTaskInformation
        {
            InitialMode = info.Element("InitialMode")?.Attribute("val")?.Value,
            EndTaskConditionExpr = ParseInt(info.Element("EndTaskCondition")?.Attribute("val")?.Value),
            EvaluateEndCondition = info.Element("EVL_END_CND")?.Attribute("val")?.Value,
            ForceRecordDelete = info.Element("DEL")?.Attribute("val")?.Value,
            MainDbComponent = ParseInt(info.Element("DB")?.Attribute("comp")?.Value),
            KeyMode = info.Element("Key")?.Element("Mode")?.Attribute("val")?.Value,
            RangeDirection = info.Element("RngDIR")?.Attribute("val")?.Value,
            LocateDirection = info.Element("LocDIR")?.Attribute("val")?.Value,
            SortCls = info.Element("SortCLS")?.Attribute("val")?.Value,
            BoxBottom = ParseInt(info.Element("BoxBottom")?.Attribute("val")?.Value),
            BoxRight = ParseInt(info.Element("BoxRight")?.Attribute("val")?.Value),
            BoxDirection = info.Element("BoxDirection")?.Attribute("val")?.Value,
            OpenTaskWindow = info.Element("WIN")?.Element("OpenTaskWindow")?.Attribute("val")?.Value
        };
    }

    /// <summary>V9: Parse task properties block</summary>
    private ParsedTaskProperties? ParseTaskProperties(XElement taskElement)
    {
        var props = taskElement.Element("TaskProperties");
        if (props == null) return null;

        return new ParsedTaskProperties
        {
            TransactionMode = props.Element("TransactionMode")?.Attribute("val")?.Value,
            TransactionBegin = props.Element("TransactionBegin")?.Attribute("val")?.Value,
            LockingStrategy = props.Element("LockingStrategy")?.Attribute("val")?.Value,
            CacheStrategy = props.Element("CacheStrategy")?.Attribute("val")?.Value,
            ErrorStrategy = props.Element("ErrorStrategy")?.Attribute("val")?.Value,
            ConfirmUpdate = props.Element("ConfirmUpdate")?.Attribute("val")?.Value,
            ConfirmCancel = props.Element("ConfirmCancel")?.Attribute("val")?.Value,
            AllowEmptyDataview = props.Element("AllowEmptyDataview")?.Attribute("val")?.Value != "N",
            PreloadView = props.Element("PreloadView")?.Attribute("val")?.Value == "Y",
            SelectionTable = ParseInt(props.Element("SelectionTable")?.Attribute("val")?.Value),
            ForceRecordSuffix = props.Element("ForceRecordSuffix")?.Attribute("val")?.Value,
            KeepCreatedContext = props.Element("KeepCreatedContext")?.Attribute("val")?.Value
        };
    }

    /// <summary>V9: Parse task permissions (SIDE_WIN block)</summary>
    private ParsedTaskPermissions? ParseTaskPermissions(XElement taskElement)
    {
        var sideWin = taskElement.Element("SIDE_WIN");
        if (sideWin == null) return null;

        return new ParsedTaskPermissions
        {
            AllowCreate = sideWin.Element("AllowCreate")?.Attribute("val")?.Value != "N",
            AllowDelete = sideWin.Element("AllowDelete")?.Attribute("val")?.Value != "N",
            AllowModify = sideWin.Element("AllowModify")?.Attribute("val")?.Value != "N",
            AllowQuery = sideWin.Element("AllowQuery")?.Attribute("val")?.Value != "N",
            AllowLocate = sideWin.Element("AllowLocate")?.Attribute("val")?.Value != "N",
            AllowRange = sideWin.Element("AllowRange")?.Attribute("val")?.Value != "N",
            AllowSorting = sideWin.Element("AllowSorting")?.Attribute("val")?.Value != "N",
            AllowEvents = sideWin.Element("AllowEvents")?.Attribute("val")?.Value != "N",
            AllowIndexChange = sideWin.Element("AllowIndexChange")?.Attribute("val")?.Value != "N",
            AllowIndexOptimization = sideWin.Element("AllowIndexOptimization")?.Attribute("val")?.Value != "N",
            AllowIoFiles = sideWin.Element("AllowIOFiles")?.Attribute("val")?.Value != "N",
            AllowLocationInQuery = sideWin.Element("AllowLocationInQuery")?.Attribute("val")?.Value != "N",
            AllowOptions = sideWin.Element("AllowOptions")?.Attribute("val")?.Value != "N",
            AllowPrintingData = sideWin.Element("AllowPrintingData")?.Attribute("val")?.Value != "N",
            RecordCycle = sideWin.Element("RecordCycle")?.Attribute("val")?.Value
        };
    }

    /// <summary>V9: Parse event handlers (EVNT elements)</summary>
    private List<ParsedEventHandler> ParseEventHandlers(XElement taskElement)
    {
        var handlers = new List<ParsedEventHandler>();
        foreach (var evnt in taskElement.Elements("EVNT"))
        {
            var idAttr = evnt.Attribute("id");
            if (idAttr == null || !int.TryParse(idAttr.Value, out int eventId)) continue;

            var eventEl = evnt.Element("Event");
            handlers.Add(new ParsedEventHandler
            {
                EventId = eventId,
                Description = evnt.Attribute("DESC")?.Value,
                ForceExit = evnt.Attribute("FORCE_EXIT")?.Value,
                EventType = eventEl?.Element("EventType")?.Attribute("val")?.Value,
                PublicObjectComp = eventEl?.Element("PublicObject")?.Attribute("comp")?.Value,
                PublicObjectObj = ParseInt(eventEl?.Element("PublicObject")?.Attribute("obj")?.Value)
            });
        }
        return handlers;
    }

    /// <summary>V9: Parse field ranges (FLD_RNG elements)</summary>
    private List<ParsedFieldRange> ParseFieldRanges(XElement taskElement)
    {
        var ranges = new List<ParsedFieldRange>();
        foreach (var fldRng in taskElement.Elements("FLD_RNG"))
        {
            var idEl = fldRng.Element("id");
            if (idEl == null || !int.TryParse(idEl.Attribute("val")?.Value, out int rangeId)) continue;

            ranges.Add(new ParsedFieldRange
            {
                RangeId = rangeId,
                ColumnObj = ParseInt(fldRng.Element("_Column")?.Attribute("obj")?.Value),
                MinExpr = ParseInt(fldRng.Element("MIN")?.Attribute("val")?.Value),
                MaxExpr = ParseInt(fldRng.Element("MAX")?.Attribute("val")?.Value)
            });
        }
        return ranges;
    }

    /// <summary>V9: Parse call arguments from CallTask</summary>
    private List<ParsedCallArgument> ParseCallArguments(XElement callTaskElement)
    {
        var arguments = new List<ParsedCallArgument>();
        var argsElement = callTaskElement.Element("Arguments");
        if (argsElement == null) return arguments;

        int position = 1;
        foreach (var arg in argsElement.Elements("Argument"))
        {
            arguments.Add(new ParsedCallArgument
            {
                Position = position++,
                ArgId = ParseInt(arg.Attribute("id")?.Value),
                VariableRef = arg.Element("Variable")?.Attribute("val")?.Value,
                ExpressionRef = ParseInt(arg.Element("Expression")?.Attribute("val")?.Value),
                Skip = arg.Element("Skip")?.Attribute("val")?.Value == "Y",
                IsParent = arg.Element("Parent")?.Attribute("val")?.Value == "Y"
            });
        }
        return arguments;
    }

    /// <summary>V9+: Parse form controls with ALL XML properties</summary>
    private List<ParsedFormControl> ParseFormControls(XElement formEntry)
    {
        var controls = new List<ParsedFormControl>();
        // Controls are direct children of FormEntry (not inside a wrapper element)
        var controlElements = formEntry.Elements("Control");
        if (!controlElements.Any()) return controls;

        foreach (var ctrl in controlElements)
        {
            var idAttr = ctrl.Attribute("id");
            if (idAttr == null || !int.TryParse(idAttr.Value, out int ctrlId)) continue;

            var propList = ctrl.Element("PropertyList");
            if (propList == null) continue;

            // Helper: get property by id
            XElement? CP(string pid) => propList.Elements().FirstOrDefault(e => e.Attribute("id")?.Value == pid);
            string? CPVal(string pid) => CP(pid)?.Attribute("val")?.Value;
            string? CPUni(string pid) => CP(pid)?.Attribute("valUnicode")?.Value ?? CPVal(pid);

            // Control type: strip CTRL_GUI0_ and CTRL_GUI1_ prefixes
            var rawModel = propList.Attribute("model")?.Value ?? "";
            var controlType = rawModel.Replace("CTRL_GUI0_", "").Replace("CTRL_GUI1_", "");

            // Control name: id=46 (ControlName), or id=311, or xml attribute
            var controlName = CPVal("46") ?? CPVal("311")
                ?? ctrl.Attribute("name")?.Value;

            // ISN_FATHER for parent-child (table columns)
            int? parentId = null;
            if (ctrl.Attribute("ISN_FATHER")?.Value is string fatherVal && int.TryParse(fatherVal, out int fId))
                parentId = fId;

            // Position and size
            int? x = ParseInt(CPVal("21") ?? propList.Element("X")?.Attribute("val")?.Value);
            int? y = ParseInt(CPVal("22") ?? propList.Element("Y")?.Attribute("val")?.Value);
            int? w = ParseInt(CPVal("23") ?? propList.Element("Width")?.Attribute("val")?.Value);
            int? h = ParseInt(CPVal("24") ?? propList.Element("Height")?.Attribute("val")?.Value);

            // Visibility and Enabled (can be flag, val, or expression)
            var visEl = CP("61");
            bool visible = visEl == null || visEl.Attribute("val")?.Value != "N";
            int? visibleExpr = ParseInt(visEl?.Attribute("Exp")?.Value);

            var enEl = CP("62");
            bool enabled = enEl == null || enEl.Attribute("val")?.Value != "N";
            int? enabledExpr = ParseInt(enEl?.Attribute("Exp")?.Value);

            // Data binding (id=43)
            var dataEl = CP("43");
            int? dataFieldId = ParseInt(dataEl?.Attribute("FieldID")?.Value);
            int? dataExprId = ParseInt(dataEl?.Attribute("Exp")?.Value);

            // RaiseEvent (id=234)
            var raiseEl = CP("234");
            string? raiseEventType = null;
            int? raiseEventId = null;
            if (raiseEl != null)
            {
                raiseEventType = raiseEl.Element("EventType")?.Attribute("val")?.Value;
                raiseEventId = ParseInt(raiseEl.Element("InternalEventID")?.Attribute("val")?.Value);
            }

            // Text properties
            var text = CPUni("19") ?? CPUni("45");
            var format = CPUni("82");
            var imageFile = CPVal("88");
            var itemsList = CPUni("45");
            var columnTitle = CPUni("139");

            // Style, color, font
            int? style = ParseInt(CPVal("63"));
            int? color = ParseInt(CPVal("51"));
            int? fontId = ParseInt(CPVal("50"));

            // Table properties
            int? controlLayer = ParseInt(CPVal("25"));
            int? titleHeight = ParseInt(CPVal("79"));
            int? rowHeight = ParseInt(CPVal("80"));
            int? elements = ParseInt(CPVal("81"));
            int? hAlignment = ParseInt(CPVal("65"));
            int? tabOrder = ParseInt(CPVal("314"));
            bool allowParking = CPVal("315") == "Y";

            // LinkedFieldId / LinkedVariable from control-level elements
            int? linkedFieldId = ParseInt(ctrl.Element("FieldID")?.Attribute("val")?.Value) ?? dataFieldId;
            var linkedVariable = ctrl.Element("Variable")?.Attribute("val")?.Value;

            // Collect ALL remaining properties as JSON
            var extraProps = new Dictionary<string, object>();
            var knownCtrlIds = new HashSet<string> {
                "19", "21", "22", "23", "24", "25", "43", "45", "46", "50", "51",
                "61", "62", "63", "65", "79", "80", "81", "82", "88", "139",
                "234", "311", "314", "315"
            };
            foreach (var prop in propList.Elements())
            {
                var pid = prop.Attribute("id")?.Value;
                if (pid == null || knownCtrlIds.Contains(pid)) continue;
                // Special handling for Model element
                if (prop.Name.LocalName == "Model")
                {
                    var modelId = prop.Attribute("ID")?.Value;
                    if (modelId != null) extraProps["Model"] = modelId;
                    continue;
                }
                var val = prop.Attribute("valUnicode")?.Value ?? prop.Attribute("val")?.Value;
                if (val != null)
                    extraProps[prop.Name.LocalName + "_" + pid] = val;
                else
                    extraProps[prop.Name.LocalName + "_" + pid] = true;
            }
            string? propsJson = extraProps.Count > 0
                ? System.Text.Json.JsonSerializer.Serialize(extraProps)
                : null;

            controls.Add(new ParsedFormControl
            {
                ControlId = ctrlId,
                ControlType = controlType,
                ControlName = controlName,
                X = x,
                Y = y,
                Width = w,
                Height = h,
                Visible = visible,
                Enabled = enabled,
                TabOrder = tabOrder,
                LinkedFieldId = linkedFieldId,
                LinkedVariable = linkedVariable,
                ParentId = parentId,
                Style = style,
                Color = color,
                FontId = fontId,
                Text = text,
                Format = format,
                DataFieldId = dataFieldId,
                DataExpressionId = dataExprId,
                RaiseEventType = raiseEventType,
                RaiseEventId = raiseEventId,
                ImageFile = imageFile,
                ItemsList = itemsList,
                ColumnTitle = columnTitle,
                ControlLayer = controlLayer,
                HAlignment = hAlignment,
                TitleHeight = titleHeight,
                RowHeight = rowHeight,
                Elements = elements,
                AllowParking = allowParking,
                VisibleExpression = visibleExpr,
                EnabledExpression = enabledExpr,
                PropertiesJson = propsJson
            });
        }
        return controls;
    }

    private static int? ParseInt(string? value)
    {
        if (string.IsNullOrEmpty(value)) return null;
        return int.TryParse(value, out int result) ? result : null;
    }

    // ========================================================================
    // END V9 PARSING METHODS
    // ========================================================================

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
    /// <summary>
    /// Dynamic calls detected via ProgIdx() in expressions
    /// </summary>
    public List<ParsedDynamicCall> DynamicCalls { get; } = new();
    /// <summary>V9: Extended program metadata from XML Header</summary>
    public ParsedProgramMetadata? Metadata { get; set; }
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
    public List<ParsedTaskForm> Forms { get; init; } = new();
    // V9: Extended task properties
    public List<ParsedTaskParameter> Parameters { get; init; } = new();
    public ParsedTaskInformation? Information { get; init; }
    public ParsedTaskProperties? Properties { get; init; }
    public ParsedTaskPermissions? Permissions { get; init; }
    public List<ParsedEventHandler> EventHandlers { get; init; } = new();
    public List<ParsedFieldRange> FieldRanges { get; init; } = new();
    public List<ParsedSelectDefinition> SelectDefinitions { get; init; } = new();
    public List<ParsedUpdateOperation> UpdateOperations { get; init; } = new();
    public List<ParsedLinkOperation> LinkOperations { get; init; } = new();
    public List<ParsedStopOperation> StopOperations { get; init; } = new();
    public List<ParsedRaiseEventOperation> RaiseEventOperations { get; init; } = new();
    public List<ParsedBlockOperation> BlockOperations { get; init; } = new();
    public List<ParsedEvaluateOperation> EvaluateOperations { get; init; } = new();
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
    /// <summary>GUI control type for form display (EDIT, COMBO, CHECKBOX, etc.)</summary>
    public string? GuiControlType { get; init; }
    /// <summary>GUI control type when displayed in a table/grid</summary>
    public string? GuiTableControlType { get; init; }
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
    // V9: Call arguments details
    public List<ParsedCallArgument> Arguments { get; init; } = new();
}

public record ParsedExpression
{
    public int Id { get; init; }
    public int IdePosition { get; init; }
    public required string Content { get; init; }
    public string? Comment { get; init; }
}

public record ParsedTaskForm
{
    public int FormEntryId { get; init; }
    public string? FormName { get; init; }
    public int? PositionX { get; init; }
    public int? PositionY { get; init; }
    public int? Width { get; init; }
    public int? Height { get; init; }
    public int? WindowType { get; init; }
    public string? Font { get; init; }
    public int? FormUnits { get; init; }
    public int? HFactor { get; init; }
    public int? VFactor { get; init; }
    public int? Color { get; init; }
    public bool SystemMenu { get; init; }
    public bool MinimizeBox { get; init; }
    public bool MaximizeBox { get; init; }
    public string? PropertiesJson { get; init; }
    public List<ParsedFormControl> Controls { get; init; } = new();
}

/// <summary>
/// A dynamic program call detected via ProgIdx() in an expression
/// </summary>
public record ParsedDynamicCall
{
    /// <summary>Expression IDE position where ProgIdx was found</summary>
    public int ExpressionIdePosition { get; init; }
    /// <summary>Target program PublicName from ProgIdx('name')</summary>
    public required string TargetPublicName { get; init; }
    /// <summary>Full match string (e.g., "ProgIdx('EXTRAIT_COMPTE')")</summary>
    public required string FullMatch { get; init; }
}

// ============================================================================
// V9 MODELS - Extended XML Enrichment
// ============================================================================

public record ParsedProgramMetadata
{
    public string? TaskType { get; init; }           // O=Online, B=Batch, R=Rich Client
    public string? LastModifiedDate { get; init; }   // DD/MM/YYYY
    public string? LastModifiedTime { get; init; }   // HH:MM:SS
    public int? ExecutionRight { get; init; }
    public bool IsResident { get; init; }
    public bool IsSql { get; init; }
    public bool IsExternal { get; init; }
    public string? FormType { get; init; }
    public bool HasDotNet { get; init; }
    public bool HasSqlWhere { get; init; }
    public bool IsMainProgram { get; init; }
    public int? LastIsn { get; init; }
}

public record ParsedTaskParameter
{
    public int Position { get; init; }
    public required string MgAttr { get; init; }     // A=Alpha, N=Numeric, D=Date, L=Logical, T=Time, B=Blob
    public bool IsOutput { get; init; }
}

public record ParsedTaskInformation
{
    public string? InitialMode { get; init; }
    public int? EndTaskConditionExpr { get; init; }
    public string? EvaluateEndCondition { get; init; }
    public string? ForceRecordDelete { get; init; }
    public int? MainDbComponent { get; init; }
    public string? KeyMode { get; init; }
    public string? RangeDirection { get; init; }
    public string? LocateDirection { get; init; }
    public string? SortCls { get; init; }
    public int? BoxBottom { get; init; }
    public int? BoxRight { get; init; }
    public string? BoxDirection { get; init; }
    public string? OpenTaskWindow { get; init; }
}

public record ParsedTaskProperties
{
    public string? TransactionMode { get; init; }
    public string? TransactionBegin { get; init; }
    public string? LockingStrategy { get; init; }
    public string? CacheStrategy { get; init; }
    public string? ErrorStrategy { get; init; }
    public string? ConfirmUpdate { get; init; }
    public string? ConfirmCancel { get; init; }
    public bool AllowEmptyDataview { get; init; } = true;
    public bool PreloadView { get; init; }
    public int? SelectionTable { get; init; }
    public string? ForceRecordSuffix { get; init; }
    public string? KeepCreatedContext { get; init; }
}

public record ParsedTaskPermissions
{
    public bool AllowCreate { get; init; } = true;
    public bool AllowDelete { get; init; } = true;
    public bool AllowModify { get; init; } = true;
    public bool AllowQuery { get; init; } = true;
    public bool AllowLocate { get; init; } = true;
    public bool AllowRange { get; init; } = true;
    public bool AllowSorting { get; init; } = true;
    public bool AllowEvents { get; init; } = true;
    public bool AllowIndexChange { get; init; } = true;
    public bool AllowIndexOptimization { get; init; } = true;
    public bool AllowIoFiles { get; init; } = true;
    public bool AllowLocationInQuery { get; init; } = true;
    public bool AllowOptions { get; init; } = true;
    public bool AllowPrintingData { get; init; } = true;
    public string? RecordCycle { get; init; }
}

public record ParsedCallArgument
{
    public int Position { get; init; }
    public int? ArgId { get; init; }
    public string? VariableRef { get; init; }        // {0,N} or {32768,N}
    public int? ExpressionRef { get; init; }
    public bool Skip { get; init; }
    public bool IsParent { get; init; }
}

public record ParsedSelectDefinition
{
    public int FieldId { get; init; }
    public int? SelectId { get; init; }
    public int? ColumnRef { get; init; }
    public string? SelectType { get; init; }         // V=Virtual, P=Parameter, R=Real, C=Control
    public bool IsParameter { get; init; }
    public int? AssignmentExpr { get; init; }
    public string? DiffUpdate { get; init; }
    public int? LocateMinExpr { get; init; }
    public int? LocateMaxExpr { get; init; }
    public bool PartOfDataview { get; init; } = true;
    public string? RealVarName { get; init; }
    public int? ControlIndex { get; init; }
    public int? FormIndex { get; init; }
    public int? TabbingOrder { get; init; }
    public int? RecomputeIndex { get; init; }
}

public record ParsedUpdateOperation
{
    public int LineNumber { get; init; }
    public int FieldId { get; init; }
    public int? WithValueExpr { get; init; }
    public bool ForcedUpdate { get; init; }
    public bool Incremental { get; init; }
    public string? Direction { get; init; }
}

public record ParsedLinkOperation
{
    public int LineNumber { get; init; }
    public int TableId { get; init; }
    public int? KeyIndex { get; init; }
    public string? LinkMode { get; init; }           // L=Link, Q=Query, W=Write
    public string? Direction { get; init; }
    public string? SortType { get; init; }
    public int? ViewNumber { get; init; }
    public string? Views { get; init; }
    public int? FieldId { get; init; }
    public int? ConditionExpr { get; init; }
    public string? EvalCondition { get; init; }
    public bool IsExpanded { get; init; }
}

public record ParsedStopOperation
{
    public int LineNumber { get; init; }
    public string? Mode { get; init; }               // V=Verify, E=Error, W=Warning, S=Status
    public string? Buttons { get; init; }
    public int? DefaultButton { get; init; }
    public string? TitleText { get; init; }
    public string? MessageText { get; init; }
    public int? MessageExpr { get; init; }
    public string? Image { get; init; }
    public int? DisplayVar { get; init; }
    public int? ReturnVar { get; init; }
    public bool AppendToErrorLog { get; init; }
}

public record ParsedRaiseEventOperation
{
    public int LineNumber { get; init; }
    public string? EventType { get; init; }
    public int? InternalEventId { get; init; }
    public string? PublicObjectComp { get; init; }
    public int? PublicObjectObj { get; init; }
    public string? WaitMode { get; init; }
    public string? Direction { get; init; }
}

public record ParsedEventHandler
{
    public int EventId { get; init; }
    public string? Description { get; init; }
    public string? ForceExit { get; init; }
    public string? EventType { get; init; }
    public string? PublicObjectComp { get; init; }
    public int? PublicObjectObj { get; init; }
}

public record ParsedFieldRange
{
    public int RangeId { get; init; }
    public int? ColumnObj { get; init; }
    public int? MinExpr { get; init; }
    public int? MaxExpr { get; init; }
}

public record ParsedFormControl
{
    public int ControlId { get; init; }
    public string? ControlType { get; init; }
    public string? ControlName { get; init; }
    public int? X { get; init; }
    public int? Y { get; init; }
    public int? Width { get; init; }
    public int? Height { get; init; }
    public bool Visible { get; init; } = true;
    public bool Enabled { get; init; } = true;
    public int? TabOrder { get; init; }
    public int? LinkedFieldId { get; init; }
    public string? LinkedVariable { get; init; }
    public int? ParentId { get; init; }
    public int? Style { get; init; }
    public int? Color { get; init; }
    public int? FontId { get; init; }
    public string? Text { get; init; }
    public string? Format { get; init; }
    public int? DataFieldId { get; init; }
    public int? DataExpressionId { get; init; }
    public string? RaiseEventType { get; init; }
    public int? RaiseEventId { get; init; }
    public string? ImageFile { get; init; }
    public string? ItemsList { get; init; }
    public string? ColumnTitle { get; init; }
    public int? ControlLayer { get; init; }
    public int? HAlignment { get; init; }
    public int? TitleHeight { get; init; }
    public int? RowHeight { get; init; }
    public int? Elements { get; init; }
    public bool AllowParking { get; init; }
    public int? VisibleExpression { get; init; }
    public int? EnabledExpression { get; init; }
    public string? PropertiesJson { get; init; }
}

public record ParsedBlockOperation
{
    public int LineNumber { get; init; }
    public string? BlockType { get; init; }          // IF, ELSE, LOOP
    public int? ConditionExpr { get; init; }
    public string? Modifier { get; init; }
}

public record ParsedEvaluateOperation
{
    public int LineNumber { get; init; }
    public int? ExpressionRef { get; init; }
    public int? ConditionExpr { get; init; }
    public string? Direction { get; init; }
    public string? Modifier { get; init; }
}
