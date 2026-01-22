# remove-bom.ps1
# Supprime le BOM UTF-8 d'un fichier
param([string]$FilePath)

$bytes = [System.IO.File]::ReadAllBytes($FilePath)
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    $newBytes = $bytes[3..($bytes.Length - 1)]
    [System.IO.File]::WriteAllBytes($FilePath, $newBytes)
    Write-Host "BOM removed from $FilePath"
} else {
    Write-Host "No BOM found in $FilePath"
}
