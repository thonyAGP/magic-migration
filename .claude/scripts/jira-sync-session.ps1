# Jira Session Sync - Lightweight sync for SessionStart hook
# Fetches ticket statuses, detects newly resolved, alerts for missing patterns

param(
    [switch]$Silent,
    [int]$TimeoutSeconds = 10
)

$ErrorActionPreference = "SilentlyContinue"

# Paths
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envFile = Join-Path $projectRoot ".env"
$indexFile = Join-Path $projectRoot ".openspec\tickets\index.json"
$patternsDir = Join-Path $projectRoot ".openspec\patterns"
$kbPath = Join-Path $env:USERPROFILE ".magic-kb\knowledge.db"

# Colors
function Write-C { param($Text, $Color = "White") Write-Host $Text -ForegroundColor $Color -NoNewline }
function Write-CL { param($Text, $Color = "White") Write-Host $Text -ForegroundColor $Color }

# Load .env credentials
if (-not (Test-Path $envFile)) {
    if (-not $Silent) { Write-CL "[JIRA] .env not found - skipping sync" "Yellow" }
    exit 0
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

$email = $env:JIRA_EMAIL
$token = $env:JIRA_TOKEN
$baseUrl = $env:JIRA_BASE_URL

if (-not $email -or -not $token -or -not $baseUrl) {
    if (-not $Silent) { Write-CL "[JIRA] Missing credentials - skipping sync" "Yellow" }
    exit 0
}

# Load local index
$index = if (Test-Path $indexFile) {
    Get-Content $indexFile -Raw | ConvertFrom-Json
} else {
    @{ lastSync = $null; tickets = @(); localTickets = @() }
}

$lastSync = if ($index.lastSync) { [DateTime]::Parse($index.lastSync) } else { [DateTime]::MinValue }

# Get known ticket keys from local folders
$ticketFolders = Get-ChildItem (Join-Path $projectRoot ".openspec\tickets") -Directory |
    Where-Object { $_.Name -match "^(CMDS|PMS)-\d+$" } |
    Select-Object -ExpandProperty Name

if ($ticketFolders.Count -eq 0) {
    if (-not $Silent) { Write-CL "[JIRA] No tickets to sync" "Gray" }
    exit 0
}

# Prepare API call
$cred = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${email}:${token}"))
$headers = @{ Authorization = "Basic $cred" }

# Fetch each ticket status (faster than JQL search which returns 410)
$jiraTickets = @{}
$fetchErrors = 0

foreach ($key in $ticketFolders) {
    if ($key -eq "TEMPLATE" -or $key -eq "TEST-001") { continue }

    $url = "$baseUrl/rest/api/3/issue/$key`?fields=key,summary,status,resolution,resolutiondate"
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        $jiraTickets[$key] = @{
            Key = $response.key
            Summary = $response.fields.summary
            Status = $response.fields.status.name
            Resolution = if ($response.fields.resolution) { $response.fields.resolution.name } else { $null }
            ResolvedDate = if ($response.fields.resolutiondate) {
                [DateTime]::Parse($response.fields.resolutiondate.Substring(0, 10))
            } else { $null }
        }
    } catch {
        $fetchErrors++
    }
}

if ($jiraTickets.Count -eq 0) {
    if (-not $Silent) { Write-CL "[JIRA] API unreachable - using cache" "Yellow" }
    exit 0
}

# Load existing patterns from KB or files
$existingPatterns = @{}
if (Test-Path $patternsDir) {
    Get-ChildItem $patternsDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        if ($content -match "\*{0,2}Source\*{0,2}[:\s]+([A-Z]+-\d+)") {
            $existingPatterns[$matches[1]] = $_.BaseName
        }
    }
}

# Analyze results
$resolved = @()
$newlyResolved = @()
$missingPatterns = @()

foreach ($key in $jiraTickets.Keys) {
    $ticket = $jiraTickets[$key]

    # Check if resolved
    $isResolved = $ticket.Resolution -ne $null -or $ticket.Status -match "Recette OK|Ferme|Done|Resolved|Closed|Termine"

    if ($isResolved) {
        $resolved += $ticket

        # Check if resolved after last sync
        if ($ticket.ResolvedDate -and $ticket.ResolvedDate -gt $lastSync) {
            $newlyResolved += $ticket
        }

        # Check if pattern exists
        if (-not $existingPatterns.ContainsKey($key)) {
            $missingPatterns += $ticket
        }
    }
}

# Output
if (-not $Silent) {
    Write-Host ""
    Write-CL "=== JIRA SYNC ===" "Cyan"

    if ($fetchErrors -gt 0) {
        Write-C "[!] " "Yellow"; Write-CL "$fetchErrors ticket(s) inaccessible(s)" "Yellow"
    }

    Write-C "[OK] " "Green"; Write-CL "$($jiraTickets.Count) tickets synchronises" "White"

    # Newly resolved
    if ($newlyResolved.Count -gt 0) {
        Write-Host ""
        Write-CL "NOUVEAUX RESOLUS (depuis $($lastSync.ToString('yyyy-MM-dd'))):" "Green"
        foreach ($t in $newlyResolved) {
            $patternInfo = if ($existingPatterns.ContainsKey($t.Key)) {
                "Pattern: $($existingPatterns[$t.Key])"
            } else {
                "Pattern: -"
            }
            Write-C "  + " "Green"
            Write-C "$($t.Key)" "White"
            Write-C " ($($t.Status)) " "Gray"
            Write-CL "- $patternInfo" "Gray"
        }
    }

    # Missing patterns alert
    if ($missingPatterns.Count -gt 0) {
        Write-Host ""
        Write-CL "[!] PATTERNS A CAPITALISER:" "Yellow"
        foreach ($t in $missingPatterns) {
            $shortSummary = if ($t.Summary.Length -gt 40) { $t.Summary.Substring(0, 40) + "..." } else { $t.Summary }
            Write-C "  - " "Yellow"
            Write-C "$($t.Key)" "White"
            Write-C ": $shortSummary" "Gray"
            Write-CL " - /ticket-learn $($t.Key)" "Cyan"
        }
    }

    # Stats
    $coverage = if ($resolved.Count -gt 0) {
        [Math]::Round(($resolved.Count - $missingPatterns.Count) / $resolved.Count * 100)
    } else { 0 }

    Write-Host ""
    Write-C "Stats: " "Gray"
    Write-C "$($resolved.Count) resolus" "White"
    Write-C " | " "Gray"
    Write-C "$($existingPatterns.Count) patterns" "White"
    Write-C " | " "Gray"
    $coverageColor = if ($coverage -ge 70) { "Green" } elseif ($coverage -ge 50) { "Yellow" } else { "Red" }
    Write-CL "$coverage% couverture" $coverageColor

    Write-CL "=== FIN SYNC ===" "Cyan"
    Write-Host ""
}

# Update index.json with new sync timestamp
$index.lastSync = [DateTime]::Now.ToString("o")
$index.lastJiraSync = [DateTime]::Now.ToString("o")

# Update ticket statuses in index
$updatedTickets = @()
foreach ($localTicket in $index.localTickets) {
    if ($jiraTickets.ContainsKey($localTicket.key)) {
        $jt = $jiraTickets[$localTicket.key]
        $localTicket.status = $jt.Status.ToLower() -replace " ", "-"
        $localTicket.jiraStatus = $jt.Status
        $localTicket.resolution = $jt.Resolution
        $localTicket.resolvedDate = if ($jt.ResolvedDate) { $jt.ResolvedDate.ToString("yyyy-MM-dd") } else { $null }
    }
    $updatedTickets += $localTicket
}
$index.localTickets = $updatedTickets

# Save updated index
$index | ConvertTo-Json -Depth 10 | Set-Content $indexFile -Encoding UTF8

exit 0
