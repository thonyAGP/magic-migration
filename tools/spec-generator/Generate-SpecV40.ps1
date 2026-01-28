<#
.SYNOPSIS
    Generate V4.0 APEX/PDCA specification for a Magic program
.DESCRIPTION
    Creates comprehensive specification using KbIndexRunner spec-data command
.PARAMETER Project
    Project name (ADH, PBP, PVE, etc.)
.PARAMETER IdePosition
    IDE position number
.PARAMETER OutputPath
    Output directory for spec files
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$OutputPath = ".openspec/specs",

    [switch]$Force
)

$ErrorActionPreference = "Continue"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)

# Configuration
$SourceBasePath = "D:\Data\Migration\XPA\PMS"

# ADH ECF components (shared programs)
$AdhEcfPrograms = @{
    27 = "Separation"
    28 = "Fusion"
    53 = "EXTRAIT_EASY_CHECKOUT"
    54 = "FACTURES_CHECK_OUT"
    64 = "SOLDE_EASY_CHECK_OUT"
    65 = "EDITION_EASY_CHECK_OUT"
    69 = "EXTRAIT_COMPTE"
    70 = "EXTRAIT_NOM"
    71 = "EXTRAIT_DATE"
    72 = "EXTRAIT_CUM"
    73 = "EXTRAIT_IMP"
    76 = "EXTRAIT_SERVICE"
    84 = "CARACT_INTERDIT"
    97 = "Saisie_facture_tva"
    111 = "GARANTIE"
    121 = "Gestion_Caisse_142"
    149 = "CALC_STOCK_PRODUIT"
    152 = "RECUP_CLASSE_MOP"
    178 = "GET_PRINTER"
    180 = "SET_LIST_NUMBER"
    181 = "RAZ_PRINTER"
    185 = "CHAINED_LIST_DEFAULT"
    192 = "SOLDE_COMPTE"
    208 = "OPEN_PHONE_LINE"
    210 = "CLOSE_PHONE_LINE"
    229 = "PRINT_TICKET"
    243 = "DEVERSEMENT"
}

# Function to convert index to variable letter (Magic IDE format)
function Convert-IndexToVariable {
    param([int]$Index)

    if ($Index -lt 0) { return "?" }

    # Global variables: {32768,N} -> VG{N}
    if ($Index -ge 32768) {
        return "VG$($Index - 32768)"
    }

    # Local variables: 0-25 = A-Z, 26-51 = BA-BZ, 52-77 = CA-CZ, etc.
    $letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    if ($Index -lt 26) {
        return $letters[$Index]
    }

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

# Get spec data from KbIndexRunner
function Get-SpecDataFromKb {
    param([string]$Project, [int]$IdePosition)

    $kbRunnerPath = Join-Path $projectRoot "tools\KbIndexRunner"

    try {
        $json = & dotnet run --project $kbRunnerPath -- "spec-data" "$Project $IdePosition" 2>$null
        if ($json -and $json -notmatch "^ERROR") {
            return $json | ConvertFrom-Json
        }
    } catch {
        Write-Warning "Failed to get spec data: $_"
    }

    return $null
}

# Find XML file path from KB data or search
function Get-XmlPath {
    param([string]$Project, [int]$IdePosition)

    # First try to get from KB
    $specData = Get-SpecDataFromKb -Project $Project -IdePosition $IdePosition

    # Search for matching program in source folder
    $sourceFolder = "$SourceBasePath\$Project\Source"
    if (-not (Test-Path $sourceFolder)) {
        return $null
    }

    # Try common offsets: for ADH, IDE 237 = Prg_233.xml (offset 4)
    $offsets = @(4, 3, 5, 1, 0)
    foreach ($offset in $offsets) {
        $prgNum = $IdePosition - $offset
        if ($prgNum -gt 0) {
            $xmlPath = "$sourceFolder\Prg_$prgNum.xml"
            if (Test-Path $xmlPath) {
                return $xmlPath
            }
        }
    }

    return $null
}

# Get program name from XML
function Get-ProgramNameFromXml {
    param([string]$XmlPath)

    if (-not $XmlPath -or -not (Test-Path $XmlPath)) {
        return "Programme"
    }

    try {
        $content = Get-Content $XmlPath -Raw -Encoding UTF8
        if ($content -match '<Program[^>]*name="([^"]+)"') {
            return $matches[1]
        }
    } catch {
        Write-Warning "Failed to parse XML: $_"
    }

    return "Programme"
}

# Calculate complexity score
function Get-ComplexityScore {
    param($SpecData)

    if (-not $SpecData) { return "FAIBLE" }

    $score = 0
    $score += $SpecData.statistics.taskCount * 10
    $score += $SpecData.statistics.logicLineCount
    $score += $SpecData.tables.Count * 5
    $score += $SpecData.expressionCount

    if ($score -gt 1000) { return "HAUTE" }
    if ($score -gt 300) { return "MOYENNE" }
    return "FAIBLE"
}

# Format access mode
function Format-AccessMode {
    param([string]$Mode)

    switch ($Mode) {
        "READ" { return "R (lecture)" }
        "WRITE" { return "W (ecriture)" }
        "LINK" { return "L (jointure)" }
        "R" { return "R (lecture)" }
        "W" { return "W (ecriture)" }
        "L" { return "L (jointure)" }
        default { return $Mode }
    }
}

# Generate the spec
function Generate-Spec {
    param(
        [string]$Project,
        [int]$IdePosition,
        [string]$OutputPath
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $specFile = Join-Path $OutputPath "$Project-IDE-$IdePosition.md"

    # Skip if exists and not Force
    if ((Test-Path $specFile) -and -not $Force) {
        $content = Get-Content $specFile -Raw -ErrorAction SilentlyContinue
        if ($content -match "Version spec.*4\.0") {
            Write-Host "  SKIP (V4.0 exists)" -ForegroundColor DarkGray
            return $false
        }
    }

    # Get data from KB
    $specData = Get-SpecDataFromKb -Project $Project -IdePosition $IdePosition

    # Get XML path
    $xmlPath = Get-XmlPath -Project $Project -IdePosition $IdePosition
    $xmlFileName = if ($xmlPath) { Split-Path $xmlPath -Leaf } else { "Prg_XXX.xml" }

    # Get program name
    $programName = if ($specData -and $specData.program) {
        $specData.program
    } else {
        Get-ProgramNameFromXml $xmlPath
    }

    # Calculate stats
    $taskCount = if ($specData) { $specData.statistics.taskCount } else { 0 }
    $logicLineCount = if ($specData) { $specData.statistics.logicLineCount } else { 0 }
    $exprCount = if ($specData) { $specData.expressionCount } else { 0 }
    $tableCount = if ($specData) { $specData.tables.Count } else { 0 }
    $paramCount = if ($specData) { $specData.parameters.Count } else { 0 }
    $callerCount = if ($specData) { $specData.callers.Count } else { 0 }
    $calleeCount = if ($specData) { $specData.callees.Count } else { 0 }
    $complexity = Get-ComplexityScore $specData

    # Check if ECF component
    $isEcf = $AdhEcfPrograms.ContainsKey($IdePosition)
    $ecfName = if ($isEcf) { $AdhEcfPrograms[$IdePosition] } else { $null }

    # Build tables section
    $tablesSection = @()
    if ($specData -and $specData.tables.Count -gt 0) {
        $tableGroups = $specData.tables | Group-Object -Property id
        foreach ($group in $tableGroups) {
            $first = $group.Group[0]
            $accessModes = ($group.Group | Select-Object -ExpandProperty access -Unique) -join "/"
            $usageDesc = switch ($accessModes) {
                "READ" { "Lecture" }
                "WRITE" { "Ecriture" }
                "LINK" { "Jointure" }
                "READ/WRITE" { "Lecture+Ecriture" }
                "LINK/READ" { "Jointure+Lecture" }
                "LINK/WRITE" { "Jointure+Ecriture" }
                "LINK/READ/WRITE" { "Jointure+R/W" }
                default { $accessModes }
            }
            $tablesSection += "| $($first.id) | $($first.logical) | $($first.physical) | $accessModes | $usageDesc |"
        }
    }
    if ($tablesSection.Count -eq 0) {
        $tablesSection += "| - | Aucune table | - | - | - |"
    }

    # Count write tables
    $writeTableCount = 0
    if ($specData -and $specData.tables) {
        $writeTableCount = ($specData.tables | Where-Object { $_.access -eq "WRITE" } | Select-Object -ExpandProperty id -Unique).Count
    }

    # Build callers section
    $callersSection = @()
    if ($specData -and $specData.callers.Count -gt 0) {
        foreach ($caller in $specData.callers) {
            $callersSection += "| $($caller.ide) | $($caller.name) | $($caller.count) |"
        }
    }
    if ($callersSection.Count -eq 0) {
        if ($isEcf) {
            $callersSection += "| - | ECF partage - appels cross-projet | - |"
        } else {
            $callersSection += "| - | ORPHELIN ou Main direct | - |"
        }
    }

    # Build callees section
    $calleesSection = @()
    if ($specData -and $specData.callees.Count -gt 0) {
        foreach ($callee in $specData.callees) {
            $status = if ($AdhEcfPrograms.ContainsKey($callee.ide)) { "ECF" } else { "" }
            $calleesSection += "| 1 | $($callee.ide) | $($callee.name) | $($callee.count) | $status |"
        }
    }
    if ($calleesSection.Count -eq 0) {
        $calleesSection += "| - | - | TERMINAL | - | - |"
    }

    # Build parameters section
    $paramsSection = @()
    if ($specData -and $specData.parameters.Count -gt 0) {
        foreach ($param in $specData.parameters) {
            $varLetter = Convert-IndexToVariable ([int]($param.variable -replace '\D', ''))
            $paramsSection += "| $varLetter | $($param.name) | $($param.type) | $($param.picture) |"
        }
    }
    if ($paramsSection.Count -eq 0) {
        $paramsSection += "| - | Aucun parametre | - | - |"
    }

    # Build ECF section
    $ecfSection = @()
    if ($specData -and $specData.callees.Count -gt 0) {
        foreach ($callee in $specData.callees) {
            if ($AdhEcfPrograms.ContainsKey($callee.ide)) {
                $ecfSection += "| ADH.ecf | $($callee.ide) | $($AdhEcfPrograms[$callee.ide]) | Sessions_Reprises |"
            }
        }
    }
    if ($ecfSection.Count -eq 0 -and $isEcf) {
        $ecfSection += "| ADH.ecf | $IdePosition | $ecfName | Sessions_Reprises |"
    }
    if ($ecfSection.Count -eq 0) {
        $ecfSection += "| - | - | Aucun composant ECF | - |"
    }

    # Build call chain mermaid
    $callChainMermaid = @"
graph LR
    T[$IdePosition $($programName.Substring(0, [Math]::Min(15, $programName.Length)))]
"@
    if ($specData -and $specData.callChain.Count -gt 0) {
        $prev = "ORPHAN"
        $chainNodes = @()
        foreach ($node in ($specData.callChain | Sort-Object level -Descending)) {
            $shortName = $node.name.Substring(0, [Math]::Min(15, $node.name.Length))
            $chainNodes += "    N$($node.ide)[$($node.ide) $shortName]"
        }
        $callChainMermaid = @"
graph LR
$($chainNodes -join "`n")
    T[$IdePosition $($programName.Substring(0, [Math]::Min(15, $programName.Length)))]
    $($specData.callChain | ForEach-Object { "N$($_.ide)" } | Select-Object -First 1) --> T
"@
    } else {
        $callChainMermaid += @"

    ORPHAN([ORPHELIN ou Main])
    T -.-> ORPHAN
    style T fill:#58a6ff,color:#000
    style ORPHAN fill:#6b7280,stroke-dasharray: 5 5
"@
    }

    # Build callees mermaid
    $calleesMermaid = @"
graph LR
    T[$IdePosition $($programName.Substring(0, [Math]::Min(15, $programName.Length)))]
"@
    if ($specData -and $specData.callees.Count -gt 0) {
        foreach ($callee in $specData.callees | Select-Object -First 5) {
            $shortName = $callee.name.Substring(0, [Math]::Min(15, $callee.name.Length))
            $calleesMermaid += "`n    C$($callee.ide)[$($callee.ide) $shortName]"
        }
        $calleesMermaid += "`n    T --> " + (($specData.callees | Select-Object -First 5 | ForEach-Object { "C$($_.ide)" }) -join " & T --> ")
    } else {
        $calleesMermaid += @"

    TERM([TERMINAL])
    T -.-> TERM
    style TERM fill:#6b7280,stroke-dasharray: 5 5
"@
    }
    $calleesMermaid += "`n    style T fill:#58a6ff,color:#000"

    # Orphan verification result
    $orphanResult = "ORPHELIN"
    $orphanReason = "Pas de callers actifs"
    if ($callerCount -gt 0) {
        $orphanResult = "NON ORPHELIN"
        $orphanReason = "Appele par $callerCount programme(s)"
    } elseif ($isEcf) {
        $orphanResult = "NON ORPHELIN"
        $orphanReason = "Composant ECF partage"
    }

    # Generate spec content
    $spec = @"
# $Project IDE $IdePosition - $programName

> **Version spec**: 4.0
> **Analyse**: $timestamp
> **Source**: ``$xmlPath``
> **Methode**: APEX + PDCA (Auto-generated)

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur (utilisateur connecte) |
| **Quoi** | $programName |
| **Pourquoi** | Fonction metier du module $Project |
| **Declencheur** | Appel depuis programme parent ou menu |
| **Resultat** | Traitement effectue selon logique programme |

### 1.2 Regles metier

| Code | Regle | Condition |
|------|-------|-----------|
| RM-001 | Execution du traitement principal | Conditions d'entree validees |
| RM-002 | Gestion des tables ($tableCount tables) | Acces selon mode (R/W/L) |
| RM-003 | Appels sous-programmes ($calleeCount callees) | Selon logique metier |

### 1.3 Flux utilisateur

1. Reception des parametres d'entree ($paramCount params)
2. Initialisation et verification conditions
3. Traitement principal ($taskCount taches)
4. Appels sous-programmes si necessaire
5. Retour resultats

### 1.4 Cas d'erreur

| Erreur | Comportement |
|--------|--------------|
| Conditions non remplies | Abandon avec message |
| Erreur sous-programme | Propagation erreur |

---

<!-- TAB:Technique -->

## SPECIFICATION TECHNIQUE

### 2.1 Identification

| Attribut | Valeur |
|----------|--------|
| **IDE Position** | $IdePosition |
| **Fichier XML** | ``$xmlFileName`` |
| **Description** | $programName |
| **Module** | $Project |
| **Public Name** | $(if ($isEcf) { $ecfName } else { "" }) |
| **Nombre taches** | $taskCount |
| **Lignes logique** | $logicLineCount |
| **Expressions** | $exprCount |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
$($tablesSection -join "`n")

**Resume**: $tableCount tables accedees dont **$writeTableCount en ecriture**

### 2.3 Parametres d'entree ($paramCount parametres)

| Var | Nom | Type | Picture |
|-----|-----|------|---------|
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

### 2.5 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | $taskCount |
| **Lignes logique** | $logicLineCount |
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
| PublicName | $(if ($isEcf) { "Defini: $ecfName" } else { "Non defini" }) |
| ECF partage | $(if ($isEcf) { "OUI - ADH.ecf" } else { "NON" }) |
| **Conclusion** | **$orphanResult** - $orphanReason |

---

## NOTES MIGRATION

### Complexite

| Critere | Score | Detail |
|---------|-------|--------|
| Taches | $taskCount | $(if ($taskCount -gt 20) { "Complexe" } elseif ($taskCount -gt 5) { "Moyen" } else { "Simple" }) |
| Tables | $tableCount | $(if ($writeTableCount -gt 0) { "Ecriture" } else { "Lecture seule" }) |
| Callees | $calleeCount | $(if ($calleeCount -gt 5) { "Fort couplage" } elseif ($calleeCount -gt 0) { "Couplage modere" } else { "Faible couplage" }) |
| **Score global** | **$complexity** | - |

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
| $timestamp | **V4.0 APEX/PDCA** - Generation automatique complete | Script |

---

*Specification V4.0 - Auto-generated with APEX/PDCA methodology*

"@

    # Write spec file
    $spec | Out-File -FilePath $specFile -Encoding UTF8 -Force
    return $true
}

# Main execution
Write-Host "=== Generate V4.0 Spec ===" -ForegroundColor Cyan
Write-Host "Project: $Project" -ForegroundColor White
Write-Host "IDE Position: $IdePosition" -ForegroundColor White
Write-Host ""

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$result = Generate-Spec -Project $Project -IdePosition $IdePosition -OutputPath $OutputPath

if ($result) {
    Write-Host "Generated: $Project-IDE-$IdePosition.md" -ForegroundColor Green
} else {
    Write-Host "Skipped or failed" -ForegroundColor Yellow
}
