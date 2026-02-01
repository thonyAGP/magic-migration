-- =========================================================================
-- SCHEMA V9 - XML ENRICHMENT TABLES
-- Complete storage of Magic XML elements for migration
-- =========================================================================

-- Update schema version
UPDATE kb_metadata SET value = '9' WHERE key = 'schema_version';

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

-- Add columns to existing tasks table via ALTER
-- ALTER TABLE tasks ADD COLUMN transaction_mode TEXT;
-- ALTER TABLE tasks ADD COLUMN transaction_begin TEXT;
-- ALTER TABLE tasks ADD COLUMN locking_strategy TEXT;
-- ALTER TABLE tasks ADD COLUMN cache_strategy TEXT;
-- ALTER TABLE tasks ADD COLUMN error_strategy TEXT;
-- ALTER TABLE tasks ADD COLUMN confirm_update TEXT;
-- ALTER TABLE tasks ADD COLUMN confirm_cancel TEXT;
-- ALTER TABLE tasks ADD COLUMN allow_empty_dataview INTEGER DEFAULT 1;
-- ALTER TABLE tasks ADD COLUMN preload_view INTEGER DEFAULT 0;
-- ALTER TABLE tasks ADD COLUMN selection_table INTEGER;

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
    control_type TEXT,                   -- EDIT, BUTTON, TABLE, LABEL, COMBO, CHECKBOX, etc.
    control_name TEXT,                   -- Control name/label
    x INTEGER,                           -- X position
    y INTEGER,                           -- Y position
    width INTEGER,
    height INTEGER,
    visible INTEGER DEFAULT 1,
    enabled INTEGER DEFAULT 1,
    tab_order INTEGER,
    linked_field_id INTEGER,             -- Link to dataview column FieldID
    linked_variable TEXT,                -- Variable reference {0,N}
    properties_json TEXT                 -- Additional properties as JSON
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
-- ALTERATIONS TO EXISTING TABLES
-- =========================================================================

-- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS
-- Run these manually or in migration script with error handling:

-- ALTER TABLE table_usage ADD COLUMN share_mode TEXT;
-- ALTER TABLE table_usage ADD COLUMN open_mode TEXT;
-- ALTER TABLE table_usage ADD COLUMN cache_mode TEXT;
-- ALTER TABLE table_usage ADD COLUMN identify_row_mods TEXT;

-- ALTER TABLE dataview_columns ADD COLUMN stored_as INTEGER;
-- ALTER TABLE dataview_columns ADD COLUMN size INTEGER;
-- ALTER TABLE dataview_columns ADD COLUMN null_value TEXT;
-- ALTER TABLE dataview_columns ADD COLUMN decimal_places INTEGER;
-- ALTER TABLE dataview_columns ADD COLUMN whole_digits INTEGER;
-- ALTER TABLE dataview_columns ADD COLUMN allow_negative INTEGER;
-- ALTER TABLE dataview_columns ADD COLUMN update_style TEXT;
-- ALTER TABLE dataview_columns ADD COLUMN char_set TEXT;

-- ALTER TABLE logic_lines ADD COLUMN remark_text TEXT;
-- ALTER TABLE logic_lines ADD COLUMN remark_type TEXT;
-- ALTER TABLE logic_lines ADD COLUMN flow_isn INTEGER;
-- ALTER TABLE logic_lines ADD COLUMN direction TEXT;
-- ALTER TABLE logic_lines ADD COLUMN modifier TEXT;

-- ALTER TABLE expressions ADD COLUMN attribute TEXT;

-- ALTER TABLE program_calls ADD COLUMN operation_type TEXT;
-- ALTER TABLE program_calls ADD COLUMN lock_mode TEXT;
-- ALTER TABLE program_calls ADD COLUMN wait_mode TEXT;
-- ALTER TABLE program_calls ADD COLUMN retain_focus INTEGER;
-- ALTER TABLE program_calls ADD COLUMN sync_data TEXT;
-- ALTER TABLE program_calls ADD COLUMN condition_expr INTEGER;

-- ALTER TABLE task_forms ADD COLUMN position_x INTEGER;
-- ALTER TABLE task_forms ADD COLUMN position_y INTEGER;

-- =========================================================================
-- SUMMARY OF NEW TABLES (16 total)
-- =========================================================================
/*
1.  program_metadata      - Extended program header info
2.  task_parameters       - Parameter types (MgAttr)
3.  task_information      - Task Information block
4.  task_properties       - TaskProperties block
5.  task_permissions      - SIDE_WIN permissions
6.  call_arguments        - CallTask arguments
7.  select_definitions    - Select/Variable definitions
8.  update_operations     - Update operations detail
9.  link_operations       - LNK (table link) operations
10. stop_operations       - STP (message/error) operations
11. raise_event_operations - RaiseEvent operations
12. event_handlers        - EVNT event handlers
13. field_ranges          - FLD_RNG field ranges
14. form_controls         - Form UI controls
15. block_operations      - BLOCK/IF/ELSE operations
16. evaluate_operations   - Evaluate expression operations
*/

-- =========================================================================
-- END OF SCHEMA V9
-- =========================================================================
