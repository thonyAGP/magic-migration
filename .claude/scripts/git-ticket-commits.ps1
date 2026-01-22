# git-ticket-commits.ps1
# Synchronise les commits Git pour les tickets dans index.json
# Usage: powershell -File git-ticket-commits.ps1 [-TicketKey PMS-1412] [-UpdateIndex]

param(
    [string]$TicketKey = "",       # Ticket specifique ou vide pour tous
    [switch]$UpdateIndex,          # Mettre a jour index.json
    [switch]$Verbose               # Afficher les details
)

$ErrorActionPreference = "Stop"
# Get project root (two levels up from .claude/scripts/)
$ScriptDir = $PSScriptRoot
if (-not $ScriptDir) { $ScriptDir = Get-Location }
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$IndexPath = Join-Path $ProjectRoot ".openspec\index.json"

Write-Host "=== Git Ticket Commits Sync ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot" -ForegroundColor Gray

function Get-TicketCommits {
    param(
        [string]$TicketId
    )

    $ticketDir = ".openspec/tickets/$TicketId"

    # Get commits that modified files in this ticket's directory
    $gitLog = git -C $ProjectRoot log --all --format="%H|%aI|%s|%an" -- $ticketDir 2>$null

    if (-not $gitLog) {
        # Fallback: search by ticket ID in commit messages
        $gitLog = git -C $ProjectRoot log --all --grep="$TicketId" --format="%H|%aI|%s|%an" 2>$null
    }

    $commits = @()

    foreach ($line in $gitLog) {
        if ($line -match "^([a-f0-9]+)\|(.+)\|(.+)\|(.+)$") {
            $hash = $matches[1]
            $date = $matches[2]
            $message = $matches[3]
            $author = $matches[4]

            # Get files changed in this commit for this ticket
            $files = git -C $ProjectRoot show --name-only --format="" $hash -- $ticketDir 2>$null |
                Where-Object { $_ -ne "" }

            $commits += @{
                hash = $hash
                date = $date
                message = $message
                author = $author
                files = @($files)
            }
        }
    }

    return $commits
}

function Update-IndexWithCommits {
    param(
        [string]$TicketId,
        [array]$Commits
    )

    $index = Get-Content $IndexPath -Raw | ConvertFrom-Json

    # Find ticket in active or archived
    $ticket = $index.tickets.active | Where-Object { $_.id -eq $TicketId }
    if (-not $ticket) {
        $ticket = $index.tickets.archived | Where-Object { $_.id -eq $TicketId }
    }

    if ($ticket) {
        # Only add commits if we found some
        if ($Commits -and $Commits.Count -gt 0) {
            # Add commits array to ticket
            $ticket | Add-Member -NotePropertyName "commits" -NotePropertyValue $Commits -Force

            # Update lastAnalysisTime to most recent commit date
            $latestCommit = $Commits | Sort-Object { [datetime]$_.date } -Descending | Select-Object -First 1
            if ($latestCommit -and $latestCommit.date) {
                $ticket | Add-Member -NotePropertyName "lastAnalysisTime" -NotePropertyValue $latestCommit.date -Force
            }
        }
    }

    # Update lastUpdated
    $index.lastUpdated = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

    # Save
    $index | ConvertTo-Json -Depth 10 | Set-Content $IndexPath -Encoding UTF8
    Write-Host "[OK] Index updated for $TicketId" -ForegroundColor Green
}

# Main logic
try {
    $index = Get-Content $IndexPath -Raw | ConvertFrom-Json
    $allTickets = @($index.tickets.active) + @($index.tickets.archived)

    if ($TicketKey) {
        # Single ticket
        $tickets = $allTickets | Where-Object { $_.id -eq $TicketKey }
    } else {
        # All tickets
        $tickets = $allTickets
    }

    Write-Host "Processing $($tickets.Count) ticket(s)..." -ForegroundColor Yellow

    foreach ($ticket in $tickets) {
        $ticketId = $ticket.id
        Write-Host "`n[$ticketId]" -ForegroundColor Cyan

        $commits = Get-TicketCommits -TicketId $ticketId

        Write-Host "  Found $($commits.Count) commit(s)" -ForegroundColor Gray

        if ($Verbose -and $commits.Count -gt 0) {
            foreach ($c in $commits[0..([Math]::Min(2, $commits.Count - 1))]) {
                $shortHash = $c.hash.Substring(0, 7)
                Write-Host "    $shortHash | $($c.message)" -ForegroundColor DarkGray
            }
            if ($commits.Count -gt 3) {
                Write-Host "    ... and $($commits.Count - 3) more" -ForegroundColor DarkGray
            }
        }

        if ($UpdateIndex) {
            Update-IndexWithCommits -TicketId $ticketId -Commits $commits
        }
    }

    Write-Host "`n=== Done ===" -ForegroundColor Green

    if (-not $UpdateIndex) {
        Write-Host "Use -UpdateIndex to save commits to index.json" -ForegroundColor Yellow
    }

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
