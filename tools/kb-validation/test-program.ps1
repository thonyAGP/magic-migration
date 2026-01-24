# Test complet d'un programme depuis la Knowledge Base
# Usage: .\test-program.ps1 -Project ADH -IdePosition 69

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$DbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"
)

$ErrorActionPreference = "Stop"

# Check if DB exists
if (-not (Test-Path $DbPath)) {
    Write-Error "Knowledge Base not found at: $DbPath"
    exit 1
}

# Load SQLite assembly
Add-Type -Path "$env:USERPROFILE\.nuget\packages\microsoft.data.sqlite.core\8.0.11\lib\net8.0\Microsoft.Data.Sqlite.dll"

function Invoke-SqlQuery {
    param($Query, $Parameters = @{})

    $conn = New-Object Microsoft.Data.Sqlite.SqliteConnection("Data Source=$DbPath")
    $conn.Open()

    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $Query

    foreach ($key in $Parameters.Keys) {
        $param = $cmd.CreateParameter()
        $param.ParameterName = $key
        $param.Value = $Parameters[$key]
        $cmd.Parameters.Add($param) | Out-Null
    }

    $reader = $cmd.ExecuteReader()
    $results = @()

    while ($reader.Read()) {
        $row = @{}
        for ($i = 0; $i -lt $reader.FieldCount; $i++) {
            $row[$reader.GetName($i)] = if ($reader.IsDBNull($i)) { $null } else { $reader.GetValue($i) }
        }
        $results += [PSCustomObject]$row
    }

    $conn.Close()
    return $results
}

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  VALIDATION PARSER - $Project IDE $IdePosition" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# 1. Programme Info
Write-Host "### 1. INFORMATIONS PROGRAMME ###" -ForegroundColor Yellow
$program = Invoke-SqlQuery @"
SELECT p.*, pr.name as project_name
FROM programs p
JOIN projects pr ON p.project_id = pr.id
WHERE pr.name = @project AND p.ide_position = @ide
"@ -Parameters @{ "@project" = $Project; "@ide" = $IdePosition }

if (-not $program) {
    Write-Error "Programme non trouvé: $Project IDE $IdePosition"
    exit 1
}

Write-Host "  Nom:           $($program.name)"
Write-Host "  Nom Public:    $($program.public_name)"
Write-Host "  XML ID:        $($program.xml_id)"
Write-Host "  IDE Position:  $($program.ide_position)"
Write-Host "  Nb Tâches:     $($program.task_count)"
Write-Host "  Nb Expressions: $($program.expression_count)"
Write-Host ""

# 2. Expressions
Write-Host "### 2. EXPRESSIONS ###" -ForegroundColor Yellow
$expressions = Invoke-SqlQuery @"
SELECT * FROM expressions
WHERE program_id = @pid
ORDER BY ide_position
"@ -Parameters @{ "@pid" = $program.id }

if ($expressions.Count -eq 0) {
    Write-Host "  [ERREUR] Aucune expression trouvée!" -ForegroundColor Red
    Write-Host "  Attendu: $($program.expression_count) expressions" -ForegroundColor Red
} else {
    Write-Host "  Total: $($expressions.Count) expressions" -ForegroundColor Green
    Write-Host ""
    Write-Host "  | IDE | XML ID | Contenu (50 premiers car.) | Commentaire |"
    Write-Host "  |-----|--------|---------------------------|-------------|"
    foreach ($expr in $expressions | Select-Object -First 20) {
        $content = if ($expr.content.Length -gt 50) { $expr.content.Substring(0, 47) + "..." } else { $expr.content }
        $comment = if ($expr.comment) { $expr.comment.Substring(0, [Math]::Min(20, $expr.comment.Length)) } else { "" }
        Write-Host "  | $($expr.ide_position.ToString().PadLeft(3)) | $($expr.xml_id.ToString().PadLeft(6)) | $($content.PadRight(25)) | $comment |"
    }
    if ($expressions.Count -gt 20) {
        Write-Host "  | ... | ... | ... ($($expressions.Count - 20) de plus) | ... |"
    }
}
Write-Host ""

# 3. Tâches
Write-Host "### 3. TÂCHES ###" -ForegroundColor Yellow
$tasks = Invoke-SqlQuery @"
SELECT * FROM tasks
WHERE program_id = @pid
ORDER BY ide_position
"@ -Parameters @{ "@pid" = $program.id }

Write-Host "  Total: $($tasks.Count) tâches"
Write-Host ""
Write-Host "  | IDE | ISN2 | Description | Type | Colonnes | Lignes Logic |"
Write-Host "  |-----|------|-------------|------|----------|--------------|"
foreach ($task in $tasks | Select-Object -First 15) {
    $desc = if ($task.description) { $task.description.Substring(0, [Math]::Min(20, $task.description.Length)) } else { "(vide)" }
    Write-Host "  | $($task.ide_position.ToString().PadLeft(3)) | $($task.isn2.ToString().PadLeft(4)) | $($desc.PadRight(11)) | $($task.task_type.PadRight(4)) | $($task.column_count.ToString().PadLeft(8)) | $($task.logic_line_count.ToString().PadLeft(12)) |"
}
if ($tasks.Count -gt 15) {
    Write-Host "  | ... | ... | ... ($($tasks.Count - 15) de plus) | ... | ... | ... |"
}
Write-Host ""

# 4. Variables/Colonnes (première tâche)
Write-Host "### 4. VARIABLES/COLONNES (Tâche 1) ###" -ForegroundColor Yellow
$firstTask = $tasks | Select-Object -First 1
if ($firstTask) {
    $columns = Invoke-SqlQuery @"
SELECT * FROM dataview_columns
WHERE task_id = @tid
ORDER BY line_number
"@ -Parameters @{ "@tid" = $firstTask.id }

    Write-Host "  Tâche IDE $($firstTask.ide_position) - $($columns.Count) colonnes"
    Write-Host ""
    Write-Host "  | Ligne | Var | Nom | Type | Def | Source |"
    Write-Host "  |-------|-----|-----|------|-----|--------|"
    foreach ($col in $columns | Select-Object -First 20) {
        $name = if ($col.name) { $col.name.Substring(0, [Math]::Min(15, $col.name.Length)) } else { "" }
        $source = if ($col.source) { $col.source.Substring(0, [Math]::Min(10, $col.source.Length)) } else { "" }
        Write-Host "  | $($col.line_number.ToString().PadLeft(5)) | $($col.variable.PadRight(3)) | $($name.PadRight(3)) | $($col.data_type.PadRight(4)) | $($col.definition.PadRight(3)) | $source |"
    }
    if ($columns.Count -gt 20) {
        Write-Host "  | ... | ... | ... ($($columns.Count - 20) de plus) | ... | ... | ... |"
    }
}
Write-Host ""

# 5. Table Usage
Write-Host "### 5. USAGE TABLES ###" -ForegroundColor Yellow
$tableUsage = Invoke-SqlQuery @"
SELECT tu.*, t.ide_position as task_ide
FROM table_usage tu
JOIN tasks t ON tu.task_id = t.id
WHERE t.program_id = @pid
ORDER BY t.ide_position, tu.usage_type
"@ -Parameters @{ "@pid" = $program.id }

if ($tableUsage.Count -eq 0) {
    Write-Host "  [INFO] Aucun usage de table trouvé" -ForegroundColor DarkGray
} else {
    Write-Host "  Total: $($tableUsage.Count) usages"
    Write-Host ""
    Write-Host "  | Tâche | Type | Table ID | Nom Table | Link # |"
    Write-Host "  |-------|------|----------|-----------|--------|"
    foreach ($usage in $tableUsage | Select-Object -First 15) {
        $linkNum = if ($usage.link_number) { $usage.link_number } else { "-" }
        Write-Host "  | $($usage.task_ide.ToString().PadLeft(5)) | $($usage.usage_type.PadRight(4)) | $($usage.table_id.ToString().PadLeft(8)) | $($usage.table_name.PadRight(9)) | $($linkNum.ToString().PadLeft(6)) |"
    }
}
Write-Host ""

# 6. Appels Programme
Write-Host "### 6. APPELS PROGRAMMES ###" -ForegroundColor Yellow
$programCalls = Invoke-SqlQuery @"
SELECT pc.*, t.ide_position as task_ide
FROM program_calls pc
JOIN tasks t ON pc.caller_task_id = t.id
WHERE t.program_id = @pid
ORDER BY t.ide_position, pc.caller_line_number
"@ -Parameters @{ "@pid" = $program.id }

if ($programCalls.Count -eq 0) {
    Write-Host "  [ERREUR] Aucun appel programme trouvé!" -ForegroundColor Red
} else {
    Write-Host "  Total: $($programCalls.Count) appels" -ForegroundColor Green
    Write-Host ""
    Write-Host "  | Tâche | Ligne | Projet Cible | XML ID | Args | Résolu |"
    Write-Host "  |-------|-------|--------------|--------|------|--------|"
    foreach ($call in $programCalls | Select-Object -First 15) {
        $resolved = if ($call.callee_program_id) { "Oui" } else { "Non" }
        Write-Host "  | $($call.task_ide.ToString().PadLeft(5)) | $($call.caller_line_number.ToString().PadLeft(5)) | $($call.callee_project_name.PadRight(12)) | $($call.callee_xml_id.ToString().PadLeft(6)) | $($call.arg_count.ToString().PadLeft(4)) | $resolved |"
    }
}
Write-Host ""

# 7. Logique (première tâche, premiers handlers)
Write-Host "### 7. LIGNES LOGIQUE (Tâche 1) ###" -ForegroundColor Yellow
if ($firstTask) {
    $logicLines = Invoke-SqlQuery @"
SELECT * FROM logic_lines
WHERE task_id = @tid
ORDER BY handler, line_number
"@ -Parameters @{ "@tid" = $firstTask.id }

    $byHandler = $logicLines | Group-Object -Property handler
    Write-Host "  Tâche IDE $($firstTask.ide_position) - $($logicLines.Count) lignes totales"
    Write-Host ""

    foreach ($group in $byHandler | Select-Object -First 3) {
        Write-Host "  Handler: $($group.Name) ($($group.Count) lignes)" -ForegroundColor Cyan
        Write-Host "  | Ligne | Opération | Condition | Disabled |"
        Write-Host "  |-------|-----------|-----------|----------|"
        foreach ($line in $group.Group | Select-Object -First 5) {
            $cond = if ($line.condition_expr) { $line.condition_expr.Substring(0, [Math]::Min(15, $line.condition_expr.Length)) } else { "" }
            $disabled = if ($line.is_disabled) { "Oui" } else { "" }
            Write-Host "  | $($line.line_number.ToString().PadLeft(5)) | $($line.operation.PadRight(9)) | $($cond.PadRight(9)) | $disabled |"
        }
        if ($group.Count -gt 5) {
            Write-Host "  | ... | ... ($($group.Count - 5) de plus) | ... | ... |"
        }
        Write-Host ""
    }
}

# Résumé
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  RÉSUMÉ VALIDATION" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$issues = @()
if ($expressions.Count -eq 0 -and $program.expression_count -gt 0) {
    $issues += "Expressions: 0 trouvées (attendu: $($program.expression_count))"
}
if ($programCalls.Count -eq 0) {
    $issues += "Appels programmes: 0 trouvés"
}
if ($tableUsage.Count -eq 0 -and $tasks.Count -gt 0) {
    $issues += "Usage tables: 0 trouvé"
}

if ($issues.Count -eq 0) {
    Write-Host "  [OK] Tous les éléments sont présents" -ForegroundColor Green
} else {
    Write-Host "  [PROBLÈMES DÉTECTÉS]" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "    - $issue" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Pour comparer avec l'IDE Magic, fournir captures d'écran de:"
Write-Host "  1. Onglet Programme (nom, propriétés)"
Write-Host "  2. Liste Expressions"
Write-Host "  3. DataView tâche 1"
Write-Host "  4. Logic tâche 1"
Write-Host "  5. Links si applicable"
