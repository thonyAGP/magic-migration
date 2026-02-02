<#
.SYNOPSIS
    Extract structured data for algorigramme generation from Magic Knowledge Base.

.DESCRIPTION
    Calls KbIndexRunner 'algo-data' command to extract:
    - Task hierarchy (names, types, parent, has_form)
    - Condition expressions (IF/CASE)
    - Tables in write mode (side-effects)
    - Callees (sub-programs called)
    - Domain keywords (from task/program names)
    - Parameters (IN/OUT)

    Output is a JSON file ready for Claude synthesis into a business flow algorigramme.

.PARAMETER Project
    Magic project name (ADH, PBP, PVE, PBG, REF, VIL)

.PARAMETER IdePosition
    IDE position of the program (integer)

.PARAMETER OutputPath
    Optional path to save JSON output. Defaults to stdout.

.EXAMPLE
    .\Extract-AlgoData.ps1 -Project "ADH" -IdePosition 237
    .\Extract-AlgoData.ps1 -Project "ADH" -IdePosition 237 -OutputPath "D:\Temp\algo-237.json"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$OutputPath
)

$ErrorActionPreference = "Stop"

# Resolve paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
$kbRunnerPath = Join-Path $projectRoot "tools\KbIndexRunner"

# Verify KbIndexRunner exists
if (-not (Test-Path (Join-Path $kbRunnerPath "KbIndexRunner.csproj"))) {
    Write-Error "KbIndexRunner not found at: $kbRunnerPath"
    exit 1
}

Write-Host "[ALGO-EXTRACT] $Project IDE $IdePosition" -ForegroundColor Cyan
Write-Host "  KbIndexRunner: $kbRunnerPath" -ForegroundColor DarkGray

# Call KbIndexRunner algo-data command
Push-Location $kbRunnerPath
try {
    $output = & dotnet run -- "algo-data" "$Project $IdePosition" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "KbIndexRunner failed (exit code $LASTEXITCODE): $output"
        exit 1
    }
}
finally {
    Pop-Location
}

# Extract JSON from output (skip any dotnet build/info lines)
$jsonLine = $output | Where-Object { $_ -match '^\{' } | Select-Object -First 1

if (-not $jsonLine) {
    Write-Error "No JSON output from KbIndexRunner. Raw output:`n$output"
    exit 1
}

# Parse and validate
$data = $jsonLine | ConvertFrom-Json

if ($data.error) {
    Write-Error "KbIndexRunner error: $($data.error)"
    exit 1
}

# Display summary
Write-Host ""
Write-Host "  Programme: $($data.program)" -ForegroundColor White
Write-Host "  Public:    $($data.public_name)" -ForegroundColor White
Write-Host "  Taches:    $($data.statistics.task_count)" -ForegroundColor Green
Write-Host "  Conditions:$($data.statistics.condition_count)" -ForegroundColor Yellow
Write-Host "  Tables W:  $($data.statistics.tables_write_count)" -ForegroundColor Red
Write-Host "  Callees:   $($data.statistics.callee_count)" -ForegroundColor Cyan
Write-Host "  Params:    $($data.statistics.parameter_count)" -ForegroundColor Magenta
Write-Host "  Keywords:  $($data.domain_keywords -join ', ')" -ForegroundColor DarkYellow
Write-Host ""

# Output
if ($OutputPath) {
    $jsonFormatted = $jsonLine | ConvertFrom-Json | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($OutputPath, $jsonFormatted, [System.Text.UTF8Encoding]::new($false))
    Write-Host "[OK] JSON saved to: $OutputPath" -ForegroundColor Green
} else {
    # Output raw JSON to stdout for piping
    Write-Output $jsonLine
}
