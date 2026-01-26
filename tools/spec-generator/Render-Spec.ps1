#Requires -Version 5.1
<#
.SYNOPSIS
    Render Program Specification V3.0 by merging KB data with YAML annotations

.DESCRIPTION
    This script generates a comprehensive program specification by:
    1. Loading structured data from the Knowledge Base (SQLite)
    2. Loading human annotations from YAML files
    3. Merging both sources according to render-config.yaml
    4. Generating a V3.0 spec with all 5 parts (Functional/Technical/Cartography/Anti-Regression/Migration)

.PARAMETER Project
    Project code (ADH, PBP, PVE, VIL, etc.)

.PARAMETER IDE
    IDE position number (1-indexed as shown in Magic IDE)

.PARAMETER OutputPath
    Optional output directory. Defaults to .openspec/renders/

.PARAMETER SkipAnnotations
    Skip loading annotations (use KB data only)

.PARAMETER Force
    Force regeneration even if output is newer than sources

.EXAMPLE
    .\Render-Spec.ps1 -Project ADH -IDE 238

.EXAMPLE
    .\Render-Spec.ps1 -Project ADH -IDE 238 -SkipAnnotations
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IDE,

    [string]$OutputPath = "D:\Projects\Lecteur_Magic\.openspec\renders",

    [switch]$SkipAnnotations,

    [switch]$Force
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = "D:\Projects\Lecteur_Magic"
$kbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"

Write-Host "=== Render Program Specification V3.0 ===" -ForegroundColor Cyan
Write-Host "Project: $Project | IDE: $IDE" -ForegroundColor Cyan

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Get-KbData {
    param([string]$Query, [string]$DbPath)

    $result = sqlite3 $DbPath $Query 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "KB query failed: $result"
        return $null
    }
    return $result
}

function ConvertFrom-Yaml {
    param([string]$Content)

    # Simple YAML parser for our annotation format
    # Uses PowerShell-yaml if available, otherwise basic parsing
    try {
        if (Get-Command ConvertFrom-Yaml -ErrorAction SilentlyContinue) {
            return $Content | ConvertFrom-Yaml
        }
    } catch {}

    # Fallback: basic YAML parsing
    $result = @{}
    $currentSection = $null
    $currentArray = $null

    foreach ($line in $Content -split "`n") {
        $trimmed = $line.Trim()
        if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }

        # Section header (no indentation)
        if ($line -match '^(\w+):' -and -not $line.Contains('"')) {
            $key = $Matches[1]
            $value = ($line -split ':', 2)[1].Trim()
            if ($value -eq '' -or $value -eq '[]') {
                $result[$key] = @{}
                $currentSection = $key
            } else {
                $result[$key] = $value -replace '^["'']|["'']$', ''
            }
            $currentArray = $null
        }
        # Nested key
        elseif ($line -match '^\s+(\w+):(.*)$') {
            $key = $Matches[1]
            $value = $Matches[2].Trim() -replace '^["'']|["'']$', ''
            if ($currentSection -and $result[$currentSection] -is [hashtable]) {
                $result[$currentSection][$key] = $value
            }
        }
        # Array item
        elseif ($line -match '^\s+-\s+(.*)$') {
            $item = $Matches[1] -replace '^["'']|["'']$', ''
            if ($currentArray -and $result[$currentSection][$currentArray] -is [array]) {
                $result[$currentSection][$currentArray] += $item
            }
        }
    }

    return $result
}

# ============================================================================
# STEP 1: Load KB data for this program
# ============================================================================
Write-Host "`n[1/5] Loading data from Knowledge Base..." -ForegroundColor Yellow

if (-not (Test-Path $kbPath)) {
    Write-Warning "Knowledge Base not found at: $kbPath"
    Write-Warning "Falling back to XML-based generation"
    & "$scriptRoot\Generate-ProgramSpecV2.ps1" -Project $Project -IDE $IDE -OutputPath $OutputPath
    exit 0
}

# Get spec from KB
$specQuery = @"
SELECT id, title, description, xml_file, program_type, folder,
       table_count, write_table_count, read_table_count,
       variable_count, parameter_count, expression_count,
       tables_json, variables_json, parameters_json,
       known_patterns_json
FROM program_specs
WHERE project = '$Project' AND ide_position = $IDE;
"@

$specData = Get-KbData -Query $specQuery -DbPath $kbPath | ConvertFrom-Csv -Header id,title,description,xml_file,program_type,folder,table_count,write_table_count,read_table_count,variable_count,parameter_count,expression_count,tables_json,variables_json,parameters_json,known_patterns_json

if (-not $specData) {
    Write-Warning "No spec found in KB for $Project IDE $IDE"
    Write-Warning "Generating from XML source"
    & "$scriptRoot\Generate-ProgramSpecV2.ps1" -Project $Project -IDE $IDE -OutputPath $OutputPath
    exit 0
}

Write-Host "  Found: $($specData.title)" -ForegroundColor Green

# Get call graph data
$callGraphQuery = @"
SELECT direction, related_project, related_ide, related_name, call_count, is_cross_project
FROM spec_call_graph
WHERE spec_id = $($specData.id);
"@
$callGraphData = Get-KbData -Query $callGraphQuery -DbPath $kbPath | ConvertFrom-Csv -Header direction,related_project,related_ide,related_name,call_count,is_cross_project

# Get task details
$taskQuery = @"
SELECT task_isn2, task_name, parent_isn2, is_disabled, task_level, form_name, logic_line_count, disabled_line_count
FROM task_details
WHERE spec_id = $($specData.id)
ORDER BY task_isn2;
"@
$taskData = Get-KbData -Query $taskQuery -DbPath $kbPath | ConvertFrom-Csv -Header task_isn2,task_name,parent_isn2,is_disabled,task_level,form_name,logic_line_count,disabled_line_count

# Get baseline metrics
$baselineQuery = @"
SELECT metric_name, metric_value, threshold_alert
FROM spec_baselines
WHERE spec_id = $($specData.id);
"@
$baselineData = Get-KbData -Query $baselineQuery -DbPath $kbPath | ConvertFrom-Csv -Header metric_name,metric_value,threshold_alert

# Get known patterns
$patternsQuery = @"
SELECT pattern_name, root_cause_type, source_ticket
FROM resolution_patterns rp
WHERE rp.spec_references_json LIKE '%$Project-IDE-$IDE%';
"@
$patternsData = Get-KbData -Query $patternsQuery -DbPath $kbPath | ConvertFrom-Csv -Header pattern_name,root_cause_type,source_ticket

Write-Host "  Tables: $($specData.table_count) | Variables: $($specData.variable_count) | Expressions: $($specData.expression_count)"

# ============================================================================
# STEP 2: Load YAML annotations
# ============================================================================
Write-Host "`n[2/5] Loading YAML annotations..." -ForegroundColor Yellow

$annotations = $null
$annotationFile = "$projectRoot\.openspec\annotations\$Project-IDE-$IDE.yaml"

if (-not $SkipAnnotations -and (Test-Path $annotationFile)) {
    try {
        $annotationContent = Get-Content $annotationFile -Raw -Encoding UTF8
        $annotations = ConvertFrom-Yaml -Content $annotationContent
        Write-Host "  Loaded annotations from: $annotationFile" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to parse annotations: $_"
    }
} else {
    Write-Host "  No annotations file found (will use KB data only)" -ForegroundColor DarkYellow
}

# ============================================================================
# STEP 3: Parse JSON data from KB
# ============================================================================
Write-Host "`n[3/5] Parsing structured data..." -ForegroundColor Yellow

# Parse tables JSON
$tables = @()
if ($specData.tables_json -and $specData.tables_json -ne 'null') {
    try {
        $tables = $specData.tables_json | ConvertFrom-Json
    } catch {
        Write-Warning "Failed to parse tables JSON"
    }
}

# Parse variables JSON
$variables = @()
if ($specData.variables_json -and $specData.variables_json -ne 'null') {
    try {
        $variables = $specData.variables_json | ConvertFrom-Json
    } catch {
        Write-Warning "Failed to parse variables JSON"
    }
}

# Parse parameters JSON
$parameters = @()
if ($specData.parameters_json -and $specData.parameters_json -ne 'null') {
    try {
        $parameters = $specData.parameters_json | ConvertFrom-Json
    } catch {
        Write-Warning "Failed to parse parameters JSON"
    }
}

Write-Host "  Parsed: $($tables.Count) tables, $($variables.Count) variables, $($parameters.Count) parameters"

# ============================================================================
# STEP 4: Merge KB data with annotations
# ============================================================================
Write-Host "`n[4/5] Merging KB data with annotations..." -ForegroundColor Yellow

# Extract functional section (from annotations or defaults)
$functional = @{
    objective = @{
        who = ""
        what = ""
        why = ""
    }
    user_flow = @()
    error_cases = @()
}

if ($annotations -and $annotations.functional) {
    if ($annotations.functional.objective) {
        $functional.objective = $annotations.functional.objective
    }
    if ($annotations.functional.user_flow) {
        $functional.user_flow = $annotations.functional.user_flow
    }
    if ($annotations.functional.error_cases) {
        $functional.error_cases = $annotations.functional.error_cases
    }
}

# Extract business rules (from annotations)
$businessRules = @()
if ($annotations -and $annotations.business_rules) {
    $businessRules = $annotations.business_rules
}

# Extract migration notes (from annotations)
$migration = @{
    complexity_override = $null
    target_architecture = "CQRS"
    notes = @()
}
if ($annotations -and $annotations.migration) {
    $migration = $annotations.migration
}

# Extract history (from annotations)
$history = @()
if ($annotations -and $annotations.history) {
    $history = $annotations.history
}

Write-Host "  Merged: $($businessRules.Count) business rules, $($history.Count) history entries"

# ============================================================================
# STEP 5: Generate V3.0 Markdown specification
# ============================================================================
Write-Host "`n[5/5] Generating V3.0 specification..." -ForegroundColor Yellow

$date = Get-Date -Format "yyyy-MM-dd"
$outputFile = "$OutputPath\$Project-IDE-$IDE.md"

# Build tables section
$tablesSection = ""
$writeTables = $tables | Where-Object { $_.access -eq "W" } | Sort-Object { [int]$_.id }
$readTables = $tables | Where-Object { $_.access -eq "R" } | Sort-Object { [int]$_.id }
foreach ($t in $writeTables) {
    $usage = if ($t.usageCount) { "$($t.usageCount)x" } else { "1x" }
    $tablesSection += "| #$($t.id) | ``$($t.name)`` | $($t.logical) | **W** | $usage |`n"
}
foreach ($t in $readTables) {
    $usage = if ($t.usageCount) { "$($t.usageCount)x" } else { "1x" }
    $tablesSection += "| #$($t.id) | ``$($t.name)`` | $($t.logical) | R | $usage |`n"
}

# Build parameters section
$paramsSection = ""
$pIdx = 1
foreach ($p in $parameters) {
    $paramsSection += "| P$pIdx | $($p.name) | $($p.type) | - |`n"
    $pIdx++
}

# Build variables section (first 30)
$varsSection = ""
$displayVars = $variables | Select-Object -First 30
foreach ($v in $displayVars) {
    $varsSection += "| ``$($v.ref)`` | $($v.name) | $($v.type) |`n"
}

# Build task structure tree
$taskTree = ""
if ($taskData) {
    foreach ($t in $taskData) {
        $indent = "  " * [int]$t.task_level
        $disabled = if ($t.is_disabled -eq "1") { " [D]" } else { "" }
        $form = if ($t.form_name) { " (Form: $($t.form_name))" } else { "" }
        $taskTree += "$indent- Tache $($specData.ide).$($t.task_isn2): $($t.task_name)$disabled$form`n"
    }
}
if (-not $taskTree) { $taskTree = "> Structure des taches non disponible dans la KB`n" }

# Build call graph section (Mermaid)
$callGraphMermaid = "graph LR`n"
$hasCallGraph = $false
if ($callGraphData) {
    foreach ($cg in $callGraphData) {
        $hasCallGraph = $true
        $nodeId = "$($cg.related_project)_$($cg.related_ide)"
        $nodeLabel = "$($cg.related_project) IDE $($cg.related_ide)"
        if ($cg.direction -eq "caller") {
            $callGraphMermaid += "    $nodeId[$nodeLabel] --> CURRENT[$Project IDE $IDE]`n"
        } else {
            $callGraphMermaid += "    CURRENT[$Project IDE $IDE] --> $nodeId[$nodeLabel]`n"
        }
    }
}
if (-not $hasCallGraph) {
    $callGraphMermaid = "> Call graph non disponible - Executer ``magic_kb_callgraph`` pour indexer`n"
}

# Build cross-project dependencies
$crossProjectDeps = ""
if ($callGraphData) {
    $crossProject = $callGraphData | Where-Object { $_.is_cross_project -eq "1" }
    foreach ($cp in $crossProject) {
        $direction = if ($cp.direction -eq "caller") { "Appele par" } else { "Appelle" }
        $crossProjectDeps += "- $direction : $($cp.related_project) IDE $($cp.related_ide)`n"
    }
}
if (-not $crossProjectDeps) { $crossProjectDeps = "Aucune dependance cross-projet detectee`n" }

# Build known patterns section
$patternsSection = ""
if ($patternsData) {
    foreach ($p in $patternsData) {
        $patternsSection += "- **$($p.pattern_name)** ($($p.source_ticket)): Type $($p.root_cause_type)`n"
    }
}
if (-not $patternsSection) { $patternsSection = "Aucun pattern connu affectant ce programme`n" }

# Build baseline metrics section
$baselineSection = ""
if ($baselineData) {
    foreach ($b in $baselineData) {
        $threshold = if ($b.threshold_alert) { $b.threshold_alert } else { "10" }
        $baselineSection += "| $($b.metric_name) | $($b.metric_value) | +/-$threshold |`n"
    }
} else {
    $baselineSection += "| expression_count | $($specData.expression_count) | +/-10 |`n"
    $baselineSection += "| table_count | $($specData.table_count) | +/-3 |`n"
    $baselineSection += "| write_table_count | $($specData.write_table_count) | +/-1 |`n"
}

# Build history section
$historySection = ""
if ($history -and $history.Count -gt 0) {
    foreach ($h in $history) {
        $historySection += "- $($h.date): $($h.change) ($($h.author))`n"
    }
} else {
    $historySection += "- $date : Generation specification V3.0 (Claude)`n"
}

# Calculate complexity score
$complexityScore = "MEDIUM"
$writeCount = [int]$specData.write_table_count
$exprCount = [int]$specData.expression_count
if ($writeCount -gt 5 -or $exprCount -gt 100) {
    $complexityScore = "HIGH"
}
if ($writeCount -gt 10 -or $exprCount -gt 200) {
    $complexityScore = "CRITICAL"
}
if ($writeCount -le 2 -and $exprCount -le 30) {
    $complexityScore = "LOW"
}
if ($migration.complexity_override) {
    $complexityScore = $migration.complexity_override
}

# Build migration notes
$migrationNotes = ""
if ($migration.notes -and $migration.notes.Count -gt 0) {
    foreach ($n in $migration.notes) {
        $migrationNotes += "- $n`n"
    }
} else {
    $migrationNotes += "> Notes de migration a completer dans annotations YAML`n"
}

# Build user flow section
$userFlowSection = ""
if ($functional.user_flow -and $functional.user_flow.Count -gt 0) {
    $flowIdx = 1
    foreach ($step in $functional.user_flow) {
        $userFlowSection += "$flowIdx. $step`n"
        $flowIdx++
    }
} else {
    $userFlowSection += "> Flux utilisateur a completer dans ``.openspec/annotations/$Project-IDE-$IDE.yaml```n"
}

# Build error cases section
$errorCasesSection = ""
if ($functional.error_cases -and $functional.error_cases.Count -gt 0) {
    foreach ($ec in $functional.error_cases) {
        $errorCasesSection += "- **$($ec.condition)** -> $($ec.message)`n"
    }
} else {
    $errorCasesSection += "> Cas d'erreur a completer dans annotations YAML`n"
}

# Build business rules section
$businessRulesSection = ""
if ($businessRules -and $businessRules.Count -gt 0) {
    foreach ($br in $businessRules) {
        $validated = if ($br.validated) { "Oui" } else { "Non" }
        $exprRef = if ($br.expression_id) { "#$($br.expression_id)" } else { "-" }
        $businessRulesSection += "| $($br.code) | $($br.description) | $exprRef | $validated |`n"
    }
} else {
    $businessRulesSection += "> Regles metier a extraire et valider dans annotations YAML`n"
}

# Generate the final markdown
$md = @"
# $Project IDE $IDE - $($specData.title)

> **Version spec** : 3.0
> **Genere le** : $date
> **Source** : ``$($specData.xml_file)``

---

## PARTIE I: SPECIFICATION FONCTIONNELLE

### 1.1 Objectif Metier

$(if ($functional.objective.who) {
"- **Qui**: $($functional.objective.who)
- **Quoi**: $($functional.objective.what)
- **Pourquoi**: $($functional.objective.why)"
} else {
"> A completer dans ``.openspec/annotations/$Project-IDE-$IDE.yaml``"
})

### 1.2 Regles Metier

| Code | Description | Expression | Validee |
|------|-------------|------------|---------|
$businessRulesSection

### 1.3 Flux Utilisateur

$userFlowSection

### 1.4 Cas d'Erreur

$errorCasesSection

---

## PARTIE II: SPECIFICATION TECHNIQUE

### 2.1 Tables ($($specData.table_count) tables - $($specData.write_table_count) en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
$tablesSection

### 2.2 Parametres ($($specData.parameter_count))

| # | Nom | Type | Description |
|---|-----|------|-------------|
$paramsSection

### 2.3 Variables ($($specData.variable_count) total)

| Ref | Nom | Type |
|-----|-----|------|
$varsSection

> Affichage limite aux 30 premieres variables

### 2.4 Structure des Taches

``````
$taskTree``````

---

## PARTIE III: CARTOGRAPHIE APPLICATIVE

### 3.1 Call Graph

``````mermaid
$callGraphMermaid``````

### 3.2 Dependances Cross-Projet

$crossProjectDeps

### 3.3 Zones d'Impact

| Modification | Programmes Affectes | Severite |
|--------------|---------------------|----------|
| Tables W | A calculer via magic_impact_table | - |
| Expressions | A calculer via magic_impact_expression | - |

### 3.4 ECF Membership

$(if ($annotations -and $annotations.dependencies -and $annotations.dependencies.ecf_notes) {
$annotations.dependencies.ecf_notes
} else {
"> Verifier appartenance ECF via ``magic_ecf_usedby``"
})

---

## PARTIE IV: ANTI-REGRESSION

### 4.1 Patterns Connus

$patternsSection

### 4.2 Baseline Metriques

| Metrique | Valeur | Seuil Alerte |
|----------|--------|--------------|
$baselineSection

### 4.3 Historique Changements

$historySection

---

## PARTIE V: NOTES MIGRATION

### 5.1 Score Complexite

**$complexityScore**

- Tables en ecriture: $($specData.write_table_count)
- Expressions: $($specData.expression_count)
- Parametres: $($specData.parameter_count)

### 5.2 Architecture Cible

$($migration.target_architecture)

### 5.3 Notes Migration

$migrationNotes

### 5.4 Couverture Tests Requise

- [ ] Tests unitaires (80%)
- [ ] Tests integration tables
- [ ] Tests regression patterns

---

*Specification V3.0 - Generee par Render-Spec.ps1*
*KB Data + Annotations: ``.openspec/annotations/$Project-IDE-$IDE.yaml``*
"@

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Save markdown
$md | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "`n=== SPEC V3.0 GENEREE ===" -ForegroundColor Green
Write-Host "Fichier: $outputFile"
Write-Host "Tables: $($specData.table_count) | Variables: $($specData.variable_count) | Expressions: $($specData.expression_count)"

# Return summary object
[PSCustomObject]@{
    Project = $Project
    IDE = $IDE
    Title = $specData.title
    Version = "3.0"
    Tables = [int]$specData.table_count
    Variables = [int]$specData.variable_count
    Expressions = [int]$specData.expression_count
    HasAnnotations = ($null -ne $annotations)
    ComplexityScore = $complexityScore
    OutputFile = $outputFile
}
