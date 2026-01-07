using MagicMcp.Services;
using MagicMcp.Tools;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ModelContextProtocol.Server;

// Configuration
var projectsBasePath = Environment.GetEnvironmentVariable("MAGIC_PROJECTS_PATH")
    ?? @"D:\Data\Migration\XPA\PMS";

var projectNames = new[] { "ADH", "PBP", "REF", "VIL", "PBG", "PVE" };

// Initialize index cache
Console.Error.WriteLine($"[MagicMcp] Initializing with projects path: {projectsBasePath}");
var indexCache = new IndexCache(projectsBasePath, projectNames);
indexCache.LoadAllProjects();
Console.Error.WriteLine($"[MagicMcp] Loaded {indexCache.GetTotalProgramCount()} programs from {indexCache.GetProjectNames().Count()} projects");

// Create query service
var queryService = new MagicQueryService(indexCache);

// Build global index for cross-project search
Console.Error.WriteLine("[MagicMcp] Building global index...");
var globalIndex = new GlobalIndex(indexCache);
globalIndex.BuildIndex();
var stats = globalIndex.GetStats();
Console.Error.WriteLine($"[MagicMcp] Global index ready: {stats.TotalPrograms} programs, {stats.TotalPublicNames} public names");

// Build and run MCP server
var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSingleton(indexCache);
builder.Services.AddSingleton(queryService);
builder.Services.AddSingleton(globalIndex);

builder.Services
    .AddMcpServer()
    .WithStdioServerTransport()
    .WithToolsFromAssembly();

var app = builder.Build();

await app.RunAsync();
