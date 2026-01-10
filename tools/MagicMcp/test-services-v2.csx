#r "bin/Release/net8.0/MagicMcp.dll"

using MagicMcp.Services;
using MagicMcp.Models;

var projectsBasePath = @"D:\Data\Migration\XPA\PMS";
var projectNames = new[] { "ADH", "PBP", "REF", "VIL", "PBG", "PVE" };

Console.WriteLine("Initializing...");
var indexCache = new IndexCache(projectsBasePath, projectNames);
indexCache.LoadAllProjects();

var queryService = new MagicQueryService(indexCache);
var dataViewBuilder = new DataViewBuilder();

Console.WriteLine("\n=== Test: GetLine (ADH, 69, line 5) ===");
var line5 = queryService.GetLine("ADH", "69", 5);
Console.WriteLine(line5);

Console.WriteLine("\n=== Test: GetLine (ADH, 69.3, line 1) ===");
var line1 = queryService.GetLine("ADH", "69.3", 1);
Console.WriteLine(line1);

Console.WriteLine("\n=== Test: GetLine (ADH, 69.3, line 10) ===");
var line10 = queryService.GetLine("ADH", "69.3", 10);
Console.WriteLine(line10);

// Test expressions - find valid expression IDs
Console.WriteLine("\n=== Test: First available expression ===");
var program = indexCache.GetProgram("ADH", 69);
if (program != null && program.Expressions.Count > 0)
{
    var firstExpr = program.Expressions.First();
    Console.WriteLine($"Found expression ID: {firstExpr.Key}");
    var exprContent = queryService.GetExpression("ADH", 69, firstExpr.Key);
    Console.WriteLine(exprContent);
}
else
{
    Console.WriteLine("No expressions found");
}

// Test DumpDataView
Console.WriteLine("\n=== Test: DumpDataView (ADH, 69) ===");
var task = indexCache.GetTask("ADH", 69, 1);
if (task != null)
{
    var dataViewLines = dataViewBuilder.BuildFromLogic(task.LogicLines, task.DataView?.Columns ?? new List<MagicColumn>());
    Console.WriteLine($"Built {dataViewLines.Count} Data View lines:");
    Console.WriteLine("| # | Type | Var | Name | DataType | Table |");
    Console.WriteLine("|---|------|-----|------|----------|-------|");
    foreach (var dvLine in dataViewLines.Take(20))
    {
        Console.WriteLine($"| {dvLine.LineNumber} | {dvLine.LineType} | {dvLine.Variable} | {dvLine.Name} | {dvLine.DataType} | {dvLine.TableId} |");
    }
    if (dataViewLines.Count > 20)
        Console.WriteLine($"... ({dataViewLines.Count - 20} more lines)");
}

Console.WriteLine("\n=== Tests complete ===");
