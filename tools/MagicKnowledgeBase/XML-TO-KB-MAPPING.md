# XML Magic to Knowledge Base Mapping

> Document de reference pour l'enrichissement de la KB avec les elements XML manquants.
> Genere: 2026-01-28

---

## Legende

| Statut | Signification |
|--------|---------------|
| OK | Element deja stocke dans la KB |
| PARTIEL | Element partiellement stocke (certains attributs manquent) |
| MANQUANT | Element non stocke - A AJOUTER |
| IGNORE | Element non pertinent pour la migration |

---

## 1. PROGRAMME (Header)

### Table actuelle: `programs`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `Task/@MainProgram` | MainProgram | - | MANQUANT | Basse |
| `Header/@Description` | Description | `name` | OK | - |
| `Header/@ISN_2` | ISN_2 | - | IGNORE | - |
| `Header/@LastIsn` | LastIsn | - | MANQUANT | Basse |
| `Header/@id` | id | `xml_id` | OK | - |
| `Header/TaskType/@val` | TaskType | - | MANQUANT | Haute |
| `Header/LastModified/@date` | date | - | MANQUANT | Moyenne |
| `Header/LastModified/@time` | time | - | MANQUANT | Moyenne |
| `Header/ExecutionRight/@comp` | ExecutionRight | - | MANQUANT | Moyenne |
| `Header/Resident/@val` | Resident | - | MANQUANT | Basse |
| `Header/SQL/@val` | SQL | - | MANQUANT | Moyenne |
| `Header/External/@val` | External | - | MANQUANT | Moyenne |
| `Header/FormType/@val` | FormType | - | MANQUANT | Moyenne |
| `Header/DotNetObjectExists/@val` | DotNetObjectExists | - | MANQUANT | Basse |
| `Header/SqlWhereExist/@val` | SqlWhereExist | - | MANQUANT | Basse |

### Nouvelle table a creer: `program_metadata`

```sql
CREATE TABLE IF NOT EXISTS program_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    task_type TEXT,              -- O=Online, B=Batch, etc.
    last_modified_date TEXT,     -- DD/MM/YYYY
    last_modified_time TEXT,     -- HH:MM:SS
    execution_right INTEGER,
    is_resident INTEGER DEFAULT 0,
    is_sql INTEGER DEFAULT 0,
    is_external INTEGER DEFAULT 0,
    form_type TEXT,
    has_dotnet INTEGER DEFAULT 0,
    has_sql_where INTEGER DEFAULT 0,
    main_program INTEGER DEFAULT 0,
    last_isn INTEGER,
    UNIQUE(program_id)
);
```

---

## 2. PARAMETRES DE TACHE (ReturnValue)

### Element XML: `Header/ReturnValue`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `ReturnValue/ParametersCount/@val` | val | - | MANQUANT | **HAUTE** |
| `ReturnValue/TSK_PARAMS/@val` | val | - | MANQUANT | **HAUTE** |
| `ReturnValue/ParametersAttributes/Attr/@MgAttr` | MgAttr | - | MANQUANT | **HAUTE** |

### Nouvelle table a creer: `task_parameters`

```sql
CREATE TABLE IF NOT EXISTS task_parameters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,        -- 1, 2, 3...
    mg_attr TEXT NOT NULL,            -- A=Alpha, N=Numeric, D=Date, L=Logical, T=Time, B=Blob
    UNIQUE(task_id, position)
);
```

---

## 3. RESSOURCES BASE DE DONNEES (Resource/DB)

### Table actuelle: `table_usage`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `Resource/DB/DataObject/@comp` | comp | - | IGNORE | - |
| `Resource/DB/DataObject/@obj` | obj | `table_id` | OK | - |
| `Resource/DB/Access/@val` | val | `usage_type` | OK | - |
| `Resource/DB/Share/@val` | val | - | MANQUANT | Haute |
| `Resource/DB/Open/@val` | val | - | MANQUANT | Moyenne |
| `Resource/DB/Cache/@val` | val | - | MANQUANT | Haute |
| `Resource/DB/IdentifyRowModifications/@val` | val | - | MANQUANT | Basse |

### Modification table existante: `table_usage`

```sql
-- Ajouter colonnes
ALTER TABLE table_usage ADD COLUMN share_mode TEXT;      -- W=Write, R=Read
ALTER TABLE table_usage ADD COLUMN open_mode TEXT;       -- Y/N
ALTER TABLE table_usage ADD COLUMN cache_mode TEXT;      -- Y/N
ALTER TABLE table_usage ADD COLUMN identify_row_mods TEXT;
```

---

## 4. COLONNES DATAVIEW (Resource/Columns)

### Table actuelle: `dataview_columns`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `Column/@id` | id | `xml_id` | OK | - |
| `Column/@name` | name | `name` | OK | - |
| `PropertyList/Model/@attr_obj` | attr_obj | `data_type` | OK | - |
| `PropertyList/Picture/@valUnicode` | valUnicode | `picture` | OK | - |
| `PropertyList/StoredAs/@val` | val | - | MANQUANT | Haute |
| `PropertyList/Size/@val` | val | - | MANQUANT | Haute |
| `PropertyList/Definition/@val` | val | `definition` | OK | - |
| `PropertyList/NullValue/@val` | val | - | MANQUANT | Haute |
| `PropertyList/_Dec/@val` | val | - | MANQUANT | **HAUTE** |
| `PropertyList/_Whole/@val` | val | - | MANQUANT | **HAUTE** |
| `PropertyList/_Negative/@val` | val | - | MANQUANT | Haute |
| `PropertyList/UpdateStyle/@val` | val | - | MANQUANT | Moyenne |
| `PropertyList/CharSet/@val` | val | - | MANQUANT | Basse |
| `PropertyList/_Flip/@id` | id | - | IGNORE | - |

### Modification table existante: `dataview_columns`

```sql
-- Ajouter colonnes
ALTER TABLE dataview_columns ADD COLUMN stored_as INTEGER;
ALTER TABLE dataview_columns ADD COLUMN size INTEGER;
ALTER TABLE dataview_columns ADD COLUMN null_value TEXT;
ALTER TABLE dataview_columns ADD COLUMN decimal_places INTEGER;    -- _Dec
ALTER TABLE dataview_columns ADD COLUMN whole_digits INTEGER;      -- _Whole
ALTER TABLE dataview_columns ADD COLUMN allow_negative INTEGER;    -- _Negative (Y/N -> 1/0)
ALTER TABLE dataview_columns ADD COLUMN update_style TEXT;
ALTER TABLE dataview_columns ADD COLUMN char_set TEXT;
```

---

## 5. PROPRIETES DE TACHE (Information/TaskProperties)

### Pas de table actuelle

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `TaskProperties/TransactionMode/@val` | val | - | MANQUANT | **HAUTE** |
| `TaskProperties/TransactionBegin/@val` | val | - | MANQUANT | **HAUTE** |
| `TaskProperties/LockingStrategy/@val` | val | - | MANQUANT | **HAUTE** |
| `TaskProperties/CacheStrategy/@val` | val | - | MANQUANT | Haute |
| `TaskProperties/ErrorStrategy/@val` | val | - | MANQUANT | Haute |
| `TaskProperties/ConfirmUpdate/@CNFU` | CNFU | - | MANQUANT | Moyenne |
| `TaskProperties/ConfirmCancel/@val` | val | - | MANQUANT | Moyenne |
| `TaskProperties/AllowEmptyDataview/@val` | val | - | MANQUANT | Moyenne |
| `TaskProperties/PreloadView/@val` | val | - | MANQUANT | Basse |
| `TaskProperties/SelectionTable/@val` | val | - | MANQUANT | Basse |
| `TaskProperties/ForceRecordSuffix/@val` | val | - | MANQUANT | Basse |
| `TaskProperties/KeepCreatedContext/@val` | val | - | MANQUANT | Basse |

### Modification table existante: `tasks`

```sql
-- Ajouter colonnes
ALTER TABLE tasks ADD COLUMN transaction_mode TEXT;
ALTER TABLE tasks ADD COLUMN transaction_begin TEXT;
ALTER TABLE tasks ADD COLUMN locking_strategy TEXT;
ALTER TABLE tasks ADD COLUMN cache_strategy TEXT;
ALTER TABLE tasks ADD COLUMN error_strategy TEXT;
ALTER TABLE tasks ADD COLUMN confirm_update TEXT;
ALTER TABLE tasks ADD COLUMN confirm_cancel TEXT;
ALTER TABLE tasks ADD COLUMN allow_empty_dataview INTEGER;
ALTER TABLE tasks ADD COLUMN preload_view INTEGER;
ALTER TABLE tasks ADD COLUMN selection_table INTEGER;
```

---

## 6. INFORMATION DE TACHE (Information)

### Element XML: `Task/Information`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `Information/InitialMode/@val` | val | - | MANQUANT | **HAUTE** |
| `Information/EndTaskCondition/@Exp` | Exp | - | MANQUANT | **HAUTE** |
| `Information/EvaluateEndCondition/@val` | val | - | MANQUANT | Haute |
| `Information/ForceRecordDelete/@DEL` | DEL | - | MANQUANT | Haute |
| `Information/DB/@comp` | comp | - | MANQUANT | Haute |
| `Information/Key/Mode/@val` | val | - | MANQUANT | Haute |
| `Information/Range/@Direction` | Direction | - | MANQUANT | Haute |
| `Information/Locate/@Direction` | Direction | - | MANQUANT | Haute |
| `Information/Sort/CLS/@val` | val | - | MANQUANT | Moyenne |
| `Information/BOX/*` | Bottom, Right, Direction | - | MANQUANT | Basse |

### Nouvelle table a creer: `task_information`

```sql
CREATE TABLE IF NOT EXISTS task_information (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    initial_mode TEXT,
    end_task_condition_expr INTEGER,  -- Reference expression
    evaluate_end_condition TEXT,
    force_record_delete TEXT,
    main_db_component INTEGER,
    key_mode TEXT,
    range_direction TEXT,
    locate_direction TEXT,
    sort_cls TEXT,
    box_bottom INTEGER,
    box_right INTEGER,
    box_direction TEXT,
    UNIQUE(task_id)
);
```

---

## 7. PERMISSIONS SIDE_WIN

### Element XML: `Information/SIDE_WIN`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `SIDE_WIN/AllowCreate/@val` | val | - | MANQUANT | Moyenne |
| `SIDE_WIN/AllowDelete/@val` | val | - | MANQUANT | Moyenne |
| `SIDE_WIN/AllowModify/@val` | val | - | MANQUANT | Moyenne |
| `SIDE_WIN/AllowQuery/@val` | val | - | MANQUANT | Moyenne |
| `SIDE_WIN/AllowLocate/@val` | val | - | MANQUANT | Moyenne |
| `SIDE_WIN/AllowRange/@val` | val | - | MANQUANT | Moyenne |
| `SIDE_WIN/AllowSorting/@val` | val | - | MANQUANT | Moyenne |
| `SIDE_WIN/AllowEvents/@val` | val | - | MANQUANT | Basse |
| `SIDE_WIN/AllowIndexChange/@val` | val | - | MANQUANT | Basse |
| `SIDE_WIN/AllowIndexOptimization/@val` | val | - | MANQUANT | Basse |
| `SIDE_WIN/AllowIOFiles/@val` | val | - | MANQUANT | Basse |
| `SIDE_WIN/AllowLocationInQuery/@val` | val | - | MANQUANT | Basse |
| `SIDE_WIN/AllowOptions/@val` | val | - | MANQUANT | Basse |
| `SIDE_WIN/AllowPrintingData/@val` | val | - | MANQUANT | Basse |
| `SIDE_WIN/RecordCycle/@val` | val | - | MANQUANT | Basse |

### Nouvelle table a creer: `task_permissions`

```sql
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
    allow_io_files INTEGER DEFAULT 1,
    record_cycle TEXT,
    UNIQUE(task_id)
);
```

---

## 8. LIGNES DE LOGIQUE (TaskLogic/LogicLines)

### Table actuelle: `logic_lines`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `LogicLine/*` (type operation) | - | `operation` | OK | - |
| `*/Condition/@val` ou `@Exp` | val/Exp | `condition_expr` | OK | - |
| `*/Disabled/@val` | val | `is_disabled` | OK | - |
| `*/Direction/@val` | val | - | MANQUANT | Moyenne |
| `*/Modifier/@val` | val | - | MANQUANT | Basse |
| `*/@FlowIsn` | FlowIsn | - | MANQUANT | Basse |

### 8.1 CallTask (Appels de programmes)

### Table actuelle: `program_calls`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `CallTask/TaskID/@comp` | comp | - | IGNORE | - |
| `CallTask/TaskID/@obj` | obj | `callee_xml_id` | OK | - |
| `CallTask/OperationType/@val` | val | - | MANQUANT | Haute |
| `CallTask/Lock/@val` | val | - | MANQUANT | Haute |
| `CallTask/Wait/@val` | val | - | MANQUANT | Haute |
| `CallTask/RetainFocus/@val` | val | - | MANQUANT | Moyenne |
| `CallTask/SyncData/@val` | val | - | MANQUANT | Moyenne |
| `CallTask/Arguments/Argument` | - | - | MANQUANT | **HAUTE** |
| `Argument/@id` | id | - | MANQUANT | **HAUTE** |
| `Argument/Variable/@val` | val | - | MANQUANT | **HAUTE** |
| `Argument/Expression/@val` | val | - | MANQUANT | **HAUTE** |
| `Argument/Skip/@val` | val | - | MANQUANT | Haute |
| `Argument/Parent/@val` | val | - | MANQUANT | Moyenne |

### Modification table existante: `program_calls`

```sql
ALTER TABLE program_calls ADD COLUMN operation_type TEXT;
ALTER TABLE program_calls ADD COLUMN lock_mode TEXT;
ALTER TABLE program_calls ADD COLUMN wait_mode TEXT;
ALTER TABLE program_calls ADD COLUMN retain_focus INTEGER;
ALTER TABLE program_calls ADD COLUMN sync_data TEXT;
```

### Nouvelle table a creer: `call_arguments`

```sql
CREATE TABLE IF NOT EXISTS call_arguments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id INTEGER NOT NULL REFERENCES program_calls(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    variable_ref TEXT,           -- Variable reference {0,N} or {32768,N}
    expression_ref INTEGER,      -- Expression ID if using expression
    skip INTEGER DEFAULT 0,
    is_parent INTEGER DEFAULT 0,
    UNIQUE(call_id, position)
);
```

### 8.2 Select (Variables DataView)

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `Select/@FieldID` | FieldID | - | PARTIEL | Haute |
| `Select/@id` | id | - | MANQUANT | Haute |
| `Select/Column/@val` | val | - | MANQUANT | Haute |
| `Select/Type/@val` | val | - | MANQUANT | **HAUTE** |
| `Select/IsParameter/@val` | val | - | MANQUANT | **HAUTE** |
| `Select/ASS/@val` | val | - | MANQUANT | Haute |
| `Select/DIFF_UPDATE/@val` | val | - | MANQUANT | Moyenne |
| `Select/Locate/@MIN` | MIN | - | MANQUANT | **HAUTE** |
| `Select/Locate/@MAX` | MAX | - | MANQUANT | **HAUTE** |
| `Select/PartOfDataview/@val` | val | - | MANQUANT | Moyenne |
| `Select/REAL_VNAME_TXT/@val` | val | - | MANQUANT | Basse |
| `Select/_ControlIndex/@val` | val | - | MANQUANT | Basse |
| `Select/_FormIndex/@val` | val | - | MANQUANT | Basse |

### Nouvelle table a creer: `select_definitions`

```sql
CREATE TABLE IF NOT EXISTS select_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    logic_line_id INTEGER REFERENCES logic_lines(id),
    field_id INTEGER NOT NULL,
    select_id INTEGER,
    column_ref INTEGER,
    select_type TEXT,            -- V=Virtual, P=Parameter, R=Real
    is_parameter INTEGER DEFAULT 0,
    assignment_expr INTEGER,     -- ASS expression reference
    diff_update TEXT,
    locate_min_expr INTEGER,
    locate_max_expr INTEGER,
    part_of_dataview INTEGER DEFAULT 1,
    real_var_name TEXT,
    control_index INTEGER,
    form_index INTEGER
);
```

### 8.3 Update (Mises a jour)

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `Update/FieldID/@val` | val | - | MANQUANT | **HAUTE** |
| `Update/WithValue/@val` | val | - | MANQUANT | **HAUTE** |
| `Update/ForcedUpdate/@val` | val | - | MANQUANT | Haute |
| `Update/Incremental/@val` | val | - | MANQUANT | Haute |

### Nouvelle table a creer: `update_operations`

```sql
CREATE TABLE IF NOT EXISTS update_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    field_id INTEGER NOT NULL,
    with_value_expr INTEGER,     -- Expression reference
    forced_update INTEGER DEFAULT 0,
    incremental INTEGER DEFAULT 0
);
```

### 8.4 LNK (Liens vers tables)

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `LNK/@FlowIsn` | FlowIsn | - | MANQUANT | Basse |
| `LNK/@Direction` | Direction | - | MANQUANT | Moyenne |
| `LNK/@EVL_CND` | EVL_CND | - | MANQUANT | Moyenne |
| `LNK/@Key` | Key | - | MANQUANT | **HAUTE** |
| `LNK/@Mode` | Mode | - | MANQUANT | Haute |
| `LNK/@SortType` | SortType | - | MANQUANT | Moyenne |
| `LNK/@VIEW` | VIEW | - | MANQUANT | Moyenne |
| `LNK/@VIEWS` | VIEWS | - | MANQUANT | Basse |
| `LNK/@FieldID` | FieldID | - | MANQUANT | Haute |
| `LNK/DB/@comp` | comp | - | IGNORE | - |
| `LNK/DB/@obj` | obj | - | MANQUANT | **HAUTE** |
| `LNK/Condition/@val` | val | - | MANQUANT | Haute |
| `LNK/Expanded/@val` | val | - | MANQUANT | Basse |

### Nouvelle table a creer: `link_operations`

```sql
CREATE TABLE IF NOT EXISTS link_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    table_id INTEGER NOT NULL,
    key_index INTEGER,
    link_mode TEXT,              -- L=Link, Q=Query, etc.
    direction TEXT,
    sort_type TEXT,
    view_number INTEGER,
    field_id INTEGER,
    condition_expr INTEGER,
    is_expanded INTEGER DEFAULT 0
);
```

### 8.5 STP (Messages/Stops)

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `STP/@Mode` | Mode | - | MANQUANT | Haute |
| `STP/@Buttons` | Buttons | - | MANQUANT | Haute |
| `STP/@DefaultButton` | DefaultButton | - | MANQUANT | Moyenne |
| `STP/@TitleTxt` | TitleTxt | - | MANQUANT | Haute |
| `STP/@TXT` | TXT | - | MANQUANT | **HAUTE** |
| `STP/@Exp` | Exp | - | MANQUANT | **HAUTE** |
| `STP/@Image` | Image | - | MANQUANT | Basse |
| `STP/@VR_DISP` | VR_DISP | - | MANQUANT | Moyenne |
| `STP/RetValVar/@val` | val | - | MANQUANT | Haute |
| `STP/AppendToErrorLog/@val` | val | - | MANQUANT | Moyenne |

### Nouvelle table a creer: `stop_operations`

```sql
CREATE TABLE IF NOT EXISTS stop_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    mode TEXT,                   -- V=Verify, E=Error, W=Warning
    buttons TEXT,
    default_button INTEGER,
    title_text TEXT,
    message_text TEXT,           -- TXT
    message_expr INTEGER,        -- Exp
    image TEXT,
    display_var INTEGER,         -- VR_DISP
    return_var INTEGER,          -- RetValVar
    append_to_error_log INTEGER DEFAULT 0
);
```

### 8.6 RaiseEvent

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `RaiseEvent/Event/EventType/@val` | val | - | MANQUANT | Haute |
| `RaiseEvent/Event/InternalEventID/@val` | val | - | MANQUANT | Haute |
| `RaiseEvent/Event/PublicObject/@comp` | comp | - | MANQUANT | Moyenne |
| `RaiseEvent/Event/PublicObject/@obj` | obj | - | MANQUANT | Moyenne |
| `RaiseEvent/Wait/@val` | val | - | MANQUANT | Moyenne |

### Nouvelle table a creer: `raise_event_operations`

```sql
CREATE TABLE IF NOT EXISTS raise_event_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logic_line_id INTEGER NOT NULL REFERENCES logic_lines(id) ON DELETE CASCADE,
    event_type TEXT,
    internal_event_id INTEGER,
    public_object_comp TEXT,
    public_object_obj INTEGER,
    wait_mode TEXT
);
```

### 8.7 Remark (Commentaires)

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `Remark/Text/@val` | val | - | MANQUANT | Moyenne |
| `Remark/Type/@val` | val | - | MANQUANT | Basse |

Suggestion: Ajouter dans `logic_lines`:

```sql
ALTER TABLE logic_lines ADD COLUMN remark_text TEXT;
ALTER TABLE logic_lines ADD COLUMN remark_type TEXT;
```

---

## 9. EVENTS HANDLERS (EVNT)

### Element XML: `Task/EVNT`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `EVNT/@id` | id | - | MANQUANT | Haute |
| `EVNT/@DESC` | DESC | - | MANQUANT | Haute |
| `EVNT/@FORCE_EXIT` | FORCE_EXIT | - | MANQUANT | Moyenne |
| `EVNT/Event/EventType/@val` | val | - | MANQUANT | Haute |
| `EVNT/Event/PublicObject/@comp` | comp | - | MANQUANT | Moyenne |

### Nouvelle table a creer: `event_handlers`

```sql
CREATE TABLE IF NOT EXISTS event_handlers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL,
    description TEXT,
    force_exit TEXT,
    event_type TEXT,
    public_object_comp TEXT
);
```

---

## 10. FIELD RANGES (FLD_RNG)

### Element XML: `Task/FLD_RNG`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `FLD_RNG/id/@val` | val | - | MANQUANT | Haute |
| `FLD_RNG/MIN/@val` | val | - | MANQUANT | **HAUTE** |
| `FLD_RNG/MAX/@val` | val | - | MANQUANT | **HAUTE** |
| `FLD_RNG/_Column/@comp` | comp | - | IGNORE | - |
| `FLD_RNG/_Column/@obj` | obj | - | MANQUANT | Haute |

### Nouvelle table a creer: `field_ranges`

```sql
CREATE TABLE IF NOT EXISTS field_ranges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    range_id INTEGER NOT NULL,
    column_obj INTEGER,
    min_expr INTEGER,            -- Expression reference
    max_expr INTEGER,            -- Expression reference
    UNIQUE(task_id, range_id)
);
```

---

## 11. EXPRESSIONS

### Table actuelle: `expressions`

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| `Expression/@id` | id | `xml_id` | OK | - |
| `Expression/ExpSyntax/@val` | val | `content` | OK | - |
| `Expression/ExpAttribute/@val` | val | - | MANQUANT | Haute |

### Modification table existante: `expressions`

```sql
ALTER TABLE expressions ADD COLUMN attribute TEXT;  -- Expression attribute (type)
```

---

## 12. FORMULAIRES/ECRANS (Forms)

### Table actuelle: `task_forms`

Deja relativement complet. Elements a verifier:

| Element XML | Attribut | Colonne KB | Statut | Priorite |
|-------------|----------|------------|--------|----------|
| Form name | - | `name` | OK | - |
| Form width | - | `width` | OK | - |
| Form height | - | `height` | OK | - |
| WindowType | - | `window_type` | OK | - |
| Font | - | `font` | OK | - |
| X position | - | - | MANQUANT | Moyenne |
| Y position | - | - | MANQUANT | Moyenne |
| Controls | - | - | MANQUANT | **HAUTE** |

### Nouvelle table a creer: `form_controls`

```sql
CREATE TABLE IF NOT EXISTS form_controls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    form_id INTEGER NOT NULL REFERENCES task_forms(id) ON DELETE CASCADE,
    control_id INTEGER NOT NULL,
    control_type TEXT,           -- Edit, Button, Table, Label, etc.
    name TEXT,
    x INTEGER,
    y INTEGER,
    width INTEGER,
    height INTEGER,
    visible INTEGER DEFAULT 1,
    enabled INTEGER DEFAULT 1,
    tab_order INTEGER,
    linked_field_id INTEGER,     -- Link to dataview column
    properties TEXT              -- JSON for additional properties
);
```

---

## RESUME DES MODIFICATIONS

### Nouvelles tables a creer (11)

1. `program_metadata` - Metadata programme (LastModified, ExecutionRight, etc.)
2. `task_parameters` - Types des parametres (MgAttr)
3. `task_information` - Info tache (InitialMode, EndTaskCondition, etc.)
4. `task_permissions` - Permissions SIDE_WIN
5. `call_arguments` - Arguments des CallTask
6. `select_definitions` - Definitions Select (variables, locate, range)
7. `update_operations` - Operations Update
8. `link_operations` - Operations LNK (liens tables)
9. `stop_operations` - Operations STP (messages)
10. `raise_event_operations` - Operations RaiseEvent
11. `event_handlers` - Handlers d'events
12. `field_ranges` - Ranges de champs
13. `form_controls` - Controles des formulaires

### Tables existantes a modifier (5)

1. `table_usage` - Ajouter share_mode, open_mode, cache_mode
2. `dataview_columns` - Ajouter stored_as, size, null_value, decimal_places, etc.
3. `tasks` - Ajouter transaction_mode, locking_strategy, etc.
4. `program_calls` - Ajouter operation_type, lock_mode, wait_mode, etc.
5. `logic_lines` - Ajouter remark_text, remark_type
6. `expressions` - Ajouter attribute

---

## PRIORITES D'IMPLEMENTATION

### Phase 1 - CRITIQUE (pour migration)

1. `task_parameters` (MgAttr) - Types des parametres
2. `call_arguments` - Arguments des CallTask
3. `select_definitions` - Definitions Select avec Locate/Range
4. `update_operations` - Updates avec FieldID et WithValue
5. Colonnes `dataview_columns` (_Dec, _Whole)

### Phase 2 - HAUTE (pour analyse complete)

1. `link_operations` - Liens vers tables avec Key
2. `stop_operations` - Messages STP
3. `task_information` - InitialMode, EndTaskCondition
4. Colonnes `table_usage` (share, cache)
5. Colonnes `program_calls` (lock, wait)

### Phase 3 - MOYENNE (pour documentation)

1. `program_metadata` - LastModified, etc.
2. `task_permissions` - SIDE_WIN
3. `event_handlers` - EVNT
4. `field_ranges` - FLD_RNG
5. `form_controls` - Controles UI

---

*Document genere le 2026-01-28*
