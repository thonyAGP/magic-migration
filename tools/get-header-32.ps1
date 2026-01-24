$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml" -Raw

# Find the full Header element for ISN_2=32
$pattern = '<Header[^>]*ISN_2="32"[^>]*>'
$match = [regex]::Match($content, $pattern)
if ($match.Success) {
    Write-Host "Full Header element for ISN_2=32:"
    Write-Host $match.Value
}

# Also look for any parentISN_2 containing 32
Write-Host ""
Write-Host "Looking for parentISN_2 references..."
$lines = $content -split "`n"
$lineNum = 1
foreach ($line in $lines) {
    if ($line -match 'parentISN_2="31"|parentISN_2="32"|parentISN_2="33"') {
        Write-Host "Line ${lineNum}: $line"
    }
    $lineNum++
}

# Find what is above ISN_2=32 in the file structure
Write-Host ""
Write-Host "Context around ISN_2=32:"
$index = $content.IndexOf('ISN_2="32"')
if ($index -gt 0) {
    $start = [Math]::Max(0, $index - 500)
    $end = [Math]::Min($content.Length, $index + 500)
    $context = $content.Substring($start, $end - $start)
    Write-Host $context
}
