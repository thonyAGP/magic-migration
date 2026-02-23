#r "bin/Release/net8.0/MagicMcp.dll"

using MagicMcp.Services;
using MagicMcp.Models;

var projectsBasePath = @"D:\Data\Migration\XPA\PMS";
var projectNames = new[] { "ADH", "PBP", "REF", "VIL", "PBG", "PVE" };

Console.WriteLine("Initializing...");
var indexCache = new IndexCache(projectsBasePath, projectNames);
indexCache.LoadAllProjects();

var queryService = new MagicQueryService(indexCache);

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
Console.WriteLine("\n=== Test: First 3 available expressions ===");
var program = indexCache.GetProgram("ADH", 69);
if (program != null && program.Expressions.Count > 0)
{
    Console.WriteLine($"Total expressions: {program.Expressions.Count}");
    foreach (var expr in program.Expressions.Take(3))
    {
        Console.WriteLine($"\n--- Expression {expr.Key} (IDE #{expr.Value.IdePosition}) ---");
        var exprContent = queryService.GetExpression("ADH", 69, expr.Key);
        Console.WriteLine(exprContent);
    }
}
else
{
    Console.WriteLine("No expressions found");
}

Console.WriteLine("\n=== Tests complete ===");
