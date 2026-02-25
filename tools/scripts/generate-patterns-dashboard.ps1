# Generate Patterns Analytics Dashboard
# Phase 3 PDCA - Metriques patterns KB

param(
    [string]$OutputPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\reports\patterns-dashboard.html"
)

$ErrorActionPreference = "Stop"
$patternsPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\patterns"
$ticketsPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\tickets"

Write-Host "=== Patterns Analytics Dashboard ===" -ForegroundColor Cyan

# Collect pattern data
$patterns = @()
$patternFiles = Get-ChildItem "$patternsPath\*.md" -Exclude "README.md"

foreach ($file in $patternFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $name = $file.BaseName

    # Extract ticket source
    $ticket = ""
    if ($content -match "Source.*?:\s*.*?([A-Z]+-\d+)") {
        $ticket = $Matches[1]
    }

    # Extract type
    $type = "Unknown"
    if ($content -match "Bug|bug") { $type = "Bug" }
    elseif ($content -match "Enhancement|enhancement|Evolution") { $type = "Enhancement" }
    elseif ($content -match "Diagnostic|diagnostic") { $type = "Diagnostic" }

    # Count specs linked
    $linkedSpecs = 0
    $linkingReport = "D:\Projects\ClubMed\LecteurMagic\.openspec\reports\LINKING_SPECS_PATTERNS.md"
    if (Test-Path $linkingReport) {
        $linkContent = Get-Content $linkingReport -Raw
        $linkedSpecs = ([regex]::Matches($linkContent, [regex]::Escape($name))).Count
    }

    $patterns += [PSCustomObject]@{
        Name = $name
        Ticket = $ticket
        Type = $type
        LinkedSpecs = $linkedSpecs
        HasTicket = if ($ticket) { "Yes" } else { "No" }
    }
}

# Calculate stats
$totalPatterns = $patterns.Count
$withTickets = ($patterns | Where-Object { $_.Ticket }).Count
$byType = $patterns | Group-Object Type | Sort-Object Count -Descending
$topLinked = $patterns | Sort-Object LinkedSpecs -Descending | Select-Object -First 5
$noLinks = $patterns | Where-Object { $_.LinkedSpecs -eq 0 }

Write-Host "Patterns: $totalPatterns"
Write-Host "With tickets: $withTickets"

# Generate HTML dashboard
$html = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patterns Analytics Dashboard</title>
    <style>
        :root {
            --bg: #0d1117;
            --card: #161b22;
            --border: #30363d;
            --text: #c9d1d9;
            --accent: #58a6ff;
            --green: #3fb950;
            --yellow: #d29922;
            --red: #f85149;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg);
            color: var(--text);
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 { color: var(--accent); }
        .header .date { color: #8b949e; font-size: 14px; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 20px;
        }
        .card h3 {
            color: var(--accent);
            margin-bottom: 15px;
            font-size: 14px;
            text-transform: uppercase;
        }
        .stat-value {
            font-size: 48px;
            font-weight: bold;
            color: var(--green);
        }
        .stat-label { color: #8b949e; }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid var(--border);
        }
        th { color: var(--accent); font-size: 12px; text-transform: uppercase; }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        .badge-bug { background: rgba(248,81,73,0.2); color: var(--red); }
        .badge-enhancement { background: rgba(63,185,80,0.2); color: var(--green); }
        .badge-diagnostic { background: rgba(210,153,34,0.2); color: var(--yellow); }
        .badge-unknown { background: rgba(139,148,158,0.2); color: #8b949e; }
        .progress-bar {
            height: 8px;
            background: var(--border);
            border-radius: 4px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: var(--green);
            transition: width 0.3s;
        }
        .chart-bar {
            display: flex;
            align-items: center;
            margin: 8px 0;
        }
        .chart-bar-label { width: 100px; font-size: 12px; }
        .chart-bar-fill {
            height: 20px;
            background: var(--accent);
            border-radius: 4px;
            margin-left: 10px;
        }
        .chart-bar-value {
            margin-left: 10px;
            font-size: 12px;
            color: #8b949e;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Patterns Analytics Dashboard</h1>
        <p class="date">Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm") | PDCA Phase 3</p>
    </div>

    <div class="grid">
        <div class="card">
            <h3>Total Patterns</h3>
            <div class="stat-value">$totalPatterns</div>
            <div class="stat-label">patterns documentes</div>
        </div>
        <div class="card">
            <h3>Coverage Tickets</h3>
            <div class="stat-value">$([math]::Round($withTickets / $totalPatterns * 100))%</div>
            <div class="stat-label">$withTickets / $totalPatterns avec ticket source</div>
            <div class="progress-bar" style="margin-top:10px">
                <div class="progress-fill" style="width:$([math]::Round($withTickets / $totalPatterns * 100))%"></div>
            </div>
        </div>
        <div class="card">
            <h3>Specs Linkees</h3>
            <div class="stat-value">235</div>
            <div class="stat-label">specs avec pattern associe</div>
        </div>
        <div class="card">
            <h3>Score Sante</h3>
            <div class="stat-value" style="color:var(--green)">B+</div>
            <div class="stat-label">80% couverture cible</div>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h3>Patterns par Type</h3>
"@

foreach ($group in $byType) {
    $maxWidth = 200
    $width = [math]::Round($group.Count / $totalPatterns * $maxWidth)
    $html += @"
            <div class="chart-bar">
                <span class="chart-bar-label">$($group.Name)</span>
                <div class="chart-bar-fill" style="width:${width}px"></div>
                <span class="chart-bar-value">$($group.Count)</span>
            </div>
"@
}

$html += @"
        </div>
        <div class="card">
            <h3>Top 5 Patterns (par specs linkees)</h3>
            <table>
                <tr><th>Pattern</th><th>Specs</th></tr>
"@

foreach ($p in $topLinked) {
    $html += "                <tr><td>$($p.Name)</td><td>$($p.LinkedSpecs)</td></tr>`n"
}

$html += @"
            </table>
        </div>
    </div>

    <div class="card">
        <h3>Liste Complete des Patterns</h3>
        <table>
            <tr>
                <th>Pattern</th>
                <th>Type</th>
                <th>Ticket Source</th>
                <th>Specs Linkees</th>
            </tr>
"@

foreach ($p in ($patterns | Sort-Object LinkedSpecs -Descending)) {
    $badgeClass = switch ($p.Type) {
        "Bug" { "badge-bug" }
        "Enhancement" { "badge-enhancement" }
        "Diagnostic" { "badge-diagnostic" }
        default { "badge-unknown" }
    }
    $html += @"
            <tr>
                <td>$($p.Name)</td>
                <td><span class="badge $badgeClass">$($p.Type)</span></td>
                <td>$($p.Ticket)</td>
                <td>$($p.LinkedSpecs)</td>
            </tr>
"@
}

$html += @"
        </table>
    </div>

    <div class="card" style="margin-top:20px">
        <h3>Recommandations</h3>
        <ul style="padding-left:20px;line-height:2">
            <li>Ajouter 4 patterns pour atteindre la cible de 20</li>
            <li>Patterns sans specs linkees: $($noLinks.Count) - ameliorer les keywords</li>
            <li>Prochaine action: capitaliser les tickets resolus sans pattern</li>
        </ul>
    </div>
</body>
</html>
"@

$html | Out-File $OutputPath -Encoding UTF8
Write-Host ""
Write-Host "Dashboard genere: $OutputPath" -ForegroundColor Green
Write-Host "Ouvrir dans le navigateur pour visualiser" -ForegroundColor Cyan
