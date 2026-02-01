using System.Diagnostics;
using System.Text.Json;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Indexing;

/// <summary>
/// Incremental indexer that only updates changed files
/// </summary>
public class IncrementalIndexer
{
    private readonly KnowledgeDb _db;
    private readonly string _projectsBasePath;
    private readonly IProgress<IndexProgress>? _progress;
    private readonly ChangeDetector _changeDetector;

    // NOTE: MainOffsets are defined in BatchIndexer.cs - single source of truth
    // The offset is stored in the projects table (main_offset column) at indexing time

    public IncrementalIndexer(KnowledgeDb db, string projectsBasePath, IProgress<IndexProgress>? progress = null)
    {
        _db = db;
        _projectsBasePath = projectsBasePath;
        _progress = progress;
        _changeDetector = new ChangeDetector(db, projectsBasePath);
    }

    /// <summary>
    /// Check if any project needs updating
    /// </summary>
    public bool NeedsUpdate()
    {
        var projects = _db.GetAllProjects().ToList();
        if (projects.Count == 0) return true;

        foreach (var project in projects)
        {
            var changes = _changeDetector.DetectChanges(project.Name);
            if (changes.HasChanges) return true;
        }

        return false;
    }

    /// <summary>
    /// Update all projects incrementally
    /// </summary>
    public async Task<IncrementalResult> UpdateAllAsync(CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new IncrementalResult();

        var projects = _db.GetAllProjects().ToList();
        var projectNames = DiscoverProjects();

        // Check for new projects
        var existingNames = projects.Select(p => p.Name.ToUpperInvariant()).ToHashSet();
        var newProjects = projectNames.Where(n => !existingNames.Contains(n.ToUpperInvariant())).ToList();

        // Full index new projects
        if (newProjects.Count > 0)
        {
            _progress?.Report(new IndexProgress
            {
                Phase = "New Projects",
                Message = $"Found {newProjects.Count} new projects to index"
            });

            var batchIndexer = new BatchIndexer(_db, _projectsBasePath, _progress);
            foreach (var projectName in newProjects)
            {
                if (cancellationToken.IsCancellationRequested) break;

                try
                {
                    await batchIndexer.IndexProjectAsync(projectName, cancellationToken);
                    result.NewProjectsIndexed++;
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"New project {projectName}: {ex.Message}");
                }
            }
        }

        // Update existing projects
        foreach (var project in projects)
        {
            if (cancellationToken.IsCancellationRequested) break;

            try
            {
                var projectResult = await UpdateProjectAsync(project.Name, cancellationToken);
                result.FilesUpdated += projectResult.FilesUpdated;
                result.FilesDeleted += projectResult.FilesDeleted;

                if (projectResult.FilesUpdated > 0 || projectResult.FilesDeleted > 0)
                {
                    result.ProjectsUpdated++;
                }
            }
            catch (Exception ex)
            {
                result.Errors.Add($"{project.Name}: {ex.Message}");
            }
        }

        // Resolve cross-references if any changes were made
        if (result.FilesUpdated > 0 || result.NewProjectsIndexed > 0)
        {
            var resolver = new RelationshipResolver(_db);
            resolver.ResolveAll();
        }

        stopwatch.Stop();
        result.ElapsedMs = stopwatch.ElapsedMilliseconds;

        _progress?.Report(new IndexProgress
        {
            Phase = "Complete",
            Message = $"Incremental update done in {stopwatch.ElapsedMilliseconds}ms: {result.FilesUpdated} files updated, {result.FilesDeleted} deleted"
        });

        return result;
    }

    /// <summary>
    /// Update a single project incrementally
    /// </summary>
    public Task<ProjectUpdateResult> UpdateProjectAsync(string projectName, CancellationToken cancellationToken = default)
    {
        return Task.Run(() => UpdateProjectSync(projectName, cancellationToken), cancellationToken);
    }

    private ProjectUpdateResult UpdateProjectSync(string projectName, CancellationToken cancellationToken)
    {
        var result = new ProjectUpdateResult { ProjectName = projectName };

        var changes = _changeDetector.DetectChanges(projectName);

        if (!changes.HasChanges)
        {
            return result;
        }

        var project = _db.GetProject(projectName);

        if (changes.AllFilesChanged || project == null)
        {
            // Full re-index needed
            var batchIndexer = new BatchIndexer(_db, _projectsBasePath, _progress);
            var batchResult = batchIndexer.IndexProjectAsync(projectName, cancellationToken).GetAwaiter().GetResult();
            result.FilesUpdated = batchResult.ProgramsIndexed;
            return result;
        }

        var sourcePath = Path.Combine(_projectsBasePath, projectName, "Source");
        var scanner = new ProjectScanner(sourcePath);
        var programHeaders = scanner.ParseProgramHeaders();
        var programPositions = scanner.ParseProgramPositions();
        var parser = new ProgramParser(); // No offset applied, done at display time

        // Process deleted files
        foreach (var deletedFile in changes.DeletedFiles)
        {
            if (cancellationToken.IsCancellationRequested) break;

            var xmlId = ExtractProgramId(deletedFile);
            if (xmlId == null) continue;

            var existingProgram = _db.GetProgramByXmlId(project.Id, xmlId.Value);
            if (existingProgram != null)
            {
                // Cascade delete will remove all related records
                _db.ExecuteNonQuery("DELETE FROM programs WHERE id = @id",
                    new Dictionary<string, object?> { ["@id"] = existingProgram.Id });
                result.FilesDeleted++;
            }
        }

        // Process changed files
        foreach (var changedFile in changes.ChangedFiles)
        {
            if (cancellationToken.IsCancellationRequested) break;

            var xmlId = ExtractProgramId(changedFile);
            if (xmlId == null) continue;

            try
            {
                // Delete existing program data
                var existingProgram = _db.GetProgramByXmlId(project.Id, xmlId.Value);
                if (existingProgram != null)
                {
                    _db.ExecuteNonQuery("DELETE FROM programs WHERE id = @id",
                        new Dictionary<string, object?> { ["@id"] = existingProgram.Id });
                }

                // Re-index the program
                var idePosition = programPositions.GetValueOrDefault(xmlId.Value, 0);
                var header = programHeaders.GetValueOrDefault(xmlId.Value);

                var parsed = parser.ParseProgram(changedFile, xmlId.Value, idePosition, header, projectName);

                using var tx = _db.BeginTransaction();

                // Insert program
                var programId = _db.InsertProgram(new DbProgram
                {
                    ProjectId = project.Id,
                    XmlId = xmlId.Value,
                    IdePosition = idePosition,
                    Name = parsed.Name,
                    PublicName = parsed.PublicName,
                    FilePath = changedFile,
                    TaskCount = parsed.Tasks.Count,
                    ExpressionCount = parsed.Expressions.Count
                }, tx);

                // Insert tasks and related data
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

                    // V9: Insert operation details
                    if (task.SelectDefinitions.Count > 0)
                        _db.BulkInsertSelectDefinitions(task.SelectDefinitions.Select(s => new DbSelectDefinition
                        {
                            TaskId = taskId, LineNumber = s.LineNumber, FieldId = s.FieldId,
                            SelectId = s.SelectId, ColumnRef = s.ColumnRef, SelectType = s.SelectType,
                            IsParameter = s.IsParameter, AssignmentExpr = s.AssignmentExpr,
                            DiffUpdate = s.DiffUpdate, LocateMinExpr = s.LocateMinExpr,
                            LocateMaxExpr = s.LocateMaxExpr, PartOfDataview = s.PartOfDataview,
                            RealVarName = s.RealVarName, ControlIndex = s.ControlIndex,
                            FormIndex = s.FormIndex, TabbingOrder = s.TabbingOrder,
                            RecomputeIndex = s.RecomputeIndex
                        }), tx);
                    if (task.UpdateOperations.Count > 0)
                        _db.BulkInsertUpdateOperations(task.UpdateOperations.Select(u => new DbUpdateOperation
                        {
                            TaskId = taskId, LineNumber = u.LineNumber, FieldId = u.FieldId,
                            WithValueExpr = u.WithValueExpr, ForcedUpdate = u.ForcedUpdate,
                            Incremental = u.Incremental, Direction = u.Direction
                        }), tx);
                    if (task.LinkOperations.Count > 0)
                        _db.BulkInsertLinkOperations(task.LinkOperations.Select(l => new DbLinkOperation
                        {
                            TaskId = taskId, LineNumber = l.LineNumber, TableId = l.TableId,
                            KeyIndex = l.KeyIndex, LinkMode = l.LinkMode, Direction = l.Direction,
                            SortType = l.SortType, ViewNumber = l.ViewNumber, Views = l.Views,
                            FieldId = l.FieldId, ConditionExpr = l.ConditionExpr,
                            EvalCondition = l.EvalCondition, IsExpanded = l.IsExpanded
                        }), tx);
                    if (task.StopOperations.Count > 0)
                        _db.BulkInsertStopOperations(task.StopOperations.Select(s => new DbStopOperation
                        {
                            TaskId = taskId, LineNumber = s.LineNumber, Mode = s.Mode,
                            Buttons = s.Buttons, DefaultButton = s.DefaultButton,
                            TitleText = s.TitleText, MessageText = s.MessageText,
                            MessageExpr = s.MessageExpr, Image = s.Image,
                            DisplayVar = s.DisplayVar, ReturnVar = s.ReturnVar,
                            AppendToErrorLog = s.AppendToErrorLog
                        }), tx);
                    if (task.BlockOperations.Count > 0)
                        _db.BulkInsertBlockOperations(task.BlockOperations.Select(b => new DbBlockOperation
                        {
                            TaskId = taskId, LineNumber = b.LineNumber, BlockType = b.BlockType,
                            ConditionExpr = b.ConditionExpr, Modifier = b.Modifier
                        }), tx);
                    if (task.EvaluateOperations.Count > 0)
                        _db.BulkInsertEvaluateOperations(task.EvaluateOperations.Select(e => new DbEvaluateOperation
                        {
                            TaskId = taskId, LineNumber = e.LineNumber, ExpressionRef = e.ExpressionRef,
                            ConditionExpr = e.ConditionExpr, Direction = e.Direction, Modifier = e.Modifier
                        }), tx);
                    if (task.RaiseEventOperations.Count > 0)
                        _db.BulkInsertRaiseEventOperations(task.RaiseEventOperations.Select(r => new DbRaiseEventOperation
                        {
                            TaskId = taskId, LineNumber = r.LineNumber, EventType = r.EventType,
                            InternalEventId = r.InternalEventId, PublicObjectComp = r.PublicObjectComp,
                            PublicObjectObj = r.PublicObjectObj, WaitMode = r.WaitMode, Direction = r.Direction
                        }), tx);
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
                }

                // Update file hash
                var fileInfo = new FileInfo(changedFile);
                _db.UpsertFileHash(new DbFileHash
                {
                    ProjectId = project.Id,
                    FilePath = changedFile,
                    FileHash = ComputeFileHash(changedFile),
                    FileSize = fileInfo.Length,
                    LastModified = fileInfo.LastWriteTimeUtc
                }, tx);

                tx.Commit();
                result.FilesUpdated++;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"{Path.GetFileName(changedFile)}: {ex.Message}");
            }
        }

        // Update git commit if using git detection
        if (!string.IsNullOrEmpty(changes.NewGitCommit))
        {
            _db.ExecuteNonQuery("UPDATE projects SET git_commit = @commit WHERE id = @id",
                new Dictionary<string, object?>
                {
                    ["@commit"] = changes.NewGitCommit,
                    ["@id"] = project.Id
                });
        }

        // Update project stats
        var programCount = _db.ExecuteScalar<int>("SELECT COUNT(*) FROM programs WHERE project_id = @id",
            new Dictionary<string, object?> { ["@id"] = project.Id });
        _db.UpdateProjectStats(project.Id, programCount);

        return result;
    }

    private string[] DiscoverProjects()
    {
        if (!Directory.Exists(_projectsBasePath))
        {
            return Array.Empty<string>();
        }

        return Directory.GetDirectories(_projectsBasePath)
            .Where(d => Directory.Exists(Path.Combine(d, "Source")))
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
/// Result of incremental update
/// </summary>
public record IncrementalResult
{
    public int NewProjectsIndexed { get; set; }
    public int ProjectsUpdated { get; set; }
    public int FilesUpdated { get; set; }
    public int FilesDeleted { get; set; }
    public long ElapsedMs { get; set; }
    public List<string> Errors { get; } = new();

    public bool HasErrors => Errors.Count > 0;
}

/// <summary>
/// Result of updating a single project
/// </summary>
public record ProjectUpdateResult
{
    public string ProjectName { get; init; } = "";
    public int FilesUpdated { get; set; }
    public int FilesDeleted { get; set; }
    public List<string> Errors { get; } = new();
}
