// Standalone indexer for the Magic Knowledge Base
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Indexing;
using Microsoft.Data.Sqlite;
using System.Diagnostics;

// Validate mode: run integrity checks
if (args.Length > 0 && args[0] == "validate")
{
    var validateDb = new KnowledgeDb();
    using var conn = new SqliteConnection($"Data Source={validateDb.DbPath}");
    conn.Open();

    Console.WriteLine("=== Magic Knowledge Base Validation ===");
    Console.WriteLine($"Database: {validateDb.DbPath}");
    var fileInfo = new FileInfo(validateDb.DbPath);
    Console.WriteLine($"Size: {fileInfo.Length / 1024.0 / 1024.0:F2} MB");
    Console.WriteLine();

    int passed = 0, failed = 0, warnings = 0;

    // Check 1: PRAGMA integrity_check
    Console.WriteLine("1. SQLite Integrity Check");
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = "PRAGMA integrity_check";
        var integrityResult = cmd.ExecuteScalar()?.ToString();
        if (integrityResult == "ok")
        {
            Console.WriteLine("   [PASS] Database integrity OK");
            passed++;
        }
        else
        {
            Console.WriteLine($"   [FAIL] Database integrity FAILED: {integrityResult}");
            failed++;
        }
    }

    // Check 2: Foreign key validation
    Console.WriteLine("2. Foreign Key Validation");
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = "PRAGMA foreign_key_check";
        using var reader = cmd.ExecuteReader();
        if (!reader.HasRows)
        {
            Console.WriteLine("   [PASS] All foreign keys valid");
            passed++;
        }
        else
        {
            Console.WriteLine("   [FAIL] Foreign key violations found");
            failed++;
        }
    }

    // Check 3: Table counts
    Console.WriteLine("3. Table Statistics");
    var tableChecks = new[] {
        ("projects", 1),
        ("programs", 100),
        ("tasks", 1000),
        ("expressions", 5000),
        ("program_calls", 100),
        ("tables", 50)
    };
    foreach (var (table, minExpected) in tableChecks)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT COUNT(*) FROM {table}";
        var count = Convert.ToInt32(cmd.ExecuteScalar());
        if (count >= minExpected)
        {
            Console.WriteLine($"   [PASS] {table}: {count:N0} rows");
            passed++;
        }
        else
        {
            Console.WriteLine($"   [WARN] {table}: {count:N0} rows (expected >= {minExpected})");
            warnings++;
        }
    }

    // Check 4: Orphan program_calls
    Console.WriteLine("4. Orphan Detection");
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT COUNT(*) FROM program_calls pc
            WHERE NOT EXISTS (SELECT 1 FROM tasks t WHERE t.id = pc.caller_task_id)";
        var orphans = Convert.ToInt32(cmd.ExecuteScalar());
        if (orphans == 0)
        {
            Console.WriteLine("   [PASS] No orphan callers in program_calls");
            passed++;
        }
        else
        {
            Console.WriteLine($"   [WARN] {orphans} orphan caller references");
            warnings++;
        }
    }

    // Summary
    Console.WriteLine();
    Console.WriteLine("=== VALIDATION SUMMARY ===");
    Console.WriteLine($"Passed:   {passed}");
    Console.WriteLine($"Warnings: {warnings}");
    Console.WriteLine($"Failed:   {failed}");

    return failed == 0 ? 0 : 1;
}

// Query mode: check task forms
if (args.Length > 0 && args[0] == "forms")
{
    var queryDb = new KnowledgeDb();
    using var conn = new SqliteConnection($"Data Source={queryDb.DbPath}");
    conn.Open();

    Console.WriteLine("=== TASK FORMS STATISTICS ===");

    using var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT COUNT(*) FROM task_forms";
    Console.WriteLine($"Total task forms: {cmd.ExecuteScalar()}");

    cmd.CommandText = @"
        SELECT form_name, COUNT(*) as cnt, window_type
        FROM task_forms
        WHERE form_name IS NOT NULL
        GROUP BY form_name
        ORDER BY cnt DESC
        LIMIT 20";
    Console.WriteLine("\nTop 20 form names:");
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        var name = reader[0]?.ToString() ?? "(null)";
        var cnt = reader[1];
        var wtype = reader[2]?.ToString() ?? "?";
        Console.WriteLine($"  [{wtype}] {name} ({cnt}x)");
    }
    return 0;
}

// Query mode: find most complex programs
if (args.Length > 0 && args[0] == "complex")
{
    var queryDb = new KnowledgeDb();
    using var conn = new SqliteConnection($"Data Source={queryDb.DbPath}");
    conn.Open();

    var projects = new[] { "REF", "PBG", "PVE", "VIL", "PBP", "Import" };

    Console.WriteLine("=== TOP 3 PROGRAMMES COMPLEXES PAR PROJET ===");
    Console.WriteLine("(Excluant ADH déjà testé)");
    Console.WriteLine();

    foreach (var proj in projects)
    {
        Console.WriteLine($"=== {proj} ===");
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $@"
            SELECT p.ide_position, p.name, p.public_name, p.task_count, p.expression_count,
                   (SELECT COUNT(*) FROM program_calls pc JOIN tasks t ON pc.caller_task_id = t.id WHERE t.program_id = p.id) as call_count
            FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = '{proj}'
            ORDER BY p.task_count DESC, p.expression_count DESC
            LIMIT 3";

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var ide = reader[0];
            var name = reader[1];
            var pub = reader[2]?.ToString() ?? "(none)";
            var tasks = reader[3];
            var exprs = reader[4];
            var calls = reader[5];
            Console.WriteLine($"  IDE {ide} | Tasks: {tasks} | Exprs: {exprs} | Calls: {calls} | {name} [{pub}]");
        }
        Console.WriteLine();
    }
    return 0;
}

// Query mode: details for a specific program
if (args.Length > 1 && args[0] == "query")
{
    var queryDb = new KnowledgeDb();
    using var conn = new SqliteConnection($"Data Source={queryDb.DbPath}");
    conn.Open();

    var parts = args[1].Split(' ');
    var proj = parts[0];
    var ide = parts.Length > 1 ? parts[1] : "1";

    using var cmd = conn.CreateCommand();
    cmd.CommandText = $@"
        SELECT p.ide_position, p.name, p.public_name, p.task_count, p.expression_count, p.xml_id,
               (SELECT COUNT(*) FROM program_calls pc JOIN tasks t ON pc.caller_task_id = t.id WHERE t.program_id = p.id) as call_count
        FROM programs p
        JOIN projects pr ON p.project_id = pr.id
        WHERE pr.name = '{proj}' AND p.ide_position = {ide}";

    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        Console.WriteLine($"{proj} IDE {reader[0]} - {reader[1]}");
        Console.WriteLine($"  Public Name: {reader[2]}");
        Console.WriteLine($"  Tasks: {reader[3]}");
        Console.WriteLine($"  Expressions: {reader[4]}");
        Console.WriteLine($"  XML ID (Prg_X.xml): {reader[5]}");
        Console.WriteLine($"  Program Calls: {reader[6]}");
    }
    return 0;
}

var projectsBasePath = args.Length > 0 ? args[0] : @"D:\Data\Migration\XPA\PMS";

Console.WriteLine("=== Magic Knowledge Base Indexer ===");
Console.WriteLine($"Base path: {projectsBasePath}");
Console.WriteLine();

// Initialize DB
var db = new KnowledgeDb();
if (!db.IsInitialized())
{
    Console.WriteLine("Initializing database schema...");
    db.InitializeSchema();
}
else
{
    Console.WriteLine("Database already exists, will re-index...");
}

// Progress tracking
var progress = new Progress<IndexProgress>(p =>
{
    Console.WriteLine($"[{p.Phase}] {p.Message}");
});

// Run full indexation
Console.WriteLine();
Console.WriteLine("Starting full indexation...");
var sw = Stopwatch.StartNew();

var indexer = new BatchIndexer(db, projectsBasePath, progress);
var result = await indexer.IndexAllAsync();

sw.Stop();

Console.WriteLine();
Console.WriteLine("===========================================");
Console.WriteLine("           INDEXATION COMPLETE             ");
Console.WriteLine("===========================================");
Console.WriteLine($"Projects indexed:    {result.ProjectsIndexed}");
Console.WriteLine($"Programs indexed:    {result.ProgramsIndexed:N0}");
Console.WriteLine($"Tasks indexed:       {result.TasksIndexed:N0}");
Console.WriteLine($"Expressions indexed: {result.ExpressionsIndexed:N0}");
Console.WriteLine($"Tables indexed:      {result.TablesIndexed:N0}");
Console.WriteLine($"Time elapsed:        {sw.Elapsed.TotalSeconds:F1} seconds");

if (result.HasErrors)
{
    Console.WriteLine();
    Console.WriteLine($"Errors ({result.Errors.Count}):");
    foreach (var error in result.Errors.Take(20))
    {
        Console.WriteLine($"  - {error}");
    }
    if (result.Errors.Count > 20)
    {
        Console.WriteLine($"  ... and {result.Errors.Count - 20} more");
    }
}

// Show final stats
Console.WriteLine();
var stats = db.GetStats();
Console.WriteLine("===========================================");
Console.WriteLine("           DATABASE STATISTICS             ");
Console.WriteLine("===========================================");
Console.WriteLine($"Database size:   {stats.DatabaseSizeBytes / 1024.0 / 1024.0:F1} MB");
Console.WriteLine($"Projects:        {stats.ProjectCount}");
Console.WriteLine($"Programs:        {stats.ProgramCount:N0}");
Console.WriteLine($"Tasks:           {stats.TaskCount:N0}");
Console.WriteLine($"Expressions:     {stats.ExpressionCount:N0}");
Console.WriteLine($"Tables:          {stats.TableCount:N0}");
Console.WriteLine($"Logic Lines:     {stats.LogicLineCount:N0}");
Console.WriteLine($"Program Calls:   {stats.ProgramCallCount:N0}");
Console.WriteLine();
Console.WriteLine($"Database path: {db.DbPath}");

return 0;
