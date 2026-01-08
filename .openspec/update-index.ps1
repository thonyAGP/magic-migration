# OpenSpec Index Updater
# Scanne les dossiers et met a jour index.json

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Load existing index or create new
$indexPath = Join-Path $scriptDir "index.json"
if (Test-Path $indexPath) {
    $index = Get-Content $indexPath -Raw | ConvertFrom-Json
} else {
    $index = @{
        lastUpdated = (Get-Date).ToString("o")
        reports = @()
        tickets = @{ active = @(); archived = @() }
    }
}

# Scan reports folder
$reportsDir = Join-Path $scriptDir "reports"
$existingReportFiles = @()

if (Test-Path $reportsDir) {
    $reportFiles = Get-ChildItem $reportsDir -Filter "*.md"

    foreach ($file in $reportFiles) {
        $existingReportFiles += "reports/$($file.Name)"

        # Check if already in index
        $existing = $index.reports | Where-Object { $_.file -eq "reports/$($file.Name)" }

        if (-not $existing) {
            # Add new report
            $title = $file.BaseName -replace '_', ' ' -replace '-', ' '
            $newReport = @{
                id = $file.BaseName.ToLower()
                title = $title
                file = "reports/$($file.Name)"
                category = "reports"
            }
            $index.reports += $newReport
            Write-Host "[+] Nouveau rapport: $($file.Name)" -ForegroundColor Green
        }
    }
}

# Scan tickets folder
$ticketsDir = Join-Path $scriptDir "tickets"
$existingTicketIds = @()

if (Test-Path $ticketsDir) {
    $ticketFolders = Get-ChildItem $ticketsDir -Directory

    foreach ($folder in $ticketFolders) {
        $ticketId = $folder.Name
        $existingTicketIds += $ticketId

        # Determine main file (resolution > implementation > analysis > notes)
        $mainFile = $null
        foreach ($f in @("resolution.md", "implementation.md", "analysis.md", "notes.md")) {
            $testPath = Join-Path $folder.FullName $f
            if (Test-Path $testPath) {
                $mainFile = "tickets/$ticketId/$f"
                break
            }
        }

        if (-not $mainFile) { continue }

        # Check if in active or archived
        $inActive = $index.tickets.active | Where-Object { $_.id -eq $ticketId }
        $inArchived = $index.tickets.archived | Where-Object { $_.id -eq $ticketId }

        if (-not $inActive -and -not $inArchived) {
            # New ticket - add to active by default
            $newTicket = @{
                id = $ticketId
                title = "Nouveau ticket"
                status = "progress"
                file = $mainFile
            }
            $index.tickets.active += $newTicket
            Write-Host "[+] Nouveau ticket: $ticketId" -ForegroundColor Cyan
        }
    }
}

# Update timestamp
$index.lastUpdated = (Get-Date).ToString("o")

# Save index
$index | ConvertTo-Json -Depth 10 | Set-Content $indexPath -Encoding UTF8
Write-Host "`nIndex mis a jour: $indexPath" -ForegroundColor Yellow
Write-Host "  - $(($index.reports | Where-Object { $_.category -eq 'reports' }).Count) rapports"
Write-Host "  - $($index.tickets.active.Count) tickets actifs"
Write-Host "  - $($index.tickets.archived.Count) tickets archives"
