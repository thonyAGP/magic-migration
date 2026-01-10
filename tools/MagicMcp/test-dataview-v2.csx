using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

// Test script to verify DataView parsing from Logic - matches DataViewBuilder.cs logic
var xmlPath = @"D:\Data\Migration\XPA\PMS\ADH\Source\Prg_69.xml";
var doc = XDocument.Load(xmlPath);

// Find task ISN_2=1 (root task "Extrait de compte")
var taskElement = doc.Descendants("Task")
    .FirstOrDefault(t => t.Element("Header")?.Attribute("ISN_2")?.Value == "1");

if (taskElement == null)
{
    Console.WriteLine("Task not found");
    return;
}

Console.WriteLine("## Data View: ADH IDE 69");
Console.WriteLine("**Task:** Extrait de compte (ISN_2=1)");
Console.WriteLine();

// Parse column definitions from Resource/Columns
// Item1=Name, Item2=Type, Item3=Picture
var columnDefs = new Dictionary<int, Tuple<string, string, string>>();
var columnsElement = taskElement.Element("Resource")?.Element("Columns");
if (columnsElement != null)
{
    foreach (var col in columnsElement.Elements("Column"))
    {
        var id = int.Parse(col.Attribute("id")?.Value ?? "0");
        var name = col.Attribute("name")?.Value ?? "";
        var propList = col.Element("PropertyList");
        var modelEl = propList?.Element("Model");
        var pictureEl = propList?.Element("Picture");

        var dataType = modelEl?.Attribute("attr_obj")?.Value switch
        {
            "FIELD_ALPHA" => "Alpha",
            "FIELD_NUMERIC" => "Numeric",
            "FIELD_DATE" => "Date",
            "FIELD_TIME" => "Time",
            "FIELD_LOGICAL" => "Logical",
            "FIELD_UNICODE" => "Unicode",
            "FIELD_BLOB" => "Blob",
            "FIELD_MEMO" => "Memo",
            _ => "Unknown"
        };
        var picture = pictureEl?.Attribute("valUnicode")?.Value ?? pictureEl?.Attribute("val")?.Value ?? "";

        columnDefs[id] = Tuple.Create(name, dataType, picture);
    }
}

// Build Data View from Logic - matches DataViewBuilder.BuildFromLogic
var taskLogic = taskElement.Element("TaskLogic");

// Find main LogicUnit (Level=R, Type=M)
var mainUnit = taskLogic?.Elements("LogicUnit")
    .FirstOrDefault(u => u.Element("Level")?.Attribute("val")?.Value == "R"
                      && u.Element("Type")?.Attribute("val")?.Value == "M");

if (mainUnit == null)
{
    mainUnit = taskLogic?.Elements("LogicUnit").FirstOrDefault();
}

var logicLines = mainUnit?.Element("LogicLines");
if (logicLines == null)
{
    Console.WriteLine("No LogicLines found");
    return;
}

int lineNum = 1;
int currentLinkTableId = 0;

Console.WriteLine("| Line | Type | Var | ColNum | Name | DataType | Picture | Table |");
Console.WriteLine("|------|------|-----|--------|------|----------|---------|-------|");

string IndexToVar(int idx)
{
    if (idx < 0) return "?";
    if (idx < 26) return ((char)('A' + idx)).ToString();
    int first = idx / 26;
    int second = idx % 26;
    return $"{(char)('A' + first - 1)}{(char)('A' + second)}";
}

int? GetIntAttr(XElement element, string attrName)
{
    if (element == null) return null;
    var attr = element.Attribute(attrName);
    if (attr != null && int.TryParse(attr.Value, out int val))
        return val;

    // Also try child element
    var child = element.Element(attrName);
    if (child != null)
    {
        attr = child.Attribute("val");
        if (attr != null && int.TryParse(attr.Value, out val))
            return val;
    }
    return null;
}

foreach (var logicLine in logicLines.Elements("LogicLine"))
{
    var op = logicLine.Elements().FirstOrDefault();
    if (op == null) continue;

    var opName = op.Name.LocalName;

    switch (opName)
    {
        case "DATAVIEW_SRC":
            Console.WriteLine($"| {lineNum++} | **Main Source** | | | No Main Source | | | Index: 0 |");
            break;

        case "Select":
            var fieldId = GetIntAttr(op, "FieldID");
            var colNum = GetIntAttr(op, "Column");
            var typeVal = op.Element("Type")?.Attribute("val")?.Value ?? "V";
            var isParam = op.Element("IsParameter")?.Attribute("val")?.Value == "Y";

            var colDef = fieldId.HasValue && columnDefs.ContainsKey(fieldId.Value)
                ? columnDefs[fieldId.Value]
                : Tuple.Create("?", "?", "");
            var varLetter = fieldId.HasValue ? IndexToVar(fieldId.Value - 1) : "?";

            string lineType;
            if (typeVal == "R")
            {
                lineType = "Column";
            }
            else if (isParam)
            {
                lineType = "Parameter";
            }
            else
            {
                lineType = "Virtual";
            }

            var name = colDef.Item1.Length > 25 ? colDef.Item1.Substring(0, 25) + "..." : colDef.Item1;
            var pic = colDef.Item3.Length > 12 ? colDef.Item3.Substring(0, 12) + "..." : colDef.Item3;
            var tableStr = typeVal == "R" && currentLinkTableId > 0 ? currentLinkTableId.ToString() : "";
            var colNumStr = typeVal == "R" && colNum.HasValue ? colNum.Value.ToString() : "";

            Console.WriteLine($"| {lineNum++} | {lineType} | {varLetter} | {colNumStr} | {name} | {colDef.Item2} | {pic} | {tableStr} |");
            break;

        case "Remark":
            var text = op.Element("Text")?.Attribute("val")?.Value ?? "";
            if (string.IsNullOrWhiteSpace(text) || text == " ")
            {
                Console.WriteLine($"| {lineNum++} | *(empty)* | | | | | | |");
            }
            // Skip non-empty remarks for now
            break;

        case "LNK":
            var linkDb = op.Element("DB");
            var tableId = GetIntAttr(linkDb, "obj") ?? 0;
            var keyNum = GetIntAttr(op, "Key") ?? 1;
            currentLinkTableId = tableId;
            Console.WriteLine($"| {lineNum++} | **Link Query** | | | Table {tableId} | | | Index: {keyNum} |");
            break;

        case "END_LINK":
            Console.WriteLine($"| {lineNum++} | **End Link** | | | | | | |");
            currentLinkTableId = 0;
            break;
    }
}

Console.WriteLine();
Console.WriteLine($"**Total lines:** {lineNum - 1}");
