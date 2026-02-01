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
                                         definition, source, source_column_number, locate_expression_id,
                                         gui_control_type, gui_table_control_type)
            VALUES (@task_id, @line_number, @xml_id, @variable, @name, @data_type, @picture,
                   @definition, @source, @source_column_number, @locate_expression_id,
                   @gui_control_type, @gui_table_control_type)";

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
        var pGuiControl = cmd.Parameters.Add("@gui_control_type", SqliteType.Text);
        var pGuiTableControl = cmd.Parameters.Add("@gui_table_control_type", SqliteType.Text);

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
            pGuiControl.Value = col.GuiControlType ?? (object)DBNull.Value;
            pGuiTableControl.Value = col.GuiTableControlType ?? (object)DBNull.Value;
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

    public void BulkInsertTaskForms(IEnumerable<DbTaskForm> forms, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT OR IGNORE INTO task_forms (task_id, form_entry_id, form_name, position_x, position_y, width, height, window_type, font,
                form_units, h_factor, v_factor, color, system_menu, minimize_box, maximize_box, properties_json)
            VALUES (@task_id, @form_entry_id, @form_name, @position_x, @position_y, @width, @height, @window_type, @font,
                @form_units, @h_factor, @v_factor, @color, @system_menu, @minimize_box, @maximize_box, @properties_json)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pTaskId = cmd.Parameters.Add("@task_id", SqliteType.Integer);
        var pFormEntryId = cmd.Parameters.Add("@form_entry_id", SqliteType.Integer);
        var pFormName = cmd.Parameters.Add("@form_name", SqliteType.Text);
        var pPosX = cmd.Parameters.Add("@position_x", SqliteType.Integer);
        var pPosY = cmd.Parameters.Add("@position_y", SqliteType.Integer);
        var pWidth = cmd.Parameters.Add("@width", SqliteType.Integer);
        var pHeight = cmd.Parameters.Add("@height", SqliteType.Integer);
        var pWindowType = cmd.Parameters.Add("@window_type", SqliteType.Integer);
        var pFont = cmd.Parameters.Add("@font", SqliteType.Text);
        var pFormUnits = cmd.Parameters.Add("@form_units", SqliteType.Integer);
        var pHFactor = cmd.Parameters.Add("@h_factor", SqliteType.Integer);
        var pVFactor = cmd.Parameters.Add("@v_factor", SqliteType.Integer);
        var pColor = cmd.Parameters.Add("@color", SqliteType.Integer);
        var pSystemMenu = cmd.Parameters.Add("@system_menu", SqliteType.Integer);
        var pMinimizeBox = cmd.Parameters.Add("@minimize_box", SqliteType.Integer);
        var pMaximizeBox = cmd.Parameters.Add("@maximize_box", SqliteType.Integer);
        var pPropsJson = cmd.Parameters.Add("@properties_json", SqliteType.Text);

        foreach (var form in forms)
        {
            pTaskId.Value = form.TaskId;
            pFormEntryId.Value = form.FormEntryId;
            pFormName.Value = form.FormName ?? (object)DBNull.Value;
            pPosX.Value = form.PositionX ?? (object)DBNull.Value;
            pPosY.Value = form.PositionY ?? (object)DBNull.Value;
            pWidth.Value = form.Width ?? (object)DBNull.Value;
            pHeight.Value = form.Height ?? (object)DBNull.Value;
            pWindowType.Value = form.WindowType ?? (object)DBNull.Value;
            pFont.Value = form.Font ?? (object)DBNull.Value;
            pFormUnits.Value = form.FormUnits ?? (object)DBNull.Value;
            pHFactor.Value = form.HFactor ?? (object)DBNull.Value;
            pVFactor.Value = form.VFactor ?? (object)DBNull.Value;
            pColor.Value = form.Color ?? (object)DBNull.Value;
            pSystemMenu.Value = form.SystemMenu ? 1 : 0;
            pMinimizeBox.Value = form.MinimizeBox ? 1 : 0;
            pMaximizeBox.Value = form.MaximizeBox ? 1 : 0;
            pPropsJson.Value = form.PropertiesJson ?? (object)DBNull.Value;
            cmd.ExecuteNonQuery();
        }
    }

    public long GetTaskFormId(long taskId, int formEntryId, SqliteTransaction? tx = null)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT id FROM task_forms WHERE task_id = @task_id AND form_entry_id = @form_entry_id";
        if (tx != null) cmd.Transaction = tx;
        cmd.Parameters.AddWithValue("@task_id", taskId);
        cmd.Parameters.AddWithValue("@form_entry_id", formEntryId);
        var result = cmd.ExecuteScalar();
        return result is long id ? id : 0;
    }

    // =========================================================================
    // V9 BULK INSERT OPERATIONS
    // =========================================================================

    public void BulkInsertTaskParameters(IEnumerable<DbTaskParameter> parameters, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT OR IGNORE INTO task_parameters (task_id, position, mg_attr, is_output)
            VALUES (@task_id, @position, @mg_attr, @is_output)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pTaskId = cmd.Parameters.Add("@task_id", SqliteType.Integer);
        var pPosition = cmd.Parameters.Add("@position", SqliteType.Integer);
        var pMgAttr = cmd.Parameters.Add("@mg_attr", SqliteType.Text);
        var pIsOutput = cmd.Parameters.Add("@is_output", SqliteType.Integer);

        foreach (var p in parameters)
        {
            pTaskId.Value = p.TaskId;
            pPosition.Value = p.Position;
            pMgAttr.Value = p.MgAttr;
            pIsOutput.Value = p.IsOutput ? 1 : 0;
            cmd.ExecuteNonQuery();
        }
    }

    public void InsertTaskInformation(DbTaskInformation info, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT OR IGNORE INTO task_information (task_id, initial_mode, end_task_condition_expr, evaluate_end_condition,
                force_record_delete, main_db_component, key_mode, range_direction, locate_direction, sort_cls,
                box_bottom, box_right, box_direction, open_task_window)
            VALUES (@task_id, @initial_mode, @end_task_condition_expr, @evaluate_end_condition,
                @force_record_delete, @main_db_component, @key_mode, @range_direction, @locate_direction, @sort_cls,
                @box_bottom, @box_right, @box_direction, @open_task_window)",
            new Dictionary<string, object?>
            {
                ["@task_id"] = info.TaskId,
                ["@initial_mode"] = info.InitialMode,
                ["@end_task_condition_expr"] = info.EndTaskConditionExpr,
                ["@evaluate_end_condition"] = info.EvaluateEndCondition,
                ["@force_record_delete"] = info.ForceRecordDelete,
                ["@main_db_component"] = info.MainDbComponent,
                ["@key_mode"] = info.KeyMode,
                ["@range_direction"] = info.RangeDirection,
                ["@locate_direction"] = info.LocateDirection,
                ["@sort_cls"] = info.SortCls,
                ["@box_bottom"] = info.BoxBottom,
                ["@box_right"] = info.BoxRight,
                ["@box_direction"] = info.BoxDirection,
                ["@open_task_window"] = info.OpenTaskWindow
            }, tx);
    }

    public void InsertTaskProperties(DbTaskProperties props, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT OR IGNORE INTO task_properties (task_id, transaction_mode, transaction_begin, locking_strategy,
                cache_strategy, error_strategy, confirm_update, confirm_cancel, allow_empty_dataview, preload_view,
                selection_table, force_record_suffix, keep_created_context)
            VALUES (@task_id, @transaction_mode, @transaction_begin, @locking_strategy,
                @cache_strategy, @error_strategy, @confirm_update, @confirm_cancel, @allow_empty_dataview, @preload_view,
                @selection_table, @force_record_suffix, @keep_created_context)",
            new Dictionary<string, object?>
            {
                ["@task_id"] = props.TaskId,
                ["@transaction_mode"] = props.TransactionMode,
                ["@transaction_begin"] = props.TransactionBegin,
                ["@locking_strategy"] = props.LockingStrategy,
                ["@cache_strategy"] = props.CacheStrategy,
                ["@error_strategy"] = props.ErrorStrategy,
                ["@confirm_update"] = props.ConfirmUpdate,
                ["@confirm_cancel"] = props.ConfirmCancel,
                ["@allow_empty_dataview"] = props.AllowEmptyDataview ? 1 : 0,
                ["@preload_view"] = props.PreloadView ? 1 : 0,
                ["@selection_table"] = props.SelectionTable,
                ["@force_record_suffix"] = props.ForceRecordSuffix,
                ["@keep_created_context"] = props.KeepCreatedContext
            }, tx);
    }

    public void InsertTaskPermissions(DbTaskPermissions perms, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT OR IGNORE INTO task_permissions (task_id, allow_create, allow_delete, allow_modify, allow_query,
                allow_locate, allow_range, allow_sorting, allow_events, allow_index_change, allow_index_optimization,
                allow_io_files, allow_location_in_query, allow_options, allow_printing_data, record_cycle)
            VALUES (@task_id, @allow_create, @allow_delete, @allow_modify, @allow_query,
                @allow_locate, @allow_range, @allow_sorting, @allow_events, @allow_index_change, @allow_index_optimization,
                @allow_io_files, @allow_location_in_query, @allow_options, @allow_printing_data, @record_cycle)",
            new Dictionary<string, object?>
            {
                ["@task_id"] = perms.TaskId,
                ["@allow_create"] = perms.AllowCreate ? 1 : 0,
                ["@allow_delete"] = perms.AllowDelete ? 1 : 0,
                ["@allow_modify"] = perms.AllowModify ? 1 : 0,
                ["@allow_query"] = perms.AllowQuery ? 1 : 0,
                ["@allow_locate"] = perms.AllowLocate ? 1 : 0,
                ["@allow_range"] = perms.AllowRange ? 1 : 0,
                ["@allow_sorting"] = perms.AllowSorting ? 1 : 0,
                ["@allow_events"] = perms.AllowEvents ? 1 : 0,
                ["@allow_index_change"] = perms.AllowIndexChange ? 1 : 0,
                ["@allow_index_optimization"] = perms.AllowIndexOptimization ? 1 : 0,
                ["@allow_io_files"] = perms.AllowIoFiles ? 1 : 0,
                ["@allow_location_in_query"] = perms.AllowLocationInQuery ? 1 : 0,
                ["@allow_options"] = perms.AllowOptions ? 1 : 0,
                ["@allow_printing_data"] = perms.AllowPrintingData ? 1 : 0,
                ["@record_cycle"] = perms.RecordCycle
            }, tx);
    }

    public void BulkInsertEventHandlers(IEnumerable<DbEventHandler> handlers, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT OR IGNORE INTO event_handlers (task_id, event_id, description, force_exit, event_type,
                public_object_comp, public_object_obj)
            VALUES (@task_id, @event_id, @description, @force_exit, @event_type,
                @public_object_comp, @public_object_obj)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pTaskId = cmd.Parameters.Add("@task_id", SqliteType.Integer);
        var pEventId = cmd.Parameters.Add("@event_id", SqliteType.Integer);
        var pDescription = cmd.Parameters.Add("@description", SqliteType.Text);
        var pForceExit = cmd.Parameters.Add("@force_exit", SqliteType.Text);
        var pEventType = cmd.Parameters.Add("@event_type", SqliteType.Text);
        var pPublicObjectComp = cmd.Parameters.Add("@public_object_comp", SqliteType.Text);
        var pPublicObjectObj = cmd.Parameters.Add("@public_object_obj", SqliteType.Integer);

        foreach (var h in handlers)
        {
            pTaskId.Value = h.TaskId;
            pEventId.Value = h.EventId;
            pDescription.Value = h.Description ?? (object)DBNull.Value;
            pForceExit.Value = h.ForceExit ?? (object)DBNull.Value;
            pEventType.Value = h.EventType ?? (object)DBNull.Value;
            pPublicObjectComp.Value = h.PublicObjectComp ?? (object)DBNull.Value;
            pPublicObjectObj.Value = h.PublicObjectObj ?? (object)DBNull.Value;
            cmd.ExecuteNonQuery();
        }
    }

    public void BulkInsertFieldRanges(IEnumerable<DbFieldRange> ranges, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT OR IGNORE INTO field_ranges (task_id, range_id, column_obj, min_expr, max_expr)
            VALUES (@task_id, @range_id, @column_obj, @min_expr, @max_expr)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pTaskId = cmd.Parameters.Add("@task_id", SqliteType.Integer);
        var pRangeId = cmd.Parameters.Add("@range_id", SqliteType.Integer);
        var pColumnObj = cmd.Parameters.Add("@column_obj", SqliteType.Integer);
        var pMinExpr = cmd.Parameters.Add("@min_expr", SqliteType.Integer);
        var pMaxExpr = cmd.Parameters.Add("@max_expr", SqliteType.Integer);

        foreach (var r in ranges)
        {
            pTaskId.Value = r.TaskId;
            pRangeId.Value = r.RangeId;
            pColumnObj.Value = r.ColumnObj ?? (object)DBNull.Value;
            pMinExpr.Value = r.MinExpr ?? (object)DBNull.Value;
            pMaxExpr.Value = r.MaxExpr ?? (object)DBNull.Value;
            cmd.ExecuteNonQuery();
        }
    }

    public void InsertProgramMetadata(DbProgramMetadata meta, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT OR IGNORE INTO program_metadata (program_id, task_type, last_modified_date, last_modified_time,
                execution_right, is_resident, is_sql, is_external, form_type, has_dotnet, has_sql_where,
                is_main_program, last_isn)
            VALUES (@program_id, @task_type, @last_modified_date, @last_modified_time,
                @execution_right, @is_resident, @is_sql, @is_external, @form_type, @has_dotnet, @has_sql_where,
                @is_main_program, @last_isn)",
            new Dictionary<string, object?>
            {
                ["@program_id"] = meta.ProgramId,
                ["@task_type"] = meta.TaskType,
                ["@last_modified_date"] = meta.LastModifiedDate,
                ["@last_modified_time"] = meta.LastModifiedTime,
                ["@execution_right"] = meta.ExecutionRight,
                ["@is_resident"] = meta.IsResident ? 1 : 0,
                ["@is_sql"] = meta.IsSql ? 1 : 0,
                ["@is_external"] = meta.IsExternal ? 1 : 0,
                ["@form_type"] = meta.FormType,
                ["@has_dotnet"] = meta.HasDotNet ? 1 : 0,
                ["@has_sql_where"] = meta.HasSqlWhere ? 1 : 0,
                ["@is_main_program"] = meta.IsMainProgram ? 1 : 0,
                ["@last_isn"] = meta.LastIsn
            }, tx);
    }

    public long BulkInsertFormControls(IEnumerable<DbFormControl> controls, SqliteTransaction? tx = null)
    {
        const string sql = @"
            INSERT OR IGNORE INTO form_controls (form_id, control_id, control_type, control_name, x, y, width, height,
                visible, enabled, tab_order, linked_field_id, linked_variable,
                parent_id, style, color, font_id, text, format,
                data_field_id, data_expression_id, raise_event_type, raise_event_id,
                image_file, items_list, column_title, control_layer, h_alignment,
                title_height, row_height, elements, allow_parking,
                visible_expression, enabled_expression, properties_json)
            VALUES (@form_id, @control_id, @control_type, @control_name, @x, @y, @width, @height,
                @visible, @enabled, @tab_order, @linked_field_id, @linked_variable,
                @parent_id, @style, @color, @font_id, @text, @format,
                @data_field_id, @data_expression_id, @raise_event_type, @raise_event_id,
                @image_file, @items_list, @column_title, @control_layer, @h_alignment,
                @title_height, @row_height, @elements, @allow_parking,
                @visible_expression, @enabled_expression, @properties_json)";

        using var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        if (tx != null) cmd.Transaction = tx;

        var pFormId = cmd.Parameters.Add("@form_id", SqliteType.Integer);
        var pControlId = cmd.Parameters.Add("@control_id", SqliteType.Integer);
        var pControlType = cmd.Parameters.Add("@control_type", SqliteType.Text);
        var pControlName = cmd.Parameters.Add("@control_name", SqliteType.Text);
        var pX = cmd.Parameters.Add("@x", SqliteType.Integer);
        var pY = cmd.Parameters.Add("@y", SqliteType.Integer);
        var pWidth = cmd.Parameters.Add("@width", SqliteType.Integer);
        var pHeight = cmd.Parameters.Add("@height", SqliteType.Integer);
        var pVisible = cmd.Parameters.Add("@visible", SqliteType.Integer);
        var pEnabled = cmd.Parameters.Add("@enabled", SqliteType.Integer);
        var pTabOrder = cmd.Parameters.Add("@tab_order", SqliteType.Integer);
        var pLinkedFieldId = cmd.Parameters.Add("@linked_field_id", SqliteType.Integer);
        var pLinkedVariable = cmd.Parameters.Add("@linked_variable", SqliteType.Text);
        var pParentId = cmd.Parameters.Add("@parent_id", SqliteType.Integer);
        var pStyle = cmd.Parameters.Add("@style", SqliteType.Integer);
        var pColor = cmd.Parameters.Add("@color", SqliteType.Integer);
        var pFontId = cmd.Parameters.Add("@font_id", SqliteType.Integer);
        var pText = cmd.Parameters.Add("@text", SqliteType.Text);
        var pFormat = cmd.Parameters.Add("@format", SqliteType.Text);
        var pDataFieldId = cmd.Parameters.Add("@data_field_id", SqliteType.Integer);
        var pDataExprId = cmd.Parameters.Add("@data_expression_id", SqliteType.Integer);
        var pRaiseEventType = cmd.Parameters.Add("@raise_event_type", SqliteType.Text);
        var pRaiseEventId = cmd.Parameters.Add("@raise_event_id", SqliteType.Integer);
        var pImageFile = cmd.Parameters.Add("@image_file", SqliteType.Text);
        var pItemsList = cmd.Parameters.Add("@items_list", SqliteType.Text);
        var pColumnTitle = cmd.Parameters.Add("@column_title", SqliteType.Text);
        var pControlLayer = cmd.Parameters.Add("@control_layer", SqliteType.Integer);
        var pHAlignment = cmd.Parameters.Add("@h_alignment", SqliteType.Integer);
        var pTitleHeight = cmd.Parameters.Add("@title_height", SqliteType.Integer);
        var pRowHeight = cmd.Parameters.Add("@row_height", SqliteType.Integer);
        var pElements = cmd.Parameters.Add("@elements", SqliteType.Integer);
        var pAllowParking = cmd.Parameters.Add("@allow_parking", SqliteType.Integer);
        var pVisibleExpr = cmd.Parameters.Add("@visible_expression", SqliteType.Integer);
        var pEnabledExpr = cmd.Parameters.Add("@enabled_expression", SqliteType.Integer);
        var pPropertiesJson = cmd.Parameters.Add("@properties_json", SqliteType.Text);

        long count = 0;
        foreach (var c in controls)
        {
            pFormId.Value = c.FormId;
            pControlId.Value = c.ControlId;
            pControlType.Value = c.ControlType ?? (object)DBNull.Value;
            pControlName.Value = c.ControlName ?? (object)DBNull.Value;
            pX.Value = c.X ?? (object)DBNull.Value;
            pY.Value = c.Y ?? (object)DBNull.Value;
            pWidth.Value = c.Width ?? (object)DBNull.Value;
            pHeight.Value = c.Height ?? (object)DBNull.Value;
            pVisible.Value = c.Visible ? 1 : 0;
            pEnabled.Value = c.Enabled ? 1 : 0;
            pTabOrder.Value = c.TabOrder ?? (object)DBNull.Value;
            pLinkedFieldId.Value = c.LinkedFieldId ?? (object)DBNull.Value;
            pLinkedVariable.Value = c.LinkedVariable ?? (object)DBNull.Value;
            pParentId.Value = c.ParentId ?? (object)DBNull.Value;
            pStyle.Value = c.Style ?? (object)DBNull.Value;
            pColor.Value = c.Color ?? (object)DBNull.Value;
            pFontId.Value = c.FontId ?? (object)DBNull.Value;
            pText.Value = c.Text ?? (object)DBNull.Value;
            pFormat.Value = c.Format ?? (object)DBNull.Value;
            pDataFieldId.Value = c.DataFieldId ?? (object)DBNull.Value;
            pDataExprId.Value = c.DataExpressionId ?? (object)DBNull.Value;
            pRaiseEventType.Value = c.RaiseEventType ?? (object)DBNull.Value;
            pRaiseEventId.Value = c.RaiseEventId ?? (object)DBNull.Value;
            pImageFile.Value = c.ImageFile ?? (object)DBNull.Value;
            pItemsList.Value = c.ItemsList ?? (object)DBNull.Value;
            pColumnTitle.Value = c.ColumnTitle ?? (object)DBNull.Value;
            pControlLayer.Value = c.ControlLayer ?? (object)DBNull.Value;
            pHAlignment.Value = c.HAlignment ?? (object)DBNull.Value;
            pTitleHeight.Value = c.TitleHeight ?? (object)DBNull.Value;
            pRowHeight.Value = c.RowHeight ?? (object)DBNull.Value;
            pElements.Value = c.Elements ?? (object)DBNull.Value;
            pAllowParking.Value = c.AllowParking ? 1 : 0;
            pVisibleExpr.Value = c.VisibleExpression ?? (object)DBNull.Value;
            pEnabledExpr.Value = c.EnabledExpression ?? (object)DBNull.Value;
            pPropertiesJson.Value = c.PropertiesJson ?? (object)DBNull.Value;
            cmd.ExecuteNonQuery();
            count++;
        }
        return count;
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
    // DECODED EXPRESSIONS CACHE (Schema v2)
    // =========================================================================

    public DbDecodedExpression? GetCachedExpression(string project, int programId, int expressionId)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT id, project, program_id, expression_id, raw_expression, decoded_text,
                   variables_json, offset_used, cached_at
            FROM decoded_expressions
            WHERE project = @project AND program_id = @pid AND expression_id = @eid";
        cmd.Parameters.AddWithValue("@project", project);
        cmd.Parameters.AddWithValue("@pid", programId);
        cmd.Parameters.AddWithValue("@eid", expressionId);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return new DbDecodedExpression
        {
            Id = reader.GetInt64(0),
            Project = reader.GetString(1),
            ProgramId = reader.GetInt32(2),
            ExpressionId = reader.GetInt32(3),
            RawExpression = reader.IsDBNull(4) ? null : reader.GetString(4),
            DecodedText = reader.GetString(5),
            VariablesJson = reader.IsDBNull(6) ? null : reader.GetString(6),
            OffsetUsed = reader.IsDBNull(7) ? null : reader.GetInt32(7),
            CachedAt = DateTime.Parse(reader.GetString(8))
        };
    }

    public void UpsertCachedExpression(DbDecodedExpression expr, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT INTO decoded_expressions (project, program_id, expression_id, raw_expression,
                                            decoded_text, variables_json, offset_used)
            VALUES (@project, @pid, @eid, @raw, @decoded, @vars, @offset)
            ON CONFLICT(project, program_id, expression_id) DO UPDATE SET
                decoded_text = excluded.decoded_text,
                variables_json = excluded.variables_json,
                offset_used = excluded.offset_used,
                cached_at = datetime('now')",
            new Dictionary<string, object?>
            {
                ["@project"] = expr.Project,
                ["@pid"] = expr.ProgramId,
                ["@eid"] = expr.ExpressionId,
                ["@raw"] = expr.RawExpression,
                ["@decoded"] = expr.DecodedText,
                ["@vars"] = expr.VariablesJson,
                ["@offset"] = expr.OffsetUsed
            }, tx);
    }

    public int GetCachedExpressionCount()
    {
        return ExecuteScalar<int>("SELECT COUNT(*) FROM decoded_expressions");
    }

    // =========================================================================
    // TICKET METRICS (Schema v2)
    // =========================================================================

    public void UpsertTicketMetrics(DbTicketMetrics metrics, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT INTO ticket_metrics (ticket_key, project, started_at, completed_at, phases_completed,
                                       pattern_matched, programs_analyzed, expressions_decoded,
                                       resolution_time_minutes, success)
            VALUES (@key, @project, @started, @completed, @phases, @pattern, @progs, @exprs, @time, @success)
            ON CONFLICT(ticket_key) DO UPDATE SET
                completed_at = COALESCE(excluded.completed_at, ticket_metrics.completed_at),
                phases_completed = excluded.phases_completed,
                pattern_matched = COALESCE(excluded.pattern_matched, ticket_metrics.pattern_matched),
                programs_analyzed = excluded.programs_analyzed,
                expressions_decoded = excluded.expressions_decoded,
                resolution_time_minutes = excluded.resolution_time_minutes,
                success = excluded.success",
            new Dictionary<string, object?>
            {
                ["@key"] = metrics.TicketKey,
                ["@project"] = metrics.Project,
                ["@started"] = metrics.StartedAt?.ToString("o"),
                ["@completed"] = metrics.CompletedAt?.ToString("o"),
                ["@phases"] = metrics.PhasesCompleted,
                ["@pattern"] = metrics.PatternMatched,
                ["@progs"] = metrics.ProgramsAnalyzed,
                ["@exprs"] = metrics.ExpressionsDecoded,
                ["@time"] = metrics.ResolutionTimeMinutes,
                ["@success"] = metrics.Success ? 1 : 0
            }, tx);
    }

    public DbTicketMetrics? GetTicketMetrics(string ticketKey)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM ticket_metrics WHERE ticket_key = @key";
        cmd.Parameters.AddWithValue("@key", ticketKey);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return ReadTicketMetrics(reader);
    }

    public IEnumerable<DbTicketMetrics> GetRecentTicketMetrics(int limit = 20)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT * FROM ticket_metrics
            ORDER BY COALESCE(completed_at, started_at) DESC
            LIMIT @limit";
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            yield return ReadTicketMetrics(reader);
        }
    }

    private static DbTicketMetrics ReadTicketMetrics(SqliteDataReader reader)
    {
        return new DbTicketMetrics
        {
            TicketKey = reader.GetString(0),
            Project = reader.IsDBNull(1) ? null : reader.GetString(1),
            StartedAt = reader.IsDBNull(2) ? null : DateTime.Parse(reader.GetString(2)),
            CompletedAt = reader.IsDBNull(3) ? null : DateTime.Parse(reader.GetString(3)),
            PhasesCompleted = reader.GetInt32(4),
            PatternMatched = reader.IsDBNull(5) ? null : reader.GetString(5),
            ProgramsAnalyzed = reader.GetInt32(6),
            ExpressionsDecoded = reader.GetInt32(7),
            ResolutionTimeMinutes = reader.IsDBNull(8) ? null : reader.GetInt32(8),
            Success = reader.GetInt32(9) == 1
        };
    }

    // =========================================================================
    // RESOLUTION PATTERNS (Schema v2)
    // =========================================================================

    public long InsertPattern(DbResolutionPattern pattern, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            INSERT INTO resolution_patterns (pattern_name, symptom_keywords, root_cause_type,
                                            solution_template, source_ticket)
            VALUES (@name, @keywords, @cause, @solution, @ticket)",
            new Dictionary<string, object?>
            {
                ["@name"] = pattern.PatternName,
                ["@keywords"] = pattern.SymptomKeywords,
                ["@cause"] = pattern.RootCauseType,
                ["@solution"] = pattern.SolutionTemplate,
                ["@ticket"] = pattern.SourceTicket
            }, tx);
        return LastInsertRowId();
    }

    public DbResolutionPattern? GetPattern(string patternName)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM resolution_patterns WHERE pattern_name = @name";
        cmd.Parameters.AddWithValue("@name", patternName);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return ReadPattern(reader);
    }

    public DbResolutionPattern? GetPatternById(long id)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM resolution_patterns WHERE id = @id";
        cmd.Parameters.AddWithValue("@id", id);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return ReadPattern(reader);
    }

    public IEnumerable<DbResolutionPattern> GetAllPatterns()
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "SELECT * FROM resolution_patterns ORDER BY usage_count DESC, pattern_name";

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            yield return ReadPattern(reader);
        }
    }

    public IEnumerable<PatternSearchResult> SearchPatterns(string query, int limit = 10)
    {
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = @"
            SELECT p.id, p.pattern_name, p.root_cause_type, p.source_ticket, p.usage_count,
                   bm25(patterns_fts) as score
            FROM patterns_fts
            JOIN resolution_patterns p ON patterns_fts.rowid = p.id
            WHERE patterns_fts MATCH @query
            ORDER BY score
            LIMIT @limit";
        cmd.Parameters.AddWithValue("@query", query);
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            yield return new PatternSearchResult
            {
                PatternId = reader.GetInt64(0),
                PatternName = reader.GetString(1),
                RootCauseType = reader.IsDBNull(2) ? null : reader.GetString(2),
                SourceTicket = reader.IsDBNull(3) ? null : reader.GetString(3),
                UsageCount = reader.GetInt32(4),
                Score = reader.GetDouble(5)
            };
        }
    }

    public void IncrementPatternUsage(long patternId, SqliteTransaction? tx = null)
    {
        ExecuteNonQuery(@"
            UPDATE resolution_patterns
            SET usage_count = usage_count + 1, last_used_at = datetime('now')
            WHERE id = @id",
            new Dictionary<string, object?> { ["@id"] = patternId }, tx);
    }

    private static DbResolutionPattern ReadPattern(SqliteDataReader reader)
    {
        return new DbResolutionPattern
        {
            Id = reader.GetInt64(0),
            PatternName = reader.GetString(1),
            SymptomKeywords = reader.IsDBNull(2) ? null : reader.GetString(2),
            RootCauseType = reader.IsDBNull(3) ? null : reader.GetString(3),
            SolutionTemplate = reader.IsDBNull(4) ? null : reader.GetString(4),
            SourceTicket = reader.IsDBNull(5) ? null : reader.GetString(5),
            UsageCount = reader.GetInt32(6),
            CreatedAt = DateTime.Parse(reader.GetString(7)),
            LastUsedAt = reader.IsDBNull(8) ? null : DateTime.Parse(reader.GetString(8))
        };
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
