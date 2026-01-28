# Phase5-Synthesis.ps1 - V6.0 Pipeline
# Generation de specs a 2 niveaux:
# - Niveau 1: SUMMARY (2 pages max) pour triage bugs
# - Niveau 2: DETAILED (15-30 pages) pour migration code

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$OutputPath,

    [string]$SpecsOutputPath  # Where to save final .md files
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Default output paths
if (-not $OutputPath) {
    $OutputPath = Join-Path $ScriptDir "output\$Project-IDE-$IdePosition"
}
if (-not $SpecsOutputPath) {
    $SpecsOutputPath = Join-Path $ProjectRoot ".openspec\specs"
}
if (-not (Test-Path $SpecsOutputPath)) {
    New-Item -ItemType Directory -Path $SpecsOutputPath -Force | Out-Null
}

Write-Host "=== Phase 5: SYNTHESIS (V6.0) ===" -ForegroundColor Cyan
Write-Host "Project: $Project"
Write-Host "IDE Position: $IdePosition"
Write-Host ""

# Load all phase outputs
Write-Host "[1/5] Loading phase outputs..." -ForegroundColor Yellow

$discovery = $null
$mapping = $null
$decoded = $null
$uiForms = $null

$discoveryPath = Join-Path $OutputPath "discovery.json"
$mappingPath = Join-Path $OutputPath "mapping.json"
$decodedPath = Join-Path $OutputPath "decoded.json"
$uiFormsPath = Join-Path $OutputPath "ui_forms.json"

if (Test-Path $discoveryPath) {
    $discovery = Get-Content $discoveryPath -Raw | ConvertFrom-Json
    Write-Host "  - discovery.json loaded"
}
if (Test-Path $mappingPath) {
    $mapping = Get-Content $mappingPath -Raw | ConvertFrom-Json
    Write-Host "  - mapping.json loaded"
}
if (Test-Path $decodedPath) {
    $decoded = Get-Content $decodedPath -Raw | ConvertFrom-Json
    Write-Host "  - decoded.json loaded"
}
if (Test-Path $uiFormsPath) {
    $uiForms = Get-Content $uiFormsPath -Raw | ConvertFrom-Json
    Write-Host "  - ui_forms.json loaded"
}

if (-not $discovery) {
    Write-Host "ERROR: discovery.json not found - run Phase 1 first" -ForegroundColor Red
    exit 1
}

$programName = $discovery.metadata.program_name
$startTime = Get-Date

# Helper: Generate Mermaid call graph
function Generate-MermaidCallGraph {
    param($Discovery, $Project, $IdePosition)

    $lines = @()
    $lines += "graph LR"

    # Main chain (callers going up to Main)
    $chainNodes = @()
    foreach ($caller in $Discovery.call_graph.call_chain) {
        $nodeId = "N$($caller.ide)"
        $nodeName = "$($caller.ide) $($caller.name -replace '[^a-zA-Z0-9 ]', '')".Substring(0, [math]::Min(20, "$($caller.ide) $($caller.name)".Length))
        $chainNodes += @{ id = $nodeId; ide = $caller.ide; name = $nodeName; level = $caller.level }
    }

    # Target node
    $targetId = "T$IdePosition"
    $targetName = "$IdePosition Target"
    $lines += "    $targetId[$targetName]"
    $lines += "    style $targetId fill:#58a6ff"

    # Add chain nodes
    $prevNodeId = $targetId
    foreach ($node in ($chainNodes | Sort-Object -Property level)) {
        $lines += "    $($node.id)[$($node.name)]"
        if ($node.level -eq 1) {
            $lines += "    $($node.id) --> $targetId"
        }
    }

    # Callees
    $calleeCount = 0
    foreach ($callee in ($Discovery.call_graph.callees | Select-Object -First 5)) {
        $calleeId = "C$($callee.ide)"
        $calleeName = "$($callee.ide) $($callee.name -replace '[^a-zA-Z0-9 ]', '')".Substring(0, [math]::Min(15, "$($callee.ide) $($callee.name)".Length))
        $lines += "    $calleeId[$calleeName]"
        $lines += "    $targetId --> $calleeId"
        $lines += "    style $calleeId fill:#3fb950"
        $calleeCount++
    }

    if ($Discovery.call_graph.callees.Count -gt 5) {
        $lines += "    MORE[+$($Discovery.call_graph.callees.Count - 5) more]"
        $lines += "    $targetId --> MORE"
        $lines += "    style MORE fill:#6b7280"
    }

    return $lines -join "`n"
}

# Generate SUMMARY spec (Niveau 1)
Write-Host "[2/5] Generating SUMMARY spec..." -ForegroundColor Yellow

$summarySpec = @"
# $Project IDE $IdePosition - $programName

> **Analyse**: $($startTime.ToString("yyyy-MM-dd HH:mm"))
> **Pipeline**: V6.0 Deep Analysis

## RESUME EXECUTIF

- **Fonction**: $programName
- **Tables modifiees**: $(($discovery.tables.by_access.WRITE | Measure-Object).Count)
- **Statut**: $($discovery.orphan_analysis.status)
- **Raison**: $($discovery.orphan_analysis.reason)

## MOTS-CLES RECHERCHE

$(($programName -split ' ' | Where-Object { $_.Length -gt 3 }) -join ', ')

## CE PROGRAMME EST CONCERNE SI...

- Bug sur les tables: $(($discovery.tables.by_access.WRITE | Select-Object -First 5 | ForEach-Object { $_.logical_name }) -join ', ')
- Probleme dans le flux depuis: $(($discovery.call_graph.callers | Select-Object -First 3 | ForEach-Object { "IDE $($_.ide)" }) -join ', ')
- Erreur dans les appels vers: $(($discovery.call_graph.callees | Select-Object -First 3 | ForEach-Object { "IDE $($_.ide)" }) -join ', ')

## PROGRAMMES LIES

| Direction | Programmes |
|-----------|------------|
| **Appele par** | $(if ($discovery.call_graph.callers.Count -gt 0) { ($discovery.call_graph.callers | ForEach-Object { "IDE $($_.ide)" }) -join ', ' } else { "(aucun)" }) |
| **Appelle** | $(if ($discovery.call_graph.callees.Count -gt 0) { ($discovery.call_graph.callees | Select-Object -First 10 | ForEach-Object { "IDE $($_.ide)" }) -join ', ' } else { "(aucun)" }) |

## STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Taches | $($discovery.statistics.task_count) |
| Lignes Logic | $($discovery.statistics.logic_line_count) |
| Expressions | $($discovery.statistics.expression_count) |
| Tables | $($discovery.statistics.table_count) |

---
*Spec SUMMARY generee par Pipeline V6.0*
"@

# Generate DETAILED spec (Niveau 2)
Write-Host "[3/5] Generating DETAILED spec..." -ForegroundColor Yellow

# Build tables section
$tablesSection = @"
### Tables par mode d'acces

#### WRITE (Modification)

| Table ID | Nom Logique | Nom Physique | Occurrences |
|----------|-------------|--------------|-------------|
"@

foreach ($table in $discovery.tables.by_access.WRITE) {
    $tablesSection += "`n| $($table.id) | $($table.logical_name) | $($table.physical_name) | $($table.usage_count) |"
}

$tablesSection += @"

#### READ (Lecture)

| Table ID | Nom Logique | Nom Physique | Occurrences |
|----------|-------------|--------------|-------------|
"@

foreach ($table in ($discovery.tables.by_access.READ | Select-Object -First 15)) {
    $tablesSection += "`n| $($table.id) | $($table.logical_name) | $($table.physical_name) | $($table.usage_count) |"
}

$tablesSection += @"

#### LINK (Reference)

| Table ID | Nom Logique | Nom Physique | Occurrences |
|----------|-------------|--------------|-------------|
"@

foreach ($table in ($discovery.tables.by_access.LINK | Select-Object -First 15)) {
    $tablesSection += "`n| $($table.id) | $($table.logical_name) | $($table.physical_name) | $($table.usage_count) |"
}

# Build variables section
$variablesSection = ""
if ($mapping) {
    $variablesSection = @"
### Variables Locales

| Lettre | Nom | Type | Picture |
|--------|-----|------|---------|
"@
    foreach ($v in ($mapping.variables.local | Select-Object -First 30)) {
        $variablesSection += "`n| $($v.letter) | $($v.name) | $($v.data_type) | $($v.picture) |"
    }

    if ($mapping.variables.parameters.Count -gt 0) {
        $variablesSection += @"

### Parametres d'Entree

| Lettre | Nom | Type | Picture |
|--------|-----|------|---------|
"@
        foreach ($p in $mapping.variables.parameters) {
            $variablesSection += "`n| $($p.letter) | $($p.name) | $($p.data_type) | $($p.picture) |"
        }
    }
}

# Build expressions section
$expressionsSection = ""
if ($decoded) {
    $expressionsSection = @"
### Expressions Decodees

**Couverture**: $($decoded.statistics.decoded_count) / $($decoded.statistics.total_in_program) ($($decoded.statistics.coverage_percent)%)

#### Regles Metier Extraites

| ID | Condition | Resultat | Description |
|----|-----------|----------|-------------|
"@
    foreach ($rule in ($decoded.business_rules.all | Select-Object -First 15)) {
        $condShort = if ($rule.condition.Length -gt 40) { $rule.condition.Substring(0, 37) + "..." } else { $rule.condition }
        $natShort = if ($rule.natural_language.Length -gt 50) { $rule.natural_language.Substring(0, 47) + "..." } else { $rule.natural_language }
        $expressionsSection += "`n| $($rule.id) | ``$condShort`` | $($rule.true_value) | $natShort |"
    }

    $expressionsSection += @"

#### Top 20 Expressions

| IDE | Type | Expression Decodee |
|-----|------|-------------------|
"@
    foreach ($expr in ($decoded.expressions.all | Select-Object -First 20)) {
        $decodedShort = if ($expr.decoded.Length -gt 60) { $expr.decoded.Substring(0, 57) + "..." } else { $expr.decoded }
        $expressionsSection += "`n| $($expr.ide_position) | $($expr.type) | ``$decodedShort`` |"
    }
}

# Build UI section
$uiSection = ""
if ($uiForms -and $uiForms.forms.Count -gt 0) {
    $uiSection = @"
### Forms (Ecrans)

| Form ID | Nom | Type | Dimensions |
|---------|-----|------|------------|
"@
    foreach ($form in $uiForms.forms) {
        $uiSection += "`n| $($form.form_id) | $($form.name) | $($form.window_type_str) | $($form.dimensions.width) x $($form.dimensions.height) |"
    }

    $uiSection += @"

### Mockup ASCII

``````
$($uiForms.screen_mockup_ascii -join "`n")
``````
"@
}

# Build call graph section
$callGraphMermaid = Generate-MermaidCallGraph -Discovery $discovery -Project $Project -IdePosition $IdePosition

$detailedSpec = @"
# $Project IDE $IdePosition - $programName

> **Analyse**: $($startTime.ToString("yyyy-MM-dd HH:mm"))
> **Pipeline**: V6.0 Deep Analysis
> **Niveau**: DETAILED (Migration)

<!-- TAB:Fonctionnel -->

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| Projet | $Project |
| IDE Position | $IdePosition |
| Nom Programme | $programName |
| Statut Orphelin | $($discovery.orphan_analysis.status) |
| Raison | $($discovery.orphan_analysis.reason) |

## 2. OBJECTIF METIER

$programName

### Contexte d'utilisation

- Appele depuis: $(if ($discovery.call_graph.callers.Count -gt 0) { ($discovery.call_graph.callers | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', ' } else { "(point d'entree ou orphelin)" })
- Appelle: $(if ($discovery.call_graph.callees.Count -gt 0) { ($discovery.call_graph.callees | Select-Object -First 5 | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', ' } else { "(aucun)" })

<!-- TAB:Technique -->

## 3. MODELE DE DONNEES

$tablesSection

## 4. VARIABLES ET PARAMETRES

$variablesSection

## 5. LOGIQUE METIER

$expressionsSection

## 6. INTERFACE UTILISATEUR

$uiSection

<!-- TAB:Cartographie -->

## 7. GRAPHE D'APPELS

### 7.1 Chaine depuis Main

``````mermaid
$callGraphMermaid
``````

### 7.2 Callers (Qui m'appelle)

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
$(($discovery.call_graph.callers | ForEach-Object { "| $($_.ide) | $($_.name) | $($_.calls_count) |" }) -join "`n")

### 7.3 Callees (Qui j'appelle)

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
$(($discovery.call_graph.callees | Select-Object -First 20 | ForEach-Object { "| $($_.ide) | $($_.name) | $($_.calls_count) |" }) -join "`n")

## 8. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Taches | $($discovery.statistics.task_count) |
| Lignes Logic | $($discovery.statistics.logic_line_count) |
| Lignes Desactivees | $($discovery.statistics.disabled_line_count) |
| Expressions | $($discovery.statistics.expression_count) |
| Regles Metier | $(if ($decoded) { $decoded.statistics.business_rules_count } else { "N/A" }) |
| Tables (total) | $($discovery.statistics.table_count) |
| Tables WRITE | $(($discovery.tables.by_access.WRITE | Measure-Object).Count) |
| Tables READ | $(($discovery.tables.by_access.READ | Measure-Object).Count) |
| Callers | $($discovery.statistics.caller_count) |
| Callees | $($discovery.statistics.callee_count) |

---

## 9. NOTES MIGRATION

### Complexite estimee

$(if ($discovery.statistics.expression_count -gt 200) { "**HAUTE** - Plus de 200 expressions" } elseif ($discovery.statistics.expression_count -gt 100) { "**MOYENNE** - 100-200 expressions" } else { "**BASSE** - Moins de 100 expressions" })

### Points d'attention

- Tables en ecriture: $(($discovery.tables.by_access.WRITE | ForEach-Object { $_.logical_name }) -join ', ')
- Dependances callees: $($discovery.call_graph.callees.Count) programmes appeles
- Expressions conditionnelles: $(if ($decoded) { $decoded.statistics.by_type.condition } else { "N/A" })

---
*Spec DETAILED generee par Pipeline V6.0 - $(Get-Date -Format "yyyy-MM-dd HH:mm")*
"@

# Save specs
Write-Host "[4/5] Saving specs..." -ForegroundColor Yellow

$summaryFileName = "$Project-IDE-$IdePosition-summary.md"
$detailedFileName = "$Project-IDE-$IdePosition.md"

$summaryPath = Join-Path $SpecsOutputPath $summaryFileName
$detailedPath = Join-Path $SpecsOutputPath $detailedFileName

$summarySpec | Set-Content -Path $summaryPath -Encoding UTF8
$detailedSpec | Set-Content -Path $detailedPath -Encoding UTF8

Write-Host "  Summary: $summaryPath"
Write-Host "  Detailed: $detailedPath"

# Save quality metrics
Write-Host "[5/5] Generating quality report..." -ForegroundColor Yellow

$endTime = Get-Date
$duration = $endTime - $startTime

$quality = @{
    metadata = @{
        project = $Project
        ide_position = $IdePosition
        program_name = $programName
        generated_at = $endTime.ToString("yyyy-MM-dd HH:mm:ss")
        duration_seconds = [math]::Round($duration.TotalSeconds, 1)
        pipeline_version = "6.0"
    }

    quality_score = 0
    extraction_coverage = @{
        callers_extracted = $discovery.call_graph.callers.Count -gt 0 -or $discovery.orphan_analysis.status -eq "ORPHELIN_POTENTIEL"
        callees_extracted = $true
        tables_extracted = $discovery.tables.all.Count -gt 0
        expressions_decoded = if ($decoded) { $decoded.statistics.coverage_percent -gt 50 } else { $false }
        variables_mapped = if ($mapping) { $mapping.statistics.mapping_entries -gt 0 } else { $false }
        forms_extracted = if ($uiForms) { $uiForms.forms.Count -gt 0 } else { $false }
    }

    files_generated = @(
        $summaryFileName
        $detailedFileName
    )

    comparison_v35 = @{
        note = "V6.0 inclut callers/callees depuis KB indexee"
        improvements = @(
            "Callers extraits depuis program_calls"
            "Callees extraits depuis program_calls"
            "Expressions decodees avec lettres"
            "Call chain depuis Main"
        )
    }
}

# Calculate quality score
$score = 0
if ($quality.extraction_coverage.callers_extracted) { $score += 20 }
if ($quality.extraction_coverage.callees_extracted) { $score += 20 }
if ($quality.extraction_coverage.tables_extracted) { $score += 20 }
if ($quality.extraction_coverage.expressions_decoded) { $score += 20 }
if ($quality.extraction_coverage.variables_mapped) { $score += 10 }
if ($quality.extraction_coverage.forms_extracted) { $score += 10 }
$quality.quality_score = $score

$qualityPath = Join-Path $OutputPath "quality.json"
$quality | ConvertTo-Json -Depth 10 | Set-Content -Path $qualityPath -Encoding UTF8

Write-Host ""
Write-Host "=== Phase 5 COMPLETE ===" -ForegroundColor Green
Write-Host "Duration: $([math]::Round($duration.TotalSeconds, 1)) seconds"
Write-Host "Quality Score: $score / 100"
Write-Host ""

# Final summary
Write-Host "SYNTHESIS SUMMARY:" -ForegroundColor Cyan
Write-Host "  - Summary spec: $summaryFileName"
Write-Host "  - Detailed spec: $detailedFileName"
Write-Host "  - Quality score: $score%"
Write-Host "  - Output folder: $SpecsOutputPath"

return $quality
