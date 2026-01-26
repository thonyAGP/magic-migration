# Regenerate-Changed-Specs.ps1
# Local script to regenerate specs for changed programs
# Use this when working locally (vs CI/CD workflow)

param(
    [ValidateSet("Auto", "LastCommit", "LastTag", "Today", "Week")]
    [string]$Mode = "Auto",

    [switch]$SyncToKb,

    [switch]$DryRun,

    [switch]$Force
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Regenerate Changed Specs (Local) ===" -ForegroundColor Cyan
Write-Host "Mode: $Mode" -ForegroundColor Gray

# Map mode to detection parameter
$sinceParam = switch ($Mode) {
    "Auto" {
        # Auto-detect: use last commit if recent changes, else last tag
        $lastCommitDate = git log -1 --format=%ci 2>$null
        if ($lastCommitDate) {
            $commitDate = [DateTime]::Parse($lastCommitDate)
            $hoursSinceCommit = ((Get-Date) - $commitDate).TotalHours
            if ($hoursSinceCommit -lt 24) {
                "LastCommit"
            } else {
                "LastTag"
            }
        } else {
            "LastCommit"
        }
    }
    "LastCommit" { "LastCommit" }
    "LastTag" { "LastTag" }
    "Today" { "Date" }
    "Week" { "Date" }
}

$extraArgs = @()
if ($Mode -eq "Today") {
    $extraArgs += "-SinceDate"
    $extraArgs += (Get-Date).ToString("yyyy-MM-dd")
}
if ($Mode -eq "Week") {
    $extraArgs += "-SinceDate"
    $extraArgs += (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
}

# Build batch command
$batchScript = Join-Path $scriptDir "Batch-GenerateSpecs.ps1"

$batchArgs = @(
    "-Since", $sinceParam
)
$batchArgs += $extraArgs

if ($SyncToKb) { $batchArgs += "-SyncToKb" }
if ($DryRun) { $batchArgs += "-DryRun" }
if ($Force) { $batchArgs += "-Force" }

Write-Host "Running: Batch-GenerateSpecs.ps1 $($batchArgs -join ' ')" -ForegroundColor Gray
Write-Host ""

& $batchScript @batchArgs

$exitCode = $LASTEXITCODE

# Summary
Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "[DONE] Spec regeneration complete" -ForegroundColor Green

    if (-not $DryRun) {
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Review generated specs in .openspec/specs/" -ForegroundColor Gray
        Write-Host "  2. Commit changes: git add .openspec/ && git commit -m 'docs(specs): regenerate'" -ForegroundColor Gray
        if (-not $SyncToKb) {
            Write-Host "  3. Sync to KB: .\Sync-SpecsToKb.ps1" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "[ERROR] Spec regeneration completed with errors" -ForegroundColor Red
}

exit $exitCode
