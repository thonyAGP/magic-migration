using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Xunit;
using Xunit.Abstractions;

namespace MagicMcp.Tests;

/// <summary>
/// Test to verify VIL main offset calculation.
/// </summary>
public class VilMainOffsetTests
{
    private readonly ITestOutputHelper _output;

    public VilMainOffsetTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public void VilPrg1_CountMainProgramVariables()
    {
        // VIL Prg_1.xml is the main program
        var path = @"D:\Data\Migration\XPA\PMS\VIL\Source\Prg_1.xml";
        if (!File.Exists(path))
        {
            _output.WriteLine($"File not found: {path}");
            return;
        }

        var content = File.ReadAllText(path, Encoding.UTF8);
        content = Regex.Replace(content, @"&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);", "");
        content = Regex.Replace(content, @"&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);", "");
        var doc = XDocument.Parse(content);

        _output.WriteLine("=== VIL Prg_1.xml Main Program Variables ===\n");

        // Find main task (MainProgram="Y")
        var mainTask = doc.Descendants("Task").FirstOrDefault(t => t.Attribute("MainProgram")?.Value == "Y");
        if (mainTask == null)
        {
            mainTask = doc.Descendants("Task").First();
        }

        var header = mainTask.Element("Header");
        _output.WriteLine($"Main task description: {header?.Attribute("Description")?.Value}");

        // Count Select operations in main task
        var taskLogic = mainTask.Element("TaskLogic");
        int selectCount = 0;
        if (taskLogic != null)
        {
            foreach (var logicUnit in taskLogic.Elements("LogicUnit"))
            {
                var logicLines = logicUnit.Element("LogicLines");
                if (logicLines != null)
                {
                    selectCount += logicLines.Elements("LogicLine")
                        .Count(ll => ll.Element("Select") != null);
                }
            }
        }

        // Count Column elements
        var resource = mainTask.Element("Resource");
        var columns = resource?.Element("Columns");
        int columnCount = columns?.Elements("Column").Count() ?? 0;

        _output.WriteLine($"\nMain task Select operations: {selectCount}");
        _output.WriteLine($"Main task Column elements: {columnCount}");

        // List first few columns
        if (columns != null)
        {
            _output.WriteLine("\nFirst 10 columns:");
            int i = 0;
            foreach (var col in columns.Elements("Column").Take(10))
            {
                var name = col.Attribute("name")?.Value;
                _output.WriteLine($"  {++i}. {name}");
            }
        }

        _output.WriteLine($"\n=== Summary ===");
        _output.WriteLine($"Current VIL main offset in IndexCache: 52");
        _output.WriteLine($"Main task Select count: {selectCount}");
        _output.WriteLine($"Main task Column count: {columnCount}");

        // The main offset should be the count of VG variables
        // These are the variables that are shared across all programs
        _output.WriteLine($"\nIf main offset should be {selectCount}, then:");
        _output.WriteLine($"  {selectCount} + 83 (ancestor Selects in Prg_348) = {selectCount + 83}");
        _output.WriteLine($"  Expected: 128");
        _output.WriteLine($"  Diff: {(selectCount + 83) - 128}");
    }
}
