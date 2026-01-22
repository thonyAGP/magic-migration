# Script pour nettoyer les timestamps dupliqués et mal encodés

$timestamp = "2026-01-22T18:55"
$ticketsPath = Join-Path $PSScriptRoot '../.openspec/tickets'

# Fichiers à corriger
$filesToFix = @(
    "PMS-1453/implementation.md",
    "PMS-1453/resolution.md",
    "CMDS-176521/resolution.md"
)

foreach ($file in $filesToFix) {
    $filePath = Join-Path $ticketsPath $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8

        # Supprimer les lignes avec encodage cassé
        $content = $content -replace "(?m)^\*DerniÃ¨re mise Ã  jour.*$\r?\n?", ""

        # Remplacer date sans heure par date avec heure
        $content = $content -replace '(\*Dernière mise à jour\s*:\s*)(\d{4}-\d{2}-\d{2})(\s*\*)', "`$1$timestamp`$3"
        $content = $content -replace '(\*Dernière mise à jour:\s*)(\d{4}-\d{2}-\d{2})(\*)', "`$1$timestamp`$3"

        # Supprimer les --- en double à la fin
        $content = $content -replace "---\s*\r?\n\s*---", "---"

        # Nettoyer les fins de fichier
        $content = $content.TrimEnd() + "`n"

        Set-Content $filePath $content -NoNewline -Encoding UTF8
        Write-Host "Cleaned: $file" -ForegroundColor Green
    }
}

Write-Host "Done!" -ForegroundColor Cyan
