using MagicMcp.Services;
using MagicMcp.Tools;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ModelContextProtocol.Server;

// Force unbuffered stderr
var stderr = new StreamWriter(Console.OpenStandardError()) { AutoFlush = true };
Console.SetError(stderr);

// Configuration
var projectsBasePath = Environment.GetEnvironmentVariable("MAGIC_PROJECTS_PATH")
    ?? @"D:\Data\Migration\XPA\PMS";

var projectNames = new[] { "ADH", "PBP", "REF", "VIL", "PBG", "PVE" };

void Log(string msg)
{
    stderr.WriteLine(msg);
}

try
{
    // Initialize table mapping service first (used by XmlIndexer)
    Log($"[MagicMcp] Loading table mapping from REF...");
    var tableMappingService = new TableMappingService(projectsBasePath);
    var tableStats = tableMappingService.GetStats();
    Log($"[MagicMcp] Table mapping: {tableStats.WithPublic} tables with PublicName, {tableStats.WithoutPublic} without");

    // Initialize index cache
    Log($"[MagicMcp] Initializing with projects path: {projectsBasePath}");
    var indexCache = new IndexCache(projectsBasePath, projectNames, tableMappingService);
    Log("[MagicMcp] Loading all projects...");
    indexCache.LoadAllProjects();
    Log($"[MagicMcp] Loaded {indexCache.GetTotalProgramCount()} programs from {indexCache.GetProjectNames().Count()} projects");

    // Create query service
    var queryService = new MagicQueryService(indexCache);

    // Build global index for cross-project search
    Log("[MagicMcp] Building global index...");
    var globalIndex = new GlobalIndex(indexCache);
    globalIndex.BuildIndex();
    var stats = globalIndex.GetStats();
    Log($"[MagicMcp] Global index ready: {stats.TotalPrograms} programs, {stats.TotalPublicNames} public names");

    // Build and run MCP server
    var builder = Host.CreateApplicationBuilder(args);

    builder.Services.AddSingleton(tableMappingService);
    builder.Services.AddSingleton(indexCache);
    builder.Services.AddSingleton(queryService);
    builder.Services.AddSingleton(globalIndex);

    builder.Services
        .AddMcpServer()
        .WithStdioServerTransport()
        .WithToolsFromAssembly();

    var app = builder.Build();

    await app.RunAsync();
}
catch (Exception ex)
{
    Log($"[MagicMcp] FATAL ERROR: {ex.GetType().Name}: {ex.Message}");
    Log($"[MagicMcp] Stack: {ex.StackTrace}");
    Environment.Exit(1);
}
