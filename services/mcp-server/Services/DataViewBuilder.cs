using System.Xml.Linq;
using MagicMcp.Models;

namespace MagicMcp.Services;

/// <summary>
/// Builds the Data View structure from Magic XML.
/// The IDE Data View displays Columns in XML order, with Remarks intercalated based on FlowIsn.
/// </summary>
public static class DataViewBuilder
{
    /// <summary>
    /// Build Data View lines using the correct algorithm:
    /// 1. Columns in XML order
    /// 2. Remarks intercalated based on FlowIsn (FlowIsn N = insert after position N)
    /// </summary>
    public static List<MagicDataViewLine> BuildFromTask(XElement taskElement)
    {
        var lines = new List<MagicDataViewLine>();

        // Step 1: Parse columns in XML order
        var columns = ParseColumnsInOrder(taskElement);

        // Step 2: Parse remarks with FlowIsn from Record Main
        var remarks = ParseRemarksWithFlowIsn(taskElement);

        // Step 3: Build interleaved sequence
        // FlowIsn N means "insert Remark after position N in the interleaved sequence"
        var remarksByFlowIsn = remarks
            .GroupBy(r => r.FlowIsn)
            .ToDictionary(g => g.Key, g => g.ToList());

        int dvLine = 1;
        int colIndex = 0;

        while (colIndex < columns.Count)
        {
            // Add next column
            var col = columns[colIndex];
            lines.Add(new MagicDataViewLine
            {
                LineNumber = dvLine,
                LineType = "Column",
                Variable = IndexToVariable(col.VarIndex),
                Name = col.Name,
                DataType = col.DataType,
                Picture = col.Picture,
                FieldId = col.Id
            });

            int currentPosition = dvLine;
            dvLine++;
            colIndex++;

            // Insert any Remarks that should appear after this position
            if (remarksByFlowIsn.TryGetValue(currentPosition, out var remarksAtPos))
            {
                foreach (var remark in remarksAtPos)
                {
                    var isEmptyOrWhitespace = string.IsNullOrWhiteSpace(remark.Text);
                    lines.Add(new MagicDataViewLine
                    {
                        LineNumber = dvLine,
                        LineType = isEmptyOrWhitespace ? "Empty" : "Remark",
                        RemarkText = isEmptyOrWhitespace ? null : remark.Text
                    });
                    dvLine++;
                }
            }
        }

        return lines;
    }

    /// <summary>
    /// Parse columns from Resource/Columns in XML order.
    /// This is the order they appear in the Data View.
    /// </summary>
    private static List<ColumnInfo> ParseColumnsInOrder(XElement taskElement)
    {
        var columns = new List<ColumnInfo>();

        var columnsElement = taskElement.Element("Resource")?.Element("Columns");
        if (columnsElement == null) return columns;

        int varIndex = 0;
        foreach (var col in columnsElement.Elements("Column"))
        {
            var idAttr = col.Attribute("id");
            if (idAttr == null || !int.TryParse(idAttr.Value, out int id)) continue;

            var name = col.Attribute("name")?.Value ?? $"Col_{id}";

            // Parse data type
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
                "FIELD_BLOB" => "Blob",
                "FIELD_MEMO" => "Memo",
                "FIELD_UNICODE" => "Unicode",
                _ => "Virtual"
            };

            var picture = pictureEl?.Attribute("valUnicode")?.Value
                       ?? pictureEl?.Attribute("val")?.Value;

            columns.Add(new ColumnInfo
            {
                Id = id,
                Name = name,
                VarIndex = varIndex,
                DataType = dataType,
                Picture = picture
            });

            varIndex++;
        }

        return columns;
    }

    /// <summary>
    /// Parse Remarks with FlowIsn from Record Main LogicUnit.
    /// FlowIsn indicates the position after which the Remark should appear.
    /// </summary>
    private static List<RemarkInfo> ParseRemarksWithFlowIsn(XElement taskElement)
    {
        var remarks = new List<RemarkInfo>();

        var taskLogic = taskElement.Element("TaskLogic");
        if (taskLogic == null) return remarks;

        // Find Record Main LogicUnit (Level=R, Type=M)
        var mainUnit = taskLogic.Elements("LogicUnit")
            .FirstOrDefault(u =>
            {
                var level = u.Element("Level")?.Attribute("val")?.Value;
                var type = u.Element("Type")?.Attribute("val")?.Value;
                return level == "R" && type == "M";
            });

        if (mainUnit == null)
        {
            // Fallback to first LogicUnit
            mainUnit = taskLogic.Elements("LogicUnit").FirstOrDefault();
        }

        if (mainUnit == null) return remarks;

        var logicLines = mainUnit.Element("LogicLines");
        if (logicLines == null) return remarks;

        foreach (var logicLine in logicLines.Elements("LogicLine"))
        {
            var remarkEl = logicLine.Element("Remark");
            if (remarkEl == null) continue;

            var flowIsnAttr = remarkEl.Attribute("FlowIsn");
            if (flowIsnAttr == null || !int.TryParse(flowIsnAttr.Value, out int flowIsn)) continue;

            var text = remarkEl.Element("Text")?.Attribute("val")?.Value ?? "";

            remarks.Add(new RemarkInfo
            {
                FlowIsn = flowIsn,
                Text = text
            });
        }

        return remarks;
    }

    /// <summary>
    /// Convert 0-based index to variable letter.
    /// Pattern: A-Z (0-25), BA-BZ (26-51), CA-CZ (52-77), DA-DZ (78-103), etc.
    /// </summary>
    public static string IndexToVariable(int index)
    {
        if (index < 0) return "?";
        if (index < 26)
            return ((char)('A' + index)).ToString();

        // After Z: BA, BB... BZ, CA, CB... CZ, DA...
        int first = index / 26;    // 1=B, 2=C, 3=D, 4=E...
        int second = index % 26;   // 0=A, 1=B... 25=Z
        return $"{(char)('A' + first)}{(char)('A' + second)}";
    }

    /// <summary>
    /// Convert variable letter to 0-based index.
    /// </summary>
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
            int first = variable[0] - 'A';  // B=1, C=2, D=3...
            int second = variable[1] - 'A'; // A=0, B=1...
            return first * 26 + second;
        }

        return -1;
    }

    private record ColumnInfo
    {
        public required int Id { get; init; }
        public required string Name { get; init; }
        public required int VarIndex { get; init; }
        public required string DataType { get; init; }
        public string? Picture { get; init; }
    }

    private record RemarkInfo
    {
        public required int FlowIsn { get; init; }
        public required string Text { get; init; }
    }

    #region Legacy methods for compatibility

    /// <summary>
    /// Parse column definitions from the Resource/Columns element (legacy)
    /// </summary>
    public static Dictionary<int, ColumnDefinition> ParseColumnDefinitions(XElement taskElement)
    {
        var defs = new Dictionary<int, ColumnDefinition>();

        var columnsElement = taskElement.Element("Resource")?.Element("Columns");
        if (columnsElement == null) return defs;

        foreach (var col in columnsElement.Elements("Column"))
        {
            var idAttr = col.Attribute("id");
            if (idAttr == null || !int.TryParse(idAttr.Value, out int id)) continue;

            var name = col.Attribute("name")?.Value ?? $"Col_{id}";
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
                "FIELD_BLOB" => "Blob",
                "FIELD_MEMO" => "Memo",
                "FIELD_UNICODE" => "Unicode",
                _ => "Unknown"
            };

            var picture = pictureEl?.Attribute("valUnicode")?.Value
                       ?? pictureEl?.Attribute("val")?.Value;

            defs[id] = new ColumnDefinition
            {
                Id = id,
                Name = name,
                DataType = dataType,
                Picture = picture
            };
        }

        return defs;
    }

    public record ColumnDefinition
    {
        public required int Id { get; init; }
        public required string Name { get; init; }
        public required string DataType { get; init; }
        public string? Picture { get; init; }
    }

    #endregion
}
