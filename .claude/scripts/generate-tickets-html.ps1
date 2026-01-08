# Generate tickets.html from .openspec/tickets/ folders
# Called by PostToolUse hook when ticket files are modified

param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ticketsDir = Join-Path $ProjectRoot ".openspec\tickets"
$outputFile = Join-Path $ProjectRoot "tickets.html"

if (-not (Test-Path $ticketsDir)) {
    Write-Host "[tickets-html] No tickets directory found"
    exit 0
}

# Collect ticket data
$tickets = @()
$ticketFolders = Get-ChildItem -Path $ticketsDir -Directory -ErrorAction SilentlyContinue

foreach ($folder in $ticketFolders) {
    $key = $folder.Name
    $resolutionFile = Join-Path $folder.FullName "resolution.md"
    $analysisFile = Join-Path $folder.FullName "analysis.md"

    $ticket = @{
        Key = $key
        Status = "EN COURS"
        StatusClass = "status-progress"
        Title = $key
        Village = ""
        Date = (Get-Date).ToString("yyyy-MM-dd")
        Module = ""
        Description = ""
        Programs = @()
        Cause = ""
        JiraUrl = "https://clubmed.atlassian.net/browse/$key"
        HasResolution = Test-Path $resolutionFile
        HasAnalysis = Test-Path $analysisFile
        HasImplementation = Test-Path (Join-Path $folder.FullName "implementation.md")
        HasAttachments = (Test-Path (Join-Path $folder.FullName "attachments")) -and ((Get-ChildItem (Join-Path $folder.FullName "attachments") -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0)
    }

    # Parse resolution.md for status and cause
    if (Test-Path $resolutionFile) {
        $content = Get-Content $resolutionFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue

        # Detect status
        if ($content -match "DIAGNOSTIC|Diagnostic") {
            $ticket.Status = "DIAGNOSTIC"
            $ticket.StatusClass = "status-diagnostic"
        }
        if ($content -match "SPEC COMPLETE|Specification|SPECIFICATION") {
            $ticket.Status = "SPEC"
            $ticket.StatusClass = "status-spec"
        }
        if ($content -match "R.SOLU|RESOLVED|COMPLETE|TERMIN|CLOSED|FERM") {
            $ticket.Status = "RESOLU"
            $ticket.StatusClass = "status-resolved"
        }

        # Extract cause
        if ($content -match "(?:Cause racine|Cause identifiee|Cause|Solution).*?[:\*]+\s*(.+?)(?:\r?\n|$)") {
            $ticket.Cause = $matches[1].Trim()
        }
    }

    # Parse analysis.md for details
    if (Test-Path $analysisFile) {
        $content = Get-Content $analysisFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue

        # Extract title from first # heading
        if ($content -match "^#\s+.+?(\d{6})\s*$" -or $content -match "^#\s+Analyse\s+(\S+)") {
            # Keep as is
        }

        # Extract village
        if ($content -match "Village.*?\|\s*(.+?)\s*\|") {
            $ticket.Village = $matches[1].Trim()
        }

        # Extract date
        if ($content -match "Date.*?\|\s*(\d{4}-\d{2}-\d{2})\s*\|") {
            $ticket.Date = $matches[1]
        }

        # Extract module
        if ($content -match "Module.*?\*\*(\w+)\*\*|Module concerne.*?\*\*(\w+)\*\*") {
            $ticket.Module = if ($matches[1]) { $matches[1] } else { $matches[2] }
        }

        # Extract symptom/description
        if ($content -match "## Symptome\s*\r?\n\r?\n(.+?)(?:\r?\n\r?\n|\r?\n##)") {
            $desc = $matches[1] -replace '\*\*', '' -replace '\r?\n', ' '
            if ($desc.Length -gt 200) { $desc = $desc.Substring(0, 200) + "..." }
            $ticket.Description = $desc.Trim()
        }

        # Extract programs
        $progs = [regex]::Matches($content, "Prg_(\d+)\s*\(([^)]+)\)|Prg_(\d+)")
        $progList = @()
        foreach ($match in $progs) {
            if ($match.Groups[1].Value -and $match.Groups[2].Value) {
                $progList += "Prg_$($match.Groups[1].Value) ($($match.Groups[2].Value))"
            } elseif ($match.Groups[3].Value) {
                $progList += "Prg_$($match.Groups[3].Value)"
            }
        }
        $ticket.Programs = $progList | Select-Object -Unique | Select-Object -First 4
    }

    # Fallback title based on key prefix
    if ($key -match "^CMDS") {
        $ticket.Title = "Ticket Support $key"
    } elseif ($key -match "^PMS") {
        $ticket.Title = "Bug/Feature $key"
    }

    $tickets += $ticket
}

# Count by status
$totalCount = $tickets.Count
$resolvedCount = ($tickets | Where-Object { $_.Status -eq "RESOLU" }).Count
$specCount = ($tickets | Where-Object { $_.Status -eq "SPEC" }).Count
$diagnosticCount = ($tickets | Where-Object { $_.Status -eq "DIAGNOSTIC" }).Count
$progressCount = $totalCount - $resolvedCount - $specCount - $diagnosticCount

# Generate HTML
$ticketCards = ""
foreach ($t in $tickets | Sort-Object -Property Date -Descending) {
    $programTags = ""
    foreach ($prog in $t.Programs) {
        $programTags += "<span class=`"program-tag`">$prog</span>`n"
    }

    $causeHtml = ""
    if ($t.Cause) {
        $causeHtml = @"
                <div class="cause-root">
                    <strong>Cause:</strong> $($t.Cause)
                </div>
"@
    }

    $actionButtons = "<a href=`".openspec/tickets/$($t.Key)/resolution.md`" class=`"btn btn-primary`">Resolution</a>`n"
    if ($t.HasAnalysis) {
        $actionButtons += "                    <a href=`".openspec/tickets/$($t.Key)/analysis.md`" class=`"btn btn-secondary`">Analyse</a>`n"
    }
    if ($t.HasImplementation) {
        $actionButtons += "                    <a href=`".openspec/tickets/$($t.Key)/implementation.md`" class=`"btn btn-secondary`">Implementation</a>`n"
    }
    if ($t.HasAttachments) {
        $actionButtons += "                    <a href=`".openspec/tickets/$($t.Key)/attachments/`" class=`"btn btn-secondary`">Fichiers</a>`n"
    }

    $metaItems = ""
    if ($t.Village) {
        $metaItems += @"
                    <span class="meta-item">
                        <svg class="meta-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/></svg>
                        $($t.Village)
                    </span>
"@
    }
    $metaItems += @"
                    <span class="meta-item">
                        <svg class="meta-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z"/></svg>
                        $($t.Date)
                    </span>
"@
    if ($t.Module) {
        $metaItems += @"
                    <span class="meta-item">
                        <svg class="meta-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>
                        Module $($t.Module)
                    </span>
"@
    }

    $ticketCards += @"
            <div class="ticket-card">
                <div class="ticket-header">
                    <a href="$($t.JiraUrl)" target="_blank" class="ticket-key">$($t.Key)</a>
                    <span class="ticket-status $($t.StatusClass)">$($t.Status)</span>
                </div>
                <div class="ticket-title">$($t.Title)</div>
                <div class="ticket-meta">
$metaItems
                </div>
                <div class="ticket-description">$($t.Description)</div>
                <div class="programs-list">
$programTags
                </div>
$causeHtml
                <div class="ticket-actions" style="margin-top: 1rem;">
                    $actionButtons
                </div>
            </div>

"@
}

$today = (Get-Date).ToString("yyyy-MM-dd HH:mm")

$html = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tickets Jira - Lecteur Magic</title>
    <style>
        :root {
            --bg-dark: #1a1a2e;
            --bg-card: #16213e;
            --bg-hover: #1f3460;
            --accent: #e94560;
            --accent-light: #ff6b6b;
            --success: #00d9a0;
            --warning: #ffc107;
            --info: #00b4d8;
            --text: #eaeaea;
            --text-muted: #a0a0a0;
            --border: #2d3a5a;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: var(--bg-dark);
            color: var(--text);
            min-height: 100vh;
            padding: 2rem;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
        }
        h1 {
            font-size: 1.8rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        h1::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 32px;
            background: var(--accent);
            border-radius: 4px;
        }
        .stats { display: flex; gap: 1.5rem; }
        .stat {
            text-align: center;
            padding: 0.5rem 1rem;
            background: var(--bg-card);
            border-radius: 8px;
        }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .tickets-grid { display: grid; gap: 1rem; }
        .ticket-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }
        .ticket-card:hover {
            background: var(--bg-hover);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .ticket-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .ticket-key { font-size: 1.1rem; font-weight: 600; color: var(--info); text-decoration: none; }
        .ticket-key:hover { text-decoration: underline; }
        .ticket-status {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-resolved { background: rgba(0, 217, 160, 0.15); color: var(--success); }
        .status-spec { background: rgba(255, 193, 7, 0.15); color: var(--warning); }
        .status-diagnostic { background: rgba(0, 180, 216, 0.15); color: var(--info); }
        .status-progress { background: rgba(233, 69, 96, 0.15); color: var(--accent); }
        .ticket-title { font-size: 1rem; margin-bottom: 0.75rem; line-height: 1.4; }
        .ticket-meta { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .meta-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-muted); }
        .meta-icon { width: 16px; height: 16px; opacity: 0.7; }
        .ticket-description {
            font-size: 0.9rem;
            color: var(--text-muted);
            line-height: 1.5;
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            border-left: 3px solid var(--border);
        }
        .ticket-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .btn {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
        }
        .btn-primary { background: var(--accent); color: white; }
        .btn-primary:hover { background: var(--accent-light); }
        .btn-secondary { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
        .btn-secondary:hover { background: var(--bg-hover); color: var(--text); }
        .programs-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
        .program-tag {
            padding: 0.25rem 0.6rem;
            background: rgba(0, 180, 216, 0.1);
            border: 1px solid rgba(0, 180, 216, 0.3);
            border-radius: 4px;
            font-size: 0.8rem;
            font-family: 'Consolas', monospace;
            color: var(--info);
        }
        .cause-root {
            margin-top: 0.75rem;
            padding: 0.75rem;
            background: rgba(233, 69, 96, 0.1);
            border-left: 3px solid var(--accent);
            border-radius: 0 8px 8px 0;
            font-size: 0.85rem;
        }
        .cause-root strong { color: var(--accent-light); }
        footer {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
            text-align: center;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
        .commands {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--bg-card);
            border-radius: 8px;
        }
        .commands h3 { font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--text-muted); }
        .command-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .command {
            font-family: 'Consolas', monospace;
            padding: 0.4rem 0.8rem;
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
            font-size: 0.85rem;
            color: var(--success);
        }
        .auto-generated {
            margin-top: 0.5rem;
            font-size: 0.7rem;
            color: var(--text-muted);
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Tickets Jira - PMS Magic</h1>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">$totalCount</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat">
                    <div class="stat-value" style="color: var(--success)">$resolvedCount</div>
                    <div class="stat-label">Resolus</div>
                </div>
                <div class="stat">
                    <div class="stat-value" style="color: var(--warning)">$specCount</div>
                    <div class="stat-label">Spec</div>
                </div>
                <div class="stat">
                    <div class="stat-value" style="color: var(--info)">$diagnosticCount</div>
                    <div class="stat-label">Diagnostic</div>
                </div>
            </div>
        </header>

        <div class="tickets-grid">
$ticketCards
        </div>

        <div class="commands">
            <h3>Commandes Claude disponibles</h3>
            <div class="command-list">
                <span class="command">/ticket</span>
                <span class="command">/ticket-new {KEY}</span>
                <span class="command">/ticket-learn {KEY}</span>
                <span class="command">/ticket-search {query}</span>
            </div>
        </div>

        <footer>
            <p>Derniere mise a jour: $today | Projet: Lecteur Magic - Migration PMS</p>
            <p class="auto-generated">Genere automatiquement par hook PostToolUse</p>
        </footer>
    </div>
</body>
</html>
"@

$html | Out-File -FilePath $outputFile -Encoding UTF8 -Force
Write-Host "[tickets-html] Generated $outputFile with $totalCount tickets"
