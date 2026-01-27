#Requires -Version 5.1
<#
.SYNOPSIS
    Generate V2.1 renders for ALL ADH specs

.DESCRIPTION
    Reads all V2.0 specs from .openspec/specs/ and generates V2.1 renders
    with automatic cleaning of internal Magic references.
#>
param(
    [switch]$Force,
    [int]$Limit = 0  # 0 = all
)

$ErrorActionPreference = "Stop"
$projectRoot = "D:\Projects\Lecteur_Magic"
$specsPath = "$projectRoot\.openspec\specs"
$rendersPath = "$projectRoot\.openspec\renders"
$mergeScript = "$projectRoot\tools\spec-generator\Merge-SpecWithAnnotations.ps1"

Write-Host "=== Generate All ADH V2.1 Renders ===" -ForegroundColor Cyan

# Get all ADH specs
$specs = Get-ChildItem "$specsPath\ADH-IDE-*.md" | Sort-Object {
    [int]([regex]::Match($_.BaseName, 'IDE-(\d+)').Groups[1].Value)
}

Write-Host "Found $($specs.Count) ADH V2.0 specs" -ForegroundColor Yellow

if ($Limit -gt 0) {
    $specs = $specs | Select-Object -First $Limit
    Write-Host "Limited to first $Limit specs" -ForegroundColor DarkYellow
}

$success = 0
$failed = 0
$skipped = 0

foreach ($spec in $specs) {
    $ide = [regex]::Match($spec.BaseName, 'IDE-(\d+)').Groups[1].Value
    $renderFile = "$rendersPath\ADH-IDE-$ide.md"

    # Skip if render exists and not forcing
    if ((Test-Path $renderFile) -and -not $Force) {
        $skipped++
        continue
    }

    try {
        Write-Host "  Processing ADH IDE $ide..." -ForegroundColor Gray -NoNewline

        # Run merge script (which now includes cleaning)
        $null = & $mergeScript -Project ADH -IDE $ide 2>&1

        Write-Host " OK" -ForegroundColor Green
        $success++
    }
    catch {
        Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Failed:  $failed" -ForegroundColor $(if ($failed -gt 0) { 'Red' } else { 'Gray' })
Write-Host "Skipped: $skipped (already exists)" -ForegroundColor Gray
Write-Host "Total renders: $((Get-ChildItem "$rendersPath\ADH-IDE-*.md").Count)" -ForegroundColor Cyan
