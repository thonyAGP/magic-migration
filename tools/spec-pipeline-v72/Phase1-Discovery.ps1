# Phase1-Discovery.ps1 - V7.2 Pipeline
# Utilise KbIndexRunner CLI "spec-data" pour extraire les donnees depuis la KB
# Objectif: Resoudre les regressions V5.0 (callers/callees vides)
# V7.2: Ajout main_offset pour calcul correct des lettres de variables globales

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$OutputPath
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KbIndexRunnerPath = Join-Path (Split-Path -Parent $ScriptDir) "KbIndexRunner"

# Default output path
if (-not $OutputPath) {
    $OutputPath = Join-Path $ScriptDir "output\$Project-IDE-$IdePosition"
}
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# V7.2: Main offsets per project (number of variables in Main Prg_1)
# These offsets determine the starting letter for called programs
# See OFFSET-SYSTEM.md for documentation
$MainOffsets = @{
    "ADH" = 143
    "VIL" = 131
    "PVE" = 174
    "REF" = 107
    "PBP" = 88
    "PBG" = 91
}

Write-Host "=== Phase 1: DISCOVERY (V7.2) ===" -ForegroundColor Cyan
Write-Host "Project: $Project"
Write-Host "IDE Position: $IdePosition"
Write-Host ""

# Execute spec-data command from KbIndexRunner
Write-Host "[1/4] Extracting data from Knowledge Base..." -ForegroundColor Yellow
$specDataCmd = "cd '$KbIndexRunnerPath'; dotnet run -- 'spec-data' '$Project $IdePosition' 2>`$null"
$jsonOutput = powershell -NoProfile -Command $specDataCmd

# Check for errors
if ($jsonOutput -match '"error"') {
    Write-Host "ERROR: $jsonOutput" -ForegroundColor Red
    exit 1
}

# Parse JSON
try {
    $specData = $jsonOutput | ConvertFrom-Json
} catch {
    Write-Host "ERROR parsing JSON: $_" -ForegroundColor Red
    Write-Host "Raw output: $jsonOutput"
    exit 1
}

Write-Host "  Program: $($specData.program)" -ForegroundColor Green
Write-Host "  Tables: $($specData.tables.Count)"
Write-Host "  Callers: $($specData.callers.Count)"
Write-Host "  Callees: $($specData.callees.Count)"
Write-Host "  Expressions: $($specData.expressionCount)"
Write-Host ""

# Build discovery.json with enhanced structure
Write-Host "[2/4] Building discovery structure..." -ForegroundColor Yellow

$discovery = @{
    metadata = @{
        project = $Project
        ide_position = $IdePosition
        program_name = $specData.program
        generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        pipeline_version = "7.2"
        # V7.2: Main offset for computing global variable letters
        main_offset = if ($MainOffsets.ContainsKey($Project)) { $MainOffsets[$Project] } else { 0 }
    }

    call_graph = @{
        callers = @($specData.callers | ForEach-Object {
            @{
                ide = $_.ide
                name = $_.name
                calls_count = $_.count
            }
        })
        callees = @($specData.callees | ForEach-Object {
            @{
                ide = $_.ide
                name = $_.name
                calls_count = $_.count
            }
        })
        call_chain = @($specData.callChain | ForEach-Object {
            @{
                ide = $_.ide
                name = $_.name
                level = $_.level
            }
        })
    }

    orphan_analysis = @{
        has_callers = ($specData.callers.Count -gt 0)
        has_public_name = $false  # Will be determined below
        is_ecf_member = $false    # Will be determined below
        status = "PENDING"
        reason = ""
    }

    tables = @{
        by_access = @{
            LINK = @()
            READ = @()
            WRITE = @()
        }
        all = @()
    }

    statistics = @{
        task_count = $specData.statistics.taskCount
        logic_line_count = $specData.statistics.logicLineCount
        disabled_line_count = $specData.statistics.disabledLineCount
        expression_count = $specData.expressionCount
        table_count = 0
        caller_count = $specData.callers.Count
        callee_count = $specData.callees.Count
    }
}

# Classify tables by access mode
foreach ($table in $specData.tables) {
    $tableInfo = @{
        id = $table.id
        logical_name = $table.logical
        physical_name = $table.physical
        access_mode = $table.access
        usage_count = $table.count
    }

    # Add to access-specific list
    if ($discovery.tables.by_access.ContainsKey($table.access)) {
        $discovery.tables.by_access[$table.access] += $tableInfo
    }

    # Add to all tables (unique by id+access)
    $discovery.tables.all += $tableInfo
}
$discovery.statistics.table_count = ($specData.tables | Select-Object -Property id -Unique).Count

# Determine orphan status
Write-Host "[3/4] Analyzing orphan status..." -ForegroundColor Yellow

# ADH.ecf shared programs (from OpenSpec)
$AdhEcfPrograms = @(27, 28, 53, 54, 64, 65, 69, 70, 71, 72, 73, 76, 84, 97, 111, 121, 149, 152, 178, 180, 181, 185, 192, 208, 210, 229, 243)

if ($specData.callers.Count -gt 0) {
    $discovery.orphan_analysis.status = "NON_ORPHELIN"
    $callerDetails = ($specData.callers | ForEach-Object { "$($_.name) (IDE $($_.ide))" }) -join ', '
    $discovery.orphan_analysis.reason = "Appele par $($specData.callers.Count) programme(s): $callerDetails"
} elseif ($IdePosition -in $AdhEcfPrograms -and $Project -eq "ADH") {
    $discovery.orphan_analysis.status = "ECF_SHARED"
    $discovery.orphan_analysis.is_ecf_member = $true
    $discovery.orphan_analysis.reason = "Membre de ADH.ecf - peut etre appele depuis PBP, PVE"
} elseif ($specData.callChain.Count -gt 0) {
    # Has call chain means it's reachable from somewhere
    $discovery.orphan_analysis.status = "NON_ORPHELIN"
    $discovery.orphan_analysis.reason = "Dans la chaine d'appel depuis Main"
} else {
    $discovery.orphan_analysis.status = "ORPHELIN_POTENTIEL"
    $discovery.orphan_analysis.reason = "Aucun caller direct detecte - verifier PublicName et ECF"
}

Write-Host "  Orphan Status: $($discovery.orphan_analysis.status)" -ForegroundColor $(if ($discovery.orphan_analysis.status -eq "NON_ORPHELIN") { "Green" } else { "Yellow" })
Write-Host "  Reason: $($discovery.orphan_analysis.reason)"
Write-Host ""

# Save discovery.json
Write-Host "[4/4] Saving discovery.json..." -ForegroundColor Yellow
$discoveryPath = Join-Path $OutputPath "discovery.json"
$discovery | ConvertTo-Json -Depth 10 | Set-Content -Path $discoveryPath -Encoding UTF8

# Also save raw spec-data for other phases
$rawDataPath = Join-Path $OutputPath "spec-data-raw.json"
$jsonOutput | Set-Content -Path $rawDataPath -Encoding UTF8

Write-Host ""
Write-Host "=== Phase 1 COMPLETE ===" -ForegroundColor Green
Write-Host "Output: $discoveryPath"
Write-Host ""

# Summary for pipeline
Write-Host "DISCOVERY SUMMARY:" -ForegroundColor Cyan
Write-Host "  - Program: $($specData.program)"
Write-Host "  - Tables: $($discovery.statistics.table_count) (LINK: $($discovery.tables.by_access.LINK.Count), READ: $($discovery.tables.by_access.READ.Count), WRITE: $($discovery.tables.by_access.WRITE.Count))"
Write-Host "  - Callers: $($discovery.statistics.caller_count)"
Write-Host "  - Callees: $($discovery.statistics.callee_count)"
Write-Host "  - Expressions: $($discovery.statistics.expression_count)"
Write-Host "  - Orphan: $($discovery.orphan_analysis.status)"

# Return discovery object for pipeline chaining
return $discovery
