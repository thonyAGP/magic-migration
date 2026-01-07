# Ticket Menu - Displayed at session start
# Shows active Jira tickets and available actions

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ticketsDir = Join-Path $projectRoot ".openspec\tickets"
$cacheFile = Join-Path $ticketsDir "index.json"
$scriptsDir = $PSScriptRoot

# Sync cache if needed (silent, will use cached if fresh)
$syncScript = Join-Path $scriptsDir "jira-cache-sync.ps1"
if (Test-Path $syncScript) {
    try {
        & $syncScript -Silent
    } catch {
        Write-Host "[WARN] Could not sync with Jira" -ForegroundColor Yellow
    }
}

# Load cache
$cache = $null
if (Test-Path $cacheFile) {
    try {
        $cache = Get-Content $cacheFile -Raw | ConvertFrom-Json
    } catch {
        Write-Host "[WARN] Could not load ticket cache" -ForegroundColor Yellow
    }
}

# Display menu
Write-Host ""
Write-Host "=== TICKETS JIRA ACTIFS ===" -ForegroundColor Cyan
Write-Host ""

$idx = 1
$ticketMap = @{}

# Active tickets from Jira
if ($cache -and $cache.tickets -and $cache.tickets.Count -gt 0) {
    foreach ($project in @("CMDS", "PMS")) {
        $tickets = $cache.tickets | Where-Object { $_.key -like "$project-*" }
        if ($tickets -and $tickets.Count -gt 0) {
            Write-Host "--- $project ---" -ForegroundColor Yellow
            foreach ($t in $tickets) {
                $status = ($t.status).PadRight(15)
                $summaryTrunc = if ($t.summary.Length -gt 45) { $t.summary.Substring(0, 45) + "..." } else { $t.summary }
                $localMarker = if ($t.hasLocalData) { "[*]" } else { "   " }
                Write-Host "  [$idx] $localMarker $($t.key) - $status - $summaryTrunc"
                $ticketMap[$idx] = $t.key
                $idx++
            }
            Write-Host ""
        }
    }
} else {
    Write-Host "  (Aucun ticket actif ou cache vide)" -ForegroundColor DarkGray
    Write-Host ""
}

# Local-only tickets
if ($cache -and $cache.localTickets -and $cache.localTickets.Count -gt 0) {
    Write-Host "--- LOCAL (fermes/archives) ---" -ForegroundColor DarkYellow
    foreach ($t in $cache.localTickets) {
        $summaryTrunc = if ($t.summary.Length -gt 45) { $t.summary.Substring(0, 45) + "..." } else { $t.summary }
        Write-Host "  [$idx] [L] $($t.key) - local-only     - $summaryTrunc" -ForegroundColor DarkGray
        $ticketMap[$idx] = $t.key
        $idx++
    }
    Write-Host ""
}

# Actions
Write-Host "--- ACTIONS ---" -ForegroundColor Green
Write-Host "  [N] Nouveau ticket (saisir cle CMDS-XXXXX ou PMS-XXXXX)"
Write-Host "  [M] Outils MCP Magic (/magic-tree, /magic-analyze, etc.)"
Write-Host "  [S] Skills et agents disponibles"
Write-Host "  [R] Rafraichir la liste (sync Jira)"
Write-Host "  [Q] Continuer sans selection"
Write-Host ""

# Sync info
if ($cache -and $cache.lastSync) {
    try {
        $syncTime = [DateTime]::Parse($cache.lastSync)
        Write-Host "[Sync: $($syncTime.ToString('dd/MM HH:mm'))]" -ForegroundColor DarkGray
    } catch {}
}

Write-Host "=== FIN MENU TICKETS ===" -ForegroundColor Cyan
Write-Host ""

# Legend
Write-Host "Legende: [*] = donnees locales, [L] = local uniquement" -ForegroundColor DarkGray
Write-Host ""
