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
                                LocateExpressionId = c.LocateExpressionId
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
