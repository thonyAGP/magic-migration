<#
.SYNOPSIS
    Generate magic-config.json with dynamic project and village lists.
    Reads from actual file system and updates config file.

.DESCRIPTION
    Creates/updates D:\Projects\ClubMed\LecteurMagic\.openspec\magic-config.json
    - Projects: discovered from D:\Data\Migration\XPA\PMS\*\Source folders
    - Villages: loaded from REF village table or fallback list

    Run this on session start or after git pull to keep config in sync.

.OUTPUTS
    JSON config file at .openspec/magic-config.json
#>
param(
    [string]$ProjectsBasePath = "D:\Data\Migration\XPA\PMS",
    [string]$OutputPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\magic-config.json"
)

$ErrorActionPreference = "Stop"

# Discover projects from file system
function Get-MagicProjects {
    param([string]$BasePath)

    $projects = @()
    $dirs = Get-ChildItem -Path $BasePath -Directory -ErrorAction SilentlyContinue

    foreach ($dir in $dirs) {
        $sourcePath = Join-Path $dir.FullName "Source"
        $prgFiles = Join-Path $sourcePath "Prg_*.xml"

        # Only include directories that have Source folder with Prg_*.xml files
        if ((Test-Path $sourcePath) -and (Get-ChildItem $prgFiles -ErrorAction SilentlyContinue | Select-Object -First 1)) {
            $prgCount = (Get-ChildItem $prgFiles -ErrorAction SilentlyContinue).Count
            $projects += @{
                Name = $dir.Name.ToUpperInvariant()
                Path = $sourcePath
                ProgramCount = $prgCount
            }
        }
    }

    return $projects | Sort-Object { $_.Name }
}

# Get known villages from REF DataSources or fallback list
function Get-MagicVillages {
    param([string]$BasePath)

    # Try to parse from REF DataSources.xml for cafil075_dat (villages table)
    $dataSourcesPath = Join-Path $BasePath "REF\Source\DataSources.xml"
    $villages = @()

    if (Test-Path $dataSourcesPath) {
        try {
            # Parse village codes from DataSources if available
            # For now, use common village codes
        } catch {}
    }

    # Fallback to common Club Med village codes
    if ($villages.Count -eq 0) {
        $villages = @(
            "CSK", "VPH", "OPU", "SMP", "CHA", "MAR", "PLM", "TRI",
            "BAH", "IXT", "PUN", "CAN", "TUR", "SAM", "RIO", "BOR",
            "CAP", "GRE", "ARK", "MRM", "AGS", "VIT", "BIN", "CHE",
            "DJE", "YUC", "POM", "SAN", "PRA", "SER", "VAL", "MEI"
        )
    }

    return $villages | Sort-Object
}

# Main
Write-Host "=== MAGIC CONFIG GENERATOR ===" -ForegroundColor Cyan
Write-Host "Projects base: $ProjectsBasePath" -ForegroundColor Yellow
Write-Host ""

# Discover projects
$projects = Get-MagicProjects -BasePath $ProjectsBasePath
Write-Host "Discovered $($projects.Count) projects with Source folders:" -ForegroundColor Green
foreach ($p in $projects) {
    Write-Host "  - $($p.Name): $($p.ProgramCount) programs"
}

# Get villages
$villages = Get-MagicVillages -BasePath $ProjectsBasePath

# Build config
$config = @{
    generated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    projectsBasePath = $ProjectsBasePath
    projects = @{
        all = $projects | ForEach-Object { $_.Name }
        active = @("ADH", "PBP", "REF", "VIL", "PBG", "PVE", "PUG")  # Default active
        details = $projects
    }
    villages = @{
        codes = $villages
        count = $villages.Count
    }
    patterns = @{
        # Regex patterns for ticket extraction
        program = @('programme\s+([A-Z_]+\d*)', 'program\s+([A-Z_]+\d*)', 'PRG[_-]?(\d+)', 'IDE\s+(\d+)')
        table = @('table\s+([a-z_]+\d*_dat)', 'cafil\d+_dat', 'cc[a-z_]+')
        village = "\\b($($villages -join '|'))\\b"
    }
}

# Ensure output directory exists
$outputDir = Split-Path $OutputPath -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Write config
$config | ConvertTo-Json -Depth 5 | Set-Content $OutputPath -Encoding UTF8
Write-Host ""
Write-Host "Config written to: $OutputPath" -ForegroundColor Green

# Output summary
Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Cyan
Write-Host "  Projects: $($projects.Count) discovered ($($config.projects.active.Count) active)"
Write-Host "  Villages: $($villages.Count) codes"
Write-Host "  Patterns: $(($config.patterns.PSObject.Properties | Measure-Object).Count) types"
