$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_558.xml" -Raw

# Find all ISN_2 values
$pattern = 'ISN_2="(\d+)"'
$matches = [regex]::Matches($content, $pattern)

$isn2Values = $matches | ForEach-Object { [int]$_.Groups[1].Value } | Sort-Object -Unique

Write-Host "All ISN_2 values in Prg_558.xml:"
$isn2Values | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Total: $($isn2Values.Count) tasks"
