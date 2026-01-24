using MagicMcp.Services;
using Xunit;
using Xunit.Abstractions;
using System.Xml.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace MagicMcp.Tests;

/// <summary>
/// Debug tests to understand Select operation counts vs Column counts.
/// </summary>
public class SelectCountDebugTests
{
    private readonly ITestOutputHelper _output;

    public SelectCountDebugTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public void VilPrg348_CountSelectOperationsPerTask()
    {
        var path = @"D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml";
        var content = File.ReadAllText(path, Encoding.UTF8);
        // Clean invalid XML entities
        content = Regex.Replace(content, @"&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);", "");
        content = Regex.Replace(content, @"&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);", "");
        var doc = XDocument.Parse(content);

        _output.WriteLine("=== Select Operations per Task in Prg_348.xml ===\n");

        // Find all tasks
        var tasks = doc.Descendants("Task").ToList();
        var taskSelectCounts = new Dictionary<int, int>();
        var taskColumnCounts = new Dictionary<int, int>();
        var taskParents = new Dictionary<int, int?>();

        foreach (var task in tasks)
        {
            var header = task.Element("Header");
            if (header == null) continue;

            var isn2Attr = header.Attribute("ISN_2");
            if (isn2Attr == null || !int.TryParse(isn2Attr.Value, out int isn2)) continue;

            var desc = header.Attribute("Description")?.Value ?? "";

            // Get parent from XML nesting (parent Task element)
            int? parentIsn2 = null;
            var parentTask = task.Parent;
            while (parentTask != null && parentTask.Name != "Task")
            {
                parentTask = parentTask.Parent;
            }
            if (parentTask != null)
            {
                var parentHeader = parentTask.Element("Header");
                var parentIsn2Attr = parentHeader?.Attribute("ISN_2");
                if (parentIsn2Attr != null && int.TryParse(parentIsn2Attr.Value, out int pid))
                {
                    parentIsn2 = pid;
                }
            }

            taskParents[isn2] = parentIsn2;

            // Count Select operations in TaskLogic
            var taskLogic = task.Element("TaskLogic");
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
            taskSelectCounts[isn2] = selectCount;

            // Count Column elements in Resource
            var resource = task.Element("Resource");
            var columns = resource?.Element("Columns");
            int columnCount = columns?.Elements("Column").Count() ?? 0;
            taskColumnCounts[isn2] = columnCount;
        }

        // Build chain to task 32
        _output.WriteLine("Chain to task 32 (BI):\n");

        var chain = new List<int>();
        int? current = 32;
        while (current.HasValue && taskSelectCounts.ContainsKey(current.Value))
        {
            chain.Add(current.Value);
            current = taskParents.GetValueOrDefault(current.Value);
        }
        chain.Reverse();

        int totalSelectCount = 0;
        int totalColumnCount = 0;

        foreach (var isn2 in chain)
        {
            var isTarget = isn2 == 32 ? " <-- TARGET" : "";
            _output.WriteLine($"ISN_2={isn2}{isTarget}");
            _output.WriteLine($"  Select operations: {taskSelectCounts[isn2]}");
            _output.WriteLine($"  Column elements: {taskColumnCounts[isn2]}");

            if (isn2 != 32)
            {
                totalSelectCount += taskSelectCounts[isn2];
                totalColumnCount += taskColumnCounts[isn2];
            }
            _output.WriteLine("");
        }

        _output.WriteLine("=== Summary ===");
        _output.WriteLine($"Ancestor total Select count: {totalSelectCount}");
        _output.WriteLine($"Ancestor total Column count: {totalColumnCount}");
        _output.WriteLine($"Target (32) Select count: {taskSelectCounts[32]}");
        _output.WriteLine($"Target (32) Column count: {taskColumnCounts[32]}");

        // Calculate expected offset
        // FORMULA (per user clarification):
        // Offset = Variables in Main + Variables in all ancestors in direct path
        // (NOT including target task's variables)
        int expectedOffset = 128;
        int expectedGlobalIndex = 132; // FC

        _output.WriteLine($"\n=== Correct Formula (User Clarification) ===");
        _output.WriteLine($"Formula: Main vars + ancestor vars in direct path");
        _output.WriteLine($"Expected offset: {expectedOffset}");
        _output.WriteLine($"Expected global index (FC): {expectedGlobalIndex}");

        // Calculate using correct formula
        // Include ALL ancestors including Main (ISN_2=1)
        int correctOffset = 0;
        foreach (var isn2 in chain)
        {
            if (isn2 == 32) break; // Don't include target
            correctOffset += taskSelectCounts[isn2];
        }

        _output.WriteLine($"\nCalculated offset (ancestorSelects): {correctOffset}");
        _output.WriteLine($"Diff from expected: {correctOffset - expectedOffset}");

        // Also try with Column count
        int columnOffset = 0;
        foreach (var isn2 in chain)
        {
            if (isn2 == 32) break;
            columnOffset += taskColumnCounts[isn2];
        }
        _output.WriteLine($"\nCalculated offset (ancestorColumns): {columnOffset}");
        _output.WriteLine($"Diff from expected: {columnOffset - expectedOffset}");

        // Maybe we need Main's VG variables (from IndexCache) PLUS ancestor Selects?
        int vilMainOffset = 52; // From IndexCache
        var withMainOffset = vilMainOffset + correctOffset;
        _output.WriteLine($"\nWith VIL main offset (52) + ancestorSelects: {withMainOffset}");
        _output.WriteLine($"Diff from expected: {withMainOffset - expectedOffset}");
    }
}
