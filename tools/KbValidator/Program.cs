// Knowledge Base Validator - Compare KB data with Magic IDE
// Usage: dotnet run -- <command> [options]
//   test <project> <ide>     - Full validation of a program
//   expressions <project> <ide> - Test expressions only
//   variables <project> <ide> <task> - Test variables of a task
//   calls <project> <ide>    - Test program calls
//   tables <project> <ide>   - Test table usage
//   compare-xml <project> <ide> - Compare with raw XML

using MagicKnowledgeBase.Database;
using Microsoft.Data.Sqlite;

var db = new KnowledgeDb();

if (!db.IsInitialized())
{
    Console.WriteLine("ERROR: Knowledge Base not initialized. Run indexer first.");
    return 1;
}

if (args.Length < 1)
{
    ShowHelp();
    return 0;
}

var command = args[0].ToLower();

return command switch
{
    "test" when args.Length >= 3 => TestProgram(args[1], int.Parse(args[2])),
    "expressions" when args.Length >= 3 => TestExpressions(args[1], int.Parse(args[2])),
    "variables" when args.Length >= 4 => TestVariables(args[1], int.Parse(args[2]), int.Parse(args[3])),
    "calls" when args.Length >= 3 => TestCalls(args[1], int.Parse(args[2])),
    "tables" when args.Length >= 3 => TestTables(args[1], int.Parse(args[2])),
    "compare-xml" when args.Length >= 3 => CompareXml(args[1], int.Parse(args[2])),
    "stats" => ShowStats(),
    "list" when args.Length >= 2 => ListPrograms(args[1]),
    _ => ShowHelp()
};

int ShowHelp()
{
    Console.WriteLine(@"
Knowledge Base Validator
========================

Commands:
  test <project> <ide>           Full validation of a program
  expressions <project> <ide>    Test expressions parsing
  variables <project> <ide> <task>  Test variables of a specific task
  calls <project> <ide>          Test program calls resolution
  tables <project> <ide>         Test table usage
  compare-xml <project> <ide>    Compare KB with raw XML file
  stats                          Show KB statistics
  list <project>                 List all programs in a project

Examples:
  dotnet run -- test ADH 69
  dotnet run -- expressions ADH 121
  dotnet run -- variables ADH 69 1
  dotnet run -- list ADH
");
    return 0;
}

int ShowStats()
{
    var stats = db.GetStats();
    Console.WriteLine("=== KNOWLEDGE BASE STATISTICS ===\n");
    Console.WriteLine($"Projects:        {stats.ProjectCount}");
    Console.WriteLine($"Programs:        {stats.ProgramCount:N0}");
    Console.WriteLine($"Tasks:           {stats.TaskCount:N0}");
    Console.WriteLine($"Expressions:     {stats.ExpressionCount:N0}");
    Console.WriteLine($"Tables:          {stats.TableCount:N0}");
    Console.WriteLine($"Logic Lines:     {stats.LogicLineCount:N0}");
    Console.WriteLine($"Program Calls:   {stats.ProgramCallCount:N0}");
    Console.WriteLine($"DataView Cols:   {stats.ColumnCount:N0}");
    Console.WriteLine($"Database Size:   {stats.DatabaseSizeBytes / 1024.0 / 1024.0:F1} MB");
    return 0;
}

int ListPrograms(string project)
{
    using var conn = new SqliteConnection($"Data Source={db.DbPath}");
    conn.Open();

    var cmd = conn.CreateCommand();
    cmd.CommandText = @"
        SELECT p.ide_position, p.name, p.public_name, p.task_count, p.expression_count
        FROM programs p
        JOIN projects pr ON p.project_id = pr.id
        WHERE pr.name = @project
        ORDER BY p.ide_position
        LIMIT 50";
    cmd.Parameters.AddWithValue("@project", project);

    Console.WriteLine($"=== PROGRAMS IN {project} (first 50) ===\n");
    Console.WriteLine("| IDE  | Name                      | Public Name          | Tasks | Expr |");
    Console.WriteLine("|------|---------------------------|----------------------|-------|------|");

    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        var ide = reader.GetInt32(0);
        var name = reader.IsDBNull(1) ? "" : reader.GetString(1);
        var publicName = reader.IsDBNull(2) ? "" : reader.GetString(2);
        var tasks = reader.GetInt32(3);
        var expr = reader.GetInt32(4);

        if (name.Length > 25) name = name[..22] + "...";
        if (publicName.Length > 20) publicName = publicName[..17] + "...";

        Console.WriteLine($"| {ide,4} | {name,-25} | {publicName,-20} | {tasks,5} | {expr,4} |");
    }

    return 0;
}

int TestProgram(string project, int ide)
{
    Console.WriteLine(new string('=', 70));
    Console.WriteLine($"  FULL VALIDATION: {project} IDE {ide}");
    Console.WriteLine(new string('=', 70));
    Console.WriteLine();

    var issues = new List<string>();

    // Get program
    using var conn = new SqliteConnection($"Data Source={db.DbPath}");
    conn.Open();

    var program = GetProgram(conn, project, ide);
    if (program == null)
    {
        Console.WriteLine($"ERROR: Program not found: {project} IDE {ide}");
        return 1;
    }

    // 1. Program Info
    Console.WriteLine("### 1. PROGRAM INFO ###");
    Console.WriteLine($"  ID:             {program.Id}");
    Console.WriteLine($"  Name:           {program.Name}");
    Console.WriteLine($"  Public Name:    {program.PublicName ?? "(none)"}");
    Console.WriteLine($"  XML ID:         {program.XmlId}");
    Console.WriteLine($"  IDE Position:   {program.IdePosition}");
    Console.WriteLine($"  Task Count:     {program.TaskCount}");
    Console.WriteLine($"  Expression Count: {program.ExpressionCount}");
    Console.WriteLine($"  File:           {program.FilePath}");
    Console.WriteLine();

    // 2. Expressions
    Console.WriteLine("### 2. EXPRESSIONS ###");
    var expressions = GetExpressions(conn, program.Id);
    if (expressions.Count == 0)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"  [ERROR] No expressions found! Expected: {program.ExpressionCount}");
        Console.ResetColor();
        issues.Add($"Expressions: 0 found (expected {program.ExpressionCount})");
    }
    else
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"  Found: {expressions.Count} expressions");
        Console.ResetColor();

        Console.WriteLine("\n  | IDE | XML ID | Content (first 50 chars)              |");
        Console.WriteLine("  |-----|--------|---------------------------------------|");
        foreach (var expr in expressions.Take(15))
        {
            var content = expr.Content.Length > 40 ? expr.Content[..37] + "..." : expr.Content;
            content = content.Replace("\n", "\\n").Replace("\r", "");
            Console.WriteLine($"  | {expr.IdePosition,3} | {expr.XmlId,6} | {content,-37} |");
        }
        if (expressions.Count > 15)
            Console.WriteLine($"  | ... | ...    | ({expressions.Count - 15} more)                         |");
    }
    Console.WriteLine();

    // 3. Tasks
    Console.WriteLine("### 3. TASKS ###");
    var tasks = GetTasks(conn, program.Id);
    Console.WriteLine($"  Found: {tasks.Count} tasks");
    Console.WriteLine("\n  | IDE | ISN2 | Description          | Type | Cols | Logic |");
    Console.WriteLine("  |-----|------|----------------------|------|------|-------|");
    foreach (var task in tasks.Take(15))
    {
        var desc = task.Description ?? "(empty)";
        if (desc.Length > 20) desc = desc[..17] + "...";
        Console.WriteLine($"  | {task.IdePosition,3} | {task.Isn2,4} | {desc,-20} | {task.TaskType,-4} | {task.ColumnCount,4} | {task.LogicLineCount,5} |");
    }
    Console.WriteLine();

    // 4. Variables (first task)
    if (tasks.Count > 0)
    {
        var firstTask = tasks[0];
        Console.WriteLine($"### 4. VARIABLES (Task IDE {firstTask.IdePosition}) ###");
        var columns = GetColumns(conn, firstTask.Id);
        Console.WriteLine($"  Found: {columns.Count} columns");

        if (columns.Count > 0)
        {
            Console.WriteLine("\n  | Line | Var | Name                 | Type | Def | Source    |");
            Console.WriteLine("  |------|-----|----------------------|------|-----|-----------|");
            foreach (var col in columns.Take(20))
            {
                var name = col.Name ?? "";
                if (name.Length > 20) name = name[..17] + "...";
                var source = col.Source ?? "";
                if (source.Length > 9) source = source[..6] + "...";
                Console.WriteLine($"  | {col.LineNumber,4} | {col.Variable,-3} | {name,-20} | {col.DataType,-4} | {col.Definition,-3} | {source,-9} |");
            }
            if (columns.Count > 20)
                Console.WriteLine($"  | ...  | ... | ({columns.Count - 20} more)            | ...  | ... | ...       |");
        }
        Console.WriteLine();
    }

    // 5. Table Usage
    Console.WriteLine("### 5. TABLE USAGE ###");
    var tableUsage = GetTableUsage(conn, program.Id);
    if (tableUsage.Count == 0)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("  No table usage found (may be normal for some programs)");
        Console.ResetColor();
    }
    else
    {
        Console.WriteLine($"  Found: {tableUsage.Count} table references");
        Console.WriteLine("\n  | Task | Type   | Table ID | Table Name       | Link# |");
        Console.WriteLine("  |------|--------|----------|------------------|-------|");
        foreach (var usage in tableUsage.Take(15))
        {
            var linkNum = usage.LinkNumber?.ToString() ?? "-";
            Console.WriteLine($"  | {usage.TaskIde,4} | {usage.UsageType,-6} | {usage.TableId,8} | {usage.TableName,-16} | {linkNum,5} |");
        }
    }
    Console.WriteLine();

    // 6. Program Calls
    Console.WriteLine("### 6. PROGRAM CALLS ###");
    var calls = GetProgramCalls(conn, program.Id);
    if (calls.Count == 0)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("  [ERROR] No program calls found!");
        Console.ResetColor();
        issues.Add("Program calls: 0 found");
    }
    else
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"  Found: {calls.Count} calls");
        Console.ResetColor();
        Console.WriteLine("\n  | Task | Line | Target Project | XML ID | Args | Resolved |");
        Console.WriteLine("  |------|------|----------------|--------|------|----------|");
        foreach (var call in calls.Take(15))
        {
            var resolved = call.CalleeId.HasValue ? "Yes" : "No";
            var targetProj = call.CalleeProject ?? "(unknown)";
            Console.WriteLine($"  | {call.TaskIde,4} | {call.LineNumber,4} | {targetProj,-14} | {call.CalleeXmlId,6} | {call.ArgCount,4} | {resolved,-8} |");
        }
    }
    Console.WriteLine();

    // 7. Logic Lines (first task)
    if (tasks.Count > 0)
    {
        var firstTask = tasks[0];
        Console.WriteLine($"### 7. LOGIC LINES (Task IDE {firstTask.IdePosition}) ###");
        var logicLines = GetLogicLines(conn, firstTask.Id);
        Console.WriteLine($"  Found: {logicLines.Count} logic lines");

        var byHandler = logicLines.GroupBy(l => l.Handler).Take(3);
        foreach (var group in byHandler)
        {
            Console.WriteLine($"\n  Handler: {group.Key} ({group.Count()} lines)");
            Console.WriteLine("  | Line | Operation     | Condition       | Disabled |");
            Console.WriteLine("  |------|---------------|-----------------|----------|");
            foreach (var line in group.Take(5))
            {
                var cond = line.Condition ?? "";
                if (cond.Length > 15) cond = cond[..12] + "...";
                var disabled = line.IsDisabled ? "Yes" : "";
                Console.WriteLine($"  | {line.LineNumber,4} | {line.Operation,-13} | {cond,-15} | {disabled,-8} |");
            }
            if (group.Count() > 5)
                Console.WriteLine($"  | ...  | ({group.Count() - 5} more)      |                 |          |");
        }
        Console.WriteLine();
    }

    // Summary
    Console.WriteLine(new string('=', 70));
    Console.WriteLine("  VALIDATION SUMMARY");
    Console.WriteLine(new string('=', 70));

    if (issues.Count == 0)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("  [OK] All elements found");
        Console.ResetColor();
    }
    else
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("  [ISSUES DETECTED]");
        foreach (var issue in issues)
            Console.WriteLine($"    - {issue}");
        Console.ResetColor();
    }

    Console.WriteLine("\nTo validate, compare with Magic IDE screenshots of:");
    Console.WriteLine("  1. Program properties");
    Console.WriteLine("  2. Expressions list");
    Console.WriteLine("  3. DataView task 1");
    Console.WriteLine("  4. Logic task 1");
    Console.WriteLine("  5. Links (if applicable)");

    return issues.Count > 0 ? 1 : 0;
}

int TestExpressions(string project, int ide)
{
    Console.WriteLine($"=== EXPRESSIONS TEST: {project} IDE {ide} ===\n");

    using var conn = new SqliteConnection($"Data Source={db.DbPath}");
    conn.Open();

    var program = GetProgram(conn, project, ide);
    if (program == null) return 1;

    // Get expressions from KB
    var expressions = GetExpressions(conn, program.Id);
    Console.WriteLine($"KB reports: {program.ExpressionCount} expressions");
    Console.WriteLine($"KB found:   {expressions.Count} expressions\n");

    // Get expressions directly from XML
    if (File.Exists(program.FilePath))
    {
        var xmlContent = File.ReadAllText(program.FilePath);
        var expMatches = System.Text.RegularExpressions.Regex.Matches(xmlContent, @"<exp\s+id=""(\d+)""");
        Console.WriteLine($"XML file:   {expMatches.Count} <exp> tags found\n");

        if (expMatches.Count > 0 && expressions.Count == 0)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("[PARSER BUG] Expressions exist in XML but not indexed!");
            Console.WriteLine("\nFirst 5 expression IDs from XML:");
            foreach (System.Text.RegularExpressions.Match m in expMatches.Take(5))
            {
                Console.WriteLine($"  <exp id=\"{m.Groups[1].Value}\">");
            }
            Console.ResetColor();
        }
    }

    return 0;
}

int TestVariables(string project, int ide, int taskIde)
{
    Console.WriteLine($"=== VARIABLES TEST: {project} IDE {ide} Task {taskIde} ===\n");

    using var conn = new SqliteConnection($"Data Source={db.DbPath}");
    conn.Open();

    var program = GetProgram(conn, project, ide);
    if (program == null) return 1;

    var tasks = GetTasks(conn, program.Id);
    var task = tasks.FirstOrDefault(t => t.IdePosition == taskIde);
    if (task == null)
    {
        Console.WriteLine($"Task IDE {taskIde} not found");
        return 1;
    }

    var columns = GetColumns(conn, task.Id);
    Console.WriteLine($"Found {columns.Count} columns in task {taskIde}\n");

    Console.WriteLine("| Line | Var | Name                      | Type   | Def | Picture   | Source        |");
    Console.WriteLine("|------|-----|---------------------------|--------|-----|-----------|---------------|");
    foreach (var col in columns)
    {
        var name = (col.Name ?? "").PadRight(25);
        if (name.Length > 25) name = name[..22] + "...";
        var picture = (col.Picture ?? "").PadRight(9);
        if (picture.Length > 9) picture = picture[..6] + "...";
        var source = (col.Source ?? "").PadRight(13);
        if (source.Length > 13) source = source[..10] + "...";

        Console.WriteLine($"| {col.LineNumber,4} | {col.Variable,-3} | {name} | {col.DataType,-6} | {col.Definition,-3} | {picture} | {source} |");
    }

    return 0;
}

int TestCalls(string project, int ide)
{
    Console.WriteLine($"=== PROGRAM CALLS TEST: {project} IDE {ide} ===\n");

    using var conn = new SqliteConnection($"Data Source={db.DbPath}");
    conn.Open();

    var program = GetProgram(conn, project, ide);
    if (program == null) return 1;

    var calls = GetProgramCalls(conn, program.Id);
    Console.WriteLine($"Found {calls.Count} program calls\n");

    if (calls.Count == 0 && File.Exists(program.FilePath))
    {
        var xmlContent = File.ReadAllText(program.FilePath);
        var callMatches = System.Text.RegularExpressions.Regex.Matches(xmlContent, @"<oper\s+type=""(Call|CallProg)""");
        Console.WriteLine($"XML file has {callMatches.Count} Call/CallProg operations\n");

        if (callMatches.Count > 0)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("[PARSER BUG] Calls exist in XML but not indexed!");
            Console.ResetColor();
        }
    }

    return 0;
}

int TestTables(string project, int ide)
{
    Console.WriteLine($"=== TABLE USAGE TEST: {project} IDE {ide} ===\n");

    using var conn = new SqliteConnection($"Data Source={db.DbPath}");
    conn.Open();

    var program = GetProgram(conn, project, ide);
    if (program == null) return 1;

    var usage = GetTableUsage(conn, program.Id);
    Console.WriteLine($"Found {usage.Count} table references\n");

    foreach (var u in usage)
    {
        Console.WriteLine($"Task {u.TaskIde}: {u.UsageType} on table {u.TableId} ({u.TableName}) link={u.LinkNumber}");
    }

    return 0;
}

int CompareXml(string project, int ide)
{
    Console.WriteLine($"=== XML COMPARISON: {project} IDE {ide} ===\n");

    using var conn = new SqliteConnection($"Data Source={db.DbPath}");
    conn.Open();

    var program = GetProgram(conn, project, ide);
    if (program == null) return 1;

    if (!File.Exists(program.FilePath))
    {
        Console.WriteLine($"XML file not found: {program.FilePath}");
        return 1;
    }

    var xml = File.ReadAllText(program.FilePath);

    // Count elements in XML
    int CountPattern(string pattern) =>
        System.Text.RegularExpressions.Regex.Matches(xml, pattern).Count;

    var xmlTasks = CountPattern(@"<Task\s+ISN_2=""(\d+)""");
    var xmlExpr = CountPattern(@"<exp\s+id=""(\d+)""");
    var xmlCalls = CountPattern(@"type=""Call""") + CountPattern(@"type=""CallProg""");
    var xmlColumns = CountPattern(@"<Column\s");
    var xmlLogicLines = CountPattern(@"<oper\s");

    // Count in KB
    var kbTasks = GetTasks(conn, program.Id).Count;
    var kbExpr = GetExpressions(conn, program.Id).Count;
    var kbCalls = GetProgramCalls(conn, program.Id).Count;
    var kbColumns = GetTasks(conn, program.Id).Sum(t => GetColumns(conn, t.Id).Count);
    var kbLogicLines = GetTasks(conn, program.Id).Sum(t => GetLogicLines(conn, t.Id).Count);

    Console.WriteLine("| Element       | XML File | KB   | Match |");
    Console.WriteLine("|---------------|----------|------|-------|");
    PrintComparison("Tasks", xmlTasks, kbTasks);
    PrintComparison("Expressions", xmlExpr, kbExpr);
    PrintComparison("Columns", xmlColumns, kbColumns);
    PrintComparison("Logic Lines", xmlLogicLines, kbLogicLines);
    PrintComparison("Program Calls", xmlCalls, kbCalls);

    return 0;
}

void PrintComparison(string name, int xml, int kb)
{
    var match = xml == kb ? "✓" : "✗";
    var color = xml == kb ? ConsoleColor.Green : ConsoleColor.Red;
    Console.ForegroundColor = color;
    Console.WriteLine($"| {name,-13} | {xml,8} | {kb,4} | {match,5} |");
    Console.ResetColor();
}

// Data access helpers
ProgramInfo? GetProgram(SqliteConnection conn, string project, int ide)
{
    var cmd = conn.CreateCommand();
    cmd.CommandText = @"
        SELECT p.id, p.xml_id, p.ide_position, p.name, p.public_name, p.file_path, p.task_count, p.expression_count
        FROM programs p
        JOIN projects pr ON p.project_id = pr.id
        WHERE pr.name = @project AND p.ide_position = @ide";
    cmd.Parameters.AddWithValue("@project", project);
    cmd.Parameters.AddWithValue("@ide", ide);

    using var reader = cmd.ExecuteReader();
    if (!reader.Read()) return null;

    return new ProgramInfo
    {
        Id = reader.GetInt64(0),
        XmlId = reader.GetInt32(1),
        IdePosition = reader.GetInt32(2),
        Name = reader.IsDBNull(3) ? null : reader.GetString(3),
        PublicName = reader.IsDBNull(4) ? null : reader.GetString(4),
        FilePath = reader.GetString(5),
        TaskCount = reader.GetInt32(6),
        ExpressionCount = reader.GetInt32(7)
    };
}

List<ExpressionInfo> GetExpressions(SqliteConnection conn, long programId)
{
    var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT xml_id, ide_position, content, comment FROM expressions WHERE program_id = @pid ORDER BY ide_position";
    cmd.Parameters.AddWithValue("@pid", programId);

    var result = new List<ExpressionInfo>();
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        result.Add(new ExpressionInfo
        {
            XmlId = reader.GetInt32(0),
            IdePosition = reader.GetInt32(1),
            Content = reader.GetString(2),
            Comment = reader.IsDBNull(3) ? null : reader.GetString(3)
        });
    }
    return result;
}

List<TaskInfo> GetTasks(SqliteConnection conn, long programId)
{
    var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT id, isn2, ide_position, description, task_type, column_count, logic_line_count FROM tasks WHERE program_id = @pid ORDER BY ide_position";
    cmd.Parameters.AddWithValue("@pid", programId);

    var result = new List<TaskInfo>();
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        result.Add(new TaskInfo
        {
            Id = reader.GetInt64(0),
            Isn2 = reader.GetInt32(1),
            IdePosition = reader.GetInt32(2),
            Description = reader.IsDBNull(3) ? null : reader.GetString(3),
            TaskType = reader.GetString(4),
            ColumnCount = reader.GetInt32(5),
            LogicLineCount = reader.GetInt32(6)
        });
    }
    return result;
}

List<ColumnInfo> GetColumns(SqliteConnection conn, long taskId)
{
    var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT line_number, variable, name, data_type, definition, source, picture FROM dataview_columns WHERE task_id = @tid ORDER BY line_number";
    cmd.Parameters.AddWithValue("@tid", taskId);

    var result = new List<ColumnInfo>();
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        result.Add(new ColumnInfo
        {
            LineNumber = reader.GetInt32(0),
            Variable = reader.GetString(1),
            Name = reader.IsDBNull(2) ? null : reader.GetString(2),
            DataType = reader.GetString(3),
            Definition = reader.GetString(4),
            Source = reader.IsDBNull(5) ? null : reader.GetString(5),
            Picture = reader.IsDBNull(6) ? null : reader.GetString(6)
        });
    }
    return result;
}

List<TableUsageInfo> GetTableUsage(SqliteConnection conn, long programId)
{
    var cmd = conn.CreateCommand();
    cmd.CommandText = @"
        SELECT tu.table_id, tu.table_name, tu.usage_type, tu.link_number, t.ide_position
        FROM table_usage tu
        JOIN tasks t ON tu.task_id = t.id
        WHERE t.program_id = @pid
        ORDER BY t.ide_position";
    cmd.Parameters.AddWithValue("@pid", programId);

    var result = new List<TableUsageInfo>();
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        result.Add(new TableUsageInfo
        {
            TableId = reader.GetInt32(0),
            TableName = reader.IsDBNull(1) ? null : reader.GetString(1),
            UsageType = reader.GetString(2),
            LinkNumber = reader.IsDBNull(3) ? null : reader.GetInt32(3),
            TaskIde = reader.GetInt32(4)
        });
    }
    return result;
}

List<ProgramCallInfo> GetProgramCalls(SqliteConnection conn, long programId)
{
    var cmd = conn.CreateCommand();
    cmd.CommandText = @"
        SELECT pc.callee_project_name, pc.callee_xml_id, pc.callee_program_id, pc.caller_line_number, pc.arg_count, t.ide_position
        FROM program_calls pc
        JOIN tasks t ON pc.caller_task_id = t.id
        WHERE t.program_id = @pid
        ORDER BY t.ide_position, pc.caller_line_number";
    cmd.Parameters.AddWithValue("@pid", programId);

    var result = new List<ProgramCallInfo>();
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        result.Add(new ProgramCallInfo
        {
            CalleeProject = reader.IsDBNull(0) ? null : reader.GetString(0),
            CalleeXmlId = reader.IsDBNull(1) ? 0 : reader.GetInt32(1),
            CalleeId = reader.IsDBNull(2) ? null : reader.GetInt64(2),
            LineNumber = reader.GetInt32(3),
            ArgCount = reader.GetInt32(4),
            TaskIde = reader.GetInt32(5)
        });
    }
    return result;
}

List<LogicLineInfo> GetLogicLines(SqliteConnection conn, long taskId)
{
    var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT line_number, handler, operation, condition_expr, is_disabled FROM logic_lines WHERE task_id = @tid ORDER BY handler, line_number";
    cmd.Parameters.AddWithValue("@tid", taskId);

    var result = new List<LogicLineInfo>();
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        result.Add(new LogicLineInfo
        {
            LineNumber = reader.GetInt32(0),
            Handler = reader.GetString(1),
            Operation = reader.GetString(2),
            Condition = reader.IsDBNull(3) ? null : reader.GetString(3),
            IsDisabled = reader.GetBoolean(4)
        });
    }
    return result;
}

// DTOs
record ProgramInfo
{
    public long Id { get; init; }
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public string? Name { get; init; }
    public string? PublicName { get; init; }
    public string FilePath { get; init; } = "";
    public int TaskCount { get; init; }
    public int ExpressionCount { get; init; }
}

record ExpressionInfo { public int XmlId { get; init; } public int IdePosition { get; init; } public string Content { get; init; } = ""; public string? Comment { get; init; } }
record TaskInfo { public long Id { get; init; } public int Isn2 { get; init; } public int IdePosition { get; init; } public string? Description { get; init; } public string TaskType { get; init; } = ""; public int ColumnCount { get; init; } public int LogicLineCount { get; init; } }
record ColumnInfo { public int LineNumber { get; init; } public string Variable { get; init; } = ""; public string? Name { get; init; } public string DataType { get; init; } = ""; public string Definition { get; init; } = ""; public string? Source { get; init; } public string? Picture { get; init; } }
record TableUsageInfo { public int TableId { get; init; } public string? TableName { get; init; } public string UsageType { get; init; } = ""; public int? LinkNumber { get; init; } public int TaskIde { get; init; } }
record ProgramCallInfo { public string? CalleeProject { get; init; } public int CalleeXmlId { get; init; } public long? CalleeId { get; init; } public int LineNumber { get; init; } public int ArgCount { get; init; } public int TaskIde { get; init; } }
record LogicLineInfo { public int LineNumber { get; init; } public string Handler { get; init; } = ""; public string Operation { get; init; } = ""; public string? Condition { get; init; } public bool IsDisabled { get; init; } }
