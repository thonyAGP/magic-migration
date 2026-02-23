Write-Host "`n=== FICHIERS > 50 MB ===" -ForegroundColor Cyan
$largeFiles = Get-ChildItem 'D:\Data\Migration\XPA\PMS' -Recurse -File | Where-Object { $_.Length -gt 50MB } | Sort-Object Length -Descending

if ($largeFiles.Count -eq 0) {
    Write-Host "Aucun fichier > 50 MB" -ForegroundColor Green
} else {
    foreach ($f in $largeFiles) {
        $sizeMB = [math]::Round($f.Length / 1MB, 1)
        Write-Host ("{0,6} MB : {1}" -f $sizeMB, $f.Name)
    }
}

Write-Host "`n=== TOP 10 PLUS GROS FICHIERS ===" -ForegroundColor Cyan
$topFiles = Get-ChildItem 'D:\Data\Migration\XPA\PMS' -Recurse -File | Sort-Object Length -Descending | Select-Object -First 10

foreach ($f in $topFiles) {
    $sizeMB = [math]::Round($f.Length / 1MB, 1)
    $relPath = $f.FullName.Replace('D:\Data\Migration\XPA\PMS\', '')
    Write-Host ("{0,6} MB : {1}" -f $sizeMB, $relPath)
}
