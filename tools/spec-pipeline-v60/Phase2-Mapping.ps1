# Phase2-Mapping.ps1 - V6.0 Pipeline
# Extraction des variables avec conversion FieldID -> Lettres via CLI

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

Write-Host "=== Phase 2: MAPPING (V6.0) ===" -ForegroundColor Cyan
Write-Host "Project: $Project"
Write-Host "IDE Position: $IdePosition"
Write-Host ""

# Step 1: Call KbIndexRunner CLI to get variables
Write-Host "[1/3] Fetching variables via CLI..." -ForegroundColor Yellow

$variablesCmd = "cd '$KbIndexRunnerPath'; dotnet run -- variables '$Project $IdePosition'"
$jsonOutput = powershell -NoProfile -Command $variablesCmd 2>&1

# Parse JSON output
try {
    $varData = $jsonOutput | ConvertFrom-Json

    if ($varData.error) {
        Write-Host "ERROR: $($varData.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to parse variables output" -ForegroundColor Red
    Write-Host $jsonOutput
    exit 1
}

Write-Host "  Program: $($varData.program)" -ForegroundColor Green
Write-Host "  Total variables: $($varData.statistics.total)"
Write-Host "  - Local: $($varData.statistics.local)"
Write-Host "  - Virtual: $($varData.statistics.virtual)"
Write-Host "  - Global: $($varData.statistics.global)"
Write-Host "  - Parameters: $($varData.statistics.parameters)"
Write-Host ""

# Step 2: Build variable mapping dictionary (for expression decoding)
Write-Host "[2/3] Building variable mapping dictionary..." -ForegroundColor Yellow

# Function: Convert Letter to Field ID (inverse of FieldToLetter)
function Convert-LetterToField {
    param([string]$Letter)
    if ([string]::IsNullOrWhiteSpace($Letter) -or $Letter -eq "?") { return 0 }
    if ($Letter.StartsWith("VG")) { return 0 }
    if ($Letter.StartsWith("Field")) { return 0 }

    # Convert letters like A=1, Z=26, AA=27, BA=53
    $fieldId = 0
    $Letter = $Letter.ToUpper()

    for ($i = 0; $i -lt $Letter.Length; $i++) {
        [char]$char = $Letter[$i]
        [int]$charCode = [int]$char
        # A=65, Z=90
        if ($charCode -ge 65 -and $charCode -le 90) {
            $fieldId = $fieldId * 26 + ($charCode - 64)  # A=1, B=2, etc.
        } else {
            return 0  # Invalid character
        }
    }
    return $fieldId
}

$variableMapping = @{}

foreach ($v in $varData.variables.local) {
    # Use the letter to compute field_id
    $letter = $v.letter
    $computedFieldId = Convert-LetterToField -Letter $letter

    if ($computedFieldId -gt 0) {
        $key = "{0,$computedFieldId}"
        # Only add if not already present (first occurrence wins)
        if (-not $variableMapping.ContainsKey($key)) {
            $variableMapping[$key] = @{
                letter = $letter
                name = $v.name
                type = "local"
            }
        }
    }
}

foreach ($v in $varData.variables.global) {
    # For global variables, extract VG number from letter (e.g., "VG38" -> 38)
    $letter = $v.letter
    if ($letter -match '^VG(\d+)$') {
        $vgNum = [int]$Matches[1]
        $key = "{32768,$vgNum}"
        if (-not $variableMapping.ContainsKey($key)) {
            $variableMapping[$key] = @{
                display = "VG$vgNum"
                name = $v.name
                type = "global"
            }
        }
    }
}

Write-Host "  Mapping entries: $($variableMapping.Count)"
Write-Host ""

# Step 3: Load discovery.json for table info
Write-Host "[3/3] Loading table info from discovery..." -ForegroundColor Yellow

$discoveryPath = Join-Path $OutputPath "discovery.json"
$tableColumns = @{}

if (Test-Path $discoveryPath) {
    $discovery = Get-Content $discoveryPath -Raw | ConvertFrom-Json

    # Tables are in discovery.tables.all array with logical_name, physical_name, access_mode properties
    $tablesArray = $discovery.tables.all
    if ($tablesArray) {
        foreach ($table in $tablesArray) {
            if ($table.id) {
                $tableColumns["$($table.id)"] = @{
                    name = $table.logical_name
                    logical = $table.logical_name
                    physical = $table.physical_name
                    access = $table.access_mode
                }
            }
        }
    }
    Write-Host "  Tables from discovery: $($tableColumns.Count)"
} else {
    Write-Host "  Warning: discovery.json not found, skipping table enrichment" -ForegroundColor Yellow
}
Write-Host ""

# Build mapping.json
$mapping = @{
    metadata = @{
        project = $Project
        ide_position = $IdePosition
        program_name = $varData.program
        generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        pipeline_version = "7.0"
    }

    variables = $varData.variables

    variable_mapping = $variableMapping

    tables = $tableColumns

    statistics = @{
        total_variables = $varData.statistics.total
        local_count = $varData.statistics.local
        virtual_count = $varData.statistics.virtual
        global_count = $varData.statistics.global
        parameter_count = $varData.statistics.parameters
        table_count = $tableColumns.Count
        mapping_entries = $variableMapping.Count
    }
}

# Save mapping.json
$mappingPath = Join-Path $OutputPath "mapping.json"
$mapping | ConvertTo-Json -Depth 10 | Set-Content -Path $mappingPath -Encoding UTF8

Write-Host "=== Phase 2 COMPLETE ===" -ForegroundColor Green
Write-Host "Output: $mappingPath"
Write-Host ""

# Summary
Write-Host "MAPPING SUMMARY:" -ForegroundColor Cyan
Write-Host "  - Total variables: $($varData.statistics.total)"
Write-Host "  - Mapping entries: $($variableMapping.Count)"
Write-Host "  - Input parameters: $($varData.statistics.parameters)"
Write-Host "  - Tables: $($tableColumns.Count)"

return $mapping
