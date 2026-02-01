-- Magic Knowledge Base Schema
-- SQLite with FTS5 for full-text search

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Projects (31 rows expected)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    source_path TEXT NOT NULL,
    main_offset INTEGER NOT NULL DEFAULT 0,
    program_count INTEGER NOT NULL DEFAULT 0,
    indexed_at TEXT NOT NULL DEFAULT (datetime('now')),
    git_commit TEXT
);

CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- Programs (~4,500 rows expected)
CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    xml_id INTEGER NOT NULL,
    ide_position INTEGER NOT NULL,
    name TEXT NOT NULL,
    public_name TEXT,
    file_path TEXT NOT NULL,
    task_count INTEGER NOT NULL DEFAULT 0,
    expression_count INTEGER NOT NULL DEFAULT 0,
    indexed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project_id, xml_id)
);

CREATE INDEX IF NOT EXISTS idx_programs_project ON programs(project_id);
CREATE INDEX IF NOT EXISTS idx_programs_name ON programs(name);
CREATE INDEX IF NOT EXISTS idx_programs_ide ON programs(project_id, ide_position);

-- Tasks (~25,000 rows expected)
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    isn2 INTEGER NOT NULL,
    ide_position TEXT NOT NULL,
    description TEXT NOT NULL,
    level INTEGER NOT NULL,
    parent_isn2 INTEGER,
    task_type TEXT NOT NULL DEFAULT 'B',
    main_source_table_id INTEGER,
    main_source_access TEXT,
    column_count INTEGER NOT NULL DEFAULT 0,
    logic_line_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(program_id, isn2)
);

CREATE INDEX IF NOT EXISTS idx_tasks_program ON tasks(program_id);
CREATE INDEX IF NOT EXISTS idx_tasks_ide ON tasks(ide_position);

-- Task Forms (UI info for screens)
CREATE TABLE IF NOT EXISTS task_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    form_entry_id INTEGER NOT NULL,
    form_name TEXT,
    position_x INTEGER,
    position_y INTEGER,
    width INTEGER,
    height INTEGER,
    window_type INTEGER,
    font TEXT,
    form_units INTEGER,              -- 1=pixels, 2=dialog units
    h_factor INTEGER,                -- Horizontal scaling factor
    v_factor INTEGER,                -- Vertical scaling factor
    color INTEGER,                   -- Background color ID
    system_menu INTEGER DEFAULT 0,   -- Has system menu
    minimize_box INTEGER DEFAULT 0,  -- Has minimize button
    maximize_box INTEGER DEFAULT 0,  -- Has maximize button
    properties_json TEXT,            -- All remaining properties as JSON
    UNIQUE(task_id, form_entry_id)
);

CREATE INDEX IF NOT EXISTS idx_task_forms_task ON task_forms(task_id);
CREATE INDEX IF NOT EXISTS idx_task_forms_name ON task_forms(form_name);

-- DataView columns (~150,000 rows expected)
CREATE TABLE IF NOT EXISTS dataview_columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    xml_id INTEGER NOT NULL,
    variable TEXT NOT NULL,
    name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    picture TEXT,
    definition TEXT NOT NULL,
    source TEXT,
    source_column_number INTEGER,
    locate_expression_id INTEGER,
    -- GUI Control info (Schema v8)
    gui_control_type TEXT,       -- EDIT, COMBO, CHECKBOX, RADIO, BUTTON, LABEL, TABLE, BROWSER, SUBFORM
    gui_table_control_type TEXT  -- Control type when displayed in a table/grid
);

CREATE INDEX IF NOT EXISTS idx_dv_columns_task ON dataview_columns(task_id);
CREATE INDEX IF NOT EXISTS idx_dv_columns_name ON dataview_columns(name);
CREATE INDEX IF NOT EXISTS idx_dv_columns_variable ON dataview_columns(variable);

-- Logic lines (~500,000 rows expected)
CREATE TABLE IF NOT EXISTS logic_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    handler TEXT NOT NULL,
    operation TEXT NOT NULL,
    condition_expr TEXT,
    is_disabled INTEGER NOT NULL DEFAULT 0,
    parameters TEXT
);

CREATE INDEX IF NOT EXISTS idx_logic_task ON logic_lines(task_id);
CREATE INDEX IF NOT EXISTS idx_logic_operation ON logic_lines(operation);

-- Expressions (~200,000 rows expected)
CREATE TABLE IF NOT EXISTS expressions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    xml_id INTEGER NOT NULL,
    ide_position INTEGER NOT NULL,
    content TEXT NOT NULL,
    comment TEXT,
    UNIQUE(program_id, xml_id)
);

CREATE INDEX IF NOT EXISTS idx_expr_program ON expressions(program_id);
CREATE INDEX IF NOT EXISTS idx_expr_content ON expressions(content);

-- ============================================================================
-- RELATIONSHIP TABLES
-- ============================================================================

-- Program calls (Call Task to other programs)
CREATE TABLE IF NOT EXISTS program_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caller_task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    caller_line_number INTEGER NOT NULL,
    callee_program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
    callee_project_name TEXT,
    callee_xml_id INTEGER NOT NULL,
    arg_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pcalls_caller ON program_calls(caller_task_id);
CREATE INDEX IF NOT EXISTS idx_pcalls_callee ON program_calls(callee_program_id);

-- Subtask calls (Call Task within same program)
CREATE TABLE IF NOT EXISTS subtask_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caller_task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    caller_line_number INTEGER NOT NULL,
    callee_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    callee_isn2 INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stcalls_caller ON subtask_calls(caller_task_id);
CREATE INDEX IF NOT EXISTS idx_stcalls_callee ON subtask_calls(callee_task_id);

-- Table usage (which tasks read/write which tables)
CREATE TABLE IF NOT EXISTS table_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    table_id INTEGER NOT NULL,
    table_name TEXT,
    usage_type TEXT NOT NULL,
    link_number INTEGER,
    UNIQUE(task_id, table_id, usage_type, link_number)
);

CREATE INDEX IF NOT EXISTS idx_table_usage_task ON table_usage(task_id);
CREATE INDEX IF NOT EXISTS idx_table_usage_table ON table_usage(table_id);

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================

-- Tables from DataSources.xml (~1,200 rows expected)
CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    xml_id INTEGER NOT NULL UNIQUE,
    ide_position INTEGER NOT NULL,
    public_name TEXT,
    logical_name TEXT NOT NULL,
    physical_name TEXT,
    column_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tables_ide ON tables(ide_position);
CREATE INDEX IF NOT EXISTS idx_tables_name ON tables(logical_name);

-- Table columns (~15,000 rows expected)
CREATE TABLE IF NOT EXISTS table_columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    xml_id INTEGER NOT NULL,
    ide_position INTEGER NOT NULL,
    name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    picture TEXT,
    UNIQUE(table_id, xml_id)
);

CREATE INDEX IF NOT EXISTS idx_tcol_table ON table_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_tcol_name ON table_columns(name);

-- ============================================================================
-- CHANGE TRACKING
-- ============================================================================

-- File hashes for incremental updates (~6,000 rows expected)
CREATE TABLE IF NOT EXISTS file_hashes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    last_modified TEXT NOT NULL,
    indexed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project_id, file_path)
);

CREATE INDEX IF NOT EXISTS idx_fhash_project ON file_hashes(project_id);

-- ============================================================================
-- FULL-TEXT SEARCH (FTS5)
-- ============================================================================

-- FTS for programs
CREATE VIRTUAL TABLE IF NOT EXISTS programs_fts USING fts5(
    name,
    public_name,
    content='programs',
    content_rowid='id'
);

-- FTS for expressions
CREATE VIRTUAL TABLE IF NOT EXISTS expressions_fts USING fts5(
    content,
    comment,
    content='expressions',
    content_rowid='id'
);

-- FTS for dataview columns
CREATE VIRTUAL TABLE IF NOT EXISTS columns_fts USING fts5(
    name,
    content='dataview_columns',
    content_rowid='id'
);

-- ============================================================================
-- TRIGGERS FOR FTS SYNC
-- ============================================================================

-- Programs FTS triggers
CREATE TRIGGER IF NOT EXISTS programs_ai AFTER INSERT ON programs BEGIN
    INSERT INTO programs_fts(rowid, name, public_name) VALUES (new.id, new.name, new.public_name);
END;

CREATE TRIGGER IF NOT EXISTS programs_ad AFTER DELETE ON programs BEGIN
    INSERT INTO programs_fts(programs_fts, rowid, name, public_name) VALUES('delete', old.id, old.name, old.public_name);
END;

CREATE TRIGGER IF NOT EXISTS programs_au AFTER UPDATE ON programs BEGIN
    INSERT INTO programs_fts(programs_fts, rowid, name, public_name) VALUES('delete', old.id, old.name, old.public_name);
    INSERT INTO programs_fts(rowid, name, public_name) VALUES (new.id, new.name, new.public_name);
END;

-- Expressions FTS triggers
CREATE TRIGGER IF NOT EXISTS expressions_ai AFTER INSERT ON expressions BEGIN
    INSERT INTO expressions_fts(rowid, content, comment) VALUES (new.id, new.content, new.comment);
END;

CREATE TRIGGER IF NOT EXISTS expressions_ad AFTER DELETE ON expressions BEGIN
    INSERT INTO expressions_fts(expressions_fts, rowid, content, comment) VALUES('delete', old.id, old.content, old.comment);
END;

CREATE TRIGGER IF NOT EXISTS expressions_au AFTER UPDATE ON expressions BEGIN
    INSERT INTO expressions_fts(expressions_fts, rowid, content, comment) VALUES('delete', old.id, old.content, old.comment);
    INSERT INTO expressions_fts(rowid, content, comment) VALUES (new.id, new.content, new.comment);
END;

-- Columns FTS triggers
CREATE TRIGGER IF NOT EXISTS columns_ai AFTER INSERT ON dataview_columns BEGIN
    INSERT INTO columns_fts(rowid, name) VALUES (new.id, new.name);
END;

CREATE TRIGGER IF NOT EXISTS columns_ad AFTER DELETE ON dataview_columns BEGIN
    INSERT INTO columns_fts(columns_fts, rowid, name) VALUES('delete', old.id, old.name);
END;

CREATE TRIGGER IF NOT EXISTS columns_au AFTER UPDATE ON dataview_columns BEGIN
    INSERT INTO columns_fts(columns_fts, rowid, name) VALUES('delete', old.id, old.name);
    INSERT INTO columns_fts(rowid, name) VALUES (new.id, new.name);
END;

-- ============================================================================
-- METADATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS kb_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR REPLACE INTO kb_metadata (key, value) VALUES ('schema_version', '9');
INSERT OR REPLACE INTO kb_metadata (key, value) VALUES ('created_at', datetime('now'));

-- ============================================================================
-- TICKET ANALYSIS TABLES (Schema v2)
-- ============================================================================

-- Cache for decoded expressions (avoids recalculating offsets)
CREATE TABLE IF NOT EXISTS decoded_expressions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT NOT NULL,
    program_id INTEGER NOT NULL,
    expression_id INTEGER NOT NULL,
    raw_expression TEXT,
    decoded_text TEXT NOT NULL,
    variables_json TEXT,  -- JSON array of variables used
    offset_used INTEGER,
    cached_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project, program_id, expression_id)
);

CREATE INDEX IF NOT EXISTS idx_decoded_expr_lookup
ON decoded_expressions(project, program_id, expression_id);

-- Ticket metrics for tracking analysis efficiency
CREATE TABLE IF NOT EXISTS ticket_metrics (
    ticket_key TEXT PRIMARY KEY,
    project TEXT,  -- CMDS, PMS
    started_at TEXT,
    completed_at TEXT,
    phases_completed INTEGER DEFAULT 0,  -- 0-6
    pattern_matched TEXT,  -- NULL or pattern name
    programs_analyzed INTEGER DEFAULT 0,
    expressions_decoded INTEGER DEFAULT 0,
    resolution_time_minutes INTEGER,
    success INTEGER DEFAULT 0  -- 1 if resolved
);

CREATE INDEX IF NOT EXISTS idx_ticket_metrics_project ON ticket_metrics(project);
CREATE INDEX IF NOT EXISTS idx_ticket_metrics_success ON ticket_metrics(success);

-- Resolution patterns for knowledge capitalization
CREATE TABLE IF NOT EXISTS resolution_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_name TEXT NOT NULL UNIQUE,
    symptom_keywords TEXT,  -- JSON array
    root_cause_type TEXT,   -- date-format, table-link, expression-error, etc.
    solution_template TEXT,
    source_ticket TEXT,     -- Ex: "PMS-1457"
    usage_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_used_at TEXT,
    -- Schema v6: Spec integration
    spec_references_json TEXT,  -- JSON array ["ADH-IDE-69", "ADH-IDE-232"]
    affected_tables_json TEXT   -- JSON array of table IDs commonly affected
);

CREATE INDEX IF NOT EXISTS idx_patterns_name ON resolution_patterns(pattern_name);
CREATE INDEX IF NOT EXISTS idx_patterns_cause ON resolution_patterns(root_cause_type);

-- FTS for pattern search
CREATE VIRTUAL TABLE IF NOT EXISTS patterns_fts USING fts5(
    pattern_name,
    symptom_keywords,
    solution_template,
    content='resolution_patterns',
    content_rowid='id'
);

-- Triggers for patterns FTS sync
CREATE TRIGGER IF NOT EXISTS patterns_ai AFTER INSERT ON resolution_patterns BEGIN
    INSERT INTO patterns_fts(rowid, pattern_name, symptom_keywords, solution_template)
    VALUES (new.id, new.pattern_name, new.symptom_keywords, new.solution_template);
END;

CREATE TRIGGER IF NOT EXISTS patterns_ad AFTER DELETE ON resolution_patterns BEGIN
    INSERT INTO patterns_fts(patterns_fts, rowid, pattern_name, symptom_keywords, solution_template)
    VALUES('delete', old.id, old.pattern_name, old.symptom_keywords, old.solution_template);
END;

CREATE TRIGGER IF NOT EXISTS patterns_au AFTER UPDATE ON resolution_patterns BEGIN
    INSERT INTO patterns_fts(patterns_fts, rowid, pattern_name, symptom_keywords, solution_template)
    VALUES('delete', old.id, old.pattern_name, old.symptom_keywords, old.solution_template);
    INSERT INTO patterns_fts(rowid, pattern_name, symptom_keywords, solution_template)
    VALUES (new.id, new.pattern_name, new.symptom_keywords, new.solution_template);
END;

-- =========================================================================
-- VARIABLE MODIFICATIONS (Schema v3 - Variable Lineage)
-- =========================================================================

CREATE TABLE IF NOT EXISTS variable_modifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT NOT NULL,
    program_id INTEGER NOT NULL,
    task_isn2 INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    variable_name TEXT NOT NULL,
    operation TEXT,  -- Update, VarSet, Action, etc.
    source_type TEXT,  -- expression, table_column, parameter, constant
    source_expression_id INTEGER,
    source_table_id INTEGER,
    source_column_name TEXT,
    source_description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project, program_id, task_isn2, line_number, variable_name)
);

CREATE INDEX IF NOT EXISTS idx_var_mod_project ON variable_modifications(project);
CREATE INDEX IF NOT EXISTS idx_var_mod_program ON variable_modifications(project, program_id);
CREATE INDEX IF NOT EXISTS idx_var_mod_variable ON variable_modifications(variable_name);

-- =========================================================================
-- SHARED COMPONENTS REGISTRY (Schema v4 - ECF Dependencies)
-- =========================================================================

-- Track which programs belong to ECF shared components
CREATE TABLE IF NOT EXISTS shared_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ecf_name TEXT NOT NULL,           -- "ADH.ecf", "REF.ecf", "UTILS.ecf"
    program_ide_position INTEGER NOT NULL,
    program_public_name TEXT,
    program_internal_name TEXT,
    owner_project TEXT NOT NULL,      -- Project that owns this program
    used_by_projects TEXT,            -- JSON array ["PBP", "PVE"]
    component_group TEXT,             -- "Sessions_Reprises", "Tables", etc.
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(ecf_name, program_ide_position)
);

CREATE INDEX IF NOT EXISTS idx_shared_ecf ON shared_components(ecf_name);
CREATE INDEX IF NOT EXISTS idx_shared_owner ON shared_components(owner_project);
CREATE INDEX IF NOT EXISTS idx_shared_public_name ON shared_components(program_public_name);

-- =========================================================================
-- CHANGE IMPACT ANALYSIS (Schema v5 - Impact Tracking)
-- =========================================================================

-- Track what could break if something is modified
CREATE TABLE IF NOT EXISTS change_impacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_project TEXT NOT NULL,
    source_program_id INTEGER NOT NULL,
    source_element_type TEXT NOT NULL,  -- 'program', 'expression', 'variable', 'table'
    source_element_id TEXT,             -- IDE position, expression ID, variable name, table ID
    affected_project TEXT NOT NULL,
    affected_program_id INTEGER NOT NULL,
    impact_type TEXT NOT NULL,          -- 'calls', 'called_by', 'reads', 'writes', 'uses_table', 'uses_ecf'
    severity TEXT NOT NULL DEFAULT 'medium',  -- 'critical', 'high', 'medium', 'low'
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(source_project, source_program_id, source_element_type, source_element_id, affected_project, affected_program_id, impact_type)
);

CREATE INDEX IF NOT EXISTS idx_impact_source ON change_impacts(source_project, source_program_id);
CREATE INDEX IF NOT EXISTS idx_impact_affected ON change_impacts(affected_project, affected_program_id);
CREATE INDEX IF NOT EXISTS idx_impact_type ON change_impacts(impact_type);
CREATE INDEX IF NOT EXISTS idx_impact_severity ON change_impacts(severity);

-- =========================================================================
-- PROGRAM SPECIFICATIONS (Schema v6 - Spec Indexing)
-- =========================================================================

-- Indexed specs from .openspec/specs/*.md files
CREATE TABLE IF NOT EXISTS program_specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT NOT NULL,
    ide_position INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    spec_version TEXT,
    xml_file TEXT,
    program_type TEXT,           -- 'Online', 'Batch'
    folder TEXT,                 -- IDE folder name (Ventes, Telephone, etc.)

    -- Table statistics
    tables_json TEXT,            -- JSON array of {id, name, access, usageCount}
    table_count INTEGER DEFAULT 0,
    write_table_count INTEGER DEFAULT 0,
    read_table_count INTEGER DEFAULT 0,

    -- Variable statistics
    variables_json TEXT,         -- JSON array of {ref, name, type}
    variable_count INTEGER DEFAULT 0,

    -- Parameter statistics
    parameters_json TEXT,        -- JSON array of {index, name, type}
    parameter_count INTEGER DEFAULT 0,

    -- Expression statistics
    expression_count INTEGER DEFAULT 0,

    -- File info
    spec_file_path TEXT,
    spec_file_hash TEXT,         -- MD5 for change detection
    indexed_at TEXT NOT NULL DEFAULT (datetime('now')),

    -- Pattern integration (P1-D: Bidirectional links)
    known_patterns_json TEXT,    -- JSON array of pattern names affecting this spec

    UNIQUE(project, ide_position)
);

CREATE INDEX IF NOT EXISTS idx_specs_project ON program_specs(project);
CREATE INDEX IF NOT EXISTS idx_specs_ide ON program_specs(project, ide_position);
CREATE INDEX IF NOT EXISTS idx_specs_type ON program_specs(program_type);
CREATE INDEX IF NOT EXISTS idx_specs_folder ON program_specs(folder);
CREATE INDEX IF NOT EXISTS idx_specs_write_count ON program_specs(write_table_count);

-- Spec tables (normalized - for table impact queries)
CREATE TABLE IF NOT EXISTS spec_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spec_id INTEGER NOT NULL REFERENCES program_specs(id) ON DELETE CASCADE,
    table_id INTEGER NOT NULL,
    table_physical_name TEXT,
    table_logical_name TEXT,
    access_mode TEXT NOT NULL,   -- 'R' or 'W'
    usage_count INTEGER DEFAULT 1,
    UNIQUE(spec_id, table_id)
);

CREATE INDEX IF NOT EXISTS idx_spec_tables_spec ON spec_tables(spec_id);
CREATE INDEX IF NOT EXISTS idx_spec_tables_table ON spec_tables(table_id);
CREATE INDEX IF NOT EXISTS idx_spec_tables_access ON spec_tables(access_mode);

-- FTS for spec search
CREATE VIRTUAL TABLE IF NOT EXISTS specs_fts USING fts5(
    project,
    title,
    description,
    folder,
    tables_content,  -- All table names concatenated
    content='program_specs',
    content_rowid='id'
);

-- =========================================================================
-- BUSINESS RULES (Schema v7 - Extracted from Expressions)
-- =========================================================================

-- Rules extracted from expressions for functional documentation
CREATE TABLE IF NOT EXISTS business_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spec_id INTEGER REFERENCES program_specs(id) ON DELETE CASCADE,
    expression_id INTEGER,
    rule_code TEXT NOT NULL,              -- "RM-001", "RM-002"
    rule_description TEXT,
    condition_decoded TEXT,               -- Decoded IF condition
    action_decoded TEXT,                  -- What happens if true
    severity TEXT DEFAULT 'MEDIUM',       -- LOW, MEDIUM, HIGH, CRITICAL
    is_validated INTEGER DEFAULT 0,       -- Human validated flag
    validation_date TEXT,
    validation_author TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(spec_id, rule_code)
);

CREATE INDEX IF NOT EXISTS idx_rules_spec ON business_rules(spec_id);
CREATE INDEX IF NOT EXISTS idx_rules_code ON business_rules(rule_code);
CREATE INDEX IF NOT EXISTS idx_rules_severity ON business_rules(severity);
CREATE INDEX IF NOT EXISTS idx_rules_validated ON business_rules(is_validated);

-- =========================================================================
-- TASK DETAILS (Schema v7 - Extended Task Structure)
-- =========================================================================

-- Extended task information for hierarchical spec views
CREATE TABLE IF NOT EXISTS task_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spec_id INTEGER REFERENCES program_specs(id) ON DELETE CASCADE,
    task_isn2 INTEGER NOT NULL,
    task_name TEXT,
    parent_isn2 INTEGER,
    is_disabled INTEGER DEFAULT 0,        -- [D] marker
    task_level INTEGER DEFAULT 0,
    task_type TEXT,                        -- B=Batch, O=Online
    form_name TEXT,
    window_type INTEGER,
    main_table_id INTEGER,
    main_table_access TEXT,
    column_count INTEGER DEFAULT 0,
    logic_line_count INTEGER DEFAULT 0,
    handler_count INTEGER DEFAULT 0,
    disabled_line_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(spec_id, task_isn2)
);

CREATE INDEX IF NOT EXISTS idx_taskdetails_spec ON task_details(spec_id);
CREATE INDEX IF NOT EXISTS idx_taskdetails_isn2 ON task_details(task_isn2);
CREATE INDEX IF NOT EXISTS idx_taskdetails_disabled ON task_details(is_disabled);
CREATE INDEX IF NOT EXISTS idx_taskdetails_form ON task_details(form_name);

-- =========================================================================
-- SPEC ANNOTATIONS (Schema v7 - Human Annotations Store)
-- =========================================================================

-- Store for human annotations (synced from YAML files)
CREATE TABLE IF NOT EXISTS spec_annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spec_id INTEGER REFERENCES program_specs(id) ON DELETE CASCADE,
    annotation_type TEXT NOT NULL,        -- 'objective', 'user_flow', 'error_case', 'note', 'migration'
    content_json TEXT NOT NULL,           -- JSON content
    author TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_annotations_spec ON spec_annotations(spec_id);
CREATE INDEX IF NOT EXISTS idx_annotations_type ON spec_annotations(annotation_type);

-- =========================================================================
-- SPEC CALL GRAPH (Schema v7 - Cached Call Graph Data)
-- =========================================================================

-- Cached call graph for fast cartography rendering
CREATE TABLE IF NOT EXISTS spec_call_graph (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spec_id INTEGER REFERENCES program_specs(id) ON DELETE CASCADE,
    direction TEXT NOT NULL,              -- 'caller', 'callee'
    related_project TEXT NOT NULL,
    related_ide INTEGER NOT NULL,
    related_name TEXT,
    call_count INTEGER DEFAULT 1,
    is_cross_project INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(spec_id, direction, related_project, related_ide)
);

CREATE INDEX IF NOT EXISTS idx_callgraph_spec ON spec_call_graph(spec_id);
CREATE INDEX IF NOT EXISTS idx_callgraph_related ON spec_call_graph(related_project, related_ide);
CREATE INDEX IF NOT EXISTS idx_callgraph_cross ON spec_call_graph(is_cross_project);

-- =========================================================================
-- SPEC BASELINES (Schema v7 - Anti-Regression Metrics)
-- =========================================================================

-- Store baseline metrics for regression detection
CREATE TABLE IF NOT EXISTS spec_baselines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spec_id INTEGER REFERENCES program_specs(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,            -- 'expression_count', 'table_count', 'write_table_count', etc.
    metric_value INTEGER NOT NULL,
    threshold_alert INTEGER,              -- Deviation threshold for alerts
    recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(spec_id, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_baselines_spec ON spec_baselines(spec_id);
CREATE INDEX IF NOT EXISTS idx_baselines_metric ON spec_baselines(metric_name);

-- Triggers for specs FTS sync
CREATE TRIGGER IF NOT EXISTS specs_ai AFTER INSERT ON program_specs BEGIN
    INSERT INTO specs_fts(rowid, project, title, description, folder, tables_content)
    VALUES (new.id, new.project, new.title, new.description, new.folder,
        (SELECT group_concat(json_extract(value, '$.name'), ' ')
         FROM json_each(new.tables_json) WHERE new.tables_json IS NOT NULL));
END;

CREATE TRIGGER IF NOT EXISTS specs_ad AFTER DELETE ON program_specs BEGIN
    INSERT INTO specs_fts(specs_fts, rowid, project, title, description, folder, tables_content)
    VALUES('delete', old.id, old.project, old.title, old.description, old.folder,
        (SELECT group_concat(json_extract(value, '$.name'), ' ')
         FROM json_each(old.tables_json) WHERE old.tables_json IS NOT NULL));
END;

CREATE TRIGGER IF NOT EXISTS specs_au AFTER UPDATE ON program_specs BEGIN
    INSERT INTO specs_fts(specs_fts, rowid, project, title, description, folder, tables_content)
    VALUES('delete', old.id, old.project, old.title, old.description, old.folder,
        (SELECT group_concat(json_extract(value, '$.name'), ' ')
         FROM json_each(old.tables_json) WHERE old.tables_json IS NOT NULL));
    INSERT INTO specs_fts(rowid, project, title, description, folder, tables_content)
    VALUES (new.id, new.project, new.title, new.description, new.folder,
        (SELECT group_concat(json_extract(value, '$.name'), ' ')
         FROM json_each(new.tables_json) WHERE new.tables_json IS NOT NULL));
END;

-- =========================================================================
-- SCHEMA V9 - XML ENRICHMENT TABLES
-- Complete storage of Magic XML elements for migration
-- =========================================================================

-- =========================================================================
-- 1. PROGRAM METADATA (Header additional info)
-- =========================================================================

CREATE TABLE IF NOT EXISTS program_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    task_type TEXT,                  -- O=Online, B=Batch, R=Rich Client
    last_modified_date TEXT,         -- DD/MM/YYYY
    last_modified_time TEXT,         -- HH:MM:SS
    last_modified_ts INTEGER,        -- Unix timestamp for sorting
    execution_right INTEGER,
    is_resident INTEGER DEFAULT 0,
    is_sql INTEGER DEFAULT 0,
    is_external INTEGER DEFAULT 0,
    form_type TEXT,
    has_dotnet INTEGER DEFAULT 0,
    has_sql_where INTEGER DEFAULT 0,
    is_main_program INTEGER DEFAULT 0,
    last_isn INTEGER,
    UNIQUE(program_id)
);

CREATE INDEX IF NOT EXISTS idx_prog_meta_program ON program_metadata(program_id);
CREATE INDEX IF NOT EXISTS idx_prog_meta_modified ON program_metadata(last_modified_ts);

-- =========================================================================
-- 2. TASK PARAMETERS (ParametersAttributes/Attr/@MgAttr)
-- =========================================================================

CREATE TABLE IF NOT EXISTS task_parameters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,           -- 1, 2, 3... (order in parameters list)
    mg_attr TEXT NOT NULL,               -- A=Alpha, N=Numeric, D=Date, L=Logical, T=Time, B=Blob
    is_output INTEGER DEFAULT 0,         -- Output parameter flag (TSK_PARAMS)
    UNIQUE(task_id, position)
);

CREATE INDEX IF NOT EXISTS idx_task_params_task ON task_parameters(task_id);
CREATE INDEX IF NOT EXISTS idx_task_params_type ON task_parameters(mg_attr);

-- =========================================================================
-- 3. TASK INFORMATION (Information block)
-- =========================================================================

CREATE TABLE IF NOT EXISTS task_information (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    initial_mode TEXT,                   -- C=Create, M=Modify, Q=Query, D=Delete, etc.
    end_task_condition_expr INTEGER,     -- Expression ID for EndTaskCondition
    evaluate_end_condition TEXT,         -- Y/N
    force_record_delete TEXT,            -- DEL value
    main_db_component INTEGER,           -- DB/@comp
    key_mode TEXT,                       -- Key/Mode/@val
    range_direction TEXT,
    locate_direction TEXT,
    sort_cls TEXT,
    box_bottom INTEGER,
    box_right INTEGER,
    box_direction TEXT,
    open_task_window TEXT,                -- Y/N - whether task opens its window
    UNIQUE(task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_info_task ON task_information(task_id);

-- =========================================================================
-- 4. TASK PROPERTIES (TaskProperties block)
-- =========================================================================

CREATE TABLE IF NOT EXISTS task_properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    transaction_mode TEXT,               -- D=Deferred, P=Physical, N=Nested, etc.
    transaction_begin TEXT,              -- B=Before, G=Group, O=On Lock
    locking_strategy TEXT,               -- I=Immediate, O=On Modify, N=None
    cache_strategy TEXT,
    error_strategy TEXT,                 -- A=Abort, R=Recover, I=Ignore
    confirm_update TEXT,
    confirm_cancel TEXT,
    allow_empty_dataview INTEGER DEFAULT 1,
    preload_view INTEGER DEFAULT 0,
    selection_table INTEGER,
    force_record_suffix TEXT,
    keep_created_context TEXT,
    UNIQUE(task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_props_task ON task_properties(task_id);

-- =========================================================================
-- 5. TASK PERMISSIONS (SIDE_WIN block)
-- =========================================================================

CREATE TABLE IF NOT EXISTS task_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    allow_create INTEGER DEFAULT 1,
    allow_delete INTEGER DEFAULT 1,
    allow_modify INTEGER DEFAULT 1,
    allow_query INTEGER DEFAULT 1,
    allow_locate INTEGER DEFAULT 1,
    allow_range INTEGER DEFAULT 1,
    allow_sorting INTEGER DEFAULT 1,
    allow_events INTEGER DEFAULT 1,
    allow_index_change INTEGER DEFAULT 1,
    allow_index_optimization INTEGER DEFAULT 1,
    allow_io_files INTEGER DEFAULT 1,
    allow_location_in_query INTEGER DEFAULT 1,
    allow_options INTEGER DEFAULT 1,
    allow_printing_data INTEGER DEFAULT 1,
    record_cycle TEXT,
    UNIQUE(task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_perms_task ON task_permissions(task_id);

-- =========================================================================
-- 6. CALL ARGUMENTS (CallTask/Arguments/Argument)
-- =========================================================================

CREATE TABLE IF NOT EXISTS call_arguments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id INTEGER NOT NULL REFERENCES program_calls(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,           -- Argument position (1, 2, 3...)
    arg_id INTEGER,                      -- Argument/@id
    variable_ref TEXT,                   -- Argument/Variable/@val - {0,N} or {32768,N}
    expression_ref INTEGER,              -- Argument/Expression/@val - Expression ID
    skip INTEGER DEFAULT 0,              -- Argument/Skip/@val - Y=1, N=0
    is_parent INTEGER DEFAULT 0,         -- Argument/Parent/@val - Y=1
    UNIQUE(call_id, position)
);

CREATE INDEX IF NOT EXISTS idx_call_args_call ON call_arguments(call_id);
CREATE INDEX IF NOT EXISTS idx_call_args_var ON call_arguments(variable_ref);

-- =========================================================================
-- 7. SELECT DEFINITIONS (Logic/Select details)
-- =========================================================================

CREATE TABLE IF NOT EXISTS select_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    logic_line_id INTEGER REFERENCES logic_lines(id) ON DELETE SET NULL,
    field_id INTEGER NOT NULL,           -- Select/@FieldID
    select_id INTEGER,                   -- Select/@id
    column_ref INTEGER,                  -- Select/Column/@val
    select_type TEXT,                    -- Select/Type/@val - V=Virtual, P=Parameter, R=Real, C=Control
    is_parameter INTEGER DEFAULT 0,      -- Select/IsParameter/@val
    assignment_expr INTEGER,             -- Select/ASS/@val - Expression ID
    diff_update TEXT,                    -- Select/DIFF_UPDATE/@val
    locate_min_expr INTEGER,             -- Select/Locate/@MIN - Expression ID
    locate_max_expr INTEGER,             -- Select/Locate/@MAX - Expression ID
    part_of_dataview INTEGER DEFAULT 1,  -- Select/PartOfDataview/@val
    real_var_name TEXT,                  -- Select/REAL_VNAME_TXT/@val
    control_index INTEGER,               -- Select/_ControlIndex/@val
    form_index INTEGER,                  -- Select/_FormIndex/@val
    tabbing_order INTEGER,               -- Select/_TabbingOrderDspIndex/@val
    recompute_index INTEGER              -- Select/_RecomputeIndex/@val
);

CREATE INDEX IF NOT EXISTS idx_select_def_task ON select_definitions(task_id);
CREATE INDEX IF NOT EXISTS idx_select_def_line ON select_definitions(logic_line_id);
CREATE INDEX IF NOT EXISTS idx_select_def_field ON select_definitions(field_id);
CREATE INDEX IF NOT EXISTS idx_select_def_type ON select_definitions(select_type);

-- =========================================================================
-- 8. UPDATE OPERATIONS (Logic/Update details)
-- =========================================================================

CREATE TABLE IF NOT EXISTS update_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    field_id INTEGER NOT NULL,           -- Update/FieldID/@val
    with_value_expr INTEGER,             -- Update/WithValue/@val - Expression ID
    forced_update INTEGER DEFAULT 0,     -- Update/ForcedUpdate/@val
    incremental INTEGER DEFAULT 0,       -- Update/Incremental/@val
    direction TEXT                       -- Update/Direction/@val
);

CREATE INDEX IF NOT EXISTS idx_update_ops_line ON update_operations(logic_line_id);
CREATE INDEX IF NOT EXISTS idx_update_ops_field ON update_operations(field_id);

-- =========================================================================
-- 9. LINK OPERATIONS (Logic/LNK details)
-- =========================================================================

CREATE TABLE IF NOT EXISTS link_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    table_id INTEGER NOT NULL,           -- LNK/DB/@obj
    key_index INTEGER,                   -- LNK/@Key
    link_mode TEXT,                      -- LNK/@Mode - L=Link, Q=Query, W=Write, etc.
    direction TEXT,                      -- LNK/@Direction
    sort_type TEXT,                      -- LNK/@SortType
    view_number INTEGER,                 -- LNK/@VIEW
    views TEXT,                          -- LNK/@VIEWS (for multi-view)
    field_id INTEGER,                    -- LNK/@FieldID (linking field)
    condition_expr INTEGER,              -- LNK/Condition/@val - Expression ID
    eval_condition TEXT,                 -- LNK/@EVL_CND
    is_expanded INTEGER DEFAULT 0        -- LNK/Expanded/@val
);

CREATE INDEX IF NOT EXISTS idx_link_ops_line ON link_operations(logic_line_id);
CREATE INDEX IF NOT EXISTS idx_link_ops_table ON link_operations(table_id);
CREATE INDEX IF NOT EXISTS idx_link_ops_mode ON link_operations(link_mode);

-- =========================================================================
-- 10. STOP OPERATIONS (Logic/STP details - Messages/Errors)
-- =========================================================================

CREATE TABLE IF NOT EXISTS stop_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    mode TEXT,                           -- STP/@Mode - V=Verify, E=Error, W=Warning, S=Status
    buttons TEXT,                        -- STP/@Buttons
    default_button INTEGER,              -- STP/@DefaultButton
    title_text TEXT,                     -- STP/@TitleTxt
    message_text TEXT,                   -- STP/@TXT (literal text)
    message_expr INTEGER,                -- STP/@Exp (expression ID)
    image TEXT,                          -- STP/@Image
    display_var INTEGER,                 -- STP/@VR_DISP
    return_var INTEGER,                  -- STP/RetValVar/@val
    append_to_error_log INTEGER DEFAULT 0, -- STP/AppendToErrorLog/@val
    err_log_def_chg TEXT,                -- STP/@ERR_LOG_DEF_CHG
    img_def_chg TEXT,                    -- STP/@IMG_DEF_CHG
    ttl_def_chg TEXT                     -- STP/@TTL_DEF_CHG
);

CREATE INDEX IF NOT EXISTS idx_stop_ops_line ON stop_operations(logic_line_id);
CREATE INDEX IF NOT EXISTS idx_stop_ops_mode ON stop_operations(mode);

-- =========================================================================
-- 11. RAISE EVENT OPERATIONS (Logic/RaiseEvent details)
-- =========================================================================

CREATE TABLE IF NOT EXISTS raise_event_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    event_type TEXT,                     -- RaiseEvent/Event/EventType/@val
    internal_event_id INTEGER,           -- RaiseEvent/Event/InternalEventID/@val
    public_object_comp TEXT,             -- RaiseEvent/Event/PublicObject/@comp
    public_object_obj INTEGER,           -- RaiseEvent/Event/PublicObject/@obj
    wait_mode TEXT,                      -- RaiseEvent/Wait/@val
    direction TEXT                       -- RaiseEvent/Direction/@val
);

CREATE INDEX IF NOT EXISTS idx_raise_event_line ON raise_event_operations(logic_line_id);
CREATE INDEX IF NOT EXISTS idx_raise_event_type ON raise_event_operations(event_type);

-- =========================================================================
-- 12. EVENT HANDLERS (Task/EVNT)
-- =========================================================================

CREATE TABLE IF NOT EXISTS event_handlers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL,           -- EVNT/@id
    description TEXT,                    -- EVNT/@DESC
    force_exit TEXT,                     -- EVNT/@FORCE_EXIT
    event_type TEXT,                     -- EVNT/Event/EventType/@val
    public_object_comp TEXT,             -- EVNT/Event/PublicObject/@comp
    public_object_obj INTEGER            -- EVNT/Event/PublicObject/@obj
);

CREATE INDEX IF NOT EXISTS idx_event_handlers_task ON event_handlers(task_id);
CREATE INDEX IF NOT EXISTS idx_event_handlers_type ON event_handlers(event_type);

-- =========================================================================
-- 13. FIELD RANGES (Task/FLD_RNG)
-- =========================================================================

CREATE TABLE IF NOT EXISTS field_ranges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    range_id INTEGER NOT NULL,           -- FLD_RNG/id/@val
    column_obj INTEGER,                  -- FLD_RNG/_Column/@obj
    min_expr INTEGER,                    -- FLD_RNG/MIN/@val - Expression ID
    max_expr INTEGER,                    -- FLD_RNG/MAX/@val - Expression ID
    UNIQUE(task_id, range_id)
);

CREATE INDEX IF NOT EXISTS idx_field_ranges_task ON field_ranges(task_id);

-- =========================================================================
-- 14. FORM CONTROLS (UI Controls inside Forms)
-- =========================================================================

CREATE TABLE IF NOT EXISTS form_controls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    form_id INTEGER NOT NULL REFERENCES task_forms(id) ON DELETE CASCADE,
    control_id INTEGER NOT NULL,         -- Control ID within form
    control_type TEXT,                   -- EDIT, PUSH_BUTTON, TABLE, STATIC, COMBO, CHECKBOX, COLUMN, etc.
    control_name TEXT,                   -- Control name/label (property id=46)
    x INTEGER,                           -- X position (DLU or px)
    y INTEGER,                           -- Y position (DLU or px)
    width INTEGER,
    height INTEGER,
    visible INTEGER DEFAULT 1,
    enabled INTEGER DEFAULT 1,
    tab_order INTEGER,
    linked_field_id INTEGER,             -- Link to dataview column FieldID
    linked_variable TEXT,                -- Variable reference {0,N}
    parent_id INTEGER,                   -- ISN_FATHER for nested controls (table columns)
    style INTEGER,                       -- Control style
    color INTEGER,                       -- Color ID
    font_id INTEGER,                     -- Font ID
    text TEXT,                           -- Display text (valUnicode, id=19 or 45)
    format TEXT,                         -- Format string (valUnicode, id=82)
    data_field_id INTEGER,               -- Data binding FieldID (id=43)
    data_expression_id INTEGER,          -- Data binding Expression (id=43 Exp)
    raise_event_type TEXT,               -- Event type (I=Internal, U=User, S=System)
    raise_event_id INTEGER,              -- Internal event ID
    image_file TEXT,                     -- DefaultImageFile (id=88)
    items_list TEXT,                     -- ItemsList for combos (id=45)
    column_title TEXT,                   -- Column header text (id=139)
    control_layer INTEGER,               -- ControlLayer for table columns (id=25)
    h_alignment INTEGER,                 -- Horizontal alignment (id=65)
    title_height INTEGER,                -- Table title height (id=79)
    row_height INTEGER,                  -- Table row height (id=80)
    elements INTEGER,                    -- Table row count (id=81)
    allow_parking INTEGER,               -- Allow parking flag (id=315)
    visible_expression INTEGER,          -- Conditional visibility expression ID
    enabled_expression INTEGER,          -- Conditional enabled expression ID
    properties_json TEXT                 -- All remaining properties as JSON
);

CREATE INDEX IF NOT EXISTS idx_form_controls_form ON form_controls(form_id);
CREATE INDEX IF NOT EXISTS idx_form_controls_type ON form_controls(control_type);
CREATE INDEX IF NOT EXISTS idx_form_controls_field ON form_controls(linked_field_id);

-- =========================================================================
-- 15. BLOCK OPERATIONS (Logic/BLOCK details)
-- =========================================================================

CREATE TABLE IF NOT EXISTS block_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    block_type TEXT,                     -- IF, ELSE, LOOP, etc.
    condition_expr INTEGER,              -- Block condition expression
    modifier TEXT                        -- BLOCK/Modifier/@val
);

CREATE INDEX IF NOT EXISTS idx_block_ops_line ON block_operations(logic_line_id);
CREATE INDEX IF NOT EXISTS idx_block_ops_type ON block_operations(block_type);

-- =========================================================================
-- 16. EVALUATE OPERATIONS (Logic/Evaluate - compute expressions)
-- =========================================================================

CREATE TABLE IF NOT EXISTS evaluate_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    expression_ref INTEGER,              -- Evaluate/Expression/@val
    condition_expr INTEGER,              -- Evaluate/Condition/@Exp
    direction TEXT,                      -- Evaluate/Direction/@val
    modifier TEXT                        -- Evaluate/Modifier/@val
);

CREATE INDEX IF NOT EXISTS idx_eval_ops_line ON evaluate_operations(logic_line_id);

-- =========================================================================
-- END OF SCHEMA V9
-- =========================================================================
