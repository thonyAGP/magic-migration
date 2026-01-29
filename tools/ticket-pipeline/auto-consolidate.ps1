# auto-consolidate.ps1
# Phase 6 (v2.0): Consolidation des donnees du pipeline en un seul JSON
# Produit pipeline-data.json pour consommation par Claude (modele hybride)
#
# Usage: .\auto-consolidate.ps1 -TicketDir ".openspec\tickets\PMS-1427"

param(
    [Parameter(Mandatory=$true)]
    [string]$TicketDir,

    [string]$OutputFile = ""
)

$ErrorActionPreference = "Stop"

# Resolve paths
if (-not [System.IO.Path]::IsPathRooted($TicketDir)) {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
    $TicketDir = Join-Path $ProjectRoot $TicketDir
}

if (-not $OutputFile) {
    $OutputFile = Join-Path $TicketDir "pipeline-data.json"
}

# ============================================================================
# HELPER: Lire JSON avec gestion BOM et fichier absent
# ============================================================================

function Read-JsonFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    # Use .NET to read file - handles BOM automatically
    $raw = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
    # Strip any remaining BOM character
    $raw = $raw.TrimStart([char]0xFEFF)
    try { return $raw | ConvertFrom-Json }
    catch { Write-Warning "JSON parse error in $Path : $_"; return $null }
}

# ============================================================================
# LECTURE DES FICHIERS DE PHASE
# ============================================================================

Write-Host "[Consolidate] Lecture des fichiers de phase dans: $TicketDir" -ForegroundColor Cyan

$Context     = Read-JsonFile (Join-Path $TicketDir "context.json")
$Programs    = Read-JsonFile (Join-Path $TicketDir "programs.json")
$Flow        = Read-JsonFile (Join-Path $TicketDir "flow.json")
$Expressions = Read-JsonFile (Join-Path $TicketDir "expressions.json")
$Patterns    = Read-JsonFile (Join-Path $TicketDir "patterns.json")
$State       = Read-JsonFile (Join-Path $TicketDir "pipeline-state.json")

$DiagramPath = Join-Path $TicketDir "diagram.txt"
$Diagram     = if (Test-Path $DiagramPath) { [System.IO.File]::ReadAllText($DiagramPath, [System.Text.Encoding]::UTF8) } else { "" }

# ============================================================================
# EXTRACTION TICKET KEY
# ============================================================================

$TicketKey = if ($State -and $State.TicketKey) {
    $State.TicketKey
} elseif ($Context -and $Context.TicketKey) {
    $Context.TicketKey
} else {
    Split-Path -Leaf $TicketDir
}

# ============================================================================
# VALIDATION INTER-PHASE
# ============================================================================

# Safe count helper
function Safe-Count($arr) {
    if ($null -eq $arr) { return 0 }
    if ($arr -is [array]) { return $arr.Count }
    return 1
}

$hasContext     = ($null -ne $Context)

# Force arrays (ConvertFrom-Json deroule les arrays a 1 element)
$progList = [array]@()
if ($Programs -and $Programs.Programs) { $progList = @($Programs.Programs) }
$hasPrograms    = ($progList.Count -gt 0)
$verifiedList   = [array]@($progList | Where-Object { $_.Verified -eq $true })
$hasVerifiedIDE = ($verifiedList.Count -gt 0)
Write-Host "[Consolidate] Programs: $($progList.Count) found, $($verifiedList.Count) verified" -ForegroundColor Gray

$flowList = [array]@()
if ($Flow -and $Flow.Flow) { $flowList = @($Flow.Flow) }
$hasFlow        = ($flowList.Count -gt 0)
$hasDiagram     = ([string]$Diagram).Length -gt 50

$exprList = [array]@()
if ($Expressions -and $Expressions.Expressions) { $exprList = @($Expressions.Expressions) }
$hasExpressions = ($exprList.Count -gt 0)
$decodedList    = [array]@($exprList | Where-Object { $_.Decoded })
$hasDecodedExpr = ($decodedList.Count -gt 0)

$patternList = [array]@()
if ($Patterns -and $Patterns.Patterns) { $patternList = @($Patterns.Patterns) }
$hasPatterns    = ($patternList.Count -gt 0)

$valErrors   = [System.Collections.ArrayList]::new()
$valWarnings = [System.Collections.ArrayList]::new()

if (-not $hasPrograms)    { [void]$valErrors.Add("Phase 2: Aucun programme localise") }
elseif (-not $hasVerifiedIDE) { [void]$valErrors.Add("Phase 2: Programmes trouves mais aucun IDE verifie") }
if ($hasExpressions -and -not $hasDecodedExpr) { [void]$valWarnings.Add("Phase 4: Expressions trouvees mais aucune decodee") }

$PhaseScore = 0
if ($hasContext)     { $PhaseScore++ }
if ($hasVerifiedIDE) { $PhaseScore++ }
if ($hasFlow)        { $PhaseScore++ }
if ($hasDecodedExpr) { $PhaseScore++ }
if ($hasPatterns)    { $PhaseScore++ }

$Validation = @{
    HasContext      = $hasContext
    HasPrograms     = $hasPrograms
    HasVerifiedIDE  = $hasVerifiedIDE
    HasFlow         = $hasFlow
    HasDiagram      = $hasDiagram
    HasExpressions  = $hasExpressions
    HasDecodedExpr  = $hasDecodedExpr
    HasPatterns     = $hasPatterns
    Errors          = @($valErrors)
    Warnings        = @($valWarnings)
    Score           = "$PhaseScore/6"
}

# ============================================================================
# CONSTRUCTION DU JSON CONSOLIDE
# ============================================================================

# Section 1: Context
$ContextData = @{
    ticketKey  = [string]$TicketKey
    source     = if ($Context) { [string]$Context.Source } else { "unknown" }
    symptom    = if ($Context) { [string]$Context.Symptom } else { "" }
    keywords   = if ($Context -and $Context.Keywords -and @($Context.Keywords).Count -gt 0) { @($Context.Keywords | ForEach-Object { if ($_.Keyword) { [string]$_.Keyword } else { [string]$_ } }) } else { ,@() }
    jiraUrl    = "https://clubmed.atlassian.net/browse/$TicketKey"
}

# Enrichir avec index.json local
$IndexPath = Join-Path (Split-Path $TicketDir) "index.json"
$IndexData = Read-JsonFile $IndexPath
if ($IndexData -and $IndexData.localTickets) {
    $ticket = $IndexData.localTickets | Where-Object { $_.key -eq $TicketKey } | Select-Object -First 1
    if ($ticket) {
        $ContextData.summary      = [string]$ticket.summary
        $ContextData.status       = [string]$ticket.status
        $ContextData.program      = [string]$ticket.program
        $ContextData.lastAnalysis = [string]$ticket.lastAnalysis
        $ContextData.createdDate  = [string]$ticket.createdDate
        $ContextData.rootCause    = [string]$ticket.rootCause
    }
}

# Section 2: Programs
$ProgramsData = @()
if ($Programs -and $Programs.Programs) {
    foreach ($p in $Programs.Programs) {
        $ProgramsData += @{
            raw        = [string]$p.Raw
            project    = [string]$p.Project
            programId  = [int]$p.ProgramId
            ide        = [int]$p.IDE
            name       = [string]$p.Name
            publicName = [string]$p.PublicName
            verified   = [bool]$p.Verified
            source     = [string]$p.Source
        }
    }
}

# Section 3: Flow (use pre-computed lists to avoid PSCustomObject depth issues)
$callTaskList = if ($Flow -and $Flow.CallTasks) { @($Flow.CallTasks) } else { @() }
$flowExprList = if ($Flow -and $Flow.Expressions) { @($Flow.Expressions) } else { @() }

$FlowData = @{
    diagram     = [string]$Diagram
    stats       = @{
        programsTraced = $flowList.Count
        callTasks      = $callTaskList.Count
        expressions    = $flowExprList.Count
    }
}
# Note: callTasks and expressions raw data NOT included to avoid ConvertTo-Json depth issues
# Claude will re-fetch detailed data via MCP tools

# Section 4: Expressions
$exprStats = if ($Expressions -and $Expressions.Stats) {
    @{ Total = [int]$Expressions.Stats.Total; Decoded = [int]$Expressions.Stats.Decoded; Failed = [int]$Expressions.Stats.Failed }
} else {
    @{ Total = 0; Decoded = 0; Failed = 0 }
}

$ExpressionsData = @{
    count = $exprList.Count
    decodedCount = $decodedList.Count
    stats = $exprStats
}

# Section 5: Patterns
$PatternsData = @{
    matchedCount = $patternList.Count
    minimumScore = if ($Patterns -and $Patterns.MinimumScore) { $Patterns.MinimumScore } else { 2 }
}

# ============================================================================
# ASSEMBLAGE FINAL
# ============================================================================

$PipelineData = @{
    version    = "2.0"
    ticketKey  = $TicketKey
    generatedAt = (Get-Date).ToString("o")
    template   = "TEMPLATE-ANALYSIS.md"

    validation = $Validation

    # Data sections (matching template sections)
    context     = $ContextData      # -> Section 1
    programs    = $ProgramsData     # -> Section 2
    flow        = $FlowData         # -> Section 4
    expressions = $ExpressionsData  # -> Section 5
    patterns    = $PatternsData     # -> Section 6 (patterns)

    # Metadata
    pipeline = @{
        phases = @{
            context      = @{ completed = $Validation.HasContext }
            localization = @{ completed = $Validation.HasVerifiedIDE }
            flowTrace    = @{ completed = $Validation.HasFlow }
            expressions  = @{ completed = $Validation.HasDecodedExpr }
            patterns     = @{ completed = $Validation.HasPatterns }
            diagnostic   = @{ completed = $false }
        }
        score = $Validation.Score
    }
}

# ============================================================================
# ECRITURE JSON (sans BOM)
# ============================================================================

try {
    $json = $PipelineData | ConvertTo-Json -Depth 4 -Compress:$false
} catch {
    Write-Warning "ConvertTo-Json failed with Depth 4, trying Depth 3: $_"
    $json = $PipelineData | ConvertTo-Json -Depth 3
}
Write-Host "[Consolidate] JSON size: $([math]::Round($json.Length / 1KB, 1)) KB" -ForegroundColor Gray
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($OutputFile, $json, $utf8NoBom)

# ============================================================================
# RAPPORT DE VALIDATION
# ============================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CONSOLIDATION $TicketKey" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$phases = @(
    @{ Name = "1. Contexte";     OK = $Validation.HasContext },
    @{ Name = "2. Localisation"; OK = $Validation.HasVerifiedIDE },
    @{ Name = "3. Flux";         OK = $Validation.HasFlow },
    @{ Name = "4. Expressions";  OK = $Validation.HasDecodedExpr },
    @{ Name = "5. Patterns";     OK = $Validation.HasPatterns },
    @{ Name = "6. Diagnostic";   OK = $false }
)

foreach ($ph in $phases) {
    $icon = if ($ph.OK) { "[OK]" } else { "[--]" }
    $color = if ($ph.OK) { "Green" } else { "Yellow" }
    Write-Host "  $icon $($ph.Name)" -ForegroundColor $color
}

Write-Host ""
Write-Host "  Score: $($Validation.Score)" -ForegroundColor White

if ($Validation.Errors.Count -gt 0) {
    Write-Host ""
    Write-Host "  ERREURS:" -ForegroundColor Red
    foreach ($err in $Validation.Errors) {
        Write-Host "    [!] $err" -ForegroundColor Red
    }
}

if ($Validation.Warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "  AVERTISSEMENTS:" -ForegroundColor Yellow
    foreach ($warn in $Validation.Warnings) {
        Write-Host "    [?] $warn" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  Output: $OutputFile" -ForegroundColor Gray
Write-Host ""

# Return path for orchestrator
return $OutputFile
