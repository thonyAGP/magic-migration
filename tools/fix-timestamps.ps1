# Script pour corriger tous les timestamps des fichiers tickets
# Ajoute l'heure au format YYYY-MM-DDTHH:MM

$timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm'
$ticketsPath = Join-Path $PSScriptRoot '../.openspec/tickets'

Write-Host "Correction des timestamps avec: $timestamp" -ForegroundColor Cyan

function Fix-Timestamp {
    param([string]$file)

    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $modified = $false

        # Pattern pour "Analyse : YYYY-MM-DD" sans heure
        if ($content -match '\*Analyse\s*:\s*(\d{4}-\d{2}-\d{2})\s*\*' -and $content -notmatch '\*Analyse\s*:\s*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}') {
            $content = $content -replace '(\*Analyse\s*:\s*)(\d{4}-\d{2}-\d{2})(\s*\*)', "`$1$timestamp`$3"
            $modified = $true
        }

        # Pattern pour "Dernière mise à jour : YYYY-MM-DD" sans heure
        if ($content -match '\*Dernière mise à jour\s*:\s*(\d{4}-\d{2}-\d{2})\s*\*' -and $content -notmatch '\*Dernière mise à jour\s*:\s*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}') {
            $content = $content -replace '(\*Dernière mise à jour\s*:\s*)(\d{4}-\d{2}-\d{2})(\s*\*)', "`$1$timestamp`$3"
            $modified = $true
        }

        # Si pas de timestamp du tout, ajouter à la fin
        if ($content -notmatch '\d{4}-\d{2}-\d{2}T\d{2}:\d{2}' -and $content -notmatch '\{YYYY-MM-DDTHH:MM\}') {
            $content = $content.TrimEnd() + "`n`n---`n`n*Dernière mise à jour : $timestamp*`n"
            $modified = $true
        }

        if ($modified) {
            Set-Content $file $content -NoNewline -Encoding UTF8
            Write-Host "  Fixed: $file" -ForegroundColor Green
        }
    }
}

# Parcourir tous les tickets (sauf TEMPLATE)
Get-ChildItem $ticketsPath -Directory | Where-Object { $_.Name -ne 'TEMPLATE' } | ForEach-Object {
    $ticketDir = $_.FullName
    $ticketName = $_.Name
    Write-Host "Processing $ticketName..." -ForegroundColor Yellow

    Fix-Timestamp (Join-Path $ticketDir 'analysis.md')
    Fix-Timestamp (Join-Path $ticketDir 'resolution.md')
    Fix-Timestamp (Join-Path $ticketDir 'implementation.md')
}

Write-Host "`nDone!" -ForegroundColor Cyan
