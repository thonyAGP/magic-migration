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
Write-Host "[1/7] Loading phase outputs..." -ForegroundColor Yellow

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

$programName = $discovery.metadata.program_name.Trim()
$startTime = Get-Date

# Read actual pipeline phase timestamps from JSON file modification dates
$phaseFiles = @($discoveryPath, $mappingPath, $decodedPath, $uiFormsPath) | Where-Object { Test-Path $_ }
$phaseTimestamps = @($phaseFiles | ForEach-Object { (Get-Item $_).LastWriteTime })
$pipelineFirstPhase = if ($phaseTimestamps.Count -gt 0) { ($phaseTimestamps | Measure-Object -Minimum).Minimum } else { $startTime }
$pipelineLastPhase = if ($phaseTimestamps.Count -gt 0) { ($phaseTimestamps | Measure-Object -Maximum).Maximum } else { $startTime }
$pipelineDuration = $pipelineLastPhase - $pipelineFirstPhase
$pipelineDurationStr = if ($pipelineDuration.TotalHours -ge 1) {
    "$([math]::Floor($pipelineDuration.TotalHours))h$($pipelineDuration.Minutes.ToString('00'))min"
} elseif ($pipelineDuration.TotalMinutes -ge 1) {
    "$([math]::Round($pipelineDuration.TotalMinutes))min"
} else {
    "$([math]::Round($pipelineDuration.TotalSeconds))s"
}

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
    param([string]$Decoded, [string]$RuleId, [string]$NaturalLanguage = "")

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

    # Fallback 1: use natural_language from Phase 3 decode
    if ($NaturalLanguage -and $NaturalLanguage.Trim() -ne '') {
        return $NaturalLanguage.Trim()
    }

    # Fallback 2: return decoded expression as-is (never "[Phase 2]")
    return $Decoded
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
Write-Host "[2/7] Preparing data..." -ForegroundColor Yellow

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

# Pre-build all expressions list (needed by S11 variables + S12 expressions)
$allExprs = @()
foreach ($typeName in ($exprByType.Keys | Sort-Object)) {
    foreach ($expr in $exprByType[$typeName]) {
        $dText = if ($expr.decoded) { $expr.decoded } else { $expr.raw }
        $allExprs += @{
            type = $typeName
            ide_position = $expr.ide_position
            decoded = $dText
            rule_id = $expr.business_rule_id
        }
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
Write-Host "[3/7] Generating SUMMARY spec..." -ForegroundColor Yellow

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
Write-Host "[4/7] Generating DETAILED spec (4 tabs)..." -ForegroundColor Yellow

$L = [System.Collections.ArrayList]::new()

function Add-Line { param([string]$Text = "") $null = $L.Add($Text) }

# --- HEADER ---
Add-Line "# $Project IDE $IdePosition - $programName"
Add-Line
Add-Line "> **Analyse**: Phases 1-4 $($pipelineFirstPhase.ToString('yyyy-MM-dd HH:mm')) -> $($pipelineLastPhase.ToString('HH:mm')) ($pipelineDurationStr) | Assemblage $($startTime.ToString('HH:mm'))"
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

# Detect business domain from program name and callees
$domaineName = "General"
$pnLower = $programName.ToLower()
if ($pnLower -match 'caisse|session|coffre|approvisionnement') { $domaineName = "Caisse" }
elseif ($pnLower -match 'vente|transaction|vrl|vsl|article') { $domaineName = "Ventes" }
elseif ($pnLower -match 'change|devise|taux') { $domaineName = "Change" }
elseif ($pnLower -match 'facture|tva') { $domaineName = "Facturation" }
elseif ($pnLower -match 'extrait|solde|compte') { $domaineName = "Comptabilite" }
elseif ($pnLower -match 'garantie|depot|caution') { $domaineName = "Garanties" }
elseif ($pnLower -match 'menu|choix') { $domaineName = "Navigation" }
elseif ($pnLower -match 'print|ticket|edition') { $domaineName = "Impression" }
elseif ($pnLower -match 'telephone|phone') { $domaineName = "Telephonie" }
elseif ($pnLower -match 'zoom|recherche|selection') { $domaineName = "Consultation" }

$xmlFileName = "Prg_$IdePosition.xml"

Add-Line "| Attribut | Valeur |"
Add-Line "|----------|--------|"
Add-Line "| Projet | $Project |"
Add-Line "| IDE Position | $IdePosition |"
Add-Line "| Nom Programme | $programName |"
Add-Line "| Fichier source | ``$xmlFileName`` |"
Add-Line "| Domaine metier | $domaineName |"
Add-Line "| Taches | $taskCount ($($visibleForms.Count) ecrans visibles) |"
Add-Line "| Tables modifiees | $writeCount |"
Add-Line "| Programmes appeles | $calleeCount |"
if ($discovery.orphan_analysis.status -eq "ORPHELIN" -or $discovery.orphan_analysis.status -eq "ORPHELIN_POTENTIEL") {
    Add-Line "| :warning: Statut | **$($discovery.orphan_analysis.status)** |"
}
Add-Line

# --- 2. Description fonctionnelle ---
Add-Line "## 2. DESCRIPTION FONCTIONNELLE"
Add-Line

# Build functional narrative from blocks, callees, tables, rules
$descParts = @()

# Purpose from program name + caller context
$purposeCtx = ""
if ($discovery.call_graph.callers.Count -gt 0) {
    $callerNames = ($discovery.call_graph.callers | ForEach-Object { $_.name }) -join ', '
    $purposeCtx = ", accessible depuis $callerNames"
}
$descParts += "**$programName** assure la gestion complete de ce processus$purposeCtx."

# Workflow from functional blocks (only significant ones, sorted by task count desc)
$sigBlocs = @()
foreach ($blocName in $blocMap.Keys) {
    $bCount = $blocMap[$blocName].Count
    if ($bCount -ge 1) {
        $sigBlocs += @{ name = $blocName; count = $bCount }
    }
}
$sigBlocs = @($sigBlocs | Sort-Object { $_.count } -Descending)

if ($sigBlocs.Count -gt 0) {
    $descParts += ""
    $descParts += "Le flux de traitement s'organise en **$($sigBlocs.Count) blocs fonctionnels** :"
    $descParts += ""
    foreach ($sb in $sigBlocs) {
        $bn = $sb.name
        $bc = $sb.count
        $blocDesc = switch ($bn) {
            "Saisie"         { "ecrans de saisie utilisateur (formulaires, champs, donnees)" }
            "Reglement"      { "gestion des moyens de paiement et reglements" }
            "Validation"     { "controles et verifications de coherence" }
            "Impression"     { "generation de tickets et documents" }
            "Calcul"         { "calculs de montants, stocks ou compteurs" }
            "Transfert"      { "transferts de donnees entre modules ou deversements" }
            "Consultation"   { "ecrans de recherche, selection et consultation" }
            "Creation"       { "insertion d'enregistrements en base (mouvements, prestations)" }
            "Initialisation" { "reinitialisation d'etats et de variables de travail" }
            default          { "traitements metier divers" }
        }
        $descParts += "- **$bn** ($bc taches) : $blocDesc"
    }
}

# Key operations from callees with context (group by context type)
$ctxGroups = @{}
foreach ($c in $calleesCtx) {
    $ctx = $c.context
    if ($ctx -eq "[Phase 2]") { continue }
    if (-not $ctxGroups.ContainsKey($ctx)) { $ctxGroups[$ctx] = @() }
    $ctxGroups[$ctx] += $c.name
}
if ($ctxGroups.Count -gt 0) {
    $descParts += ""
    $descParts += "Le programme delegue des operations a **$calleeCount sous-programmes** couvrant :"
    $descParts += ""
    foreach ($ctxName in ($ctxGroups.Keys | Sort-Object)) {
        $progs = $ctxGroups[$ctxName]
        $progList = ($progs | Select-Object -First 3) -join ', '
        if ($progs.Count -gt 3) { $progList += " (+$($progs.Count - 3))" }
        $descParts += "- **$ctxName** : $progList"
    }
}

# Data impact from WRITE tables
if ($discovery.tables.by_access.WRITE -and $discovery.tables.by_access.WRITE.Count -gt 0) {
    $writeTblNames = ($discovery.tables.by_access.WRITE | ForEach-Object { $_.logical_name }) -join ', '
    $descParts += ""
    $descParts += "**Donnees modifiees** : $writeCount tables en ecriture ($writeTblNames)."
}

# Key business logic from rules (summarize categories)
if ($businessRules.Count -gt 0) {
    $ruleCategories = @()
    $hasPositioning = $false; $hasCalc = $false; $hasCondition = $false; $hasDefault = $false
    foreach ($rule in $businessRules) {
        $dExpr = if ($rule.decoded_expression) { $rule.decoded_expression } elseif ($rule.decoded) { $rule.decoded } else { "" }
        if ($dExpr -match "IN\s*\(" -and $dExpr -match "\d+\.\d+") { $hasPositioning = $true }
        elseif ($dExpr -match "Fix\(.*\*.*\/100") { $hasCalc = $true }
        elseif ($dExpr -match "=''") { $hasDefault = $true }
        else { $hasCondition = $true }
    }
    if ($hasCondition) { $ruleCategories += "conditions metier" }
    if ($hasCalc) { $ruleCategories += "calculs avec pourcentages" }
    if ($hasPositioning) { $ruleCategories += "positionnement dynamique d'UI" }
    if ($hasDefault) { $ruleCategories += "valeurs par defaut" }

    if ($ruleCategories.Count -gt 0) {
        $descParts += ""
        $descParts += "**Logique metier** : $($businessRules.Count) regles identifiees couvrant $($ruleCategories -join ', ')."
    }
}

foreach ($dp in $descParts) { Add-Line $dp }
Add-Line

# --- 3. Blocs fonctionnels (enrichis: callees + tables associes) ---
Add-Line "## 3. BLOCS FONCTIONNELS"
Add-Line
if ($blocMap.Count -gt 0) {
    # Map callee contexts to bloc names for enrichment
    $ctxToBlocMap = @{
        "Impression ticket/document" = "Impression"
        "Configuration impression" = "Impression"
        "Calcul de donnees" = "Calcul"
        "Recuperation donnees" = "Consultation"
        "Selection/consultation" = "Consultation"
        "Verification solde" = "Calcul"
        "Gestion moyens paiement" = "Reglement"
        "Programme fidelite" = "Reglement"
        "Identification operateur" = "Validation"
        "Validation saisie" = "Validation"
        "Transfert donnees" = "Transfert"
        "Reinitialisation" = "Initialisation"
    }

    $bIdx = 1
    foreach ($blocName in $blocMap.Keys) {
        $blocForms = $blocMap[$blocName]
        $vis = @($blocForms | Where-Object { $_.dimensions.width -gt 0 })
        $invis = @($blocForms | Where-Object { $_.dimensions.width -le 0 })

        Add-Line "### 3.$bIdx $blocName ($($blocForms.Count) taches)"
        Add-Line

        # Ecrans visibles
        if ($vis.Count -gt 0) {
            foreach ($f in $vis) {
                Add-Line "- **$($f.name)** (T$($f.task_isn2), $($f.window_type_str), $($f.dimensions.width)x$($f.dimensions.height))"
            }
        }
        if ($invis.Count -gt 0) {
            $iNames = ($invis | ForEach-Object { "$($_.name) (T$($_.task_isn2))" }) -join ', '
            Add-Line "- *Internes*: $iNames"
        }

        # Callees associes a ce bloc (via context ou nom)
        $blocCallees = @($calleesCtx | Where-Object {
            $ctxToBlocMap[$_.context] -eq $blocName -or
            (Get-FunctionalBloc $_.name) -eq $blocName
        })
        if ($blocCallees.Count -gt 0) {
            $cList = ($blocCallees | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
            Add-Line "- **Sous-programmes**: $cList"
        }

        # Tables WRITE liees au bloc (heuristique par nom table matching bloc)
        $blocTableNames = @()
        if ($discovery.tables.by_access.WRITE) {
            foreach ($tbl in $discovery.tables.by_access.WRITE) {
                $tn = $tbl.logical_name.ToLower()
                $match = switch ($blocName) {
                    "Saisie"    { $tn -match 'prestation|vente|transaction' }
                    "Reglement" { $tn -match 'reglement|paiement|mop|compteur' }
                    "Calcul"    { $tn -match 'stock|stat|compteur' }
                    "Transfert" { $tn -match 'devers|transfert' }
                    "Creation"  { $tn -match 'mvt|mouvement|histo' }
                    default     { $false }
                }
                if ($match) { $blocTableNames += $tbl.logical_name }
            }
        }
        if ($blocTableNames.Count -gt 0) {
            Add-Line "- **Tables modifiees**: $($blocTableNames -join ', ')"
        }

        # Regles metier associees au bloc
        $blocRuleCount = 0
        foreach ($rule in $businessRules) {
            $dExpr = if ($rule.decoded_expression) { $rule.decoded_expression } elseif ($rule.decoded) { $rule.decoded } else { "" }
            $ruleMatchesBloc = switch ($blocName) {
                "Saisie"    { $dExpr -match 'saisie|transaction|vente|W0' }
                "Reglement" { $dExpr -match 'regl|MOP|paiement|montant' }
                "Validation" { $dExpr -match 'controle|verif|valid' }
                "Calcul"    { $dExpr -match 'Fix\(|pourcentage|\*.*/' }
                default     { $false }
            }
            if ($ruleMatchesBloc) { $blocRuleCount++ }
        }
        if ($blocRuleCount -gt 0) {
            Add-Line "- **Regles metier**: $blocRuleCount regles associees"
        }

        Add-Line
        $bIdx++
    }
}

# --- 4. SUPPRIME (fusionne dans S3 Blocs fonctionnels) ---

# --- 5. Regles metier en francais (regroupees par categorie, FR seulement) ---
Add-Line "## 5. REGLES METIER"
Add-Line
if ($businessRules.Count -gt 0) {
    Add-Line "$($businessRules.Count) regles identifiees:"
    Add-Line

    # Classify rules into categories
    $rulesByCategory = [ordered]@{
        "Conditions metier" = @()
        "Calculs" = @()
        "Positionnement UI" = @()
        "Valeurs par defaut" = @()
        "Regles complexes" = @()
    }
    foreach ($rule in $businessRules) {
        $dExpr = if ($rule.decoded_expression) { $rule.decoded_expression } elseif ($rule.decoded) { $rule.decoded } else { $rule.raw_expression }
        $nl = if ($rule.natural_language) { $rule.natural_language } else { "" }
        $frRule = Reformulate-BusinessRule -Decoded $dExpr -RuleId $rule.id -NaturalLanguage $nl
        $entry = @{ id = $rule.id; fr = $frRule; decoded = $dExpr }
        if ($frRule -match "Position UI") {
            $rulesByCategory["Positionnement UI"] += $entry
        } elseif ($frRule -match "Calcul|pourcentage|arrondi") {
            $rulesByCategory["Calculs"] += $entry
        } elseif ($frRule -match "Valeur par defaut|est vide") {
            $rulesByCategory["Valeurs par defaut"] += $entry
        } elseif ($frRule -eq $dExpr) {
            $rulesByCategory["Regles complexes"] += $entry
        } else {
            $rulesByCategory["Conditions metier"] += $entry
        }
    }

    foreach ($catName in $rulesByCategory.Keys) {
        $catRules = $rulesByCategory[$catName]
        if ($catRules.Count -eq 0) { continue }
        Add-Line "### $catName ($($catRules.Count))"
        Add-Line
        foreach ($r in $catRules) {
            Add-Line "- **[$($r.id)]** $($r.fr)"
        }
        Add-Line
    }
} else {
    Add-Line "*(Aucune regle metier identifiee)*"
    Add-Line
}

# --- 6. Contexte (fusion S6+S7) ---
Add-Line "## 6. CONTEXTE"
Add-Line
$clrCompact = if ($discovery.call_graph.callers.Count -gt 0) {
    ($discovery.call_graph.callers | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
} else { "(aucun)" }
Add-Line "- **Appele par**: $clrCompact"
Add-Line "- **Appelle**: $calleeCount programmes | **Tables**: $($tableUnified.Count) (W:$writeCount R:$readCount L:$linkCount) | **Taches**: $taskCount | **Expressions**: $exprCount"
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

    # Zigzag layout: TD direction with rows of 4 for readability
    $rowSize = 4
    Add-Line '```mermaid'
    Add-Line "flowchart TD"
    Add-Line "    START([Entree])"
    Add-Line "    style START fill:#3fb950"

    $prevNode = "START"
    $navIdx = 1
    $rowNodes = @()
    foreach ($form in $visibleForms) {
        $fl = Clean-MermaidLabel $form.name
        $nId = "F$navIdx"
        Add-Line "    $nId[$fl]"
        Add-Line "    $prevNode --> $nId"
        $rowNodes += $nId
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

# Decision algorigramme - improved readability
Add-Line "### 9.2 Logique decisionnelle"
Add-Line

if ($businessRules.Count -gt 0) {
    # Show decisions grouped by category for readability
    Add-Line '```mermaid'
    Add-Line "flowchart TD"
    Add-Line "    START([Debut traitement])"
    Add-Line "    style START fill:#3fb950"

    $prevNode = "START"
    $dIdx = 1
    $maxDec = [math]::Min($businessRules.Count, 8)

    foreach ($rule in ($businessRules | Select-Object -First $maxDec)) {
        $dExpr = if ($rule.decoded_expression) { $rule.decoded_expression } elseif ($rule.decoded) { $rule.decoded } else { $rule.raw_expression }
        $nl2 = if ($rule.natural_language) { $rule.natural_language } else { "" }
        $frLbl = Reformulate-BusinessRule -Decoded $dExpr -RuleId $rule.id -NaturalLanguage $nl2
        $shortLbl = Clean-MermaidLabel $frLbl

        # Decision diamond with OUI/NON branches
        Add-Line "    D$dIdx{$shortLbl}"
        Add-Line "    style D$dIdx fill:#58a6ff"
        Add-Line "    $prevNode --> D$dIdx"

        # OUI branch: action label from rule ID
        $actionLbl = Clean-MermaidLabel "$($rule.id) Appliquer"
        Add-Line "    A$dIdx[$actionLbl]"
        Add-Line "    D$dIdx -->|OUI| A$dIdx"
        Add-Line "    D$dIdx -->|NON| N$dIdx((.))"
        Add-Line "    A$dIdx --> N$dIdx"
        $prevNode = "N$dIdx"
        $dIdx++
    }

    if ($businessRules.Count -gt $maxDec) {
        $rem = $businessRules.Count - $maxDec
        Add-Line "    MORE[+ $rem autres regles]"
        Add-Line "    $prevNode --> MORE"
        $prevNode = "MORE"
    }
    Add-Line "    ENDOK([Fin traitement])"
    Add-Line "    style ENDOK fill:#f85149"
    Add-Line "    $prevNode --> ENDOK"
    Add-Line '```'
    Add-Line

    # Text legend of all rules for reference
    Add-Line "**Legende:**"
    Add-Line
    $rIdx = 1
    foreach ($rule in ($businessRules | Select-Object -First $maxDec)) {
        $dExpr = if ($rule.decoded_expression) { $rule.decoded_expression } elseif ($rule.decoded) { $rule.decoded } else { $rule.raw_expression }
        $nl3 = if ($rule.natural_language) { $rule.natural_language } else { "" }
        $frLbl = Reformulate-BusinessRule -Decoded $dExpr -RuleId $rule.id -NaturalLanguage $nl3
        Add-Line "- **D$rIdx** ($($rule.id)): $frLbl"
        $rIdx++
    }
    Add-Line
} else {
    Add-Line "*(Pas de regles metier pour l'algorigramme)*"
    Add-Line
}

# Hierarchical task structure: IDE.Task with subtasks
Add-Line "### 9.3 Structure hierarchique ($($allForms.Count) taches)"
Add-Line

# Build hierarchical view: group by parent/subtask
$sortedForms = @($allForms | Sort-Object { [int]$_.task_isn2 })
$mainTaskIdx = 1
$prevParent = -1
foreach ($form in $sortedForms) {
    $tId = [int]$form.task_isn2
    $isVis = if ($form.dimensions.width -gt 0) { "**[ECRAN]**" } else { "" }
    $bloc = Get-FunctionalBloc $form.name
    $typeInfo = if ($form.window_type_str -and $form.window_type_str -ne 'Type0') { "($($form.window_type_str))" } else { "" }

    # Determine if this is a main task or subtask
    # Heuristic: subtasks typically have higher ISN2 values and follow their parent
    # For now, use bloc grouping as hierarchy indicator
    $dims = ""
    if ($form.dimensions.width -gt 0) {
        $dims = " $($form.dimensions.width)x$($form.dimensions.height)"
    }

    $taskName = if ($form.name -and $form.name.Trim()) { $form.name.Trim() } else { "(sans nom)" }
    Add-Line "- **$IdePosition.$tId** $taskName $isVis $typeInfo$dims *[$bloc]*"
}
Add-Line

# ████████████████████████████████████████████████████████████
# TAB 3: DONNEES
# ████████████████████████████████████████████████████████████
Add-Line "<!-- TAB:Donnees -->"
Add-Line

# --- 10. Tables (enrichies: description, stockage couleur, filter unused) ---
Add-Line "## 10. TABLES"
Add-Line

# Separate used vs declared-but-unused tables
$usedTables = @($tableUnified.Values | Where-Object { $_.R -or $_.W -or $_.L } | Sort-Object { [int]$_.id })
$unusedTables = @($tableUnified.Values | Where-Object { -not $_.R -and -not $_.W -and -not $_.L } | Sort-Object { [int]$_.id })

# Storage type emoji/symbol for quick visual scan
# DB=Database, TMP=Tempo, MEM=Memory
function Get-StorageIcon {
    param([string]$Storage)
    switch ($Storage) {
        "Database" { return "DB" }
        "Temp"     { return "TMP" }
        "Memory"   { return "MEM" }
        default    { return "?" }
    }
}

# Generate description from table name
function Get-TableDescription {
    param([string]$LogicalName)
    $n = $LogicalName.ToLower()
    if ($n -match 'prestation') { return "Prestations/services vendus" }
    if ($n -match 'mvt_prestation|mouvement') { return "Mouvements de prestation" }
    if ($n -match 'compte|cgm') { return "Comptes GM (generaux)" }
    if ($n -match 'compteur|cpt') { return "Compteurs (sequences)" }
    if ($n -match 'stat_lieu') { return "Statistiques point de vente" }
    if ($n -match 'reseau|cloture') { return "Donnees reseau/cloture" }
    if ($n -match 'hebergement|heb') { return "Hebergement (chambres)" }
    if ($n -match 'depot|garantie|dga') { return "Depots et garanties" }
    if ($n -match 'recherche|gmr') { return "Index de recherche" }
    if ($n -match 'comptes_speciaux|spc') { return "Comptes speciaux" }
    if ($n -match 'resultat|horaire') { return "Resultats recherche" }
    if ($n -match 'tempo|ecran') { return "Table temporaire ecran" }
    if ($n -match 'police') { return "Donnees police/session" }
    return ""
}

Add-Line "### 10.1 Tables utilisees ($($usedTables.Count))"
Add-Line
Add-Line "| ID | Nom | Description | Type | R | W | L | Usages |"
Add-Line "|----|-----|-------------|------|---|---|---|--------|"
foreach ($t in $usedTables) {
    $rM = if ($t.R) { "R" } else { " " }
    $wM = if ($t.W) { "**W**" } else { " " }
    $lM = if ($t.L) { "L" } else { " " }
    $icon = Get-StorageIcon $t.storage
    $desc = Get-TableDescription $t.logical_name
    Add-Line "| $($t.id) | $($t.logical_name) | $desc | $icon | $rM | $wM | $lM | $($t.usage_total) |"
}
Add-Line

Add-Line "### 10.2 Colonnes par table"
Add-Line
Add-Line "*[Phase 2] Analyse des colonnes lues (R) et modifiees (W) par table avec details depliables.*"
Add-Line

# Declared but unused tables
if ($unusedTables.Count -gt 0) {
    Add-Line "### 10.3 Tables declarees non utilisees ($($unusedTables.Count))"
    Add-Line
    Add-Line "<details>"
    Add-Line "<summary>$($unusedTables.Count) tables declarees sans acces R/W/L</summary>"
    Add-Line
    Add-Line "| ID | Nom | Type |"
    Add-Line "|----|-----|------|"
    foreach ($t in $unusedTables) {
        $icon = Get-StorageIcon $t.storage
        Add-Line "| $($t.id) | $($t.logical_name) | $icon |"
    }
    Add-Line
    Add-Line "</details>"
    Add-Line
}

# --- 11. Variables ---
Add-Line "## 11. VARIABLES"
Add-Line

if ($variableRows.Count -gt 0) {
    # Count usage: how many times each variable appears in decoded expressions
    $varUsage = @{}
    foreach ($e in $allExprs) {
        foreach ($v in $variableRows) {
            if ($e.decoded -match [regex]::Escape($v.Name)) {
                $key = "$($v.Letter)|$($v.Name)"
                if (-not $varUsage.ContainsKey($key)) { $varUsage[$key] = 0 }
                $varUsage[$key]++
            }
        }
    }

    # Sort by real usage (desc), then by category
    $rankedVars = $variableRows | ForEach-Object {
        $key = "$($_.Letter)|$($_.Name)"
        $usage = if ($varUsage.ContainsKey($key)) { $varUsage[$key] } else { 0 }
        [PSCustomObject]@{
            Category = $_.Category; Letter = $_.Letter; Name = $_.Name
            DataType = $_.DataType; Ref = $_.Ref; Usage = $usage; VarType = $_.VarType
        }
    } | Sort-Object Usage -Descending

    $top20 = $rankedVars | Select-Object -First 20
    Add-Line "### 11.1 Variables principales (Top 20 par usage / $($variableRows.Count))"
    Add-Line
    Add-Line "| Cat | Lettre | Nom Variable | Type | Usages | Ref |"
    Add-Line "|-----|--------|--------------|------|--------|-----|"
    foreach ($v in $top20) {
        $usageLabel = if ($v.Usage -gt 0) { "$($v.Usage)x" } else { "-" }
        Add-Line "| $($v.Category) | **$($v.Letter)** | $($v.Name) | $($v.DataType) | $usageLabel | ``$($v.Ref)`` |"
    }
    Add-Line

    if ($variableRows.Count -gt 20) {
        Add-Line "### 11.2 Toutes les variables ($($variableRows.Count))"
        Add-Line
        Add-Line "<details>"
        Add-Line "<summary>Voir les $($variableRows.Count) variables</summary>"
        Add-Line
        Add-Line "| Cat | Lettre | Nom Variable | Type | Ref |"
        Add-Line "|-----|--------|--------------|------|-----|"
        foreach ($v in ($rankedVars | Sort-Object Category, { $_.Letter.Length }, Letter)) {
            Add-Line "| $($v.Category) | **$($v.Letter)** | $($v.Name) | $($v.DataType) | ``$($v.Ref)`` |"
        }
        Add-Line
        Add-Line "</details>"
        Add-Line
    }
} else {
    Add-Line "*(Programme sans variables locales mappees)*"
    Add-Line
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

# --- 12. Expressions (groupees par bloc fonctionnel) ---
Add-Line "## 12. EXPRESSIONS"
Add-Line

if ($decoded) {
    $totalExpr = $decoded.statistics.decoded_count
    $totalInProg = $decoded.statistics.total_in_program
    $coverage = $decoded.statistics.coverage_percent

    Add-Line "**$totalExpr / $totalInProg expressions decodees ($coverage%)**"
    Add-Line

    # $allExprs already built in DATA PREPARATION section

    # Group expressions by functional bloc (heuristic on decoded content)
    $exprByBloc = [ordered]@{
        "Saisie" = @()
        "Reglement" = @()
        "Validation" = @()
        "Impression" = @()
        "Calcul" = @()
        "Consultation" = @()
        "Transfert" = @()
        "Autre" = @()
    }
    foreach ($e in $allExprs) {
        $dt = $e.decoded.ToLower()
        $bloc = if ($dt -match 'print|ticket|edition|imprim|listing|printer') { "Impression" }
        elseif ($dt -match 'regl|mop|moyen|paiement|montant|total|solde|gift|resort') { "Reglement" }
        elseif ($dt -match 'controle|verif|valid|interdit|obligat') { "Validation" }
        elseif ($dt -match 'saisie|transaction|vente|article|produit|prestation') { "Saisie" }
        elseif ($dt -match 'fix\(|pourcentage|\*.*\/|stock|compteur|calcul') { "Calcul" }
        elseif ($dt -match 'zoom|select|choix|recherche|affich') { "Consultation" }
        elseif ($dt -match 'devers|transfer|bilat') { "Transfert" }
        else { "Autre" }
        $exprByBloc[$bloc] += $e
    }

    # 12.1 Summary by bloc
    Add-Line "### 12.1 Repartition par bloc"
    Add-Line
    Add-Line "| Bloc fonctionnel | Expressions | Regles |"
    Add-Line "|-----------------|-------------|--------|"
    foreach ($bn in $exprByBloc.Keys) {
        $bExprs = $exprByBloc[$bn]
        if ($bExprs.Count -eq 0) { continue }
        $ruleCount = ($bExprs | Where-Object { $_.rule_id }).Count
        Add-Line "| $bn | $($bExprs.Count) | $ruleCount |"
    }
    Add-Line

    # 12.2 Key expressions per bloc (top 5 each)
    Add-Line "### 12.2 Expressions cles par bloc"
    Add-Line
    foreach ($bn in $exprByBloc.Keys) {
        $bExprs = $exprByBloc[$bn]
        if ($bExprs.Count -eq 0) { continue }

        # Prioritize expressions with rules, then by type
        $sorted = @($bExprs | Sort-Object { if ($_.rule_id) { "A" } else { "Z" } }, { $_.type })
        $top5 = $sorted | Select-Object -First 5

        Add-Line "#### $bn ($($bExprs.Count) expressions)"
        Add-Line
        Add-Line "| Type | IDE | Expression | Regle |"
        Add-Line "|------|-----|------------|-------|"
        foreach ($e in $top5) {
            $dt = $e.decoded -replace '\|', '\|'
            $rr = if ($e.rule_id) { $e.rule_id } else { "-" }
            Add-Line "| $($e.type) | $($e.ide_position) | ``$dt`` | $rr |"
        }
        if ($bExprs.Count -gt 5) {
            Add-Line "| ... | | *+$($bExprs.Count - 5) autres* | |"
        }
        Add-Line
    }

    # 12.3 Full expressions in details
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

# Callers diagram - Multi-path from Main
Add-Line "### 13.1 Chaine depuis Main (Callers)"
Add-Line

# Text path: show all direct callers
if ($discovery.call_graph.callers.Count -gt 0) {
    $pathLines = @()
    foreach ($caller in $discovery.call_graph.callers) {
        $pathLines += "Main -> ... -> $($caller.name) (IDE $($caller.ide)) -> **$programName (IDE $IdePosition)**"
    }
    Add-Line ($pathLines -join "`n`n")
} else {
    Add-Line "**Chemin**: (pas de callers directs)"
}
Add-Line

Add-Line '```mermaid'
Add-Line "graph LR"
$tgtLabel = Clean-MermaidLabel "$IdePosition $programName"
Add-Line "    T$IdePosition[$tgtLabel]"
Add-Line "    style T$IdePosition fill:#58a6ff"

# Robust approach: collect all nodes as flat array, then render
$chainNodes = @()
if ($discovery.call_graph.call_chain -and $discovery.call_graph.call_chain.Count -gt 0) {
    foreach ($node in $discovery.call_graph.call_chain) {
        $nIde = [int]$node.ide
        $nLvl = [int]$node.level
        if ($nIde -le 0) { continue }
        $chainNodes += @{ ide = $nIde; name = [string]$node.name; level = $nLvl }
    }
}

if ($chainNodes.Count -gt 0) {
    $maxLevel = ($chainNodes | ForEach-Object { $_.level } | Measure-Object -Maximum).Maximum

    # Pass 1: Define ALL nodes (from Main down to direct callers)
    $definedNodes = @{}
    foreach ($n in ($chainNodes | Sort-Object { $_.level } -Descending)) {
        $nId = "CC$($n.ide)"
        if ($definedNodes.ContainsKey($nId)) { continue }
        $nLbl = Clean-MermaidLabel "$($n.ide) $($n.name)"
        $color = if ($n.level -eq $maxLevel) { "#8b5cf6" }      # purple = Main
                 elseif ($n.level -eq 1) { "#3fb950" }           # green = direct callers
                 else { "#f59e0b" }                               # orange = intermediaries
        Add-Line "    $nId[$nLbl]"
        Add-Line "    style $nId fill:$color"
        $definedNodes[$nId] = $n
    }

    # Pass 2: Draw connections (parent level → child level)
    # Group nodes by level for connection lookup
    $nodesByLevel = @{}
    foreach ($n in $chainNodes) {
        $lvl = $n.level
        if (-not $nodesByLevel.ContainsKey($lvl)) { $nodesByLevel[$lvl] = @() }
        $nodesByLevel[$lvl] += $n
    }

    # Connect: each node at level N connects from all nodes at level N+1
    for ($lvl = 1; $lvl -lt $maxLevel; $lvl++) {
        if (-not $nodesByLevel.ContainsKey($lvl)) { continue }
        $parentLvl = $lvl + 1
        if (-not $nodesByLevel.ContainsKey($parentLvl)) { continue }
        foreach ($child in $nodesByLevel[$lvl]) {
            foreach ($parent in $nodesByLevel[$parentLvl]) {
                Add-Line "    CC$($parent.ide) --> CC$($child.ide)"
            }
        }
    }

    # Connect level 1 callers → target
    if ($nodesByLevel.ContainsKey(1)) {
        foreach ($caller in $nodesByLevel[1]) {
            Add-Line "    CC$($caller.ide) --> T$IdePosition"
        }
    }
} elseif ($discovery.call_graph.callers.Count -gt 0) {
    # Fallback: just show direct callers without chain
    foreach ($caller in ($discovery.call_graph.callers | Where-Object { $_.ide -gt 0 })) {
        $cId = "CALLER$($caller.ide)"
        $cLbl = Clean-MermaidLabel "$($caller.ide) $($caller.name)"
        Add-Line "    $cId[$cLbl]"
        Add-Line "    $cId --> T$IdePosition"
        Add-Line "    style $cId fill:#3fb950"
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

# --- 14. Migration ---
Add-Line "## 14. RECOMMANDATIONS MIGRATION"
Add-Line

# Effort estimation
$lines = $discovery.statistics.logic_line_count
$effortDays = [math]::Ceiling($lines / 100 + $exprCount / 50 + $writeCount * 0.5 + $calleeCount * 0.3)
$effortDays = [math]::Max($effortDays, 1)
if ($complexity.level -eq "HAUTE") { $effortDays = [math]::Ceiling($effortDays * 1.5) }

Add-Line "### 14.1 Profil du programme"
Add-Line
Add-Line "| Metrique | Valeur | Impact migration |"
Add-Line "|----------|--------|-----------------|"
Add-Line "| Lignes de logique | $lines | $(if ($lines -gt 500) { 'Programme volumineux' } elseif ($lines -gt 200) { 'Taille moyenne' } else { 'Programme compact' }) |"
Add-Line "| Expressions | $exprCount | $(if ($exprCount -gt 200) { 'Beaucoup de logique conditionnelle' } elseif ($exprCount -gt 50) { 'Logique moderee' } else { 'Peu de logique' }) |"
Add-Line "| Tables WRITE | $writeCount | $(if ($writeCount -gt 5) { 'Fort impact donnees' } elseif ($writeCount -gt 2) { 'Impact modere' } else { 'Impact faible' }) |"
Add-Line "| Sous-programmes | $calleeCount | $(if ($calleeCount -gt 10) { 'Forte dependance - migrer les callees en priorite' } elseif ($calleeCount -gt 5) { 'Dependances moderees' } else { 'Peu de dependances' }) |"
Add-Line "| Ecrans visibles | $($visibleForms.Count) | $(if ($visibleForms.Count -gt 5) { 'Interface complexe multi-ecrans' } elseif ($visibleForms.Count -gt 1) { 'Quelques ecrans' } else { 'Ecran unique ou traitement batch' }) |"
$totalLinesCalc = $discovery.statistics.logic_line_count
$disabledLinesCalc = $discovery.statistics.disabled_line_count
$disabledPctCalc = if ($totalLinesCalc -gt 0) { [math]::Round($disabledLinesCalc / $totalLinesCalc * 100, 1) } else { 0 }
Add-Line "| Code desactive | ${disabledPctCalc}% ($disabledLinesCalc / $totalLinesCalc) | $(if ($disabledPctCalc -gt 15) { 'Nettoyer avant migration' } elseif ($disabledPctCalc -gt 5) { 'A verifier' } else { 'Code sain' }) |"
Add-Line "| Regles metier | $($businessRules.Count) | $(if ($businessRules.Count -gt 10) { 'Logique metier riche - documenter chaque regle' } elseif ($businessRules.Count -gt 0) { 'Quelques regles a preserver' } else { 'Pas de regle identifiee' }) |"
Add-Line
Add-Line "**Estimation effort**: ~**$effortDays jours** de developpement"
Add-Line

# Enriched recommendations per block with specific data
Add-Line "### 14.2 Plan de migration par bloc"
Add-Line
foreach ($blocName in $blocMap.Keys) {
    $blocForms = $blocMap[$blocName]
    $blocVis = @($blocForms | Where-Object { $_.dimensions.width -gt 0 })
    $blocInvis = @($blocForms | Where-Object { $_.dimensions.width -le 0 })

    Add-Line "#### $blocName ($($blocForms.Count) taches: $($blocVis.Count) ecrans, $($blocInvis.Count) traitements)"
    Add-Line

    # Specific enriched recommendations based on actual data
    $recoms = @()
    switch ($blocName) {
        "Saisie" {
            if ($blocVis.Count -gt 0) {
                $recoms += "Reproduire $($blocVis.Count) ecran(s) de saisie: $(($blocVis | ForEach-Object { $_.name }) -join ', ')"
            }
            $recoms += "Implementer les validations cote client et serveur"
        }
        "Reglement" {
            $recoms += "Logique multi-moyens de paiement a implementer"
            $recoms += "Integration TPE si applicable"
            if ($blocInvis.Count -gt 0) { $recoms += "$($blocInvis.Count) traitement(s) internes de reglement" }
        }
        "Validation" {
            $recoms += "Transformer les conditions en validators (FluentValidation ou equivalent)"
        }
        "Impression" {
            $recoms += "Remplacer par generation PDF/HTML"
            $recoms += "Configurer le systeme d'impression"
        }
        "Consultation" {
            $recoms += "Ecrans de recherche/selection en modales ou composants"
            if ($blocVis.Count -gt 0) { $recoms += "$($blocVis.Count) ecran(s) de consultation: $(($blocVis | ForEach-Object { $_.name }) -join ', ')" }
        }
        "Transfert" { $recoms += "Logique de deversement/transfert entre modules" }
        "Calcul" { $recoms += "Migrer la logique de calcul (stock, compteurs, montants)" }
        "Creation" { $recoms += "Insertion de donnees via repository pattern" }
        "Initialisation" { $recoms += "Reinitialisation dans le constructeur ou methode Init()" }
        default { $recoms += "Traitement standard a migrer" }
    }
    foreach ($r in $recoms) { Add-Line "- $r" }
    Add-Line
}

# Critical dependencies
Add-Line "### 14.3 Dependances critiques"
Add-Line
Add-Line "| Dependance | Type | Appels | Impact |"
Add-Line "|------------|------|--------|--------|"
if ($discovery.tables.by_access.WRITE) {
    foreach ($tbl in $discovery.tables.by_access.WRITE) {
        $storage = Get-TableStorageType $tbl.physical_name
        Add-Line "| $($tbl.logical_name) | Table WRITE ($storage) | $($tbl.usage_count)x | Schema + repository |"
    }
}
$critCallees = @($calleesCtx | Sort-Object { $_.calls_count } -Descending | Select-Object -First 10)
foreach ($c in $critCallees) {
    $prio = if ($c.calls_count -ge 3) { "**CRITIQUE**" } elseif ($c.calls_count -ge 2) { "Haute" } else { "Normale" }
    Add-Line "| IDE $($c.ide) - $($c.name) | Sous-programme | $($c.calls_count)x | $prio - $($c.context) |"
}
Add-Line

# Footer
Add-Line "---"
Add-Line "*Spec DETAILED generee par Pipeline V7.0 - $(Get-Date -Format 'yyyy-MM-dd HH:mm')*"

$detailedSpec = $L -join "`n"

# ============================================================
# SAVE SPECS
# ============================================================
Write-Host "[5/7] Saving specs..." -ForegroundColor Yellow

$summaryFileName = "$Project-IDE-$IdePosition-summary.md"
$detailedFileName = "$Project-IDE-$IdePosition.md"

$summaryPath = Join-Path $SpecsOutputPath $summaryFileName
$detailedPath = Join-Path $SpecsOutputPath $detailedFileName

$summarySpec | Set-Content -Path $summaryPath -Encoding UTF8
$detailedSpec | Set-Content -Path $detailedPath -Encoding UTF8

Write-Host "  Summary: $summaryPath"
Write-Host "  Detailed: $detailedPath"

# ============================================================
# PHASE 6: AUDIT ANTI-REGRESSION
# ============================================================
Write-Host "[6/7] Audit anti-regression..." -ForegroundColor Yellow

$auditResults = @()
$auditFailed = $false

# AUDIT 1: No "[Phase 2] Regle complexe" placeholders in spec
$specContent = $detailedSpec
$phase2Matches = ([regex]::Matches($specContent, '\[Phase 2\] Regle complexe')).Count
if ($phase2Matches -gt 0) {
    $auditResults += @{ check = "RULES_NO_PLACEHOLDER"; status = "FAIL"; expected = 0; actual = $phase2Matches; detail = "$phase2Matches regles avec placeholder '[Phase 2]'" }
    $auditFailed = $true
} else {
    $auditResults += @{ check = "RULES_NO_PLACEHOLDER"; status = "PASS"; expected = 0; actual = 0; detail = "Aucun placeholder detecte" }
}

# AUDIT 2: Business rules count matches JSON source
$jsonRuleCount = $businessRules.Count
$specRuleMatches = ([regex]::Matches($specContent, '\*\*\[RM-\d+')).Count
if ($specRuleMatches -lt $jsonRuleCount) {
    $auditResults += @{ check = "RULES_COUNT"; status = "FAIL"; expected = $jsonRuleCount; actual = $specRuleMatches; detail = "Spec contient $specRuleMatches regles, JSON en a $jsonRuleCount" }
    $auditFailed = $true
} else {
    $auditResults += @{ check = "RULES_COUNT"; status = "PASS"; expected = $jsonRuleCount; actual = $specRuleMatches; detail = "$specRuleMatches/$jsonRuleCount regles presentes" }
}

# AUDIT 3: Tables WRITE count matches (V7.0 uses unified table with **W** marker)
$jsonWriteCount = ($discovery.tables.by_access.WRITE | Measure-Object).Count
$specWriteRows = ([regex]::Matches($specContent, '\*\*W\*\*')).Count
if ($specWriteRows -lt $jsonWriteCount -and $jsonWriteCount -gt 0) {
    $auditResults += @{ check = "TABLES_WRITE"; status = "WARN"; expected = $jsonWriteCount; actual = $specWriteRows; detail = "Spec: $specWriteRows tables W, JSON: $jsonWriteCount" }
} else {
    $auditResults += @{ check = "TABLES_WRITE"; status = "PASS"; expected = $jsonWriteCount; actual = $specWriteRows; detail = "$specWriteRows/$jsonWriteCount tables WRITE" }
}

# AUDIT 4: Callers count matches
$jsonCallerCount = $discovery.call_graph.callers.Count
$specCallerRows = ([regex]::Matches($specContent, '^\| \d+ \|', [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count
# Callers are in the Callers table section - verify at least present
if ($jsonCallerCount -gt 0 -and $specContent -notmatch '13\.2 Callers') {
    $auditResults += @{ check = "CALLERS_SECTION"; status = "FAIL"; expected = "present"; actual = "absent"; detail = "Section Callers manquante" }
    $auditFailed = $true
} else {
    $auditResults += @{ check = "CALLERS_SECTION"; status = "PASS"; expected = $jsonCallerCount; actual = "present"; detail = "$jsonCallerCount callers documentes" }
}

# AUDIT 5: Callees count matches
$jsonCalleeCount = ($discovery.call_graph.callees | Where-Object { $_.ide -gt 0 }).Count
if ($jsonCalleeCount -gt 0 -and $specContent -notmatch '13\.3 Callees') {
    $auditResults += @{ check = "CALLEES_SECTION"; status = "FAIL"; expected = "present"; actual = "absent"; detail = "Section Callees manquante" }
    $auditFailed = $true
} else {
    $auditResults += @{ check = "CALLEES_SECTION"; status = "PASS"; expected = $jsonCalleeCount; actual = "present"; detail = "$jsonCalleeCount callees documentes" }
}

# AUDIT 6: Visible screens count matches
$jsonVisibleCount = ($uiForms.forms | Where-Object { $_.dimensions.width -gt 0 }).Count
$specScreenMatches = ([regex]::Matches($specContent, '\*\*\[ECRAN\]\*\*')).Count
if ($specScreenMatches -ne $jsonVisibleCount -and $jsonVisibleCount -gt 0) {
    $auditResults += @{ check = "SCREENS_VISIBLE"; status = "WARN"; expected = $jsonVisibleCount; actual = $specScreenMatches; detail = "Spec: $specScreenMatches ecrans marques, JSON: $jsonVisibleCount" }
} else {
    $auditResults += @{ check = "SCREENS_VISIBLE"; status = "PASS"; expected = $jsonVisibleCount; actual = $specScreenMatches; detail = "Ecrans visibles coherents" }
}

# AUDIT 7: Expression coverage present
if ($decoded -and $decoded.statistics.coverage_percent -gt 0) {
    $coverageStr = "$($decoded.statistics.coverage_percent)%"
    if ($specContent -match $coverageStr -or $specContent -match "$($decoded.statistics.decoded_count) / $($decoded.statistics.total_in_program)") {
        $auditResults += @{ check = "EXPR_COVERAGE"; status = "PASS"; expected = $coverageStr; actual = "present"; detail = "Coverage $coverageStr documentee" }
    } else {
        $auditResults += @{ check = "EXPR_COVERAGE"; status = "WARN"; expected = $coverageStr; actual = "absent"; detail = "Coverage $coverageStr non trouvee dans spec" }
    }
}

# AUDIT 8: No raw XML references ({0,N} patterns) in narrative sections (TAB 1 Resume only)
$tab1Content = ""
if ($specContent -match '(?s)<!-- TAB:Resume -->(.*?)<!-- TAB:') {
    $tab1Content = $Matches[1]
}
$rawXmlMatches = ([regex]::Matches($tab1Content, '\{0,\d+\}')).Count
if ($rawXmlMatches -gt 0) {
    $auditResults += @{ check = "NO_RAW_XML"; status = "WARN"; expected = 0; actual = $rawXmlMatches; detail = "$rawXmlMatches references {0,N} dans Resume (devrait etre decode)" }
} else {
    $auditResults += @{ check = "NO_RAW_XML"; status = "PASS"; expected = 0; actual = 0; detail = "Aucune reference XML brute dans Resume" }
}

# AUDIT 9: 4 TAB markers present
$tabMarkers = ([regex]::Matches($specContent, '<!-- TAB:\w+ -->')).Count
if ($tabMarkers -ne 4) {
    $auditResults += @{ check = "TAB_STRUCTURE"; status = "FAIL"; expected = 4; actual = $tabMarkers; detail = "$tabMarkers onglets sur 4 attendus" }
    $auditFailed = $true
} else {
    $auditResults += @{ check = "TAB_STRUCTURE"; status = "PASS"; expected = 4; actual = 4; detail = "4 onglets V7.0 presents" }
}

# AUDIT 10: Pipeline timing is realistic (not just assembly)
if ($specContent -match 'Phases 1-4') {
    $auditResults += @{ check = "TIMING_REALISTIC"; status = "PASS"; expected = "Phases 1-4"; actual = "present"; detail = "Timing pipeline reel affiche" }
} else {
    $auditResults += @{ check = "TIMING_REALISTIC"; status = "FAIL"; expected = "Phases 1-4"; actual = "absent"; detail = "Timing pipeline reel manquant dans header" }
    $auditFailed = $true
}

# Display audit results
$passCount = ($auditResults | Where-Object { $_.status -eq "PASS" }).Count
$failCount = ($auditResults | Where-Object { $_.status -eq "FAIL" }).Count
$warnCount = ($auditResults | Where-Object { $_.status -eq "WARN" }).Count

Write-Host ""
Write-Host "  AUDIT RESULTS: $passCount PASS | $failCount FAIL | $warnCount WARN" -ForegroundColor $(if ($failCount -gt 0) { "Red" } elseif ($warnCount -gt 0) { "Yellow" } else { "Green" })
foreach ($r in $auditResults) {
    $icon = switch ($r.status) { "PASS" { "[OK]" } "FAIL" { "[KO]" } "WARN" { "[!!]" } }
    $color = switch ($r.status) { "PASS" { "Green" } "FAIL" { "Red" } "WARN" { "Yellow" } }
    Write-Host "  $icon $($r.check): $($r.detail)" -ForegroundColor $color
}
Write-Host ""

if ($auditFailed) {
    Write-Host "  >>> AUDIT FAILED - Spec may contain quality issues <<<" -ForegroundColor Red
}

# ============================================================
# QUALITY REPORT
# ============================================================
Write-Host "[7/7] Quality report..." -ForegroundColor Yellow

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
    audit = @{
        pass = $passCount
        fail = $failCount
        warn = $warnCount
        all_passed = -not $auditFailed
        checks = $auditResults
    }
    pipeline_timing = @{
        phases_start = $pipelineFirstPhase.ToString("yyyy-MM-dd HH:mm:ss")
        phases_end = $pipelineLastPhase.ToString("yyyy-MM-dd HH:mm:ss")
        phases_duration = $pipelineDurationStr
        assembly_start = $startTime.ToString("yyyy-MM-dd HH:mm:ss")
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
Write-Host "Pipeline: $pipelineDurationStr (Phases 1-4) + $([math]::Round($duration.TotalSeconds, 1))s (assemblage) | Quality: $score/100 | Audit: $passCount/$($auditResults.Count) OK"
Write-Host ""
Write-Host "STRUCTURE:" -ForegroundColor Cyan
Write-Host "  TAB 1 Resume:     Fiche + $($blocMap.Count) blocs + $($businessRules.Count) regles FR"
Write-Host "  TAB 2 Ecrans:     $($visibleForms.Count) mockups + Navigation + Algorigramme"
Write-Host "  TAB 3 Donnees:    $($tableUnified.Count) tables + $($variableRows.Count) vars + $($allExprs.Count) exprs"
Write-Host "  TAB 4 Connexions: $($discovery.call_graph.callers.Count) callers + $calleeCount callees + Migration ${effortDays}j"
Write-Host ""
Write-Host "FILES: $summaryFileName | $detailedFileName"

return $quality
