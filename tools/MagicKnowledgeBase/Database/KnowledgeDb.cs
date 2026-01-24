using System.Reflection;
using System.Text.Json;
using Microsoft.Data.Sqlite;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Database;

/// <summary>
/// SQLite database connection and operations for Magic Knowledge Base
/// </summary>
public class KnowledgeDb : IDisposable
{
    private readonly string _dbPath;
    private SqliteConnection? _connection;
    private bool _disposed;

    public const string DefaultDbPath = ".magic-kb/knowledge.db";

    /// <summary>
    /// Create a new KnowledgeDb instance
    /// </summary>
    /// <param name="dbPath">Path to SQLite database file. If null, uses default path in user profile.</param>
    public KnowledgeDb(string? dbPath = null)
    {
        if (string.IsNullOrEmpty(dbPath))
        {
            var userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            _dbPath = Path.Combine(userProfile, DefaultDbPath);
        }
        else
        {
            _dbPath = dbPath;
        }
    }

    public string DbPath => _dbPath;

    /// <summary>
    /// Get or create the database connection
    /// </summary>
    public SqliteConnection Connection
    {
        get
        {
            if (_connection == null)
            {
                EnsureDirectoryExists();
                var connectionString = new SqliteConnectionStringBuilder
                {
                    DataSource = _dbPath,
                    Mode = SqliteOpenMode.ReadWriteCreate,
                    Cache = SqliteCacheMode.Shared
                }.ToString();

                _connection = new SqliteConnection(connectionString);
                _connection.Open();
            }
            return _connection;
        }
    }

    private void EnsureDirectoryExists()
    {
        var dir = Path.GetDirectoryName(_dbPath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }
    }

    /// <summary>
    /// Initialize the database schema
    /// </summary>
    public void InitializeSchema()
    {
        var schema = LoadEmbeddedSchema();
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = schema;
        cmd.ExecuteNonQuery();
    }

    private static string LoadEmbeddedSchema()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = "MagicKnowledgeBase.Database.Schema.sql";

        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            throw new InvalidOperationException($"Embedded resource not found: {resourceName}");
        }

        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }

    /// <summary>
    /// Check if the database exists and has been initialized
    /// </summary>
    public bool IsInitialized()
    {
        if (!File.Exists(_dbPath)) return false;

        try
        {
            using var cmd = Connection.CreateCommand();
            cmd.CommandText = "SELECT value FROM kb_metadata WHERE key = 'schema_version'";
            var result = cmd.ExecuteScalar();
            return result != null;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Get schema version
    /// </summary>
    public int GetSchemaVersion()
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT value FROM kb_metadata WHERE key = 'schema_version'";
        var result = cmd.ExecuteScalar();
        return result != null ? int.Parse(result.ToString()!) : 0;
    }

    /// <summary>
    /// Begin a transaction
    /// </summary>
    public SqliteTransaction BeginTransaction()
    {
        return Connection.BeginTransaction();
    }

    /// <summary>
    /// Execute a non-query command
    /// </summary>
    public int ExecuteNonQuery(string sql, Dictionary<string, object?>? parameters = null, SqliteTransaction? transaction = null)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (transaction != null) cmd.Transaction = transaction;

        if (parameters != null)
        {
            foreach (var (key, value) in parameters)
            {
                cmd.Parameters.AddWithValue(key, value ?? DBNull.Value);
            }
        }

        return cmd.ExecuteNonQuery();
    }

    /// <summary>
    /// Execute a scalar command
    /// </summary>
    public T? ExecuteScalar<T>(string sql, Dictionary<string, object?>? parameters = null)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;

        if (parameters != null)
        {
            foreach (var (key, value) in parameters)
            {
                cmd.Parameters.AddWithValue(key, value ?? DBNull.Value);
            }
        }

        var result = cmd.ExecuteScalar();
        if (result == null || result == DBNull.Value) return default;
        return (T)Convert.ChangeType(result, typeof(T));
    }

    /// <summary>
    /// Get last inserted row ID
    /// </summary>
    public long LastInsertRowId()
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT last_insert_rowid()";
        return (long)cmd.ExecuteScalar()!;
    }

    // =========================================================================
    // PROJECT OPERATIONS
    // =========================================================================

    public long InsertProject(DbProject project, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT INTO projects (name, source_path, main_offset, program_count, git_commit)
            VALUES (@name, @source_path, @main_offset, @program_count, @git_commit)",
            new Dictionary<string, object?>
            {
                ["@name"] = project.Name,
                ["@source_path"] = project.SourcePath,
                ["@main_offset"] = project.MainOffset,
                ["@program_count"] = project.ProgramCount,
                ["@git_commit"] = project.GitCommit
            }, tx);
        return LastInsertRowId();
    }

    public DbProject? GetProject(string name)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM projects WHERE name = @name";
        cmd.Parameters.AddWithValue("@name", name);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return ReadProject(reader);
    }

    public DbProject? GetProjectById(long id)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM projects WHERE id = @id";
        cmd.Parameters.AddWithValue("@id", id);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return ReadProject(reader);
    }

    public IEnumerable<DbProject> GetAllProjects()
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM projects ORDER BY name";

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            yield return ReadProject(reader);
        }
    }

    public void DeleteProject(long projectId, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery("DELETE FROM projects WHERE id = @id",
            new Dictionary<string, object?> { ["@id"] = projectId }, tx);
    }

    public void UpdateProjectStats(long projectId, int programCount, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            UPDATE projects SET program_count = @count, indexed_at = datetime('now')
            WHERE id = @id",
            new Dictionary<string, object?>
            {
                ["@id"] = projectId,
                ["@count"] = programCount
            }, tx);
    }

    private static DbProject ReadProject(SqliteDataReader reader)
    {
        return new DbProject
        {
            Id = reader.GetInt64(0),
            Name = reader.GetString(1),
            SourcePath = reader.GetString(2),
            MainOffset = reader.GetInt32(3),
            ProgramCount = reader.GetInt32(4),
            IndexedAt = DateTime.Parse(reader.GetString(5)),
            GitCommit = reader.IsDBNull(6) ? null : reader.GetString(6)
        };
    }

    // =========================================================================
    // PROGRAM OPERATIONS
    // =========================================================================

    public long InsertProgram(DbProgram program, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT INTO programs (project_id, xml_id, ide_position, name, public_name, file_path, task_count, expression_count)
            VALUES (@project_id, @xml_id, @ide_position, @name, @public_name, @file_path, @task_count, @expression_count)",
            new Dictionary<string, object?>
            {
                ["@project_id"] = program.ProjectId,
                ["@xml_id"] = program.XmlId,
                ["@ide_position"] = program.IdePosition,
                ["@name"] = program.Name,
                ["@public_name"] = program.PublicName,
                ["@file_path"] = program.FilePath,
                ["@task_count"] = program.TaskCount,
                ["@expression_count"] = program.ExpressionCount
            }, tx);
        return LastInsertRowId();
    }

    public DbProgram? GetProgramByXmlId(long projectId, int xmlId)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM programs WHERE project_id = @pid AND xml_id = @xid";
        cmd.Parameters.AddWithValue("@pid", projectId);
        cmd.Parameters.AddWithValue("@xid", xmlId);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return ReadProgram(reader);
    }

    public void UpdateProgramStats(long programId, int taskCount, int expressionCount, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            UPDATE programs SET task_count = @tasks, expression_count = @exprs, indexed_at = datetime('now')
            WHERE id = @id",
            new Dictionary<string, object?>
            {
                ["@id"] = programId,
                ["@tasks"] = taskCount,
                ["@exprs"] = expressionCount
            }, tx);
    }

    private static DbProgram ReadProgram(SqliteDataReader reader)
    {
        return new DbProgram
        {
            Id = reader.GetInt64(0),
            ProjectId = reader.GetInt64(1),
            XmlId = reader.GetInt32(2),
            IdePosition = reader.GetInt32(3),
            Name = reader.GetString(4),
            PublicName = reader.IsDBNull(5) ? null : reader.GetString(5),
            FilePath = reader.GetString(6),
            TaskCount = reader.GetInt32(7),
            ExpressionCount = reader.GetInt32(8),
            IndexedAt = DateTime.Parse(reader.GetString(9))
        };
    }

    // =========================================================================
    // TASK OPERATIONS
    // =========================================================================

    public long InsertTask(DbTask task, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT INTO tasks (program_id, isn2, ide_position, description, level, parent_isn2, task_type,
                              main_source_table_id, main_source_access, column_count, logic_line_count)
            VALUES (@program_id, @isn2, @ide_position, @description, @level, @parent_isn2, @task_type,
                   @main_source_table_id, @main_source_access, @column_count, @logic_line_count)",
            new Dictionary<string, object?>
            {
                ["@program_id"] = task.ProgramId,
                ["@isn2"] = task.Isn2,
                ["@ide_position"] = task.IdePosition,
                ["@description"] = task.Description,
                ["@level"] = task.Level,
                ["@parent_isn2"] = task.ParentIsn2,
                ["@task_type"] = task.TaskType,
                ["@main_source_table_id"] = task.MainSourceTableId,
                ["@main_source_access"] = task.MainSourceAccess,
                ["@column_count"] = task.ColumnCount,
                ["@logic_line_count"] = task.LogicLineCount
            }, tx);
        return LastInsertRowId();
    }

    // =========================================================================
    // BULK INSERT OPERATIONS
    // =========================================================================

    public void BulkInsertColumns(IEnumerable<DbDataViewColumn> columns, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT INTO dataview_columns (task_id, line_number, xml_id, variable, name, data_type, picture,
                                         definition, source, source_column_number, locate_expression_id)
            VALUES (@task_id, @line_number, @xml_id, @variable, @name, @data_type, @picture,
                   @definition, @source, @source_column_number, @locate_expression_id)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pTaskId = cmd.Parameters.Add("@task_id", SqliteType.Integer);
        var pLineNum = cmd.Parameters.Add("@line_number", SqliteType.Integer);
        var pXmlId = cmd.Parameters.Add("@xml_id", SqliteType.Integer);
        var pVariable = cmd.Parameters.Add("@variable", SqliteType.Text);
        var pName = cmd.Parameters.Add("@name", SqliteType.Text);
        var pDataType = cmd.Parameters.Add("@data_type", SqliteType.Text);
        var pPicture = cmd.Parameters.Add("@picture", SqliteType.Text);
        var pDefinition = cmd.Parameters.Add("@definition", SqliteType.Text);
        var pSource = cmd.Parameters.Add("@source", SqliteType.Text);
        var pSourceColNum = cmd.Parameters.Add("@source_column_number", SqliteType.Integer);
        var pLocateExpr = cmd.Parameters.Add("@locate_expression_id", SqliteType.Integer);

        foreach (var col in columns)
        {
            pTaskId.Value = col.TaskId;
            pLineNum.Value = col.LineNumber;
            pXmlId.Value = col.XmlId;
            pVariable.Value = col.Variable;
            pName.Value = col.Name;
            pDataType.Value = col.DataType;
            pPicture.Value = col.Picture ?? (object)DBNull.Value;
            pDefinition.Value = col.Definition;
            pSource.Value = col.Source ?? (object)DBNull.Value;
            pSourceColNum.Value = col.SourceColumnNumber ?? (object)DBNull.Value;
            pLocateExpr.Value = col.LocateExpressionId ?? (object)DBNull.Value;
            cmd.ExecuteNonQuery();
        }
    }

    public void BulkInsertLogicLines(IEnumerable<DbLogicLine> lines, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT INTO logic_lines (task_id, line_number, handler, operation, condition_expr, is_disabled, parameters)
            VALUES (@task_id, @line_number, @handler, @operation, @condition_expr, @is_disabled, @parameters)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pTaskId = cmd.Parameters.Add("@task_id", SqliteType.Integer);
        var pLineNum = cmd.Parameters.Add("@line_number", SqliteType.Integer);
        var pHandler = cmd.Parameters.Add("@handler", SqliteType.Text);
        var pOperation = cmd.Parameters.Add("@operation", SqliteType.Text);
        var pCondition = cmd.Parameters.Add("@condition_expr", SqliteType.Text);
        var pDisabled = cmd.Parameters.Add("@is_disabled", SqliteType.Integer);
        var pParams = cmd.Parameters.Add("@parameters", SqliteType.Text);

        foreach (var line in lines)
        {
            pTaskId.Value = line.TaskId;
            pLineNum.Value = line.LineNumber;
            pHandler.Value = line.Handler;
            pOperation.Value = line.Operation;
            pCondition.Value = line.ConditionExpr ?? (object)DBNull.Value;
            pDisabled.Value = line.IsDisabled ? 1 : 0;
            pParams.Value = line.Parameters ?? (object)DBNull.Value;
            cmd.ExecuteNonQuery();
        }
    }

    public void BulkInsertExpressions(IEnumerable<DbExpression> expressions, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT INTO expressions (program_id, xml_id, ide_position, content, comment)
            VALUES (@program_id, @xml_id, @ide_position, @content, @comment)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pProgramId = cmd.Parameters.Add("@program_id", SqliteType.Integer);
        var pXmlId = cmd.Parameters.Add("@xml_id", SqliteType.Integer);
        var pIdePos = cmd.Parameters.Add("@ide_position", SqliteType.Integer);
        var pContent = cmd.Parameters.Add("@content", SqliteType.Text);
        var pComment = cmd.Parameters.Add("@comment", SqliteType.Text);

        foreach (var expr in expressions)
        {
            pProgramId.Value = expr.ProgramId;
            pXmlId.Value = expr.XmlId;
            pIdePos.Value = expr.IdePosition;
            pContent.Value = expr.Content;
            pComment.Value = expr.Comment ?? (object)DBNull.Value;
            cmd.ExecuteNonQuery();
        }
    }

    public void BulkInsertProgramCalls(IEnumerable<DbProgramCall> calls, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT INTO program_calls (caller_task_id, caller_line_number, callee_program_id, callee_project_name, callee_xml_id, arg_count)
            VALUES (@caller_task_id, @caller_line_number, @callee_program_id, @callee_project_name, @callee_xml_id, @arg_count)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pCallerTaskId = cmd.Parameters.Add("@caller_task_id", SqliteType.Integer);
        var pCallerLine = cmd.Parameters.Add("@caller_line_number", SqliteType.Integer);
        var pCalleeProgramId = cmd.Parameters.Add("@callee_program_id", SqliteType.Integer);
        var pCalleeProject = cmd.Parameters.Add("@callee_project_name", SqliteType.Text);
        var pCalleeXmlId = cmd.Parameters.Add("@callee_xml_id", SqliteType.Integer);
        var pArgCount = cmd.Parameters.Add("@arg_count", SqliteType.Integer);

        foreach (var call in calls)
        {
            pCallerTaskId.Value = call.CallerTaskId;
            pCallerLine.Value = call.CallerLineNumber;
            pCalleeProgramId.Value = call.CalleeProgramId ?? (object)DBNull.Value;
            pCalleeProject.Value = call.CalleeProjectName ?? (object)DBNull.Value;
            pCalleeXmlId.Value = call.CalleeXmlId;
            pArgCount.Value = call.ArgCount;
            cmd.ExecuteNonQuery();
        }
    }

    public void BulkInsertTableUsage(IEnumerable<DbTableUsage> usages, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT OR IGNORE INTO table_usage (task_id, table_id, table_name, usage_type, link_number)
            VALUES (@task_id, @table_id, @table_name, @usage_type, @link_number)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pTaskId = cmd.Parameters.Add("@task_id", SqliteType.Integer);
        var pTableId = cmd.Parameters.Add("@table_id", SqliteType.Integer);
        var pTableName = cmd.Parameters.Add("@table_name", SqliteType.Text);
        var pUsageType = cmd.Parameters.Add("@usage_type", SqliteType.Text);
        var pLinkNumber = cmd.Parameters.Add("@link_number", SqliteType.Integer);

        foreach (var usage in usages)
        {
            pTaskId.Value = usage.TaskId;
            pTableId.Value = usage.TableId;
            pTableName.Value = usage.TableName ?? (object)DBNull.Value;
            pUsageType.Value = usage.UsageType;
            pLinkNumber.Value = usage.LinkNumber ?? (object)DBNull.Value;
            cmd.ExecuteNonQuery();
        }
    }

    // =========================================================================
    // FILE HASH OPERATIONS
    // =========================================================================

    public void UpsertFileHash(DbFileHash hash, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT INTO file_hashes (project_id, file_path, file_hash, file_size, last_modified)
            VALUES (@project_id, @file_path, @file_hash, @file_size, @last_modified)
            ON CONFLICT(project_id, file_path) DO UPDATE SET
                file_hash = excluded.file_hash,
                file_size = excluded.file_size,
                last_modified = excluded.last_modified,
                indexed_at = datetime('now')",
            new Dictionary<string, object?>
            {
                ["@project_id"] = hash.ProjectId,
                ["@file_path"] = hash.FilePath,
                ["@file_hash"] = hash.FileHash,
                ["@file_size"] = hash.FileSize,
                ["@last_modified"] = hash.LastModified.ToString("o")
            }, tx);
    }

    public DbFileHash? GetFileHash(long projectId, string filePath)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM file_hashes WHERE project_id = @pid AND file_path = @path";
        cmd.Parameters.AddWithValue("@pid", projectId);
        cmd.Parameters.AddWithValue("@path", filePath);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return new DbFileHash
        {
            Id = reader.GetInt64(0),
            ProjectId = reader.GetInt64(1),
            FilePath = reader.GetString(2),
            FileHash = reader.GetString(3),
            FileSize = reader.GetInt64(4),
            LastModified = DateTime.Parse(reader.GetString(5)),
            IndexedAt = DateTime.Parse(reader.GetString(6))
        };
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    public KbStats GetStats()
    {
        var stats = new KbStats
        {
            ProjectCount = ExecuteScalar<int>("SELECT COUNT(*) FROM projects"),
            ProgramCount = ExecuteScalar<int>("SELECT COUNT(*) FROM programs"),
            TaskCount = ExecuteScalar<int>("SELECT COUNT(*) FROM tasks"),
            ExpressionCount = ExecuteScalar<int>("SELECT COUNT(*) FROM expressions"),
            TableCount = ExecuteScalar<int>("SELECT COUNT(*) FROM tables"),
            ColumnCount = ExecuteScalar<int>("SELECT COUNT(*) FROM dataview_columns"),
            LogicLineCount = ExecuteScalar<int>("SELECT COUNT(*) FROM logic_lines"),
            ProgramCallCount = ExecuteScalar<int>("SELECT COUNT(*) FROM program_calls"),
            DatabaseSizeBytes = File.Exists(_dbPath) ? new FileInfo(_dbPath).Length : 0
        };

        var lastIndexed = ExecuteScalar<string>("SELECT MAX(indexed_at) FROM projects");
        if (!string.IsNullOrEmpty(lastIndexed))
        {
            stats = stats with { LastIndexedAt = DateTime.Parse(lastIndexed) };
        }

        return stats;
    }

    // =========================================================================
    // CLEANUP
    // =========================================================================

    public void Vacuum()
    {
        ExecuteNonQuery("VACUUM");
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _connection?.Close();
                _connection?.Dispose();
            }
            _disposed = true;
        }
    }
}
