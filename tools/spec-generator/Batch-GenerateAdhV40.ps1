<#
.SYNOPSIS
    Batch generate V4.0 specs for all ADH programs
.DESCRIPTION
    Processes all ADH programs and generates V4.0 APEX/PDCA specs
.PARAMETER StartFrom
    IDE position to start from (default: 1)
.PARAMETER EndAt
    IDE position to end at (default: 350)
.PARAMETER BatchSize
    Number of specs to generate per batch (for progress tracking)
.PARAMETER OutputPath
    Output directory for spec files
.PARAMETER SkipExistingV40
    Skip specs that already have V4.0
#>
param(
    [int]$StartFrom = 1,
    [int]$EndAt = 350,
    [int]$BatchSize = 50,
    [string]$OutputPath = ".openspec/specs",
    [switch]$SkipExistingV40,
    [switch]$DryRun
)

$ErrorActionPreference = "Continue"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$generateScript = Join-Path $scriptPath "Generate-SpecV40.ps1"

if (-not (Test-Path $generateScript)) {
    Write-Error "Generate script not found: $generateScript"
    exit 1
}

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$totalCount = $EndAt - $StartFrom + 1
$processedCount = 0
$successCount = 0
$skipCount = 0
$errorCount = 0
$startTime = Get-Date

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "ADH V4.0 Spec Generation - Batch Process" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Range: IDE $StartFrom to IDE $EndAt ($totalCount programs)" -ForegroundColor White
Write-Host "Output: $OutputPath" -ForegroundColor White
Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""

$results = @()

for ($ide = $StartFrom; $ide -le $EndAt; $ide++) {
    $processedCount++
    $specFile = Join-Path $OutputPath "ADH-IDE-$ide.md"

    # Check if V4.0 already exists
    if ($SkipExistingV40 -and (Test-Path $specFile)) {
        $content = Get-Content $specFile -Raw -ErrorAction SilentlyContinue
        if ($content -match "Version spec.*4\.0") {
            Write-Host "[$processedCount/$totalCount] ADH IDE $ide - SKIP (V4.0 exists)" -ForegroundColor DarkGray
            $skipCount++
            $results += @{ Ide = $ide; Status = "SKIP"; Message = "V4.0 exists" }
            continue
        }
    }

    # Progress
    $percent = [math]::Round(($processedCount / $totalCount) * 100, 1)
    $elapsed = (Get-Date) - $startTime
    $estimatedTotal = if ($processedCount -gt 0) { $elapsed.TotalSeconds / $processedCount * $totalCount } else { 0 }
    $remaining = [TimeSpan]::FromSeconds($estimatedTotal - $elapsed.TotalSeconds)

    Write-Host "[$processedCount/$totalCount] ($percent%) ADH IDE $ide " -NoNewline -ForegroundColor Yellow
    Write-Host "(ETA: $($remaining.ToString('hh\:mm\:ss')))" -NoNewline -ForegroundColor DarkGray

    if ($DryRun) {
        Write-Host " - DRY RUN" -ForegroundColor Magenta
        $results += @{ Ide = $ide; Status = "DRYRUN"; Message = "Would generate" }
        continue
    }

    try {
        # Run generation script
        $output = & $generateScript -Project "ADH" -IdePosition $ide -OutputPath $OutputPath -Force 2>&1

        if ($LASTEXITCODE -eq 0 -or (Test-Path $specFile)) {
            Write-Host " - OK" -ForegroundColor Green
            $successCount++
            $results += @{ Ide = $ide; Status = "OK"; Message = "Generated" }
        } else {
            Write-Host " - WARN (partial)" -ForegroundColor Yellow
            $results += @{ Ide = $ide; Status = "WARN"; Message = "Partial generation" }
        }
    } catch {
        Write-Host " - ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
        $results += @{ Ide = $ide; Status = "ERROR"; Message = $_.Exception.Message }
    }

    # Batch progress report
    if ($processedCount % $BatchSize -eq 0) {
        Write-Host ""
        Write-Host "--- Batch Progress: $processedCount/$totalCount processed ---" -ForegroundColor Cyan
        Write-Host "    Success: $successCount | Skip: $skipCount | Errors: $errorCount" -ForegroundColor White
        Write-Host ""
    }
}

# Final report
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "GENERATION COMPLETE" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Duration: $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor White
Write-Host "Processed: $processedCount" -ForegroundColor White
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Skipped: $skipCount" -ForegroundColor DarkGray
Write-Host "Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })

# Save report
$reportFile = "spec-generation-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$report = @{
    StartTime = $startTime.ToString("o")
    EndTime = $endTime.ToString("o")
    Duration = $duration.ToString()
    TotalProcessed = $processedCount
    Success = $successCount
    Skipped = $skipCount
    Errors = $errorCount
    Results = $results
}
$report | ConvertTo-Json -Depth 3 | Out-File $reportFile -Encoding UTF8

Write-Host ""
Write-Host "Report saved: $reportFile" -ForegroundColor Gray
