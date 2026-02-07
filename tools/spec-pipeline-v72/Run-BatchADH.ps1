# Run-BatchADH.ps1 - Batch processing for all ADH programs
# Generates V7.2 specs with algorigramme

param(
    [int]$MaxParallel = 5,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$OutputBase = "$ProjectRoot\.openspec\specs"
$ProgressFile = "$ScriptDir\output\adh-progress.json"

# ADH IDE positions (128 programs from KB query)
$idePositions = @(
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 53, 54,
    64, 65, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82,
    83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 100, 101,
    102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 121, 130,
    131, 137, 147, 148, 149, 150, 151, 152, 160, 161, 162, 163, 164, 165, 166,
    167, 168, 169, 178, 180, 181, 185, 192, 202, 203, 208, 210, 229, 236, 237,
    238, 242, 243, 250, 288, 294, 295, 296
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "         ADH BATCH SPEC GENERATOR - V7.2 PIPELINE               " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total programs: $($idePositions.Count)"
Write-Host "Max parallel: $MaxParallel"
Write-Host "Output: $OutputBase"
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN] Would process: $($idePositions -join ', ')"
    return
}

# Initialize progress tracking
$progress = @{
    startTime = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    total = $idePositions.Count
    completed = 0
    failed = @()
    inProgress = @()
    queue = $idePositions
}

# Save initial progress
$progress | ConvertTo-Json -Depth 5 | Set-Content $ProgressFile -Encoding UTF8

$startTime = Get-Date
$jobs = @()

foreach ($ide in $idePositions) {
    # Wait if max parallel reached
    while (($jobs | Where-Object { $_.State -eq 'Running' }).Count -ge $MaxParallel) {
        Start-Sleep -Milliseconds 500

        # Check completed jobs
        $completedJobs = $jobs | Where-Object { $_.State -eq 'Completed' }
        foreach ($job in $completedJobs) {
            $result = Receive-Job $job
            $progress.completed++
            $progress.inProgress = $progress.inProgress | Where-Object { $_ -ne $job.Name }
            Remove-Job $job
            $jobs = $jobs | Where-Object { $_.Id -ne $job.Id }

            # Update progress file
            $elapsed = (Get-Date) - $startTime
            $avgPerProg = if ($progress.completed -gt 0) { $elapsed.TotalSeconds / $progress.completed } else { 30 }
            $remaining = ($progress.total - $progress.completed) * $avgPerProg / $MaxParallel
            $progress.estimatedRemaining = [math]::Round($remaining / 60, 1)
            $progress.percentComplete = [math]::Round(($progress.completed / $progress.total) * 100, 1)
            $progress | ConvertTo-Json -Depth 5 | Set-Content $ProgressFile -Encoding UTF8

            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Completed: ADH IDE $($job.Name) ($($progress.completed)/$($progress.total) - $($progress.percentComplete)%)" -ForegroundColor Green
        }

        # Check failed jobs
        $failedJobs = $jobs | Where-Object { $_.State -eq 'Failed' }
        foreach ($job in $failedJobs) {
            $progress.failed += $job.Name
            $progress.inProgress = $progress.inProgress | Where-Object { $_ -ne $job.Name }
            Remove-Job $job
            $jobs = $jobs | Where-Object { $_.Id -ne $job.Id }
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] FAILED: ADH IDE $($job.Name)" -ForegroundColor Red
        }
    }

    # Start new job
    $progress.inProgress += $ide
    $progress.queue = $progress.queue | Where-Object { $_ -ne $ide }

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting: ADH IDE $ide" -ForegroundColor Yellow

    $job = Start-Job -Name $ide -ScriptBlock {
        param($ScriptDir, $ide, $OutputBase)
        $outputDir = "$ScriptDir\output\ADH-IDE-$ide"
        $specFile = "$OutputBase\ADH-IDE-$ide.md"

        # Run pipeline
        & "$ScriptDir\Run-SpecPipeline.ps1" -Project ADH -IdePosition $ide -OutputPath $outputDir 2>&1

        # Copy spec to .openspec/specs if generated
        $generatedSpec = "$outputDir\ADH-IDE-$ide.md"
        if (Test-Path $generatedSpec) {
            Copy-Item $generatedSpec $specFile -Force
        }
    } -ArgumentList $ScriptDir, $ide, $OutputBase

    $jobs += $job
}

# Wait for remaining jobs
Write-Host ""
Write-Host "Waiting for remaining jobs to complete..." -ForegroundColor Cyan
while ($jobs.Count -gt 0) {
    Start-Sleep -Seconds 1

    $completedJobs = $jobs | Where-Object { $_.State -eq 'Completed' -or $_.State -eq 'Failed' }
    foreach ($job in $completedJobs) {
        if ($job.State -eq 'Completed') {
            $progress.completed++
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Completed: ADH IDE $($job.Name) ($($progress.completed)/$($progress.total))" -ForegroundColor Green
        } else {
            $progress.failed += $job.Name
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] FAILED: ADH IDE $($job.Name)" -ForegroundColor Red
        }
        Remove-Job $job
        $jobs = $jobs | Where-Object { $_.Id -ne $job.Id }
    }

    $progress.percentComplete = [math]::Round(($progress.completed / $progress.total) * 100, 1)
    $progress | ConvertTo-Json -Depth 5 | Set-Content $ProgressFile -Encoding UTF8
}

# Final summary
$endTime = Get-Date
$duration = $endTime - $startTime
$progress.endTime = $endTime.ToString("yyyy-MM-dd HH:mm:ss")
$progress.duration = $duration.ToString("hh\:mm\:ss")
$progress | ConvertTo-Json -Depth 5 | Set-Content $ProgressFile -Encoding UTF8

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                      BATCH COMPLETE                             " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Total: $($progress.total)"
Write-Host "Completed: $($progress.completed)"
Write-Host "Failed: $($progress.failed.Count)"
Write-Host "Duration: $($progress.duration)"
if ($progress.failed.Count -gt 0) {
    Write-Host "Failed programs: $($progress.failed -join ', ')" -ForegroundColor Red
}
