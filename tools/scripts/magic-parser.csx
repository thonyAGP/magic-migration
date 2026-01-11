#!/usr/bin/env dotnet-script

using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

// === CONFIGURATION ===
var PROJECTS_PATH = @"D:\Data\Migration\XPA\PMS";
var PROJECTS = new[] { "ADH", "PBP", "REF", "VIL", "PBG", "PVE" };

// === HELPERS ===
static Regex InvalidXmlEntity = new Regex(@"&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);|&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);");

static XDocument LoadXml(string path)
{
    var content = File.ReadAllText(path, Encoding.UTF8);
    var clean = InvalidXmlEntity.Replace(content, "");
    return XDocument.Parse(clean);
}

static string IndexToVar(int index)
{
    if (index < 26) return ((char)('A' + index)).ToString();
    return ((char)('A' + (index / 26) - 1)).ToString() + ((char)('A' + (index % 26))).ToString();
}

// === MAIN FUNCTIONS ===

/// <summary>
/// Get program IDE position and name
/// </summary>
string GetPosition(string project, int programId)
{
    var sourcePath = Path.Combine(PROJECTS_PATH, project.ToUpper(), "Source");
    var progsPath = Path.Combine(sourcePath, "Progs.xml");
    var headersPath = Path.Combine(sourcePath, "ProgramHeaders.xml");

    if (!File.Exists(progsPath)) return $"ERROR: {progsPath} not found";

    // Get IDE position from Progs.xml
    var progsDoc = LoadXml(progsPath);
    var programs = progsDoc.Descendants("Program").ToList();
    int idePos = -1;
    for (int i = 0; i < programs.Count; i++)
    {
        var id = programs[i].Attribute("id")?.Value;
        if (id == programId.ToString()) { idePos = i + 1; break; }
    }
    if (idePos == -1) return $"ERROR: Program {programId} not found in Progs.xml";

    // Get name from ProgramHeaders.xml
    string name = $"Program_{programId}";
    string publicName = null;
    if (File.Exists(headersPath))
    {
        var headersDoc = LoadXml(headersPath);
        var header = headersDoc.Descendants("Header")
            .FirstOrDefault(h => h.Attribute("id")?.Value == programId.ToString());
        if (header != null)
        {
            name = header.Attribute("Description")?.Value ?? name;
            publicName = header.Element("Public")?.Attribute("val")?.Value;
        }
    }

    var result = $"{project.ToUpper()} IDE {idePos} - {name}";
    if (publicName != null) result += $" (Public: {publicName})";
    return result;
}

/// <summary>
/// Parse column definitions from Resource/Columns - returns ordered list + lookup by id
/// </summary>
(List<(int id, string name, string dataType)> ordered, Dictionary<int, int> idToVarIndex) ParseColumns(XElement taskElement)
{
    var ordered = new List<(int, string, string)>();
    var idToVarIndex = new Dictionary<int, int>();
    var columnsElement = taskElement.Element("Resource")?.Element("Columns");
    if (columnsElement == null) return (ordered, idToVarIndex);

    int varIndex = 0;
    foreach (var col in columnsElement.Elements("Column"))
    {
        var idAttr = col.Attribute("id");
        if (idAttr == null || !int.TryParse(idAttr.Value, out int id)) continue;

        var name = col.Attribute("name")?.Value ?? $"Col_{id}";
        var propList = col.Element("PropertyList");
        var modelAttr = propList?.Element("Model")?.Attribute("attr_obj")?.Value;
        var dataType = modelAttr switch
        {
            "FIELD_ALPHA" => "Alpha",
            "FIELD_NUMERIC" => "Numeric",
            "FIELD_DATE" => "Date",
            "FIELD_TIME" => "Time",
            "FIELD_LOGICAL" => "Logical",
            "FIELD_BLOB" => "Blob",
            "FIELD_MEMO" => "Memo",
            "FIELD_UNICODE" => "Unicode",
            _ => "?"
        };

        ordered.Add((id, name, dataType));
        idToVarIndex[id] = varIndex;
        varIndex++;
    }
    return (ordered, idToVarIndex);
}

/// <summary>
/// Get Data View built from Logic operations (like Magic IDE displays)
/// Variables are named by Column order (A, B, C...), lines include Remarks
/// </summary>
string GetDataView(string project, int programId, string taskPosition = null)
{
    var sourcePath = Path.Combine(PROJECTS_PATH, project.ToUpper(), "Source");
    var prgPath = Path.Combine(sourcePath, $"Prg_{programId}.xml");

    if (!File.Exists(prgPath)) return $"ERROR: {prgPath} not found";

    var doc = LoadXml(prgPath);
    var sb = new StringBuilder();

    // Parse task position (e.g., "1" or "69.3" -> ISN_2)
    int? targetIsn2 = null;
    if (taskPosition != null)
    {
        if (int.TryParse(taskPosition.Split('.').Last(), out int pos))
        {
            var allTasks = doc.Descendants("Task").ToList();
            foreach (var t in allTasks)
            {
                var isn2Attr = t.Element("Header")?.Attribute("ISN_2");
                if (isn2Attr != null && int.TryParse(isn2Attr.Value, out int isn2))
                {
                    if (isn2 == pos) { targetIsn2 = isn2; break; }
                }
            }
        }
    }
    else
    {
        targetIsn2 = 1; // Main task by default
    }

    // Find the task
    XElement task = null;
    foreach (var t in doc.Descendants("Task"))
    {
        var isn2Attr = t.Element("Header")?.Attribute("ISN_2");
        if (isn2Attr != null && int.TryParse(isn2Attr.Value, out int isn2))
        {
            if (targetIsn2 == null || isn2 == targetIsn2)
            {
                task = t;
                break;
            }
        }
    }

    if (task == null)
        return $"ERROR: Task not found (position: {taskPosition ?? "Main"})";

    var taskDesc = task.Element("Header")?.Attribute("Description")?.Value ?? "";
    var taskIsn2Str = task.Element("Header")?.Attribute("ISN_2")?.Value ?? "?";

    // Parse columns - get ordered list and id->varIndex mapping
    var (columns, idToVarIndex) = ParseColumns(task);

    // Find the main LogicUnit (Record Main - Level=R, Type=M)
    var taskLogic = task.Element("TaskLogic");
    if (taskLogic == null)
        return $"## Data View - Task {taskIsn2Str}: {taskDesc}\n\n*No TaskLogic found*";

    var mainUnit = taskLogic.Elements("LogicUnit")
        .FirstOrDefault(u =>
        {
            var level = u.Element("Level")?.Attribute("val")?.Value;
            var type = u.Element("Type")?.Attribute("val")?.Value;
            return level == "R" && type == "M";
        }) ?? taskLogic.Elements("LogicUnit").FirstOrDefault();

    if (mainUnit == null)
        return $"## Data View - Task {taskIsn2Str}: {taskDesc}\n\n*No LogicUnit found*";

    var logicLines = mainUnit.Element("LogicLines");
    if (logicLines == null)
        return $"## Data View - Task {taskIsn2Str}: {taskDesc}\n\n*No LogicLines found*";

    // Build Data View from Logic operations
    // Variables are named by Column ORDER (not FieldID)
    var dvLines = new List<(int line, string type, string var, string name, string dataType, string extra)>();
    int lineNum = 1;

    foreach (var logicLine in logicLines.Elements("LogicLine"))
    {
        var op = logicLine.Elements().FirstOrDefault();
        if (op == null) continue;

        var opName = op.Name.LocalName;

        switch (opName)
        {
            case "Select":
                var fieldIdAttr = op.Attribute("FieldID");
                if (fieldIdAttr == null || !int.TryParse(fieldIdAttr.Value, out int fieldId)) break;

                // Get variable letter from Column ORDER (not FieldID)
                var varIndex = idToVarIndex.GetValueOrDefault(fieldId, -1);
                var varLetter = varIndex >= 0 ? IndexToVar(varIndex) : "?";

                // Get column info
                var colInfo = columns.FirstOrDefault(c => c.id == fieldId);
                var colName = colInfo.name ?? $"Field_{fieldId}";
                var colType = colInfo.dataType ?? "?";

                var typeAttr = op.Element("Type")?.Attribute("val")?.Value ?? "V";
                string lineType = typeAttr == "R" ? "C" : "V";

                dvLines.Add((lineNum++, lineType, varLetter, colName, colType, ""));
                break;

            case "Remark":
                var remarkText = op.Element("Text")?.Attribute("val")?.Value ?? "";
                // All Remarks count as lines (empty or with text)
                dvLines.Add((lineNum++, "Rem", "", remarkText, "", ""));
                break;

            // Skip other operations (they're Logic, not Data View)
        }
    }

    // Output
    sb.AppendLine($"## Data View - Task {taskIsn2Str}: {taskDesc}");
    sb.AppendLine($"**Variables: {columns.Count} | Lines: {dvLines.Count}**");
    sb.AppendLine();
    sb.AppendLine("| Line | Type | Var | Name | DataType |");
    sb.AppendLine("|------|------|-----|------|----------|");

    foreach (var dv in dvLines)
    {
        var name = dv.name.Length > 35 ? dv.name.Substring(0, 35) + "..." : dv.name;
        sb.AppendLine($"| {dv.line} | {dv.type} | {dv.var} | {name} | {dv.dataType} |");
    }

    return sb.ToString();
}

/// <summary>
/// Get Logic operations for a task
/// </summary>
string GetLogic(string project, int programId, int taskIsn2)
{
    var sourcePath = Path.Combine(PROJECTS_PATH, project.ToUpper(), "Source");
    var prgPath = Path.Combine(sourcePath, $"Prg_{programId}.xml");

    if (!File.Exists(prgPath)) return $"ERROR: {prgPath} not found";

    var doc = LoadXml(prgPath);
    var task = doc.Descendants("Task")
        .FirstOrDefault(t => t.Element("Header")?.Attribute("ISN_2")?.Value == taskIsn2.ToString());

    if (task == null) return $"ERROR: Task ISN_2={taskIsn2} not found";

    var desc = task.Element("Header")?.Attribute("Description")?.Value ?? "";
    var sb = new StringBuilder();
    sb.AppendLine($"## Logic - Tâche {taskIsn2}: {desc}");
    sb.AppendLine();
    sb.AppendLine("| # | Handler | Operation | Condition | Disabled |");
    sb.AppendLine("|---|---------|-----------|-----------|----------|");

    int lineNum = 1;
    var taskLogic = task.Element("TaskLogic");
    if (taskLogic != null)
    {
        foreach (var unit in taskLogic.Elements("LogicUnit"))
        {
            var level = unit.Element("Level")?.Attribute("val")?.Value ?? "R";
            var type = unit.Element("Type")?.Attribute("val")?.Value ?? "M";
            var handler = (level, type) switch
            {
                ("T", "P") => "TP",
                ("T", "S") => "TS",
                ("R", "P") => "RP",
                ("R", "M") => "RM",
                ("R", "S") => "RS",
                _ => $"{level}{type}"
            };

            var logicLines = unit.Element("LogicLines");
            if (logicLines != null)
            {
                foreach (var line in logicLines.Elements("LogicLine"))
                {
                    var op = line.Elements().FirstOrDefault();
                    if (op == null) continue;

                    var opName = op.Name.LocalName;
                    var disabled = op.Attribute("Disabled")?.Value == "1" ? "X" : "";
                    var condition = op.Element("Condition")?.Attribute("val")?.Value ?? "";

                    sb.AppendLine($"| {lineNum} | {handler} | {opName} | {condition} | {disabled} |");
                    lineNum++;
                }
            }
        }
    }

    return sb.ToString();
}

/// <summary>
/// Get task tree (hierarchy)
/// </summary>
string GetTree(string project, int programId)
{
    var sourcePath = Path.Combine(PROJECTS_PATH, project.ToUpper(), "Source");
    var prgPath = Path.Combine(sourcePath, $"Prg_{programId}.xml");
    var headersPath = Path.Combine(sourcePath, "ProgramHeaders.xml");
    var progsPath = Path.Combine(sourcePath, "Progs.xml");

    if (!File.Exists(prgPath)) return $"ERROR: {prgPath} not found";

    // Get IDE position
    int idePos = programId;
    if (File.Exists(progsPath))
    {
        var progsDoc = LoadXml(progsPath);
        var programs = progsDoc.Descendants("Program").ToList();
        for (int i = 0; i < programs.Count; i++)
        {
            if (programs[i].Attribute("id")?.Value == programId.ToString())
            {
                idePos = i + 1;
                break;
            }
        }
    }

    // Get program name
    string prgName = $"Program_{programId}";
    if (File.Exists(headersPath))
    {
        var headersDoc = LoadXml(headersPath);
        var header = headersDoc.Descendants("Header")
            .FirstOrDefault(h => h.Attribute("id")?.Value == programId.ToString());
        if (header != null)
            prgName = header.Attribute("Description")?.Value ?? prgName;
    }

    var doc = LoadXml(prgPath);
    var sb = new StringBuilder();
    sb.AppendLine($"## {project.ToUpper()} IDE {idePos} - {prgName}");
    sb.AppendLine();
    sb.AppendLine("| Position | ISN_2 | Description | Type |");
    sb.AppendLine("|----------|-------|-------------|------|");

    // Collect tasks with parent info
    var tasks = new List<(int isn2, int? parentIsn2, string desc, string taskType)>();
    foreach (var task in doc.Descendants("Task"))
    {
        var header = task.Element("Header");
        if (header == null) continue;

        var isn2Attr = header.Attribute("ISN_2");
        if (isn2Attr == null || !int.TryParse(isn2Attr.Value, out int isn2)) continue;

        var desc = header.Attribute("Description")?.Value ?? "";
        var taskType = header.Element("TaskType")?.Attribute("val")?.Value ?? "B";

        // Find parent ISN_2
        int? parentIsn2 = null;
        var parent = task.Parent;
        while (parent != null)
        {
            if (parent.Name == "Task")
            {
                var parentHeader = parent.Element("Header");
                var parentIsn2Attr = parentHeader?.Attribute("ISN_2");
                if (parentIsn2Attr != null && int.TryParse(parentIsn2Attr.Value, out int pIsn2))
                {
                    parentIsn2 = pIsn2;
                }
                break;
            }
            parent = parent.Parent;
        }

        tasks.Add((isn2, parentIsn2, desc, taskType));
    }

    // Build IDE positions
    var idePositions = new Dictionary<int, string>();
    var childCounters = new Dictionary<int, int>(); // parent -> child count

    // Sort by ISN_2 to process in order
    foreach (var t in tasks.OrderBy(x => x.isn2))
    {
        if (t.isn2 == 1)
        {
            // Root task
            idePositions[1] = idePos.ToString();
        }
        else if (t.parentIsn2.HasValue)
        {
            var parentPos = idePositions.GetValueOrDefault(t.parentIsn2.Value, idePos.ToString());
            if (!childCounters.ContainsKey(t.parentIsn2.Value))
                childCounters[t.parentIsn2.Value] = 0;
            childCounters[t.parentIsn2.Value]++;
            idePositions[t.isn2] = $"{parentPos}.{childCounters[t.parentIsn2.Value]}";
        }
        else
        {
            idePositions[t.isn2] = $"{idePos}.{t.isn2}";
        }
    }

    // Output
    foreach (var t in tasks.OrderBy(x => x.isn2))
    {
        var pos = idePositions.GetValueOrDefault(t.isn2, "?");
        sb.AppendLine($"| {pos} | {t.isn2} | {t.desc} | {t.taskType} |");
    }

    return sb.ToString();
}

/// <summary>
/// Search programs across all projects
/// </summary>
string Search(string query, string projectFilter = null)
{
    var results = new List<(string project, int id, int idePos, string name, string publicName, int score)>();
    var queryLower = query.ToLower();
    var queryWords = queryLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);

    var projectsToSearch = projectFilter != null
        ? new[] { projectFilter.ToUpper() }
        : PROJECTS;

    foreach (var project in projectsToSearch)
    {
        var sourcePath = Path.Combine(PROJECTS_PATH, project, "Source");
        var progsPath = Path.Combine(sourcePath, "Progs.xml");
        var headersPath = Path.Combine(sourcePath, "ProgramHeaders.xml");

        if (!File.Exists(progsPath) || !File.Exists(headersPath)) continue;

        // Build ID -> IDE position map
        var idToIdePos = new Dictionary<int, int>();
        var progsDoc = LoadXml(progsPath);
        var programs = progsDoc.Descendants("Program").ToList();
        for (int i = 0; i < programs.Count; i++)
        {
            var idAttr = programs[i].Attribute("id");
            if (idAttr != null && int.TryParse(idAttr.Value, out int id))
            {
                idToIdePos[id] = i + 1;
            }
        }

        // Search in headers
        var headersDoc = LoadXml(headersPath);
        foreach (var header in headersDoc.Descendants("Header"))
        {
            var idAttr = header.Attribute("id");
            if (idAttr == null || !int.TryParse(idAttr.Value, out int id)) continue;

            var name = header.Attribute("Description")?.Value ?? "";
            var publicName = header.Element("Public")?.Attribute("val")?.Value;

            var nameLower = name.ToLower();
            var publicLower = publicName?.ToLower() ?? "";

            // Calculate score
            int score = 0;

            // Exact match on public name
            if (publicLower == queryLower) score = 100;
            // Exact match on name
            else if (nameLower == queryLower) score = 95;
            // Public name starts with query
            else if (publicLower.StartsWith(queryLower)) score = 90;
            // Name starts with query
            else if (nameLower.StartsWith(queryLower)) score = 85;
            // Public name contains query
            else if (publicLower.Contains(queryLower)) score = 80;
            // Name contains query
            else if (nameLower.Contains(queryLower)) score = 75;
            // All query words found
            else if (queryWords.All(w => nameLower.Contains(w) || publicLower.Contains(w))) score = 60;
            // Any query word found
            else if (queryWords.Any(w => nameLower.Contains(w) || publicLower.Contains(w))) score = 40;

            if (score > 0)
            {
                var idePos = idToIdePos.GetValueOrDefault(id, 0);
                results.Add((project, id, idePos, name, publicName, score));
            }
        }
    }

    // Sort by score descending
    var sorted = results.OrderByDescending(r => r.score).ThenBy(r => r.project).Take(20).ToList();

    if (sorted.Count == 0)
        return $"No results found for '{query}'";

    var sb = new StringBuilder();
    sb.AppendLine($"## Search results for '{query}'");
    sb.AppendLine();
    sb.AppendLine("| Project | IDE | ID | Name | Public | Score |");
    sb.AppendLine("|---------|-----|----|------|--------|-------|");

    foreach (var r in sorted)
    {
        var pub = r.publicName ?? "";
        sb.AppendLine($"| {r.project} | {r.idePos} | {r.id} | {r.name} | {pub} | {r.score} |");
    }

    return sb.ToString();
}

/// <summary>
/// Get expression content
/// </summary>
string GetExpression(string project, int programId, int exprId)
{
    var sourcePath = Path.Combine(PROJECTS_PATH, project.ToUpper(), "Source");
    var prgPath = Path.Combine(sourcePath, $"Prg_{programId}.xml");

    if (!File.Exists(prgPath)) return $"ERROR: {prgPath} not found";

    var doc = LoadXml(prgPath);
    var expr = doc.Descendants("Exp")
        .FirstOrDefault(e => e.Attribute("id")?.Value == exprId.ToString());

    if (expr == null) return $"ERROR: Expression {exprId} not found";

    var content = expr.Value ?? "";
    var comment = expr.Attribute("Comment")?.Value;

    var sb = new StringBuilder();
    sb.AppendLine($"## Expression {exprId}");
    if (comment != null) sb.AppendLine($"// {comment}");
    sb.AppendLine();
    sb.AppendLine("```");
    sb.AppendLine(content);
    sb.AppendLine("```");

    return sb.ToString();
}

// === CLI ===
if (Args.Count == 0)
{
    Console.WriteLine("Usage: dotnet script magic-parser.csx <command> [args]");
    Console.WriteLine();
    Console.WriteLine("Commands:");
    Console.WriteLine("  pos <project> <programId>              - Get program position");
    Console.WriteLine("  tree <project> <programId>             - Get task tree");
    Console.WriteLine("  dv <project> <programId> [taskIsn2]    - Get Data View");
    Console.WriteLine("  logic <project> <programId> <taskIsn2> - Get Logic");
    Console.WriteLine("  expr <project> <programId> <exprId>    - Get Expression");
    Console.WriteLine("  search <query> [project]               - Search programs");
    Console.WriteLine();
    Console.WriteLine("Examples:");
    Console.WriteLine("  dotnet script magic-parser.csx pos ADH 69");
    Console.WriteLine("  dotnet script magic-parser.csx tree ADH 69");
    Console.WriteLine("  dotnet script magic-parser.csx dv ADH 69");
    Console.WriteLine("  dotnet script magic-parser.csx dv ADH 69 5");
    Console.WriteLine("  dotnet script magic-parser.csx logic ADH 69 5");
    Console.WriteLine("  dotnet script magic-parser.csx search extrait");
    Console.WriteLine("  dotnet script magic-parser.csx search caisse ADH");
    return;
}

var cmd = Args[0].ToLower();
switch (cmd)
{
    case "pos":
        if (Args.Count < 3) { Console.WriteLine("Usage: pos <project> <programId>"); return; }
        Console.WriteLine(GetPosition(Args[1], int.Parse(Args[2])));
        break;

    case "tree":
        if (Args.Count < 3) { Console.WriteLine("Usage: tree <project> <programId>"); return; }
        Console.WriteLine(GetTree(Args[1], int.Parse(Args[2])));
        break;

    case "search":
        if (Args.Count < 2) { Console.WriteLine("Usage: search <query> [project]"); return; }
        var projectFilter = Args.Count >= 3 ? Args[2] : null;
        Console.WriteLine(Search(Args[1], projectFilter));
        break;

    case "dv":
        if (Args.Count < 3) { Console.WriteLine("Usage: dv <project> <programId> [taskPosition]"); return; }
        var taskPos = Args.Count >= 4 ? Args[3] : null;
        Console.WriteLine(GetDataView(Args[1], int.Parse(Args[2]), taskPos));
        break;

    case "logic":
        if (Args.Count < 4) { Console.WriteLine("Usage: logic <project> <programId> <taskIsn2>"); return; }
        Console.WriteLine(GetLogic(Args[1], int.Parse(Args[2]), int.Parse(Args[3])));
        break;

    case "expr":
        if (Args.Count < 4) { Console.WriteLine("Usage: expr <project> <programId> <exprId>"); return; }
        Console.WriteLine(GetExpression(Args[1], int.Parse(Args[2]), int.Parse(Args[3])));
        break;

    default:
        Console.WriteLine($"Unknown command: {cmd}");
        break;
}
