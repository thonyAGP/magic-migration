# Generate-MigrationSpec.ps1
# Generates migration specification documents for Magic projects
# Usage: .\Generate-MigrationSpec.ps1 -Project ADH [-OutputDir migration-specs]

param(
    [Parameter(Mandatory=$false)]
    [string]$Project,

    [string]$OutputDir = "migration-specs",

    [switch]$All,

    [switch]$Summary
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplatePath = Join-Path $ScriptDir "templates\spec-template.md"
$KbPath = Join-Path $env:USERPROFILE ".magic-kb\knowledge.db"

# ============================================================================
# SQL QUERIES
# ============================================================================

function Query-Sql {
    param(
        [string]$KbPath,
        [string]$Sql,
        [switch]$Header
    )

    $HeaderArg = if ($Header) { "-header" } else { "" }
    $Result = & sqlite3 -separator "|" $HeaderArg $KbPath $Sql 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "SQLite error: $Result"
    }
    return $Result
}

function Get-ProjectStats {
    param([string]$Project)

    $Sql = @"
SELECT
    proj.program_count,
    proj.main_offset,
    COALESCE(SUM(p.task_count), 0) as total_tasks,
    COALESCE(SUM(p.expression_count), 0) as total_expressions,
    COALESCE(AVG(p.task_count * p.expression_count), 0) as avg_complexity
FROM projects proj
LEFT JOIN programs p ON proj.id = p.project_id
WHERE proj.name = '$Project'
GROUP BY proj.id;
"@

    $Result = Query-Sql -KbPath $KbPath -Sql $Sql
    if ($Result) {
        $Parts = $Result -split '\|'
        return @{
            ProgramCount = [int]$Parts[0]
            MainOffset = [int]$Parts[1]
            TaskCount = [int]$Parts[2]
            ExpressionCount = [int]$Parts[3]
            AvgComplexity = [math]::Round([double]$Parts[4], 1)
        }
    }
    return $null
}

function Get-ProgramInventory {
    param([string]$Project)

    $Sql = @"
SELECT
    p.ide_position,
    p.name,
    COALESCE(p.public_name, '-'),
    p.task_count,
    p.expression_count,
    (p.task_count * p.expression_count) as complexity
FROM programs p
JOIN projects proj ON p.project_id = proj.id
WHERE proj.name = '$Project'
ORDER BY complexity DESC;
"@

    return Query-Sql -KbPath $KbPath -Sql $Sql
}

function Get-TableInventory {
    param([string]$Project)

    $Sql = @"
SELECT DISTINCT
    tu.table_id,
    COALESCE(tu.table_name, 'Table_' || tu.table_id),
    tu.usage_type,
    COUNT(DISTINCT t.program_id) as used_by
FROM table_usage tu
JOIN tasks t ON tu.task_id = t.id
JOIN programs p ON t.program_id = p.id
JOIN projects proj ON p.project_id = proj.id
WHERE proj.name = '$Project'
GROUP BY tu.table_id, tu.table_name, tu.usage_type
ORDER BY used_by DESC, tu.table_name;
"@

    return Query-Sql -KbPath $KbPath -Sql $Sql
}

function Get-IncomingCalls {
    param([string]$Project)

    $Sql = @"
SELECT DISTINCT
    caller_proj.name,
    caller_p.ide_position,
    caller_p.name,
    callee_p.ide_position,
    callee_p.name
FROM program_calls pc
JOIN tasks t ON pc.caller_task_id = t.id
JOIN programs caller_p ON t.program_id = caller_p.id
JOIN projects caller_proj ON caller_p.project_id = caller_proj.id
JOIN programs callee_p ON pc.callee_program_id = callee_p.id
JOIN projects callee_proj ON callee_p.project_id = callee_proj.id
WHERE callee_proj.name = '$Project'
  AND caller_proj.name != '$Project'
ORDER BY caller_proj.name, caller_p.ide_position;
"@

    return Query-Sql -KbPath $KbPath -Sql $Sql
}

function Get-OutgoingCalls {
    param([string]$Project)

    $Sql = @"
SELECT DISTINCT
    caller_p.ide_position,
    caller_p.name,
    pc.callee_project_name,
    pc.callee_xml_id
FROM program_calls pc
JOIN tasks t ON pc.caller_task_id = t.id
JOIN programs caller_p ON t.program_id = caller_p.id
JOIN projects caller_proj ON caller_p.project_id = caller_proj.id
WHERE caller_proj.name = '$Project'
  AND pc.callee_project_name IS NOT NULL
  AND pc.callee_project_name != '$Project'
ORDER BY pc.callee_project_name, pc.callee_xml_id;
"@

    return Query-Sql -KbPath $KbPath -Sql $Sql
}

function Get-FormInventory {
    param([string]$Project)

    $Sql = @"
SELECT
    p.ide_position,
    p.name,
    tf.form_name,
    tf.window_type,
    tf.width || 'x' || tf.height
FROM task_forms tf
JOIN tasks t ON tf.task_id = t.id
JOIN programs p ON t.program_id = p.id
JOIN projects proj ON p.project_id = proj.id
WHERE proj.name = '$Project'
  AND tf.form_name IS NOT NULL
ORDER BY p.ide_position, tf.form_name;
"@

    return Query-Sql -KbPath $KbPath -Sql $Sql
}

function Get-AllProjects {
    $Sql = "SELECT name FROM projects ORDER BY name;"
    return Query-Sql -KbPath $KbPath -Sql $Sql
}

# ============================================================================
# GENERATION
# ============================================================================

function Generate-ProjectSpec {
    param([string]$Project)

    Write-Host "=== Generating Migration Spec for $Project ===" -ForegroundColor Cyan

    $ProjectDir = Join-Path $OutputDir $Project
    if (-not (Test-Path $ProjectDir)) {
        New-Item -ItemType Directory -Path $ProjectDir -Force | Out-Null
    }

    # Get data
    Write-Host "  [1/6] Loading project stats..." -ForegroundColor Gray
    $Stats = Get-ProjectStats -Project $Project
    if (-not $Stats) {
        Write-Error "Project $Project not found in Knowledge Base"
        return
    }

    Write-Host "  [2/6] Loading program inventory..." -ForegroundColor Gray
    $Programs = Get-ProgramInventory -Project $Project

    Write-Host "  [3/6] Loading table inventory..." -ForegroundColor Gray
    $Tables = Get-TableInventory -Project $Project

    Write-Host "  [4/6] Loading dependencies..." -ForegroundColor Gray
    $Incoming = Get-IncomingCalls -Project $Project
    $Outgoing = Get-OutgoingCalls -Project $Project

    Write-Host "  [5/6] Loading forms..." -ForegroundColor Gray
    $Forms = Get-FormInventory -Project $Project

    # Build programs table
    $ProgramsTable = ""
    $HighComplexity = 0
    $MediumComplexity = 0
    $LowComplexity = 0

    foreach ($Line in $Programs) {
        if ($Line) {
            $Parts = $Line -split '\|'
            $Complexity = [int]$Parts[5]

            if ($Complexity -gt 1000) { $HighComplexity++ }
            elseif ($Complexity -gt 100) { $MediumComplexity++ }
            else { $LowComplexity++ }

            $ProgramsTable += "| $($Parts[0]) | $($Parts[1]) | $($Parts[2]) | $($Parts[3]) | $($Parts[4]) | $Complexity |`n"
        }
    }

    # Build tables table
    $TablesTable = ""
    $ReadTables = 0
    $WriteTables = 0
    $LinkTables = 0

    foreach ($Line in $Tables) {
        if ($Line) {
            $Parts = $Line -split '\|'
            $UsageType = $Parts[2]

            switch ($UsageType) {
                "R" { $ReadTables++ }
                "W" { $WriteTables++ }
                "L" { $LinkTables++ }
            }

            $TablesTable += "| $($Parts[0]) | $($Parts[1]) | $($Parts[2]) | $($Parts[3]) |`n"
        }
    }

    # Build incoming calls
    $IncomingText = ""
    if ($Incoming) {
        $IncomingText = "| Projet | IDE | Programme | Appelle IDE | Programme cible |`n|--------|-----|-----------|-------------|-----------------|`n"
        foreach ($Line in $Incoming) {
            if ($Line) {
                $Parts = $Line -split '\|'
                $IncomingText += "| $($Parts[0]) | $($Parts[1]) | $($Parts[2]) | $($Parts[3]) | $($Parts[4]) |`n"
            }
        }
    } else {
        $IncomingText = "*Aucun appel entrant détecté.*"
    }

    # Build outgoing calls
    $OutgoingText = ""
    if ($Outgoing) {
        $OutgoingText = "| IDE | Programme | Projet cible | XML ID cible |`n|-----|-----------|--------------|--------------|`n"
        foreach ($Line in $Outgoing) {
            if ($Line) {
                $Parts = $Line -split '\|'
                $OutgoingText += "| $($Parts[0]) | $($Parts[1]) | $($Parts[2]) | $($Parts[3]) |`n"
            }
        }
    } else {
        $OutgoingText = "*Aucun appel sortant détecté.*"
    }

    # Build forms table
    $FormsTable = ""
    $FormCount = 0
    $MdiCount = 0
    $ModalCount = 0

    foreach ($Line in $Forms) {
        if ($Line) {
            $Parts = $Line -split '\|'
            $FormCount++
            $WindowType = $Parts[3]
            if ($WindowType -eq "2") { $MdiCount++ }
            elseif ($WindowType -eq "1") { $ModalCount++ }

            $FormsTable += "| $($Parts[1]) | $($Parts[0]) | $($Parts[2]) | $($Parts[3]) | $($Parts[4]) |`n"
        }
    }

    # Read template
    Write-Host "  [6/6] Generating spec.md..." -ForegroundColor Gray
    $Template = Get-Content $TemplatePath -Raw

    # Replace placeholders
    $Spec = $Template `
        -replace '\{PROJECT\}', $Project `
        -replace '\{DATE\}', (Get-Date).ToString("yyyy-MM-dd HH:mm") `
        -replace '\{PROGRAM_COUNT\}', $Stats.ProgramCount `
        -replace '\{TASK_COUNT\}', $Stats.TaskCount `
        -replace '\{EXPRESSION_COUNT\}', $Stats.ExpressionCount `
        -replace '\{AVG_COMPLEXITY\}', $Stats.AvgComplexity `
        -replace '\{MAIN_OFFSET\}', $Stats.MainOffset `
        -replace '\{HIGH_COMPLEXITY_COUNT\}', $HighComplexity `
        -replace '\{MEDIUM_COMPLEXITY_COUNT\}', $MediumComplexity `
        -replace '\{LOW_COMPLEXITY_COUNT\}', $LowComplexity `
        -replace '\{PROGRAMS_TABLE\}', $ProgramsTable.TrimEnd() `
        -replace '\{TABLES_TABLE\}', $TablesTable.TrimEnd() `
        -replace '\{READ_TABLES\}', $ReadTables `
        -replace '\{WRITE_TABLES\}', $WriteTables `
        -replace '\{LINK_TABLES\}', $LinkTables `
        -replace '\{INCOMING_CALLS\}', $IncomingText `
        -replace '\{OUTGOING_CALLS\}', $OutgoingText `
        -replace '\{DEPENDENCY_MATRIX\}', "See dependencies.json" `
        -replace '\{FORMS_TABLE\}', $FormsTable.TrimEnd() `
        -replace '\{FORM_COUNT\}', $FormCount `
        -replace '\{MDI_COUNT\}', $MdiCount `
        -replace '\{MODAL_COUNT\}', $ModalCount `
        -replace '\{ECF_USAGE\}', "*À analyser manuellement.*" `
        -replace '\{HIGH_RISK_PROGRAMS\}', "$HighComplexity programmes" `
        -replace '\{CROSS_DEP_PROGRAMS\}', "$(($Incoming | Measure-Object).Count + ($Outgoing | Measure-Object).Count) dépendances" `
        -replace '\{LOW_EFFORT\}', "~$(($LowComplexity * 0.5)) jours" `
        -replace '\{MEDIUM_EFFORT\}', "~$(($MediumComplexity * 2)) jours" `
        -replace '\{HIGH_EFFORT\}', "~$(($HighComplexity * 5)) jours" `
        -replace '\{TOTAL_EFFORT\}', "~$([math]::Round($LowComplexity * 0.5 + $MediumComplexity * 2 + $HighComplexity * 5)) jours"

    # Save spec
    $SpecPath = Join-Path $ProjectDir "spec.md"
    $Spec | Set-Content $SpecPath -Encoding UTF8

    # Save CSVs
    $ProgramsCsv = Join-Path $ProjectDir "programs.csv"
    "IDE|Name|PublicName|Tasks|Expressions|Complexity" | Set-Content $ProgramsCsv
    $Programs | Add-Content $ProgramsCsv

    $TablesCsv = Join-Path $ProjectDir "tables.csv"
    "TableId|TableName|UsageType|UsedByPrograms" | Set-Content $TablesCsv
    $Tables | Add-Content $TablesCsv

    # Save dependencies JSON
    $DepsJson = @{
        Project = $Project
        Incoming = @($Incoming | ForEach-Object {
            if ($_) {
                $Parts = $_ -split '\|'
                @{ CallerProject = $Parts[0]; CallerIde = $Parts[1]; CallerName = $Parts[2]; CalleeIde = $Parts[3]; CalleeName = $Parts[4] }
            }
        })
        Outgoing = @($Outgoing | ForEach-Object {
            if ($_) {
                $Parts = $_ -split '\|'
                @{ CallerIde = $Parts[0]; CallerName = $Parts[1]; CalleeProject = $Parts[2]; CalleeXmlId = $Parts[3] }
            }
        })
    }
    $DepsPath = Join-Path $ProjectDir "dependencies.json"
    $DepsJson | ConvertTo-Json -Depth 5 | Set-Content $DepsPath -Encoding UTF8

    # Save complexity JSON
    $ComplexityJson = @{
        Project = $Project
        Stats = $Stats
        Distribution = @{
            High = $HighComplexity
            Medium = $MediumComplexity
            Low = $LowComplexity
        }
    }
    $ComplexityPath = Join-Path $ProjectDir "complexity.json"
    $ComplexityJson | ConvertTo-Json -Depth 5 | Set-Content $ComplexityPath -Encoding UTF8

    Write-Host ""
    Write-Host "Generated files:" -ForegroundColor Green
    Write-Host "  - $SpecPath" -ForegroundColor White
    Write-Host "  - $ProgramsCsv" -ForegroundColor White
    Write-Host "  - $TablesCsv" -ForegroundColor White
    Write-Host "  - $DepsPath" -ForegroundColor White
    Write-Host "  - $ComplexityPath" -ForegroundColor White

    return @{
        Project = $Project
        Stats = $Stats
        Complexity = @{ High = $HighComplexity; Medium = $MediumComplexity; Low = $LowComplexity }
    }
}

function Generate-Summary {
    param([array]$ProjectResults)

    Write-Host ""
    Write-Host "=== Generating Summary ===" -ForegroundColor Cyan

    $SummaryPath = Join-Path $OutputDir "summary.md"

    $Summary = @"
# Résumé Migration Magic PMS

> Généré le $(Get-Date -Format "yyyy-MM-dd HH:mm")

## Vue d'ensemble

| Projet | Programmes | Tâches | Expressions | Complexité moyenne |
|--------|------------|--------|-------------|-------------------|
"@

    $TotalPrograms = 0
    $TotalTasks = 0
    $TotalExpressions = 0

    foreach ($Result in $ProjectResults) {
        $S = $Result.Stats
        $Summary += "| $($Result.Project) | $($S.ProgramCount) | $($S.TaskCount) | $($S.ExpressionCount) | $($S.AvgComplexity) |`n"
        $TotalPrograms += $S.ProgramCount
        $TotalTasks += $S.TaskCount
        $TotalExpressions += $S.ExpressionCount
    }

    $Summary += "| **TOTAL** | **$TotalPrograms** | **$TotalTasks** | **$TotalExpressions** | - |`n"

    $Summary += @"

## Répartition Complexité

| Projet | Haute (>1000) | Moyenne (100-1000) | Basse (<100) |
|--------|---------------|---------------------|--------------|
"@

    foreach ($Result in $ProjectResults) {
        $C = $Result.Complexity
        $Summary += "| $($Result.Project) | $($C.High) | $($C.Medium) | $($C.Low) |`n"
    }

    $Summary | Set-Content $SummaryPath -Encoding UTF8
    Write-Host "Summary: $SummaryPath" -ForegroundColor Green
}

# ============================================================================
# MAIN
# ============================================================================

# Verify KB exists
if (-not (Test-Path $KbPath)) {
    Write-Error "Knowledge Base not found: $KbPath"
    exit 1
}

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$Results = @()

if ($All) {
    # Generate for all projects
    $Projects = Get-AllProjects
    foreach ($P in $Projects) {
        if ($P) {
            $Result = Generate-ProjectSpec -Project $P
            if ($Result) { $Results += $Result }
        }
    }
    Generate-Summary -ProjectResults $Results
}
elseif ($Summary) {
    # Just generate summary from existing specs
    $Projects = Get-AllProjects
    foreach ($P in $Projects) {
        if ($P) {
            $Stats = Get-ProjectStats -Project $P
            $Programs = Get-ProgramInventory -Project $P
            $High = 0; $Medium = 0; $Low = 0
            foreach ($Line in $Programs) {
                if ($Line) {
                    $Complexity = [int](($Line -split '\|')[5])
                    if ($Complexity -gt 1000) { $High++ }
                    elseif ($Complexity -gt 100) { $Medium++ }
                    else { $Low++ }
                }
            }
            $Results += @{ Project = $P; Stats = $Stats; Complexity = @{ High = $High; Medium = $Medium; Low = $Low } }
        }
    }
    Generate-Summary -ProjectResults $Results
}
elseif ($Project) {
    # Generate for specific project
    $Result = Generate-ProjectSpec -Project $Project
    if ($Result) { $Results += $Result }
}
else {
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\Generate-MigrationSpec.ps1 -Project ADH    # Generate for specific project" -ForegroundColor White
    Write-Host "  .\Generate-MigrationSpec.ps1 -All            # Generate for all projects" -ForegroundColor White
    Write-Host "  .\Generate-MigrationSpec.ps1 -Summary        # Generate summary only" -ForegroundColor White
    exit 0
}

Write-Host ""
Write-Host "[OK] Migration specifications generated in: $OutputDir" -ForegroundColor Green
