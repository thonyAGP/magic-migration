namespace MagicKnowledgeBase.Models;

/// <summary>
/// Project record in the knowledge base
/// </summary>
public record DbProject
{
    public long Id { get; init; }
    public required string Name { get; init; }
    public required string SourcePath { get; init; }
    public int MainOffset { get; init; }
    public int ProgramCount { get; init; }
    public DateTime IndexedAt { get; init; }
    public string? GitCommit { get; init; }
}

/// <summary>
/// Program record in the knowledge base
/// </summary>
public record DbProgram
{
    public long Id { get; init; }
    public long ProjectId { get; init; }
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public required string Name { get; init; }
    public string? PublicName { get; init; }
    public required string FilePath { get; init; }
    public int TaskCount { get; init; }
    public int ExpressionCount { get; init; }
    public DateTime IndexedAt { get; init; }
}

/// <summary>
/// Task record in the knowledge base
/// </summary>
public record DbTask
{
    public long Id { get; init; }
    public long ProgramId { get; init; }
    public int Isn2 { get; init; }
    public required string IdePosition { get; init; }
    public required string Description { get; init; }
    public int Level { get; init; }
    public int? ParentIsn2 { get; init; }
    public string TaskType { get; init; } = "B";
    public int? MainSourceTableId { get; init; }
    public string? MainSourceAccess { get; init; }
    public int ColumnCount { get; init; }
    public int LogicLineCount { get; init; }
}

/// <summary>
/// DataView column record in the knowledge base
/// </summary>
public record DbDataViewColumn
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public int LineNumber { get; init; }
    public int XmlId { get; init; }
    public required string Variable { get; init; }
    public required string Name { get; init; }
    public required string DataType { get; init; }
    public string? Picture { get; init; }
    public required string Definition { get; init; }
    public string? Source { get; init; }
    public int? SourceColumnNumber { get; init; }
    public int? LocateExpressionId { get; init; }
    /// <summary>GUI control type for form display (EDIT, COMBO, CHECKBOX, etc.)</summary>
    public string? GuiControlType { get; init; }
    /// <summary>GUI control type when displayed in a table/grid</summary>
    public string? GuiTableControlType { get; init; }
}

/// <summary>
/// Logic line record in the knowledge base
/// </summary>
public record DbLogicLine
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public int LineNumber { get; init; }
    public required string Handler { get; init; }
    public required string Operation { get; init; }
    public string? ConditionExpr { get; init; }
    public bool IsDisabled { get; init; }
    public string? Parameters { get; init; }
}

/// <summary>
/// Expression record in the knowledge base
/// </summary>
public record DbExpression
{
    public long Id { get; init; }
    public long ProgramId { get; init; }
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public required string Content { get; init; }
    public string? Comment { get; init; }
}

/// <summary>
/// Program call record (Call Task to other programs)
/// </summary>
public record DbProgramCall
{
    public long Id { get; init; }
    public long CallerTaskId { get; init; }
    public int CallerLineNumber { get; init; }
    public long? CalleeProgramId { get; init; }
    public string? CalleeProjectName { get; init; }
    public int CalleeXmlId { get; init; }
    public int ArgCount { get; init; }
}

/// <summary>
/// Subtask call record (Call Task within same program)
/// </summary>
public record DbSubtaskCall
{
    public long Id { get; init; }
    public long CallerTaskId { get; init; }
    public int CallerLineNumber { get; init; }
    public long? CalleeTaskId { get; init; }
    public int CalleeIsn2 { get; init; }
}

/// <summary>
/// Table usage record
/// </summary>
public record DbTableUsage
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public int TableId { get; init; }
    public string? TableName { get; init; }
    public required string UsageType { get; init; }
    public int? LinkNumber { get; init; }
}

/// <summary>
/// Task form record (UI screen info)
/// </summary>
public record DbTaskForm
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public int FormEntryId { get; init; }
    public string? FormName { get; init; }
    public int? PositionX { get; init; }
    public int? PositionY { get; init; }
    public int? Width { get; init; }
    public int? Height { get; init; }
    public int? WindowType { get; init; }
    public string? Font { get; init; }
}

/// <summary>
/// Table record from DataSources.xml
/// </summary>
public record DbTable
{
    public long Id { get; init; }
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public string? PublicName { get; init; }
    public required string LogicalName { get; init; }
    public string? PhysicalName { get; init; }
    public int ColumnCount { get; init; }
}

/// <summary>
/// Table column record
/// </summary>
public record DbTableColumn
{
    public long Id { get; init; }
    public long TableId { get; init; }
    public int XmlId { get; init; }
    public int IdePosition { get; init; }
    public required string Name { get; init; }
    public required string DataType { get; init; }
    public string? Picture { get; init; }
}

/// <summary>
/// File hash record for change detection
/// </summary>
public record DbFileHash
{
    public long Id { get; init; }
    public long ProjectId { get; init; }
    public required string FilePath { get; init; }
    public required string FileHash { get; init; }
    public long FileSize { get; init; }
    public DateTime LastModified { get; init; }
    public DateTime IndexedAt { get; init; }
}

/// <summary>
/// Search result for programs
/// </summary>
public record ProgramSearchResult
{
    public long ProgramId { get; init; }
    public required string ProjectName { get; init; }
    public int IdePosition { get; init; }
    public required string Name { get; init; }
    public string? PublicName { get; init; }
    public double Score { get; init; }
}

/// <summary>
/// Search result for expressions
/// </summary>
public record ExpressionSearchResult
{
    public long ExpressionId { get; init; }
    public long ProgramId { get; init; }
    public required string ProjectName { get; init; }
    public required string ProgramName { get; init; }
    public int ProgramIdePosition { get; init; }
    public int ExpressionIdePosition { get; init; }
    public required string Content { get; init; }
    public string? Comment { get; init; }
    public double Score { get; init; }
}

/// <summary>
/// Call graph node
/// </summary>
public record CallGraphNode
{
    public required string ProjectName { get; init; }
    public int ProgramIdePosition { get; init; }
    public required string ProgramName { get; init; }
    public string? TaskIdePosition { get; init; }
    public int? LineNumber { get; init; }
    public int Depth { get; init; }
}

/// <summary>
/// Table usage result
/// </summary>
public record TableUsageResult
{
    public required string ProjectName { get; init; }
    public int ProgramIdePosition { get; init; }
    public required string ProgramName { get; init; }
    public required string TaskIdePosition { get; init; }
    public required string UsageType { get; init; }
    public int? LinkNumber { get; init; }
}

/// <summary>
/// Knowledge base statistics
/// </summary>
public record KbStats
{
    public int ProjectCount { get; init; }
    public int ProgramCount { get; init; }
    public int TaskCount { get; init; }
    public int ExpressionCount { get; init; }
    public int TableCount { get; init; }
    public int ColumnCount { get; init; }
    public int LogicLineCount { get; init; }
    public int ProgramCallCount { get; init; }
    public long DatabaseSizeBytes { get; init; }
    public DateTime? LastIndexedAt { get; init; }
}

// ============================================================================
// TICKET ANALYSIS MODELS (Schema v2)
// ============================================================================

/// <summary>
/// Cached decoded expression to avoid recalculating offsets
/// </summary>
public record DbDecodedExpression
{
    public long Id { get; init; }
    public required string Project { get; init; }
    public int ProgramId { get; init; }
    public int ExpressionId { get; init; }
    public string? RawExpression { get; init; }
    public required string DecodedText { get; init; }
    public string? VariablesJson { get; init; }
    public int? OffsetUsed { get; init; }
    public DateTime CachedAt { get; init; }
}

/// <summary>
/// Ticket analysis metrics for tracking efficiency
/// </summary>
public record DbTicketMetrics
{
    public required string TicketKey { get; init; }
    public string? Project { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public int PhasesCompleted { get; init; }
    public string? PatternMatched { get; init; }
    public int ProgramsAnalyzed { get; init; }
    public int ExpressionsDecoded { get; init; }
    public int? ResolutionTimeMinutes { get; init; }
    public bool Success { get; init; }
}

/// <summary>
/// Resolution pattern for knowledge capitalization
/// </summary>
public record DbResolutionPattern
{
    public long Id { get; init; }
    public required string PatternName { get; init; }
    public string? SymptomKeywords { get; init; }
    public string? RootCauseType { get; init; }
    public string? SolutionTemplate { get; init; }
    public string? SourceTicket { get; init; }
    public int UsageCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? LastUsedAt { get; init; }
}

/// <summary>
/// Pattern search result
/// </summary>
public record PatternSearchResult
{
    public long PatternId { get; init; }
    public required string PatternName { get; init; }
    public string? RootCauseType { get; init; }
    public string? SourceTicket { get; init; }
    public int UsageCount { get; init; }
    public double Score { get; init; }
}
