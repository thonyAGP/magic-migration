$projects = @(
    @{Name='ADH'; Path='D:\Data\Migration\XPA\PMS\ADH\Source'},
    @{Name='PBP'; Path='D:\Data\Migration\XPA\PMS\PBP\Source'},
    @{Name='REF'; Path='D:\Data\Migration\XPA\PMS\REF\Source'},
    @{Name='PVE'; Path='D:\Data\Migration\XPA\PMS\PVE\Source'},
    @{Name='VIL'; Path='D:\Data\Migration\XPA\PMS\VIL\Source'},
    @{Name='PBG'; Path='D:\Data\Migration\XPA\PMS\PBG\Source'}
)

$total = 0
Write-Host "`n=== TAILLE DES SOURCES MAGIC ===" -ForegroundColor Cyan

foreach ($p in $projects) {
    if (Test-Path $p.Path) {
        $stats = Get-ChildItem $p.Path -Recurse -File | Measure-Object -Property Length -Sum
        $sizeMB = [math]::Round($stats.Sum / 1MB, 2)
        $total += $stats.Sum
        Write-Host ("{0,-6} : {1,8} MB ({2} fichiers)" -f $p.Name, $sizeMB, $stats.Count)
    } else {
        Write-Host ("{0,-6} : INTROUVABLE" -f $p.Name) -ForegroundColor Red
    }
}

Write-Host "`n=== TOTAL ===" -ForegroundColor Yellow
Write-Host ("Total  : {0,8} MB ({1} GB)" -f [math]::Round($total/1MB,2), [math]::Round($total/1GB,2))

# Vérifier si Git existe dans les sources
Write-Host "`n=== REPOS GIT EXISTANTS ===" -ForegroundColor Cyan
foreach ($p in $projects) {
    $gitPath = Join-Path $p.Path ".git"
    $parentGit = Join-Path (Split-Path $p.Path -Parent) ".git"
    if (Test-Path $gitPath) {
        Write-Host ("{0,-6} : Git dans Source/" -f $p.Name) -ForegroundColor Green
    } elseif (Test-Path $parentGit) {
        Write-Host ("{0,-6} : Git dans parent/" -f $p.Name) -ForegroundColor Yellow
    } else {
        Write-Host ("{0,-6} : Pas de Git" -f $p.Name) -ForegroundColor Red
    }
}

# Limites des plateformes
Write-Host "`n=== LIMITES PLATEFORMES ===" -ForegroundColor Cyan
Write-Host "GitHub  : 100 MB/fichier, 5 GB/repo recommande, LFS pour gros fichiers"
Write-Host "GitLab  : 100 MB/fichier, 10 GB/repo gratuit"
