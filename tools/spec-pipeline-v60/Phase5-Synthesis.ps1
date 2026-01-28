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

    # Target node (center)
    $targetId = "T$IdePosition"
    $lines += "    $targetId[$IdePosition Programme]"
    $lines += "    style $targetId fill:#58a6ff"

    # Callers (left side) - only valid entries (ide > 0)
    $callerCount = 0
    foreach ($caller in ($Discovery.call_graph.callers | Where-Object { $_.ide -gt 0 } | Select-Object -First 5)) {
        $callerId = "CALLER$($caller.ide)"
        # Truncate name safely
        $rawName = "$($caller.ide) $($caller.name -replace '[^a-zA-Z0-9 ]', '')"
        $callerName = if ($rawName.Length -gt 18) { $rawName.Substring(0, 15) + "..." } else { $rawName }
        $lines += "    $callerId[$callerName]"
        $lines += "    $callerId --> $targetId"
        $lines += "    style $callerId fill:#f59e0b"
        $callerCount++
    }

    # Callees (right side)
    $calleeCount = 0
    foreach ($callee in ($Discovery.call_graph.callees | Where-Object { $_.ide -gt 0 } | Select-Object -First 5)) {
        $calleeId = "CALLEE$($callee.ide)"
        $rawName = "$($callee.ide) $($callee.name -replace '[^a-zA-Z0-9 ]', '')"
        $calleeName = if ($rawName.Length -gt 18) { $rawName.Substring(0, 15) + "..." } else { $rawName }
        $lines += "    $calleeId[$calleeName]"
        $lines += "    $targetId --> $calleeId"
        $lines += "    style $calleeId fill:#3fb950"
        $calleeCount++
    }

    # Show more indicator
    if ($Discovery.call_graph.callees.Count -gt 5) {
        $remaining = $Discovery.call_graph.callees.Count - 5
        $lines += "    MORE[+$remaining more]"
        $lines += "    $targetId --> MORE"
        $lines += "    style MORE fill:#6b7280"
    }

    return $lines -join "`n"
}

# Helper: Generate Algorigramme (flowchart) from tasks and business rules
function Generate-Algorigramme {
    param($UIForms, $Decoded, $ProgramName)

    $lines = @()
    $lines += "flowchart TD"

    # START node
    $lines += "    START([START])"
    $lines += "    style START fill:#3fb950"

    # Get visible forms (main tasks)
    $mainForms = @()
    if ($UIForms -and $UIForms.forms) {
        $mainForms = @($UIForms.forms | Where-Object {
            $_.dimensions.width -gt 0 -and $_.window_type_str -match "Modal|SDI|Type6"
        } | Select-Object -First 6)
    }

    # Get business rules for decision points
    $decisions = @()
    if ($Decoded -and $Decoded.business_rules -and $Decoded.business_rules.all) {
        $decisions = @($Decoded.business_rules.all | Select-Object -First 2)
    }

    if ($mainForms.Count -eq 0) {
        # Simple flowchart if no data
        $lines += "    PROCESS[Traitement principal]"
        $lines += "    START --> PROCESS"
        $lines += "    PROCESS --> ENDOK"
    } else {
        # Build sequential flow with main forms
        $prevNode = "START"
        $formIndex = 1

        foreach ($form in $mainForms) {
            $formName = $form.name -replace '[^a-zA-Z0-9 ]', ''
            if ($formName.Length -gt 18) { $formName = $formName.Substring(0, 15) + "..." }
            if (-not $formName.Trim()) { continue }

            $nodeId = "F$formIndex"
            $lines += "    $nodeId[$formName]"

            # Add decision after first form
            if ($formIndex -eq 1 -and $decisions.Count -gt 0) {
                $lines += "    $prevNode --> $nodeId"
                $cond = $decisions[0].condition -replace '[^a-zA-Z0-9= ]', ''
                if ($cond.Length -gt 12) { $cond = $cond.Substring(0, 10) + "..." }
                $lines += "    D1{Validation?}"
                $lines += "    style D1 fill:#58a6ff"
                $lines += "    $nodeId --> D1"
                $prevNode = "D1"
                $lines += "    D1 -->|Erreur| ERR[Erreur saisie]"
                $lines += "    ERR --> $nodeId"
                $lines += "    style ERR fill:#f85149"
            } else {
                $lines += "    $prevNode --> $nodeId"
            }

            $prevNode = $nodeId
            $formIndex++

            # Limit to 4 forms in the main flow
            if ($formIndex -gt 4) { break }
        }

        # Connect last form to END
        $lines += "    D1 -->|OK| SAVE[Enregistrement]"
        $lines += "    style SAVE fill:#22c55e"
        $lines += "    SAVE --> ENDOK"
    }

    # END node
    $lines += "    ENDOK([FIN])"
    $lines += "    style ENDOK fill:#f85149"

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

# Build variables section - using variable_mapping which has UNIQUE letters
$variablesSection = ""
if ($mapping -and $mapping.variable_mapping) {
    # Convert variable_mapping to array sorted by letter
    $mappedVars = @()
    $mapping.variable_mapping.PSObject.Properties | ForEach-Object {
        if ($_.Value.type -eq "local") {
            $mappedVars += [PSCustomObject]@{
                key = $_.Name
                letter = $_.Value.letter
                name = $_.Value.name
            }
        }
    }
    # Sort by letter length then alphabetically (A, B, ... Z, AA, AB, ... BA, BB)
    $sortedVars = $mappedVars | Sort-Object { $_.letter.Length }, { $_.letter }

    $variablesSection = @"
### Variables Locales (Mapping Expression)

| Ref Expression | Lettre IDE | Nom Variable |
|----------------|------------|--------------|
"@
    foreach ($v in ($sortedVars | Select-Object -First 50)) {
        $variablesSection += "`n| ``$($v.key)`` | **$($v.letter)** | $($v.name) |"
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

| Tache | Nom | Type | Dimensions |
|-------|-----|------|------------|
"@
    foreach ($form in $uiForms.forms) {
        $dims = if ($form.dimensions.width -gt 0) { "$($form.dimensions.width) x $($form.dimensions.height)" } else { "-" }
        $uiSection += "`n| $($form.task_isn2) | $($form.name) | $($form.window_type_str) | $dims |"
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

# Build algorigramme (flowchart)
$algorigrammeMermaid = Generate-Algorigramme -UIForms $uiForms -Decoded $decoded -ProgramName $programName

# Build OBJECTIF METIER enrichi
$objectifMetier = @()

# 1. Description fonctionnelle basee sur les taches principales
if ($uiForms -and $uiForms.forms.Count -gt 0) {
    $mainTasks = @($uiForms.forms | Where-Object {
        $_.dimensions.width -gt 0 -and $_.window_type_str -match "Modal|SDI|Type6"
    } | Select-Object -First 8)

    if ($mainTasks.Count -gt 0) {
        $objectifMetier += "### Fonctionnalites principales"
        $objectifMetier += ""
        foreach ($task in $mainTasks) {
            $taskName = $task.name -replace '[^\w\s\-]', ''
            if ($taskName.Trim()) {
                $objectifMetier += "- **$taskName** (Tache $($task.task_isn2))"
            }
        }
        $objectifMetier += ""
    }
}

# 2. Operations sur les donnees (tables WRITE)
$writeTables = @()
if ($discovery.tables.by_access.WRITE) {
    $writeTables = @($discovery.tables.by_access.WRITE)
}
if ($writeTables.Count -gt 0) {
    $objectifMetier += "### Operations sur les donnees"
    $objectifMetier += ""
    $objectifMetier += "Ce programme **modifie** les tables suivantes:"
    foreach ($tbl in ($writeTables | Select-Object -First 6)) {
        $objectifMetier += "- ``$($tbl.logical_name)`` ($($tbl.physical_name))"
    }
    if ($writeTables.Count -gt 6) {
        $objectifMetier += "- ... et $($writeTables.Count - 6) autres tables"
    }
    $objectifMetier += ""
}

# 3. Regles metier principales (si decoded disponible)
if ($decoded -and $decoded.business_rules -and $decoded.business_rules.all.Count -gt 0) {
    $objectifMetier += "### Regles metier cles"
    $objectifMetier += ""
    $topRules = @($decoded.business_rules.all | Select-Object -First 5)
    foreach ($rule in $topRules) {
        $ruleDesc = $rule.natural_language
        if ($ruleDesc.Length -gt 80) { $ruleDesc = $ruleDesc.Substring(0, 77) + "..." }
        $objectifMetier += "- [$($rule.id)] $ruleDesc"
    }
    $objectifMetier += ""
}

$objectifMetierText = $objectifMetier -join "`n"

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

**$programName** - Programme de gestion des transactions et operations metier.

$objectifMetierText

### Contexte d'utilisation

- Appele depuis: $(if ($discovery.call_graph.callers.Count -gt 0) { ($discovery.call_graph.callers | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', ' } else { "(point d'entree ou orphelin)" })
- Appelle: $(if ($discovery.call_graph.callees.Count -gt 0) { ($discovery.call_graph.callees | Select-Object -First 5 | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', ' } else { "(aucun)" })

<!-- TAB:Technique -->

## 3. MODELE DE DONNEES

$tablesSection

## 4. VARIABLES ET PARAMETRES

$variablesSection

## 5. LOGIQUE METIER

### Algorigramme Simplifie

``````mermaid
$algorigrammeMermaid
``````

$expressionsSection

## 6. INTERFACE UTILISATEUR

$uiSection

<!-- TAB:Cartographie -->

## 7. GRAPHE D'APPELS

### 7.1 Chaine depuis Main

**Chemin d'acces**: Main (IDE 1) $( if ($discovery.call_graph.callers.Count -gt 0) { "-> " + ($discovery.call_graph.callers | Select-Object -First 1 | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) + " -> " } else { "-> " } )$programName (IDE $IdePosition)

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
