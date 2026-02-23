using MagicMcp.Services;
using MagicMcp.Models;
using Xunit;
using Xunit.Abstractions;

namespace MagicMcp.Tests;

/// <summary>
/// Validation tests for VIL IDE 90 (Prg_348) task 32 "BI" offset calculation.
/// Expected: Variable at local position 5 should be FC (global index 132).
/// </summary>
public class VilOffsetValidationTests
{
    private readonly ITestOutputHelper _output;
    private const string ProjectsBasePath = @"D:\Data\Migration\XPA\PMS";

    public VilOffsetValidationTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public void VilTask32_VariablePosition5_ShouldBeFC()
    {
        // Arrange
        var tableMappingService = new TableMappingService(ProjectsBasePath);
        var indexer = new XmlIndexer(ProjectsBasePath, tableMappingService);

        // Act
        var project = indexer.IndexProject("VIL");

        // Find Prg_348 (IDE 90)
        var program = project.Programs.Values.FirstOrDefault(p => p.IdePosition == 90);
        Assert.NotNull(program);
        _output.WriteLine($"Program: IDE {program.IdePosition} = Prg_{program.Id}.xml");
        _output.WriteLine($"Name: {program.Name}");

        // Find task with ISN_2=32 (BI)
        var task32 = program.Tasks.Values.FirstOrDefault(t => t.Isn2 == 32);
        Assert.NotNull(task32);
        _output.WriteLine($"\nTask 32: {task32.Description}");
        _output.WriteLine($"  IDE Position: {task32.IdePosition}");
        _output.WriteLine($"  Level: {task32.Level}");

        // Check DataView
        Assert.NotNull(task32.DataView);
        _output.WriteLine($"\nDataView:");
        _output.WriteLine($"  MainSource: {task32.DataView.MainSource?.ToString() ?? "None"}");
        _output.WriteLine($"  Columns count: {task32.DataView.Columns?.Count ?? 0}");

        if (task32.DataView.Columns != null)
        {
            _output.WriteLine("\n  Columns:");
            foreach (var col in task32.DataView.Columns.Take(10))
            {
                _output.WriteLine($"    {col.LineNumber}. {col.Variable} - {col.Name} ({col.Definition})");
            }
        }

        // Check Logic
        if (task32.LogicLines != null)
        {
            _output.WriteLine($"\nLogic Lines count: {task32.LogicLines.Count}");
            _output.WriteLine("  First 5 logic lines:");
            foreach (var line in task32.LogicLines.Take(5))
            {
                _output.WriteLine($"    L{line.LineNumber}/H{line.HandlerLineNumber}: [{line.HandlerType}] {line.Operation}");
                if (line.Parameters.Any())
                {
                    foreach (var p in line.Parameters)
                    {
                        _output.WriteLine($"      {p.Key}={p.Value}");
                    }
                }
            }
        }

        // Validate expected: position 5 should be FC
        if (task32.DataView.Columns != null && task32.DataView.Columns.Count >= 5)
        {
            var pos5 = task32.DataView.Columns[4]; // 0-based index
            _output.WriteLine($"\n=== VALIDATION ===");
            _output.WriteLine($"Position 5 variable: {pos5.Variable}");
            _output.WriteLine($"Position 5 name: {pos5.Name}");
            _output.WriteLine($"Expected: FC");

            Assert.Equal("FC", pos5.Variable);
        }
        else
        {
            _output.WriteLine("\n=== WARNING: Task has fewer than 5 columns ===");
            _output.WriteLine("Cannot validate position 5. Listing all variables:");

            // List ancestor chain for debugging
            _output.WriteLine("\n=== Ancestor Chain ===");
            int? parentIsn2 = task32.ParentIsn2;
            while (parentIsn2.HasValue)
            {
                var parent = program.Tasks.Values.FirstOrDefault(t => t.Isn2 == parentIsn2.Value);
                if (parent == null) break;

                _output.WriteLine($"  ISN_2={parent.Isn2} '{parent.Description}'");
                _output.WriteLine($"    Columns: {parent.DataView?.Columns?.Count ?? 0}");
                _output.WriteLine($"    MainSource: {parent.DataView?.MainSource?.ToString() ?? "None"}");

                parentIsn2 = parent.ParentIsn2;
            }
        }
    }

    [Fact]
    public void VilProject_ListTaskHierarchy()
    {
        // This test lists the full task hierarchy for debugging
        var tableMappingService = new TableMappingService(ProjectsBasePath);
        var indexer = new XmlIndexer(ProjectsBasePath, tableMappingService);

        var project = indexer.IndexProject("VIL");
        var program = project.Programs.Values.FirstOrDefault(p => p.IdePosition == 90);
        Assert.NotNull(program);

        _output.WriteLine($"VIL IDE 90 = Prg_{program.Id}.xml");
        _output.WriteLine($"Total tasks: {program.Tasks.Count}");

        // Build hierarchy
        var rootTasks = program.Tasks.Values.Where(t => !t.ParentIsn2.HasValue).ToList();

        void PrintTask(MagicTask task, int depth)
        {
            var indent = new string(' ', depth * 2);
            var colCount = task.DataView?.Columns?.Count ?? 0;
            var mainSource = task.DataView?.MainSource;

            _output.WriteLine($"{indent}ISN_2={task.Isn2} '{task.Description}' - {colCount} cols, MainSource={mainSource?.ToString() ?? "None"}");

            // Find children
            var children = program.Tasks.Values.Where(t => t.ParentIsn2 == task.Isn2).ToList();
            foreach (var child in children)
            {
                PrintTask(child, depth + 1);
            }
        }

        foreach (var root in rootTasks)
        {
            PrintTask(root, 0);
        }
    }
}
