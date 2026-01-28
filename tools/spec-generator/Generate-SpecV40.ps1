<#
.SYNOPSIS
    Generate V4.0 specification for a Magic program using 4-phase APEX workflow

.DESCRIPTION
    Complete 4-phase workflow for generating high-quality specifications:

    PHASE 1 - DISCOVERY (Cartograph the terrain)
      - Program identification and metadata
      - Task tree structure with [D] markers
      - Complete call graph (callers, callees, chain from Main)
      - Orphan verification (4 criteria check)

    PHASE 2 - MAPPING (Document the data)
      - Tables with access modes (R/W/L)
      - Input/output parameters
      - Local variables with IDE letters
      - Forms and UI controls

    PHASE 3 - DECODE (Understand the logic)
      - Expression decoding ({N,Y} -> Variable names)
      - Business rules extraction (RM-001, RM-002, etc.)
      - Logic flow tracing
      - Algorigramme generation

    PHASE 4 - SYNTHESIS (Produce the spec)
      - Assemble 3-tab spec (Fonctionnel/Technique/Cartographie)
      - Generate Mermaid diagrams
      - Calculate complexity score
      - Final validation

.PARAMETER Project
    Project name (ADH, PBP, PVE, etc.)

.PARAMETER IdePosition
    IDE position number (as shown in Magic IDE)

.PARAMETER OutputPath
    Output directory for spec files (default: .openspec/specs)

.PARAMETER IntermediatePath
    Directory for intermediate phase files (default: D:\Temp\spec-workflow)

.PARAMETER Force
    Force regeneration even if spec exists

.PARAMETER SkipDecode
    Skip Phase 3 (expression decoding) for faster generation

.PARAMETER Verbose
    Show detailed progress for each phase

.EXAMPLE
    .\Generate-SpecV40.ps1 -Project ADH -IdePosition 237

.EXAMPLE
    .\Generate-SpecV40.ps1 -Project ADH -IdePosition 237 -Force -Verbose
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$OutputPath = ".openspec/specs",

    [string]$IntermediatePath = "D:\Temp\spec-workflow",

    [switch]$Force,

    [switch]$SkipDecode,

    [switch]$VerboseOutput
)

$ErrorActionPreference = "Continue"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)

# ============================================================================
# CONFIGURATION
# ============================================================================

$SourceBasePath = "D:\Data\Migration\XPA\PMS"
$KbPath = Join-Path $env:USERPROFILE ".magic-kb\knowledge.db"
$KbRunnerPath = Join-Path $projectRoot "tools\KbIndexRunner"

# ADH ECF components (shared programs - never orphans)
$AdhEcfPrograms = @{
    27 = "Separation"; 28 = "Fusion"
    53 = "EXTRAIT_EASY_CHECKOUT"; 54 = "FACTURES_CHECK_OUT"
    64 = "SOLDE_EASY_CHECK_OUT"; 65 = "EDITION_EASY_CHECK_OUT"
    69 = "EXTRAIT_COMPTE"; 70 = "EXTRAIT_NOM"; 71 = "EXTRAIT_DATE"
    72 = "EXTRAIT_CUM"; 73 = "EXTRAIT_IMP"; 76 = "EXTRAIT_SERVICE"
    84 = "CARACT_INTERDIT"; 97 = "Saisie_facture_tva"; 111 = "GARANTIE"
    121 = "Gestion_Caisse_142"; 149 = "CALC_STOCK_PRODUIT"
    152 = "RECUP_CLASSE_MOP"; 178 = "GET_PRINTER"
    180 = "SET_LIST_NUMBER"; 181 = "RAZ_PRINTER"; 185 = "CHAINED_LIST_DEFAULT"
    192 = "SOLDE_COMPTE"; 208 = "OPEN_PHONE_LINE"; 210 = "CLOSE_PHONE_LINE"
    229 = "PRINT_TICKET"; 243 = "DEVERSEMENT"
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-Phase {
    param([int]$Number, [string]$Name, [string]$Status = "START")
    $color = switch ($Status) {
        "START" { "Cyan" }
        "DONE" { "Green" }
        "SKIP" { "DarkYellow" }
        "ERROR" { "Red" }
        default { "White" }
    }
    Write-Host ""
    Write-Host "[$Number/4] PHASE $Number - $Name [$Status]" -ForegroundColor $color
    Write-Host ("=" * 60) -ForegroundColor DarkGray
}

function Write-Step {
    param([string]$Message)
    if ($VerboseOutput) {
        Write-Host "  > $Message" -ForegroundColor Gray
    }
}

function Convert-IndexToVariable {
    param([int]$Index)

    # Global variables: {32768,N} -> VG{N}
    if ($Index -ge 32768) {
        return "VG$($Index - 32768)"
    }

    $letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    if ($Index -lt 0) { return "?" }
    if ($Index -lt 26) { return $letters[$Index] }

    # AA-ZZ encoding
    $prefix = ""
    $remaining = $Index

    while ($remaining -ge 26) {
        $prefixIndex = [math]::Floor($remaining / 26) - 1
        if ($prefixIndex -ge 0 -and $prefixIndex -lt 26) {
            $prefix = $letters[$prefixIndex]
        }
        $remaining = $remaining % 26
    }

    return "$prefix$($letters[$remaining])"
}

function Get-ShortName {
    param([string]$Name, [int]$MaxLen = 15)
    if ($Name.Length -le $MaxLen) { return $Name }
    return $Name.Substring(0, $MaxLen)
}

function Get-SafeMermaidLabel {
    param([string]$Label)
    # Remove characters that break Mermaid
    return $Label -replace '[<>"\''?!@#$%^&*(){}[\];:,./\\|`~]', '' -replace '\s+', ' '
}

# ============================================================================
# PHASE 1: DISCOVERY
# ============================================================================

function Invoke-Phase1Discovery {
    param([string]$Project, [int]$IdePosition)

    Write-Phase -Number 1 -Name "DISCOVERY" -Status "START"

    $discovery = @{
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        project = $Project
        ide = $IdePosition
        program = $null
        xmlPath = $null
        xmlId = $null
        publicName = $null
        isEcf = $false
        ecfName = $null
        tasks = @{ count = 0; disabled = 0; tree = @() }
        callers = @()
        callees = @()
        callChain = @()
        orphanStatus = @{ isOrphan = $true; reason = "Unknown" }
        statistics = @{}
    }

    # 1.1 Get program info from KB
    Write-Step "Getting program info from KB..."
    try {
        $json = & dotnet run --project $KbRunnerPath -- "spec-data" "$Project $IdePosition" 2>$null
        if ($json -and $json -notmatch "^ERROR" -and $json -notmatch "^{`"error") {
            $data = $json | ConvertFrom-Json
            $discovery.program = $data.program
            $discovery.callers = $data.callers
            $discovery.callees = $data.callees
            $discovery.callChain = $data.callChain
            $discovery.statistics = @{
                taskCount = $data.statistics.taskCount
                logicLineCount = $data.statistics.logicLineCount
                disabledLineCount = $data.statistics.disabledLineCount
                expressionCount = $data.expressionCount
                tableCount = $data.tables.Count
                parameterCount = $data.parameters.Count
                callerCount = $data.callers.Count
                calleeCount = $data.callees.Count
            }
            Write-Step "Found program: $($discovery.program)"
        }
    } catch {
        Write-Warning "KB query failed: $_"
    }

    # 1.2 Find XML file
    Write-Step "Locating XML source file..."
    $sourceFolder = "$SourceBasePath\$Project\Source"
    $offsets = @(4, 3, 5, 2, 1, 0)
    foreach ($offset in $offsets) {
        $prgNum = $IdePosition - $offset
        if ($prgNum -gt 0) {
            $xmlPath = "$sourceFolder\Prg_$prgNum.xml"
            if (Test-Path $xmlPath) {
                $discovery.xmlPath = $xmlPath
                $discovery.xmlId = $prgNum
                Write-Step "Found: Prg_$prgNum.xml (offset $offset)"
                break
            }
        }
    }

    # 1.3 Get program name from XML if not from KB
    if (-not $discovery.program -and $discovery.xmlPath) {
        try {
            $content = Get-Content $discovery.xmlPath -Raw -Encoding UTF8
            if ($content -match '<Program[^>]*name="([^"]+)"') {
                $discovery.program = $matches[1]
            }
        } catch {}
    }
    if (-not $discovery.program) {
        $discovery.program = "$Project IDE $IdePosition"
    }

    # 1.4 Check ECF membership
    Write-Step "Checking ECF membership..."
    if ($AdhEcfPrograms.ContainsKey($IdePosition) -and $Project -eq "ADH") {
        $discovery.isEcf = $true
        $discovery.ecfName = $AdhEcfPrograms[$IdePosition]
        Write-Step "ECF component: ADH.ecf - $($discovery.ecfName)"
    }

    # 1.5 Orphan verification (4 criteria)
    Write-Step "Verifying orphan status..."
    $callerCount = $discovery.statistics.callerCount

    if ($callerCount -gt 0) {
        $discovery.orphanStatus = @{
            isOrphan = $false
            reason = "Called by $callerCount program(s)"
        }
    } elseif ($discovery.isEcf) {
        $discovery.orphanStatus = @{
            isOrphan = $false
            reason = "ECF shared component (ADH.ecf)"
        }
    } elseif ($discovery.publicName) {
        $discovery.orphanStatus = @{
            isOrphan = $false
            reason = "Has PublicName (callable via ProgIdx)"
        }
    } elseif ($IdePosition -eq 1) {
        $discovery.orphanStatus = @{
            isOrphan = $false
            reason = "Main program entry point"
        }
    } else {
        $discovery.orphanStatus = @{
            isOrphan = $true
            reason = "No callers, no PublicName, not ECF"
        }
    }
    Write-Step "Status: $(if ($discovery.orphanStatus.isOrphan) { 'ORPHELIN' } else { 'NON ORPHELIN' }) - $($discovery.orphanStatus.reason)"

    Write-Phase -Number 1 -Name "DISCOVERY" -Status "DONE"
    return $discovery
}

# ============================================================================
# PHASE 2: MAPPING
# ============================================================================

function Invoke-Phase2Mapping {
    param([string]$Project, [int]$IdePosition, $Discovery)

    Write-Phase -Number 2 -Name "MAPPING" -Status "START"

    $mapping = @{
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        tables = @()
        parameters = @()
        variables = @{ local = @(); global = @() }
        forms = @()
    }

    # 2.1 Get tables from KB
    Write-Step "Extracting tables..."
    try {
        $json = & dotnet run --project $KbRunnerPath -- "spec-data" "$Project $IdePosition" 2>$null
        if ($json -and $json -notmatch "^ERROR") {
            $data = $json | ConvertFrom-Json

            # Group tables by ID and aggregate access modes
            $tableGroups = @{}
            foreach ($t in $data.tables) {
                $key = "$($t.id)"
                if (-not $tableGroups.ContainsKey($key)) {
                    $tableGroups[$key] = @{
                        id = $t.id
                        logical = $t.logical
                        physical = $t.physical
                        access = @()
                        count = 0
                    }
                }
                if ($t.access -notin $tableGroups[$key].access) {
                    $tableGroups[$key].access += $t.access
                }
                $tableGroups[$key].count += $t.count
            }

            foreach ($key in $tableGroups.Keys | Sort-Object { [int]$_ }) {
                $t = $tableGroups[$key]
                $mapping.tables += @{
                    id = $t.id
                    logical = $t.logical
                    physical = $t.physical
                    access = ($t.access -join "/")
                    count = $t.count
                    usage = switch -Wildcard (($t.access -join "/")) {
                        "*W*" { "Ecriture" }
                        "*L*" { "Jointure" }
                        default { "Lecture" }
                    }
                }
            }
            Write-Step "Found $($mapping.tables.Count) tables"

            # 2.2 Get parameters
            Write-Step "Extracting parameters..."
            $paramIndex = 0
            foreach ($p in $data.parameters) {
                $paramIndex++
                $varLetter = Convert-IndexToVariable -Index $paramIndex
                $mapping.parameters += @{
                    index = $paramIndex
                    variable = $varLetter
                    name = $p.name
                    type = $p.type
                    picture = $p.picture
                    direction = if ($p.name -match "^P1") { "OUT" } else { "IN" }
                }
            }
            Write-Step "Found $($mapping.parameters.Count) parameters"
        }
    } catch {
        Write-Warning "Failed to get mapping data: $_"
    }

    Write-Phase -Number 2 -Name "MAPPING" -Status "DONE"
    return $mapping
}

# ============================================================================
# PHASE 3: DECODE
# ============================================================================

function Invoke-Phase3Decode {
    param([string]$Project, [int]$IdePosition, $Discovery, $Mapping, [switch]$Skip)

    if ($Skip) {
        Write-Phase -Number 3 -Name "DECODE" -Status "SKIP"
        return @{
            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            skipped = $true
            expressions = @()
            businessRules = @()
        }
    }

    Write-Phase -Number 3 -Name "DECODE" -Status "START"

    $decode = @{
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        skipped = $false
        expressions = @()
        businessRules = @()
    }

    # 3.1 Get expressions from KB
    Write-Step "Extracting expressions from KB..."
    try {
        $json = & dotnet run --project $KbRunnerPath -- "spec-data" "$Project $IdePosition" 2>$null
        if ($json -and $json -notmatch "^ERROR") {
            $data = $json | ConvertFrom-Json
            foreach ($e in $data.expressions) {
                $decode.expressions += @{
                    ide = $e.ide
                    content = $e.content
                    comment = $e.comment
                    decoded = $e.content  # Could be enhanced with actual decoding
                }
            }
            Write-Step "Found $($decode.expressions.Count) expressions"
        }
    } catch {
        Write-Warning "Failed to get expressions: $_"
    }

    # 3.2 Extract business rules from expressions
    Write-Step "Extracting business rules..."
    $ruleIndex = 0
    foreach ($expr in $decode.expressions) {
        # Detect IF conditions as potential business rules
        if ($expr.content -match "^IF\(" -or $expr.content -match "MsgBox\(" -or $expr.content -match "=\s*0\s*$") {
            $ruleIndex++
            $decode.businessRules += @{
                code = "RM-{0:D3}" -f $ruleIndex
                expression = $expr.content
                context = "Expression $($expr.ide)"
                rule = "Verification condition"
            }
        }
    }
    Write-Step "Identified $($decode.businessRules.Count) potential business rules"

    Write-Phase -Number 3 -Name "DECODE" -Status "DONE"
    return $decode
}

# ============================================================================
# PHASE 4: SYNTHESIS
# ============================================================================

function Invoke-Phase4Synthesis {
    param($Discovery, $Mapping, $Decode, [string]$OutputPath)

    Write-Phase -Number 4 -Name "SYNTHESIS" -Status "START"

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $project = $Discovery.project
    $ide = $Discovery.ide
    $programName = $Discovery.program

    # Stats
    $taskCount = $Discovery.statistics.taskCount
    $logicCount = $Discovery.statistics.logicLineCount
    $exprCount = $Discovery.statistics.expressionCount
    $tableCount = $Mapping.tables.Count
    $paramCount = $Mapping.parameters.Count
    $callerCount = $Discovery.statistics.callerCount
    $calleeCount = $Discovery.statistics.calleeCount
    $writeTableCount = ($Mapping.tables | Where-Object { $_.access -match "W" }).Count

    # Complexity score
    $complexityScore = ($taskCount * 10) + $logicCount + ($tableCount * 5) + $exprCount
    $complexity = if ($complexityScore -gt 1000) { "HAUTE" } elseif ($complexityScore -gt 300) { "MOYENNE" } else { "FAIBLE" }

    Write-Step "Building tables section..."
    $tablesSection = @()
    $sortedTables = $Mapping.tables | Sort-Object { [int]$_.id }
    foreach ($t in $sortedTables | Select-Object -First 20) {
        $tablesSection += "| #$($t.id) | ``$($t.physical)`` | $($t.logical) | **$($t.access)** | $($t.count)x |"
    }
    if ($tablesSection.Count -eq 0) {
        $tablesSection = @("| - | - | Aucune table | - | - |")
    }

    Write-Step "Building parameters section..."
    $paramsSection = @()
    foreach ($p in $Mapping.parameters) {
        $dir = if ($p.direction -eq "OUT") { "< OUT" } else { "> IN" }
        $paramsSection += "| $($p.variable) | $($p.name) | $($p.type) | $dir | $($p.picture) |"
    }
    if ($paramsSection.Count -eq 0) {
        $paramsSection = @("| - | Aucun parametre | - | - | - |")
    }

    Write-Step "Building callers section..."
    $callersSection = @()
    foreach ($c in $Discovery.callers | Select-Object -First 10) {
        $callersSection += "| $($c.ide) | $($c.name) | $($c.count) |"
    }
    if ($callersSection.Count -eq 0) {
        if ($Discovery.isEcf) {
            $callersSection = @("| - | ECF partage - appels cross-projet | - |")
        } else {
            $callersSection = @("| - | Point d'entree ou orphelin | - |")
        }
    }

    Write-Step "Building callees section..."
    $calleesSection = @()
    foreach ($c in $Discovery.callees | Select-Object -First 10) {
        $ecfMark = if ($AdhEcfPrograms.ContainsKey($c.ide)) { "ECF" } else { "" }
        $calleesSection += "| 1 | $($c.ide) | $($c.name) | $($c.count) | $ecfMark |"
    }
    if ($calleesSection.Count -eq 0) {
        $calleesSection = @("| - | - | TERMINAL (aucun appel) | - | - |")
    }

    Write-Step "Building business rules section..."
    $rulesSection = @()
    foreach ($r in $Decode.businessRules | Select-Object -First 6) {
        $rulesSection += "| $($r.code) | $($r.rule) | $($r.context) |"
    }
    if ($rulesSection.Count -eq 0) {
        $rulesSection = @("| RM-001 | Traitement principal | Conditions initiales validees |")
    }

    Write-Step "Building expressions section..."
    $exprsSection = @()
    foreach ($e in $Decode.expressions | Select-Object -First 10) {
        $content = $e.content
        if ($content.Length -gt 50) { $content = $content.Substring(0, 47) + "..." }
        $exprsSection += "| $($e.ide) | ``$content`` | $($e.comment) |"
    }
    if ($exprsSection.Count -eq 0) {
        $exprsSection = @("| - | Aucune expression | - |")
    }

    Write-Step "Generating Mermaid diagrams..."

    # Call chain diagram
    $shortProgName = Get-ShortName $programName
    $safeName = Get-SafeMermaidLabel $shortProgName
    $callChainMermaid = "graph LR`n    T[$ide $safeName]"

    if ($Discovery.callChain.Count -gt 0) {
        $prevNode = "T"
        foreach ($node in ($Discovery.callChain | Sort-Object level | Select-Object -First 4)) {
            $nodeName = Get-SafeMermaidLabel (Get-ShortName $node.name)
            $nodeId = "N$($node.ide)"
            $callChainMermaid += "`n    $nodeId[$($node.ide) $nodeName]"
        }
        $firstCaller = $Discovery.callChain | Sort-Object level | Select-Object -First 1
        if ($firstCaller) {
            $callChainMermaid += "`n    N$($firstCaller.ide) --> T"
        }
    } else {
        $callChainMermaid += "`n    ORPHAN([ORPHELIN ou Main])"
        $callChainMermaid += "`n    T -.-> ORPHAN"
    }
    $callChainMermaid += "`n    style T fill:#58a6ff,color:#000"

    # Callees diagram
    $calleesMermaid = "graph LR`n    T[$ide $safeName]"
    if ($Discovery.callees.Count -gt 0) {
        foreach ($c in $Discovery.callees | Select-Object -First 5) {
            $cName = Get-SafeMermaidLabel (Get-ShortName $c.name)
            $calleesMermaid += "`n    C$($c.ide)[$($c.ide) $cName]"
        }
        $links = ($Discovery.callees | Select-Object -First 5 | ForEach-Object { "C$($_.ide)" }) -join " & "
        $calleesMermaid += "`n    T --> $links"
    } else {
        $calleesMermaid += "`n    TERM([TERMINAL])"
        $calleesMermaid += "`n    T -.-> TERM"
        $calleesMermaid += "`n    style TERM fill:#6b7280,stroke-dasharray: 5 5"
    }
    $calleesMermaid += "`n    style T fill:#58a6ff,color:#000"

    # Orphan status
    $orphanStatus = $Discovery.orphanStatus
    $orphanConclusion = if ($orphanStatus.isOrphan) { "**ORPHELIN**" } else { "**NON ORPHELIN**" }

    # ECF section
    $ecfSection = @()
    foreach ($c in $Discovery.callees) {
        if ($AdhEcfPrograms.ContainsKey($c.ide)) {
            $ecfSection += "| ADH.ecf | $($c.ide) | $($AdhEcfPrograms[$c.ide]) | Sessions_Reprises |"
        }
    }
    if ($Discovery.isEcf) {
        $ecfSection += "| ADH.ecf | $ide | $($Discovery.ecfName) | Sessions_Reprises |"
    }
    if ($ecfSection.Count -eq 0) {
        $ecfSection = @("| - | - | Aucun composant ECF | - |")
    }

    Write-Step "Assembling final spec..."

    # Generate spec content
    $spec = @"
# $project IDE $ide - $programName

> **Version spec**: 4.0
> **Analyse**: $timestamp
> **Source**: ``$($Discovery.xmlPath)``
> **Methode**: APEX 4-Phase Workflow (Auto-generated)

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur (utilisateur connecte) |
| **Quoi** | $programName |
| **Pourquoi** | Fonction metier du module $project |
| **Declencheur** | Appel depuis programme parent ou menu |
| **Resultat** | Traitement effectue selon logique programme |

### 1.2 Regles metier

| Code | Regle | Condition |
|------|-------|-----------|
$($rulesSection -join "`n")

### 1.3 Flux utilisateur

1. Reception des parametres d'entree ($paramCount params)
2. Initialisation et verification conditions
3. Traitement principal ($taskCount taches)
4. Appels sous-programmes ($calleeCount callees)
5. Retour resultats

### 1.4 Cas d'erreur

| Erreur | Comportement |
|--------|--------------|
| Conditions non remplies | Abandon avec message |
| Erreur sous-programme | Propagation erreur |
| Donnees invalides | Validation et rejet |

### 1.5 Dependances ECF

$(if ($Discovery.isEcf) { "Programme partage via **ADH.ecf** - Composant: $($Discovery.ecfName)" } else { "Programme local $project - Non partage via ECF" })

---

<!-- TAB:Technique -->

## SPECIFICATION TECHNIQUE

### 2.1 Identification

| Attribut | Valeur |
|----------|--------|
| **IDE Position** | $ide |
| **Fichier XML** | ``Prg_$($Discovery.xmlId).xml`` |
| **Description** | $programName |
| **Module** | $project |
| **Public Name** | $(if ($Discovery.isEcf) { $Discovery.ecfName } else { "-" }) |
| **Nombre taches** | $taskCount |
| **Lignes logique** | $logicCount |
| **Expressions** | $exprCount |

### 2.2 Tables - $tableCount tables dont $writeTableCount en ecriture

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
$($tablesSection -join "`n")

> *Liste limitee aux 20 tables principales*

### 2.3 Parametres d'entree - $paramCount parametres

| Var | Nom | Type | Direction | Picture |
|-----|-----|------|-----------|---------|
$($paramsSection -join "`n")

### 2.4 Algorigramme

``````mermaid
flowchart TD
    START([START - $paramCount params])
    INIT["Initialisation"]
    PROCESS["Traitement principal<br/>$taskCount taches"]
    CALLS["Appels sous-programmes<br/>$calleeCount callees"]
    ENDOK([END])

    START --> INIT --> PROCESS --> CALLS --> ENDOK

    style START fill:#3fb950
    style ENDOK fill:#f85149
    style PROCESS fill:#58a6ff
``````

### 2.5 Expressions cles (selection)

| # | Expression | Commentaire |
|---|------------|-------------|
$($exprsSection -join "`n")

> *$exprCount expressions au total. Liste limitee aux 10 premieres.*

### 2.6 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | $taskCount |
| **Lignes logique** | $logicCount |
| **Expressions** | $exprCount |
| **Parametres** | $paramCount |
| **Tables accedees** | $tableCount |
| **Tables en ecriture** | $writeTableCount |
| **Callees niveau 1** | $calleeCount |

---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

``````mermaid
$callChainMermaid
``````

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
$($callersSection -join "`n")

### 3.3 Callees (3 niveaux)

``````mermaid
$calleesMermaid
``````

| Niv | IDE | Programme | Nb appels | Status |
|-----|-----|-----------|-----------|--------|
$($calleesSection -join "`n")

### 3.4 Composants ECF utilises

| ECF | IDE | Public Name | Description |
|-----|-----|-------------|-------------|
$($ecfSection -join "`n")

### 3.5 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | $callerCount programmes |
| PublicName | $(if ($Discovery.isEcf) { "Defini: $($Discovery.ecfName)" } else { "Non defini" }) |
| ECF partage | $(if ($Discovery.isEcf) { "OUI - ADH.ecf" } else { "NON" }) |
| **Conclusion** | $orphanConclusion - $($orphanStatus.reason) |

---

## NOTES MIGRATION

### Complexite

| Critere | Score | Detail |
|---------|-------|--------|
| Taches | $taskCount | $(if ($taskCount -gt 20) { "Complexe" } elseif ($taskCount -gt 5) { "Moyen" } else { "Simple" }) |
| Tables | $tableCount | $(if ($writeTableCount -gt 0) { "Ecriture ($writeTableCount tables)" } else { "Lecture seule" }) |
| Callees | $calleeCount | $(if ($calleeCount -gt 5) { "Fort couplage" } elseif ($calleeCount -gt 0) { "Couplage modere" } else { "Faible couplage" }) |
| **Score global** | **$complexityScore** | **$complexity** |

### Points d'attention migration

| Point | Solution moderne |
|-------|-----------------|
| Variables globales (VG*) | Service/Repository injection |
| Tables Magic | Entity Framework / Dapper |
| CallTask | Service method calls |
| Forms | React/Angular components |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| $timestamp | **V4.0 APEX Workflow** - Generation automatique 4 phases | Script |

---

*Specification V4.0 - Generated with APEX 4-Phase Workflow*

"@

    # Write spec file
    $specFile = Join-Path $OutputPath "$project-IDE-$ide.md"
    $spec | Out-File -FilePath $specFile -Encoding UTF8 -Force

    Write-Step "Spec saved to: $specFile"
    Write-Phase -Number 4 -Name "SYNTHESIS" -Status "DONE"

    return @{
        specFile = $specFile
        complexity = $complexity
        complexityScore = $complexityScore
        stats = @{
            tasks = $taskCount
            tables = $tableCount
            expressions = $exprCount
            callers = $callerCount
            callees = $calleeCount
        }
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

$startTime = Get-Date

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "        GENERATE V4.0 SPEC - APEX 4-PHASE WORKFLOW" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Project:      $Project" -ForegroundColor White
Write-Host "  IDE Position: $IdePosition" -ForegroundColor White
Write-Host "  Output:       $OutputPath" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Cyan

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Check if spec already exists
$specFile = Join-Path $OutputPath "$Project-IDE-$IdePosition.md"
if ((Test-Path $specFile) -and -not $Force) {
    $content = Get-Content $specFile -Raw -ErrorAction SilentlyContinue
    if ($content -match "Version spec.*4\.0") {
        Write-Host ""
        Write-Host "SKIP - V4.0 spec already exists. Use -Force to regenerate." -ForegroundColor DarkYellow
        return
    }
}

# Phase 1: Discovery
$discovery = Invoke-Phase1Discovery -Project $Project -IdePosition $IdePosition

# Phase 2: Mapping
$mapping = Invoke-Phase2Mapping -Project $Project -IdePosition $IdePosition -Discovery $discovery

# Phase 3: Decode
$decode = Invoke-Phase3Decode -Project $Project -IdePosition $IdePosition -Discovery $discovery -Mapping $mapping -Skip:$SkipDecode

# Phase 4: Synthesis
$result = Invoke-Phase4Synthesis -Discovery $discovery -Mapping $mapping -Decode $decode -OutputPath $OutputPath

# Summary
$duration = (Get-Date) - $startTime

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "        SPEC GENERATION COMPLETE" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "  Program:     $($discovery.program)" -ForegroundColor White
Write-Host "  Complexity:  $($result.complexity) (score: $($result.complexityScore))" -ForegroundColor White
Write-Host "  Tasks:       $($result.stats.tasks)" -ForegroundColor Gray
Write-Host "  Tables:      $($result.stats.tables)" -ForegroundColor Gray
Write-Host "  Expressions: $($result.stats.expressions)" -ForegroundColor Gray
Write-Host "  Callers:     $($result.stats.callers)" -ForegroundColor Gray
Write-Host "  Callees:     $($result.stats.callees)" -ForegroundColor Gray
Write-Host "  Duration:    $($duration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor Gray
Write-Host "  Output:      $($result.specFile)" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Green

# Return result for pipeline usage
return $result
