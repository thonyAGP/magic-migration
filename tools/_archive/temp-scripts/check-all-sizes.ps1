$basePath = 'D:\Data\Migration\XPA\PMS'
$total = 0
$results = @()

Write-Host "`n=== TAILLE DE TOUS LES PROJETS PMS ===" -ForegroundColor Cyan

Get-ChildItem $basePath -Directory | Sort-Object Name | ForEach-Object {
    $stats = Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum
    $sizeMB = [math]::Round($stats.Sum / 1MB, 1)
    $total += $stats.Sum

    $results += [PSCustomObject]@{
        Name = $_.Name
        SizeMB = $sizeMB
        Files = $stats.Count
    }

    Write-Host ("{0,-15} : {1,8} MB ({2} fichiers)" -f $_.Name, $sizeMB, $stats.Count)
}

Write-Host "`n=== TOTAL ===" -ForegroundColor Yellow
Write-Host ("Total : {0:N0} MB ({1:N2} GB)" -f [math]::Round($total/1MB), [math]::Round($total/1GB, 2))

Write-Host "`n=== TOP 10 PLUS GROS ===" -ForegroundColor Cyan
$results | Sort-Object SizeMB -Descending | Select-Object -First 10 | ForEach-Object {
    Write-Host ("{0,-15} : {1,8} MB" -f $_.Name, $_.SizeMB)
}

Write-Host "`n=== LIMITES STOCKAGE ===" -ForegroundColor Cyan
Write-Host "GitHub  : 5 GB/repo recommande (soft limit), 100 MB/fichier max, pas de limite compte"
Write-Host "GitLab  : 10 GB/repo gratuit, 5 GB LFS gratuit, pas de limite compte"
Write-Host "Note    : Limite par REPO, pas par dossier ni par compte"
