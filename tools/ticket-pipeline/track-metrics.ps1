# track-metrics.ps1
# Track ticket analysis metrics in the Knowledge Base
# Usage:
#   Start:  .\track-metrics.ps1 -TicketKey "PMS-1234" -Action Start
#   Update: .\track-metrics.ps1 -TicketKey "PMS-1234" -Action Update -Phases 4 -Programs 5 -Expressions 10
#   Complete: .\track-metrics.ps1 -TicketKey "PMS-1234" -Action Complete -Pattern "date-format"
#   Report: .\track-metrics.ps1 -Action Report

param(
    [Parameter(Mandatory=$false)]
    [string]$TicketKey,

    [Parameter(Mandatory=$true)]
    [ValidateSet("Start", "Update", "Complete", "Report", "RecordPatternUsage")]
    [string]$Action,

    [int]$Phases = 0,
    [int]$Programs = 0,
    [int]$Expressions = 0,
    [string]$Pattern = $null,
    [switch]$Success
)

$ErrorActionPreference = "Stop"
$KbPath = Join-Path $env:USERPROFILE ".magic-kb\knowledge.db"

# ============================================================================
# FONCTIONS
# ============================================================================

function Get-TicketProject {
    param([string]$TicketKey)

    if ($TicketKey -match '^CMDS-') { return "CMDS" }
    if ($TicketKey -match '^PMS-') { return "PMS" }
    return $null
}

function Execute-Sql {
    param(
        [string]$KbPath,
        [string]$Sql
    )

    $TempFile = [System.IO.Path]::GetTempFileName()
    $Sql | Set-Content $TempFile -Encoding UTF8

    try {
        $Result = & sqlite3 $KbPath ".read '$TempFile'" 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "SQLite error: $Result"
        }
        return $Result
    } finally {
        Remove-Item $TempFile -ErrorAction SilentlyContinue
    }
}

function Query-Sql {
    param(
        [string]$KbPath,
        [string]$Sql
    )

    $Result = & sqlite3 -separator "|" $KbPath $Sql 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "SQLite error: $Result"
    }
    return $Result
}

function Start-Tracking {
    param(
        [string]$TicketKey,
        [string]$KbPath
    )

    $Project = Get-TicketProject -TicketKey $TicketKey
    $Now = (Get-Date).ToString("o")

    $Sql = @"
INSERT INTO ticket_metrics (ticket_key, project, started_at, phases_completed, programs_analyzed, expressions_decoded, success)
VALUES ('$TicketKey', '$Project', '$Now', 0, 0, 0, 0)
ON CONFLICT(ticket_key) DO UPDATE SET
    started_at = COALESCE(ticket_metrics.started_at, '$Now'),
    phases_completed = 0,
    programs_analyzed = 0,
    expressions_decoded = 0;
"@

    Execute-Sql -KbPath $KbPath -Sql $Sql
    Write-Host "[OK] Started tracking for $TicketKey" -ForegroundColor Green
}

function Update-Tracking {
    param(
        [string]$TicketKey,
        [string]$KbPath,
        [int]$Phases,
        [int]$Programs,
        [int]$Expressions
    )

    $Sql = @"
UPDATE ticket_metrics SET
    phases_completed = $Phases,
    programs_analyzed = programs_analyzed + $Programs,
    expressions_decoded = expressions_decoded + $Expressions
WHERE ticket_key = '$TicketKey';
"@

    Execute-Sql -KbPath $KbPath -Sql $Sql
    Write-Host "[OK] Updated metrics for $TicketKey (Phases: $Phases, +$Programs progs, +$Expressions exprs)" -ForegroundColor Green
}

function Complete-Tracking {
    param(
        [string]$TicketKey,
        [string]$KbPath,
        [string]$Pattern,
        [bool]$Success
    )

    $Now = (Get-Date).ToString("o")
    $SuccessInt = if ($Success) { 1 } else { 0 }
    $PatternSql = if ($Pattern) { "'$Pattern'" } else { "NULL" }

    # Calculate resolution time
    $Sql = @"
UPDATE ticket_metrics SET
    completed_at = '$Now',
    pattern_matched = $PatternSql,
    success = $SuccessInt,
    resolution_time_minutes = CAST((julianday('$Now') - julianday(started_at)) * 24 * 60 AS INTEGER)
WHERE ticket_key = '$TicketKey';
"@

    Execute-Sql -KbPath $KbPath -Sql $Sql
    Write-Host "[OK] Completed tracking for $TicketKey (Success: $Success, Pattern: $Pattern)" -ForegroundColor Green
}

function Show-Report {
    param([string]$KbPath)

    Write-Host ""
    Write-Host "=== Ticket Analysis Metrics Report ===" -ForegroundColor Cyan
    Write-Host ""

    # Summary stats
    $TotalQuery = "SELECT COUNT(*), SUM(success), AVG(resolution_time_minutes) FROM ticket_metrics WHERE completed_at IS NOT NULL;"
    $TotalResult = Query-Sql -KbPath $KbPath -Sql $TotalQuery

    if ($TotalResult) {
        $Parts = $TotalResult -split '\|'
        $Total = [int]$Parts[0]
        $Resolved = [int]$Parts[1]
        $AvgTime = [math]::Round([double]$Parts[2], 1)

        Write-Host "Summary:" -ForegroundColor Yellow
        Write-Host "  Total completed: $Total" -ForegroundColor White
        Write-Host "  Successfully resolved: $Resolved ($([math]::Round($Resolved / [math]::Max(1, $Total) * 100, 1))%)" -ForegroundColor White
        Write-Host "  Avg resolution time: $AvgTime min" -ForegroundColor White
    }

    # By project
    Write-Host ""
    Write-Host "By Project:" -ForegroundColor Yellow
    $ProjectQuery = "SELECT project, COUNT(*), SUM(success) FROM ticket_metrics GROUP BY project;"
    $ProjectResult = Query-Sql -KbPath $KbPath -Sql $ProjectQuery

    foreach ($Line in $ProjectResult) {
        if ($Line) {
            $Parts = $Line -split '\|'
            $Project = $Parts[0]
            $Count = $Parts[1]
            $Success = $Parts[2]
            Write-Host "  $Project : $Count tickets ($Success resolved)" -ForegroundColor White
        }
    }

    # Top patterns
    Write-Host ""
    Write-Host "Top Patterns:" -ForegroundColor Yellow
    $PatternQuery = "SELECT pattern_matched, COUNT(*) as cnt FROM ticket_metrics WHERE pattern_matched IS NOT NULL GROUP BY pattern_matched ORDER BY cnt DESC LIMIT 5;"
    $PatternResult = Query-Sql -KbPath $KbPath -Sql $PatternQuery

    foreach ($Line in $PatternResult) {
        if ($Line) {
            $Parts = $Line -split '\|'
            $Pattern = $Parts[0]
            $Count = $Parts[1]
            Write-Host "  $Pattern : $Count times" -ForegroundColor White
        }
    }

    # Recent tickets
    Write-Host ""
    Write-Host "Recent Tickets (last 10):" -ForegroundColor Yellow
    $RecentQuery = @"
SELECT ticket_key, phases_completed, success,
       COALESCE(resolution_time_minutes, 0) as time,
       COALESCE(pattern_matched, '-') as pattern
FROM ticket_metrics
ORDER BY COALESCE(completed_at, started_at) DESC
LIMIT 10;
"@
    $RecentResult = Query-Sql -KbPath $KbPath -Sql $RecentQuery

    Write-Host "  Ticket          Phases  Status  Time   Pattern" -ForegroundColor Gray
    Write-Host "  --------------  ------  ------  -----  -------" -ForegroundColor Gray

    foreach ($Line in $RecentResult) {
        if ($Line) {
            $Parts = $Line -split '\|'
            $Ticket = $Parts[0].PadRight(14)
            $Phases = "$($Parts[1])/6".PadRight(6)
            $Status = if ($Parts[2] -eq "1") { "OK".PadRight(6) } else { "OPEN".PadRight(6) }
            $Time = "$($Parts[3])m".PadRight(5)
            $Pattern = $Parts[4]
            $StatusColor = if ($Parts[2] -eq "1") { "Green" } else { "Yellow" }
            Write-Host "  $Ticket  $Phases  " -NoNewline
            Write-Host $Status -ForegroundColor $StatusColor -NoNewline
            Write-Host "  $Time  $Pattern"
        }
    }

    Write-Host ""
}

function Record-PatternUsage {
    param(
        [string]$TicketKey,
        [string]$KbPath,
        [string]$Pattern
    )

    if (-not $Pattern) {
        Write-Warning "[PatternUsage] No pattern specified"
        return
    }

    # 1. Update ticket_metrics with the matched pattern
    $Sql1 = @"
UPDATE ticket_metrics SET
    pattern_matched = '$Pattern'
WHERE ticket_key = '$TicketKey';
"@
    Execute-Sql -KbPath $KbPath -Sql $Sql1

    # 2. Increment usage_count in resolution_patterns and update last_used_at
    $Now = (Get-Date).ToString("o")
    $Sql2 = @"
UPDATE resolution_patterns SET
    usage_count = usage_count + 1,
    last_used_at = '$Now'
WHERE pattern_name = '$Pattern';
"@
    Execute-Sql -KbPath $KbPath -Sql $Sql2

    # 3. Check if pattern exists in KB
    $CheckQuery = "SELECT usage_count FROM resolution_patterns WHERE pattern_name = '$Pattern';"
    $CheckResult = Query-Sql -KbPath $KbPath -Sql $CheckQuery

    if ($CheckResult) {
        Write-Host "[OK] Pattern '$Pattern' linked to $TicketKey (usage: $CheckResult)" -ForegroundColor Cyan
    } else {
        Write-Host "[WARN] Pattern '$Pattern' not found in KB - ticket linked but no pattern incremented" -ForegroundColor Yellow
        Write-Host "       Consider running: /ticket-learn $TicketKey to capitalize this pattern" -ForegroundColor Gray
    }
}

# ============================================================================
# MAIN
# ============================================================================

# Verifier KB
if (-not (Test-Path $KbPath)) {
    Write-Error "Knowledge Base not found: $KbPath"
    exit 1
}

switch ($Action) {
    "Start" {
        if (-not $TicketKey) {
            Write-Error "TicketKey is required for Start action"
            exit 1
        }
        Start-Tracking -TicketKey $TicketKey -KbPath $KbPath
    }
    "Update" {
        if (-not $TicketKey) {
            Write-Error "TicketKey is required for Update action"
            exit 1
        }
        Update-Tracking -TicketKey $TicketKey -KbPath $KbPath -Phases $Phases -Programs $Programs -Expressions $Expressions
    }
    "Complete" {
        if (-not $TicketKey) {
            Write-Error "TicketKey is required for Complete action"
            exit 1
        }
        Complete-Tracking -TicketKey $TicketKey -KbPath $KbPath -Pattern $Pattern -Success $Success.IsPresent
    }
    "Report" {
        Show-Report -KbPath $KbPath
    }
    "RecordPatternUsage" {
        if (-not $TicketKey) {
            Write-Error "TicketKey is required for RecordPatternUsage action"
            exit 1
        }
        if (-not $Pattern) {
            Write-Error "Pattern is required for RecordPatternUsage action"
            exit 1
        }
        Record-PatternUsage -TicketKey $TicketKey -KbPath $KbPath -Pattern $Pattern
    }
}
