# Phase2-Mapping.ps1 - V7.2 Pipeline
# Extraction des variables avec conversion FieldID -> Lettres via CLI
# V7.2: Applique main_offset pour calculer les lettres globales
# Voir OFFSET-SYSTEM.md pour documentation

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

# V7.2: Function to convert 0-based index to Magic letter
# Magic convention: A-Z (0-25), BA-BZ (26-51), CA-CZ (52-77), etc.
# NOTE: After Z comes BA, not AA (Magic style, not Excel)
function Convert-IndexToLetter {
    param([int]$Index)  # 0-based index

    if ($Index -lt 0) { return "?" }
    if ($Index -lt 26) {
        return [string][char](65 + $Index)  # A-Z
    }
    elseif ($Index -lt 702) {
        $first = [int][math]::Floor($Index / 26)   # 1=B, 2=C, 3=D...
        $second = $Index % 26                       # 0=A, 1=B, 2=C...
        return [string][char](65 + $first) + [string][char](65 + $second)
    }
    elseif ($Index -lt 18278) {
        # 3-letter case (BAA onwards)
        $first = [int][math]::Floor(($Index - 702) / 676) + 1
        $remaining = ($Index - 702) % 676
        $second = [int][math]::Floor($remaining / 26)
        $third = $remaining % 26
        return [string][char](65 + $first) + [string][char](65 + $second) + [string][char](65 + $third)
    }
    return "???"
}

Write-Host "=== Phase 2: MAPPING (V7.2) ===" -ForegroundColor Cyan
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

# Step 2: Load main_offset from discovery.json (V7.2)
Write-Host "[2/5] Loading main_offset from discovery..." -ForegroundColor Yellow

$discoveryPath = Join-Path $OutputPath "discovery.json"
$mainOffset = 0
if (Test-Path $discoveryPath) {
    $discovery = Get-Content $discoveryPath -Raw | ConvertFrom-Json
    if ($discovery.metadata.main_offset) {
        $mainOffset = [int]$discovery.metadata.main_offset
    }
}
Write-Host "  Main offset: $mainOffset" -ForegroundColor $(if ($mainOffset -gt 0) { "Green" } else { "Yellow" })
Write-Host ""

# Step 3: Build variable mapping dictionary (for expression decoding)
Write-Host "[3/5] Building variable mapping dictionary..." -ForegroundColor Yellow

# Function: Convert Letter to Field ID (inverse of FieldToLetter)
function Convert-LetterToField {
    param([string]$Letter)
    if ([string]::IsNullOrWhiteSpace($Letter) -or $Letter -eq "?") { return 0 }
    if ($Letter.StartsWith("VG")) { return 0 }
    if ($Letter.StartsWith("Field")) { return 0 }

    # Convert letters to FieldId - Magic IDE convention
    # A=1..Z=26, BA=27..BZ=52, CA=53..CZ=78, etc.
    # NOTE: After Z comes BA (not AA) - this is Magic IDE, not Excel style.
    $Letter = $Letter.ToUpper()

    if ($Letter.Length -eq 1) {
        # A-Z: FieldId 1-26
        return ([int][char]$Letter) - 64  # A=1, B=2, ... Z=26
    }
    elseif ($Letter.Length -eq 2) {
        # BA-ZZ: FieldId 27-702
        # BA=27, BB=28... BZ=52, CA=53...
        $first = ([int][char]$Letter[0]) - 65   # B=1, C=2, D=3...
        $second = ([int][char]$Letter[1]) - 65  # A=0, B=1, C=2...
        return $first * 26 + $second + 1
    }
    elseif ($Letter.Length -eq 3) {
        # BAA-ZZZ: FieldId 703+
        $first = ([int][char]$Letter[0]) - 65
        $second = ([int][char]$Letter[1]) - 65
        $third = ([int][char]$Letter[2]) - 65
        return 702 + ($first - 1) * 676 + $second * 26 + $third + 1
    }
    return 0
}

$variableMapping = @{}

foreach ($v in $varData.variables.local) {
    # Use the letter to compute local field_id
    $localLetter = $v.letter
    $localFieldId = Convert-LetterToField -Letter $localLetter

    if ($localFieldId -gt 0) {
        # V7.2: Apply main_offset to get global letter
        # Global index = main_offset + (local_field_id - 1)
        # local_field_id is 1-based, main_offset is 0-based count
        $globalIndex = $mainOffset + ($localFieldId - 1)
        $globalLetter = Convert-IndexToLetter -Index $globalIndex

        $key = "{0,$localFieldId}"
        # Only add if not already present (first occurrence wins)
        if (-not $variableMapping.ContainsKey($key)) {
            $variableMapping[$key] = @{
                letter = $globalLetter        # V7.2: Use global letter for display
                local_letter = $localLetter   # V7.2: Keep local letter for reference
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

# Step 4: Load table info from discovery (already loaded in step 2)
Write-Host "[4/5] Loading table info from discovery..." -ForegroundColor Yellow

$tableColumns = @{}

if ($discovery) {
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

# Step 5: Structural table-to-column mapping via KB
Write-Host "[5/5] Fetching structural table-column mapping via CLI..." -ForegroundColor Yellow

$tableColMapping = @{}
$tableOtherVars = @{}
$tableColCmd = "cd '$KbIndexRunnerPath'; dotnet run -- table-columns '$Project $IdePosition'"
$tcJsonOutput = powershell -NoProfile -Command $tableColCmd 2>&1

try {
    $tcData = $tcJsonOutput | ConvertFrom-Json
    if (-not $tcData.error) {
        # Real columns (definition='R') per table
        if ($tcData.table_columns) {
            foreach ($prop in $tcData.table_columns.PSObject.Properties) {
                $tableColMapping[$prop.Name] = @($prop.Value)
            }
        }
        # Virtual/Parameter columns per table
        if ($tcData.table_other_vars) {
            foreach ($prop in $tcData.table_other_vars.PSObject.Properties) {
                $tableOtherVars[$prop.Name] = @($prop.Value)
            }
        }
        Write-Host "  Tables with Real columns: $($tableColMapping.Count)" -ForegroundColor Green
        $totalRealCols = ($tableColMapping.Values | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum
        Write-Host "  Total Real columns mapped: $totalRealCols"
        Write-Host "  Tables with Virtual/Param vars: $($tableOtherVars.Count)"
    } else {
        Write-Host "  Warning: table-columns returned error: $($tcData.error)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Warning: Failed to parse table-columns output, structural mapping unavailable" -ForegroundColor Yellow
}
Write-Host ""

# V7.2: Update variables.local with global letters before output
$updatedLocalVars = @()
foreach ($v in $varData.variables.local) {
    $localLetter = $v.letter
    $localFieldId = Convert-LetterToField -Letter $localLetter
    if ($localFieldId -gt 0) {
        $globalIndex = $mainOffset + ($localFieldId - 1)
        $globalLetter = Convert-IndexToLetter -Index $globalIndex
    } else {
        $globalLetter = $localLetter
    }

    $updatedLocalVars += @{
        field_id = $v.field_id
        letter = $globalLetter          # V7.2: Global letter for display
        local_letter = $localLetter     # V7.2: Keep local for reference
        name = $v.name
        data_type = $v.data_type
        picture = $v.picture
        source = $v.source
    }
}

# Build mapping.json
$mapping = @{
    metadata = @{
        project = $Project
        ide_position = $IdePosition
        program_name = $varData.program
        generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        pipeline_version = "7.2"
        main_offset = $mainOffset  # V7.2: Include offset for reference
    }

    variables = @{
        local = $updatedLocalVars       # V7.2: Use updated variables with global letters
        virtual = $varData.variables.virtual
        global = $varData.variables.global
        parameters = $varData.variables.parameters
    }

    variable_mapping = $variableMapping

    tables = $tableColumns

    table_columns = $tableColMapping

    table_other_vars = $tableOtherVars

    statistics = @{
        total_variables = $varData.statistics.total
        local_count = $varData.statistics.local
        virtual_count = $varData.statistics.virtual
        global_count = $varData.statistics.global
        parameter_count = $varData.statistics.parameters
        table_count = $tableColumns.Count
        mapping_entries = $variableMapping.Count
        tables_with_real_columns = $tableColMapping.Count
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
Write-Host "  - Main offset: $mainOffset (first local var = $(Convert-IndexToLetter -Index $mainOffset))"
Write-Host "  - Total variables: $($varData.statistics.total)"
Write-Host "  - Mapping entries: $($variableMapping.Count)"
Write-Host "  - Input parameters: $($varData.statistics.parameters)"
Write-Host "  - Tables: $($tableColumns.Count)"

return $mapping
