# Detect-ChangedPrograms.ps1
# Detects which Magic program XML files have changed since a reference point
# Returns list of programs that need spec regeneration

param(
    [ValidateSet("LastCommit", "LastTag", "Date", "Branch")]
    [string]$Since = "LastCommit",

    [string]$CompareRef = "",  # Git ref (commit, tag, branch)

    [string]$SinceDate = "",   # Date string for Date mode

    [string[]]$Projects = @("ADH", "PBP", "PBG", "PVE", "VIL", "REF"),

    [string]$SourcesPath = "D:\Data\Migration\XPA\PMS",

    [switch]$IncludeHeaders,   # Also detect ProgramHeaders.xml changes

    [switch]$OutputJson
)

$ErrorActionPreference = "Stop"

Write-Host "=== Detect Changed Programs ===" -ForegroundColor Cyan
Write-Host "Mode: $Since" -ForegroundColor Gray

# ============================================================================
# DETERMINE GIT COMPARE REFERENCE
# ============================================================================

$gitRef = ""

switch ($Since) {
    "LastCommit" {
        $gitRef = "HEAD~1"
    }
    "LastTag" {
        $lastTag = git -C $SourcesPath describe --tags --abbrev=0 2>$null
        if ($lastTag) {
            $gitRef = $lastTag
            Write-Host "Last tag: $lastTag" -ForegroundColor Gray
        } else {
            Write-Warning "No tags found, using HEAD~10"
            $gitRef = "HEAD~10"
        }
    }
    "Branch" {
        if (-not $CompareRef) {
            $CompareRef = "master"
        }
        $gitRef = $CompareRef
    }
    "Date" {
        if (-not $SinceDate) {
            $SinceDate = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
        }
        # Use git log to find commit at that date
        $commitAtDate = git -C $SourcesPath log --until=$SinceDate -1 --format=%H 2>$null
        if ($commitAtDate) {
            $gitRef = $commitAtDate
        } else {
            $gitRef = "HEAD~30"
        }
    }
}

if ($CompareRef -and $Since -ne "Branch") {
    $gitRef = $CompareRef
}

Write-Host "Comparing against: $gitRef" -ForegroundColor Yellow

# ============================================================================
# GET CHANGED FILES FROM GIT
# ============================================================================

$changedFiles = @()

try {
    $diffOutput = git -C $SourcesPath diff --name-only $gitRef HEAD 2>&1
    if ($LASTEXITCODE -eq 0) {
        $changedFiles = $diffOutput -split "`n" | Where-Object { $_ -match '\.xml$' }
    }
} catch {
    Write-Warning "Git diff failed: $_"
}

Write-Host "Found $($changedFiles.Count) changed XML files" -ForegroundColor Gray

# ============================================================================
# MAP CHANGED FILES TO PROGRAMS
# ============================================================================

$changedPrograms = @()
$changedHeaders = @()

foreach ($file in $changedFiles) {
    # Match Prg_XXX.xml files
    if ($file -match '([A-Z]+)/Source/Prg_(\d+)\.xml$') {
        $project = $Matches[1]
        $prgId = [int]$Matches[2]

        if ($project -in $Projects) {
            # Find IDE position for this Prg_XXX.xml
            $progsXml = "$SourcesPath\$project\Source\Progs.xml"
            if (Test-Path $progsXml) {
                [xml]$progs = Get-Content $progsXml -Encoding UTF8
                $programs = $progs.Application.ProgramsRepositoryOutLine.Programs.Program

                for ($i = 0; $i -lt $programs.Count; $i++) {
                    if ([int]$programs[$i].id -eq $prgId) {
                        $idePosition = $i + 1  # 1-indexed
                        $changedPrograms += @{
                            Project = $project
                            IDE = $idePosition
                            PrgId = $prgId
                            File = $file
                        }
                        break
                    }
                }
            }
        }
    }
    # Match ProgramHeaders.xml
    elseif ($IncludeHeaders -and $file -match '([A-Z]+)/Source/ProgramHeaders\.xml$') {
        $project = $Matches[1]
        if ($project -in $Projects) {
            $changedHeaders += $project
        }
    }
}

# ============================================================================
# OUTPUT RESULTS
# ============================================================================

Write-Host ""
Write-Host "=== Changed Programs ===" -ForegroundColor Cyan

if ($changedPrograms.Count -eq 0) {
    Write-Host "[INFO] No program changes detected" -ForegroundColor Yellow
} else {
    foreach ($prog in $changedPrograms) {
        Write-Host "  $($prog.Project) IDE $($prog.IDE) (Prg_$($prog.PrgId).xml)" -ForegroundColor Green
    }
}

if ($changedHeaders.Count -gt 0) {
    Write-Host ""
    Write-Host "[INFO] ProgramHeaders changed for: $($changedHeaders -join ', ')" -ForegroundColor Yellow
    Write-Host "       Consider full regeneration for these projects" -ForegroundColor Gray
}

# Output JSON if requested
if ($OutputJson) {
    $result = @{
        CompareRef = $gitRef
        DetectedAt = (Get-Date).ToString("o")
        ChangedPrograms = $changedPrograms
        ChangedHeaders = $changedHeaders
        TotalChanged = $changedPrograms.Count
    }
    $result | ConvertTo-Json -Depth 5
}

# Return programs for piping
return $changedPrograms
