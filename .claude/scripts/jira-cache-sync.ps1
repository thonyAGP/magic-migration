param(
    [switch]$Silent,
    [switch]$Force
)

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ticketsDir = Join-Path $projectRoot ".openspec\tickets"
$cacheFile = Join-Path $ticketsDir "index.json"
$scriptsDir = $PSScriptRoot

# Create tickets directory if needed
if (-not (Test-Path $ticketsDir)) {
    New-Item -ItemType Directory -Path $ticketsDir -Force | Out-Null
}

# Load existing cache
$cache = @{
    lastSync = $null
    tickets = @()
    localTickets = @()
}

if (Test-Path $cacheFile) {
    try {
        $existing = Get-Content $cacheFile -Raw | ConvertFrom-Json
        if ($existing.localTickets) {
            $cache.localTickets = @($existing.localTickets)
        }
    } catch {
        Write-Warning "Could not parse existing cache, starting fresh"
    }
}

# Check if sync is needed (unless forced)
if (-not $Force -and $cache.lastSync) {
    try {
        $lastSync = [DateTime]::Parse($cache.lastSync)
        if ((Get-Date) - $lastSync -lt [TimeSpan]::FromHours(1)) {
            if (-not $Silent) {
                Write-Host "[Cache] Still fresh (synced $($lastSync.ToString('HH:mm')))"
            }
            exit 0
        }
    } catch {
        # Invalid date, continue with sync
    }
}

if (-not $Silent) {
    Write-Host "[Sync] Fetching active tickets from Jira..."
}

# Fetch active tickets from Jira
$listScript = Join-Path $scriptsDir "jira-list-active.ps1"
try {
    $ticketsJson = & $listScript -Projects @("CMDS", "PMS")
    $jiraTickets = $ticketsJson | ConvertFrom-Json
} catch {
    Write-Warning "Failed to fetch from Jira: $($_.Exception.Message)"
    $jiraTickets = @()
}

# Build tickets array with local data detection
$cache.tickets = @()
foreach ($t in $jiraTickets) {
    $ticketDir = Join-Path $ticketsDir $t.key
    $hasLocal = Test-Path $ticketDir

    $cache.tickets += @{
        key = $t.key
        summary = $t.summary
        status = $t.status
        assignee = $t.assignee
        priority = $t.priority
        updated = $t.updated
        hasLocalData = $hasLocal
    }
}

# Detect local-only tickets (folders without active Jira ticket)
$localDirs = Get-ChildItem -Path $ticketsDir -Directory -ErrorAction SilentlyContinue
$activeKeys = $cache.tickets | ForEach-Object { $_.key }

$cache.localTickets = @()
foreach ($dir in $localDirs) {
    $key = $dir.Name
    if ($key -match "^(CMDS|PMS)-\d+$") {
        if ($key -notin $activeKeys) {
            # Check if it has analysis.md
            $analysisFile = Join-Path $dir.FullName "analysis.md"
            $summary = "Local ticket"
            if (Test-Path $analysisFile) {
                # Try to extract title from first line
                $firstLine = Get-Content $analysisFile -TotalCount 1 -ErrorAction SilentlyContinue
                if ($firstLine -match "^#\s*(.+)$") {
                    $summary = $matches[1] -replace "Analyse\s+(Bug\s+)?", ""
                }
            }

            $cache.localTickets += @{
                key = $key
                status = "local-only"
                hasLocalData = $true
                summary = $summary
            }
        }
    }
}

$cache.lastSync = (Get-Date).ToString("o")

# Save cache
$cache | ConvertTo-Json -Depth 10 | Out-File $cacheFile -Encoding UTF8

if (-not $Silent) {
    $activeCount = $cache.tickets.Count
    $localCount = $cache.localTickets.Count
    Write-Host "[Sync] $activeCount active tickets, $localCount local-only"
}
