// Standalone indexer for the Magic Knowledge Base
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Indexing;
using MagicKnowledgeBase.Queries;
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
        ("tables", 50),
        // V9 tables
        ("program_metadata", 100),
        ("task_parameters", 10),
        ("task_information", 100),
        ("task_properties", 100),
        ("task_permissions", 100),
        ("event_handlers", 10),
        ("field_ranges", 1),
        ("form_controls", 10)
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

// Sync patterns mode: import .openspec/patterns/*.md to resolution_patterns table
if (args.Length > 0 && args[0] == "sync-patterns")
{
    var patternsPath = args.Length > 1 ? args[1] : @"D:\Projects\Lecteur_Magic\.openspec\patterns";
    var syncDb = new KnowledgeDb();

    if (!syncDb.IsInitialized())
    {
        Console.WriteLine("ERROR: Knowledge Base not initialized");
        return 1;
    }

    // Apply schema v2 tables if missing (CREATE TABLE IF NOT EXISTS)
    Console.WriteLine("Ensuring schema v2 tables exist...");
    syncDb.InitializeSchema();

    Console.WriteLine("=== Sync Patterns to Knowledge Base ===");
    Console.WriteLine($"Patterns path: {patternsPath}");
    Console.WriteLine();

    if (!Directory.Exists(patternsPath))
    {
        Console.WriteLine($"ERROR: Patterns directory not found: {patternsPath}");
        return 1;
    }

    var mdFiles = Directory.GetFiles(patternsPath, "*.md")
        .Where(f => !Path.GetFileName(f).Equals("README.md", StringComparison.OrdinalIgnoreCase))
        .ToList();

    Console.WriteLine($"Found {mdFiles.Count} pattern file(s)");
    Console.WriteLine();

    int synced = 0;
    foreach (var file in mdFiles)
    {
        var fileName = Path.GetFileNameWithoutExtension(file);
        var content = File.ReadAllText(file);

        // Parse pattern metadata
        string? sourceTicket = null;
        string? rootCauseType = null;
        var symptoms = new List<string>();

        // Extract Source: > **Source**: CMDS-174321
        var sourceMatch = System.Text.RegularExpressions.Regex.Match(content, @">\s*\*\*Source\*\*:\s*([A-Z]+-\d+)");
        if (sourceMatch.Success) sourceTicket = sourceMatch.Groups[1].Value;

        // Extract Type: > **Type**: Bug logique
        var typeMatch = System.Text.RegularExpressions.Regex.Match(content, @">\s*\*\*Type\*\*:\s*(.+)");
        if (typeMatch.Success) rootCauseType = typeMatch.Groups[1].Value.Trim();

        // Extract symptoms from bullet lists
        var symptomMatches = System.Text.RegularExpressions.Regex.Matches(content, @"^-\s*[""']?([^""\r\n]+)[""']?\s*$", System.Text.RegularExpressions.RegexOptions.Multiline);
        foreach (System.Text.RegularExpressions.Match m in symptomMatches)
        {
            var symptom = m.Groups[1].Value.Trim(' ', '"', '\'');
            if (symptom.Length > 3 && !symptom.StartsWith("[") && !symptoms.Contains(symptom))
            {
                symptoms.Add(symptom);
            }
        }

        // Extract solution template
        string solutionTemplate = "";
        var solutionMatch = System.Text.RegularExpressions.Regex.Match(content, @"##\s*Solution\s*type\s*\r?\n([\s\S]*?)(?=\r?\n##\s*[A-Z]|\r?\n---\s*\r?\n\*Pattern|\Z)");
        if (solutionMatch.Success)
        {
            solutionTemplate = solutionMatch.Groups[1].Value.Trim();
            if (solutionTemplate.Length > 2000) solutionTemplate = solutionTemplate[..2000] + "...";
        }

        // Create pattern record
        var pattern = new MagicKnowledgeBase.Models.DbResolutionPattern
        {
            PatternName = fileName,
            SourceTicket = sourceTicket,
            RootCauseType = rootCauseType,
            SymptomKeywords = System.Text.Json.JsonSerializer.Serialize(symptoms.Take(20)),
            SolutionTemplate = solutionTemplate
        };

        // Check if exists
        var existing = syncDb.GetPattern(fileName);
        if (existing != null)
        {
            // Update existing (preserve usage_count)
            using var cmd = syncDb.Connection.CreateCommand();
            cmd.CommandText = @"
                UPDATE resolution_patterns SET
                    symptom_keywords = @keywords,
                    root_cause_type = @cause,
                    solution_template = @solution,
                    source_ticket = @ticket
                WHERE pattern_name = @name";
            cmd.Parameters.AddWithValue("@name", fileName);
            cmd.Parameters.AddWithValue("@keywords", pattern.SymptomKeywords ?? "[]");
            cmd.Parameters.AddWithValue("@cause", (object?)rootCauseType ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@solution", (object?)solutionTemplate ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@ticket", (object?)sourceTicket ?? DBNull.Value);
            cmd.ExecuteNonQuery();
            Console.WriteLine($"  [UPDATE] {fileName} (usage: {existing.UsageCount})");
        }
        else
        {
            // Insert new
            syncDb.InsertPattern(pattern);
            Console.WriteLine($"  [INSERT] {fileName}");
        }
        synced++;
    }

    Console.WriteLine();
    Console.WriteLine($"Synced {synced} patterns");

    // Show current state
    var allPatterns = syncDb.GetAllPatterns().ToList();
    Console.WriteLine();
    Console.WriteLine("=== Patterns in KB ===");
    Console.WriteLine("Name                           | Source      | Type              | Usage");
    Console.WriteLine("-------------------------------|-------------|-------------------|------");
    foreach (var p in allPatterns)
    {
        var name = p.PatternName.Length > 30 ? p.PatternName[..30] : p.PatternName.PadRight(30);
        var source = (p.SourceTicket ?? "-").PadRight(11);
        var type = (p.RootCauseType ?? "-").Length > 17 ? (p.RootCauseType ?? "-")[..17] : (p.RootCauseType ?? "-").PadRight(17);
        Console.WriteLine($"{name} | {source} | {type} | {p.UsageCount}");
    }

    Console.WriteLine();
    Console.WriteLine("=== Sync Complete ===");
    return 0;
}

// Test pattern search
if (args.Length > 0 && args[0] == "search-patterns")
{
    var query = args.Length > 1 ? string.Join(" ", args.Skip(1)) : "date";
    var searchDb = new KnowledgeDb();

    if (!searchDb.IsInitialized())
    {
        Console.WriteLine("ERROR: Knowledge Base not initialized");
        return 1;
    }

    Console.WriteLine($"=== Pattern Search: '{query}' ===");
    Console.WriteLine();

    // Try FTS search
    var ftsResults = searchDb.SearchPatterns(query, 5).ToList();

    if (ftsResults.Count > 0)
    {
        Console.WriteLine("FTS Results:");
        foreach (var r in ftsResults)
        {
            Console.WriteLine($"  [{r.Score:F2}] {r.PatternName} - {r.RootCauseType ?? "-"} (usage: {r.UsageCount})");
        }
    }
    else
    {
        Console.WriteLine("No FTS results, trying keyword search...");

        // Fallback: search in symptom_keywords JSON
        var allPatterns = searchDb.GetAllPatterns().ToList();
        var matches = allPatterns.Where(p =>
            (p.SymptomKeywords?.Contains(query, StringComparison.OrdinalIgnoreCase) == true) ||
            p.PatternName.Contains(query, StringComparison.OrdinalIgnoreCase) ||
            (p.RootCauseType?.Contains(query, StringComparison.OrdinalIgnoreCase) == true))
            .Take(5);

        foreach (var p in matches)
        {
            Console.WriteLine($"  [keyword] {p.PatternName} - {p.RootCauseType ?? "-"} (usage: {p.UsageCount})");
        }
    }

    Console.WriteLine();
    return 0;
}

// Variable lineage test
if (args.Length > 0 && args[0] == "variable-lineage")
{
    var project = args.Length > 1 ? args[1] : "ADH";
    var ide = args.Length > 2 ? int.Parse(args[2]) : 121;
    var varName = args.Length > 3 ? args[3] : "*";

    var lineageDb = new KnowledgeDb();
    if (!lineageDb.IsInitialized())
    {
        Console.WriteLine("ERROR: Knowledge Base not initialized");
        return 1;
    }

    Console.WriteLine($"=== Variable Lineage: {varName} in {project} IDE {ide} ===");
    Console.WriteLine();

    // Get program DB ID
    using var progCmd = lineageDb.Connection.CreateCommand();
    progCmd.CommandText = @"
        SELECT p.id, p.name FROM programs p
        JOIN projects pr ON p.project_id = pr.id
        WHERE pr.name = @project AND p.ide_position = @ide";
    progCmd.Parameters.AddWithValue("@project", project);
    progCmd.Parameters.AddWithValue("@ide", ide);

    long dbProgramId = 0;
    string? programName = null;
    using (var reader = progCmd.ExecuteReader())
    {
        if (!reader.Read())
        {
            Console.WriteLine($"ERROR: Program {project} IDE {ide} not found");
            return 1;
        }
        dbProgramId = reader.GetInt64(0);
        programName = reader.GetString(1);
    }

    Console.WriteLine($"Program: {programName}");
    Console.WriteLine();

    // Find Update/VarSet operations
    using var cmd = lineageDb.Connection.CreateCommand();
    cmd.CommandText = @"
        SELECT t.isn2, ll.line_number, ll.handler, ll.operation, ll.parameters
        FROM logic_lines ll
        JOIN tasks t ON ll.task_id = t.id
        WHERE t.program_id = @prog_id
          AND ll.operation IN ('Update', 'VarSet', 'VarReset')
          AND ll.is_disabled = 0
        ORDER BY t.isn2, ll.line_number
        LIMIT 50";
    cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

    Console.WriteLine("Task  | Line | Handler      | Operation | Parameters (truncated)");
    Console.WriteLine("------|------|--------------|-----------|------------------------");

    int count = 0;
    using (var reader = cmd.ExecuteReader())
    {
        while (reader.Read())
        {
            var taskIsn2 = reader.GetInt32(0);
            var lineNum = reader.GetInt32(1);
            var handler = reader.GetString(2);
            var operation = reader.GetString(3);
            var paramsJson = reader.IsDBNull(4) ? "-" : reader.GetString(4);
            if (paramsJson.Length > 40) paramsJson = paramsJson[..37] + "...";

            Console.WriteLine($"{ide}.{taskIsn2,-3} | {lineNum,4} | {handler,-12} | {operation,-9} | {paramsJson}");
            count++;
        }
    }

    Console.WriteLine();
    Console.WriteLine($"Found {count} variable modification lines");
    return 0;
}

// Migration mode: test MigrationExtractor
if (args.Length > 0 && args[0] == "migration")
{
    var project = args.Length > 1 ? args[1] : "ADH";
    var migrationDb = new KnowledgeDb();
    if (!migrationDb.IsInitialized())
    {
        Console.WriteLine("ERROR: Knowledge Base not initialized");
        return 1;
    }

    var extractor = new MigrationExtractor(migrationDb);

    Console.WriteLine("=== Testing Migration Extractor ===");
    Console.WriteLine();

    // Test 1: List projects
    Console.WriteLine("## 1. Available Projects");
    var projects = extractor.GetAvailableProjects();
    Console.WriteLine($"Found {projects.Count} projects: {string.Join(", ", projects)}");
    Console.WriteLine();

    // Test 2: Project stats
    Console.WriteLine($"## 2. Project Stats - {project}");
    var projStats = extractor.GetProjectStats(project);
    if (projStats != null)
    {
        Console.WriteLine($"  Programs: {projStats.ProgramCount}");
        Console.WriteLine($"  Main Offset: {projStats.MainOffset}");
        Console.WriteLine($"  Total Tasks: {projStats.TotalTasks}");
        Console.WriteLine($"  Total Expressions: {projStats.TotalExpressions}");
        Console.WriteLine($"  Avg Complexity: {projStats.AverageComplexity:F1}");
    }
    else
    {
        Console.WriteLine("  Project not found");
        return 1;
    }
    Console.WriteLine();

    // Test 3: Program inventory (top 10)
    Console.WriteLine($"## 3. Program Inventory - {project} (Top 10)");
    var programs = extractor.GetProgramInventory(project);
    Console.WriteLine($"  Total programs: {programs.Count}");
    Console.WriteLine();
    Console.WriteLine("  IDE | Name                    | Tasks | Expr | Complexity");
    Console.WriteLine("  ----|-------------------------|-------|------|----------");
    foreach (var p in programs.Take(10))
    {
        var name = p.Name.Length > 23 ? p.Name[..23] : p.Name.PadRight(23);
        Console.WriteLine($"  {p.IdePosition,3} | {name} | {p.TaskCount,5} | {p.ExpressionCount,4} | {p.ComplexityScore}");
    }
    Console.WriteLine();

    // Complexity distribution
    var high = programs.Count(p => p.ComplexityScore > 1000);
    var medium = programs.Count(p => p.ComplexityScore >= 100 && p.ComplexityScore <= 1000);
    var low = programs.Count(p => p.ComplexityScore < 100);
    Console.WriteLine($"  Complexity: High(>1000)={high}, Medium(100-1000)={medium}, Low(<100)={low}");
    Console.WriteLine();

    // Test 4: Cross-project dependencies
    Console.WriteLine($"## 4. Cross-Project Dependencies - {project}");
    var deps = extractor.GetCrossProjectDependencies(project);
    Console.WriteLine($"  Incoming calls: {deps.IncomingCalls.Count}");
    if (deps.IncomingCalls.Count > 0)
    {
        var callerProjects = deps.IncomingCalls.Select(c => c.CallerProject).Distinct();
        Console.WriteLine($"    From: {string.Join(", ", callerProjects)}");
    }
    Console.WriteLine($"  Outgoing calls: {deps.OutgoingCalls.Count}");
    if (deps.OutgoingCalls.Count > 0)
    {
        var calleeProjects = deps.OutgoingCalls.Select(c => c.CalleeProject).Distinct();
        Console.WriteLine($"    To: {string.Join(", ", calleeProjects)}");
    }
    Console.WriteLine();

    // Test 5: Table inventory
    Console.WriteLine($"## 5. Table Usage - {project}");
    var tables = extractor.GetTableInventory(project);
    var readCount = tables.Count(t => t.UsageType == "R");
    var writeCount = tables.Count(t => t.UsageType == "W");
    var linkCount = tables.Count(t => t.UsageType == "L");
    Console.WriteLine($"  Read: {readCount} tables");
    Console.WriteLine($"  Write: {writeCount} tables");
    Console.WriteLine($"  Link: {linkCount} tables");
    Console.WriteLine($"  Total unique: {tables.Select(t => t.TableId).Distinct().Count()}");
    Console.WriteLine();

    // Test 6: Forms
    Console.WriteLine($"## 6. UI Forms - {project}");
    var forms = extractor.GetFormInventory(project);
    Console.WriteLine($"  Total forms: {forms.Count}");
    var mdiCount = forms.Count(f => f.WindowType == 2);
    var modalCount = forms.Count(f => f.WindowType == 1);
    Console.WriteLine($"  MDI (type 2): {mdiCount}");
    Console.WriteLine($"  Modal (type 1): {modalCount}");
    Console.WriteLine();

    Console.WriteLine("=== All Tests Passed ===");
    return 0;
}

// Populate ECF shared components registry
if (args.Length > 0 && args[0] == "populate-ecf")
{
    var ecfDb = new KnowledgeDb();
    if (!ecfDb.IsInitialized())
    {
        Console.WriteLine("ERROR: Knowledge Base not initialized");
        return 1;
    }

    Console.WriteLine("=== Populate ECF Shared Components Registry ===");
    Console.WriteLine();

    // Ensure schema v4 tables exist
    ecfDb.InitializeSchema();

    using var conn = ecfDb.Connection;

    // Clear existing data for fresh population
    using (var clearCmd = conn.CreateCommand())
    {
        clearCmd.CommandText = "DELETE FROM shared_components";
        var deleted = clearCmd.ExecuteNonQuery();
        Console.WriteLine($"Cleared {deleted} existing entries");
    }

    int inserted = 0;

    // =====================================================================
    // ADH.ecf - Sessions_Reprises component (30 programs)
    // Used by: PBP, PVE
    // =====================================================================
    Console.WriteLine();
    Console.WriteLine("## ADH.ecf - Sessions_Reprises");

    var adhEcfPrograms = new (int ide, string publicName, string? internalName)[]
    {
        (27, "Separation", "Separation"),
        (28, "Fusion", "Fusion"),
        (53, "EXTRAIT_EASY_CHECKOUT", "EXTRAIT_EASY_CHECKOUT"),
        (54, "FACTURES_CHECK_OUT", "FACTURES_CHECK_OUT"),
        (64, "SOLDE_EASY_CHECK_OUT", "SOLDE_EASY_CHECK_OUT"),
        (65, "EDITION_EASY_CHECK_OUT", "EDITION_EASY_CHECK_OUT"),
        (69, "EXTRAIT_COMPTE", "EXTRAIT_COMPTE"),
        (70, "EXTRAIT_NOM", "EXTRAIT_NOM"),
        (71, "EXTRAIT_DATE", "EXTRAIT_DATE"),
        (72, "EXTRAIT_CUM", "EXTRAIT_CUM"),
        (73, "EXTRAIT_IMP", "EXTRAIT_IMP"),
        (76, "EXTRAIT_SERVICE", "EXTRAIT_SERVICE"),
        (84, "CARACT_INTERDIT", "CARACT_INTERDIT"),
        (97, "Saisie_facture_tva", "Saisie_facture_tva"),
        (111, "GARANTIE", "GARANTIE"),
        (121, "Gestion_Caisse_142", "Gestion_Caisse_142"),
        (149, "CALC_STOCK_PRODUIT", "CALC_STOCK_PRODUIT"),
        (152, "RECUP_CLASSE_MOP", "RECUP_CLASSE_MOP"),
        (178, "GET_PRINTER", "GET_PRINTER"),
        (180, "SET_LIST_NUMBER", "SET_LIST_NUMBER"),
        (181, "RAZ_PRINTER", "RAZ_PRINTER"),
        (185, "CHAINED_LIST_DEFAULT", "CHAINED_LIST_DEFAULT"),
        (192, "SOLDE_COMPTE", "SOLDE_COMPTE"),
        (208, "OPEN_PHONE_LINE", "OPEN_PHONE_LINE"),
        (210, "CLOSE_PHONE_LINE", "CLOSE_PHONE_LINE"),
        (229, "PRINT_TICKET", "PRINT_TICKET"),
        (243, "DEVERSEMENT", "DEVERSEMENT"),
    };

    foreach (var prog in adhEcfPrograms)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO shared_components
            (ecf_name, program_ide_position, program_public_name, program_internal_name, owner_project, used_by_projects, component_group)
            VALUES (@ecf, @ide, @public, @internal, @owner, @usedBy, @group)";
        cmd.Parameters.AddWithValue("@ecf", "ADH.ecf");
        cmd.Parameters.AddWithValue("@ide", prog.ide);
        cmd.Parameters.AddWithValue("@public", prog.publicName);
        cmd.Parameters.AddWithValue("@internal", (object?)prog.internalName ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@owner", "ADH");
        cmd.Parameters.AddWithValue("@usedBy", "[\"PBP\",\"PVE\"]");
        cmd.Parameters.AddWithValue("@group", "Sessions_Reprises");
        cmd.ExecuteNonQuery();
        inserted++;
    }
    Console.WriteLine($"  Inserted {adhEcfPrograms.Length} programs");

    // =====================================================================
    // REF.ecf - Reference tables and shared programs
    // Used by: ADH, PBP, PVE, PBG
    // =====================================================================
    Console.WriteLine();
    Console.WriteLine("## REF.ecf - Tables & Shared Programs");

    // Query REF programs from KB that have public names (likely shared)
    using (var queryCmd = conn.CreateCommand())
    {
        queryCmd.CommandText = @"
            SELECT p.ide_position, p.public_name, p.name
            FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = 'REF'
              AND p.public_name IS NOT NULL
              AND p.public_name != ''
            ORDER BY p.ide_position";

        using var reader = queryCmd.ExecuteReader();
        var refPrograms = new List<(int ide, string publicName, string internalName)>();
        while (reader.Read())
        {
            refPrograms.Add((
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetString(2)
            ));
        }
        reader.Close();

        foreach (var prog in refPrograms)
        {
            using var insertCmd = conn.CreateCommand();
            insertCmd.CommandText = @"
                INSERT INTO shared_components
                (ecf_name, program_ide_position, program_public_name, program_internal_name, owner_project, used_by_projects, component_group)
                VALUES (@ecf, @ide, @public, @internal, @owner, @usedBy, @group)";
            insertCmd.Parameters.AddWithValue("@ecf", "REF.ecf");
            insertCmd.Parameters.AddWithValue("@ide", prog.ide);
            insertCmd.Parameters.AddWithValue("@public", prog.publicName);
            insertCmd.Parameters.AddWithValue("@internal", prog.internalName);
            insertCmd.Parameters.AddWithValue("@owner", "REF");
            insertCmd.Parameters.AddWithValue("@usedBy", "[\"ADH\",\"PBP\",\"PVE\",\"PBG\"]");
            insertCmd.Parameters.AddWithValue("@group", "Tables");
            insertCmd.ExecuteNonQuery();
            inserted++;
        }
        Console.WriteLine($"  Inserted {refPrograms.Count} programs from KB");
    }

    // =====================================================================
    // UTILS.ecf - Utility components
    // Used by: ADH
    // =====================================================================
    Console.WriteLine();
    Console.WriteLine("## UTILS.ecf - Utilities");

    // UTILS.ecf contains 1 program: Calendrier .NET
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            INSERT INTO shared_components
            (ecf_name, program_ide_position, program_public_name, program_internal_name, owner_project, used_by_projects, component_group)
            VALUES (@ecf, @ide, @public, @internal, @owner, @usedBy, @group)";
        cmd.Parameters.AddWithValue("@ecf", "UTILS.ecf");
        cmd.Parameters.AddWithValue("@ide", 1);
        cmd.Parameters.AddWithValue("@public", "Calendrier_NET");
        cmd.Parameters.AddWithValue("@internal", "Calendrier .NET");
        cmd.Parameters.AddWithValue("@owner", "UTILS");
        cmd.Parameters.AddWithValue("@usedBy", "[\"ADH\"]");
        cmd.Parameters.AddWithValue("@group", "DotNet");
        cmd.ExecuteNonQuery();
        inserted++;
    }
    Console.WriteLine($"  Inserted 1 program");

    // =====================================================================
    // Summary
    // =====================================================================
    Console.WriteLine();
    Console.WriteLine("=== ECF Registry Summary ===");

    using (var statsCmd = conn.CreateCommand())
    {
        statsCmd.CommandText = @"
            SELECT ecf_name, COUNT(*) as cnt, owner_project
            FROM shared_components
            GROUP BY ecf_name
            ORDER BY cnt DESC";

        Console.WriteLine("ECF File     | Programs | Owner");
        Console.WriteLine("-------------|----------|------");
        using var reader = statsCmd.ExecuteReader();
        while (reader.Read())
        {
            var ecf = reader.GetString(0).PadRight(12);
            var cnt = reader.GetInt32(1);
            var owner = reader.GetString(2);
            Console.WriteLine($"{ecf} | {cnt,8} | {owner}");
        }
    }

    Console.WriteLine();
    Console.WriteLine($"Total: {inserted} shared components registered");
    Console.WriteLine();
    Console.WriteLine("Use MCP tools to query:");
    Console.WriteLine("  - magic_ecf_list: List all ECF files");
    Console.WriteLine("  - magic_ecf_programs <ecf>: List programs in ECF");
    Console.WriteLine("  - magic_ecf_usedby <name>: Find who uses a program");
    Console.WriteLine("  - magic_ecf_dependencies <project>: Show project dependencies");

    return 0;
}

// Analyze change impact
if (args.Length > 0 && args[0] == "analyze-impact")
{
    var impactDb = new KnowledgeDb();
    if (!impactDb.IsInitialized())
    {
        Console.WriteLine("ERROR: Knowledge Base not initialized");
        return 1;
    }

    // Ensure schema v5 tables exist
    impactDb.InitializeSchema();

    var project = args.Length > 1 ? args[1] : "ADH";
    var ide = args.Length > 2 ? int.Parse(args[2]) : 121;

    Console.WriteLine($"=== Change Impact Analysis: {project} IDE {ide} ===");
    Console.WriteLine();

    // Get program info
    using var progCmd = impactDb.Connection.CreateCommand();
    progCmd.CommandText = @"
        SELECT p.id, p.name, p.public_name, p.task_count, p.expression_count
        FROM programs p
        JOIN projects pr ON p.project_id = pr.id
        WHERE pr.name = @project AND p.ide_position = @ide";
    progCmd.Parameters.AddWithValue("@project", project);
    progCmd.Parameters.AddWithValue("@ide", ide);

    long dbProgramId = 0;
    string? programName = null;
    string? publicName = null;

    using (var reader = progCmd.ExecuteReader())
    {
        if (!reader.Read())
        {
            Console.WriteLine($"ERROR: Program {project} IDE {ide} not found");
            return 1;
        }
        dbProgramId = reader.GetInt64(0);
        programName = reader.GetString(1);
        publicName = reader.IsDBNull(2) ? null : reader.GetString(2);
    }

    Console.WriteLine($"Program: {programName}");
    if (!string.IsNullOrEmpty(publicName))
        Console.WriteLine($"Public Name: {publicName}");
    Console.WriteLine();

    // 1. Callers
    Console.WriteLine("## CALLERS (programs that call this)");
    using var callersCmd = impactDb.Connection.CreateCommand();
    callersCmd.CommandText = @"
        SELECT pr.name, p.ide_position, p.name
        FROM program_calls pc
        JOIN tasks t ON pc.caller_task_id = t.id
        JOIN programs p ON t.program_id = p.id
        JOIN projects pr ON p.project_id = pr.id
        WHERE pc.callee_program_id = @prog_id
        ORDER BY pr.name, p.ide_position
        LIMIT 20";
    callersCmd.Parameters.AddWithValue("@prog_id", dbProgramId);

    int callerCount = 0;
    int crossProjectCallers = 0;
    using (var reader = callersCmd.ExecuteReader())
    {
        while (reader.Read())
        {
            var callerProject = reader.GetString(0);
            var callerIde = reader.GetInt32(1);
            var callerName = reader.GetString(2);
            var severity = callerProject == project ? "HIGH" : "CRITICAL";
            Console.WriteLine($"  [{severity}] {callerProject} IDE {callerIde} - {callerName}");
            callerCount++;
            if (callerProject != project) crossProjectCallers++;
        }
    }
    if (callerCount == 0)
        Console.WriteLine("  (no callers - entry point or leaf)");
    Console.WriteLine();

    // 2. Callees
    Console.WriteLine("## CALLEES (programs this calls)");
    using var calleesCmd = impactDb.Connection.CreateCommand();
    calleesCmd.CommandText = @"
        SELECT pr.name, p.ide_position, p.name
        FROM program_calls pc
        JOIN tasks t ON pc.caller_task_id = t.id
        JOIN programs p ON pc.callee_program_id = p.id
        JOIN projects pr ON p.project_id = pr.id
        WHERE t.program_id = @prog_id
        ORDER BY pr.name, p.ide_position
        LIMIT 20";
    calleesCmd.Parameters.AddWithValue("@prog_id", dbProgramId);

    int calleeCount = 0;
    using (var reader = calleesCmd.ExecuteReader())
    {
        while (reader.Read())
        {
            var calleeProject = reader.GetString(0);
            var calleeIde = reader.GetInt32(1);
            var calleeName = reader.GetString(2);
            var impact = calleeProject != project ? "cross-project" : "internal";
            Console.WriteLine($"  [{impact}] {calleeProject} IDE {calleeIde} - {calleeName}");
            calleeCount++;
        }
    }
    if (calleeCount == 0)
        Console.WriteLine("  (no callees)");
    Console.WriteLine();

    // 3. Tables
    Console.WriteLine("## TABLE DEPENDENCIES");
    using var tablesCmd = impactDb.Connection.CreateCommand();
    tablesCmd.CommandText = @"
        SELECT DISTINCT tu.table_id, tu.table_name, tu.usage_type
        FROM table_usage tu
        JOIN tasks t ON tu.task_id = t.id
        WHERE t.program_id = @prog_id
        ORDER BY tu.usage_type, tu.table_name";
    tablesCmd.Parameters.AddWithValue("@prog_id", dbProgramId);

    int tableCount = 0;
    using (var reader = tablesCmd.ExecuteReader())
    {
        while (reader.Read())
        {
            var tableId = reader.GetInt32(0);
            var tableName = reader.IsDBNull(1) ? $"(ID {tableId})" : reader.GetString(1);
            var usage = reader.GetString(2) switch { "R" => "Read", "W" => "Write", "L" => "Link", var u => u };
            Console.WriteLine($"  [{usage}] {tableName}");
            tableCount++;
        }
    }
    if (tableCount == 0)
        Console.WriteLine("  (no tables)");
    Console.WriteLine();

    // 4. ECF membership
    Console.WriteLine("## ECF MEMBERSHIP");
    using var ecfCmd = impactDb.Connection.CreateCommand();
    ecfCmd.CommandText = @"
        SELECT ecf_name, component_group, used_by_projects
        FROM shared_components
        WHERE owner_project = @project AND program_ide_position = @ide";
    ecfCmd.Parameters.AddWithValue("@project", project);
    ecfCmd.Parameters.AddWithValue("@ide", ide);

    bool isShared = false;
    using (var reader = ecfCmd.ExecuteReader())
    {
        if (reader.Read())
        {
            isShared = true;
            var ecfName = reader.GetString(0);
            var group = reader.IsDBNull(1) ? "-" : reader.GetString(1);
            var usedBy = reader.IsDBNull(2) ? "[]" : reader.GetString(2);
            Console.WriteLine($"  SHARED via {ecfName} ({group})");
            Console.WriteLine($"  Used by: {usedBy}");
            Console.WriteLine($"  WARNING: Changes affect ALL projects using this ECF!");
        }
        else
        {
            Console.WriteLine("  (not part of shared ECF)");
        }
    }
    Console.WriteLine();

    // Summary
    Console.WriteLine("=== IMPACT SUMMARY ===");
    Console.WriteLine($"  Callers: {callerCount} ({crossProjectCallers} cross-project)");
    Console.WriteLine($"  Callees: {calleeCount}");
    Console.WriteLine($"  Tables: {tableCount}");
    Console.WriteLine($"  Shared ECF: {(isShared ? "YES" : "no")}");
    Console.WriteLine();

    string risk;
    if (crossProjectCallers > 0 || isShared)
        risk = "CRITICAL";
    else if (callerCount > 5)
        risk = "HIGH";
    else if (callerCount > 0)
        risk = "MEDIUM";
    else
        risk = "LOW";

    Console.WriteLine($"  RISK LEVEL: {risk}");
    Console.WriteLine();
    Console.WriteLine("Use MCP tools for detailed analysis:");
    Console.WriteLine("  - magic_impact_program: Full program impact");
    Console.WriteLine("  - magic_impact_table: Table impact");
    Console.WriteLine("  - magic_impact_expression: Expression impact");
    Console.WriteLine("  - magic_impact_crossproject: Cross-project analysis");

    return 0;
}

// Export spec data as JSON for PowerShell script
if (args.Length > 1 && args[0] == "spec-data")
{
    var specDb = new KnowledgeDb();
    if (!specDb.IsInitialized())
    {
        Console.WriteLine("ERROR: Knowledge Base not initialized");
        return 1;
    }

    var parts = args[1].Split(' ');
    var project = parts[0];
    var ide = parts.Length > 1 ? int.Parse(parts[1]) : 1;

    using var conn = new SqliteConnection($"Data Source={specDb.DbPath}");
    conn.Open();

    // Get program DB ID and info
    long dbProgramId = 0;
    string? programName = null;
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT p.id, p.name FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        cmd.Parameters.AddWithValue("@project", project);
        cmd.Parameters.AddWithValue("@ide", ide);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
        {
            Console.WriteLine($"{{\"error\": \"Program {project} IDE {ide} not found\"}}");
            return 1;
        }
        dbProgramId = reader.GetInt64(0);
        programName = reader.GetString(1);
    }

    // Get tables WITH REAL NAMES from REF tables
    var tables = new List<object>();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT DISTINCT
                tu.table_id,
                COALESCE(tbl.logical_name, tu.table_name, 'Table_' || tu.table_id) as logical_name,
                COALESCE(tbl.physical_name, '') as physical_name,
                tu.usage_type,
                COUNT(*)
            FROM table_usage tu
            JOIN tasks t ON tu.task_id = t.id
            LEFT JOIN tables tbl ON tbl.xml_id = tu.table_id
            WHERE t.program_id = @prog_id
            GROUP BY tu.table_id, logical_name, physical_name, tu.usage_type
            ORDER BY tu.table_id";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            tables.Add(new {
                id = reader.GetInt32(0),
                logical = reader.GetString(1),
                physical = reader.IsDBNull(2) ? "" : reader.GetString(2),
                access = reader.GetString(3),
                count = reader.GetInt32(4)
            });
        }
    }

    // Get callers
    var callers = new List<object>();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT p.ide_position, p.name, COUNT(*)
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs p ON t.program_id = p.id
            WHERE pc.callee_program_id = @prog_id
            GROUP BY p.ide_position, p.name
            ORDER BY COUNT(*) DESC LIMIT 20";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            callers.Add(new { ide = reader.GetInt32(0), name = reader.GetString(1), count = reader.GetInt32(2) });
        }
    }

    // Get callees
    var callees = new List<object>();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT p.ide_position, p.name, COUNT(*)
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs p ON pc.callee_program_id = p.id
            WHERE t.program_id = @prog_id
            GROUP BY p.ide_position, p.name
            ORDER BY COUNT(*) DESC LIMIT 20";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            callees.Add(new { ide = reader.GetInt32(0), name = reader.GetString(1), count = reader.GetInt32(2) });
        }
    }

    // Get TOP 20 expressions with content
    var expressions = new List<object>();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT e.ide_position, e.content, COALESCE(e.comment, '')
            FROM expressions e
            WHERE e.program_id = @prog_id
            ORDER BY e.ide_position
            LIMIT 20";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            expressions.Add(new {
                ide = reader.GetInt32(0),
                content = reader.GetString(1),
                comment = reader.GetString(2)
            });
        }
    }

    // Get expression count
    int exprCount = 0;
    int totalExpressions = 0;
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"SELECT COUNT(*) FROM expressions WHERE program_id = @prog_id";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);
        exprCount = Convert.ToInt32(cmd.ExecuteScalar());
    }
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"SELECT COUNT(*) FROM expressions";
        totalExpressions = Convert.ToInt32(cmd.ExecuteScalar());
    }

    // Get input parameters (DataView columns with Parameter source)
    var parameters = new List<object>();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT DISTINCT dc.variable, dc.name, dc.data_type, dc.picture
            FROM dataview_columns dc
            JOIN tasks t ON dc.task_id = t.id
            WHERE t.program_id = @prog_id
              AND t.isn2 = 1
              AND dc.source LIKE '%Parameter%'
            ORDER BY dc.line_number
            LIMIT 30";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            parameters.Add(new {
                variable = reader.GetString(0),
                name = reader.GetString(1),
                type = reader.GetString(2),
                picture = reader.IsDBNull(3) ? "" : reader.GetString(3)
            });
        }
    }

    // Get statistics
    int taskCount = 0;
    int logicLineCount = 0;
    int disabledLineCount = 0;
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT
                COUNT(DISTINCT t.id),
                COALESCE(SUM(t.logic_line_count), 0),
                (SELECT COUNT(*) FROM logic_lines ll JOIN tasks t2 ON ll.task_id = t2.id WHERE t2.program_id = @prog_id AND ll.is_disabled = 1)
            FROM tasks t
            WHERE t.program_id = @prog_id";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            taskCount = reader.GetInt32(0);
            logicLineCount = reader.GetInt32(1);
            disabledLineCount = reader.GetInt32(2);
        }
    }

    // Get call chain from Main (recursive callers up to Main)
    var callChain = new List<object>();
    var visited = new HashSet<long>();
    var queue = new Queue<(long progId, int level)>();
    queue.Enqueue((dbProgramId, 0));
    visited.Add(dbProgramId);

    while (queue.Count > 0 && callChain.Count < 10)
    {
        var (currentProgId, level) = queue.Dequeue();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT p.id, p.ide_position, p.name
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs p ON t.program_id = p.id
            WHERE pc.callee_program_id = @prog_id
            ORDER BY p.ide_position
            LIMIT 5";
        cmd.Parameters.AddWithValue("@prog_id", currentProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var callerId = reader.GetInt64(0);
            var callerIde = reader.GetInt32(1);
            var callerName = reader.GetString(2);

            if (!visited.Contains(callerId))
            {
                callChain.Add(new { ide = callerIde, name = callerName, level = level + 1 });
                visited.Add(callerId);
                if (callerIde != 1) // Stop at Main
                {
                    queue.Enqueue((callerId, level + 1));
                }
            }
        }
    }

    // Output as JSON
    var specData = new
    {
        program = programName,
        ide = ide,
        dbProgramId = dbProgramId,  // DEBUG
        tables = tables,
        callers = callers,
        callees = callees,
        expressions = expressions,
        expressionCount = exprCount,
        parameters = parameters,
        statistics = new {
            taskCount = taskCount,
            logicLineCount = logicLineCount,
            disabledLineCount = disabledLineCount
        },
        callChain = callChain
    };

    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(specData));
    return 0;
}

// =====================================================================
// ALGORIGRAMME DATA: Extract structured data for business flow diagram
// =====================================================================
if (args.Length > 1 && args[0] == "algo-data")
{
    var algoDb = new KnowledgeDb();
    if (!algoDb.IsInitialized())
    {
        Console.WriteLine("{\"error\": \"Knowledge Base not initialized\"}");
        return 1;
    }

    var algoParts = args[1].Split(' ');
    var algoProject = algoParts[0];
    var algoIde = algoParts.Length > 1 ? int.Parse(algoParts[1]) : 1;

    using var algoConn = new SqliteConnection($"Data Source={algoDb.DbPath}");
    algoConn.Open();

    // Get program DB ID and info
    long algoProgId = 0;
    string? algoProgName = null;
    string? algoPublicName = null;
    using (var cmd = algoConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT p.id, p.name, p.public_name FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        cmd.Parameters.AddWithValue("@project", algoProject);
        cmd.Parameters.AddWithValue("@ide", algoIde);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
        {
            Console.WriteLine($"{{\"error\": \"Program {algoProject} IDE {algoIde} not found\"}}");
            return 1;
        }
        algoProgId = reader.GetInt64(0);
        algoProgName = reader.GetString(1);
        algoPublicName = reader.IsDBNull(2) ? null : reader.GetString(2);
    }

    // 1. TASK TREE: hierarchical task structure
    var algoTasks = new List<object>();
    using (var cmd = algoConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT t.isn2, t.description, t.level, t.parent_isn2, t.task_type,
                   t.logic_line_count, t.main_source_table_id, t.main_source_access,
                   COALESCE(ti.open_task_window, '') as has_form,
                   COALESCE(ti.initial_mode, '') as initial_mode
            FROM tasks t
            LEFT JOIN task_information ti ON ti.task_id = t.id
            WHERE t.program_id = @prog_id
            ORDER BY t.isn2";
        cmd.Parameters.AddWithValue("@prog_id", algoProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            algoTasks.Add(new {
                isn2 = reader.GetInt32(0),
                name = reader.GetString(1),
                level = reader.GetInt32(2),
                parent_isn2 = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3),
                task_type = reader.GetString(4),
                logic_lines = reader.GetInt32(5),
                source_table = reader.IsDBNull(6) ? (int?)null : reader.GetInt32(6),
                source_access = reader.IsDBNull(7) ? "" : reader.GetString(7),
                has_form = reader.GetString(8) == "Y",
                initial_mode = reader.GetString(9)
            });
        }
    }

    // 2a. VARIABLE MAPPING: Load DataView columns for decoding {N,Y} references
    // Map: field_id (from {0,Y}) -> { letter, name }
    var varMapping = new Dictionary<int, (string letter, string name)>();
    using (var cmd = algoConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT dc.line_number, dc.variable, dc.name
            FROM dataview_columns dc
            JOIN tasks t ON dc.task_id = t.id
            WHERE t.program_id = @prog_id AND t.isn2 = 1
            ORDER BY dc.line_number";
        cmd.Parameters.AddWithValue("@prog_id", algoProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var lineNum = reader.GetInt32(0);
            var varLetter = reader.IsDBNull(1) ? "" : reader.GetString(1);
            var varName = reader.IsDBNull(2) ? "" : reader.GetString(2);
            varMapping[lineNum] = (varLetter, varName);
        }
    }

    // Helper: Decode {N,Y} references in an expression
    static string AlgoDecodeExpression(string expr, Dictionary<int, (string letter, string name)> mapping)
    {
        if (string.IsNullOrWhiteSpace(expr)) return expr;

        // Replace {0,Y} -> name [LETTER] or [LETTER]
        var decoded = System.Text.RegularExpressions.Regex.Replace(expr, @"\{0,(\d+)\}", m =>
        {
            var fieldId = int.Parse(m.Groups[1].Value);
            var letter = FieldToLetter(fieldId);

            if (mapping.TryGetValue(fieldId, out var info) && !string.IsNullOrEmpty(info.name))
            {
                var name = info.name.Length > 25 ? info.name[..22] + "..." : info.name;
                return $"{name} [{letter}]";
            }
            return $"[{letter}]";
        });

        // Replace {32768,Y} -> VGY
        decoded = System.Text.RegularExpressions.Regex.Replace(decoded, @"\{32768,(\d+)\}", m =>
        {
            return $"VG{m.Groups[1].Value}";
        });

        // Replace other {N,Y} (parent refs) -> [Parent.LETTER]
        decoded = System.Text.RegularExpressions.Regex.Replace(decoded, @"\{(\d+),(\d+)\}", m =>
        {
            var level = int.Parse(m.Groups[1].Value);
            var fieldId = int.Parse(m.Groups[2].Value);
            if (level > 0 && level < 32768)
            {
                var letter = FieldToLetter(fieldId);
                return $"[P{level}.{letter}]";
            }
            return m.Value; // keep as-is
        });

        return decoded;
    }

    // 2b. CONDITIONS: IF/CASE expressions (business decisions) - WITH DECODE
    var algoConditions = new List<object>();
    using (var cmd = algoConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT e.ide_position, e.content, COALESCE(e.comment, ''),
                   COALESCE(e.exp_type, '')
            FROM expressions e
            WHERE e.program_id = @prog_id
              AND (e.content LIKE 'IF(%' OR e.content LIKE 'CASE(%'
                   OR e.exp_type = 'L')
            ORDER BY e.ide_position";
        cmd.Parameters.AddWithValue("@prog_id", algoProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var rawContent = reader.GetString(1);
            algoConditions.Add(new {
                ide = reader.GetInt32(0),
                content = rawContent,
                decoded = AlgoDecodeExpression(rawContent, varMapping),
                comment = reader.GetString(2),
                exp_type = reader.GetString(3)
            });
        }
    }

    // 3. TABLES WRITE: tables with side-effects (INSERT/UPDATE/DELETE)
    // Source 1: table_usage entries with W/I/D access
    // Source 2: task main_source_table with source_access W/C/D (C=Create=Insert)
    var algoTablesWrite = new List<object>();
    using (var cmd = algoConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT DISTINCT table_id, name, physical, access FROM (
                -- From table_usage
                SELECT
                    tu.table_id,
                    COALESCE(tbl.logical_name, tu.table_name, 'Table_' || tu.table_id) as name,
                    COALESCE(tbl.physical_name, '') as physical,
                    tu.usage_type as access
                FROM table_usage tu
                JOIN tasks t ON tu.task_id = t.id
                LEFT JOIN tables tbl ON tbl.xml_id = tu.table_id
                WHERE t.program_id = @prog_id AND tu.usage_type IN ('W', 'I', 'D')

                UNION

                -- From task source tables with write/create access
                SELECT
                    t.main_source_table_id as table_id,
                    COALESCE(tbl.logical_name, 'Table_' || t.main_source_table_id) as name,
                    COALESCE(tbl.physical_name, '') as physical,
                    t.main_source_access as access
                FROM tasks t
                LEFT JOIN tables tbl ON tbl.xml_id = t.main_source_table_id
                WHERE t.program_id = @prog_id
                  AND t.main_source_table_id IS NOT NULL
                  AND t.main_source_access IN ('W', 'C', 'D')
            )
            ORDER BY table_id";
        cmd.Parameters.AddWithValue("@prog_id", algoProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            algoTablesWrite.Add(new {
                id = reader.GetInt32(0),
                name = reader.GetString(1),
                physical = reader.GetString(2),
                access = reader.GetString(3)
            });
        }
    }

    // 4. CALLEES: sub-programs called
    var algoCallees = new List<object>();
    using (var cmd = algoConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT p.ide_position, p.name, COALESCE(p.public_name, '') as public_name, COUNT(*)
            FROM program_calls pc
            JOIN tasks t ON pc.caller_task_id = t.id
            JOIN programs p ON pc.callee_program_id = p.id
            WHERE t.program_id = @prog_id
            GROUP BY p.ide_position, p.name, p.public_name
            ORDER BY COUNT(*) DESC";
        cmd.Parameters.AddWithValue("@prog_id", algoProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            algoCallees.Add(new {
                ide = reader.GetInt32(0),
                name = reader.GetString(1),
                public_name = reader.GetString(2),
                count = reader.GetInt32(3)
            });
        }
    }

    // 5. PARAMETERS: IN/OUT parameters
    var algoParams = new List<object>();
    using (var cmd = algoConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT DISTINCT dc.variable, dc.name, dc.data_type, dc.picture
            FROM dataview_columns dc
            JOIN tasks t ON dc.task_id = t.id
            WHERE t.program_id = @prog_id
              AND t.isn2 = 1
              AND dc.source LIKE '%Parameter%'
            ORDER BY dc.line_number
            LIMIT 30";
        cmd.Parameters.AddWithValue("@prog_id", algoProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            algoParams.Add(new {
                variable = reader.GetString(0),
                name = reader.GetString(1),
                type = reader.GetString(2),
                picture = reader.IsDBNull(3) ? "" : reader.GetString(3)
            });
        }
    }

    // 6. DOMAIN KEYWORDS: extract from task names and program name
    var keywordSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "task", "tache", "traitement", "gestion", "programme", "main",
        "init", "raz", "test", "verif", "debut", "fin", "the", "and",
        "avec", "pour", "dans", "par", "les", "des", "une", "sur"
    };

    // From program name
    if (algoProgName != null)
    {
        foreach (var word in algoProgName.Split(new[] { ' ', '_', '-', '/' }, StringSplitOptions.RemoveEmptyEntries))
        {
            if (word.Length > 2 && !stopWords.Contains(word))
                keywordSet.Add(word);
        }
    }
    if (algoPublicName != null)
    {
        foreach (var word in algoPublicName.Split(new[] { ' ', '_', '-', '/' }, StringSplitOptions.RemoveEmptyEntries))
        {
            if (word.Length > 2 && !stopWords.Contains(word))
                keywordSet.Add(word);
        }
    }

    // From task descriptions (root tasks = level 1,2)
    using (var cmd = algoConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT DISTINCT t.description
            FROM tasks t
            WHERE t.program_id = @prog_id AND t.level <= 2";
        cmd.Parameters.AddWithValue("@prog_id", algoProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var desc = reader.GetString(0);
            foreach (var word in desc.Split(new[] { ' ', '_', '-', '/' }, StringSplitOptions.RemoveEmptyEntries))
            {
                if (word.Length > 2 && !stopWords.Contains(word))
                    keywordSet.Add(word);
            }
        }
    }

    // Output as JSON
    var algoData = new
    {
        program = algoProgName,
        public_name = algoPublicName ?? "",
        project = algoProject,
        ide = algoIde,
        tasks = algoTasks,
        conditions = algoConditions,
        tables_write = algoTablesWrite,
        callees = algoCallees,
        parameters = algoParams,
        domain_keywords = keywordSet.OrderBy(k => k).ToArray(),
        statistics = new {
            task_count = algoTasks.Count,
            condition_count = algoConditions.Count,
            tables_write_count = algoTablesWrite.Count,
            callee_count = algoCallees.Count,
            parameter_count = algoParams.Count
        }
    };

    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(algoData,
        new System.Text.Json.JsonSerializerOptions { WriteIndented = false }));
    return 0;
}

// =====================================================================
// PHASE 2 SUPPORT: Structural table-to-column mapping
// =====================================================================
if (args.Length > 1 && args[0] == "table-columns")
{
    var tcDb = new KnowledgeDb();
    if (!tcDb.IsInitialized())
    {
        Console.WriteLine("{\"error\": \"Knowledge Base not initialized\"}");
        return 1;
    }

    var tcParts = args[1].Split(' ');
    var tcProject = tcParts[0];
    var tcIde = tcParts.Length > 1 ? int.Parse(tcParts[1]) : 1;

    using var tcConn = new SqliteConnection($"Data Source={tcDb.DbPath}");
    tcConn.Open();

    // Get program DB ID
    long tcProgId = 0;
    string? tcProgName = null;
    using (var cmd = tcConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT p.id, p.name FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        cmd.Parameters.AddWithValue("@project", tcProject);
        cmd.Parameters.AddWithValue("@ide", tcIde);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
        {
            Console.WriteLine($"{{\"error\": \"Program {tcProject} IDE {tcIde} not found\"}}");
            return 1;
        }
        tcProgId = reader.GetInt64(0);
        tcProgName = reader.GetString(1);
    }

    // Query: Real columns (definition='R') grouped by main_source_table_id
    var tableColumnsDict = new Dictionary<string, List<object>>();
    var seenPerTable = new Dictionary<string, HashSet<string>>();

    using (var cmd = tcConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT
                t.main_source_table_id,
                dc.variable,
                dc.name,
                dc.data_type,
                dc.picture,
                dc.definition
            FROM dataview_columns dc
            JOIN tasks t ON dc.task_id = t.id
            WHERE t.program_id = @prog_id
              AND t.main_source_table_id IS NOT NULL
              AND t.main_source_table_id > 0
              AND dc.definition = 'R'
            ORDER BY t.main_source_table_id, dc.line_number";
        cmd.Parameters.AddWithValue("@prog_id", tcProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var tableId = reader.GetInt32(0).ToString();
            var variable = reader.GetString(1);
            var colName = reader.GetString(2);
            var dataType = reader.GetString(3);
            var picture = reader.IsDBNull(4) ? "" : reader.GetString(4);
            var letter = VarToLetter(variable);

            if (!seenPerTable.ContainsKey(tableId))
                seenPerTable[tableId] = new HashSet<string>();

            if (seenPerTable[tableId].Contains(letter)) continue;
            seenPerTable[tableId].Add(letter);

            if (!tableColumnsDict.ContainsKey(tableId))
                tableColumnsDict[tableId] = new List<object>();

            tableColumnsDict[tableId].Add(new
            {
                letter,
                name = colName,
                data_type = dataType,
                picture
            });
        }
    }

    // Also capture Virtual/Parameter columns per table for completeness
    // (these are variables in tasks that use a given table, but aren't Real columns)
    var tableAllColumnsDict = new Dictionary<string, List<object>>();
    var seenAllPerTable = new Dictionary<string, HashSet<string>>();

    using (var cmd = tcConn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT
                t.main_source_table_id,
                dc.variable,
                dc.name,
                dc.data_type,
                dc.definition
            FROM dataview_columns dc
            JOIN tasks t ON dc.task_id = t.id
            WHERE t.program_id = @prog_id
              AND t.main_source_table_id IS NOT NULL
              AND t.main_source_table_id > 0
              AND dc.definition IN ('V', 'P')
            ORDER BY t.main_source_table_id, dc.line_number";
        cmd.Parameters.AddWithValue("@prog_id", tcProgId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var tableId = reader.GetInt32(0).ToString();
            var variable = reader.GetString(1);
            var colName = reader.GetString(2);
            var dataType = reader.GetString(3);
            var def = reader.GetString(4);
            var letter = VarToLetter(variable);

            if (!seenAllPerTable.ContainsKey(tableId))
                seenAllPerTable[tableId] = new HashSet<string>();

            if (seenAllPerTable[tableId].Contains(letter)) continue;
            seenAllPerTable[tableId].Add(letter);

            if (!tableAllColumnsDict.ContainsKey(tableId))
                tableAllColumnsDict[tableId] = new List<object>();

            tableAllColumnsDict[tableId].Add(new
            {
                letter,
                name = colName,
                data_type = dataType,
                definition = def
            });
        }
    }

    var tcResult = new
    {
        program = tcProgName,
        ide = tcIde,
        table_columns = tableColumnsDict,
        table_other_vars = tableAllColumnsDict,
        statistics = new
        {
            tables_with_real_columns = tableColumnsDict.Count,
            total_real_columns = tableColumnsDict.Values.Sum(v => v.Count),
            tables_with_other_vars = tableAllColumnsDict.Count
        }
    };

    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(tcResult));
    return 0;
}

// =====================================================================
// PHASE 2 SUPPORT: Extract variables with letter conversion
// =====================================================================
if (args.Length > 1 && args[0] == "variables")
{
    var varDb = new KnowledgeDb();
    if (!varDb.IsInitialized())
    {
        Console.WriteLine("{\"error\": \"Knowledge Base not initialized\"}");
        return 1;
    }

    var parts = args[1].Split(' ');
    var project = parts[0];
    var ide = parts.Length > 1 ? int.Parse(parts[1]) : 1;

    using var conn = new SqliteConnection($"Data Source={varDb.DbPath}");
    conn.Open();

    // Get program DB ID
    long dbProgramId = 0;
    string? programName = null;
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT p.id, p.name FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        cmd.Parameters.AddWithValue("@project", project);
        cmd.Parameters.AddWithValue("@ide", ide);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
        {
            Console.WriteLine($"{{\"error\": \"Program {project} IDE {ide} not found\"}}");
            return 1;
        }
        dbProgramId = reader.GetInt64(0);
        programName = reader.GetString(1);
    }

    // Extract all variables from DataView columns
    var localVars = new List<object>();
    var virtualVars = new List<object>();
    var globalVars = new List<object>();
    var paramVars = new List<object>();

    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT DISTINCT
                dc.variable,
                dc.name,
                dc.data_type,
                dc.picture,
                dc.source,
                t.isn2 as task_isn2
            FROM dataview_columns dc
            JOIN tasks t ON dc.task_id = t.id
            WHERE t.program_id = @prog_id
            ORDER BY dc.variable";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var variable = reader.GetString(0);
            var name = reader.GetString(1);
            var dataType = reader.GetString(2);
            var picture = reader.IsDBNull(3) ? "" : reader.GetString(3);
            var source = reader.IsDBNull(4) ? "" : reader.GetString(4);
            var taskIsn2 = reader.GetInt32(5);

            // Parse variable format {type,id}
            string letter = variable;
            int fieldId = 0;
            bool isGlobal = false;
            bool isVirtual = false;
            bool isParameter = false;

            if (variable.StartsWith("{") && variable.Contains(","))
            {
                var innerParts = variable.Trim('{', '}').Split(',');
                if (innerParts.Length >= 2)
                {
                    int.TryParse(innerParts[0], out int varType);
                    int.TryParse(innerParts[1], out fieldId);

                    if (varType == 32768)
                    {
                        // Global variable
                        isGlobal = true;
                        letter = $"VG{fieldId}";
                    }
                    else if (varType == 0)
                    {
                        // Local variable
                        letter = FieldToLetter(fieldId);
                    }
                }
            }

            // Classify by source
            if (source.Contains("Parameter", StringComparison.OrdinalIgnoreCase))
            {
                isParameter = true;
            }
            else if (source.Contains("Virtual", StringComparison.OrdinalIgnoreCase) ||
                     source.Contains("Expression", StringComparison.OrdinalIgnoreCase))
            {
                isVirtual = true;
            }

            var varObj = new {
                field_id = fieldId,
                letter = letter,
                name = name,
                data_type = dataType,
                picture = picture,
                source = source
            };

            if (isGlobal)
                globalVars.Add(varObj);
            else if (isParameter)
                paramVars.Add(varObj);
            else if (isVirtual)
                virtualVars.Add(varObj);
            else
                localVars.Add(varObj);
        }
    }

    var varResult = new
    {
        program = programName,
        ide = ide,
        variables = new {
            local = localVars,
            @virtual = virtualVars,
            global = globalVars,
            parameters = paramVars
        },
        statistics = new {
            total = localVars.Count + virtualVars.Count + globalVars.Count + paramVars.Count,
            local = localVars.Count,
            @virtual = virtualVars.Count,
            global = globalVars.Count,
            parameters = paramVars.Count
        }
    };

    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(varResult));
    return 0;
}

// =====================================================================
// PHASE 3 SUPPORT: Extract ALL expressions (not just 20)
// =====================================================================
if (args.Length > 1 && args[0] == "expressions")
{
    var exprDb = new KnowledgeDb();
    if (!exprDb.IsInitialized())
    {
        Console.WriteLine("{\"error\": \"Knowledge Base not initialized\"}");
        return 1;
    }

    var parts = args[1].Split(' ');
    var project = parts[0];
    var ide = parts.Length > 1 ? int.Parse(parts[1]) : 1;

    // Optional --limit parameter
    int limit = 500;
    for (int i = 2; i < args.Length; i++)
    {
        if (args[i] == "--limit" && i + 1 < args.Length)
        {
            int.TryParse(args[i + 1], out limit);
            if (limit > 1000) limit = 1000; // Cap at 1000
        }
    }

    using var conn = new SqliteConnection($"Data Source={exprDb.DbPath}");
    conn.Open();

    // Get program DB ID
    long dbProgramId = 0;
    string? programName = null;
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT p.id, p.name FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        cmd.Parameters.AddWithValue("@project", project);
        cmd.Parameters.AddWithValue("@ide", ide);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
        {
            Console.WriteLine($"{{\"error\": \"Program {project} IDE {ide} not found\"}}");
            return 1;
        }
        dbProgramId = reader.GetInt64(0);
        programName = reader.GetString(1);
    }

    // Get total count
    int totalCount = 0;
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"SELECT COUNT(*) FROM expressions WHERE program_id = @prog_id";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);
        totalCount = Convert.ToInt32(cmd.ExecuteScalar());
    }

    // Extract all expressions up to limit
    var expressions = new List<object>();
    var byType = new Dictionary<string, int> {
        { "condition", 0 },
        { "calculation", 0 },
        { "date", 0 },
        { "string", 0 },
        { "constant", 0 },
        { "other", 0 }
    };

    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT ide_position, content, COALESCE(comment, '') as comment
            FROM expressions
            WHERE program_id = @prog_id
            ORDER BY ide_position
            LIMIT @limit";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var idePos = reader.GetInt32(0);
            var content = reader.GetString(1);
            var comment = reader.GetString(2);

            expressions.Add(new {
                ide = idePos,
                content = content,
                comment = comment
            });

            // Classify expression type
            var contentLower = content.ToLower();
            if (contentLower.StartsWith("if(") || contentLower.Contains("case("))
                byType["condition"]++;
            else if (contentLower.Contains("date") || contentLower.Contains("dstr(") || contentLower.Contains("dval("))
                byType["date"]++;
            else if (contentLower.Contains("str(") || contentLower.Contains("trim(") || contentLower.Contains("upper(") || contentLower.Contains("lower("))
                byType["string"]++;
            else if (content.All(c => char.IsDigit(c) || c == '.' || c == '-' || c == '\''))
                byType["constant"]++;
            else if (contentLower.Contains("+") || contentLower.Contains("-") || contentLower.Contains("*") || contentLower.Contains("/"))
                byType["calculation"]++;
            else
                byType["other"]++;
        }
    }

    var exprResult = new
    {
        program = programName,
        ide = ide,
        expressions = expressions,
        statistics = new {
            total = totalCount,
            returned = expressions.Count,
            by_type = byType
        }
    };

    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(exprResult));
    return 0;
}

// =====================================================================
// PHASE 4 SUPPORT: Extract forms as JSON
// =====================================================================
if (args.Length > 1 && args[0] == "forms-json")
{
    var formsDb = new KnowledgeDb();
    if (!formsDb.IsInitialized())
    {
        Console.WriteLine("{\"error\": \"Knowledge Base not initialized\"}");
        return 1;
    }

    var parts = args[1].Split(' ');
    var project = parts[0];
    var ide = parts.Length > 1 ? int.Parse(parts[1]) : 1;

    using var conn = new SqliteConnection($"Data Source={formsDb.DbPath}");
    conn.Open();

    // Get program DB ID
    long dbProgramId = 0;
    string? programName = null;
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT p.id, p.name FROM programs p
            JOIN projects pr ON p.project_id = pr.id
            WHERE pr.name = @project AND p.ide_position = @ide";
        cmd.Parameters.AddWithValue("@project", project);
        cmd.Parameters.AddWithValue("@ide", ide);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
        {
            Console.WriteLine($"{{\"error\": \"Program {project} IDE {ide} not found\"}}");
            return 1;
        }
        dbProgramId = reader.GetInt64(0);
        programName = reader.GetString(1);
    }

    // Helper to convert window type to string
    static string WindowTypeToString(int windowType)
    {
        return windowType switch
        {
            1 => "MDI",
            2 => "SDI",
            3 => "Modal",
            4 => "Floating",
            5 => "Tool",
            _ => $"Type{windowType}"
        };
    }

    // Extract forms with ide_position + all form properties
    var forms = new List<object>();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT
                tf.form_entry_id,
                tf.form_name,
                tf.position_x,
                tf.position_y,
                tf.width,
                tf.height,
                tf.window_type,
                tf.font,
                t.isn2 as task_isn2,
                t.description as task_name,
                t.ide_position as task_ide_position,
                tf.form_units,
                tf.h_factor,
                tf.v_factor,
                tf.color,
                tf.system_menu,
                tf.minimize_box,
                tf.maximize_box,
                tf.properties_json,
                ti.open_task_window
            FROM task_forms tf
            JOIN tasks t ON tf.task_id = t.id
            LEFT JOIN task_information ti ON ti.task_id = t.id
            WHERE t.program_id = @prog_id
            ORDER BY t.isn2, tf.form_entry_id";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var windowType = reader.IsDBNull(6) ? 0 : reader.GetInt32(6);
            forms.Add(new {
                form_id = reader.IsDBNull(0) ? 0 : reader.GetInt32(0),
                name = reader.IsDBNull(1) ? "" : reader.GetString(1),
                window_type = windowType,
                window_type_str = WindowTypeToString(windowType),
                dimensions = new {
                    x = reader.IsDBNull(2) ? 0 : reader.GetInt32(2),
                    y = reader.IsDBNull(3) ? 0 : reader.GetInt32(3),
                    width = reader.IsDBNull(4) ? 0 : reader.GetInt32(4),
                    height = reader.IsDBNull(5) ? 0 : reader.GetInt32(5)
                },
                task_isn2 = reader.GetInt32(8),
                task_ide_position = reader.IsDBNull(10) ? "" : reader.GetString(10),
                font = reader.IsDBNull(7) ? "" : reader.GetString(7),
                form_units = reader.IsDBNull(11) ? (int?)null : reader.GetInt32(11),
                h_factor = reader.IsDBNull(12) ? (int?)null : reader.GetInt32(12),
                v_factor = reader.IsDBNull(13) ? (int?)null : reader.GetInt32(13),
                color = reader.IsDBNull(14) ? (int?)null : reader.GetInt32(14),
                system_menu = reader.IsDBNull(15) ? 0 : reader.GetInt32(15),
                minimize_box = reader.IsDBNull(16) ? 0 : reader.GetInt32(16),
                maximize_box = reader.IsDBNull(17) ? 0 : reader.GetInt32(17),
                properties_json = reader.IsDBNull(18) ? "" : reader.GetString(18),
                open_task_window = reader.IsDBNull(19) ? "Y" : reader.GetString(19)
            });
        }
    }

    // Extract DataView columns per task (for real field/button tables)
    var taskColumns = new Dictionary<int, List<object>>();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT
                t.isn2,
                dc.variable,
                dc.name,
                dc.data_type,
                dc.picture,
                dc.definition,
                dc.gui_control_type
            FROM dataview_columns dc
            JOIN tasks t ON dc.task_id = t.id
            WHERE t.program_id = @prog_id
            ORDER BY t.isn2, dc.line_number";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var taskIsn2 = reader.GetInt32(0);
            var variable = reader.GetString(1);
            var colName = reader.GetString(2);
            var dataType = reader.GetString(3);
            var picture = reader.IsDBNull(4) ? "" : reader.GetString(4);
            var definition = reader.GetString(5);
            var guiControl = reader.IsDBNull(6) ? "" : reader.GetString(6);

            var letter = VarToLetter(variable);
            var isReadonly = definition == "P" || definition == "R";

            if (!taskColumns.ContainsKey(taskIsn2))
                taskColumns[taskIsn2] = new List<object>();

            taskColumns[taskIsn2].Add(new {
                letter,
                name = colName,
                data_type = dataType,
                picture,
                definition,
                gui_control = guiControl,
                @readonly = isReadonly
            });
        }
    }

    // Extract form controls with ALL properties per task
    var formControls = new Dictionary<int, List<object>>();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            SELECT
                t.isn2,
                fc.control_id,
                fc.control_type,
                fc.control_name,
                fc.x, fc.y, fc.width, fc.height,
                fc.visible,
                fc.enabled,
                fc.tab_order,
                fc.linked_field_id,
                fc.linked_variable,
                fc.parent_id,
                fc.style,
                fc.color,
                fc.font_id,
                fc.text,
                fc.format,
                fc.data_field_id,
                fc.data_expression_id,
                fc.raise_event_type,
                fc.raise_event_id,
                fc.image_file,
                fc.items_list,
                fc.column_title,
                fc.control_layer,
                fc.h_alignment,
                fc.title_height,
                fc.row_height,
                fc.elements,
                fc.allow_parking,
                fc.visible_expression,
                fc.enabled_expression,
                fc.properties_json
            FROM form_controls fc
            JOIN task_forms tf ON fc.form_id = tf.id
            JOIN tasks t ON tf.task_id = t.id
            WHERE t.program_id = @prog_id
            ORDER BY t.isn2, fc.tab_order, fc.control_id";
        cmd.Parameters.AddWithValue("@prog_id", dbProgramId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var taskIsn2 = reader.GetInt32(0);
            var linkedFieldId = reader.IsDBNull(11) ? (int?)null : reader.GetInt32(11);
            var linkedVar = reader.IsDBNull(12) ? "" : reader.GetString(12);
            var letter = !string.IsNullOrEmpty(linkedVar) ? VarToLetter(linkedVar) : "";

            if (!formControls.ContainsKey(taskIsn2))
                formControls[taskIsn2] = new List<object>();

            formControls[taskIsn2].Add(new {
                control_id = reader.GetInt32(1),
                control_type = reader.IsDBNull(2) ? "" : reader.GetString(2),
                control_name = reader.IsDBNull(3) ? "" : reader.GetString(3),
                x = reader.IsDBNull(4) ? 0 : reader.GetInt32(4),
                y = reader.IsDBNull(5) ? 0 : reader.GetInt32(5),
                width = reader.IsDBNull(6) ? 0 : reader.GetInt32(6),
                height = reader.IsDBNull(7) ? 0 : reader.GetInt32(7),
                visible = reader.IsDBNull(8) ? 1 : reader.GetInt32(8),
                enabled = reader.IsDBNull(9) ? 1 : reader.GetInt32(9),
                tab_order = reader.IsDBNull(10) ? 0 : reader.GetInt32(10),
                linked_variable = letter,
                linked_field_id = linkedFieldId,
                parent_id = reader.IsDBNull(13) ? (int?)null : reader.GetInt32(13),
                style = reader.IsDBNull(14) ? (int?)null : reader.GetInt32(14),
                color = reader.IsDBNull(15) ? (int?)null : reader.GetInt32(15),
                font_id = reader.IsDBNull(16) ? (int?)null : reader.GetInt32(16),
                text = reader.IsDBNull(17) ? "" : reader.GetString(17),
                format = reader.IsDBNull(18) ? "" : reader.GetString(18),
                data_field_id = reader.IsDBNull(19) ? (int?)null : reader.GetInt32(19),
                data_expression_id = reader.IsDBNull(20) ? (int?)null : reader.GetInt32(20),
                raise_event_type = reader.IsDBNull(21) ? "" : reader.GetString(21),
                raise_event_id = reader.IsDBNull(22) ? (int?)null : reader.GetInt32(22),
                image_file = reader.IsDBNull(23) ? "" : reader.GetString(23),
                items_list = reader.IsDBNull(24) ? "" : reader.GetString(24),
                column_title = reader.IsDBNull(25) ? "" : reader.GetString(25),
                control_layer = reader.IsDBNull(26) ? (int?)null : reader.GetInt32(26),
                h_alignment = reader.IsDBNull(27) ? (int?)null : reader.GetInt32(27),
                title_height = reader.IsDBNull(28) ? (int?)null : reader.GetInt32(28),
                row_height = reader.IsDBNull(29) ? (int?)null : reader.GetInt32(29),
                elements = reader.IsDBNull(30) ? (int?)null : reader.GetInt32(30),
                allow_parking = reader.IsDBNull(31) ? 0 : reader.GetInt32(31),
                visible_expression = reader.IsDBNull(32) ? (int?)null : reader.GetInt32(32),
                enabled_expression = reader.IsDBNull(33) ? (int?)null : reader.GetInt32(33),
                properties_json = reader.IsDBNull(34) ? "" : reader.GetString(34)
            });
        }
    }

    // Serialize task_columns as dictionary
    var taskColsSerialized = new Dictionary<string, object>();
    foreach (var kv in taskColumns)
    {
        taskColsSerialized[kv.Key.ToString()] = kv.Value;
    }

    // Serialize form_controls as dictionary
    var formCtrlsSerialized = new Dictionary<string, object>();
    foreach (var kv in formControls)
    {
        formCtrlsSerialized[kv.Key.ToString()] = kv.Value;
    }

    var totalColumns = taskColumns.Values.Sum(v => v.Count);
    var totalControls = formControls.Values.Sum(v => v.Count);

    var formsResult = new
    {
        program = programName,
        ide = ide,
        forms = forms,
        task_columns = taskColsSerialized,
        form_controls = formCtrlsSerialized,
        statistics = new {
            form_count = forms.Count,
            tasks_with_columns = taskColumns.Count,
            total_columns = totalColumns,
            tasks_with_controls = formControls.Count,
            total_controls = totalControls
        }
    };

    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(formsResult));
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

// Shared helper: convert 1-based FieldId to IDE letter (A=1, Z=26, AA=27, AZ=52, BA=53)
static string FieldToLetter(int fieldId)
{
    if (fieldId <= 0) return "?";
    var result = "";
    var n = fieldId;
    while (n > 0)
    {
        n--;
        result = (char)('A' + (n % 26)) + result;
        n /= 26;
    }
    return result;
}

// Shared helper: convert {type,id} variable ref to IDE letter
static string VarToLetter(string variable)
{
    if (!variable.StartsWith("{") || !variable.Contains(","))
        return variable;
    var inner = variable.Trim('{', '}').Split(',');
    if (inner.Length < 2) return variable;
    int.TryParse(inner[0], out int varType);
    int.TryParse(inner[1], out int fieldId);
    if (varType == 32768) return $"VG{fieldId}";
    if (varType == 0) return FieldToLetter(fieldId);
    return variable;
}
