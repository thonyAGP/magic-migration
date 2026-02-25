# Test script to initialize and index Magic Knowledge Base
# This script tests the KB functionality outside of MCP

$ErrorActionPreference = "Stop"

# Paths
$kbDir = "$env:USERPROFILE\.magic-kb"
$kbPath = "$kbDir\knowledge.db"
$projectsPath = "D:\Data\Migration\XPA\PMS"
$projects = @("ADH", "PBP", "REF", "VIL", "PBG", "PVE")

Write-Host "=== Magic Knowledge Base Initialization ===" -ForegroundColor Cyan
Write-Host ""

# Create directory
if (-not (Test-Path $kbDir)) {
    New-Item -ItemType Directory -Path $kbDir -Force | Out-Null
    Write-Host "[OK] Created KB directory: $kbDir" -ForegroundColor Green
}

# Check if projects exist
Write-Host ""
Write-Host "Checking projects..." -ForegroundColor Yellow
foreach ($proj in $projects) {
    $projPath = Join-Path $projectsPath "$proj\Source"
    if (Test-Path $projPath) {
        $xmlCount = (Get-ChildItem -Path $projPath -Filter "Prg_*.xml" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
        Write-Host "  [OK] $proj - $xmlCount programs" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $proj" -ForegroundColor Red
    }
}

# Run MagicMcp to initialize KB
Write-Host ""
Write-Host "To initialize the Knowledge Base, start MagicMcp server or run:" -ForegroundColor Yellow
Write-Host "  cd D:\Projects\ClubMed\LecteurMagic\tools\MagicMcp" -ForegroundColor White
Write-Host "  dotnet run" -ForegroundColor White
Write-Host ""
Write-Host "Then use the magic_kb_reindex tool to index all projects." -ForegroundColor Yellow

# Show stats after indexing
Write-Host ""
Write-Host "Expected data after indexing:" -ForegroundColor Cyan
Write-Host "  - ~4,500 programs across 6 projects"
Write-Host "  - ~25,000 tasks"
Write-Host "  - ~200,000 expressions"
Write-Host "  - ~1,200 tables"
Write-Host "  - Full-text search via FTS5"
