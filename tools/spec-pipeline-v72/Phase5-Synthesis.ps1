# Phase5-SynthesisV72.ps1 - V7.2 Pipeline (4 Onglets - Enrichi)
# TAB 1: Resume (Fiche + Description 2 niveaux + Blocs avec ancres + Regles enrichies + Contexte liens)
# TAB 2: Ecrans & Flux (FORM-DATA + Position hierarchique + Navigation reelle)
# TAB 3: Donnees (Tables fusionnees + Variables par role + Expressions typees)
# TAB 4: Connexions (Graphes liens cliquables + Migration concrete)

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

function Pluralize([int]$count, [string]$singular, [string]$plural) {
    if ($count -le 1) { "$count $singular" } else { "$count $plural" }
}

if (-not $OutputPath) {
    $OutputPath = Join-Path $ScriptDir "output\$Project-IDE-$IdePosition"
}
if (-not $SpecsOutputPath) {
    $SpecsOutputPath = Join-Path $ProjectRoot ".openspec\specs"
}
if (-not (Test-Path $SpecsOutputPath)) {
    New-Item -ItemType Directory -Path $SpecsOutputPath -Force | Out-Null
}

Write-Host "=== Phase 5: SYNTHESIS (V7.2 - 4 Onglets Enrichis) ===" -ForegroundColor Cyan
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

# Pipeline timing from phase file modification dates
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
    # P0, PO (typo O/0), P., p., PI., Pi. = parametres entrants
    if ($Name -match '^P[0O][\.\s]') { return "P0" }
    if ($Name -match '^[Pp][Ii]?[\.\s]') { return "P0" }
    if ($Name -match '^W0[\.\s]') { return "W0" }
    if ($Name -match '^V\.') { return "V." }
    if ($Name -match '^VG[\d\s\.]') { return "VG" }
    if ($Name -match '^v[\.\s]') { return "V." }
    return "Autre"
}

function Get-VariableRole {
    param([string]$Category)
    switch ($Category) {
        "P0"    { return "Parametres entrants" }
        "V."    { return "Variables de session" }
        "W0"    { return "Variables de travail" }
        "VG"    { return "Variables globales" }
        default { return "Autres" }
    }
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

function Get-ExpressionType {
    param([string]$Decoded, [string]$OriginalType)
    $d = $Decoded
    if ($d -match "^'[^']+'$") { return "CONSTANTE" }
    if ($d -match "'TRUE'LOG|'FALSE'LOG") { return "CAST_LOGIQUE" }
    if ($d -match "^NOT\s") { return "NEGATION" }
    if ($d -match "^VG\d+$") { return "REFERENCE_VG" }
    if ($d -match "^IF\(") { return "CONDITION" }
    if ($d -match "Fix\(|Round\(|\*.*\/") { return "CALCUL" }
    if ($d -match "Str\(|DStr\(|TStr\(|'FORM") { return "FORMAT" }
    if ($d -match "\&.*\&|Trim\(.*\)\&") { return "CONCATENATION" }
    if ($d -match "=\s*\d+\.\d+") { return "UI_POSITION" }
    if ($d -match "=|<>|>|<") { return "CONDITION" }
    if ($OriginalType -eq "CONSTANT") { return "CONSTANTE" }
    if ($OriginalType -eq "IF") { return "CONDITION" }
    return $OriginalType
}

# V7.2: Generate spec-internal link to another program
function Format-SpecLink {
    param([string]$Name, [int]$Ide, [string]$Proj = "ADH")
    return "[$Name (IDE $Ide)]($Proj-IDE-$Ide.md)"
}

# V7.2: Generate anchor tag
function Format-Anchor {
    param([string]$Id)
    return "<a id=`"$Id`"></a>"
}

function Reformulate-BusinessRule {
    param([string]$Decoded, [string]$RuleId, [string]$NaturalLanguage = "")

    $text = $Decoded

    if ($text -match "^IF\(([^=]+)='([^']+)','([^']+)','([^']+)'\)$") {
        $var = $Matches[1].Trim()
        return "Si $var vaut '$($Matches[2])' alors '$($Matches[3])', sinon '$($Matches[4])'"
    }
    if ($text -match "Trim\(([^)]+)\)='(\d)'" -and $text -match 'ALLER|RETOUR') {
        return "Determine le sens du trajet selon le service village (1=ALLER, 2=RETOUR, 3=A/R)"
    }
    if ($text -match "^IF\(([^=]+)=0,IF\(([^=]+)='([^']+)',") {
        $var1 = $Matches[1].Trim()
        $var2 = $Matches[2].Trim()
        $val = $Matches[3]
        return "Si $var1 est nul, choix conditionnel selon $var2 (valeur '$val')"
    }
    if ($text -match "W0 imputation[^=]*='([^']+)'") {
        $imp = $Matches[1]
        return "Comportement conditionnel selon type d'imputation '$imp'"
    }
    if ($text -match "^IF\(NOT\s+([^,]+),") {
        $var = $Matches[1].Trim()
        return "Si $var est FAUX, branche alternative"
    }
    if ($text -match "IF\(IN\s*\(([^,]+),") {
        $inVar = $Matches[1].Trim()
        if ($text -match "\d+\.\d+") {
            return "Position UI conditionnelle selon $inVar"
        }
        return "Verification d'appartenance de $inVar a une liste de valeurs"
    }
    if ($text -match "Fix\([^*]+\*[^/]+/100") {
        return "Calcul de pourcentage avec arrondi"
    }
    if ($text -match "^IF\s*\(([^=]+)=''") {
        $var = $Matches[1].Trim()
        return "Valeur par defaut si $var est vide"
    }
    if ($text -match "^IF\s*\(([^=]+)=0,") {
        $var = $Matches[1].Trim()
        return "Traitement conditionnel si $var est a zero"
    }
    if ($text -match "^IF\s*\(([^<]+)<>''") {
        $var = $Matches[1].Trim()
        return "Traitement si $var est renseigne"
    }
    if ($text -match "^IF\s*\(([^<]+)<>0,") {
        $var = $Matches[1].Trim()
        return "Traitement si $var est non nul"
    }
    if ($text -match "DStr\s*\(.*Date\(\)") {
        return "Formatage de la date courante pour generation document"
    }
    if ($text -match "TStr\s*\(.*Time\(\)") {
        return "Formatage de l'heure courante pour generation document"
    }
    if ($text -match "Translate.*TempDir") {
        return "Construction du chemin de fichier temporaire pour document genere"
    }
    if ($text -match "GetParam\s*\(\s*'CURRENTPRINTERNUM'\s*\)\s*=\s*(\d+)") {
        $printer = $Matches[1]
        return "Verification que l'imprimante courante est la n$printer"
    }
    if ($text -match "GetParam\s*\(\s*'CURRENTPRINTERNUM'\s*\)$") {
        return "Recuperation du numero d'imprimante courante"
    }
    if ($text -match "^'([^']+)'$") {
        $val = $Matches[1]
        return "Constante '$val'"
    }
    if ($text -match "'TRUE'LOG") { return "Condition toujours vraie (flag actif)" }
    if ($text -match "'FALSE'LOG") { return "Condition toujours fausse (flag inactif)" }
    if ($text -match "^NOT\s+(.+)$") {
        $var = $Matches[1].Trim()
        return "Negation de $var (condition inversee)"
    }
    if ($text -match "^VG\d+$") {
        return "Reference a la variable globale $text"
    }

    if ($NaturalLanguage -and $NaturalLanguage.Trim() -ne '') {
        return $NaturalLanguage.Trim()
    }
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

function Get-StorageIcon {
    param([string]$Storage)
    switch ($Storage) {
        "Database" { return "DB" }
        "Temp"     { return "TMP" }
        "Memory"   { return "MEM" }
        default    { return "?" }
    }
}

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
    if ($n -match 'vente|ccvente') { return "Donnees de ventes" }
    if ($n -match 'article|stock') { return "Articles et stock" }
    if ($n -match 'session|caisse') { return "Sessions de caisse" }
    if ($n -match 'coffre') { return "Etat du coffre" }
    if ($n -match 'concurrence') { return "Verrou acces concurrent" }
    if ($n -match 'approvisionnement') { return "Comptage approvisionnement" }
    if ($n -match 'histo') { return "Historique / journal" }
    if ($n -match 'droit') { return "Droits operateur" }
    if ($n -match 'operation') { return "Operations comptables" }
    if ($n -match 'reglement') { return "Reglements / paiements" }
    if ($n -match 'devise|taux') { return "Devises / taux de change" }
    if ($n -match 'service|fil') { return "Services / filieres" }
    if ($n -match 'ccpartyp') { return "Totaux par type" }
    if ($n -match 'resort') { return "Resort Credit" }
    if ($n -match 'ezcard') { return "Carte EZ" }
    return ""
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
        if (-not $tableUnified.Contains($key)) {
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
            if (-not $dataTypeLookup.Contains($lk)) { $dataTypeLookup[$lk] = $v.data_type }
        }
    }
    $mapping.variable_mapping.PSObject.Properties | ForEach-Object {
        $ref = $_.Name; $letter = $_.Value.letter; $name = $_.Value.name
        $category = Get-VariableCategory $name
        $lk = "$letter|$name"
        $dataType = if ($dataTypeLookup.Contains($lk)) { $dataTypeLookup[$lk] } else { "N/A" }
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

# All expressions list
$allExprs = @()
foreach ($typeName in ($exprByType.Keys | Sort-Object)) {
    foreach ($expr in $exprByType[$typeName]) {
        $dText = if ($expr.decoded) { $expr.decoded } else { $expr.raw }
        # V7.2: precise expression type
        $preciseType = Get-ExpressionType -Decoded $dText -OriginalType $typeName
        $allExprs += @{
            type = $preciseType
            original_type = $typeName
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
    $ctx = if ($cn -match 'print|ticket|edition|imprim') { "Impression ticket/document" }
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
    elseif ($cn -match 'mise.{0,3}jour|maj|update') { "Mise a jour donnees" }
    elseif ($cn -match 'controle|verif') { "Controle/validation" }
    elseif ($cn -match 'ouverture|open') { "Ouverture session" }
    elseif ($cn -match 'fermeture|close|cloture') { "Fermeture session" }
    elseif ($cn -match 'affich|display') { "Affichage donnees" }
    elseif ($cn -match 'apport|approv') { "Approvisionnement" }
    elseif ($cn -match 'histo') { "Historique/consultation" }
    elseif ($cn -match 'session') { "Gestion session" }
    elseif ($cn -match 'raison') { "Parametrage" }
    elseif ($cn -match 'ventil') { "Ventilation donnees" }
    elseif ($cn -match 'menu') { "Navigation menu" }
    else { "Sous-programme" }
    $calleesCtx += @{ ide = $callee.ide; name = $callee.name; calls_count = $callee.calls_count; context = $ctx }
}

$writeCount = ($discovery.tables.by_access.WRITE | Measure-Object).Count
$readCount = ($discovery.tables.by_access.READ | Measure-Object).Count
$linkCount = ($discovery.tables.by_access.LINK | Measure-Object).Count
$taskCount = $discovery.statistics.task_count
$exprCount = $discovery.statistics.expression_count
$calleeCount = $discovery.statistics.callee_count

# Variable usage count
$varUsage = @{}
foreach ($e in $allExprs) {
    foreach ($v in $variableRows) {
        if ($e.decoded -match [regex]::Escape($v.Name)) {
            $key = "$($v.Letter)|$($v.Name)"
            if (-not $varUsage.Contains($key)) { $varUsage[$key] = 0 }
            $varUsage[$key]++
        }
    }
}

Write-Host "  $($visibleForms.Count) visible forms, $($blocMap.Count) blocks, $($businessRules.Count) rules"

# ============================================================
# GENERATE DETAILED SPEC - V7.2 (4 TABS)
# ============================================================
Write-Host "[3/7] Generating DETAILED spec (V7.2 - 4 tabs)..." -ForegroundColor Yellow

$L = [System.Collections.ArrayList]::new()
function Add-Line { param([string]$Text = "") $null = $L.Add($Text) }

# --- HEADER ---
Add-Line "# $Project IDE $IdePosition - $programName"
Add-Line
Add-Line "> **Analyse**: Phases 1-4 $($pipelineFirstPhase.ToString('yyyy-MM-dd HH:mm')) -> $($pipelineLastPhase.ToString('HH:mm')) ($pipelineDurationStr) | Assemblage $($startTime.ToString('HH:mm'))"
Add-Line "> **Pipeline**: V7.2 Enrichi"
Add-Line "> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)"
Add-Line

# ================================================================
# TAB 1: RESUME
# ================================================================
Add-Line "<!-- TAB:Resume -->"
Add-Line

# --- 1. Fiche identite (UNCHANGED from V7.1) ---
Add-Line "## 1. FICHE D'IDENTITE"
Add-Line

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
elseif ($pnLower -match 'ventil') { $domaineName = "Ventilation" }
elseif ($pnLower -match 'devers') { $domaineName = "Transfert" }

Add-Line "| Attribut | Valeur |"
Add-Line "|----------|--------|"
Add-Line "| Projet | $Project |"
Add-Line "| IDE Position | $IdePosition |"
Add-Line "| Nom Programme | $programName |"
Add-Line "| Fichier source | ``Prg_$IdePosition.xml`` |"
Add-Line "| Domaine metier | $domaineName |"
Add-Line "| Taches | $taskCount ($($visibleForms.Count) ecrans visibles) |"
Add-Line "| Tables modifiees | $writeCount |"
Add-Line "| Programmes appeles | $calleeCount |"
if ($discovery.orphan_analysis.status -eq "ORPHELIN" -or $discovery.orphan_analysis.status -eq "ORPHELIN_POTENTIEL") {
    Add-Line "| :warning: Statut | **$($discovery.orphan_analysis.status)** |"
}
Add-Line

# --- 2. Description fonctionnelle (V7.2: 2 niveaux) ---
Add-Line "## 2. DESCRIPTION FONCTIONNELLE"
Add-Line

# Level 1: Synthese (always visible)
$purposeCtx = ""
if ($discovery.call_graph.callers.Count -gt 0) {
    $callerLinks = ($discovery.call_graph.callers | ForEach-Object {
        Format-SpecLink -Name $_.name -Ide $_.ide -Proj $Project
    }) -join ', '
    $purposeCtx = ", accessible depuis $callerLinks"
}

$descParts = @()
$descParts += "**$programName** assure la gestion complete de ce processus$purposeCtx."

# Workflow from blocks
$sigBlocs = @()
foreach ($blocName in $blocMap.Keys) {
    $bCount = $blocMap[$blocName].Count
    if ($bCount -ge 1) { $sigBlocs += @{ name = $blocName; count = $bCount } }
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
        $descParts += "- **$bn** ($(Pluralize $bc 'tache' 'taches')) : $blocDesc"
    }
}

# Data impact
if ($discovery.tables.by_access.WRITE -and $discovery.tables.by_access.WRITE.Count -gt 0) {
    $writeTblNames = ($discovery.tables.by_access.WRITE | ForEach-Object { $_.logical_name }) -join ', '
    $descParts += ""
    $descParts += "**Donnees modifiees** : $writeCount tables en ecriture ($writeTblNames)."
}

# Business logic summary
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

# Level 2: Detail (expandable)
if ($blocMap.Count -gt 1 -or $allForms.Count -gt 3) {
    Add-Line "<details>"
    Add-Line "<summary>Detail : phases du traitement</summary>"
    Add-Line

    $phaseIdx = 1
    foreach ($blocName in $blocMap.Keys) {
        $blocForms = $blocMap[$blocName]
        $vis = @($blocForms | Where-Object { $_.dimensions.width -gt 0 })
        $invis = @($blocForms | Where-Object { $_.dimensions.width -le 0 })

        Add-Line "#### Phase $phaseIdx : $blocName ($(Pluralize $blocForms.Count 'tache' 'taches'))"
        Add-Line

        # Callees for this bloc
        $ctxToBlocMap = @{
            "Impression ticket/document" = "Impression"; "Configuration impression" = "Impression"
            "Calcul de donnees" = "Calcul"; "Recuperation donnees" = "Consultation"
            "Selection/consultation" = "Consultation"; "Verification solde" = "Calcul"
            "Gestion moyens paiement" = "Reglement"; "Programme fidelite" = "Reglement"
            "Identification operateur" = "Validation"; "Validation saisie" = "Validation"
            "Transfert donnees" = "Transfert"; "Reinitialisation" = "Initialisation"
            "Ventilation donnees" = "Transfert"
        }
        $blocCallees = @($calleesCtx | Where-Object {
            $ctxToBlocMap[$_.context] -eq $blocName -or
            (Get-FunctionalBloc $_.name) -eq $blocName
        })

        foreach ($f in $blocForms) {
            $fName = if ($f.name -and $f.name.Trim()) { $f.name.Trim() } else { "(sans nom)" }
            $isVis = $f.dimensions.width -gt 0
            $visMarker = if ($isVis) { " **[ECRAN]**" } else { "" }
            Add-Line "- **T$($f.task_isn2)** - $fName$visMarker"
        }

        if ($blocCallees.Count -gt 0) {
            Add-Line ""
            Add-Line "Delegue a : $(($blocCallees | ForEach-Object { Format-SpecLink -Name $_.name -Ide $_.ide -Proj $Project }) -join ', ')"
        }

        Add-Line
        $phaseIdx++
    }

    # Tables summary in detail
    if ($discovery.tables.by_access.WRITE -and $discovery.tables.by_access.WRITE.Count -gt 0) {
        Add-Line "#### Tables impactees"
        Add-Line
        Add-Line "| Table | Operations | Role metier |"
        Add-Line "|-------|-----------|-------------|"
        foreach ($t in ($tableUnified.Values | Where-Object { $_.W } | Sort-Object { $_.usage_total } -Descending)) {
            $ops = @()
            if ($t.R) { $ops += "R" }
            if ($t.W) { $ops += "**W**" }
            if ($t.L) { $ops += "L" }
            $desc = Get-TableDescription $t.logical_name
            Add-Line "| $($t.logical_name) | $($ops -join '/') ($($t.usage_total) usages) | $desc |"
        }
        Add-Line
    }

    Add-Line "</details>"
    Add-Line
}

# --- 3. Blocs fonctionnels (V7.2: ancres + liens + detail tache par tache) ---
Add-Line "## 3. BLOCS FONCTIONNELS"
Add-Line

if ($blocMap.Count -gt 0) {
    $bIdx = 1
    foreach ($blocName in $blocMap.Keys) {
        $blocForms = $blocMap[$blocName]
        $vis = @($blocForms | Where-Object { $_.dimensions.width -gt 0 })
        $invis = @($blocForms | Where-Object { $_.dimensions.width -le 0 })

        Add-Line "### 3.$bIdx $blocName ($(Pluralize $blocForms.Count 'tache' 'taches'))"
        Add-Line

        # Bloc narrative
        $blocNarrative = switch ($blocName) {
            "Saisie" {
                $visNames = ($vis | ForEach-Object { $_.name }) -join ', '
                if ($vis.Count -gt 0) {
                    "L'operateur saisit les donnees de la transaction via $(Pluralize $vis.Count 'ecran' 'ecrans') ($visNames)."
                } else {
                    "Ce bloc traite la saisie des donnees de la transaction."
                }
            }
            "Reglement" { "Gestion des moyens de paiement : $(Pluralize $blocForms.Count 'tache' 'taches') de reglement." }
            "Validation" { "Controles de coherence : $(Pluralize $blocForms.Count 'tache verifie' 'taches verifient') les donnees et conditions." }
            "Impression" { "Generation des documents et tickets." }
            "Calcul" { "Calculs metier : montants, stocks, compteurs." }
            "Transfert" { "Transfert de donnees entre modules." }
            "Consultation" { "Ecrans de recherche et consultation." }
            "Creation" { "Insertion de nouveaux enregistrements en base." }
            "Initialisation" { "Reinitialisation d'etats et variables de travail." }
            default { "Traitements internes." }
        }
        Add-Line $blocNarrative
        Add-Line

        # V7.2: Task-by-task detail with anchors
        foreach ($f in $blocForms) {
            $fName = if ($f.name -and $f.name.Trim()) { $f.name.Trim() } else { "(sans nom)" }
            $tId = [int]$f.task_isn2
            $isVis = $f.dimensions.width -gt 0

            Add-Line "---"
            Add-Line

            # V7.2: Anchor + title
            $visMarker = if ($isVis) { " [ECRAN]" } else { "" }
            $typeStr = if ($f.window_type_str -and $f.window_type_str -ne 'Type0') { " ($($f.window_type_str))" } else { "" }
            Add-Line "#### $(Format-Anchor "t$tId")T$tId - $fName$visMarker"
            Add-Line

            # V7.2 GAP1 fix: Task-specific role from task name (not generic bloc-based)
            $roleDesc = if ($tId -eq 1 -and $blocForms.Count -gt 5) {
                # Root task with many sub-tasks = orchestration
                "Tache d'orchestration : point d'entree du programme ($($blocForms.Count) sous-taches). Coordonne l'enchainement des traitements."
            } elseif ($fName -ne "(sans nom)" -and $fName.Length -gt 3) {
                # Named task: derive specific role from task name keywords
                $namePatterns = [ordered]@{
                    'saisie|transaction|vente' = "Saisie des donnees"
                    'reglement|paiement|refus.+TPE' = "Gestion du reglement"
                    'impression|print|ticket|edition' = "Generation du document"
                    'calcul|stock|compteur|pourcentage|taux|nombre' = "Calcul"
                    'verif|controle|valid|test|caractere' = "Verification"
                    'selection|choix|zoom|vol|ville' = "Selection par l'operateur"
                    'reinit|raz|init|affich' = "Reinitialisation"
                    'deversement|transfert' = "Transfert de donnees"
                    'solde|consultat|historique|recup|get' = "Consultation/chargement"
                    'creation|insert|ajout|nouv' = "Creation d'enregistrement"
                    'fidelisation|remise|gift|resort|credit' = "Calcul fidelite/avantage"
                    'matricule|operateur|printer|imprim' = "Configuration/parametrage"
                    'cheque|gestion' = "Gestion du moyen de paiement"
                }
                $matched = $false
                $desc = ""
                foreach ($pattern in $namePatterns.Keys) {
                    if ($fName -imatch $pattern) {
                        $desc = "$($namePatterns[$pattern]) : $fName."
                        $matched = $true
                        break
                    }
                }
                if (-not $matched) { $desc = "Traitement : $fName." }
                $desc
            } else {
                # Unnamed task: bloc-based fallback
                switch ($blocName) {
                    "Saisie" { "Ecran de saisie pour la transaction." }
                    "Reglement" { "Gestion du reglement et moyens de paiement." }
                    "Validation" { "Controle de coherence avant traitement." }
                    "Impression" { "Generation de ticket ou document." }
                    "Calcul" { "Calcul de montants ou compteurs." }
                    "Transfert" { "Transfert de donnees vers un autre module." }
                    "Consultation" { "Ecran de consultation ou recherche." }
                    "Creation" { "Insertion de donnees en base." }
                    "Initialisation" { "Reinitialisation des variables de travail." }
                    default { "Traitement interne." }
                }
            }
            Add-Line "**Role** : $roleDesc"

            if ($isVis) {
                Add-Line "**Ecran** : $($f.dimensions.width) x $($f.dimensions.height) DLU$typeStr | [Voir mockup](#ecran-t$tId)"
            }

            # V7.2 GAP2 fix: Sub-tasks foldable list for root task (T1 or first task of large blocs)
            if ($tId -eq 1 -and $blocForms.Count -gt 3) {
                $otherTasks = @($blocForms | Where-Object { [int]$_.task_isn2 -ne 1 })
                if ($otherTasks.Count -gt 0) {
                    Add-Line
                    Add-Line "<details>"
                    Add-Line "<summary>$($otherTasks.Count) sous-taches directes</summary>"
                    Add-Line
                    Add-Line "| Tache | Nom | Bloc |"
                    Add-Line "|-------|-----|------|"
                    foreach ($st in $otherTasks) {
                        $stName = if ($st.name -and $st.name.Trim()) { $st.name.Trim() } else { "(sans nom)" }
                        $stVis = if ($st.dimensions.width -gt 0) { " **[ECRAN]**" } else { "" }
                        $stBloc = Get-FunctionalBloc $stName
                        Add-Line "| [T$($st.task_isn2)](#t$($st.task_isn2)) | $stName$stVis | $stBloc |"
                    }
                    Add-Line
                    Add-Line "</details>"
                }
            }

            # V7.2 GAP2 fix: Show matched variables for this task (name-based matching)
            if ($fName -ne "(sans nom)" -and $fName.Length -gt 3) {
                $taskKeywords = ($fName -split '\s+') | Where-Object { $_.Length -ge 4 } | ForEach-Object { [regex]::Escape($_.ToLower()) }
                if ($taskKeywords.Count -gt 0) {
                    $taskVars = @($variableRows | Where-Object {
                        $vn = $_.Name.ToLower()
                        $taskKeywords | Where-Object { $vn -match $_ } | Select-Object -First 1
                    } | Select-Object -First 5)
                    if ($taskVars.Count -gt 0) {
                        Add-Line "**Variables liees** : $(($taskVars | ForEach-Object { "$($_.Letter) ($($_.Name))" }) -join ', ')"
                    }
                }
            }

            # Find callees for this task (by name matching)
            $taskCallees = @($calleesCtx | Where-Object {
                $fName.Length -ge 4 -and (
                    $_.name.ToLower() -match [regex]::Escape($fName.ToLower().Substring(0, [math]::Min(8, $fName.Length))) -or
                    (Get-FunctionalBloc $_.name) -eq $blocName
                )
            } | Select-Object -First 3)

            if ($taskCallees.Count -gt 0 -and $blocForms.Count -le 10) {
                $delegLinks = ($taskCallees | ForEach-Object { Format-SpecLink -Name $_.name -Ide $_.ide -Proj $Project }) -join ', '
                Add-Line "**Delegue a** : $delegLinks"
            }

            Add-Line
        }

        Add-Line
        $bIdx++
    }
}

# --- 5. Regles metier (V7.2: enrichi avec condition/action/variables/expression source) ---
Add-Line "## 5. REGLES METIER"
Add-Line
if ($businessRules.Count -gt 0) {
    Add-Line "$($businessRules.Count) regles identifiees:"
    Add-Line

    # Classify rules by bloc
    $rulesByBloc = [ordered]@{}
    foreach ($blocName in $blocMap.Keys) { $rulesByBloc[$blocName] = @() }
    $rulesByBloc["Autres"] = @()

    foreach ($rule in $businessRules) {
        $dExpr = if ($rule.decoded_expression) { $rule.decoded_expression } elseif ($rule.decoded) { $rule.decoded } else { $rule.raw_expression }
        $nl = if ($rule.natural_language) { $rule.natural_language } else { "" }
        $frRule = Reformulate-BusinessRule -Decoded $dExpr -RuleId $rule.id -NaturalLanguage $nl
        $entry = @{
            id = $rule.id; fr = $frRule; decoded = $dExpr
            expression_ide = if ($rule.expression_ide) { $rule.expression_ide } else { $null }
            condition = if ($rule.condition) { $rule.condition } else { $null }
            true_value = if ($rule.true_value) { $rule.true_value } else { $null }
            false_value = if ($rule.false_value) { $rule.false_value } else { $null }
            rule_type = if ($rule.type) { $rule.type } else { "GENERAL" }
        }

        $matched = $false
        foreach ($bn in $blocMap.Keys) {
            $ruleMatchesBloc = switch ($bn) {
                "Saisie"      { $dExpr -match 'saisie|transaction|vente|W0' }
                "Reglement"   { $dExpr -match 'regl|MOP|paiement|montant' }
                "Validation"  { $dExpr -match 'controle|verif|valid' }
                "Impression"  { $dExpr -match 'print|ticket|edition' }
                "Calcul"      { $dExpr -match 'Fix\(|pourcentage|\*.*/' }
                "Transfert"   { $dExpr -match 'bilat|transfer|devers' }
                "Consultation" { $dExpr -match 'affich|zoom|select' }
                "Creation"    { $dExpr -match 'creat|insert|ajout' }
                "Initialisation" { $dExpr -match 'init|raz|reinit' }
                default       { $false }
            }
            if ($ruleMatchesBloc) {
                $rulesByBloc[$bn] += $entry
                $matched = $true
                break
            }
        }
        if (-not $matched) { $rulesByBloc["Autres"] += $entry }
    }

    foreach ($bName in $rulesByBloc.Keys) {
        $bRules = $rulesByBloc[$bName]
        if ($bRules.Count -eq 0) { continue }
        Add-Line "### $bName ($($bRules.Count) regles)"
        Add-Line

        foreach ($r in $bRules) {
            # V7.2: enriched format with anchor
            Add-Line "#### $(Format-Anchor "rm-$($r.id)")[$($r.id)] $($r.fr)"
            Add-Line

            # Extract variables from decoded expression
            $exprVars = @()
            foreach ($v in $variableRows) {
                if ($r.decoded -match [regex]::Escape($v.Name)) {
                    $exprVars += "$($v.Letter) ($($v.Name))"
                }
            }

            Add-Line "| Element | Detail |"
            Add-Line "|---------|--------|"

            # V7.2 GAP3 fix: Use structured condition/true_value/false_value when available
            if ($r.condition) {
                Add-Line "| **Condition** | ``$($r.condition)`` |"
                if ($r.true_value) {
                    Add-Line "| **Si vrai** | $($r.true_value -replace '\|', '/') |"
                }
                if ($r.false_value) {
                    Add-Line "| **Si faux** | $($r.false_value -replace '\|', '/') |"
                }
            } elseif ($r.decoded -match "^IF\(") {
                Add-Line "| **Condition** | ``$($r.decoded.Substring(0, [math]::Min(100, $r.decoded.Length)))`` |"
                Add-Line "| **Action** | $($r.fr) |"
            } else {
                Add-Line "| **Expression** | ``$($r.decoded.Substring(0, [math]::Min(100, $r.decoded.Length)))`` |"
            }

            if ($exprVars.Count -gt 0) {
                Add-Line "| **Variables** | $($exprVars -join ', ') |"
            }

            # V7.2 GAP3 fix: Expression source (IDE position)
            if ($r.expression_ide) {
                $exprSrc = "Expression $($r.expression_ide)"
                $truncDecoded = $r.decoded.Substring(0, [math]::Min(60, $r.decoded.Length))
                Add-Line "| **Expression source** | $exprSrc : ``$truncDecoded`` |"
            }

            # V7.2 GAP3 fix: Exemple concret (derive from condition + values)
            if ($r.condition -and $r.true_value) {
                $exempleStr = "Si $($r.condition) → $($r.true_value -replace '\|', '/')"
                if ($r.false_value -and $r.false_value.Length -lt 60) {
                    $exempleStr += ". Sinon → $($r.false_value -replace '\|', '/')"
                }
                Add-Line "| **Exemple** | $exempleStr |"
            }

            # V7.2 GAP3 fix: Impact (link to task/screen if possible)
            $impactTask = $null
            foreach ($form in $allForms) {
                $formName = if ($form.name -and $form.name.Trim()) { $form.name.Trim() } else { "" }
                if ($formName.Length -ge 4) {
                    $formKeyword = ($formName -split '\s+')[0].ToLower()
                    if ($formKeyword.Length -ge 4 -and $r.decoded -imatch [regex]::Escape($formKeyword)) {
                        $impactTask = "[T$($form.task_isn2) - $formName](#t$($form.task_isn2))"
                        break
                    }
                }
            }
            if ($impactTask) {
                Add-Line "| **Impact** | $impactTask |"
            } elseif ($bName -ne "Autres") {
                Add-Line "| **Impact** | Bloc $bName |"
            }

            Add-Line
        }
    }
} else {
    Add-Line "*(Aucune regle metier identifiee)*"
    Add-Line
}

# --- 6. Contexte (V7.2: liens cliquables) ---
Add-Line "## 6. CONTEXTE"
Add-Line

# V7.2: clickable links for callers
$clrCompact = if ($discovery.call_graph.callers.Count -gt 0) {
    ($discovery.call_graph.callers | ForEach-Object { Format-SpecLink -Name $_.name -Ide $_.ide -Proj $Project }) -join ', '
} else { "(aucun)" }
Add-Line "- **Appele par**: $clrCompact"
Add-Line "- **Appelle**: $calleeCount programmes | **Tables**: $($tableUnified.Count) (W:$writeCount R:$readCount L:$linkCount) | **Taches**: $taskCount | **Expressions**: $exprCount"
Add-Line

# ================================================================
# TAB 2: ECRANS & FLUX
# ================================================================
Add-Line "<!-- TAB:Ecrans -->"
Add-Line

# --- 8. Ecrans (V7.2: position hierarchique + FORM-DATA + tables champs/boutons) ---
Add-Line "## 8. ECRANS"
Add-Line

if ($visibleForms.Count -gt 0) {
    # V7.2: Table with hierarchical position
    Add-Line "### 8.1 Forms visibles ($($visibleForms.Count) / $($allForms.Count))"
    Add-Line
    Add-Line "| # | Position | Tache | Nom | Type | Largeur | Hauteur | Bloc |"
    Add-Line "|---|----------|-------|-----|------|---------|---------|------|"
    $fIdx = 1
    foreach ($form in $visibleForms) {
        $fName = if ($form.name -and $form.name.Trim()) { $form.name.Trim() } else { "(sans nom)" }
        $fBloc = Get-FunctionalBloc $form.name
        Add-Line "| $fIdx | $IdePosition.$fIdx | T$($form.task_isn2) | $fName | $($form.window_type_str) | $($form.dimensions.width) | $($form.dimensions.height) | $fBloc |"
        $fIdx++
    }
    Add-Line

    # V7.2: Mockups with FORM-DATA blocks
    Add-Line "### 8.2 Mockups Ecrans"
    Add-Line

    $fIdx2 = 1
    foreach ($form in $visibleForms) {
        $fName = if ($form.name -and $form.name.Trim()) { $form.name.Trim() } else { "(sans nom)" }
        $w = $form.dimensions.width
        $h = $form.dimensions.height
        $type = $form.window_type_str
        $tNum = $form.task_isn2
        $fBloc = Get-FunctionalBloc $form.name

        Add-Line "---"
        Add-Line
        # V7.2: Anchor for cross-tab navigation
        Add-Line "#### $(Format-Anchor "ecran-t$tNum")$IdePosition.$fIdx2 - $fName"
        Add-Line "**Tache** : [T$tNum](#t$tNum) | **Type** : $type | **Dimensions** : $w x $h DLU"
        Add-Line "**Bloc** : $fBloc | **Titre IDE** : $fName"
        Add-Line

        # V7.2: FORM-DATA block for viewer rendering
        # Build controls from variable data
        $controls = @()
        $yPos = 13
        $xPos = 10

        # P0 parameters as read-only fields
        $formP0 = @($variableRows | Where-Object { $_.Category -eq "P0" } | Select-Object -First 6)
        foreach ($p0 in $formP0) {
            $controls += @{
                type = "edit"; x = $xPos; y = $yPos; w = 130; h = 20
                var = $p0.Letter; label = $p0.Name; readonly = $true
            }
            $xPos += 140
            if ($xPos -gt 600) { $xPos = 10; $yPos += 30 }
        }

        # W0 variables matching bloc as editable fields
        $blocPattern = switch ($fBloc) {
            "Saisie"         { 'saisie|transaction|vente|article|quantite|qte|produit|imputation|service|code|libelle|prix|montant|date' }
            "Reglement"      { 'regl|paiement|mop|montant|total|solde|devise|mode|cheque' }
            "Validation"     { 'controle|verif|valid|erreur|statut|confirm' }
            "Impression"     { 'print|ticket|edition|imprim|numero' }
            "Calcul"         { 'stock|calcul|compt|pourcentage|taux|cumul|total' }
            default          { '.' }
        }
        $xPos = 10; $yPos += 30
        $formW0 = @($variableRows | Where-Object {
            $_.Category -eq "W0" -and ($_.Name -match $blocPattern)
        } | Select-Object -First 8)
        foreach ($w0 in $formW0) {
            $controls += @{
                type = "edit"; x = $xPos; y = $yPos; w = 200; h = 20
                var = $w0.Letter; label = $w0.Name; readonly = $false
            }
            $xPos += 210
            if ($xPos -gt 600) { $xPos = 10; $yPos += 30 }
        }

        # Buttons at bottom
        $yPos = [math]::Max($yPos + 40, 200)
        $xPos = 10
        $formBtns = @($variableRows | Where-Object { $_.Name -match '^Bouton|^W0 Bouton|^Bt' } | Select-Object -First 4)
        foreach ($btn in $formBtns) {
            $controls += @{
                type = "button"; x = $xPos; y = $yPos; w = 80; h = 25
                var = $btn.Letter; label = ($btn.Name -replace '^(Bouton|W0 Bouton|Bt)\s*', '')
            }
            $xPos += 90
        }

        # Write FORM-DATA JSON block
        $formData = @{
            taskId = [int]$tNum
            type = $type
            width = [int]$w
            height = [int]$h
            controls = $controls
        }
        $formJson = $formData | ConvertTo-Json -Depth 4 -Compress
        Add-Line "<!-- FORM-DATA:"
        Add-Line ($formData | ConvertTo-Json -Depth 4)
        Add-Line "-->"
        Add-Line

        # V7.2: Field table
        $editControls = @($controls | Where-Object { $_.type -eq "edit" })
        if ($editControls.Count -gt 0) {
            Add-Line "**Champs :**"
            Add-Line
            Add-Line "| Variable | Nom | Type | Saisie |"
            Add-Line "|----------|-----|------|--------|"
            foreach ($ctrl in $editControls) {
                $vRow = $variableRows | Where-Object { $_.Letter -eq $ctrl.var } | Select-Object -First 1
                $saisie = if ($ctrl.readonly) { "Lecture" } else { "**Saisie**" }
                $dt = if ($vRow) { $vRow.DataType } else { "N/A" }
                Add-Line "| $($ctrl.var) | $($ctrl.label) | $dt | $saisie |"
            }
            Add-Line
        }

        # V7.2 GAP4 fix: Button table with specific actions (not generic "Action declenchee")
        $btnControls = @($controls | Where-Object { $_.type -eq "button" })
        if ($btnControls.Count -gt 0) {
            Add-Line "**Boutons :**"
            Add-Line
            Add-Line "| Bouton | Variable | Action |"
            Add-Line "|--------|----------|--------|"
            foreach ($btn in $btnControls) {
                # V7.2: Derive action from button label + callees matching
                $btnLabel = $btn.label.ToLower()
                $btnAction = "Action declenchee"
                # Try to match button to a callee
                $btnCallee = $calleesCtx | Where-Object {
                    $_.name.ToLower() -match [regex]::Escape($btnLabel.Substring(0, [math]::Min(5, $btnLabel.Length)))
                } | Select-Object -First 1
                if ($btnCallee) {
                    $btnAction = "Appel $(Format-SpecLink -Name $btnCallee.name -Ide $btnCallee.ide -Proj $Project)"
                } else {
                    # Derive from label keywords (extended patterns for Magic buttons)
                    $btnAction = switch -Regex ($btnLabel) {
                        'valid|ok|confirm|enreg' { "Valide la saisie et enregistre" }
                        'annul|cancel|retour|abandon' { "Annule et retour au menu" }
                        'imprim|print|ticket|edition' { "Lance l'impression" }
                        'zoom|cherch|search|select' { "Ouvre la selection" }
                        'calcul|total|remise' { "Lance le calcul" }
                        'suppr|delet|efface' { "Supprime l'element selectionne" }
                        'ajout|add|nouv' { "Ajoute un element" }
                        'identite|ident|nom|client' { "Identification du client" }
                        'fin\s*saisie|fin\s*od|terminer' { "Termine la saisie en cours" }
                        'solde|consulter|affich' { "Affiche le solde ou consultation" }
                        'ouvr|ferme|open|close' { "Ouvre ou ferme la session" }
                        'modif|edit|chang' { "Modifie l'element" }
                        'refresh|actual|recharger' { "Rafraichit l'affichage" }
                        'quitter|exit|sortir' { "Quitte le programme" }
                        default { "Bouton fonctionnel" }
                    }
                }
                Add-Line "| $($btn.label) | $($btn.var) | $btnAction |"
            }
            Add-Line
        }

        $fIdx2++
    }
} else {
    Add-Line "*(Programme sans ecran visible)*"
    Add-Line
}

# --- 9. Navigation (V7.2: vrais enchainements d'ecrans) ---
Add-Line "## 9. NAVIGATION"
Add-Line

if ($visibleForms.Count -gt 1) {
    Add-Line "### 9.1 Enchainement des ecrans"
    Add-Line

    # V7.2: Real screen flow (not linear bloc flow)
    Add-Line '```mermaid'
    Add-Line "flowchart TD"
    Add-Line "    START([Entree])"
    Add-Line "    style START fill:#3fb950"

    # Show each visible form as a node with real links
    foreach ($form in $visibleForms) {
        $fName = if ($form.name -and $form.name.Trim()) { $form.name.Trim() } else { "(sans nom)" }
        $fLabel = Clean-MermaidLabel "T$($form.task_isn2) $fName"
        Add-Line "    VF$($form.task_isn2)[$fLabel]"
        Add-Line "    style VF$($form.task_isn2) fill:#58a6ff"
    }

    # Connect callees that are external screens
    foreach ($c in $calleesCtx) {
        if ($c.ide -gt 0) {
            $cLabel = Clean-MermaidLabel "IDE $($c.ide) $($c.name)"
            Add-Line "    EXT$($c.ide)[$cLabel]"
            Add-Line "    style EXT$($c.ide) fill:#3fb950"
        }
    }

    Add-Line "    FIN([Sortie])"
    Add-Line "    style FIN fill:#f85149"

    # Connect first screen from START
    if ($visibleForms.Count -gt 0) {
        Add-Line "    START --> VF$($visibleForms[0].task_isn2)"
    }

    # Connect callees from first visible form (main screen)
    $mainFormId = if ($visibleForms.Count -gt 0) { $visibleForms[0].task_isn2 } else { 0 }
    foreach ($c in ($calleesCtx | Select-Object -First 8)) {
        if ($c.ide -gt 0) {
            Add-Line "    VF$mainFormId -->|$($c.context)| EXT$($c.ide)"
        }
    }

    # Last external callee -> FIN
    $lastCallee = $calleesCtx | Select-Object -Last 1
    if ($lastCallee -and $lastCallee.ide -gt 0) {
        Add-Line "    EXT$($lastCallee.ide) --> FIN"
    } else {
        Add-Line "    VF$mainFormId --> FIN"
    }

    Add-Line '```'
    Add-Line

    # V7.2: Detail navigation table
    Add-Line "**Detail par enchainement :**"
    Add-Line
    Add-Line "| Depuis | Action | Vers | Retour |"
    Add-Line "|--------|--------|------|--------|"
    foreach ($c in $calleesCtx) {
        if ($c.ide -gt 0) {
            $fromScreen = if ($visibleForms.Count -gt 0) { $visibleForms[0].name } else { $programName }
            Add-Line "| $fromScreen | $($c.context) | $(Format-SpecLink -Name $c.name -Ide $c.ide -Proj $Project) | Retour ecran |"
        }
    }
    Add-Line

} elseif ($visibleForms.Count -eq 1) {
    Add-Line "Ecran unique: **$($visibleForms[0].name)**"
    Add-Line
}

# V7.2: Hierarchical task structure as table
Add-Line "### 9.3 Structure hierarchique ($(Pluralize $allForms.Count 'tache' 'taches'))"
Add-Line
Add-Line "| Position | Tache | Type | Dimensions | Bloc |"
Add-Line "|----------|-------|------|------------|------|"

$blocIdx = 1
foreach ($blocName in $blocMap.Keys) {
    $blocForms = @($blocMap[$blocName] | Sort-Object { [int]$_.task_isn2 })
    if ($blocForms.Count -eq 0) { continue }

    $parentForm = $blocForms[0]
    $parentTaskId = [int]$parentForm.task_isn2
    $pName = if ($parentForm.name -and $parentForm.name.Trim()) { $parentForm.name.Trim() } else { "(sans nom)" }
    $pType = if ($parentForm.window_type_str -and $parentForm.window_type_str -ne 'Type0') { $parentForm.window_type_str } else { "-" }
    $pDims = "-"
    $pMockup = ""
    if ($parentForm.dimensions.width -gt 0) {
        $pDims = "$($parentForm.dimensions.width)x$($parentForm.dimensions.height)"
        $pMockup = " [mockup](#ecran-t$parentTaskId)"
    }
    Add-Line "| **$IdePosition.$blocIdx** | [**$pName** (T$parentTaskId)](#t$parentTaskId)$pMockup | $pType | $pDims | $blocName |"

    $childIdx = 1
    for ($fi = 1; $fi -lt $blocForms.Count; $fi++) {
        $cf = $blocForms[$fi]
        $cId = [int]$cf.task_isn2
        $cName = if ($cf.name -and $cf.name.Trim()) { $cf.name.Trim() } else { "(sans nom)" }
        $cType = if ($cf.window_type_str -and $cf.window_type_str -ne 'Type0') { $cf.window_type_str } else { "-" }
        $cDims = "-"
        $cMockup = ""
        if ($cf.dimensions.width -gt 0) {
            $cDims = "$($cf.dimensions.width)x$($cf.dimensions.height)"
            $cMockup = " [mockup](#ecran-t$cId)"
        }
        Add-Line "| $IdePosition.$blocIdx.$childIdx | [$cName (T$cId)](#t$cId)$cMockup | $cType | $cDims | |"
        $childIdx++
    }
    $blocIdx++
}
Add-Line

# V7.2-FIX5: Algorigramme metier (programmes complexes >3 taches)
$isComplex = ($allForms.Count -gt 3)
if ($isComplex) {
    Add-Line "### 9.4 Algorigramme"
    Add-Line
    Add-Line '```mermaid'
    Add-Line "flowchart TD"
    Add-Line "    START([Entree])"
    Add-Line "    style START fill:#3fb950"

    # Extract decision conditions from decoded expressions
    $decisions = @()
    if ($decoded -and $decoded.expressions) {
        # decoded.json structure: expressions.all[] or expressions.by_type.CONDITION[]
        $allExprs = @()
        if ($decoded.expressions.by_type -and $decoded.expressions.by_type.CONDITION) {
            $allExprs = @($decoded.expressions.by_type.CONDITION)
        } elseif ($decoded.expressions.all) {
            $allExprs = @($decoded.expressions.all | Where-Object {
                $_.decoded -and ($_.decoded -match '(?i)IF\s*\(')
            })
        } elseif ($decoded.expressions -is [array]) {
            $allExprs = @($decoded.expressions | Where-Object {
                $_.decoded -and ($_.decoded -match '(?i)IF\s*\(')
            })
        }

        $ifExprs = @($allExprs | Select-Object -First 6)

        foreach ($expr in $ifExprs) {
            # Extract condition from IF(condition, ...)
            $condMatch = [regex]::Match($expr.decoded, '(?i)IF\s*\(([^,]+)')
            if ($condMatch.Success) {
                $cond = $condMatch.Groups[1].Value.Trim()
                # Shorten for display
                if ($cond.Length -gt 25) { $cond = $cond.Substring(0, 22) + "..." }
                $cond = $cond -replace "['""`<>{}()\[\]/\\?!&]", ''
                if ($cond.Trim()) {
                    $decisions += @{ condition = $cond; task = $expr.task; exprId = $expr.id }
                }
            }
        }
    }

    # Build nodes: mix of functional blocs and decision diamonds
    $blocKeys = @($blocMap.Keys)
    $nodeIds = @()
    $bIdx = 1
    $dIdx = 0

    foreach ($bk in $blocKeys) {
        $bForms = @($blocMap[$bk])
        $screenCount = @($bForms | Where-Object { $_.dimensions.width -gt 0 }).Count
        $taskCount = $bForms.Count
        $nodeId = "BLK$bIdx"
        $shortName = Clean-MermaidLabel $bk

        # Add bloc node
        if ($screenCount -gt 0) {
            Add-Line "    $nodeId[$shortName]"
        } else {
            Add-Line "    $nodeId[$shortName]"
        }
        Add-Line "    style $nodeId fill:#58a6ff"
        $nodeIds += $nodeId

        # Add decision after this bloc if a matching IF expression exists
        if ($dIdx -lt $decisions.Count) {
            $dec = $decisions[$dIdx]
            $decNodeId = "DEC$($dIdx + 1)"
            $decLabel = Clean-MermaidLabel $dec.condition
            Add-Line "    $decNodeId{$decLabel}"
            Add-Line "    style $decNodeId fill:#ffeb3b,color:#000"
            $nodeIds += $decNodeId
            $dIdx++
        }

        $bIdx++
    }

    # External calls
    $calleeList = @()
    if ($discovery.call_graph -and $discovery.call_graph.callees) {
        $calleeList = @($discovery.call_graph.callees | Select-Object -First 8)
    }
    $extIdx = 1
    foreach ($callee in $calleeList) {
        $cName = Clean-MermaidLabel "IDE $($callee.ide) $($callee.name)"
        Add-Line "    EXT$extIdx([$cName])"
        Add-Line "    style EXT$extIdx fill:#3fb950"
        $extIdx++
    }

    Add-Line "    FIN([Sortie])"
    Add-Line "    style FIN fill:#f85149"

    # Connect nodes sequentially with decision branches
    if ($nodeIds.Count -gt 0) {
        Add-Line "    START --> $($nodeIds[0])"

        for ($i = 0; $i -lt $nodeIds.Count - 1; $i++) {
            $current = $nodeIds[$i]
            $next = $nodeIds[$i + 1]

            if ($current -match '^DEC') {
                # Decision node: OUI goes forward, NON skips
                $skipTarget = if ($i + 2 -lt $nodeIds.Count) { $nodeIds[$i + 2] } else { "FIN" }
                Add-Line "    $current -->|OUI| $next"
                Add-Line "    $current -->|NON| $skipTarget"
            } else {
                Add-Line "    $current --> $next"
            }
        }

        # Connect last node to FIN
        $lastNode = $nodeIds[$nodeIds.Count - 1]
        if ($lastNode -match '^DEC') {
            Add-Line "    $lastNode -->|OUI| FIN"
        } else {
            Add-Line "    $lastNode --> FIN"
        }
    } else {
        Add-Line "    START --> FIN"
    }

    # Connect external calls with dotted lines from first bloc
    $firstBloc = $nodeIds | Where-Object { $_ -match '^BLK' } | Select-Object -First 1
    if ($firstBloc) {
        $extIdx = 1
        foreach ($callee in $calleeList) {
            Add-Line "    $firstBloc -.->|appel| EXT$extIdx"
            $extIdx++
        }
    }

    Add-Line '```'
    Add-Line
    Add-Line "> **Legende** : Bleu = blocs fonctionnels | Vert = programmes externes | Jaune = decisions | Rouge = sortie"
    Add-Line
}

# ================================================================
# TAB 3: DONNEES
# ================================================================
Add-Line "<!-- TAB:Donnees -->"
Add-Line

# --- 10. Tables (V7.2: fusionnees avec colonnes utilisees/non-utilisees) ---
Add-Line "## 10. TABLES"
Add-Line

$usedTables = @($tableUnified.Values | Where-Object { $_.R -or $_.W -or $_.L } | Sort-Object { [int]$_.id })

# V7.2: Single unified table (merged 10.1 + 10.2)
Add-Line "### Tables utilisees ($($usedTables.Count))"
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

# V7.3: Structural table-to-column mapping from KB (replaces heuristic name matching)
# Strategy: 1) Real columns (definition=R) from table_columns
#            2) Virtual/Param vars from table_other_vars (task bound to table)
#            3) Fallback: heuristic name matching
$tableColDetails = @{}
$structuralMatchCount = 0

# Helper: try to get columns from a mapping property (handles both Hashtable and PSObject)
function Get-TableColsFromMapping {
    param($MappingProp, [string]$TableKey)
    if (-not $MappingProp) { return $null }
    # Try Hashtable access
    if ($MappingProp -is [hashtable] -and $MappingProp.ContainsKey($TableKey)) {
        return @($MappingProp[$TableKey])
    }
    # Try PSObject property access (JSON deserialized)
    if ($MappingProp.PSObject -and $MappingProp.PSObject.Properties[$TableKey]) {
        return @($MappingProp.PSObject.Properties[$TableKey].Value)
    }
    return $null
}

if ($mapping) {
    foreach ($tKey in $tableUnified.Keys) {
        $tEntry = $tableUnified[$tKey]
        $cols = $null

        # Priority 1: Real columns (definition='R') - direct table column mapping
        $cols = Get-TableColsFromMapping -MappingProp $mapping.table_columns -TableKey $tKey

        # Priority 2: Virtual/Param vars in tasks bound to this table
        if (-not $cols -or $cols.Count -eq 0) {
            $cols = Get-TableColsFromMapping -MappingProp $mapping.table_other_vars -TableKey $tKey
        }

        if ($cols -and $cols.Count -gt 0) {
            $tableColDetails[$tKey] = @()
            foreach ($col in $cols) {
                $rw = if ($tEntry.W) { "W" } else { "R" }
                $tableColDetails[$tKey] += @{
                    letter = $col.letter
                    name = $col.name
                    rw = $rw
                    type = $col.data_type
                    used = $true
                }
            }
            $structuralMatchCount++
        }
    }
}

# Fallback: heuristic name matching for tables not covered by structural data
if ($mapping -and $mapping.variables -and $mapping.variables.local) {
    foreach ($tKey in $tableUnified.Keys) {
        if ($tableColDetails.Contains($tKey)) { continue }  # Already matched structurally
        $tEntry = $tableUnified[$tKey]
        $tLogical = $tEntry.logical_name.ToLower()
        $tWords = ($tLogical -replace '_+', ' ').Trim() -split '\s+' | Where-Object { $_.Length -ge 3 }
        $tSuffix = if ($tLogical -match '(\w{3})$') { $Matches[1] } else { "" }

        foreach ($v in $mapping.variables.local) {
            $vName = $v.name
            $vLower = $vName.ToLower()
            $matchFound = $false
            foreach ($word in $tWords) {
                if ($word.Length -ge 4 -and $vLower -match [regex]::Escape($word)) {
                    $matchFound = $true
                    break
                }
            }
            if (-not $matchFound -and $tSuffix.Length -eq 3 -and $vLower -match "^$([regex]::Escape($tSuffix))\s") {
                $matchFound = $true
            }
            if ($matchFound) {
                if (-not $tableColDetails.Contains($tKey)) { $tableColDetails[$tKey] = @() }
                $alreadyAdded = $tableColDetails[$tKey] | Where-Object { $_.letter -eq $v.letter }
                if (-not $alreadyAdded) {
                    $rw = if ($tEntry.W) { "W" } else { "R" }
                    $tableColDetails[$tKey] += @{ letter = $v.letter; name = $vName; rw = $rw; type = $v.data_type; used = $true }
                }
            }
        }
    }
}

# V7.3: Column details with structural matching + heuristic fallback
$matchedTableCount = ($tableColDetails.Keys | Measure-Object).Count
$totalTableAccess = @($usedTables | Where-Object { $_.W -or $_.R }).Count
Add-Line "### Colonnes par table ($matchedTableCount / $totalTableAccess tables avec colonnes identifiees)"
Add-Line
$tablesWithAccess = @($usedTables | Where-Object { $_.W -or $_.R })
foreach ($t in $tablesWithAccess) {
    $tKey = "$($t.id)"
    $accessMode = @()
    if ($t.R) { $accessMode += "R" }
    if ($t.W) { $accessMode += "**W**" }
    if ($t.L) { $accessMode += "L" }
    $accessStr = $accessMode -join '/'

    Add-Line "<details>"
    Add-Line "<summary>Table $($t.id) - $($t.logical_name) ($accessStr) - $($t.usage_total) usages</summary>"
    Add-Line

    if ($tableColDetails.Contains($tKey) -and $tableColDetails[$tKey].Count -gt 0) {
        $usedCols = $tableColDetails[$tKey]
        Add-Line "| Lettre | Variable | Acces | Type |"
        Add-Line "|--------|----------|-------|------|"
        foreach ($col in $usedCols) {
            Add-Line "| $($col.letter) | $($col.name) | $($col.rw) | $($col.type) |"
        }
    } else {
        Add-Line "*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*"
    }
    Add-Line
    Add-Line "</details>"
    Add-Line
}

# --- 11. Variables (V7.2: restructure par role P0/V./W0) ---
Add-Line "## 11. VARIABLES"
Add-Line

if ($variableRows.Count -gt 0) {
    # V7.2: Group by role instead of flat top-20
    $roleGroups = [ordered]@{
        "P0" = @()
        "V." = @()
        "W0" = @()
        "VG" = @()
        "Autre" = @()
    }
    foreach ($v in $variableRows) {
        $cat = $v.Category
        if ($roleGroups.Contains($cat)) {
            $roleGroups[$cat] += $v
        } else {
            $roleGroups["Autre"] += $v
        }
    }

    $roleIdx = 1
    foreach ($roleName in $roleGroups.Keys) {
        $roleVars = $roleGroups[$roleName]
        if ($roleVars.Count -eq 0) { continue }

        $roleLabel = Get-VariableRole $roleName
        Add-Line "### 11.$roleIdx $roleLabel ($($roleVars.Count))"
        Add-Line

        # Role description
        $roleDesc = switch ($roleName) {
            "P0" {
                if ($discovery.call_graph.callers.Count -gt 0) {
                    $callerLink = Format-SpecLink -Name $discovery.call_graph.callers[0].name -Ide $discovery.call_graph.callers[0].ide -Proj $Project
                    "Variables recues du programme appelant ($callerLink)."
                } else {
                    "Variables recues en parametre."
                }
            }
            "V." { "Variables persistantes pendant toute la session." }
            "W0" { "Variables internes au programme." }
            "VG" { "Variables globales partagees entre programmes." }
            default { "Variables diverses." }
        }
        Add-Line $roleDesc
        Add-Line

        Add-Line "| Lettre | Nom | Type | Usage dans |"
        Add-Line "|--------|-----|------|-----------|"
        foreach ($v in $roleVars) {
            $key = "$($v.Letter)|$($v.Name)"
            $usageCount = if ($varUsage.Contains($key)) { $varUsage[$key] } else { 0 }

            # V7.2 GAP6 fix: Replace "Xx refs" with task links or descriptive context
            $usageStr = "-"
            if ($usageCount -gt 0) {
                # Try to find matching tasks by variable name keywords
                $varKeywords = ($v.Name -split '\s+') | Where-Object { $_.Length -ge 4 } | ForEach-Object { [regex]::Escape($_.ToLower()) }
                $matchedTasks = @()
                if ($varKeywords.Count -gt 0) {
                    foreach ($form in $allForms) {
                        $formName = if ($form.name -and $form.name.Trim()) { $form.name.Trim().ToLower() } else { "" }
                        if ($formName.Length -ge 4) {
                            foreach ($kw in $varKeywords) {
                                if ($formName -match $kw) {
                                    $matchedTasks += "[T$($form.task_isn2)](#t$($form.task_isn2))"
                                    break
                                }
                            }
                        }
                        if ($matchedTasks.Count -ge 3) { break }
                    }
                }
                if ($matchedTasks.Count -gt 0) {
                    $usageStr = ($matchedTasks | Select-Object -Unique) -join ', '
                } else {
                    # Fallback: show count with context based on variable category
                    $ctxHint = switch ($v.Category) {
                        "P0" { "parametre entrant" }
                        "V." { "session" }
                        "W0" { "calcul interne" }
                        "VG" { "variable globale" }
                        default { "refs" }
                    }
                    $usageStr = "${usageCount}x $ctxHint"
                }
            }
            Add-Line "| $($v.Letter) | $($v.Name) | $($v.DataType) | $usageStr |"
        }
        Add-Line

        $roleIdx++
    }

    # V7.2: Full list in details
    if ($variableRows.Count -gt 15) {
        Add-Line "<details>"
        Add-Line "<summary>Toutes les $($variableRows.Count) variables (liste complete)</summary>"
        Add-Line
        Add-Line "| Cat | Lettre | Nom Variable | Type |"
        Add-Line "|-----|--------|--------------|------|"
        foreach ($v in $variableRows) {
            Add-Line "| $($v.Category) | **$($v.Letter)** | $($v.Name) | $($v.DataType) |"
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
    Add-Line "### Parametres d'entree"
    Add-Line
    Add-Line "| Lettre | Nom | Type | Picture |"
    Add-Line "|--------|-----|------|---------|"
    foreach ($p in $mapping.variables.parameters) {
        Add-Line "| $($p.letter) | $($p.name) | $($p.data_type) | $($p.picture) |"
    }
    Add-Line
}

# --- 12. Expressions (V7.2: types precis) ---
Add-Line "## 12. EXPRESSIONS"
Add-Line

if ($decoded) {
    $totalExpr = $decoded.statistics.decoded_count
    $totalInProg = $decoded.statistics.total_in_program
    $coverage = $decoded.statistics.coverage_percent

    Add-Line "**$totalExpr / $totalInProg expressions decodees ($coverage%)**"
    Add-Line

    # V7.2: Group by precise type
    $exprByPreciseType = [ordered]@{}
    foreach ($e in $allExprs) {
        $pt = $e.type
        if (-not $exprByPreciseType.Contains($pt)) { $exprByPreciseType[$pt] = @() }
        $exprByPreciseType[$pt] += $e
    }

    # 12.1 Summary by type
    Add-Line "### 12.1 Repartition par type"
    Add-Line
    Add-Line "| Type | Expressions | Regles |"
    Add-Line "|------|-------------|--------|"
    foreach ($tn in $exprByPreciseType.Keys) {
        $tExprs = $exprByPreciseType[$tn]
        if ($tExprs.Count -eq 0) { continue }
        $ruleCount = ($tExprs | Where-Object { $_.rule_id }).Count
        Add-Line "| $tn | $($tExprs.Count) | $ruleCount |"
    }
    Add-Line

    # 12.2 Key expressions per type (top 5 each)
    Add-Line "### 12.2 Expressions cles par type"
    Add-Line
    foreach ($tn in $exprByPreciseType.Keys) {
        $tExprs = $exprByPreciseType[$tn]
        if ($tExprs.Count -eq 0) { continue }

        $sorted = @($tExprs | Sort-Object { if ($_.rule_id) { "A" } else { "Z" } })
        $top5 = $sorted | Select-Object -First 5

        Add-Line "#### $tn ($($tExprs.Count) expressions)"
        Add-Line
        Add-Line "| Type | IDE | Expression | Regle |"
        Add-Line "|------|-----|------------|-------|"
        foreach ($e in $top5) {
            $dt = $e.decoded -replace '\|', '\|'
            $rr = if ($e.rule_id) { "[$($e.rule_id)](#rm-$($e.rule_id))" } else { "-" }
            Add-Line "| $($e.type) | $($e.ide_position) | ``$dt`` | $rr |"
        }
        if ($tExprs.Count -gt 5) {
            Add-Line "| ... | | *+$($tExprs.Count - 5) autres* | |"
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
        foreach ($tn in $exprByPreciseType.Keys) {
            $tExprs = $exprByPreciseType[$tn]
            if ($tExprs.Count -eq 0) { continue }
            Add-Line "#### $tn ($($tExprs.Count))"
            Add-Line
            Add-Line "| IDE | Expression Decodee |"
            Add-Line "|-----|-------------------|"
            foreach ($e in $tExprs) {
                $dt = $e.decoded -replace '\|', '\|'
                Add-Line "| $($e.ide_position) | ``$dt`` |"
            }
            Add-Line
        }
        Add-Line "</details>"
        Add-Line
    }
}

# ================================================================
# TAB 4: CONNEXIONS
# ================================================================
Add-Line "<!-- TAB:Connexions -->"
Add-Line

# --- 13. Graphe d'appels (V7.2: liens cliquables) ---
Add-Line "## 13. GRAPHE D'APPELS"
Add-Line

# Callers diagram
Add-Line "### 13.1 Chaine depuis Main (Callers)"
Add-Line

if ($discovery.call_graph.callers.Count -gt 0) {
    $pathLines = @()
    foreach ($caller in $discovery.call_graph.callers) {
        $pathLines += "Main -> ... -> $(Format-SpecLink -Name $caller.name -Ide $caller.ide -Proj $Project) -> **$programName (IDE $IdePosition)**"
    }
    Add-Line ($pathLines -join "`n`n")
} else {
    Add-Line "**Chemin**: (pas de callers directs)"
}
Add-Line

$tgtLabel = Clean-MermaidLabel "$IdePosition $programName"
Add-Line '```mermaid'
Add-Line "graph LR"
Add-Line "    T$IdePosition[$tgtLabel]"
Add-Line "    style T$IdePosition fill:#58a6ff"

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
    $definedNodes = @{}
    foreach ($n in ($chainNodes | Sort-Object { $_.level } -Descending)) {
        $nId = "CC$($n.ide)"
        if ($definedNodes.Contains($nId)) { continue }
        $nLbl = Clean-MermaidLabel "$($n.ide) $($n.name)"
        $color = if ($n.level -eq $maxLevel) { "#8b5cf6" }
                 elseif ($n.level -eq 1) { "#3fb950" }
                 else { "#f59e0b" }
        Add-Line "    $nId[$nLbl]"
        Add-Line "    style $nId fill:$color"
        $definedNodes[$nId] = $n
    }

    $nodesByLevel = @{}
    foreach ($n in $chainNodes) {
        $lvl = $n.level
        if (-not $nodesByLevel.Contains($lvl)) { $nodesByLevel[$lvl] = @() }
        $nodesByLevel[$lvl] += $n
    }

    for ($lvl = 1; $lvl -lt $maxLevel; $lvl++) {
        if (-not $nodesByLevel.Contains($lvl)) { continue }
        $parentLvl = $lvl + 1
        if (-not $nodesByLevel.Contains($parentLvl)) { continue }
        foreach ($child in $nodesByLevel[$lvl]) {
            foreach ($parent in $nodesByLevel[$parentLvl]) {
                Add-Line "    CC$($parent.ide) --> CC$($child.ide)"
            }
        }
    }

    if ($nodesByLevel.Contains(1)) {
        foreach ($caller in $nodesByLevel[1]) {
            Add-Line "    CC$($caller.ide) --> T$IdePosition"
        }
    }
} elseif ($discovery.call_graph.callers.Count -gt 0) {
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

# V7.2: Callers table with links
Add-Line "### 13.2 Callers"
Add-Line
Add-Line "| IDE | Nom Programme | Nb Appels |"
Add-Line "|-----|---------------|-----------|"
foreach ($caller in $discovery.call_graph.callers) {
    Add-Line "| [$($caller.ide)]($Project-IDE-$($caller.ide).md) | $($caller.name) | $($caller.calls_count) |"
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

# V7.2: Callees table with links and context
Add-Line "### 13.4 Detail Callees avec contexte"
Add-Line
Add-Line "| IDE | Nom Programme | Appels | Contexte |"
Add-Line "|-----|---------------|--------|----------|"
foreach ($c in $calleesCtx) {
    Add-Line "| [$($c.ide)]($Project-IDE-$($c.ide).md) | $($c.name) | $($c.calls_count) | $($c.context) |"
}
if ($calleesCtx.Count -eq 0) { Add-Line "| - | (aucun) | - | - |" }
Add-Line

# --- 14. Migration (V7.2: recommandations concretes) ---
Add-Line "## 14. RECOMMANDATIONS MIGRATION"
Add-Line

$lines = $discovery.statistics.logic_line_count

Add-Line "### 14.1 Profil du programme"
Add-Line
Add-Line "| Metrique | Valeur | Impact migration |"
Add-Line "|----------|--------|-----------------|"
Add-Line "| Lignes de logique | $lines | $(if ($lines -gt 500) { 'Programme volumineux' } elseif ($lines -gt 200) { 'Taille moyenne' } else { 'Programme compact' }) |"
Add-Line "| Expressions | $exprCount | $(if ($exprCount -gt 200) { 'Beaucoup de logique conditionnelle' } elseif ($exprCount -gt 50) { 'Logique moderee' } else { 'Peu de logique' }) |"
Add-Line "| Tables WRITE | $writeCount | $(if ($writeCount -gt 5) { 'Fort impact donnees' } elseif ($writeCount -gt 2) { 'Impact modere' } else { 'Impact faible' }) |"
Add-Line "| Sous-programmes | $calleeCount | $(if ($calleeCount -gt 10) { 'Forte dependance' } elseif ($calleeCount -gt 5) { 'Dependances moderees' } else { 'Peu de dependances' }) |"
Add-Line "| Ecrans visibles | $($visibleForms.Count) | $(if ($visibleForms.Count -gt 5) { 'Interface complexe multi-ecrans' } elseif ($visibleForms.Count -gt 1) { 'Quelques ecrans' } else { 'Ecran unique ou traitement batch' }) |"
$totalLinesCalc = $discovery.statistics.logic_line_count
$disabledLinesCalc = $discovery.statistics.disabled_line_count
$disabledPctCalc = if ($totalLinesCalc -gt 0) { [math]::Round($disabledLinesCalc / $totalLinesCalc * 100, 1) } else { 0 }
Add-Line "| Code desactive | ${disabledPctCalc}% ($disabledLinesCalc / $totalLinesCalc) | $(if ($disabledPctCalc -gt 15) { 'Nettoyer avant migration' } elseif ($disabledPctCalc -gt 5) { 'A verifier' } else { 'Code sain' }) |"
Add-Line "| Regles metier | $($businessRules.Count) | $(if ($businessRules.Count -gt 10) { 'Logique metier riche' } elseif ($businessRules.Count -gt 0) { 'Quelques regles a preserver' } else { 'Pas de regle identifiee' }) |"
Add-Line

# V7.2: Concrete migration plan per bloc
Add-Line "### 14.2 Plan de migration par bloc"
Add-Line
foreach ($blocName in $blocMap.Keys) {
    $blocForms = $blocMap[$blocName]
    $blocVis = @($blocForms | Where-Object { $_.dimensions.width -gt 0 })
    $blocInvis = @($blocForms | Where-Object { $_.dimensions.width -le 0 })

    Add-Line "#### $blocName ($(Pluralize $blocForms.Count 'tache' 'taches'): $(Pluralize $blocVis.Count 'ecran' 'ecrans'), $(Pluralize $blocInvis.Count 'traitement' 'traitements'))"
    Add-Line

    # V7.2: Concrete strategy recommendations
    $recoms = @()
    switch ($blocName) {
        "Saisie" {
            $recoms += "**Strategie** : Formulaire React/Blazor avec validation Zod/FluentValidation."
            if ($blocVis.Count -gt 0) {
                $recoms += "Reproduire $(Pluralize $blocVis.Count 'ecran' 'ecrans') : $(($blocVis | ForEach-Object { $_.name }) -join ', ')"
            }
            $recoms += "Validation temps reel cote client + serveur"
        }
        "Reglement" {
            $recoms += "**Strategie** : Service ``IReglementService`` avec pattern Strategy par mode de paiement."
            $recoms += "Integration TPE si applicable"
        }
        "Validation" {
            $recoms += "**Strategie** : FluentValidation avec validators specifiques."
            $recoms += "Chaque tache de validation -> un validator injectable"
        }
        "Impression" {
            $recoms += "**Strategie** : Templates HTML -> PDF via wkhtmltopdf ou Puppeteer."
            $recoms += "``PrintService`` injectable avec choix imprimante"
        }
        "Consultation" {
            $recoms += "**Strategie** : Composants de recherche/selection en modales."
            if ($blocVis.Count -gt 0) {
                $recoms += "$(Pluralize $blocVis.Count 'ecran' 'ecrans') : $(($blocVis | ForEach-Object { $_.name }) -join ', ')"
            }
        }
        "Transfert" {
            $recoms += "**Strategie** : Service ``ITransfertService`` avec logique de deversement."
        }
        "Calcul" {
            $recoms += "**Strategie** : Services de calcul purs (Domain Services)."
            $recoms += "Migrer la logique de calcul (stock, compteurs, montants)"
        }
        "Creation" {
            $recoms += "**Strategie** : Repository pattern avec Entity Framework Core."
            $recoms += "Insertion via ``IRepository<T>.CreateAsync()``"
        }
        "Initialisation" {
            $recoms += "**Strategie** : Constructeur/methode ``InitAsync()`` dans l'orchestrateur."
        }
        default {
            # V7.2 GAP7 fix: Concrete strategy for default/Traitement bloc
            $blocVisCount = $blocVis.Count
            $blocInvisCount = $blocInvis.Count
            $blocCalleeCount = @($calleesCtx | Where-Object {
                (Get-FunctionalBloc $_.name) -eq $blocName -or $blocName -eq "Traitement"
            }).Count
            if ($blocVisCount -gt 0 -and $blocInvisCount -gt 0) {
                $recoms += "**Strategie** : Orchestrateur avec $blocVisCount ecrans (Razor/React) et $blocInvisCount traitements backend (services)."
                $recoms += "Les ecrans deviennent des composants UI, les traitements invisibles deviennent des services injectables."
            } elseif ($blocVisCount -gt 0) {
                $recoms += "**Strategie** : $blocVisCount composant(s) UI (Razor/React) avec formulaires et validation."
            } elseif ($blocInvisCount -gt 0) {
                $recoms += "**Strategie** : $blocInvisCount service(s) backend injectable(s) (Domain Services)."
            } else {
                $recoms += "**Strategie** : Service d'orchestration a implementer."
            }
            if ($blocCalleeCount -gt 0) {
                $recoms += "$blocCalleeCount sous-programme(s) a migrer ou a reutiliser depuis les services existants."
            }
            $recoms += "Decomposer les taches en services unitaires testables."
        }
    }
    foreach ($r in $recoms) { Add-Line "- $r" }
    Add-Line
}

# Critical dependencies with links
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
    # V7.2: clickable link
    Add-Line "| $(Format-SpecLink -Name $c.name -Ide $c.ide -Proj $Project) | Sous-programme | $($c.calls_count)x | $prio - $($c.context) |"
}
Add-Line

# Footer
Add-Line "---"
Add-Line "*Spec DETAILED generee par Pipeline V7.2 - $(Get-Date -Format 'yyyy-MM-dd HH:mm')*"

$detailedSpec = $L -join "`n"

# ============================================================
# GENERATE SUMMARY SPEC
# ============================================================
Write-Host "[4/7] Generating SUMMARY spec..." -ForegroundColor Yellow

$writeTableNames = ($discovery.tables.by_access.WRITE | ForEach-Object { $_.logical_name }) -join ', '
$callersList = if ($discovery.call_graph.callers.Count -gt 0) {
    ($discovery.call_graph.callers | ForEach-Object { "[$($_.name) (IDE $($_.ide))]($Project-IDE-$($_.ide).md)" }) -join ', '
} else { "(aucun)" }
$calleesList = if ($discovery.call_graph.callees.Count -gt 0) {
    ($discovery.call_graph.callees | ForEach-Object { "[$($_.name) (IDE $($_.ide))]($Project-IDE-$($_.ide).md)" }) -join ', '
} else { "(aucun)" }

$summarySpec = @"
# $Project IDE $IdePosition - $programName

> **Analyse**: $($startTime.ToString("yyyy-MM-dd HH:mm"))
> **Pipeline**: V7.2 Enrichi

## RESUME EXECUTIF

- **Fonction**: $programName
- **Tables modifiees**: $writeCount
- **Complexite**: **$($complexity.level)** ($($complexity.score)/100)
- **Statut**: $($discovery.orphan_analysis.status)
- **Raison**: $($discovery.orphan_analysis.reason)

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
*Spec SUMMARY generee par Pipeline V7.2*
"@

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
# AUDIT ANTI-REGRESSION
# ============================================================
Write-Host "[6/7] Audit anti-regression..." -ForegroundColor Yellow

$auditResults = @()
$auditFailed = $false
$specContent = $detailedSpec

# AUDIT 1: No placeholder rules
$phase2Matches = ([regex]::Matches($specContent, '\[Phase 2\] Regle complexe')).Count
if ($phase2Matches -gt 0) {
    $auditResults += @{ check = "RULES_NO_PLACEHOLDER"; status = "FAIL"; detail = "$phase2Matches placeholders" }
    $auditFailed = $true
} else {
    $auditResults += @{ check = "RULES_NO_PLACEHOLDER"; status = "PASS"; detail = "OK" }
}

# AUDIT 2: 4 TAB markers
$tabMarkers = ([regex]::Matches($specContent, '<!-- TAB:\w+ -->')).Count
if ($tabMarkers -ne 4) {
    $auditResults += @{ check = "TAB_STRUCTURE"; status = "FAIL"; detail = "$tabMarkers/4 onglets" }
    $auditFailed = $true
} else {
    $auditResults += @{ check = "TAB_STRUCTURE"; status = "PASS"; detail = "4 onglets V7.2" }
}

# AUDIT 3: Pipeline version V7.2
if ($specContent -match 'V7\.2') {
    $auditResults += @{ check = "VERSION_72"; status = "PASS"; detail = "V7.2 present" }
} else {
    $auditResults += @{ check = "VERSION_72"; status = "FAIL"; detail = "V7.2 absent" }
    $auditFailed = $true
}

# AUDIT 4: Anchors present (V7.2 feature)
$anchorCount = ([regex]::Matches($specContent, '<a id="t\d+">')).Count
if ($anchorCount -gt 0) {
    $auditResults += @{ check = "V72_ANCHORS"; status = "PASS"; detail = "$anchorCount ancres" }
} else {
    $auditResults += @{ check = "V72_ANCHORS"; status = "WARN"; detail = "Pas d'ancres (programme simple?)" }
}

# AUDIT 5: Clickable links present (V7.2 feature)
$linkCount72 = ([regex]::Matches($specContent, '\]\([A-Z]+-IDE-\d+\.md\)')).Count
if ($linkCount72 -gt 0) {
    $auditResults += @{ check = "V72_LINKS"; status = "PASS"; detail = "$linkCount72 liens cliquables" }
} else {
    $auditResults += @{ check = "V72_LINKS"; status = "WARN"; detail = "Pas de liens cliquables" }
}

# AUDIT 6: FORM-DATA blocks (V7.2 feature)
$formDataCount = ([regex]::Matches($specContent, '<!-- FORM-DATA:')).Count
if ($visibleForms.Count -gt 0 -and $formDataCount -gt 0) {
    $auditResults += @{ check = "V72_FORMDATA"; status = "PASS"; detail = "$formDataCount blocs FORM-DATA" }
} elseif ($visibleForms.Count -eq 0) {
    $auditResults += @{ check = "V72_FORMDATA"; status = "PASS"; detail = "N/A (pas d'ecran)" }
} else {
    $auditResults += @{ check = "V72_FORMDATA"; status = "WARN"; detail = "Pas de FORM-DATA" }
}

# AUDIT 7: Variables by role (V7.2 feature)
$roleHeaders = ([regex]::Matches($specContent, '### 11\.\d+ (Parametres entrants|Variables de session|Variables de travail|Variables globales)')).Count
if ($roleHeaders -gt 0) {
    $auditResults += @{ check = "V72_VAR_ROLES"; status = "PASS"; detail = "$roleHeaders groupes par role" }
} else {
    $auditResults += @{ check = "V72_VAR_ROLES"; status = "WARN"; detail = "Variables non groupees par role" }
}

# AUDIT 8: Expression types precise (V7.2 feature)
$preciseTypes = ([regex]::Matches($specContent, '\| (CONSTANTE|CONDITION|NEGATION|CALCUL|FORMAT|REFERENCE_VG|CAST_LOGIQUE|CONCATENATION|UI_POSITION) \|')).Count
if ($preciseTypes -gt 0) {
    $auditResults += @{ check = "V72_EXPR_TYPES"; status = "PASS"; detail = "$preciseTypes types precis" }
} else {
    $auditResults += @{ check = "V72_EXPR_TYPES"; status = "WARN"; detail = "Pas de types precis" }
}

# ============================================================
# V7.2 GAP CONTENT VALIDATION (9-15)
# ============================================================

# AUDIT 9 (GAP1): No generic task roles
$genericRoles = ([regex]::Matches($specContent, 'Role\s*:\s*(Traitement interne|Traitement donnees|Traitement des donnees)\b')).Count
if ($genericRoles -eq 0) {
    $auditResults += @{ check = "GAP1_SPECIFIC_ROLES"; status = "PASS"; detail = "Roles specifiques aux taches" }
} else {
    $auditResults += @{ check = "GAP1_SPECIFIC_ROLES"; status = "FAIL"; detail = "$genericRoles roles generiques detectes" }
    $auditFailed = $true
}

# AUDIT 10 (GAP2): Sub-tasks and variables per task (for complex programs)
if ($taskCount -gt 3) {
    $hasSubTasksList = $specContent -match '<details>' -and $specContent -match 'Sous-taches'
    $hasVarsLiees = $specContent -match 'Variables liees'
    if ($hasSubTasksList) {
        $auditResults += @{ check = "GAP2_SUBTASKS"; status = "PASS"; detail = "Liste sous-taches presente" }
    } else {
        $auditResults += @{ check = "GAP2_SUBTASKS"; status = "WARN"; detail = "Pas de liste sous-taches (programme complexe: $taskCount taches)" }
    }
    if ($hasVarsLiees) {
        $auditResults += @{ check = "GAP2_VARS_TASK"; status = "PASS"; detail = "Variables liees aux taches" }
    } else {
        $auditResults += @{ check = "GAP2_VARS_TASK"; status = "WARN"; detail = "Pas de variables liees aux taches" }
    }
} else {
    $auditResults += @{ check = "GAP2_SUBTASKS"; status = "PASS"; detail = "N/A (programme simple: $taskCount taches)" }
    $auditResults += @{ check = "GAP2_VARS_TASK"; status = "PASS"; detail = "N/A (programme simple)" }
}

# AUDIT 11 (GAP3): Enriched business rules (Expression source, Exemple, Impact)
if ($businessRules.Count -gt 0) {
    $hasExprSource = $specContent -match 'Expression source'
    $hasExemple = $specContent -match '\*\*Exemple\*\*'
    $hasImpact = $specContent -match '\*\*Impact\*\*'
    $gap3Score = @($hasExprSource, $hasExemple, $hasImpact) | Where-Object { $_ } | Measure-Object | Select-Object -ExpandProperty Count
    if ($gap3Score -ge 2) {
        $auditResults += @{ check = "GAP3_ENRICHED_RULES"; status = "PASS"; detail = "$gap3Score/3 champs enrichis (source/exemple/impact)" }
    } else {
        $auditResults += @{ check = "GAP3_ENRICHED_RULES"; status = "WARN"; detail = "$gap3Score/3 champs enrichis seulement" }
    }
} else {
    $auditResults += @{ check = "GAP3_ENRICHED_RULES"; status = "PASS"; detail = "N/A (pas de regles metier)" }
}

# AUDIT 12 (GAP4): No generic button actions
$oldGenericBtns = ([regex]::Matches($specContent, 'Action declenchee')).Count
$newFallbackBtns = ([regex]::Matches($specContent, 'Bouton fonctionnel')).Count
if ($oldGenericBtns -eq 0 -and $newFallbackBtns -eq 0) {
    $auditResults += @{ check = "GAP4_BTN_ACTIONS"; status = "PASS"; detail = "Actions boutons specifiques" }
} elseif ($oldGenericBtns -gt 0) {
    $auditResults += @{ check = "GAP4_BTN_ACTIONS"; status = "FAIL"; detail = "$oldGenericBtns 'Action declenchee' (ancien)" }
    $auditFailed = $true
} else {
    $auditResults += @{ check = "GAP4_BTN_ACTIONS"; status = "WARN"; detail = "$newFallbackBtns boutons fallback" }
}

# AUDIT 13 (GAP5): No MCP fallback text + strikethrough for unused columns
$mcpFallback = ([regex]::Matches($specContent, 'Colonnes accessibles via MCP')).Count
$hasStrikethrough = $specContent -match '~~\w+~~'
if ($mcpFallback -eq 0) {
    $auditResults += @{ check = "GAP5_COLUMNS"; status = "PASS"; detail = "Pas de fallback MCP" }
} else {
    $auditResults += @{ check = "GAP5_COLUMNS"; status = "FAIL"; detail = "$mcpFallback fallbacks 'Colonnes accessibles via MCP'" }
    $auditFailed = $true
}

# AUDIT 14 (GAP6): No "Xx refs" generic pattern in variables
$genericRefs = ([regex]::Matches($specContent, '\|\s*\d+\s+refs\s*\|')).Count
if ($genericRefs -eq 0) {
    $auditResults += @{ check = "GAP6_VAR_LINKS"; status = "PASS"; detail = "Variables avec contexte (pas de 'Xx refs')" }
} else {
    $auditResults += @{ check = "GAP6_VAR_LINKS"; status = "FAIL"; detail = "$genericRefs variables avec 'Xx refs' generique" }
    $auditFailed = $true
}

# AUDIT 15 (GAP7): No generic migration text
$genericMigration = ([regex]::Matches($specContent, 'Traitement standard a migrer')).Count
if ($genericMigration -eq 0) {
    $auditResults += @{ check = "GAP7_MIGRATION"; status = "PASS"; detail = "Migration concrete (pas generique)" }
} else {
    $auditResults += @{ check = "GAP7_MIGRATION"; status = "FAIL"; detail = "$genericMigration blocs migration generiques" }
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
        pipeline_version = "7.2"
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
    v72_features = @{
        anchors = $anchorCount
        clickable_links = $linkCount72
        form_data_blocks = $formDataCount
        variable_roles = $roleHeaders
        precise_expr_types = $preciseTypes
    }
    complexity = @{ score = $complexity.score; level = $complexity.level; details = $complexity.details }
    files_generated = @($summaryFileName, $detailedFileName)
    audit = @{
        pass = $passCount; fail = $failCount; warn = $warnCount
        all_passed = -not $auditFailed; checks = $auditResults
    }
    pipeline_timing = @{
        phases_start = $pipelineFirstPhase.ToString("yyyy-MM-dd HH:mm:ss")
        phases_end = $pipelineLastPhase.ToString("yyyy-MM-dd HH:mm:ss")
        phases_duration = $pipelineDurationStr
        assembly_start = $startTime.ToString("yyyy-MM-dd HH:mm:ss")
        assembly_end = $endTime.ToString("yyyy-MM-dd HH:mm:ss")
    }
}

$score = 0
if ($quality.extraction_coverage.callers_extracted) { $score += 15 }
if ($quality.extraction_coverage.callees_extracted) { $score += 15 }
if ($quality.extraction_coverage.tables_extracted) { $score += 15 }
if ($quality.extraction_coverage.expressions_decoded) { $score += 15 }
if ($quality.extraction_coverage.variables_mapped) { $score += 10 }
if ($quality.extraction_coverage.forms_extracted) { $score += 10 }
# V7.2 bonus points
if ($anchorCount -gt 0) { $score += 5 }
if ($linkCount72 -gt 0) { $score += 5 }
if ($formDataCount -gt 0) { $score += 5 }
if ($roleHeaders -gt 0) { $score += 5 }
$quality.quality_score = [math]::Min($score, 100)

$qualityPath = Join-Path $OutputPath "quality.json"
$quality | ConvertTo-Json -Depth 10 | Set-Content -Path $qualityPath -Encoding UTF8

Write-Host ""
Write-Host "=== Phase 5 COMPLETE (V7.2) ===" -ForegroundColor Green
Write-Host "Pipeline: $pipelineDurationStr (Phases 1-4) + $([math]::Round($duration.TotalSeconds, 1))s (assemblage) | Quality: $($quality.quality_score)/100 | Audit: $passCount/$($auditResults.Count) OK"
Write-Host ""
Write-Host "V7.2 FEATURES:" -ForegroundColor Cyan
Write-Host "  Anchors: $anchorCount | Links: $linkCount72 | FORM-DATA: $formDataCount | Var Roles: $roleHeaders | Expr Types: $preciseTypes"
Write-Host ""
Write-Host "STRUCTURE:" -ForegroundColor Cyan
Write-Host "  TAB 1 Resume:     Fiche + Description 2 niveaux + $($blocMap.Count) blocs avec ancres + $($businessRules.Count) regles enrichies"
Write-Host "  TAB 2 Ecrans:     $($visibleForms.Count) mockups FORM-DATA + Navigation reelle"
Write-Host "  TAB 3 Donnees:    $($usedTables.Count) tables fusionnees + Variables par role + Expressions typees"
Write-Host "  TAB 4 Connexions: Graphe avec liens + Migration concrete"
Write-Host ""
Write-Host "FILES: $summaryFileName | $detailedFileName"

return $quality
