# Count ADH specs and list IDE numbers
$specs = Get-ChildItem 'D:\Projects\ClubMed\LecteurMagic\.openspec\specs\ADH-IDE-*.md' |
    Where-Object { $_.Name -notmatch '-summary' }

Write-Host "Total ADH specs: $($specs.Count)"

# Extract IDE numbers
$ideNumbers = $specs | ForEach-Object {
    if ($_.BaseName -match 'ADH-IDE-(\d+)') {
        [int]$Matches[1]
    }
} | Sort-Object

Write-Host "IDE range: $($ideNumbers | Select-Object -First 1) - $($ideNumbers | Select-Object -Last 1)"
Write-Host ""
Write-Host "All IDE numbers:"
$ideNumbers -join ", "
