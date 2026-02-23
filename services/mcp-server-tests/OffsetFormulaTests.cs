using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Xunit;
using Xunit.Abstractions;

namespace MagicMcp.Tests;

/// <summary>
/// Test different offset formulas to find the correct one.
/// </summary>
public class OffsetFormulaTests
{
    private readonly ITestOutputHelper _output;

    public OffsetFormulaTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public void TestAllFormulaVariations()
    {
        // Load VIL Prg_348
        var content = File.ReadAllText(@"D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml", Encoding.UTF8);
        content = Regex.Replace(content, @"&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);", "");
        var doc = XDocument.Parse(content);

        // Load REF DataSources for table column counts
        var refContent = File.ReadAllText(@"D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml", Encoding.UTF8);
        var refDoc = XDocument.Parse(refContent);

        Func<string, int> getTableColumnCount = (tableId) =>
        {
            var dataObj = refDoc.Descendants("DataObject")
                .FirstOrDefault(d => d.Attribute("id")?.Value == tableId);
            if (dataObj != null)
            {
                return dataObj.Descendants("Column").Count();
            }
            return 0;
        };

        _output.WriteLine("=== Testing All Formula Variations ===\n");

        // Build chain to task 32
        var chain = new List<(int isn2, string desc, int selects, int columns, int tableCols)>();

        var task32 = doc.Descendants("Header")
            .FirstOrDefault(h => h.Attribute("ISN_2")?.Value == "32")?
            .Parent;

        if (task32 == null)
        {
            _output.WriteLine("Task 32 not found!");
            return;
        }

        var current = task32;
        while (current != null && current.Name == "Task")
        {
            var header = current.Element("Header");
            if (header == null) break;

            var isn2Str = header.Attribute("ISN_2")?.Value;
            if (!int.TryParse(isn2Str, out int isn2)) break;

            var desc = header.Attribute("Description")?.Value ?? "";

            // Count Selects
            int selects = 0;
            var taskLogic = current.Element("TaskLogic");
            if (taskLogic != null)
            {
                foreach (var lu in taskLogic.Elements("LogicUnit"))
                {
                    var ll = lu.Element("LogicLines");
                    if (ll != null)
                        selects += ll.Elements("LogicLine").Count(l => l.Element("Select") != null);
                }
            }

            // Count Columns
            var resource = current.Element("Resource");
            var cols = resource?.Element("Columns");
            int columns = cols?.Elements("Column").Count() ?? 0;

            // Count table columns from MainSource
            int tableCols = 0;
            var dbs = resource?.Elements("DB").ToList() ?? new List<XElement>();
            foreach (var db in dbs)
            {
                var dataObj = db.Element("DataObject");
                var comp = dataObj?.Attribute("comp")?.Value;
                var obj = dataObj?.Attribute("obj")?.Value;
                if (comp == "2" && obj != null)
                {
                    tableCols += getTableColumnCount(obj);
                }
            }

            chain.Add((isn2, desc, selects, columns, tableCols));

            // Move to parent
            var parent = current.Parent;
            while (parent != null && parent.Name != "Task")
                parent = parent.Parent;
            current = parent;
        }

        chain.Reverse();

        _output.WriteLine("Ancestor chain:");
        int totalSelects = 0, totalColumns = 0, totalTableCols = 0;
        foreach (var (isn2, desc, selects, columns, tableCols) in chain)
        {
            var isTarget = isn2 == 32 ? " <-- TARGET" : "";
            _output.WriteLine($"  ISN_2={isn2} '{desc}'{isTarget}");
            _output.WriteLine($"    Selects={selects}, Columns={columns}, TableCols={tableCols}");

            if (isn2 != 32)
            {
                totalSelects += selects;
                totalColumns += columns;
                totalTableCols += tableCols;
            }
        }

        var targetTableCols = chain.Last().tableCols;

        _output.WriteLine($"\nAncestor totals:");
        _output.WriteLine($"  Selects: {totalSelects}");
        _output.WriteLine($"  Columns: {totalColumns}");
        _output.WriteLine($"  TableCols: {totalTableCols}");
        _output.WriteLine($"  Columns + TableCols: {totalColumns + totalTableCols}");

        _output.WriteLine($"\nTarget (32) TableCols: {targetTableCols}");

        int mainOffset = 52;
        int expected = 128;

        _output.WriteLine($"\n=== Formula Tests (Expected offset: {expected}) ===\n");

        var formulas = new Dictionary<string, int>
        {
            ["Main + AncSelects"] = mainOffset + totalSelects,
            ["Main + AncColumns"] = mainOffset + totalColumns,
            ["Main + AncColumns + AncTableCols"] = mainOffset + totalColumns + totalTableCols,
            ["Main + AncSelects + TargetTable"] = mainOffset + totalSelects + targetTableCols,
            ["Main + AncColumns + TargetTable"] = mainOffset + totalColumns + targetTableCols,
            ["AncSelects only"] = totalSelects,
            ["AncColumns only"] = totalColumns,
            ["AncColumns + AncTableCols"] = totalColumns + totalTableCols,
            ["AncColumns + TargetTable"] = totalColumns + targetTableCols,
            ["AncSelects - some"] = mainOffset + totalSelects - 7,  // Try subtracting 7
            ["Main + AncColumns + 12"] = mainOffset + totalColumns + 12,  // Try adding 12
        };

        foreach (var (name, value) in formulas.OrderBy(f => Math.Abs(f.Value - expected)))
        {
            var diff = value - expected;
            var marker = diff == 0 ? " <<<< MATCH!" : "";
            _output.WriteLine($"{name}: {value} (diff: {diff:+0;-0;0}){marker}");
        }

        // Also check: what value would make it work?
        _output.WriteLine($"\n=== Reverse Engineering ===");
        _output.WriteLine($"If Main + X = {expected}, then X = {expected - mainOffset}");
        _output.WriteLine($"If AncSelects + Y = {expected}, then Y = {expected - totalSelects}");
        _output.WriteLine($"If AncColumns + Z = {expected}, then Z = {expected - totalColumns}");
    }
}
