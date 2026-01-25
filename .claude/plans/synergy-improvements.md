# Plan Synergie Outils Magic - Tiers 2 & 3

> Stocké pour implémentation future après Tier 1
> Date: 2026-01-25
> Contexte: Analyse APEX complète de l'écosystème

---

## ANALYSE COMPLÈTE (Résumé Exécutif)

### État actuel: 40% synergie

| Aspect | Score | Gap Principal |
|--------|-------|---------------|
| Navigation code | 95% | Aucun |
| Extraction données | 90% | Aucun |
| Call graphs | 90% | Aucun |
| Décodage expressions | 85% | Offset cross-project non validé |
| Pattern matching | 25% | Pas intégré KB, scoring naïf |
| Feedback loop | 0% | ticket_metrics ↔ patterns jamais liés |
| Variable lineage | 10% | "D'où vient cette valeur?" impossible |
| Shared components | 20% | ECF dependencies invisibles |
| Change impact | 15% | "Si je modifie X, quoi casse?" impossible |

### Perte de connaissance par étape

| Étape | Perte |
|-------|-------|
| Jira → Extraction contexte | 50% (programmes sans IDE) |
| Expressions → Variables | 67% ({N,Y} jamais décodées) |
| Solution → Pattern KB | 66% (jamais capitalisée) |
| Pattern → Futur ticket | 80% (KB ignorée) |

---

## TIER 2: Pattern Search MCP (3h)

### Problème
- Patterns stockés en Markdown (.openspec/patterns/*.md)
- Index JSON local (patterns/index.json)
- Matching = scoring texte simple (keywords)
- Table `resolution_patterns` existe mais VIDE

### Solution

#### 2.1 Créer MCP tool: magic_pattern_search

```csharp
// tools/MagicMcp/Tools/PatternSearchTool.cs

[McpServerTool(Name = "magic_pattern_search")]
[Description("Search resolution patterns by symptom and keywords. Returns ranked matches.")]
public static string SearchPatterns(
    KnowledgeDb db,
    [Description("Symptom description")] string symptom,
    [Description("Keywords to match (comma-separated)")] string keywords)
{
    // 1. FTS5 search on resolution_patterns
    // 2. Score by: symptom_match + keyword_overlap + usage_count
    // 3. Return top 5 with scores
}
```

#### 2.2 Créer sync-patterns-to-kb.ps1

```powershell
# tools/ticket-pipeline/sync-patterns-to-kb.ps1
# Parse .openspec/patterns/*.md → INSERT resolution_patterns

foreach ($file in Get-ChildItem ".openspec/patterns/*.md") {
    # Extract: pattern_name, symptom_keywords, root_cause_type, solution_template
    # INSERT OR REPLACE INTO resolution_patterns
}
```

### Fichiers à créer
- `tools/MagicMcp/Tools/PatternSearchTool.cs`
- `tools/ticket-pipeline/sync-patterns-to-kb.ps1`

### Tests
- Sync 5 patterns existants → vérifier count en DB
- Search "date incorrecte" → doit retourner date-format-inversion.md
- Search "calcul prix" → doit retourner picture-format-mismatch.md

---

## TIER 3: Variable Lineage (4h)

### Problème
- "Variable QQ = 41.857 au lieu de 5.40 - d'où vient QQ?"
- Aucune trace des modifications de variables
- Debug = lecture manuelle de toutes les lignes

### Solution

#### 3.1 Nouvelle table variable_modifications

```sql
-- tools/MagicKnowledgeBase/Database/Schema.sql

CREATE TABLE IF NOT EXISTS variable_modifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT NOT NULL,
    program_id INTEGER NOT NULL,
    task_isn2 INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    variable_name TEXT NOT NULL,
    operation TEXT,  -- assign, increment, update, reset
    source_type TEXT,  -- expression, table_column, parameter, constant
    source_expression_id INTEGER,
    source_table_id INTEGER,
    source_column_name TEXT,
    source_description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project, program_id, task_isn2, line_number, variable_name)
);

CREATE INDEX idx_var_mod_project ON variable_modifications(project);
CREATE INDEX idx_var_mod_program ON variable_modifications(project, program_id);
CREATE INDEX idx_var_mod_variable ON variable_modifications(variable_name);
```

#### 3.2 Enrichir BatchIndexer

```csharp
// tools/MagicKnowledgeBase/Indexing/BatchIndexer.cs

// Dans IndexLogicLines(), ajouter:
private void ExtractVariableModifications(LogicLine line, int taskIsn2)
{
    // Parser operation "Update", "Assign", "Increment"
    // Extraire variable target depuis parameters
    // Identifier source (expression, table column, etc.)
    // INSERT INTO variable_modifications
}
```

#### 3.3 Créer MCP tool: magic_variable_lineage

```csharp
// tools/MagicMcp/Tools/VariableLineageTool.cs

[McpServerTool(Name = "magic_variable_lineage")]
[Description("Trace all modifications of a variable across a program.")]
public static string TraceVariableLineage(
    KnowledgeDb db,
    [Description("Project name")] string project,
    [Description("Program ID")] int programId,
    [Description("Variable name to trace")] string variableName)
{
    // SELECT * FROM variable_modifications
    // WHERE project = @project AND program_id = @programId
    //   AND variable_name LIKE @variableName
    // ORDER BY task_isn2, line_number

    // Return: Table of all modifications with source info
}
```

### Fichiers à modifier/créer
- `tools/MagicKnowledgeBase/Database/Schema.sql` (ajouter table)
- `tools/MagicKnowledgeBase/Indexing/BatchIndexer.cs` (enrichir)
- `tools/MagicMcp/Tools/VariableLineageTool.cs` (créer)
- `tools/MagicKnowledgeBase/Database/KnowledgeDb.cs` (méthodes CRUD)

### Tests
- Reindex projet ADH → vérifier variable_modifications non vide
- magic_variable_lineage("ADH", 121, "SOLDE") → liste modifications
- Vérifier source_type correct (expression vs table_column)

---

## TIER FUTUR: Améliorations additionnelles

### 4. ECF Shared Components Registry

```sql
CREATE TABLE shared_components (
    id INTEGER PRIMARY KEY,
    ecf_name TEXT NOT NULL,  -- "ADH.ecf", "REF.ecf"
    program_id INTEGER NOT NULL,
    program_public_name TEXT,
    used_by_projects TEXT,  -- JSON array ["PBP", "PVE"]
    UNIQUE(ecf_name, program_id)
);
```

### 5. Change Impact Analysis

```sql
CREATE TABLE change_impacts (
    id INTEGER PRIMARY KEY,
    source_project TEXT NOT NULL,
    source_program_id INTEGER NOT NULL,
    source_element TEXT,  -- "expression:30", "variable:SOLDE"
    affected_project TEXT NOT NULL,
    affected_program_id INTEGER NOT NULL,
    impact_type TEXT,  -- "calls", "reads", "inherits"
    severity TEXT  -- "high", "medium", "low"
);
```

### 6. Execution Order Tracking

```sql
CREATE TABLE handler_execution_order (
    id INTEGER PRIMARY KEY,
    task_id INTEGER NOT NULL,
    handler_type TEXT NOT NULL,  -- "TaskPrefix", "RecordPrefix", "ControlChange"
    execution_sequence INTEGER,
    parent_handler_id INTEGER,
    UNIQUE(task_id, handler_type)
);
```

---

## METRICS CIBLES

| Metric | Avant | Après Tier 1 | Après Tier 2 | Après Tier 3 |
|--------|-------|--------------|--------------|--------------|
| Synergie globale | 40% | 55% | 65% | 75% |
| Feedback loop | 0% | 80% | 80% | 80% |
| Pattern matching | 25% | 25% | 70% | 70% |
| Variable tracing | 10% | 10% | 10% | 60% |
| Temps analyse bug | 45min | 35min | 25min | 15min |

---

## COMMANDES POUR REPRENDRE

```bash
# Implémenter Tier 2
# Lire ce fichier, section TIER 2
# /apex pour chaque sous-tâche

# Implémenter Tier 3
# Lire ce fichier, section TIER 3
# /apex pour chaque sous-tâche
```

---

*Plan créé: 2026-01-25*
*Status: Tier 1 en cours, Tiers 2-3 en attente*
