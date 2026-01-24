$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml" -Raw
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
[xml]$doc = $content

Write-Host "=== VIL IDE 90 (Prg_348.xml) ===" -ForegroundColor Cyan

# Get program name
$mainTask = $doc.SelectSingleNode("//Task[@MainProgram='Y']")
if ($mainTask) {
    $mainHeader = $mainTask.Header
    Write-Host "Program: $($mainHeader.Description)"
    Write-Host "Public Name: $($mainHeader.publicName)"
}

Write-Host ""
Write-Host "All tasks (with ISN_2 and parentISN_2):" -ForegroundColor Yellow

# Parse all headers
$pattern = '<Header[^>]*ISN_2="(\d+)"[^>]*parentISN_2="(\d+)"[^>]*>'
$matches = [regex]::Matches($content, $pattern)

foreach ($m in $matches) {
    $isn2 = $m.Groups[1].Value
    $parentIsn2 = $m.Groups[2].Value

    # Get more details about this task
    $headerXml = $m.Value
    $descMatch = [regex]::Match($headerXml, 'Description="([^"]*)"')
    $nameMatch = [regex]::Match($headerXml, 'publicName="([^"]*)"')
    $desc = if ($descMatch.Success) { $descMatch.Groups[1].Value } else { "" }
    $name = if ($nameMatch.Success) { $nameMatch.Groups[1].Value } else { "" }

    Write-Host "  ISN_2=$isn2 Parent=$parentIsn2 Name='$name' Desc='$desc'"
}

# Also look for tasks without parentISN_2 (root tasks)
$patternRoot = '<Header[^>]*ISN_2="(\d+)"[^>]*(?!parentISN_2)[^>]*>'
Write-Host ""
Write-Host "Looking for 'BI' in all text..." -ForegroundColor Yellow
if ($content -match 'BI') {
    $lines = $content -split "`n"
    $lineNum = 1
    foreach ($line in $lines) {
        if ($line -match '\bBI\b') {
            Write-Host "  Line ${lineNum}: $line"
        }
        $lineNum++
    }
}
