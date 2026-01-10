#r "nuget: System.Xml.Linq, 4.3.0"
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

// Test script to verify DataView parsing from Logic
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

// Parse column definitions
var columnDefs = new Dictionary<int, (string Name, string Type, string Picture)>();
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
            "FIELD_LOGICAL" => "Logical",
            "FIELD_UNICODE" => "Unicode",
            _ => "Unknown"
        };
        var picture = pictureEl?.Attribute("valUnicode")?.Value ?? pictureEl?.Attribute("val")?.Value ?? "";

        columnDefs[id] = (name, dataType, picture);
    }
}

// Build Data View from Logic
var taskLogic = taskElement.Element("TaskLogic");
var mainUnit = taskLogic?.Elements("LogicUnit")
    .FirstOrDefault(u => u.Element("Level")?.Attribute("val")?.Value == "R"
                      && u.Element("Type")?.Attribute("val")?.Value == "M");

var logicLines = mainUnit?.Element("LogicLines");
if (logicLines == null)
{
    Console.WriteLine("No LogicLines found");
    return;
}

int lineNum = 1;
int currentLinkTableId = 0;

Console.WriteLine("| Line | Type | Var | Col | Name | DataType | Picture |");
Console.WriteLine("|------|------|-----|-----|------|----------|---------|");

string IndexToVar(int idx)
{
    if (idx < 26) return ((char)('A' + idx)).ToString();
    return $"{(char)('A' + idx/26 - 1)}{(char)('A' + idx%26)}";
}

foreach (var logicLine in logicLines.Elements("LogicLine"))
{
    var op = logicLine.Elements().FirstOrDefault();
    if (op == null) continue;

    var opName = op.Name.LocalName;

    switch (opName)
    {
        case "DATAVIEW_SRC":
            Console.WriteLine($"| {lineNum++} | **Main Source** | | | No Main Source | | Index: 0 |");
            break;

        case "Select":
            var fieldId = int.Parse(op.Attribute("FieldID")?.Value ?? "0");
            var colNum = op.Element("Column")?.Attribute("val")?.Value ?? "";
            var type = op.Element("Type")?.Attribute("val")?.Value ?? "V";
            var isParam = op.Element("IsParameter")?.Attribute("val")?.Value == "Y";

            var colDef = columnDefs.GetValueOrDefault(fieldId, ("?", "?", ""));
            var varLetter = IndexToVar(fieldId - 1);

            string lineType = type == "R" ? "Column" : (isParam ? "Parameter" : "Virtual");
            var name = colDef.Name.Length > 25 ? colDef.Name.Substring(0, 25) + "..." : colDef.Name;
            var pic = colDef.Picture.Length > 12 ? colDef.Picture.Substring(0, 12) + "..." : colDef.Picture;

            Console.WriteLine($"| {lineNum++} | {lineType} | {varLetter} | {(type == "R" ? colNum : "")} | {name} | {colDef.Type} | {pic} |");
            break;

        case "Remark":
            var text = op.Element("Text")?.Attribute("val")?.Value ?? "";
            if (string.IsNullOrWhiteSpace(text) || text == " ")
            {
                Console.WriteLine($"| {lineNum++} | *(empty)* | | | | | |");
            }
            // Skip non-empty remarks for now
            break;

        case "LNK":
            var tableId = op.Element("DB")?.Attribute("obj")?.Value ?? "?";
            var keyNum = op.Attribute("Key")?.Value ?? "1";
            currentLinkTableId = int.Parse(tableId);
            Console.WriteLine($"| {lineNum++} | **Link Query** | | | Table {tableId} | | Index: {keyNum} |");
            break;

        case "END_LINK":
            Console.WriteLine($"| {lineNum++} | **End Link** | | | | | |");
            currentLinkTableId = 0;
            break;
    }
}

Console.WriteLine();
Console.WriteLine($"**Total lines:** {lineNum - 1}");
