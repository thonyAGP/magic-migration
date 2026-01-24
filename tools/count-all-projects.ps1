# Count all Magic projects with programs
$basePath = "D:\Data\Migration\XPA\PMS"

$results = @()
Get-ChildItem $basePath -Directory | ForEach-Object {
    $name = $_.Name
    $sourcePath = Join-Path $_.FullName "Source"
    if (Test-Path $sourcePath) {
        $count = (Get-ChildItem -Path $sourcePath -Filter "Prg_*.xml" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
        if ($count -gt 0) {
            $results += [PSCustomObject]@{
                Project = $name
                Programs = $count
            }
        }
    }
}

Write-Host "=== PROJETS MAGIC AVEC PROGRAMMES ===" -ForegroundColor Cyan
Write-Host ""
$results | Sort-Object Programs -Descending | Format-Table -AutoSize

$total = ($results | Measure-Object -Property Programs -Sum).Sum
Write-Host ""
Write-Host "TOTAL: $($results.Count) projets, $total programmes" -ForegroundColor Green

# Output for code
Write-Host ""
Write-Host "=== LISTE POUR LE CODE ===" -ForegroundColor Yellow
$names = ($results | Sort-Object Project | ForEach-Object { "`"$($_.Project)`"" }) -join ", "
Write-Host "var projectNames = new[] { $names };"
