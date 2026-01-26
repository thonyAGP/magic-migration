# Batch-GenerateSpecs.ps1
# Regenerate specs for multiple programs (from change detection or list)
# Supports dry-run, parallel execution, and sync to KB

param(
    [Parameter(ParameterSetName='Detection')]
    [ValidateSet("LastCommit", "LastTag", "Date", "Branch")]
    [string]$Since = "",

    [Parameter(ParameterSetName='Detection')]
    [string]$CompareRef = "",

    [Parameter(ParameterSetName='List')]
    [string[]]$Programs = @(),  # Format: "ADH:238", "PBP:45"

    [Parameter(ParameterSetName='Folder')]
    [string]$Project = "",

    [Parameter(ParameterSetName='Folder')]
    [int]$IdeFrom = 0,

    [Parameter(ParameterSetName='Folder')]
    [int]$IdeTo = 0,

    [string]$OutputPath = "D:\Projects\Lecteur_Magic\.openspec\specs",

    [switch]$SyncToKb,         # Run Sync-SpecsToKb.ps1 after generation

    [switch]$DryRun,           # Show what would be done

    [int]$Parallel = 1,        # Number of parallel jobs

    [switch]$Force             # Regenerate even if spec exists and is newer
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Batch Generate Specs ===" -ForegroundColor Cyan

# ============================================================================
# COLLECT PROGRAMS TO PROCESS
# ============================================================================

$programsToProcess = @()

# Mode 1: From change detection
if ($Since) {
    Write-Host "Mode: Change Detection ($Since)" -ForegroundColor Yellow

    $detectScript = Join-Path $scriptDir "Detect-ChangedPrograms.ps1"
    $changed = & $detectScript -Since $Since -CompareRef $CompareRef

    foreach ($prog in $changed) {
        $programsToProcess += @{
            Project = $prog.Project
            IDE = $prog.IDE
        }
    }
}
# Mode 2: From explicit list
elseif ($Programs.Count -gt 0) {
    Write-Host "Mode: Explicit List ($($Programs.Count) programs)" -ForegroundColor Yellow

    foreach ($p in $Programs) {
        if ($p -match '^([A-Z]+):(\d+)$') {
            $programsToProcess += @{
                Project = $Matches[1]
                IDE = [int]$Matches[2]
            }
        } else {
            Write-Warning "Invalid format: $p (expected PROJECT:IDE)"
        }
    }
}
# Mode 3: From folder range
elseif ($Project -and $IdeFrom -gt 0 -and $IdeTo -gt 0) {
    Write-Host "Mode: Folder Range ($Project IDE $IdeFrom-$IdeTo)" -ForegroundColor Yellow

    for ($i = $IdeFrom; $i -le $IdeTo; $i++) {
        $programsToProcess += @{
            Project = $Project
            IDE = $i
        }
    }
}
else {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\Batch-GenerateSpecs.ps1 -Since LastCommit    # Auto-detect changes" -ForegroundColor Gray
    Write-Host "  .\Batch-GenerateSpecs.ps1 -Programs 'ADH:238','ADH:245'  # Explicit list" -ForegroundColor Gray
    Write-Host "  .\Batch-GenerateSpecs.ps1 -Project ADH -IdeFrom 232 -IdeTo 255  # Range" -ForegroundColor Gray
    exit 0
}

if ($programsToProcess.Count -eq 0) {
    Write-Host "[INFO] No programs to process" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Programs to process: $($programsToProcess.Count)" -ForegroundColor Cyan

# ============================================================================
# FILTER: Skip if spec is newer than XML (unless -Force)
# ============================================================================

if (-not $Force) {
    $filtered = @()
    $sourcesPath = "D:\Data\Migration\XPA\PMS"

    foreach ($prog in $programsToProcess) {
        $specFile = Join-Path $OutputPath "$($prog.Project)-IDE-$($prog.IDE).md"

        if (Test-Path $specFile) {
            # Get XML file date
            $progsXml = "$sourcesPath\$($prog.Project)\Source\Progs.xml"
            if (Test-Path $progsXml) {
                [xml]$progs = Get-Content $progsXml -Encoding UTF8
                $programs = $progs.Application.ProgramsRepositoryOutLine.Programs.Program
                if ($programs.Count -ge $prog.IDE) {
                    $prgId = $programs[$prog.IDE - 1].id
                    $xmlFile = "$sourcesPath\$($prog.Project)\Source\Prg_$prgId.xml"

                    if (Test-Path $xmlFile) {
                        $xmlDate = (Get-Item $xmlFile).LastWriteTime
                        $specDate = (Get-Item $specFile).LastWriteTime

                        if ($specDate -gt $xmlDate) {
                            Write-Host "  [SKIP] $($prog.Project) IDE $($prog.IDE) - spec is newer than XML" -ForegroundColor Gray
                            continue
                        }
                    }
                }
            }
        }
        $filtered += $prog
    }

    if ($filtered.Count -lt $programsToProcess.Count) {
        Write-Host "[INFO] Skipped $($programsToProcess.Count - $filtered.Count) programs (spec newer than XML)" -ForegroundColor Yellow
    }
    $programsToProcess = $filtered
}

if ($programsToProcess.Count -eq 0) {
    Write-Host "[INFO] All specs are up to date" -ForegroundColor Green
    exit 0
}

# ============================================================================
# DRY RUN: Show what would be done
# ============================================================================

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Would regenerate:" -ForegroundColor Magenta

    foreach ($prog in $programsToProcess) {
        $specFile = "$($prog.Project)-IDE-$($prog.IDE).md"
        Write-Host "  $($prog.Project) IDE $($prog.IDE) -> $specFile" -ForegroundColor White
    }

    if ($SyncToKb) {
        Write-Host ""
        Write-Host "[DRY RUN] Would sync $($programsToProcess.Count) specs to KB" -ForegroundColor Magenta
    }

    exit 0
}

# ============================================================================
# GENERATE SPECS
# ============================================================================

$generateScript = Join-Path $scriptDir "Generate-ProgramSpecV2.ps1"
$success = 0
$failed = 0
$errors = @()

Write-Host ""
Write-Host "Generating specs..." -ForegroundColor Yellow

foreach ($prog in $programsToProcess) {
    $label = "$($prog.Project) IDE $($prog.IDE)"
    Write-Host "  [$($success + $failed + 1)/$($programsToProcess.Count)] $label" -ForegroundColor Gray -NoNewline

    try {
        $null = & $generateScript -Project $prog.Project -IDE $prog.IDE -OutputPath $OutputPath 2>&1
        Write-Host " [OK]" -ForegroundColor Green
        $success++
    } catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        $failed++
        $errors += @{
            Program = $label
            Error = $_.Exception.Message
        }
    }
}

# ============================================================================
# SYNC TO KB (if requested)
# ============================================================================

if ($SyncToKb -and $success -gt 0) {
    Write-Host ""
    Write-Host "Syncing specs to Knowledge Base..." -ForegroundColor Yellow

    $syncScript = Join-Path $scriptDir "Sync-SpecsToKb.ps1"
    if (Test-Path $syncScript) {
        try {
            & $syncScript -SpecsPath $OutputPath
            Write-Host "[OK] KB sync completed" -ForegroundColor Green
        } catch {
            Write-Warning "KB sync failed: $_"
        }
    } else {
        Write-Warning "Sync script not found: $syncScript"
    }
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host "  $($e.Program): $($e.Error)" -ForegroundColor Red
    }
}

# Return exit code
if ($failed -gt 0) {
    exit 1
}
exit 0
