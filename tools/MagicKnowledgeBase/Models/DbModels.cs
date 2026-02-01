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
    public int? FormUnits { get; init; }
    public int? HFactor { get; init; }
    public int? VFactor { get; init; }
    public int? Color { get; init; }
    public bool SystemMenu { get; init; }
    public bool MinimizeBox { get; init; }
    public bool MaximizeBox { get; init; }
    public string? PropertiesJson { get; init; }
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

// ============================================================================
// V9 MODELS - XML ENRICHMENT
// ============================================================================

/// <summary>V9: Extended program metadata</summary>
public record DbProgramMetadata
{
    public long Id { get; init; }
    public long ProgramId { get; init; }
    public string? TaskType { get; init; }
    public string? LastModifiedDate { get; init; }
    public string? LastModifiedTime { get; init; }
    public long? LastModifiedTs { get; init; }
    public int? ExecutionRight { get; init; }
    public bool IsResident { get; init; }
    public bool IsSql { get; init; }
    public bool IsExternal { get; init; }
    public string? FormType { get; init; }
    public bool HasDotNet { get; init; }
    public bool HasSqlWhere { get; init; }
    public bool IsMainProgram { get; init; }
    public int? LastIsn { get; init; }
}

/// <summary>V9: Task parameter (MgAttr type)</summary>
public record DbTaskParameter
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public int Position { get; init; }
    public required string MgAttr { get; init; }
    public bool IsOutput { get; init; }
}

/// <summary>V9: Task information block</summary>
public record DbTaskInformation
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public string? InitialMode { get; init; }
    public int? EndTaskConditionExpr { get; init; }
    public string? EvaluateEndCondition { get; init; }
    public string? ForceRecordDelete { get; init; }
    public int? MainDbComponent { get; init; }
    public string? KeyMode { get; init; }
    public string? RangeDirection { get; init; }
    public string? LocateDirection { get; init; }
    public string? SortCls { get; init; }
    public int? BoxBottom { get; init; }
    public int? BoxRight { get; init; }
    public string? BoxDirection { get; init; }
    public string? OpenTaskWindow { get; init; }
}

/// <summary>V9: Task properties block</summary>
public record DbTaskProperties
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public string? TransactionMode { get; init; }
    public string? TransactionBegin { get; init; }
    public string? LockingStrategy { get; init; }
    public string? CacheStrategy { get; init; }
    public string? ErrorStrategy { get; init; }
    public string? ConfirmUpdate { get; init; }
    public string? ConfirmCancel { get; init; }
    public bool AllowEmptyDataview { get; init; }
    public bool PreloadView { get; init; }
    public int? SelectionTable { get; init; }
    public string? ForceRecordSuffix { get; init; }
    public string? KeepCreatedContext { get; init; }
}

/// <summary>V9: Task permissions (SIDE_WIN)</summary>
public record DbTaskPermissions
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public bool AllowCreate { get; init; }
    public bool AllowDelete { get; init; }
    public bool AllowModify { get; init; }
    public bool AllowQuery { get; init; }
    public bool AllowLocate { get; init; }
    public bool AllowRange { get; init; }
    public bool AllowSorting { get; init; }
    public bool AllowEvents { get; init; }
    public bool AllowIndexChange { get; init; }
    public bool AllowIndexOptimization { get; init; }
    public bool AllowIoFiles { get; init; }
    public bool AllowLocationInQuery { get; init; }
    public bool AllowOptions { get; init; }
    public bool AllowPrintingData { get; init; }
    public string? RecordCycle { get; init; }
}

/// <summary>V9: Call argument</summary>
public record DbCallArgument
{
    public long Id { get; init; }
    public long CallId { get; init; }
    public int Position { get; init; }
    public int? ArgId { get; init; }
    public string? VariableRef { get; init; }
    public int? ExpressionRef { get; init; }
    public bool Skip { get; init; }
    public bool IsParent { get; init; }
}

/// <summary>V9: Event handler</summary>
public record DbEventHandler
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public int EventId { get; init; }
    public string? Description { get; init; }
    public string? ForceExit { get; init; }
    public string? EventType { get; init; }
    public string? PublicObjectComp { get; init; }
    public int? PublicObjectObj { get; init; }
}

/// <summary>V9: Field range</summary>
public record DbFieldRange
{
    public long Id { get; init; }
    public long TaskId { get; init; }
    public int RangeId { get; init; }
    public int? ColumnObj { get; init; }
    public int? MinExpr { get; init; }
    public int? MaxExpr { get; init; }
}

/// <summary>V9: Form control</summary>
public record DbFormControl
{
    public long Id { get; init; }
    public long FormId { get; init; }
    public int ControlId { get; init; }
    public string? ControlType { get; init; }
    public string? ControlName { get; init; }
    public int? X { get; init; }
    public int? Y { get; init; }
    public int? Width { get; init; }
    public int? Height { get; init; }
    public bool Visible { get; init; }
    public bool Enabled { get; init; }
    public int? TabOrder { get; init; }
    public int? LinkedFieldId { get; init; }
    public string? LinkedVariable { get; init; }
    public int? ParentId { get; init; }
    public int? Style { get; init; }
    public int? Color { get; init; }
    public int? FontId { get; init; }
    public string? Text { get; init; }
    public string? Format { get; init; }
    public int? DataFieldId { get; init; }
    public int? DataExpressionId { get; init; }
    public string? RaiseEventType { get; init; }
    public int? RaiseEventId { get; init; }
    public string? ImageFile { get; init; }
    public string? ItemsList { get; init; }
    public string? ColumnTitle { get; init; }
    public int? ControlLayer { get; init; }
    public int? HAlignment { get; init; }
    public int? TitleHeight { get; init; }
    public int? RowHeight { get; init; }
    public int? Elements { get; init; }
    public bool AllowParking { get; init; }
    public int? VisibleExpression { get; init; }
    public int? EnabledExpression { get; init; }
    public string? PropertiesJson { get; init; }
}

// =========================================================================
// V9 OPERATION DETAIL RECORDS
// =========================================================================

/// <summary>V9: Select definition (DataView variable definition)</summary>
public record DbSelectDefinition
{
    public long TaskId { get; init; }
    public int LineNumber { get; init; }
    public int FieldId { get; init; }
    public int? SelectId { get; init; }
    public int? ColumnRef { get; init; }
    public string? SelectType { get; init; }
    public bool IsParameter { get; init; }
    public int? AssignmentExpr { get; init; }
    public string? DiffUpdate { get; init; }
    public int? LocateMinExpr { get; init; }
    public int? LocateMaxExpr { get; init; }
    public bool PartOfDataview { get; init; } = true;
    public string? RealVarName { get; init; }
    public int? ControlIndex { get; init; }
    public int? FormIndex { get; init; }
    public int? TabbingOrder { get; init; }
    public int? RecomputeIndex { get; init; }
}

/// <summary>V9: Update operation (field assignment)</summary>
public record DbUpdateOperation
{
    public long TaskId { get; init; }
    public int LineNumber { get; init; }
    public int FieldId { get; init; }
    public int? WithValueExpr { get; init; }
    public bool ForcedUpdate { get; init; }
    public bool Incremental { get; init; }
    public string? Direction { get; init; }
}

/// <summary>V9: Link operation (table join/query)</summary>
public record DbLinkOperation
{
    public long TaskId { get; init; }
    public int LineNumber { get; init; }
    public int TableId { get; init; }
    public int? KeyIndex { get; init; }
    public string? LinkMode { get; init; }
    public string? Direction { get; init; }
    public string? SortType { get; init; }
    public int? ViewNumber { get; init; }
    public string? Views { get; init; }
    public int? FieldId { get; init; }
    public int? ConditionExpr { get; init; }
    public string? EvalCondition { get; init; }
    public bool IsExpanded { get; init; }
}

/// <summary>V9: Stop operation (message/error dialog)</summary>
public record DbStopOperation
{
    public long TaskId { get; init; }
    public int LineNumber { get; init; }
    public string? Mode { get; init; }
    public string? Buttons { get; init; }
    public int? DefaultButton { get; init; }
    public string? TitleText { get; init; }
    public string? MessageText { get; init; }
    public int? MessageExpr { get; init; }
    public string? Image { get; init; }
    public int? DisplayVar { get; init; }
    public int? ReturnVar { get; init; }
    public bool AppendToErrorLog { get; init; }
}

/// <summary>V9: Block operation (IF/ELSE/LOOP)</summary>
public record DbBlockOperation
{
    public long TaskId { get; init; }
    public int LineNumber { get; init; }
    public string? BlockType { get; init; }
    public int? ConditionExpr { get; init; }
    public string? Modifier { get; init; }
}

/// <summary>V9: Evaluate operation (expression computation)</summary>
public record DbEvaluateOperation
{
    public long TaskId { get; init; }
    public int LineNumber { get; init; }
    public int? ExpressionRef { get; init; }
    public int? ConditionExpr { get; init; }
    public string? Direction { get; init; }
    public string? Modifier { get; init; }
}

/// <summary>V9: Raise event operation</summary>
public record DbRaiseEventOperation
{
    public long TaskId { get; init; }
    public int LineNumber { get; init; }
    public string? EventType { get; init; }
    public int? InternalEventId { get; init; }
    public string? PublicObjectComp { get; init; }
    public int? PublicObjectObj { get; init; }
    public string? WaitMode { get; init; }
    public string? Direction { get; init; }
}
