# Phase5-Synthesis.ps1 - V7.0 Pipeline (4 Onglets)
# TAB 1: Resume (Fiche + Description + Blocs + Flux + Regles FR + Stats)
# TAB 2: Ecrans & Flux (Mockups + Navigation + Algorigramme)
# TAB 3: Donnees (Tables R/W/L + Variables Top20/Annexe + Expressions)
# TAB 4: Connexions (Graphes + Contexte + Complexite + Migration)

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$OutputPath,
    [string]$SpecsOutputPath
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

if (-not $OutputPath) {
    $OutputPath = Join-Path $ScriptDir "output\$Project-IDE-$IdePosition"
}
if (-not $SpecsOutputPath) {
    $SpecsOutputPath = Join-Path $ProjectRoot ".openspec\specs"
}
if (-not (Test-Path $SpecsOutputPath)) {
    New-Item -ItemType Directory -Path $SpecsOutputPath -Force | Out-Null
}

Write-Host "=== Phase 5: SYNTHESIS (V7.0 - 4 Onglets) ===" -ForegroundColor Cyan
Write-Host "Project: $Project | IDE: $IdePosition"

# ============================================================
# LOAD PHASE OUTPUTS
# ============================================================
Write-Host "[1/6] Loading phase outputs..." -ForegroundColor Yellow

$discovery = $null; $mapping = $null; $decoded = $null; $uiForms = $null

$discoveryPath = Join-Path $OutputPath "discovery.json"
$mappingPath = Join-Path $OutputPath "mapping.json"
$decodedPath = Join-Path $OutputPath "decoded.json"
$uiFormsPath = Join-Path $OutputPath "ui_forms.json"

if (Test-Path $discoveryPath) { $discovery = Get-Content $discoveryPath -Raw | ConvertFrom-Json }
if (Test-Path $mappingPath) { $mapping = Get-Content $mappingPath -Raw | ConvertFrom-Json }
if (Test-Path $decodedPath) { $decoded = Get-Content $decodedPath -Raw | ConvertFrom-Json }
if (Test-Path $uiFormsPath) { $uiForms = Get-Content $uiFormsPath -Raw | ConvertFrom-Json }

if (-not $discovery) {
    Write-Host "ERROR: discovery.json not found" -ForegroundColor Red
    exit 1
}

$programName = $discovery.metadata.program_name
$startTime = Get-Date

# ============================================================
# HELPER FUNCTIONS
# ============================================================

function Clean-MermaidLabel {
    param([string]$Text)
    $clean = $Text -replace "['""`<>{}()\[\]/\\?!&]", ''
    $clean = $clean -replace '\s+', ' '
    $clean = $clean.Trim()
    if ($clean.Length -gt 25) { $clean = $clean.Substring(0, 22) + "..." }
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

function Get-FunctionalBloc {
    param([string]$TaskName)
    $n = $TaskName.ToLower()
    if ($n -match 'saisie|transaction|vente') { return "Saisie" }
    if ($n -match 'regl|reglement|paiement|mop|moyen') { return "Reglement" }
    if ($n -match 'verif|controle|valid') { return "Validation" }
    if ($n -match 'print|ticket|edition|imprim') { return "Impression" }
    if ($n -match 'stock|calcul|compt') { return "Calcul" }
    if ($n -match 'bilat|transfer|devers') { return "Transfert" }
    if ($n -match 'affich|zoom|select|choix|rech') { return "Consultation" }
    if ($n -match 'creat|insert|ajout') { return "Creation" }
    if ($n -match 'init|raz|reinit') { return "Initialisation" }
    return "Traitement"
}

function Reformulate-BusinessRule {
    param([string]$Decoded, [string]$RuleId)

    $text = $Decoded

    # IF(var='val','then','else') - simple equality
    if ($text -match "^IF\(([^=]+)='([^']+)','([^']+)','([^']+)'\)$") {
        $var = $Matches[1].Trim()
        return "Si $var vaut '$($Matches[2])' alors '$($Matches[3])', sinon '$($Matches[4])'"
    }

    # IF(Trim(var)='1',...) - service village pattern
    if ($text -match "Trim\(([^)]+)\)='(\d)'" -and $text -match 'ALLER|RETOUR') {
        return "Determine le sens du trajet selon le service village (1=ALLER, 2=RETOUR, 3=A/R)"
    }

    # IF(var=0, IF(var2='XXX', ...)) - nested with zero check
    if ($text -match "^IF\(([^=]+)=0,IF\(([^=]+)='([^']+)',") {
        $var1 = $Matches[1].Trim()
        $var2 = $Matches[2].Trim()
        $val = $Matches[3]
        return "Si $var1 est nul, choix conditionnel selon $var2 (valeur '$val')"
    }

    # IF(var='VRL',...) - imputation type
    if ($text -match "W0 imputation[^=]*='([^']+)'") {
        $imp = $Matches[1]
        return "Comportement conditionnel selon type d'imputation '$imp'"
    }

    # IF(NOT var, ...) - negation
    if ($text -match "^IF\(NOT\s+([^,]+),") {
        $var = $Matches[1].Trim()
        return "Si $var est FAUX, branche alternative"
    }

    # IF(IN(var,'A','B','C'), valTrue, valFalse) - membership
    if ($text -match "IF\(IN\s*\(([^,]+),") {
        $inVar = $Matches[1].Trim()
        if ($text -match "\d+\.\d+") {
            return "Position UI conditionnelle selon $inVar"
        }
    }

    # IF(var<>0 AND NOT(var2), Fix(a*b/100,...)) - percentage calc
    if ($text -match "Fix\([^*]+\*[^/]+/100") {
        return "Calcul de pourcentage avec arrondi"
    }

    # IF(var='',...) - empty check
    if ($text -match "^IF\s*\(([^=]+)=''") {
        $var = $Matches[1].Trim()
        return "Valeur par defaut si $var est vide"
    }

    # Generic fallback
    return "[Phase 2] Regle complexe"
}

function Calculate-ComplexityScore {
    param($Discovery, $Decoded)

    $score = 0
    $details = @()

    $exprCount = $Discovery.statistics.expression_count
    if ($exprCount -gt 200) { $score += 30; $details += "Expressions: $exprCount (HAUTE)" }
    elseif ($exprCount -gt 100) { $score += 20; $details += "Expressions: $exprCount (MOYENNE)" }
    elseif ($exprCount -gt 50) { $score += 10; $details += "Expressions: $exprCount (BASSE)" }
    else { $details += "Expressions: $exprCount (MINIMALE)" }

    $taskCount = $Discovery.statistics.task_count
    if ($taskCount -gt 30) { $score += 20; $details += "Taches: $taskCount (HAUTE)" }
    elseif ($taskCount -gt 15) { $score += 13; $details += "Taches: $taskCount (MOYENNE)" }
    elseif ($taskCount -gt 5) { $score += 7; $details += "Taches: $taskCount (BASSE)" }
    else { $details += "Taches: $taskCount (MINIMALE)" }

    $writeCount = ($Discovery.tables.by_access.WRITE | Measure-Object).Count
    if ($writeCount -gt 5) { $score += 20; $details += "Tables WRITE: $writeCount (HAUTE)" }
    elseif ($writeCount -gt 3) { $score += 13; $details += "Tables WRITE: $writeCount (MOYENNE)" }
    elseif ($writeCount -gt 0) { $score += 7; $details += "Tables WRITE: $writeCount (BASSE)" }
    else { $details += "Tables WRITE: 0 (AUCUNE)" }

    $calleeCount = $Discovery.statistics.callee_count
    if ($calleeCount -gt 10) { $score += 15; $details += "Callees: $calleeCount (HAUTE)" }
    elseif ($calleeCount -gt 5) { $score += 10; $details += "Callees: $calleeCount (MOYENNE)" }
    elseif ($calleeCount -gt 0) { $score += 5; $details += "Callees: $calleeCount (BASSE)" }
    else { $details += "Callees: 0 (ISOLE)" }

    $totalLines = $Discovery.statistics.logic_line_count
    $disabledLines = $Discovery.statistics.disabled_line_count
    $disabledRatio = if ($totalLines -gt 0) { [math]::Round($disabledLines / $totalLines * 100, 1) } else { 0 }
    if ($disabledRatio -gt 30) { $score += 15; $details += "Code desactive: ${disabledRatio}% (HAUTE)" }
    elseif ($disabledRatio -gt 15) { $score += 10; $details += "Code desactive: ${disabledRatio}% (MOYENNE)" }
    elseif ($disabledRatio -gt 5) { $score += 5; $details += "Code desactive: ${disabledRatio}% (BASSE)" }
    else { $details += "Code desactive: ${disabledRatio}% (SAIN)" }

    $level = if ($score -ge 70) { "HAUTE" } elseif ($score -ge 40) { "MOYENNE" } else { "BASSE" }

    return @{ score = $score; level = $level; details = $details; disabled_ratio = $disabledRatio }
}

# ============================================================
# DATA PREPARATION
# ============================================================
Write-Host "[2/6] Preparing data..." -ForegroundColor Yellow

$complexity = Calculate-ComplexityScore -Discovery $discovery -Decoded $decoded

# Forms
$allForms = @()
$visibleForms = @()
if ($uiForms -and $uiForms.forms) {
    $allForms = @($uiForms.forms)
    $visibleForms = @($uiForms.forms | Where-Object { $_.dimensions.width -gt 0 } | Sort-Object { $_.task_isn2 })
}

# Functional blocks
$blocMap = [ordered]@{}
foreach ($form in $allForms) {
    $bloc = Get-FunctionalBloc $form.name
    if (-not $blocMap.Contains($bloc)) { $blocMap[$bloc] = @() }
    $blocMap[$bloc] += $form
}

# Tables unified R/W/L
$tableUnified = @{}
if ($discovery.tables.all) {
    foreach ($t in $discovery.tables.all) {
        $key = "$($t.id)"
        if (-not $tableUnified.ContainsKey($key)) {
            $tableUnified[$key] = @{
                id = $t.id; logical_name = $t.logical_name; physical_name = $t.physical_name
                R = $false; W = $false; L = $false; usage_total = 0
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

# Variables ranked
$variableRows = @()
if ($mapping -and $mapping.variable_mapping) {
    $dataTypeLookup = @{}
    if ($mapping.variables -and $mapping.variables.local) {
        foreach ($v in $mapping.variables.local) {
            $lk = "$($v.letter)|$($v.name)"
            if (-not $dataTypeLookup.ContainsKey($lk)) { $dataTypeLookup[$lk] = $v.data_type }
        }
    }
    $mapping.variable_mapping.PSObject.Properties | ForEach-Object {
        $ref = $_.Name; $letter = $_.Value.letter; $name = $_.Value.name
        $category = Get-VariableCategory $name
        $lk = "$letter|$name"
        $dataType = if ($dataTypeLookup.ContainsKey($lk)) { $dataTypeLookup[$lk] } else { "N/A" }
        $variableRows += [PSCustomObject]@{
            Ref = $ref; Letter = $letter; Name = $name
            Category = $category; DataType = $dataType; VarType = $_.Value.type
        }
    }
    $catOrder = @{ "P0" = 0; "W0" = 1; "V." = 2; "VG" = 3; "Autre" = 4 }
    $variableRows = $variableRows | Sort-Object { $catOrder[$_.Category] }, { $_.Letter.Length }, { $_.Letter }
}

# Business rules
$businessRules = @()
if ($decoded -and $decoded.business_rules -and $decoded.business_rules.all) {
    $businessRules = @($decoded.business_rules.all)
}

# Expression by type
$exprByType = @{}
if ($decoded -and $decoded.expressions -and $decoded.expressions.by_type) {
    $decoded.expressions.by_type.PSObject.Properties | ForEach-Object {
        $exprByType[$_.Name] = @($_.Value)
    }
}

# Callees with context
$calleesCtx = @()
foreach ($callee in $discovery.call_graph.callees) {
    $cn = $callee.name.ToLower()
    $ctx = if ($cn -match 'print|ticket|edition') { "Impression ticket/document" }
    elseif ($cn -match 'stock|calc') { "Calcul de donnees" }
    elseif ($cn -match 'recup|get') { "Recuperation donnees" }
    elseif ($cn -match 'zoom|select|choix') { "Selection/consultation" }
    elseif ($cn -match 'solde|resort|gift') { "Verification solde" }
    elseif ($cn -match 'devers|transfer') { "Transfert donnees" }
    elseif ($cn -match 'reinit|raz|init') { "Reinitialisation" }
    elseif ($cn -match 'caract|interdit') { "Validation saisie" }
    elseif ($cn -match 'printer|list') { "Configuration impression" }
    elseif ($cn -match 'cheque|gestion') { "Gestion moyens paiement" }
    elseif ($cn -match 'fidel|remise') { "Programme fidelite" }
    elseif ($cn -match 'matric') { "Identification operateur" }
    else { "[Phase 2]" }
    $calleesCtx += @{ ide = $callee.ide; name = $callee.name; calls_count = $callee.calls_count; context = $ctx }
}

$writeCount = ($discovery.tables.by_access.WRITE | Measure-Object).Count
$readCount = ($discovery.tables.by_access.READ | Measure-Object).Count
$linkCount = ($discovery.tables.by_access.LINK | Measure-Object).Count
$taskCount = $discovery.statistics.task_count
$exprCount = $discovery.statistics.expression_count
$calleeCount = $discovery.statistics.callee_count

Write-Host "  $($visibleForms.Count) visible forms, $($blocMap.Count) blocks, $($businessRules.Count) rules"

# ============================================================
# GENERATE SUMMARY SPEC
# ============================================================
Write-Host "[3/6] Generating SUMMARY spec..." -ForegroundColor Yellow

$writeTableNames = ($discovery.tables.by_access.WRITE | ForEach-Object { $_.logical_name }) -join ', '
$callersList = if ($discovery.call_graph.callers.Count -gt 0) {
    ($discovery.call_graph.callers | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
} else { "(aucun)" }
$calleesList = if ($discovery.call_graph.callees.Count -gt 0) {
    ($discovery.call_graph.callees | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
} else { "(aucun)" }

$summarySpec = @"
# $Project IDE $IdePosition - $programName

> **Analyse**: $($startTime.ToString("yyyy-MM-dd HH:mm"))
> **Pipeline**: V7.0 Deep Analysis

## RESUME EXECUTIF

- **Fonction**: $programName
- **Tables modifiees**: $writeCount
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
| Taches | $taskCount |
| Lignes Logic | $($discovery.statistics.logic_line_count) |
| Expressions | $exprCount |
| Tables | $($discovery.statistics.table_count) |

---
*Spec SUMMARY generee par Pipeline V7.0*
"@

# ============================================================
# GENERATE DETAILED SPEC - 4 TABS
# ============================================================
Write-Host "[4/6] Generating DETAILED spec (4 tabs)..." -ForegroundColor Yellow

$L = [System.Collections.ArrayList]::new()

function Add-Line { param([string]$Text = "") $null = $L.Add($Text) }

# --- HEADER ---
Add-Line "# $Project IDE $IdePosition - $programName"
Add-Line
Add-Line "> **Analyse**: $($startTime.ToString('yyyy-MM-dd HH:mm'))"
Add-Line "> **Pipeline**: V7.0 Deep Analysis"
Add-Line "> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)"
Add-Line

# ████████████████████████████████████████████████████████████
# TAB 1: RESUME
# ████████████████████████████████████████████████████████████
Add-Line "<!-- TAB:Resume -->"
Add-Line

# --- 1. Fiche identite ---
Add-Line "## 1. FICHE D'IDENTITE"
Add-Line
Add-Line "| Attribut | Valeur |"
Add-Line "|----------|--------|"
Add-Line "| Projet | $Project |"
Add-Line "| IDE Position | $IdePosition |"
Add-Line "| Nom Programme | $programName |"
Add-Line "| Complexite | **$($complexity.level)** ($($complexity.score)/100) |"
Add-Line "| Statut | $($discovery.orphan_analysis.status) |"
Add-Line "| Raison | $($discovery.orphan_analysis.reason) |"
Add-Line "| Taches | $taskCount |"
Add-Line "| Ecrans visibles | $($visibleForms.Count) |"
Add-Line "| Tables modifiees | $writeCount |"
Add-Line "| Programmes appeles | $calleeCount |"
Add-Line

# --- 2. Description ---
Add-Line "## 2. DESCRIPTION"
Add-Line
Add-Line "**$programName** est un programme de complexite **$($complexity.level)** comportant $taskCount taches et $exprCount expressions."
Add-Line
if ($visibleForms.Count -gt 0) {
    $vNames = ($visibleForms | ForEach-Object { $_.name }) -join ', '
    Add-Line "Il presente $($visibleForms.Count) ecran(s) a l'utilisateur: $vNames."
    Add-Line "Il modifie $writeCount table(s) en base et delegue des traitements a $calleeCount sous-programme(s)."
} else {
    Add-Line "Ce programme est un traitement sans interface visible (batch ou sous-programme)."
    Add-Line "Il modifie $writeCount table(s) et delegue $calleeCount sous-programme(s)."
}
Add-Line
if ($discovery.call_graph.callers.Count -gt 0) {
    $cNames = ($discovery.call_graph.callers | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
    Add-Line "**Contexte d'appel**: Appele depuis $cNames."
    Add-Line
}

# --- 3. Blocs fonctionnels ---
Add-Line "## 3. BLOCS FONCTIONNELS"
Add-Line
if ($blocMap.Count -gt 0) {
    $bIdx = 1
    foreach ($blocName in $blocMap.Keys) {
        $blocForms = $blocMap[$blocName]
        $vis = @($blocForms | Where-Object { $_.dimensions.width -gt 0 })
        $invis = @($blocForms | Where-Object { $_.dimensions.width -le 0 })

        Add-Line "### 3.$bIdx $blocName ($($blocForms.Count) taches)"
        Add-Line
        if ($vis.Count -gt 0) {
            foreach ($f in $vis) {
                Add-Line "- **$($f.name)** (Tache $($f.task_isn2), $($f.window_type_str), $($f.dimensions.width)x$($f.dimensions.height))"
            }
        }
        if ($invis.Count -gt 0) {
            $iNames = ($invis | ForEach-Object { "$($_.name) (T$($_.task_isn2))" }) -join ', '
            Add-Line "- *Traitements internes*: $iNames"
        }
        Add-Line
        $bIdx++
    }
}

# --- 4. Flux utilisateur ---
Add-Line "## 4. FLUX UTILISATEUR"
Add-Line
if ($visibleForms.Count -gt 1) {
    Add-Line "Enchainement principal des ecrans:"
    Add-Line
    $sNum = 1
    foreach ($form in $visibleForms) {
        Add-Line "$sNum. **$($form.name)** ($($form.window_type_str))"
        $sNum++
    }
    Add-Line
} elseif ($visibleForms.Count -eq 1) {
    Add-Line "Ecran unique: **$($visibleForms[0].name)** ($($visibleForms[0].window_type_str), $($visibleForms[0].dimensions.width)x$($visibleForms[0].dimensions.height))"
    Add-Line
} else {
    Add-Line "Programme sans ecran visible (traitement interne)."
    Add-Line
}

# --- 5. Regles metier en francais ---
Add-Line "## 5. REGLES METIER"
Add-Line
if ($businessRules.Count -gt 0) {
    Add-Line "$($businessRules.Count) regles identifiees:"
    Add-Line
    foreach ($rule in $businessRules) {
        $dExpr = if ($rule.decoded_expression) { $rule.decoded_expression } elseif ($rule.decoded) { $rule.decoded } else { $rule.raw_expression }
        $frRule = Reformulate-BusinessRule -Decoded $dExpr -RuleId $rule.id
        Add-Line "- **[$($rule.id)]** $frRule"
        Add-Line "  > ``$dExpr``"
    }
    Add-Line
} else {
    Add-Line "*(Aucune regle metier identifiee)*"
    Add-Line
}

# --- 6. Programmes lies ---
Add-Line "## 6. PROGRAMMES LIES"
Add-Line
$clrCompact = if ($discovery.call_graph.callers.Count -gt 0) {
    ($discovery.call_graph.callers | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
} else { "(aucun)" }
$cleCompact = if ($discovery.call_graph.callees.Count -gt 0) {
    ($discovery.call_graph.callees | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
} else { "(aucun)" }
Add-Line "- **Appele par**: $clrCompact"
Add-Line "- **Appelle**: $cleCompact"
Add-Line

# --- 7. Statistiques ---
Add-Line "## 7. STATISTIQUES"
Add-Line
Add-Line "| Metrique | Valeur |"
Add-Line "|----------|--------|"
Add-Line "| Taches | $taskCount |"
Add-Line "| Ecrans visibles | $($visibleForms.Count) / $($allForms.Count) |"
Add-Line "| Lignes Logic | $($discovery.statistics.logic_line_count) |"
Add-Line "| Expressions | $exprCount |"
Add-Line "| Regles metier | $($businessRules.Count) |"
Add-Line "| Tables | $($tableUnified.Count) (W:$writeCount R:$readCount L:$linkCount) |"
Add-Line "| Programmes appeles | $calleeCount |"
Add-Line

# ████████████████████████████████████████████████████████████
# TAB 2: ECRANS & FLUX
# ████████████████████████████████████████████████████████████
Add-Line "<!-- TAB:Ecrans -->"
Add-Line

# --- 8. Ecrans ---
Add-Line "## 8. ECRANS"
Add-Line

if ($visibleForms.Count -gt 0) {
    Add-Line "### 8.1 Forms visibles ($($visibleForms.Count) / $($allForms.Count))"
    Add-Line
    Add-Line "| # | Tache | Nom | Type | Largeur | Hauteur |"
    Add-Line "|---|-------|-----|------|---------|---------|"
    $fIdx = 1
    foreach ($form in $visibleForms) {
        Add-Line "| $fIdx | $($form.task_isn2) | $($form.name) | $($form.window_type_str) | $($form.dimensions.width) | $($form.dimensions.height) |"
        $fIdx++
    }
    Add-Line

    # ASCII mockup
    Add-Line "### 8.2 Mockups Ecrans"
    Add-Line
    Add-Line '```'
    foreach ($form in $visibleForms) {
        $title = $form.name
        $w = $form.dimensions.width
        $h = $form.dimensions.height
        $type = $form.window_type_str
        $tNum = $form.task_isn2

        $boxWidth = [math]::Min([math]::Max([math]::Round($w / 20), 30), 70)
        $boxHeight = [math]::Max([math]::Round($h / 60), 3)

        $headerText = " $title [$type] ${w}x${h} - Tache $tNum "
        if ($headerText.Length -gt $boxWidth - 2) {
            $headerText = $headerText.Substring(0, $boxWidth - 5) + "... "
        }

        $topBorder = "+" + ("=" * ($boxWidth - 2)) + "+"
        $midBorder = "+" + ("-" * ($boxWidth - 2)) + "+"
        $emptyLine = "|" + (" " * ($boxWidth - 2)) + "|"

        Add-Line $topBorder
        Add-Line "|$($headerText.PadRight($boxWidth - 2))|"
        Add-Line $midBorder
        $contentLine = "  [Phase 2: controles reels]"
        Add-Line "|$($contentLine.PadRight($boxWidth - 2))|"
        for ($i = 0; $i -lt [math]::Min($boxHeight, 4); $i++) { Add-Line $emptyLine }
        Add-Line $topBorder
        Add-Line ""
    }
    Add-Line '```'
    Add-Line
} else {
    Add-Line "*(Programme sans ecran visible)*"
    Add-Line
}

# --- 9. Navigation ---
Add-Line "## 9. NAVIGATION"
Add-Line

if ($visibleForms.Count -gt 1) {
    Add-Line "### 9.1 Enchainement des ecrans"
    Add-Line
    Add-Line '```mermaid'
    Add-Line "flowchart LR"
    Add-Line "    START([Entree])"
    Add-Line "    style START fill:#3fb950"

    $prevNode = "START"
    $navIdx = 1
    foreach ($form in $visibleForms) {
        $fl = Clean-MermaidLabel $form.name
        $nId = "F$navIdx"
        Add-Line "    $nId[$fl]"
        Add-Line "    $prevNode --> $nId"
        $prevNode = $nId
        $navIdx++
    }
    Add-Line "    FIN([Sortie])"
    Add-Line "    style FIN fill:#f85149"
    Add-Line "    $prevNode --> FIN"
    Add-Line '```'
    Add-Line
} elseif ($visibleForms.Count -eq 1) {
    Add-Line "Ecran unique: **$($visibleForms[0].name)**"
    Add-Line
}

# Decision algorigramme
Add-Line "### 9.2 Logique decisionnelle"
Add-Line

if ($businessRules.Count -gt 0) {
    Add-Line '```mermaid'
    Add-Line "flowchart TD"
    Add-Line "    START([START])"
    Add-Line "    style START fill:#3fb950"

    $prevNode = "START"
    $dIdx = 1
    $maxDec = [math]::Min($businessRules.Count, 6)

    foreach ($rule in ($businessRules | Select-Object -First $maxDec)) {
        $dExpr = if ($rule.decoded) { $rule.decoded } else { $rule.raw_expression }
        $frLbl = Reformulate-BusinessRule -Decoded $dExpr -RuleId $rule.id
        $shortLbl = Clean-MermaidLabel $frLbl

        Add-Line "    D$dIdx{$shortLbl}"
        Add-Line "    style D$dIdx fill:#58a6ff"
        Add-Line "    $prevNode --> D$dIdx"
        Add-Line "    D$dIdx -->|OUI| A$dIdx[Traitement $($rule.id)]"
        Add-Line "    D$dIdx -->|NON| S$dIdx[Suite]"
        Add-Line "    A$dIdx --> S$dIdx"
        $prevNode = "S$dIdx"
        $dIdx++
    }

    if ($businessRules.Count -gt $maxDec) {
        $rem = $businessRules.Count - $maxDec
        Add-Line "    MORE[+ $rem autres regles]"
        Add-Line "    $prevNode --> MORE"
        $prevNode = "MORE"
    }
    Add-Line "    ENDOK([FIN])"
    Add-Line "    style ENDOK fill:#f85149"
    Add-Line "    $prevNode --> ENDOK"
    Add-Line '```'
    Add-Line
} else {
    Add-Line "*(Pas de regles metier pour l'algorigramme)*"
    Add-Line
}

# All tasks list
if ($allForms.Count -gt $visibleForms.Count) {
    Add-Line "### 9.3 Toutes les taches ($($allForms.Count))"
    Add-Line
    Add-Line "| Tache | Nom | Type | Visible | Bloc |"
    Add-Line "|-------|-----|------|---------|------|"
    foreach ($form in ($allForms | Sort-Object { $_.task_isn2 })) {
        $isVis = if ($form.dimensions.width -gt 0) { "OUI" } else { "-" }
        $bloc = Get-FunctionalBloc $form.name
        Add-Line "| $($form.task_isn2) | $($form.name) | $($form.window_type_str) | $isVis | $bloc |"
    }
    Add-Line
}

# ████████████████████████████████████████████████████████████
# TAB 3: DONNEES
# ████████████████████████████████████████████████████████████
Add-Line "<!-- TAB:Donnees -->"
Add-Line

# --- 10. Tables ---
Add-Line "## 10. TABLES"
Add-Line
Add-Line "### 10.1 Vue unifiee ($($tableUnified.Count) tables)"
Add-Line
Add-Line "| ID | Nom Logique | Nom Physique | R | W | L | Stockage | Usages |"
Add-Line "|----|-------------|--------------|---|---|---|----------|--------|"
$sortedTables = $tableUnified.Values | Sort-Object { [int]$_.id }
foreach ($t in $sortedTables) {
    $rM = if ($t.R) { "R" } else { "-" }
    $wM = if ($t.W) { "**W**" } else { "-" }
    $lM = if ($t.L) { "L" } else { "-" }
    Add-Line "| $($t.id) | $($t.logical_name) | $($t.physical_name) | $rM | $wM | $lM | $($t.storage) | $($t.usage_total) |"
}
Add-Line
Add-Line "### 10.2 Colonnes utilisees"
Add-Line
Add-Line "*[Phase 2] Analyse detaillee des colonnes reellement lues/modifiees par table.*"
Add-Line

# --- 11. Variables ---
Add-Line "## 11. VARIABLES"
Add-Line

if ($variableRows.Count -gt 0) {
    $top20 = $variableRows | Select-Object -First 20
    Add-Line "### 11.1 Variables principales (Top 20 / $($variableRows.Count))"
    Add-Line
    Add-Line "| Cat | Lettre | Nom Variable | Type | Ref |"
    Add-Line "|-----|--------|--------------|------|-----|"
    foreach ($v in $top20) {
        Add-Line "| $($v.Category) | **$($v.Letter)** | $($v.Name) | $($v.DataType) | ``$($v.Ref)`` |"
    }
    Add-Line

    if ($variableRows.Count -gt 20) {
        Add-Line "### 11.2 Variables completes ($($variableRows.Count) entrees)"
        Add-Line
        Add-Line "<details>"
        Add-Line "<summary>Voir toutes les $($variableRows.Count) variables</summary>"
        Add-Line
        Add-Line "| Cat | Lettre | Nom Variable | Type | Ref |"
        Add-Line "|-----|--------|--------------|------|-----|"
        foreach ($v in $variableRows) {
            Add-Line "| $($v.Category) | **$($v.Letter)** | $($v.Name) | $($v.DataType) | ``$($v.Ref)`` |"
        }
        Add-Line
        Add-Line "</details>"
        Add-Line
    }
}

# Parameters
if ($mapping -and $mapping.variables -and $mapping.variables.parameters -and $mapping.variables.parameters.Count -gt 0) {
    Add-Line "### 11.3 Parametres d'entree"
    Add-Line
    Add-Line "| Lettre | Nom | Type | Picture |"
    Add-Line "|--------|-----|------|---------|"
    foreach ($p in $mapping.variables.parameters) {
        Add-Line "| $($p.letter) | $($p.name) | $($p.data_type) | $($p.picture) |"
    }
    Add-Line
}

# --- 12. Expressions ---
Add-Line "## 12. EXPRESSIONS"
Add-Line

if ($decoded) {
    $totalExpr = $decoded.statistics.decoded_count
    $totalInProg = $decoded.statistics.total_in_program
    $coverage = $decoded.statistics.coverage_percent

    Add-Line "**$totalExpr / $totalInProg expressions decodees ($coverage%)**"
    Add-Line

    # Summary by type
    Add-Line "### 12.1 Repartition par type"
    Add-Line
    Add-Line "| Type | Nombre |"
    Add-Line "|------|--------|"
    if ($decoded.statistics.by_type) {
        $decoded.statistics.by_type.PSObject.Properties | ForEach-Object {
            Add-Line "| $($_.Name) | $($_.Value) |"
        }
    }
    Add-Line

    # Top 20 expressions
    $allExprs = @()
    foreach ($typeName in ($exprByType.Keys | Sort-Object)) {
        foreach ($expr in $exprByType[$typeName]) {
            $allExprs += @{
                type = $typeName
                ide_position = $expr.ide_position
                decoded = if ($expr.decoded) { $expr.decoded } else { $expr.raw }
                rule_id = $expr.business_rule_id
            }
        }
    }
    $allExprs = @($allExprs | Sort-Object { if ($_.rule_id) { "A" } else { "Z" } }, { $_.type })

    $top20Expr = $allExprs | Select-Object -First 20
    Add-Line "### 12.2 Expressions cles (Top 20)"
    Add-Line
    Add-Line "| # | Type | IDE | Expression | Regle |"
    Add-Line "|---|------|-----|------------|-------|"
    $eIdx = 1
    foreach ($e in $top20Expr) {
        $dt = $e.decoded -replace '\|', '\|'
        $rr = if ($e.rule_id) { $e.rule_id } else { "-" }
        Add-Line "| $eIdx | $($e.type) | $($e.ide_position) | ``$dt`` | $rr |"
        $eIdx++
    }
    Add-Line

    # Full expressions in details
    if ($allExprs.Count -gt 20) {
        Add-Line "### 12.3 Toutes les expressions ($($allExprs.Count))"
        Add-Line
        Add-Line "<details>"
        Add-Line "<summary>Voir les $($allExprs.Count) expressions</summary>"
        Add-Line
        foreach ($typeName in ($exprByType.Keys | Sort-Object)) {
            $exprs = $exprByType[$typeName]
            Add-Line "#### $typeName ($($exprs.Count))"
            Add-Line
            Add-Line "| IDE | Expression Decodee |"
            Add-Line "|-----|-------------------|"
            foreach ($expr in $exprs) {
                $dt = if ($expr.decoded) { $expr.decoded } else { $expr.raw }
                $dt = $dt -replace '\|', '\|'
                Add-Line "| $($expr.ide_position) | ``$dt`` |"
            }
            Add-Line
        }
        Add-Line "</details>"
        Add-Line
    }
}

# ████████████████████████████████████████████████████████████
# TAB 4: CONNEXIONS
# ████████████████████████████████████████████████████████████
Add-Line "<!-- TAB:Connexions -->"
Add-Line

# --- 13. Graphe d'appels ---
Add-Line "## 13. GRAPHE D'APPELS"
Add-Line

# Callers diagram
Add-Line "### 13.1 Chaine depuis Main (Callers)"
Add-Line

if ($discovery.call_graph.call_chain -and $discovery.call_graph.call_chain.Count -gt 0) {
    $chainNodes = @($discovery.call_graph.call_chain | Where-Object { $_.ide -gt 0 })
    $chainPath = ($chainNodes | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ' -> '
    Add-Line "**Chemin**: $chainPath -> $programName (IDE $IdePosition)"
} elseif ($discovery.call_graph.callers.Count -gt 0) {
    $fc = $discovery.call_graph.callers[0]
    Add-Line "**Chemin**: ... -> $($fc.name) (IDE $($fc.ide)) -> $programName (IDE $IdePosition)"
} else {
    Add-Line "**Chemin**: (pas de callers directs)"
}
Add-Line

Add-Line '```mermaid'
Add-Line "graph LR"
$tgtLabel = Clean-MermaidLabel "$IdePosition $programName"
Add-Line "    T$IdePosition[$tgtLabel]"
Add-Line "    style T$IdePosition fill:#58a6ff"

if ($discovery.call_graph.call_chain -and $discovery.call_graph.call_chain.Count -gt 0) {
    $prevNode = $null
    foreach ($node in $discovery.call_graph.call_chain) {
        if ($node.ide -le 0) { continue }
        $nId = "CC$($node.ide)"
        $nLbl = Clean-MermaidLabel "$($node.ide) $($node.name)"
        Add-Line "    $nId[$nLbl]"
        $clr = if ($node.level -eq 0) { "#8b5cf6" } else { "#f59e0b" }
        Add-Line "    style $nId fill:$clr"
        if ($prevNode) { Add-Line "    $prevNode --> $nId" }
        $prevNode = $nId
    }
    if ($prevNode) { Add-Line "    $prevNode --> T$IdePosition" }
} elseif ($discovery.call_graph.callers.Count -gt 0) {
    foreach ($caller in ($discovery.call_graph.callers | Where-Object { $_.ide -gt 0 })) {
        $cId = "CALLER$($caller.ide)"
        $cLbl = Clean-MermaidLabel "$($caller.ide) $($caller.name)"
        Add-Line "    $cId[$cLbl]"
        Add-Line "    $cId --> T$IdePosition"
        Add-Line "    style $cId fill:#f59e0b"
    }
} else {
    Add-Line "    NONE[Aucun caller]"
    Add-Line "    NONE -.-> T$IdePosition"
    Add-Line "    style NONE fill:#6b7280,stroke-dasharray: 5 5"
}
Add-Line '```'
Add-Line

# Callers table
Add-Line "### 13.2 Callers"
Add-Line
Add-Line "| IDE | Nom Programme | Nb Appels |"
Add-Line "|-----|---------------|-----------|"
foreach ($caller in $discovery.call_graph.callers) {
    Add-Line "| $($caller.ide) | $($caller.name) | $($caller.calls_count) |"
}
if ($discovery.call_graph.callers.Count -eq 0) { Add-Line "| - | (aucun) | - |" }
Add-Line

# Callees diagram
Add-Line "### 13.3 Callees (programmes appeles)"
Add-Line

Add-Line '```mermaid'
Add-Line "graph LR"
Add-Line "    T$IdePosition[$tgtLabel]"
Add-Line "    style T$IdePosition fill:#58a6ff"
$callees = @($discovery.call_graph.callees | Where-Object { $_.ide -gt 0 })
if ($callees.Count -eq 0) {
    Add-Line "    NONE[Aucun callee]"
    Add-Line "    T$IdePosition -.-> NONE"
    Add-Line "    style NONE fill:#6b7280,stroke-dasharray: 5 5"
} else {
    foreach ($callee in $callees) {
        $cId = "C$($callee.ide)"
        $cLbl = Clean-MermaidLabel "$($callee.ide) $($callee.name)"
        Add-Line "    $cId[$cLbl]"
        Add-Line "    T$IdePosition --> $cId"
        Add-Line "    style $cId fill:#3fb950"
    }
}
Add-Line '```'
Add-Line

# Callees table WITH CONTEXT
Add-Line "### 13.4 Detail Callees avec contexte"
Add-Line
Add-Line "| IDE | Nom Programme | Appels | Contexte |"
Add-Line "|-----|---------------|--------|----------|"
foreach ($c in $calleesCtx) {
    Add-Line "| $($c.ide) | $($c.name) | $($c.calls_count) | $($c.context) |"
}
if ($calleesCtx.Count -eq 0) { Add-Line "| - | (aucun) | - | - |" }
Add-Line

# --- 14. Complexite & Migration ---
Add-Line "## 14. COMPLEXITE ET MIGRATION"
Add-Line

Add-Line "### 14.1 Score: **$($complexity.level)** ($($complexity.score)/100)"
Add-Line
Add-Line "| Critere | Evaluation |"
Add-Line "|---------|------------|"
foreach ($detail in $complexity.details) {
    Add-Line "| $detail |  |"
}
Add-Line

# Effort estimation
$lines = $discovery.statistics.logic_line_count
$effortDays = [math]::Ceiling($lines / 100 + $exprCount / 50 + $writeCount * 0.5 + $calleeCount * 0.3)
$effortDays = [math]::Max($effortDays, 1)
if ($complexity.level -eq "HAUTE") { $effortDays = [math]::Ceiling($effortDays * 1.5) }

Add-Line "### 14.2 Estimation effort: **$effortDays jours**"
Add-Line

# Recommendations per block
Add-Line "### 14.3 Recommandations par bloc"
Add-Line
foreach ($blocName in $blocMap.Keys) {
    $blocForms = $blocMap[$blocName]
    $blocEffort = [math]::Max(1, [math]::Ceiling($effortDays * $blocForms.Count / [math]::Max($allForms.Count, 1)))

    Add-Line "#### $blocName ($($blocForms.Count) taches, ~${blocEffort}j)"
    Add-Line

    switch ($blocName) {
        "Saisie" {
            Add-Line "- Ecran principal de saisie a reproduire"
            Add-Line "- Gerer les validations champs"
        }
        "Reglement" {
            Add-Line "- Logique multi-moyens de paiement"
            Add-Line "- Integration TPE"
        }
        "Validation" { Add-Line "- Conditions de verification a transformer en validators" }
        "Impression" {
            Add-Line "- Generation tickets/documents"
            Add-Line "- Configuration imprimantes"
        }
        "Consultation" { Add-Line "- Ecrans zoom/selection en modales" }
        "Transfert" { Add-Line "- Logique deversement/transfert entre modules" }
        "Calcul" { Add-Line "- Logique de calcul a migrer (stock, compteurs)" }
        "Creation" { Add-Line "- Insertion de donnees (reglements, mouvements)" }
        "Initialisation" { Add-Line "- Reinitialisation etats/variables" }
        default { Add-Line "- Traitement standard a migrer" }
    }
    Add-Line
}

# Dependencies
Add-Line "### 14.4 Dependances critiques"
Add-Line
Add-Line "| Dependance | Type | Impact |"
Add-Line "|------------|------|--------|"
if ($discovery.tables.by_access.WRITE) {
    foreach ($tbl in $discovery.tables.by_access.WRITE) {
        Add-Line "| $($tbl.logical_name) | Table WRITE | Modification directe |"
    }
}
$critCallees = @($calleesCtx | Where-Object { $_.calls_count -ge 2 })
foreach ($c in $critCallees) {
    Add-Line "| IDE $($c.ide) - $($c.name) | Sous-programme ($($c.calls_count)x) | $($c.context) |"
}
Add-Line

# Disabled code
$totalLines = $discovery.statistics.logic_line_count
$disabledLines = $discovery.statistics.disabled_line_count
$disabledPct = if ($totalLines -gt 0) { [math]::Round($disabledLines / $totalLines * 100, 1) } else { 0 }
if ($disabledPct -gt 5) {
    Add-Line "### 14.5 Code desactive"
    Add-Line
    Add-Line "- **$disabledLines lignes desactivees** sur $totalLines ($disabledPct%)"
    Add-Line "- Recommandation: nettoyer avant migration"
    Add-Line
}

# Footer
Add-Line "---"
Add-Line "*Spec DETAILED generee par Pipeline V7.0 - $(Get-Date -Format 'yyyy-MM-dd HH:mm')*"

$detailedSpec = $L -join "`n"

# ============================================================
# SAVE SPECS
# ============================================================
Write-Host "[5/6] Saving specs..." -ForegroundColor Yellow

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
Write-Host "[6/6] Quality report..." -ForegroundColor Yellow

$endTime = Get-Date
$duration = $endTime - $startTime

$quality = @{
    metadata = @{
        project = $Project
        ide_position = $IdePosition
        program_name = $programName
        generated_at = $endTime.ToString("yyyy-MM-dd HH:mm:ss")
        duration_seconds = [math]::Round($duration.TotalSeconds, 1)
        pipeline_version = "7.0"
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
    complexity = @{ score = $complexity.score; level = $complexity.level; details = $complexity.details }
    structure = @{
        tabs = 4
        tab_names = @("Resume", "Ecrans", "Donnees", "Connexions")
        functional_blocks = $blocMap.Count
        business_rules_fr = $businessRules.Count
        callees_with_context = ($calleesCtx | Where-Object { $_.context -ne "[Phase 2]" }).Count
        migration_effort_days = $effortDays
    }
    files_generated = @($summaryFileName, $detailedFileName)
    validation = @{
        tables_unified_count = $tableUnified.Count
        variables_mapped_count = $variableRows.Count
        visible_forms_count = $visibleForms.Count
        total_forms_count = $allForms.Count
        business_rules_count = $businessRules.Count
        callees_shown = $discovery.call_graph.callees.Count
        callers_shown = $discovery.call_graph.callers.Count
    }
}

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
Write-Host "=== Phase 5 COMPLETE (V7.0) ===" -ForegroundColor Green
Write-Host "Duration: $([math]::Round($duration.TotalSeconds, 1))s | Quality: $score/100 | Complexity: $($complexity.level)"
Write-Host ""
Write-Host "STRUCTURE:" -ForegroundColor Cyan
Write-Host "  TAB 1 Resume:     Fiche + $($blocMap.Count) blocs + $($businessRules.Count) regles FR"
Write-Host "  TAB 2 Ecrans:     $($visibleForms.Count) mockups + Navigation + Algorigramme"
Write-Host "  TAB 3 Donnees:    $($tableUnified.Count) tables + $($variableRows.Count) vars + $($allExprs.Count) exprs"
Write-Host "  TAB 4 Connexions: $($discovery.call_graph.callers.Count) callers + $calleeCount callees + Migration ${effortDays}j"
Write-Host ""
Write-Host "FILES: $summaryFileName | $detailedFileName"

return $quality
