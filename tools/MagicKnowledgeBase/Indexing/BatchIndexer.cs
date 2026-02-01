using System.Diagnostics;
using System.Text.Json;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Indexing;

/// <summary>
/// Orchestrates full indexing of all Magic projects into the knowledge base
/// </summary>
public class BatchIndexer
{
    private readonly KnowledgeDb _db;
    private readonly string _projectsBasePath;
    private readonly IProgress<IndexProgress>? _progress;
    private readonly int _parallelism;

    /// <summary>
    /// Main offsets per project (VG variables count from Main program)
    /// </summary>
    private static readonly Dictionary<string, int> MainOffsets = new(StringComparer.OrdinalIgnoreCase)
    {
        ["ADH"] = 117,
        ["PVE"] = 143,
        ["PBG"] = 91,
        ["VIL"] = 52,
        ["PBP"] = 88,
        ["REF"] = 107
    };

    public BatchIndexer(KnowledgeDb db, string projectsBasePath, IProgress<IndexProgress>? progress = null, int parallelism = 4)
    {
        _db = db;
        _projectsBasePath = projectsBasePath;
        _progress = progress;
        _parallelism = parallelism;
    }

    /// <summary>
    /// Index all projects in the base path
    /// </summary>
    public async Task<IndexResult> IndexAllAsync(CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new IndexResult();

        // Discover all projects
        var projectNames = DiscoverProjects();
        result.TotalProjects = projectNames.Length;

        _progress?.Report(new IndexProgress
        {
            Phase = "Discovery",
            Message = $"Found {projectNames.Length} projects",
            TotalProjects = projectNames.Length
        });

        // Parse tables first (from REF/Source/DataSources.xml)
        var tableParser = new TableParser(_projectsBasePath);
        var tables = tableParser.ParseDataSources();
        IndexTables(tables, cancellationToken);
        result.TablesIndexed = tables.Count;

        // Index each project
        foreach (var projectName in projectNames)
        {
            if (cancellationToken.IsCancellationRequested) break;

            try
            {
                var projectResult = await IndexProjectAsync(projectName, cancellationToken);
                result.ProgramsIndexed += projectResult.ProgramsIndexed;
                result.TasksIndexed += projectResult.TasksIndexed;
                result.ExpressionsIndexed += projectResult.ExpressionsIndexed;
                result.ProjectsIndexed++;

                _progress?.Report(new IndexProgress
                {
                    Phase = "Indexing",
                    Message = $"Indexed {projectName}: {projectResult.ProgramsIndexed} programs",
                    ProjectsCompleted = result.ProjectsIndexed,
                    TotalProjects = projectNames.Length,
                    CurrentProject = projectName
                });
            }
            catch (Exception ex)
            {
                result.Errors.Add($"{projectName}: {ex.Message}");
                _progress?.Report(new IndexProgress
                {
                    Phase = "Error",
                    Message = $"Failed to index {projectName}: {ex.Message}",
                    ProjectsCompleted = result.ProjectsIndexed,
                    TotalProjects = projectNames.Length
                });
            }
        }

        // Resolve cross-references
        _progress?.Report(new IndexProgress
        {
            Phase = "Resolving",
            Message = "Resolving cross-references..."
        });

        var resolver = new RelationshipResolver(_db);
        resolver.ResolveProgramCalls();

        // Vacuum to optimize
        _db.Vacuum();

        stopwatch.Stop();
        result.ElapsedMs = stopwatch.ElapsedMilliseconds;

        _progress?.Report(new IndexProgress
        {
            Phase = "Complete",
            Message = $"Indexing complete in {stopwatch.Elapsed.TotalSeconds:F1}s",
            ProjectsCompleted = result.ProjectsIndexed,
            TotalProjects = projectNames.Length
        });

        return result;
    }

    /// <summary>
    /// Index a single project
    /// </summary>
    public Task<IndexResult> IndexProjectAsync(string projectName, CancellationToken cancellationToken = default)
    {
        return Task.Run(() => IndexProjectSync(projectName, cancellationToken), cancellationToken);
    }

    private IndexResult IndexProjectSync(string projectName, CancellationToken cancellationToken)
    {
        var result = new IndexResult { TotalProjects = 1 };
        var sourcePath = Path.Combine(_projectsBasePath, projectName, "Source");

        if (!Directory.Exists(sourcePath))
        {
            throw new DirectoryNotFoundException($"Project source path not found: {sourcePath}");
        }

        // Delete existing project data (for re-index)
        var existingProject = _db.GetProject(projectName);
        if (existingProject != null)
        {
            using var deleteTx = _db.BeginTransaction();
            _db.DeleteProject(existingProject.Id, deleteTx);
            deleteTx.Commit();
        }

        // Create project record
        var mainOffset = MainOffsets.GetValueOrDefault(projectName.ToUpperInvariant(), 0);
        var projectId = _db.InsertProject(new DbProject
        {
            Name = projectName,
            SourcePath = sourcePath,
            MainOffset = mainOffset,
            ProgramCount = 0
        });

        // Parse program metadata
        var scanner = new ProjectScanner(sourcePath);
        var programFiles = scanner.DiscoverPrograms();
        var programHeaders = scanner.ParseProgramHeaders();
        var programPositions = scanner.ParseProgramPositions();

        // Validate for orphan programs (XML exists but not in headers)
        var orphanValidation = scanner.ValidateOrphans();
        if (orphanValidation.HasOrphans)
        {
            _progress?.Report(new IndexProgress
            {
                Phase = "Validation",
                Message = $"{projectName}: Found {orphanValidation.OrphanPrograms.Count} orphan programs (XML without header entry)",
                CurrentProject = projectName
            });

            // Add orphan programs to headers dictionary for indexing
            foreach (var orphan in orphanValidation.OrphanPrograms)
            {
                programHeaders[orphan.Id] = orphan;
            }
        }

        if (orphanValidation.HasGhosts)
        {
            _progress?.Report(new IndexProgress
            {
                Phase = "Validation",
                Message = $"{projectName}: Found {orphanValidation.GhostEntries.Count} ghost entries (header without XML)",
                CurrentProject = projectName
            });
        }

        // Parse programs in batches (no offset applied, done at display time)
        var parser = new ProgramParser();
        var batchSize = 50;
        var programBatches = programFiles.Chunk(batchSize);

        foreach (var batch in programBatches)
        {
            if (cancellationToken.IsCancellationRequested) break;

            using var tx = _db.BeginTransaction();

            foreach (var prgFile in batch)
            {
                var xmlId = ExtractProgramId(prgFile);
                if (xmlId == null) continue;

                var idePosition = programPositions.GetValueOrDefault(xmlId.Value, 0);
                var header = programHeaders.GetValueOrDefault(xmlId.Value);

                try
                {
                    var parsed = parser.ParseProgram(prgFile, xmlId.Value, idePosition, header, projectName);

                    // Insert program
                    var programId = _db.InsertProgram(new DbProgram
                    {
                        ProjectId = projectId,
                        XmlId = xmlId.Value,
                        IdePosition = idePosition,
                        Name = parsed.Name,
                        PublicName = parsed.PublicName,
                        FilePath = prgFile,
                        TaskCount = parsed.Tasks.Count,
                        ExpressionCount = parsed.Expressions.Count
                    }, tx);

                    // V9: Insert program metadata
                    if (parsed.Metadata != null)
                    {
                        _db.InsertProgramMetadata(new DbProgramMetadata
                        {
                            ProgramId = programId,
                            TaskType = parsed.Metadata.TaskType,
                            LastModifiedDate = parsed.Metadata.LastModifiedDate,
                            LastModifiedTime = parsed.Metadata.LastModifiedTime,
                            LastModifiedTs = null, // Can be computed from Date+Time if needed
                            ExecutionRight = parsed.Metadata.ExecutionRight,
                            IsResident = parsed.Metadata.IsResident,
                            IsSql = parsed.Metadata.IsSql,
                            IsExternal = parsed.Metadata.IsExternal,
                            FormType = parsed.Metadata.FormType,
                            HasDotNet = parsed.Metadata.HasDotNet,
                            HasSqlWhere = parsed.Metadata.HasSqlWhere,
                            IsMainProgram = parsed.Metadata.IsMainProgram,
                            LastIsn = parsed.Metadata.LastIsn
                        }, tx);
                    }

                    // Insert tasks
                    foreach (var task in parsed.Tasks.Values)
                    {
                        var taskId = _db.InsertTask(new DbTask
                        {
                            ProgramId = programId,
                            Isn2 = task.Isn2,
                            IdePosition = task.IdePosition,
                            Description = task.Description,
                            Level = task.Level,
                            ParentIsn2 = task.ParentIsn2,
                            TaskType = task.TaskType,
                            MainSourceTableId = task.MainSourceTableId,
                            MainSourceAccess = task.MainSourceAccess,
                            ColumnCount = task.Columns.Count,
                            LogicLineCount = task.LogicLines.Count
                        }, tx);

                        // Insert columns
                        if (task.Columns.Count > 0)
                        {
                            _db.BulkInsertColumns(task.Columns.Select(c => new DbDataViewColumn
                            {
                                TaskId = taskId,
                                LineNumber = c.LineNumber,
                                XmlId = c.XmlId,
                                Variable = c.Variable,
                                Name = c.Name,
                                DataType = c.DataType,
                                Picture = c.Picture,
                                Definition = c.Definition,
                                Source = c.Source,
                                SourceColumnNumber = c.SourceColumnNumber,
                                LocateExpressionId = c.LocateExpressionId,
                                GuiControlType = c.GuiControlType,
                                GuiTableControlType = c.GuiTableControlType
                            }), tx);
                        }

                        // Insert logic lines
                        if (task.LogicLines.Count > 0)
                        {
                            _db.BulkInsertLogicLines(task.LogicLines.Select(l => new DbLogicLine
                            {
                                TaskId = taskId,
                                LineNumber = l.LineNumber,
                                Handler = l.Handler,
                                Operation = l.Operation,
                                ConditionExpr = l.Condition,
                                IsDisabled = l.IsDisabled,
                                Parameters = l.Parameters != null ? JsonSerializer.Serialize(l.Parameters) : null
                            }), tx);
                        }

                        // Insert table usages
                        if (task.TableUsages.Count > 0)
                        {
                            _db.BulkInsertTableUsage(task.TableUsages.Select(u => new DbTableUsage
                            {
                                TaskId = taskId,
                                TableId = u.TableId,
                                TableName = u.TableName,
                                UsageType = u.UsageType,
                                LinkNumber = u.LinkNumber
                            }), tx);
                        }

                        // Insert program calls (will resolve callee_program_id later)
                        if (task.ProgramCalls.Count > 0)
                        {
                            _db.BulkInsertProgramCalls(task.ProgramCalls.Select(c => new DbProgramCall
                            {
                                CallerTaskId = taskId,
                                CallerLineNumber = c.LineNumber,
                                CalleeProjectName = c.TargetProject,
                                CalleeXmlId = c.TargetProgramXmlId,
                                ArgCount = c.ArgCount
                            }), tx);
                        }

                        // Insert task forms (UI screens) + form controls
                        if (task.Forms.Count > 0)
                        {
                            _db.BulkInsertTaskForms(task.Forms.Select(f => new DbTaskForm
                            {
                                TaskId = taskId,
                                FormEntryId = f.FormEntryId,
                                FormName = f.FormName,
                                PositionX = f.PositionX,
                                PositionY = f.PositionY,
                                Width = f.Width,
                                Height = f.Height,
                                WindowType = f.WindowType,
                                Font = f.Font,
                                FormUnits = f.FormUnits,
                                HFactor = f.HFactor,
                                VFactor = f.VFactor,
                                Color = f.Color,
                                SystemMenu = f.SystemMenu,
                                MinimizeBox = f.MinimizeBox,
                                MaximizeBox = f.MaximizeBox,
                                PropertiesJson = f.PropertiesJson
                            }), tx);

                            // Insert form controls with ALL properties
                            foreach (var form in task.Forms)
                            {
                                if (form.Controls.Count == 0) continue;
                                var formId = _db.GetTaskFormId(taskId, form.FormEntryId, tx);
                                if (formId <= 0) continue;
                                _db.BulkInsertFormControls(form.Controls.Select(c => new DbFormControl
                                {
                                    FormId = formId,
                                    ControlId = c.ControlId,
                                    ControlType = c.ControlType,
                                    ControlName = c.ControlName,
                                    X = c.X,
                                    Y = c.Y,
                                    Width = c.Width,
                                    Height = c.Height,
                                    Visible = c.Visible,
                                    Enabled = c.Enabled,
                                    TabOrder = c.TabOrder,
                                    LinkedFieldId = c.LinkedFieldId,
                                    LinkedVariable = c.LinkedVariable,
                                    ParentId = c.ParentId,
                                    Style = c.Style,
                                    Color = c.Color,
                                    FontId = c.FontId,
                                    Text = c.Text,
                                    Format = c.Format,
                                    DataFieldId = c.DataFieldId,
                                    DataExpressionId = c.DataExpressionId,
                                    RaiseEventType = c.RaiseEventType,
                                    RaiseEventId = c.RaiseEventId,
                                    ImageFile = c.ImageFile,
                                    ItemsList = c.ItemsList,
                                    ColumnTitle = c.ColumnTitle,
                                    ControlLayer = c.ControlLayer,
                                    HAlignment = c.HAlignment,
                                    TitleHeight = c.TitleHeight,
                                    RowHeight = c.RowHeight,
                                    Elements = c.Elements,
                                    AllowParking = c.AllowParking,
                                    VisibleExpression = c.VisibleExpression,
                                    EnabledExpression = c.EnabledExpression,
                                    PropertiesJson = c.PropertiesJson
                                }), tx);
                            }
                        }

                        // V9: Insert task parameters
                        if (task.Parameters.Count > 0)
                        {
                            _db.BulkInsertTaskParameters(task.Parameters.Select(p => new DbTaskParameter
                            {
                                TaskId = taskId,
                                Position = p.Position,
                                MgAttr = p.MgAttr,
                                IsOutput = p.IsOutput
                            }), tx);
                        }

                        // V9: Insert task information
                        if (task.Information != null)
                        {
                            _db.InsertTaskInformation(new DbTaskInformation
                            {
                                TaskId = taskId,
                                InitialMode = task.Information.InitialMode,
                                EndTaskConditionExpr = task.Information.EndTaskConditionExpr,
                                EvaluateEndCondition = task.Information.EvaluateEndCondition,
                                ForceRecordDelete = task.Information.ForceRecordDelete,
                                MainDbComponent = task.Information.MainDbComponent,
                                KeyMode = task.Information.KeyMode,
                                RangeDirection = task.Information.RangeDirection,
                                LocateDirection = task.Information.LocateDirection,
                                SortCls = task.Information.SortCls,
                                BoxBottom = task.Information.BoxBottom,
                                BoxRight = task.Information.BoxRight,
                                BoxDirection = task.Information.BoxDirection,
                                OpenTaskWindow = task.Information.OpenTaskWindow
                            }, tx);
                        }

                        // V9: Insert task properties
                        if (task.Properties != null)
                        {
                            _db.InsertTaskProperties(new DbTaskProperties
                            {
                                TaskId = taskId,
                                TransactionMode = task.Properties.TransactionMode,
                                TransactionBegin = task.Properties.TransactionBegin,
                                LockingStrategy = task.Properties.LockingStrategy,
                                CacheStrategy = task.Properties.CacheStrategy,
                                ErrorStrategy = task.Properties.ErrorStrategy,
                                ConfirmUpdate = task.Properties.ConfirmUpdate,
                                ConfirmCancel = task.Properties.ConfirmCancel,
                                AllowEmptyDataview = task.Properties.AllowEmptyDataview,
                                PreloadView = task.Properties.PreloadView,
                                SelectionTable = task.Properties.SelectionTable,
                                ForceRecordSuffix = task.Properties.ForceRecordSuffix,
                                KeepCreatedContext = task.Properties.KeepCreatedContext
                            }, tx);
                        }

                        // V9: Insert task permissions
                        if (task.Permissions != null)
                        {
                            _db.InsertTaskPermissions(new DbTaskPermissions
                            {
                                TaskId = taskId,
                                AllowCreate = task.Permissions.AllowCreate,
                                AllowDelete = task.Permissions.AllowDelete,
                                AllowModify = task.Permissions.AllowModify,
                                AllowQuery = task.Permissions.AllowQuery,
                                AllowLocate = task.Permissions.AllowLocate,
                                AllowRange = task.Permissions.AllowRange,
                                AllowSorting = task.Permissions.AllowSorting,
                                AllowEvents = task.Permissions.AllowEvents,
                                AllowIndexChange = task.Permissions.AllowIndexChange,
                                AllowIndexOptimization = task.Permissions.AllowIndexOptimization,
                                AllowIoFiles = task.Permissions.AllowIoFiles,
                                AllowLocationInQuery = task.Permissions.AllowLocationInQuery,
                                AllowOptions = task.Permissions.AllowOptions,
                                AllowPrintingData = task.Permissions.AllowPrintingData,
                                RecordCycle = task.Permissions.RecordCycle
                            }, tx);
                        }

                        // V9: Insert event handlers
                        if (task.EventHandlers.Count > 0)
                        {
                            _db.BulkInsertEventHandlers(task.EventHandlers.Select(h => new DbEventHandler
                            {
                                TaskId = taskId,
                                EventId = h.EventId,
                                Description = h.Description,
                                ForceExit = h.ForceExit,
                                EventType = h.EventType,
                                PublicObjectComp = h.PublicObjectComp,
                                PublicObjectObj = h.PublicObjectObj
                            }), tx);
                        }

                        // V9: Insert field ranges
                        if (task.FieldRanges.Count > 0)
                        {
                            _db.BulkInsertFieldRanges(task.FieldRanges.Select(r => new DbFieldRange
                            {
                                TaskId = taskId,
                                RangeId = r.RangeId,
                                ColumnObj = r.ColumnObj,
                                MinExpr = r.MinExpr,
                                MaxExpr = r.MaxExpr
                            }), tx);
                        }

                        // V9: Insert operation details (Select, Update, Link, Stop, Block, Evaluate, RaiseEvent)
                        if (task.SelectDefinitions.Count > 0)
                        {
                            _db.BulkInsertSelectDefinitions(task.SelectDefinitions.Select(s => new DbSelectDefinition
                            {
                                TaskId = taskId,
                                LineNumber = s.LineNumber,
                                FieldId = s.FieldId,
                                SelectId = s.SelectId,
                                ColumnRef = s.ColumnRef,
                                SelectType = s.SelectType,
                                IsParameter = s.IsParameter,
                                AssignmentExpr = s.AssignmentExpr,
                                DiffUpdate = s.DiffUpdate,
                                LocateMinExpr = s.LocateMinExpr,
                                LocateMaxExpr = s.LocateMaxExpr,
                                PartOfDataview = s.PartOfDataview,
                                RealVarName = s.RealVarName,
                                ControlIndex = s.ControlIndex,
                                FormIndex = s.FormIndex,
                                TabbingOrder = s.TabbingOrder,
                                RecomputeIndex = s.RecomputeIndex
                            }), tx);
                        }

                        if (task.UpdateOperations.Count > 0)
                        {
                            _db.BulkInsertUpdateOperations(task.UpdateOperations.Select(u => new DbUpdateOperation
                            {
                                TaskId = taskId,
                                LineNumber = u.LineNumber,
                                FieldId = u.FieldId,
                                WithValueExpr = u.WithValueExpr,
                                ForcedUpdate = u.ForcedUpdate,
                                Incremental = u.Incremental,
                                Direction = u.Direction
                            }), tx);
                        }

                        if (task.LinkOperations.Count > 0)
                        {
                            _db.BulkInsertLinkOperations(task.LinkOperations.Select(l => new DbLinkOperation
                            {
                                TaskId = taskId,
                                LineNumber = l.LineNumber,
                                TableId = l.TableId,
                                KeyIndex = l.KeyIndex,
                                LinkMode = l.LinkMode,
                                Direction = l.Direction,
                                SortType = l.SortType,
                                ViewNumber = l.ViewNumber,
                                Views = l.Views,
                                FieldId = l.FieldId,
                                ConditionExpr = l.ConditionExpr,
                                EvalCondition = l.EvalCondition,
                                IsExpanded = l.IsExpanded
                            }), tx);
                        }

                        if (task.StopOperations.Count > 0)
                        {
                            _db.BulkInsertStopOperations(task.StopOperations.Select(s => new DbStopOperation
                            {
                                TaskId = taskId,
                                LineNumber = s.LineNumber,
                                Mode = s.Mode,
                                Buttons = s.Buttons,
                                DefaultButton = s.DefaultButton,
                                TitleText = s.TitleText,
                                MessageText = s.MessageText,
                                MessageExpr = s.MessageExpr,
                                Image = s.Image,
                                DisplayVar = s.DisplayVar,
                                ReturnVar = s.ReturnVar,
                                AppendToErrorLog = s.AppendToErrorLog
                            }), tx);
                        }

                        if (task.BlockOperations.Count > 0)
                        {
                            _db.BulkInsertBlockOperations(task.BlockOperations.Select(b => new DbBlockOperation
                            {
                                TaskId = taskId,
                                LineNumber = b.LineNumber,
                                BlockType = b.BlockType,
                                ConditionExpr = b.ConditionExpr,
                                Modifier = b.Modifier
                            }), tx);
                        }

                        if (task.EvaluateOperations.Count > 0)
                        {
                            _db.BulkInsertEvaluateOperations(task.EvaluateOperations.Select(e => new DbEvaluateOperation
                            {
                                TaskId = taskId,
                                LineNumber = e.LineNumber,
                                ExpressionRef = e.ExpressionRef,
                                ConditionExpr = e.ConditionExpr,
                                Direction = e.Direction,
                                Modifier = e.Modifier
                            }), tx);
                        }

                        if (task.RaiseEventOperations.Count > 0)
                        {
                            _db.BulkInsertRaiseEventOperations(task.RaiseEventOperations.Select(r => new DbRaiseEventOperation
                            {
                                TaskId = taskId,
                                LineNumber = r.LineNumber,
                                EventType = r.EventType,
                                InternalEventId = r.InternalEventId,
                                PublicObjectComp = r.PublicObjectComp,
                                PublicObjectObj = r.PublicObjectObj,
                                WaitMode = r.WaitMode,
                                Direction = r.Direction
                            }), tx);
                        }

                        result.TasksIndexed++;
                    }

                    // Insert expressions
                    if (parsed.Expressions.Count > 0)
                    {
                        _db.BulkInsertExpressions(parsed.Expressions.Values.Select(e => new DbExpression
                        {
                            ProgramId = programId,
                            XmlId = e.Id,
                            IdePosition = e.IdePosition,
                            Content = e.Content,
                            Comment = e.Comment
                        }), tx);
                        result.ExpressionsIndexed += parsed.Expressions.Count;
                    }

                    // Store file hash
                    var fileInfo = new FileInfo(prgFile);
                    _db.UpsertFileHash(new DbFileHash
                    {
                        ProjectId = projectId,
                        FilePath = prgFile,
                        FileHash = ComputeFileHash(prgFile),
                        FileSize = fileInfo.Length,
                        LastModified = fileInfo.LastWriteTimeUtc
                    }, tx);

                    result.ProgramsIndexed++;
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"{projectName}/{Path.GetFileName(prgFile)}: {ex.Message}");
                }
            }

            tx.Commit();
        }

        // Update project stats
        _db.UpdateProjectStats(projectId, result.ProgramsIndexed);

        result.ProjectsIndexed = 1;
        return result;
    }

    private void IndexTables(List<ParsedTable> tables, CancellationToken cancellationToken)
    {
        using var tx = _db.BeginTransaction();

        foreach (var table in tables)
        {
            if (cancellationToken.IsCancellationRequested) break;

            _db.ExecuteNonQuery(@"
                INSERT OR REPLACE INTO tables (xml_id, ide_position, public_name, logical_name, physical_name, column_count)
                VALUES (@xml_id, @ide_position, @public_name, @logical_name, @physical_name, @column_count)",
                new Dictionary<string, object?>
                {
                    ["@xml_id"] = table.XmlId,
                    ["@ide_position"] = table.IdePosition,
                    ["@public_name"] = table.PublicName,
                    ["@logical_name"] = table.LogicalName,
                    ["@physical_name"] = table.PhysicalName,
                    ["@column_count"] = table.Columns.Count
                }, tx);

            var tableId = _db.LastInsertRowId();

            // Insert columns
            foreach (var col in table.Columns)
            {
                _db.ExecuteNonQuery(@"
                    INSERT OR REPLACE INTO table_columns (table_id, xml_id, ide_position, name, data_type, picture)
                    VALUES (@table_id, @xml_id, @ide_position, @name, @data_type, @picture)",
                    new Dictionary<string, object?>
                    {
                        ["@table_id"] = tableId,
                        ["@xml_id"] = col.XmlId,
                        ["@ide_position"] = col.IdePosition,
                        ["@name"] = col.Name,
                        ["@data_type"] = col.DataType,
                        ["@picture"] = col.Picture
                    }, tx);
            }
        }

        tx.Commit();
    }

    private string[] DiscoverProjects()
    {
        if (!Directory.Exists(_projectsBasePath))
        {
            throw new DirectoryNotFoundException($"Projects base path not found: {_projectsBasePath}");
        }

        return Directory.GetDirectories(_projectsBasePath)
            .Where(d =>
            {
                var sourcePath = Path.Combine(d, "Source");
                if (!Directory.Exists(sourcePath)) return false;
                try
                {
                    return Directory.GetFiles(sourcePath, "Prg_*.xml", SearchOption.AllDirectories).Length > 0;
                }
                catch { return false; }
            })
            .Select(d => Path.GetFileName(d)!)
            .OrderBy(n => n)
            .ToArray();
    }

    private static int? ExtractProgramId(string filePath)
    {
        var fileName = Path.GetFileNameWithoutExtension(filePath);
        if (fileName.StartsWith("Prg_") && int.TryParse(fileName[4..], out int id))
        {
            return id;
        }
        return null;
    }

    private static string ComputeFileHash(string filePath)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        using var stream = File.OpenRead(filePath);
        var hash = sha256.ComputeHash(stream);
        return Convert.ToHexString(hash);
    }
}

/// <summary>
/// Progress report for indexing
/// </summary>
public record IndexProgress
{
    public string Phase { get; init; } = "";
    public string Message { get; init; } = "";
    public int ProjectsCompleted { get; init; }
    public int TotalProjects { get; init; }
    public string? CurrentProject { get; init; }
}

/// <summary>
/// Result of indexing operation
/// </summary>
public record IndexResult
{
    public int TotalProjects { get; set; }
    public int ProjectsIndexed { get; set; }
    public int ProgramsIndexed { get; set; }
    public int TasksIndexed { get; set; }
    public int ExpressionsIndexed { get; set; }
    public int TablesIndexed { get; set; }
    public long ElapsedMs { get; set; }
    public List<string> Errors { get; } = new();

    public bool HasErrors => Errors.Count > 0;
}
