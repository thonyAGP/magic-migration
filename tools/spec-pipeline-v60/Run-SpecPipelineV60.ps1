# Run-SpecPipelineV60.ps1 - V6.0 Pipeline Orchestrator
# Pipeline d'analyse approfondie utilisant les outils MCP via KbIndexRunner CLI

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$OutputPath,

    [switch]$SkipPhase4
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Default output path
if (-not $OutputPath) {
    $OutputPath = Join-Path $ScriptDir "output\$Project-IDE-$IdePosition"
}

# Banner
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "         MAGIC SPEC PIPELINE V6.0 - DEEP ANALYSIS               " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Target: $Project IDE $IdePosition"
Write-Host "Output: $OutputPath"
Write-Host ""

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Check KB is indexed
$KbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"
if (-not (Test-Path $KbPath)) {
    Write-Host "ERROR: Knowledge Base not found at $KbPath" -ForegroundColor Red
    exit 1
}

$startTime = Get-Date
$phaseResults = @{}

# PHASE 1: DISCOVERY
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host " PHASE 1: DISCOVERY                                              " -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    $phase1Script = Join-Path $ScriptDir "Phase1-Discovery.ps1"
    $phase1Result = & $phase1Script -Project $Project -IdePosition $IdePosition -OutputPath $OutputPath
    $phaseResults["Phase1"] = @{ success = $true; data = $phase1Result }
    Write-Host ""
} catch {
    Write-Host "PHASE 1 FAILED: $_" -ForegroundColor Red
    $phaseResults["Phase1"] = @{ success = $false; error = $_.ToString() }
    exit 1
}

# PHASE 2: MAPPING
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host " PHASE 2: MAPPING                                                " -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    $phase2Script = Join-Path $ScriptDir "Phase2-Mapping.ps1"
    $phase2Result = & $phase2Script -Project $Project -IdePosition $IdePosition -OutputPath $OutputPath
    $phaseResults["Phase2"] = @{ success = $true; data = $phase2Result }
    Write-Host ""
} catch {
    Write-Host "PHASE 2 FAILED: $_" -ForegroundColor Red
    $phaseResults["Phase2"] = @{ success = $false; error = $_.ToString() }
}

# PHASE 3: DECODE
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host " PHASE 3: DECODE                                                 " -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    $phase3Script = Join-Path $ScriptDir "Phase3-Decode.ps1"
    $phase3Result = & $phase3Script -Project $Project -IdePosition $IdePosition -OutputPath $OutputPath
    $phaseResults["Phase3"] = @{ success = $true; data = $phase3Result }
    Write-Host ""
} catch {
    Write-Host "PHASE 3 FAILED: $_" -ForegroundColor Red
    $phaseResults["Phase3"] = @{ success = $false; error = $_.ToString() }
}

# PHASE 4: UI FORMS
if (-not $SkipPhase4) {
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host " PHASE 4: UI FORMS                                               " -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host ""

    try {
        $phase4Script = Join-Path $ScriptDir "Phase4-UIForms.ps1"
        $phase4Result = & $phase4Script -Project $Project -IdePosition $IdePosition -OutputPath $OutputPath
        $phaseResults["Phase4"] = @{ success = $true; data = $phase4Result }
        Write-Host ""
    } catch {
        Write-Host "PHASE 4 FAILED: $_" -ForegroundColor Red
        $phaseResults["Phase4"] = @{ success = $false; error = $_.ToString() }
    }
} else {
    Write-Host "[SKIPPED] Phase 4: UI Forms" -ForegroundColor DarkGray
    $phaseResults["Phase4"] = @{ success = $true; skipped = $true }
}

# PHASE 5: SYNTHESIS
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host " PHASE 5: SYNTHESIS                                              " -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    $phase5Script = Join-Path $ScriptDir "Phase5-Synthesis.ps1"
    $specsPath = Join-Path $ProjectRoot ".openspec\specs"
    $phase5Result = & $phase5Script -Project $Project -IdePosition $IdePosition -OutputPath $OutputPath -SpecsOutputPath $specsPath
    $phaseResults["Phase5"] = @{ success = $true; data = $phase5Result }
    Write-Host ""
} catch {
    Write-Host "PHASE 5 FAILED: $_" -ForegroundColor Red
    $phaseResults["Phase5"] = @{ success = $false; error = $_.ToString() }
}

# FINAL SUMMARY
$endTime = Get-Date
$totalDuration = $endTime - $startTime

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "                    PIPELINE V6.0 COMPLETE                       " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "PHASE RESULTS:" -ForegroundColor Cyan
foreach ($phase in @("Phase1", "Phase2", "Phase3", "Phase4", "Phase5")) {
    $result = $phaseResults[$phase]
    $status = if ($result.success) { "[OK]" } else { "[FAIL]" }
    $color = if ($result.success) { "Green" } else { "Red" }
    if ($result.skipped) { $status = "[SKIP]"; $color = "DarkGray" }
    Write-Host "  $status $phase" -ForegroundColor $color
}

Write-Host ""
Write-Host "DURATION: $([math]::Round($totalDuration.TotalSeconds, 1)) seconds"
Write-Host ""

Write-Host "OUTPUT FILES:" -ForegroundColor Cyan
Write-Host "  Pipeline data: $OutputPath"
$specsPath = Join-Path $ProjectRoot ".openspec\specs"
Write-Host "  Specs: $specsPath"
Write-Host "    - $Project-IDE-$IdePosition.md (DETAILED)"
Write-Host "    - $Project-IDE-$IdePosition-summary.md (SUMMARY)"

if ($phaseResults.Phase5.data.quality_score) {
    Write-Host ""
    Write-Host "Quality Score: $($phaseResults.Phase5.data.quality_score)%" -ForegroundColor Green
}

# Save pipeline report
$report = @{
    project = $Project
    ide_position = $IdePosition
    duration_seconds = [math]::Round($totalDuration.TotalSeconds, 1)
    pipeline_version = "6.0"
}

$reportPath = Join-Path $OutputPath "pipeline-report.json"
$report | ConvertTo-Json -Depth 5 | Set-Content -Path $reportPath -Encoding UTF8

Write-Host ""
return $report
