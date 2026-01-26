# Diagnostic ADH XML - Detect invalid characters
param(
    [string]$AdhPath = "D:\Data\Migration\XPA\PMS\ADH\Source"
)

$ErrorActionPreference = "Stop"

Write-Host "=== DIAGNOSTIC ADH XML ===" -ForegroundColor Cyan
Write-Host "Path: $AdhPath"
Write-Host ""

if (-not (Test-Path $AdhPath)) {
    Write-Host "ERREUR: Chemin non trouve: $AdhPath" -ForegroundColor Red
    exit 1
}

$xmlFiles = Get-ChildItem "$AdhPath\*.xml" -ErrorAction SilentlyContinue
Write-Host "Fichiers XML trouves: $($xmlFiles.Count)"
Write-Host ""

$invalidFiles = @()
$parseErrors = @()

foreach ($file in $xmlFiles) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)

        # Check for invalid control characters (< 0x20 except TAB, LF, CR)
        $invalidBytes = @()
        for ($i = 0; $i -lt $bytes.Length; $i++) {
            $b = $bytes[$i]
            if ($b -lt 0x20 -and $b -ne 0x09 -and $b -ne 0x0A -and $b -ne 0x0D) {
                $invalidBytes += [PSCustomObject]@{
                    Position = $i
                    Byte = $b
                    Hex = "0x{0:X2}" -f $b
                }
            }
        }

        if ($invalidBytes.Count -gt 0) {
            $invalidFiles += [PSCustomObject]@{
                FileName = $file.Name
                InvalidCount = $invalidBytes.Count
                FirstBytes = ($invalidBytes | Select-Object -First 5 | ForEach-Object { $_.Hex }) -join ", "
                FirstPositions = ($invalidBytes | Select-Object -First 5 | ForEach-Object { $_.Position }) -join ", "
            }
        }

        # Also try to parse as XML to detect other issues
        try {
            [xml]$null = Get-Content $file.FullName -Raw -Encoding UTF8
        } catch {
            $parseErrors += [PSCustomObject]@{
                FileName = $file.Name
                Error = $_.Exception.Message.Substring(0, [Math]::Min(100, $_.Exception.Message.Length))
            }
        }
    } catch {
        Write-Host "Erreur lecture: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Report invalid characters
if ($invalidFiles.Count -gt 0) {
    Write-Host "=== FICHIERS AVEC CARACTERES INVALIDES ===" -ForegroundColor Red
    $invalidFiles | Format-Table -Property FileName, InvalidCount, FirstBytes, FirstPositions -AutoSize
    Write-Host "Total: $($invalidFiles.Count) fichiers a corriger" -ForegroundColor Red
} else {
    Write-Host "Aucun caractere invalide detecte" -ForegroundColor Green
}

Write-Host ""

# Report parse errors
if ($parseErrors.Count -gt 0) {
    Write-Host "=== FICHIERS AVEC ERREURS DE PARSING XML ===" -ForegroundColor Yellow
    $parseErrors | Format-Table -Property FileName, Error -AutoSize -Wrap
    Write-Host "Total: $($parseErrors.Count) fichiers avec erreurs de parsing" -ForegroundColor Yellow
} else {
    Write-Host "Tous les fichiers sont parsables en XML" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
Write-Host "Fichiers analyses: $($xmlFiles.Count)"
Write-Host "Caracteres invalides: $($invalidFiles.Count) fichiers"
Write-Host "Erreurs parsing: $($parseErrors.Count) fichiers"
