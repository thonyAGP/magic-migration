# Run-TicketPipeline.ps1
# Orchestrateur principal du pipeline d'analyse de tickets Magic
# Usage: .\Run-TicketPipeline.ps1 -TicketKey "PMS-1234"
#
# Ce script execute les 6 phases d'analyse automatiquement:
# 1. Extraction contexte Jira
# 2. Localisation programmes (MCP)
# 3. Tracage flux + diagramme ASCII
# 4. Decodage expressions {N,Y} (MCP)
# 5. Matching patterns KB
# 6. Generation analysis.md

param(
    [Parameter(Mandatory=$true)]
    [string]$TicketKey,

    [string]$OutputDir = ".openspec\tickets\$TicketKey",

    [switch]$SkipJira,
    [switch]$ShowDetails,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Configuration MCP
$McpExe = Join-Path $ProjectRoot "tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"
if (-not (Test-Path $McpExe)) {
    $McpExe = Join-Path $ProjectRoot "tools\MagicMcp\bin\Debug\net8.0\MagicMcp.exe"
}

# Validation
if (-not (Test-Path $McpExe)) {
    Write-Error "MagicMcp.exe non trouve. Compiler avec: dotnet build tools/MagicMcp -c Release"
    exit 1
}

# Creer dossier output
$FullOutputDir = Join-Path $ProjectRoot $OutputDir
if (-not (Test-Path $FullOutputDir)) {
    New-Item -ItemType Directory -Path $FullOutputDir -Force | Out-Null
}

# State file pour tracking
$StateFile = Join-Path $FullOutputDir "pipeline-state.json"
$State = @{
    TicketKey = $TicketKey
    StartTime = (Get-Date).ToString("o")
    Phases = @{
        Context = @{ Status = "pending"; StartTime = $null; EndTime = $null; Output = $null }
        Localization = @{ Status = "pending"; StartTime = $null; EndTime = $null; Output = $null }
        FlowTrace = @{ Status = "pending"; StartTime = $null; EndTime = $null; Output = $null }
        Expressions = @{ Status = "pending"; StartTime = $null; EndTime = $null; Output = $null }
        PatternMatch = @{ Status = "pending"; StartTime = $null; EndTime = $null; Output = $null }
        Generate = @{ Status = "pending"; StartTime = $null; EndTime = $null; Output = $null }
    }
    Programs = @()
    Tables = @()
    Expressions = @()
    MatchedPatterns = @()
    RootCause = $null
    Errors = @()
}

function Write-Phase {
    param([string]$Phase, [string]$Message, [string]$Color = "Cyan")
    Write-Host "[$Phase] $Message" -ForegroundColor $Color
}

function Save-State {
    $State | ConvertTo-Json -Depth 10 | Set-Content $StateFile -Encoding UTF8
}

function Invoke-MCP {
    param(
        [string]$Tool,
        [hashtable]$Params
    )

    $ParamsJson = $Params | ConvertTo-Json -Compress
    $TempFile = [System.IO.Path]::GetTempFileName()

    try {
        # Appel MCP via stdin
        $Process = Start-Process -FilePath $McpExe -ArgumentList @(
            "--tool", $Tool,
            "--params", $ParamsJson
        ) -NoNewWindow -Wait -PassThru -RedirectStandardOutput $TempFile -RedirectStandardError "$TempFile.err"

        $Output = Get-Content $TempFile -Raw -ErrorAction SilentlyContinue
        $ErrorOutput = Get-Content "$TempFile.err" -Raw -ErrorAction SilentlyContinue

        if ($Process.ExitCode -ne 0) {
            throw "MCP Error: $ErrorOutput"
        }

        return $Output | ConvertFrom-Json
    }
    finally {
        Remove-Item $TempFile -ErrorAction SilentlyContinue
        Remove-Item "$TempFile.err" -ErrorAction SilentlyContinue
    }
}

# ============================================================================
# PHASE 1: CONTEXTE JIRA
# ============================================================================

Write-Phase "PHASE 1" "Extraction contexte Jira" "Yellow"
$State.Phases.Context.StartTime = (Get-Date).ToString("o")
$State.Phases.Context.Status = "running"
Save-State

try {
    $ContextScript = Join-Path $ScriptDir "auto-extract-context.ps1"
    $ContextOutput = Join-Path $FullOutputDir "context.json"

    if ($SkipJira) {
        Write-Phase "PHASE 1" "Mode offline - lecture fichiers locaux" "Gray"

        # Lire l'index des tickets pour trouver les programmes
        $IndexFile = Join-Path $ProjectRoot ".openspec\tickets\index.json"
        $Programs = @()
        $Tables = @()
        $Symptom = ""

        if (Test-Path $IndexFile) {
            $Index = Get-Content $IndexFile -Raw | ConvertFrom-Json
            $TicketInfo = $Index.localTickets | Where-Object { $_.key -eq $TicketKey }
            if ($TicketInfo -and $TicketInfo.program) {
                $Programs += @{ Raw = $TicketInfo.program; Source = "index" }
                $Symptom = $TicketInfo.summary
            }
        }

        # Lire aussi notes.md si present
        $NotesFile = Join-Path $FullOutputDir "notes.md"
        if (Test-Path $NotesFile) {
            $NotesContent = Get-Content $NotesFile -Raw
            # Extraire programmes avec pattern IDE
            $Matches = [regex]::Matches($NotesContent, '([A-Z]{2,3})\s+IDE\s+(\d+)')
            foreach ($Match in $Matches) {
                $Programs += @{ Raw = $Match.Value; Source = "notes" }
            }
            if (-not $Symptom) { $Symptom = ($NotesContent -split "`n" | Select-Object -First 3) -join " " }
        }

        @{
            TicketKey = $TicketKey
            Source = "offline"
            Symptom = $Symptom
            Programs = $Programs
            Tables = $Tables
            Keywords = @()
        } | ConvertTo-Json -Depth 5 | Set-Content $ContextOutput -Encoding UTF8
    }
    else {
        & $ContextScript -TicketKey $TicketKey -OutputFile $ContextOutput
    }

    $Context = Get-Content $ContextOutput -Raw | ConvertFrom-Json
    $State.Programs = $Context.Programs
    $State.Tables = $Context.Tables
    $State.Phases.Context.Status = "completed"
    $State.Phases.Context.Output = $ContextOutput

    Write-Phase "PHASE 1" "Contexte extrait: $($Context.Programs.Count) programmes, $($Context.Tables.Count) tables" "Green"
}
catch {
    $State.Phases.Context.Status = "failed"
    $State.Errors += "Phase 1: $_"
    Write-Phase "PHASE 1" "ERREUR: $_" "Red"
}

$State.Phases.Context.EndTime = (Get-Date).ToString("o")
Save-State

# ============================================================================
# PHASE 2: LOCALISATION PROGRAMMES (MCP)
# ============================================================================

Write-Phase "PHASE 2" "Localisation programmes via MCP" "Yellow"
$State.Phases.Localization.StartTime = (Get-Date).ToString("o")
$State.Phases.Localization.Status = "running"
Save-State

try {
    $LocalizationScript = Join-Path $ScriptDir "auto-find-programs.ps1"
    $LocalizationOutput = Join-Path $FullOutputDir "programs.json"

    & $LocalizationScript -Programs $State.Programs -Tables $State.Tables -McpExe $McpExe -OutputFile $LocalizationOutput

    $Localization = Get-Content $LocalizationOutput -Raw | ConvertFrom-Json
    $State.Programs = $Localization.Programs
    $State.Phases.Localization.Status = "completed"
    $State.Phases.Localization.Output = $LocalizationOutput

    $VerifiedCount = ($Localization.Programs | Where-Object { $_.IDE }).Count
    Write-Phase "PHASE 2" "Localisation: $VerifiedCount programmes avec IDE verifie" "Green"
}
catch {
    $State.Phases.Localization.Status = "failed"
    $State.Errors += "Phase 2: $_"
    Write-Phase "PHASE 2" "ERREUR: $_" "Red"
}

$State.Phases.Localization.EndTime = (Get-Date).ToString("o")
Save-State

# ============================================================================
# PHASE 3: TRACAGE FLUX + DIAGRAMME ASCII
# ============================================================================

Write-Phase "PHASE 3" "Tracage flux et generation diagramme" "Yellow"
$State.Phases.FlowTrace.StartTime = (Get-Date).ToString("o")
$State.Phases.FlowTrace.Status = "running"
Save-State

try {
    $FlowScript = Join-Path $ScriptDir "auto-trace-flow.ps1"
    $FlowOutput = Join-Path $FullOutputDir "flow.json"
    $DiagramOutput = Join-Path $FullOutputDir "diagram.txt"

    & $FlowScript -Programs $State.Programs -McpExe $McpExe -OutputFile $FlowOutput -DiagramFile $DiagramOutput

    $Flow = Get-Content $FlowOutput -Raw | ConvertFrom-Json
    $State.Expressions = $Flow.Expressions
    $State.Phases.FlowTrace.Status = "completed"
    $State.Phases.FlowTrace.Output = $FlowOutput

    Write-Phase "PHASE 3" "Flux trace: $($Flow.CallTasks.Count) CallTasks, $($Flow.Expressions.Count) expressions" "Green"
}
catch {
    $State.Phases.FlowTrace.Status = "failed"
    $State.Errors += "Phase 3: $_"
    Write-Phase "PHASE 3" "ERREUR: $_" "Red"
}

$State.Phases.FlowTrace.EndTime = (Get-Date).ToString("o")
Save-State

# ============================================================================
# PHASE 4: DECODAGE EXPRESSIONS {N,Y} (MCP)
# ============================================================================

Write-Phase "PHASE 4" "Decodage expressions via MCP" "Yellow"
$State.Phases.Expressions.StartTime = (Get-Date).ToString("o")
$State.Phases.Expressions.Status = "running"
Save-State

try {
    $DecodeScript = Join-Path $ScriptDir "auto-decode-expressions.ps1"
    $DecodeOutput = Join-Path $FullOutputDir "expressions.json"

    & $DecodeScript -Expressions $State.Expressions -McpExe $McpExe -OutputFile $DecodeOutput

    $Decoded = Get-Content $DecodeOutput -Raw | ConvertFrom-Json
    $State.Expressions = $Decoded.Expressions
    $State.Phases.Expressions.Status = "completed"
    $State.Phases.Expressions.Output = $DecodeOutput

    $DecodedCount = ($Decoded.Expressions | Where-Object { $_.Decoded }).Count
    Write-Phase "PHASE 4" "Expressions decodees: $DecodedCount/$($Decoded.Expressions.Count)" "Green"
}
catch {
    $State.Phases.Expressions.Status = "failed"
    $State.Errors += "Phase 4: $_"
    Write-Phase "PHASE 4" "ERREUR: $_" "Red"
}

$State.Phases.Expressions.EndTime = (Get-Date).ToString("o")
Save-State

# ============================================================================
# PHASE 5: MATCHING PATTERNS KB
# ============================================================================

Write-Phase "PHASE 5" "Recherche patterns similaires dans KB" "Yellow"
$State.Phases.PatternMatch.StartTime = (Get-Date).ToString("o")
$State.Phases.PatternMatch.Status = "running"
Save-State

try {
    $MatchScript = Join-Path $ScriptDir "auto-match-patterns.ps1"
    $MatchOutput = Join-Path $FullOutputDir "patterns.json"
    $Context = Get-Content (Join-Path $FullOutputDir "context.json") -Raw | ConvertFrom-Json

    & $MatchScript -Symptom $Context.Symptom -Keywords $Context.Keywords -OutputFile $MatchOutput

    $Matched = Get-Content $MatchOutput -Raw | ConvertFrom-Json
    $State.MatchedPatterns = $Matched.Patterns
    $State.Phases.PatternMatch.Status = "completed"
    $State.Phases.PatternMatch.Output = $MatchOutput

    if ($Matched.Patterns.Count -gt 0) {
        $TopPattern = $Matched.Patterns[0]
        Write-Phase "PHASE 5" "Pattern suggere: $($TopPattern.Id) (score: $($TopPattern.Score))" "Green"
    }
    else {
        Write-Phase "PHASE 5" "Aucun pattern KB correspondant" "Yellow"
    }
}
catch {
    $State.Phases.PatternMatch.Status = "failed"
    $State.Errors += "Phase 5: $_"
    Write-Phase "PHASE 5" "ERREUR: $_" "Red"
}

$State.Phases.PatternMatch.EndTime = (Get-Date).ToString("o")
Save-State

# ============================================================================
# PHASE 6: GENERATION analysis.md
# ============================================================================

Write-Phase "PHASE 6" "Generation du rapport analysis.md" "Yellow"
$State.Phases.Generate.StartTime = (Get-Date).ToString("o")
$State.Phases.Generate.Status = "running"
Save-State

try {
    $GenerateScript = Join-Path $ScriptDir "auto-generate-analysis.ps1"
    $AnalysisOutput = Join-Path $FullOutputDir "analysis.md"

    & $GenerateScript -StateFile $StateFile -OutputFile $AnalysisOutput

    $State.Phases.Generate.Status = "completed"
    $State.Phases.Generate.Output = $AnalysisOutput

    Write-Phase "PHASE 6" "Rapport genere: $AnalysisOutput" "Green"
}
catch {
    $State.Phases.Generate.Status = "failed"
    $State.Errors += "Phase 6: $_"
    Write-Phase "PHASE 6" "ERREUR: $_" "Red"
}

$State.Phases.Generate.EndTime = (Get-Date).ToString("o")
$State.EndTime = (Get-Date).ToString("o")
Save-State

# ============================================================================
# RESUME FINAL
# ============================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PIPELINE TERMINE - $TicketKey" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$CompletedPhases = ($State.Phases.Values | Where-Object { $_.Status -eq "completed" }).Count
$FailedPhases = ($State.Phases.Values | Where-Object { $_.Status -eq "failed" }).Count

foreach ($Phase in @("Context", "Localization", "FlowTrace", "Expressions", "PatternMatch", "Generate")) {
    $PhaseState = $State.Phases[$Phase]
    $Icon = switch ($PhaseState.Status) {
        "completed" { "[OK]" }
        "failed" { "[FAIL]" }
        default { "[SKIP]" }
    }
    $Color = switch ($PhaseState.Status) {
        "completed" { "Green" }
        "failed" { "Red" }
        default { "Gray" }
    }
    Write-Host "  $Icon $Phase" -ForegroundColor $Color
}

Write-Host ""
Write-Host "Score: $CompletedPhases/6 phases completees" -ForegroundColor $(if ($CompletedPhases -ge 5) { "Green" } elseif ($CompletedPhases -ge 3) { "Yellow" } else { "Red" })

if ($State.Errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Erreurs:" -ForegroundColor Red
    foreach ($Err in $State.Errors) {
        Write-Host "  - $Err" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Fichiers generes:" -ForegroundColor Gray
Get-ChildItem $FullOutputDir | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}

# Retourner le chemin du fichier analysis.md
return $AnalysisOutput
