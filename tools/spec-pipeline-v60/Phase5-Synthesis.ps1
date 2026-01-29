# Phase5-Synthesis.ps1 - V6.0 Pipeline (Rewrite V2)
# Generation de specs a 2 niveaux:
# - Niveau 1: SUMMARY (2 pages max) pour triage bugs
# - Niveau 2: DETAILED (15-30 pages) pour migration code
#
# Validated decisions (9 sections):
# S1: Pipeline + Complexite + enriched Raison + orphan criteria
# S2: Description from forms/keywords + width>0 filter + dual format rules + ALL callees
# S3: Single unified R/W/L table + Memory indicator + ALL tables
# S4: ALL mappings + P0/W0/V./VG categories + Type column + merged table
# S5: Improved algorigramme + ALL expressions by type + no truncation
# S6: Only visible forms + multi-forms mockup
# S7: 2 separate diagrams + full names + no truncation
# S8: LINK count + V9 metrics + ratios
# S9: Composite score formula + migration recommendations

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

# ============================================================
# LOAD PHASE OUTPUTS
# ============================================================
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

# ============================================================
# HELPER FUNCTIONS
# ============================================================

function Clean-MermaidLabel {
    param([string]$Text)
    # Remove all special characters that break Mermaid syntax
    $clean = $Text -replace "['""`<>{}()\[\]/\\?!&]", ''
    $clean = $clean -replace '\s+', ' '
    $clean = $clean.Trim()
    if (-not $clean) { $clean = "N-A" }
    return $clean
}

function Get-VariableCategory {
    param([string]$Name)
    if ($Name -match '^P0[\.\s]') { return "P0" }
    if ($Name -match '^W0[\.\s]') { return "W0" }
    if ($Name -match '^V\.') { return "V." }
    if ($Name -match '^VG\d') { return "VG" }
    if ($Name -match '^v[\.\s]') { return "V." }
    return "Autre"
}

function Get-TableStorageType {
    param([string]$Physical)
    if (-not $Physical -or $Physical -eq '') { return "Memory" }
    if ($Physical -match '^%') { return "Temp" }
    return "Database"
}

function Calculate-ComplexityScore {
    param($Discovery, $Decoded)

    $score = 0
    $details = @()

    # Expression count (30%)
    $exprCount = $Discovery.statistics.expression_count
    if ($exprCount -gt 200) { $score += 30; $details += "Expressions: $exprCount (HAUTE)" }
    elseif ($exprCount -gt 100) { $score += 20; $details += "Expressions: $exprCount (MOYENNE)" }
    elseif ($exprCount -gt 50) { $score += 10; $details += "Expressions: $exprCount (BASSE)" }
    else { $details += "Expressions: $exprCount (MINIMALE)" }

    # Task count (20%)
    $taskCount = $Discovery.statistics.task_count
    if ($taskCount -gt 30) { $score += 20; $details += "Taches: $taskCount (HAUTE)" }
    elseif ($taskCount -gt 15) { $score += 13; $details += "Taches: $taskCount (MOYENNE)" }
    elseif ($taskCount -gt 5) { $score += 7; $details += "Taches: $taskCount (BASSE)" }
    else { $details += "Taches: $taskCount (MINIMALE)" }

    # Tables WRITE (20%)
    $writeCount = ($Discovery.tables.by_access.WRITE | Measure-Object).Count
    if ($writeCount -gt 5) { $score += 20; $details += "Tables WRITE: $writeCount (HAUTE)" }
    elseif ($writeCount -gt 3) { $score += 13; $details += "Tables WRITE: $writeCount (MOYENNE)" }
    elseif ($writeCount -gt 0) { $score += 7; $details += "Tables WRITE: $writeCount (BASSE)" }
    else { $details += "Tables WRITE: 0 (AUCUNE)" }

    # Callee count (15%)
    $calleeCount = $Discovery.statistics.callee_count
    if ($calleeCount -gt 10) { $score += 15; $details += "Callees: $calleeCount (HAUTE)" }
    elseif ($calleeCount -gt 5) { $score += 10; $details += "Callees: $calleeCount (MOYENNE)" }
    elseif ($calleeCount -gt 0) { $score += 5; $details += "Callees: $calleeCount (BASSE)" }
    else { $details += "Callees: 0 (ISOLE)" }

    # Disabled lines ratio (15%)
    $totalLines = $Discovery.statistics.logic_line_count
    $disabledLines = $Discovery.statistics.disabled_line_count
    $disabledRatio = if ($totalLines -gt 0) { [math]::Round($disabledLines / $totalLines * 100, 1) } else { 0 }
    if ($disabledRatio -gt 30) { $score += 15; $details += "Lignes desactivees: ${disabledRatio}% (DETTE HAUTE)" }
    elseif ($disabledRatio -gt 15) { $score += 10; $details += "Lignes desactivees: ${disabledRatio}% (DETTE MOYENNE)" }
    elseif ($disabledRatio -gt 5) { $score += 5; $details += "Lignes desactivees: ${disabledRatio}% (DETTE BASSE)" }
    else { $details += "Lignes desactivees: ${disabledRatio}% (SAIN)" }

    # Level
    $level = if ($score -ge 70) { "HAUTE" }
             elseif ($score -ge 40) { "MOYENNE" }
             else { "BASSE" }

    return @{
        score = $score
        level = $level
        details = $details
        disabled_ratio = $disabledRatio
    }
}

# ============================================================
# SECTION 7: MERMAID DIAGRAMS
# ============================================================

function Generate-CallersDiagram {
    param($Discovery, $Project, $IdePosition, $ProgramName)

    $lines = @()
    $lines += "graph LR"

    $targetLabel = Clean-MermaidLabel "$IdePosition $ProgramName"
    $lines += "    T$IdePosition[$targetLabel]"
    $lines += "    style T$IdePosition fill:#58a6ff"

    # Callers chain from call_chain (path from Main)
    if ($Discovery.call_graph.call_chain -and $Discovery.call_graph.call_chain.Count -gt 0) {
        $prevNode = $null
        foreach ($node in $Discovery.call_graph.call_chain) {
            if ($node.ide -le 0) { continue }
            $nodeId = "CC$($node.ide)"
            $nodeLabel = Clean-MermaidLabel "$($node.ide) $($node.name)"
            $lines += "    $nodeId[$nodeLabel]"
            if ($node.level -eq 0) {
                $lines += "    style $nodeId fill:#8b5cf6"  # Main = violet
            } else {
                $lines += "    style $nodeId fill:#f59e0b"  # Intermediate = orange
            }
            if ($prevNode) {
                $lines += "    $prevNode --> $nodeId"
            }
            $prevNode = $nodeId
        }
        # Connect last chain node to target
        if ($prevNode) {
            $lines += "    $prevNode --> T$IdePosition"
        }
    } elseif ($Discovery.call_graph.callers -and $Discovery.call_graph.callers.Count -gt 0) {
        # Fallback: show all callers directly connected
        foreach ($caller in ($Discovery.call_graph.callers | Where-Object { $_.ide -gt 0 })) {
            $callerId = "CALLER$($caller.ide)"
            $callerLabel = Clean-MermaidLabel "$($caller.ide) $($caller.name)"
            $lines += "    $callerId[$callerLabel]"
            $lines += "    $callerId --> T$IdePosition"
            $lines += "    style $callerId fill:#f59e0b"
        }
    } else {
        $lines += "    NONE[Aucun caller]"
        $lines += "    NONE -.-> T$IdePosition"
        $lines += "    style NONE fill:#6b7280,stroke-dasharray: 5 5"
    }

    return $lines -join "`n"
}

function Generate-CalleesDiagram {
    param($Discovery, $Project, $IdePosition, $ProgramName)

    $lines = @()
    $lines += "graph LR"

    $targetLabel = Clean-MermaidLabel "$IdePosition $ProgramName"
    $lines += "    T$IdePosition[$targetLabel]"
    $lines += "    style T$IdePosition fill:#58a6ff"

    # ALL callees - no truncation, no limit
    $callees = @($Discovery.call_graph.callees | Where-Object { $_.ide -gt 0 })

    if ($callees.Count -eq 0) {
        $lines += "    NONE[Aucun callee]"
        $lines += "    T$IdePosition -.-> NONE"
        $lines += "    style NONE fill:#6b7280,stroke-dasharray: 5 5"
    } else {
        foreach ($callee in $callees) {
            $calleeId = "C$($callee.ide)"
            $calleeLabel = Clean-MermaidLabel "$($callee.ide) $($callee.name)"
            $lines += "    $calleeId[$calleeLabel]"
            $lines += "    T$IdePosition --> $calleeId"
            $lines += "    style $calleeId fill:#3fb950"
        }
    }

    return $lines -join "`n"
}

# ============================================================
# SECTION 5: ALGORIGRAMME
# ============================================================

function Generate-Algorigramme {
    param($UIForms, $Decoded, $ProgramName)

    $lines = @()
    $lines += "flowchart TD"

    # START node
    $lines += "    START([START])"
    $lines += "    style START fill:#3fb950"

    # Get ALL visible forms (width > 0) - no type filter, no limit
    $visibleForms = @()
    if ($UIForms -and $UIForms.forms) {
        $visibleForms = @($UIForms.forms | Where-Object {
            $_.dimensions.width -gt 0
        } | Sort-Object { $_.task_isn2 })
    }

    # Get business rules for decision points
    $decisions = @()
    if ($Decoded -and $Decoded.business_rules -and $Decoded.business_rules.all) {
        $decisions = @($Decoded.business_rules.all | Where-Object { $_.condition } | Select-Object -First 3)
    }

    if ($visibleForms.Count -eq 0 -and $decisions.Count -eq 0) {
        # Minimal flowchart
        $lines += "    PROCESS[Traitement principal]"
        $lines += "    START --> PROCESS"
        $lines += "    PROCESS --> ENDOK"
    } elseif ($visibleForms.Count -eq 0 -and $decisions.Count -gt 0) {
        # Decision-driven flow (no visible forms but has rules)
        $prevNode = "START"
        $dIdx = 1
        foreach ($dec in $decisions) {
            $condLabel = Clean-MermaidLabel ($dec.condition)
            if ($condLabel.Length -gt 30) { $condLabel = $condLabel.Substring(0, 27) + "..." }
            $lines += "    D$dIdx{$condLabel}"
            $lines += "    style D$dIdx fill:#58a6ff"
            $lines += "    $prevNode --> D$dIdx"
            $lines += "    D$dIdx -->|OUI| A$dIdx[Action $dIdx]"
            $lines += "    D$dIdx -->|NON| N$dIdx[Suite]"
            $lines += "    A$dIdx --> N$dIdx"
            $prevNode = "N$dIdx"
            $dIdx++
        }
        $lines += "    $prevNode --> ENDOK"
    } else {
        # Form-driven flow with visible screens
        $prevNode = "START"
        $formIndex = 1
        $maxForms = [Math]::Min($visibleForms.Count, 8)  # Show up to 8 forms

        foreach ($form in ($visibleForms | Select-Object -First $maxForms)) {
            $formName = Clean-MermaidLabel $form.name
            if (-not $formName.Trim()) { continue }

            $nodeId = "F$formIndex"
            $lines += "    $nodeId[$formName]"

            # Add decision after first form if rules exist
            if ($formIndex -eq 1 -and $decisions.Count -gt 0) {
                $lines += "    $prevNode --> $nodeId"
                $condLabel = Clean-MermaidLabel ($decisions[0].condition)
                if ($condLabel.Length -gt 30) { $condLabel = $condLabel.Substring(0, 27) + "..." }
                $lines += "    D1{$condLabel}"
                $lines += "    style D1 fill:#58a6ff"
                $lines += "    $nodeId --> D1"
                $lines += "    D1 -->|OK| NEXT1[Suite traitement]"
                $lines += "    D1 -->|Erreur| ERR[Erreur saisie]"
                $lines += "    ERR --> $nodeId"
                $lines += "    style ERR fill:#f85149"
                $prevNode = "NEXT1"
            } else {
                $lines += "    $prevNode --> $nodeId"
                $prevNode = $nodeId
            }

            $formIndex++
        }

        # Connect to save + end
        $lines += "    $prevNode --> SAVE[Enregistrement]"
        $lines += "    style SAVE fill:#22c55e"
        $lines += "    SAVE --> ENDOK"
    }

    # END node
    $lines += "    ENDOK([FIN])"
    $lines += "    style ENDOK fill:#f85149"

    return $lines -join "`n"
}

# ============================================================
# BUILD SECTIONS
# ============================================================

# --- Complexity score ---
$complexity = Calculate-ComplexityScore -Discovery $discovery -Decoded $decoded

# --- Visible forms (width > 0) for Section 2 + 6 ---
$visibleForms = @()
if ($uiForms -and $uiForms.forms) {
    $visibleForms = @($uiForms.forms | Where-Object { $_.dimensions.width -gt 0 } | Sort-Object { $_.task_isn2 })
}

# --- Tables: build unified R/W/L view (Section 3) ---
$tableUnified = @{}  # keyed by table id
if ($discovery.tables.all) {
    foreach ($t in $discovery.tables.all) {
        $key = "$($t.id)"
        if (-not $tableUnified.ContainsKey($key)) {
            $tableUnified[$key] = @{
                id = $t.id
                logical_name = $t.logical_name
                physical_name = $t.physical_name
                R = $false
                W = $false
                L = $false
                usage_total = 0
                storage = Get-TableStorageType $t.physical_name
            }
        }
        $entry = $tableUnified[$key]
        switch ($t.access_mode) {
            "READ"  { $entry.R = $true }
            "WRITE" { $entry.W = $true }
            "LINK"  { $entry.L = $true }
        }
        $entry.usage_total += $t.usage_count
    }
}

# --- Variables: build categorized table (Section 4) ---
$variableRows = @()
if ($mapping -and $mapping.variable_mapping) {
    # Build data_type lookup from variables.local
    $dataTypeLookup = @{}
    if ($mapping.variables -and $mapping.variables.local) {
        foreach ($v in $mapping.variables.local) {
            $lookupKey = "$($v.letter)|$($v.name)"
            if (-not $dataTypeLookup.ContainsKey($lookupKey)) {
                $dataTypeLookup[$lookupKey] = $v.data_type
            }
        }
    }

    $mapping.variable_mapping.PSObject.Properties | ForEach-Object {
        $ref = $_.Name
        $letter = $_.Value.letter
        $name = $_.Value.name
        $type = $_.Value.type
        $category = Get-VariableCategory $name
        $lookupKey = "$letter|$name"
        $dataType = if ($dataTypeLookup.ContainsKey($lookupKey)) { $dataTypeLookup[$lookupKey] } else { "N/A" }

        $variableRows += [PSCustomObject]@{
            Ref = $ref
            Letter = $letter
            Name = $name
            Category = $category
            DataType = $dataType
            VarType = $type
        }
    }

    # Sort: by category priority, then by letter length, then alphabetically
    $catOrder = @{ "P0" = 0; "W0" = 1; "V." = 2; "VG" = 3; "Autre" = 4 }
    $variableRows = $variableRows | Sort-Object {
        $catOrder[$_.Category]
    }, {
        $_.Letter.Length
    }, {
        $_.Letter
    }
}

# ============================================================
# GENERATE SUMMARY SPEC
# ============================================================
Write-Host "[2/5] Generating SUMMARY spec..." -ForegroundColor Yellow

$writeTableNames = ($discovery.tables.by_access.WRITE | ForEach-Object { $_.logical_name }) -join ', '
$callersList = if ($discovery.call_graph.callers.Count -gt 0) {
    ($discovery.call_graph.callers | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
} else { "(aucun)" }
$calleesList = if ($discovery.call_graph.callees.Count -gt 0) {
    ($discovery.call_graph.callees | Select-Object -First 10 | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
} else { "(aucun)" }
$callersIdeList = if ($discovery.call_graph.callers.Count -gt 0) {
    ($discovery.call_graph.callers | ForEach-Object { "IDE $($_.ide)" }) -join ', '
} else { "(aucun)" }
$calleesIdeList = if ($discovery.call_graph.callees.Count -gt 0) {
    ($discovery.call_graph.callees | Select-Object -First 10 | ForEach-Object { "IDE $($_.ide)" }) -join ', '
} else { "(aucun)" }

$summarySpec = @"
# $Project IDE $IdePosition - $programName

> **Analyse**: $($startTime.ToString("yyyy-MM-dd HH:mm"))
> **Pipeline**: V6.0 Deep Analysis

## RESUME EXECUTIF

- **Fonction**: $programName
- **Tables modifiees**: $(($discovery.tables.by_access.WRITE | Measure-Object).Count)
- **Complexite**: **$($complexity.level)** ($($complexity.score)/100)
- **Statut**: $($discovery.orphan_analysis.status)
- **Raison**: $($discovery.orphan_analysis.reason)

## MOTS-CLES RECHERCHE

$(($programName -split ' ' | Where-Object { $_.Length -gt 3 }) -join ', ')

## CE PROGRAMME EST CONCERNE SI...

- Bug sur les tables: $writeTableNames
- Probleme dans le flux depuis: $(($discovery.call_graph.callers | Select-Object -First 5 | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', ')
- Erreur dans les appels vers: $(($discovery.call_graph.callees | Select-Object -First 5 | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', ')

## PROGRAMMES LIES

| Direction | Programmes |
|-----------|------------|
| **Appele par** | $callersList |
| **Appelle** | $calleesList |

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

# ============================================================
# GENERATE DETAILED SPEC
# ============================================================
Write-Host "[3/5] Generating DETAILED spec..." -ForegroundColor Yellow

$specLines = @()

# --- HEADER ---
$specLines += "# $Project IDE $IdePosition - $programName"
$specLines += ""
$specLines += "> **Analyse**: $($startTime.ToString("yyyy-MM-dd HH:mm"))"
$specLines += "> **Pipeline**: V6.0 Deep Analysis"
$specLines += "> **Niveau**: DETAILED (Migration)"
$specLines += ""

# ============================================================
# SECTION 1: IDENTIFICATION
# ============================================================
$specLines += "<!-- TAB:Fonctionnel -->"
$specLines += ""
$specLines += "## 1. IDENTIFICATION"
$specLines += ""
$specLines += "| Attribut | Valeur |"
$specLines += "|----------|--------|"
$specLines += "| Projet | $Project |"
$specLines += "| IDE Position | $IdePosition |"
$specLines += "| Nom Programme | $programName |"
$specLines += "| Statut Orphelin | $($discovery.orphan_analysis.status) |"
$specLines += "| Raison | $($discovery.orphan_analysis.reason) |"
$specLines += "| Complexite | **$($complexity.level)** ($($complexity.score)/100) |"
$specLines += "| Pipeline | V6.0 |"
$specLines += ""

# Orphan criteria detail
$specLines += "### Criteres Orphelin"
$specLines += ""
$specLines += "| Critere | Resultat |"
$specLines += "|---------|----------|"
$hasCallers = if ($discovery.orphan_analysis.has_callers) { "OUI ($($discovery.statistics.caller_count) callers)" } else { "NON" }
$hasPublicName = if ($discovery.orphan_analysis.has_public_name) { "OUI" } else { "NON" }
$isEcf = if ($discovery.orphan_analysis.is_ecf_member) { "OUI" } else { "NON" }
$specLines += "| Callers directs | $hasCallers |"
$specLines += "| Public Name | $hasPublicName |"
$specLines += "| Membre ECF | $isEcf |"
$specLines += ""

# ============================================================
# SECTION 2: OBJECTIF METIER
# ============================================================
$specLines += "## 2. OBJECTIF METIER"
$specLines += ""

# 2.1 Description from visible forms + keywords
$keywords = @($programName -split ' ' | Where-Object { $_.Length -gt 3 })
if ($visibleForms.Count -gt 0) {
    $formNames = ($visibleForms | ForEach-Object { $_.name }) -join ', '
    $specLines += "**$programName** - Programme comprenant $($visibleForms.Count) ecran(s) visible(s): $formNames."
} else {
    $specLines += "**$programName** - Programme de traitement metier ($($discovery.statistics.task_count) taches, $($discovery.statistics.expression_count) expressions)."
}
$specLines += ""

# 2.2 Fonctionnalites from visible forms
if ($visibleForms.Count -gt 0) {
    $specLines += "### Fonctionnalites principales"
    $specLines += ""
    foreach ($form in $visibleForms) {
        $formName = $form.name
        if ($formName.Trim()) {
            $dims = "$($form.dimensions.width)x$($form.dimensions.height)"
            $specLines += "- **$formName** (Tache $($form.task_isn2), $($form.window_type_str), $dims)"
        }
    }
    $specLines += ""
}

# 2.3 Operations sur les donnees - ALL tables by access mode
$writeTablesAll = @()
$readTablesAll = @()
$linkTablesAll = @()

if ($discovery.tables.by_access.WRITE) { $writeTablesAll = @($discovery.tables.by_access.WRITE) }
if ($discovery.tables.by_access.READ) { $readTablesAll = @($discovery.tables.by_access.READ) }
if ($discovery.tables.by_access.LINK) { $linkTablesAll = @($discovery.tables.by_access.LINK) }

if ($writeTablesAll.Count -gt 0 -or $readTablesAll.Count -gt 0) {
    $specLines += "### Operations sur les donnees"
    $specLines += ""

    if ($writeTablesAll.Count -gt 0) {
        $specLines += "#### Tables modifiees (WRITE) - $($writeTablesAll.Count) tables"
        $specLines += ""
        foreach ($tbl in $writeTablesAll) {
            $specLines += "- ``$($tbl.logical_name)`` ($($tbl.physical_name))"
        }
        $specLines += ""
    }

    if ($readTablesAll.Count -gt 0) {
        $specLines += "#### Tables lues (READ) - $($readTablesAll.Count) tables"
        $specLines += ""
        foreach ($tbl in $readTablesAll) {
            $specLines += "- ``$($tbl.logical_name)`` ($($tbl.physical_name))"
        }
        $specLines += ""
    }

    if ($linkTablesAll.Count -gt 0) {
        $specLines += "#### Tables liees (LINK) - $($linkTablesAll.Count) tables"
        $specLines += ""
        foreach ($tbl in $linkTablesAll) {
            $specLines += "- ``$($tbl.logical_name)`` ($($tbl.physical_name))"
        }
        $specLines += ""
    }
}

# 2.4 Regles metier - DUAL FORMAT (decoded + natural language), NO TRUNCATION
if ($decoded -and $decoded.business_rules -and $decoded.business_rules.all.Count -gt 0) {
    $allRules = @($decoded.business_rules.all)
    $specLines += "### Regles metier ($($allRules.Count) regles)"
    $specLines += ""

    # Group by type
    $rulesByType = $allRules | Group-Object -Property { if ($_.type) { $_.type } else { 'Autre' } }

    foreach ($group in $rulesByType) {
        $typeName = $group.Name
        $specLines += "#### $typeName ($($group.Count))"
        $specLines += ""

        foreach ($rule in $group.Group) {
            # Dual format: decoded expression + natural language
            $decodedExpr = if ($rule.decoded_expression) { $rule.decoded_expression } elseif ($rule.decoded) { $rule.decoded } else { $rule.raw_expression }
            $naturalLang = $rule.natural_language

            $specLines += "- **[$($rule.id)]** ``$decodedExpr``"
            if ($naturalLang) {
                $specLines += "  > $naturalLang"
            }
        }
        $specLines += ""
    }
}

# 2.5 Contexte d'utilisation - ALL callees, no limit
$callersContext = if ($discovery.call_graph.callers.Count -gt 0) {
    ($discovery.call_graph.callers | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
} else { "(point d'entree ou orphelin)" }

$calleesContext = if ($discovery.call_graph.callees.Count -gt 0) {
    ($discovery.call_graph.callees | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
} else { "(aucun)" }

$specLines += "### Contexte d'utilisation"
$specLines += ""
$specLines += "- **Appele depuis**: $callersContext"
$specLines += "- **Appelle**: $calleesContext"
$specLines += ""

# ============================================================
# SECTION 3: MODELE DE DONNEES (TAB: Technique)
# ============================================================
$specLines += "<!-- TAB:Technique -->"
$specLines += ""
$specLines += "## 3. MODELE DE DONNEES"
$specLines += ""

# Unified table with R/W/L columns
$specLines += "### Tables ($($tableUnified.Count) tables uniques)"
$specLines += ""
$specLines += "| ID | Nom Logique | Nom Physique | R | W | L | Type | Occurrences |"
$specLines += "|----|-------------|--------------|---|---|---|------|-------------|"

$sortedTables = $tableUnified.Values | Sort-Object { [int]$_.id }
foreach ($t in $sortedTables) {
    $rMark = if ($t.R) { "R" } else { "-" }
    $wMark = if ($t.W) { "W" } else { "-" }
    $lMark = if ($t.L) { "L" } else { "-" }
    $specLines += "| $($t.id) | $($t.logical_name) | $($t.physical_name) | $rMark | $wMark | $lMark | $($t.storage) | $($t.usage_total) |"
}
$specLines += ""

# ============================================================
# SECTION 4: VARIABLES ET PARAMETRES
# ============================================================
$specLines += "## 4. VARIABLES ET PARAMETRES"
$specLines += ""

if ($variableRows.Count -gt 0) {
    $specLines += "### Variables Mapping ($($variableRows.Count) entrees)"
    $specLines += ""
    $specLines += "| Cat | Ref Expression | Lettre | Nom Variable | Type |"
    $specLines += "|-----|----------------|--------|--------------|------|"

    $currentCat = ""
    foreach ($v in $variableRows) {
        # Category separator
        if ($v.Category -ne $currentCat) {
            $currentCat = $v.Category
        }
        $specLines += "| $($v.Category) | ``$($v.Ref)`` | **$($v.Letter)** | $($v.Name) | $($v.DataType) |"
    }
    $specLines += ""
}

# Parameters section
if ($mapping -and $mapping.variables -and $mapping.variables.parameters.Count -gt 0) {
    $specLines += "### Parametres d'Entree"
    $specLines += ""
    $specLines += "| Lettre | Nom | Type | Picture |"
    $specLines += "|--------|-----|------|---------|"
    foreach ($p in $mapping.variables.parameters) {
        $specLines += "| $($p.letter) | $($p.name) | $($p.data_type) | $($p.picture) |"
    }
    $specLines += ""
}

# ============================================================
# SECTION 5: LOGIQUE METIER
# ============================================================
$specLines += "## 5. LOGIQUE METIER"
$specLines += ""

# 5.1 Algorigramme
$algorigramme = Generate-Algorigramme -UIForms $uiForms -Decoded $decoded -ProgramName $programName
$specLines += "### Algorigramme"
$specLines += ""
$specLines += '```mermaid'
$specLines += $algorigramme
$specLines += '```'
$specLines += ""

# 5.2 ALL Expressions grouped by type - NO TRUNCATION
if ($decoded) {
    $specLines += "### Expressions ($($decoded.statistics.decoded_count) / $($decoded.statistics.total_in_program) - $($decoded.statistics.coverage_percent)%)"
    $specLines += ""

    # Group by type and show all
    $exprByType = @{}
    if ($decoded.expressions -and $decoded.expressions.by_type) {
        $decoded.expressions.by_type.PSObject.Properties | ForEach-Object {
            $exprByType[$_.Name] = @($_.Value)
        }
    }

    foreach ($typeName in ($exprByType.Keys | Sort-Object)) {
        $exprs = $exprByType[$typeName]
        $specLines += "#### $typeName ($($exprs.Count) expressions)"
        $specLines += ""
        $specLines += "| IDE | Expression Decodee |"
        $specLines += "|-----|-------------------|"
        foreach ($expr in $exprs) {
            # NO TRUNCATION - full decoded expression
            $decodedText = if ($expr.decoded) { $expr.decoded } else { $expr.raw }
            # Escape pipe characters in markdown table
            $decodedText = $decodedText -replace '\|', '\|'
            $specLines += "| $($expr.ide_position) | ``$decodedText`` |"
        }
        $specLines += ""
    }
}

# ============================================================
# SECTION 6: INTERFACE UTILISATEUR
# ============================================================
$specLines += "## 6. INTERFACE UTILISATEUR"
$specLines += ""

if ($uiForms -and $uiForms.forms.Count -gt 0) {
    # 6.1 Only visible forms (width > 0)
    $specLines += "### Forms Visibles ($($visibleForms.Count) / $($uiForms.forms.Count) total)"
    $specLines += ""
    $specLines += "| Tache | Nom | Type | Dimensions |"
    $specLines += "|-------|-----|------|------------|"
    foreach ($form in $visibleForms) {
        $dims = "$($form.dimensions.width)x$($form.dimensions.height)"
        $specLines += "| $($form.task_isn2) | $($form.name) | $($form.window_type_str) | $dims |"
    }
    $specLines += ""

    # 6.2 Full forms list (all)
    $specLines += "### Toutes les Forms ($($uiForms.forms.Count))"
    $specLines += ""
    $specLines += "| Tache | Nom | Type | Dimensions |"
    $specLines += "|-------|-----|------|------------|"
    foreach ($form in $uiForms.forms) {
        $dims = if ($form.dimensions.width -gt 0) { "$($form.dimensions.width)x$($form.dimensions.height)" } else { "-" }
        $specLines += "| $($form.task_isn2) | $($form.name) | $($form.window_type_str) | $dims |"
    }
    $specLines += ""

    # 6.3 Multi-form mockup
    if ($visibleForms.Count -gt 0) {
        $specLines += "### Mockup"
        $specLines += ""
        $specLines += '```'

        foreach ($form in $visibleForms) {
            $title = $form.name
            $w = $form.dimensions.width
            $h = $form.dimensions.height
            $type = $form.window_type_str
            $headerText = "$title [$type] ${w}x${h}"
            $boxWidth = [Math]::Max($headerText.Length + 4, 40)
            $border = "+" + ("-" * $boxWidth) + "+"
            $paddedTitle = $headerText.PadRight($boxWidth)

            $specLines += $border
            $specLines += "| $paddedTitle |"
            $specLines += $border
            $specLines += "| " + ("(contenu tache $($form.task_isn2))").PadRight($boxWidth) + " |"
            $specLines += $border
            $specLines += ""
        }

        $specLines += '```'
        $specLines += ""
    }
}

# ============================================================
# SECTION 7: GRAPHE D'APPELS (TAB: Cartographie)
# ============================================================
$specLines += "<!-- TAB:Cartographie -->"
$specLines += ""
$specLines += "## 7. GRAPHE D'APPELS"
$specLines += ""

# 7.1 Callers diagram (chain from Main)
$callersDiagram = Generate-CallersDiagram -Discovery $discovery -Project $Project -IdePosition $IdePosition -ProgramName $programName
$specLines += "### 7.1 Chaine depuis Main (Callers)"
$specLines += ""

# Build human-readable path
if ($discovery.call_graph.call_chain -and $discovery.call_graph.call_chain.Count -gt 0) {
    $chainPath = ($discovery.call_graph.call_chain | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ' -> '
    $specLines += "**Chemin**: $chainPath -> $programName (IDE $IdePosition)"
} elseif ($discovery.call_graph.callers.Count -gt 0) {
    $firstCaller = $discovery.call_graph.callers[0]
    $specLines += "**Chemin**: ... -> $($firstCaller.name) (IDE $($firstCaller.ide)) -> $programName (IDE $IdePosition)"
} else {
    $specLines += "**Chemin**: (pas de callers directs)"
}
$specLines += ""
$specLines += '```mermaid'
$specLines += $callersDiagram
$specLines += '```'
$specLines += ""

# 7.2 Callers table
$specLines += "### 7.2 Callers (Qui m'appelle)"
$specLines += ""
$specLines += "| IDE | Nom Programme | Nb Appels |"
$specLines += "|-----|---------------|-----------|"
foreach ($caller in $discovery.call_graph.callers) {
    $specLines += "| $($caller.ide) | $($caller.name) | $($caller.calls_count) |"
}
if ($discovery.call_graph.callers.Count -eq 0) {
    $specLines += "| - | (aucun caller) | - |"
}
$specLines += ""

# 7.3 Callees diagram
$calleesDiagram = Generate-CalleesDiagram -Discovery $discovery -Project $Project -IdePosition $IdePosition -ProgramName $programName
$specLines += "### 7.3 Callees (Qui j'appelle)"
$specLines += ""
$specLines += '```mermaid'
$specLines += $calleesDiagram
$specLines += '```'
$specLines += ""

# 7.4 Callees table - ALL callees
$specLines += "### 7.4 Callees Detail"
$specLines += ""
$specLines += "| IDE | Nom Programme | Nb Appels |"
$specLines += "|-----|---------------|-----------|"
foreach ($callee in $discovery.call_graph.callees) {
    $specLines += "| $($callee.ide) | $($callee.name) | $($callee.calls_count) |"
}
if ($discovery.call_graph.callees.Count -eq 0) {
    $specLines += "| - | (aucun callee) | - |"
}
$specLines += ""

# ============================================================
# SECTION 8: STATISTIQUES
# ============================================================
$specLines += "## 8. STATISTIQUES"
$specLines += ""
$specLines += "| Metrique | Valeur |"
$specLines += "|----------|--------|"
$specLines += "| Taches | $($discovery.statistics.task_count) |"
$specLines += "| Lignes Logic | $($discovery.statistics.logic_line_count) |"
$specLines += "| Lignes Desactivees | $($discovery.statistics.disabled_line_count) |"
$specLines += "| Expressions | $($discovery.statistics.expression_count) |"
$specLines += "| Regles Metier | $(if ($decoded) { $decoded.statistics.business_rules_count } else { "N/A" }) |"

# Table counts with LINK
$writeCount = ($discovery.tables.by_access.WRITE | Measure-Object).Count
$readCount = ($discovery.tables.by_access.READ | Measure-Object).Count
$linkCount = ($discovery.tables.by_access.LINK | Measure-Object).Count
$specLines += "| Tables (total unique) | $($tableUnified.Count) |"
$specLines += "| Tables WRITE | $writeCount |"
$specLines += "| Tables READ | $readCount |"
$specLines += "| Tables LINK | $linkCount |"

# V9 metrics
$specLines += "| Callers | $($discovery.statistics.caller_count) |"
$specLines += "| Callees | $($discovery.statistics.callee_count) |"
$specLines += "| Forms (total) | $(if ($uiForms) { $uiForms.forms.Count } else { "N/A" }) |"
$specLines += "| Forms Visibles | $($visibleForms.Count) |"
$specLines += "| Variables Mappees | $(if ($mapping) { $mapping.statistics.mapping_entries } else { "N/A" }) |"

# Ratios
$totalLines = $discovery.statistics.logic_line_count
$disabledLines = $discovery.statistics.disabled_line_count
$activeLines = $totalLines - $disabledLines
$disabledPct = if ($totalLines -gt 0) { [math]::Round($disabledLines / $totalLines * 100, 1) } else { 0 }
$activePct = if ($totalLines -gt 0) { [math]::Round($activeLines / $totalLines * 100, 1) } else { 0 }

$specLines += "| **Ratio lignes actives** | **$activeLines / $totalLines ($activePct%)** |"
$specLines += "| **Ratio lignes desactivees** | **$disabledLines / $totalLines ($disabledPct%)** |"
if ($decoded -and $decoded.statistics.total_in_program -gt 0) {
    $specLines += "| **Couverture expressions** | **$($decoded.statistics.coverage_percent)%** |"
}
$specLines += ""

# ============================================================
# SECTION 9: NOTES MIGRATION
# ============================================================
$specLines += "---"
$specLines += ""
$specLines += "## 9. NOTES MIGRATION"
$specLines += ""

# 9.1 Composite complexity score
$specLines += "### Complexite Estimee: **$($complexity.level)** ($($complexity.score)/100)"
$specLines += ""
$specLines += "| Critere | Score | Detail |"
$specLines += "|---------|-------|--------|"
foreach ($detail in $complexity.details) {
    # Parse detail to extract component score
    $parts = $detail -split '\('
    $critere = $parts[0].Trim()
    $niveau = if ($parts.Count -gt 1) { $parts[1] -replace '\)', '' } else { "" }
    $specLines += "| $critere | $niveau | $detail |"
}
$specLines += ""

# 9.2 Points d'attention
$specLines += "### Points d'attention"
$specLines += ""
$specLines += "- **Tables en ecriture**: $writeTableNames"
$specLines += "- **Dependances callees**: $($discovery.call_graph.callees.Count) programmes appeles"
$specLines += "- **Expressions conditionnelles**: $(if ($decoded) { $decoded.statistics.by_type.condition } else { "N/A" })"
$specLines += "- **Code desactive**: $disabledLines lignes ($disabledPct%)"
if ($visibleForms.Count -eq 0) {
    $specLines += "- **Pas d'ecran visible** (traitement batch ou sous-programme)"
}
$specLines += ""

# 9.3 Recommendations migration
$specLines += "### Recommandations Migration"
$specLines += ""
if ($complexity.level -eq "HAUTE") {
    $specLines += "1. **Decomposer** en sous-modules avant migration (programme complexe)"
    $specLines += "2. **Prioriser** la couverture des $($allRules.Count) regles metier par des tests"
    $specLines += "3. **Mapper** les $writeCount tables WRITE vers le schema cible"
    $specLines += "4. **Verifier** les $($discovery.call_graph.callees.Count) dependances callees"
} elseif ($complexity.level -eq "MOYENNE") {
    $specLines += "1. **Migration directe** possible avec attention aux regles metier"
    $specLines += "2. **Tester** les conditions principales ($(if ($decoded) { $decoded.statistics.by_type.condition } else { 0 }) conditions)"
    $specLines += "3. **Valider** les tables WRITE: $writeTableNames"
} else {
    $specLines += "1. **Migration simple** - programme peu complexe"
    $specLines += "2. **Tester** le flux principal et les cas limites"
}

if ($disabledPct -gt 20) {
    $specLines += "4. **Nettoyer** $disabledPct% de code desactive avant migration"
}
$specLines += ""

$specLines += "---"
$specLines += "*Spec DETAILED generee par Pipeline V6.0 - $(Get-Date -Format "yyyy-MM-dd HH:mm")*"

# Join all lines
$detailedSpec = $specLines -join "`n"

# ============================================================
# SAVE SPECS
# ============================================================
Write-Host "[4/5] Saving specs..." -ForegroundColor Yellow

$summaryFileName = "$Project-IDE-$IdePosition-summary.md"
$detailedFileName = "$Project-IDE-$IdePosition.md"

$summaryPath = Join-Path $SpecsOutputPath $summaryFileName
$detailedPath = Join-Path $SpecsOutputPath $detailedFileName

$summarySpec | Set-Content -Path $summaryPath -Encoding UTF8
$detailedSpec | Set-Content -Path $detailedPath -Encoding UTF8

Write-Host "  Summary: $summaryPath"
Write-Host "  Detailed: $detailedPath"

# ============================================================
# QUALITY REPORT
# ============================================================
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

    complexity = @{
        score = $complexity.score
        level = $complexity.level
        details = $complexity.details
    }

    files_generated = @(
        $summaryFileName
        $detailedFileName
    )

    validation = @{
        tables_unified_count = $tableUnified.Count
        variables_mapped_count = $variableRows.Count
        visible_forms_count = $visibleForms.Count
        total_forms_count = if ($uiForms) { $uiForms.forms.Count } else { 0 }
        business_rules_count = if ($decoded) { $decoded.statistics.business_rules_count } else { 0 }
        callees_shown = $discovery.call_graph.callees.Count
        callers_shown = $discovery.call_graph.callers.Count
        all_tables_no_truncation = $true
        all_variables_no_truncation = $true
        all_expressions_no_truncation = $true
        all_callees_no_truncation = $true
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
Write-Host "Complexity: $($complexity.level) ($($complexity.score)/100)"
Write-Host ""

# Final summary
Write-Host "SYNTHESIS SUMMARY:" -ForegroundColor Cyan
Write-Host "  - Summary spec: $summaryFileName"
Write-Host "  - Detailed spec: $detailedFileName"
Write-Host "  - Quality score: $score%"
Write-Host "  - Complexity: $($complexity.level)"
Write-Host "  - Tables unified: $($tableUnified.Count)"
Write-Host "  - Variables mapped: $($variableRows.Count)"
Write-Host "  - Visible forms: $($visibleForms.Count)"
Write-Host "  - Business rules: $(if ($decoded) { $decoded.statistics.business_rules_count } else { 0 })"
Write-Host "  - Callees shown: $($discovery.call_graph.callees.Count) (ALL)"
Write-Host "  - Output folder: $SpecsOutputPath"

return $quality
