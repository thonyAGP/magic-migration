using MagicMcp.Services;
using MagicMcp.Tools;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Indexing;
using MagicKnowledgeBase.Queries;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ModelContextProtocol.Server;

// Force unbuffered stderr
var stderr = new StreamWriter(Console.OpenStandardError()) { AutoFlush = true };
Console.SetError(stderr);

// Configuration
var projectsBasePath = Environment.GetEnvironmentVariable("MAGIC_PROJECTS_PATH")
    ?? @"D:\Data\Migration\XPA\PMS";

// Use ProjectDiscoveryService for dynamic project discovery
var projectDiscovery = new ProjectDiscoveryService(projectsBasePath);
var projectNames = projectDiscovery.DiscoverProjects();

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

    // Create offset calculator (validated formula for variable offsets)
    var offsetCalculator = new OffsetCalculator(projectsBasePath, indexCache);

    // Create query service (uses offset calculator for automatic offset)
    var queryService = new MagicQueryService(indexCache, offsetCalculator);

    // Build global index for cross-project search
    Log("[MagicMcp] Building global index...");
    var globalIndex = new GlobalIndex(indexCache);
    globalIndex.BuildIndex();
    var stats = globalIndex.GetStats();
    Log($"[MagicMcp] Global index ready: {stats.TotalPrograms} programs, {stats.TotalPublicNames} public names");

    // Initialize Knowledge Base
    Log("[MagicMcp] Initializing Knowledge Base...");
    var knowledgeDb = new KnowledgeDb();
    if (!knowledgeDb.IsInitialized())
    {
        Log("[MagicMcp] Knowledge Base not found, will be created on first reindex");
        knowledgeDb.InitializeSchema();
    }
    else
    {
        var kbStats = knowledgeDb.GetStats();
        Log($"[MagicMcp] Knowledge Base ready: {kbStats.ProgramCount} programs, {kbStats.TableCount} tables");

        // Check for incremental updates
        var incrementalIndexer = new IncrementalIndexer(knowledgeDb, projectsBasePath);
        if (incrementalIndexer.NeedsUpdate())
        {
            Log("[MagicMcp] Knowledge Base needs update, running incremental update...");
            var updateResult = await incrementalIndexer.UpdateAllAsync();
            Log($"[MagicMcp] Incremental update complete: {updateResult.FilesUpdated} files updated in {updateResult.ElapsedMs}ms");
        }
    }

    // Create expression cache service (uses Knowledge Base for persistent storage)
    var expressionCacheService = new ExpressionCacheService(knowledgeDb);
    Log("[MagicMcp] Expression cache service ready");

    // Create migration extractor (queries Knowledge Base for migration specs)
    var migrationExtractor = new MigrationExtractor(knowledgeDb);
    Log("[MagicMcp] Migration extractor ready");

    // Build and run MCP server
    var builder = Host.CreateApplicationBuilder(args);

    builder.Services.AddSingleton(tableMappingService);
    builder.Services.AddSingleton(indexCache);
    builder.Services.AddSingleton(queryService);
    builder.Services.AddSingleton(offsetCalculator);
    builder.Services.AddSingleton(globalIndex);
    builder.Services.AddSingleton(knowledgeDb);
    builder.Services.AddSingleton(expressionCacheService);
    builder.Services.AddSingleton(migrationExtractor);

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
