#r "bin/Release/net8.0/MagicMcp.dll"

using MagicMcp.Services;
using MagicMcp.Models;

var projectsBasePath = @"D:\Data\Migration\XPA\PMS";
var projectNames = new[] { "ADH", "PBP", "REF", "VIL", "PBG", "PVE" };

Console.WriteLine("Initializing index cache...");
var indexCache = new IndexCache(projectsBasePath, projectNames);
indexCache.LoadAllProjects();
Console.WriteLine($"Loaded {indexCache.GetTotalProgramCount()} programs");

var queryService = new MagicQueryService(indexCache);

Console.WriteLine("\n=== Test 1: GetPosition (ADH, 69) ===");
var position = queryService.GetPosition("ADH", 69, null);
Console.WriteLine(position);

Console.WriteLine("\n=== Test 2: GetTree (ADH, 69) ===");
var tree = queryService.GetTree("ADH", 69);
Console.WriteLine(tree.Substring(0, Math.Min(1500, tree.Length)));
if (tree.Length > 1500) Console.WriteLine($"... ({tree.Length - 1500} more chars)");

Console.WriteLine("\n=== Test 3: GetDataView (ADH, 69, isn2=1) ===");
var dataView = queryService.GetDataView("ADH", 69, 1);
Console.WriteLine(dataView.Substring(0, Math.Min(2000, dataView.Length)));
if (dataView.Length > 2000) Console.WriteLine($"... ({dataView.Length - 2000} more chars)");

Console.WriteLine("\n=== Test 4: GetLogic (ADH, 69, isn2=1) ===");
var logic = queryService.GetLogic("ADH", 69, 1, null);
Console.WriteLine(logic.Substring(0, Math.Min(2000, logic.Length)));
if (logic.Length > 2000) Console.WriteLine($"... ({logic.Length - 2000} more chars)");

Console.WriteLine("\n=== Test 5: GetExpression (ADH, 69, expr 1) ===");
var expr = queryService.GetExpression("ADH", 69, 1);
Console.WriteLine(expr);

Console.WriteLine("\n=== Tests complete ===");
