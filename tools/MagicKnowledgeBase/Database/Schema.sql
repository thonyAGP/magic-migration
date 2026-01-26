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
    locate_expression_id INTEGER
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

INSERT OR REPLACE INTO kb_metadata (key, value) VALUES ('schema_version', '7');
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
