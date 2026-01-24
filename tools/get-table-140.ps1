# Find table obj=140 (comp=2 means REF) in REF DataSources
$content = Get-Content "D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml" -Raw

Write-Host "=== Looking for table id=140 in REF DataSources ===" -ForegroundColor Cyan

# Look for DataObject with id=140
$pattern = '<DataObject[^>]*id="140"[^>]*PublicName="([^"]+)"'
$match = [regex]::Match($content, $pattern)
if ($match.Success) {
    Write-Host "Table 140 Public Name: $($match.Groups[1].Value)"
} else {
    Write-Host "Table 140 not found with PublicName pattern"
}

# Find the full DataObject element for id=140
$startPattern = '<DataObject[^>]*id="140"[^>]*>'
$startMatch = [regex]::Match($content, $startPattern)
if ($startMatch.Success) {
    Write-Host ""
    Write-Host "DataObject element:" -ForegroundColor Yellow
    Write-Host $startMatch.Value

    # Find the position and extract until </DataObject>
    $startPos = $startMatch.Index
    $endPattern = '</DataObject>'
    $endPos = $content.IndexOf($endPattern, $startPos)
    if ($endPos -gt $startPos) {
        $tableContent = $content.Substring($startPos, $endPos - $startPos + $endPattern.Length)

        # Count columns
        $colMatches = [regex]::Matches($tableContent, '<Column ')
        Write-Host ""
        Write-Host "Number of columns in table 140: $($colMatches.Count)"

        # Show first few column names
        $colNamePattern = '<Column [^>]*name="([^"]+)"'
        $colNameMatches = [regex]::Matches($tableContent, $colNamePattern)
        Write-Host ""
        Write-Host "First 10 column names:"
        $i = 0
        foreach ($m in $colNameMatches) {
            if ($i -ge 10) { break }
            Write-Host "  $($i + 1): $($m.Groups[1].Value)"
            $i++
        }
    }
}
