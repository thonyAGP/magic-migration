# Test la regex pour les entites XML invalides
$regex = [regex]::new('&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);|&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);')

$testCases = @(
    '&#x10;',      # 0x10 hex - should match
    '&#x1f;',      # 0x1F hex - should match
    '&#x00;',      # 0x00 hex - should match
    '&#16;',       # 16 decimal (0x10) - should match
    '&#31;',       # 31 decimal (0x1F) - should match
    '&#x20;',      # 0x20 (space) - should NOT match
    '&#32;',       # 32 decimal (space) - should NOT match
    '&#x09;',      # Tab - should NOT match (valid)
    '&#x0A;',      # LF - should NOT match (valid)
    '&#x0D;'       # CR - should NOT match (valid)
)

foreach ($test in $testCases) {
    $matches = $regex.Matches($test)
    if ($matches.Count -gt 0) {
        Write-Host "MATCH: $test"
    } else {
        Write-Host "NO MATCH: $test"
    }
}

# Test sur le fichier reel
Write-Host "`nTesting on Prg_40.xml..."
$content = [System.IO.File]::ReadAllText('D:\Data\Migration\XPA\PMS\ADH\Source\Prg_40.xml', [System.Text.Encoding]::UTF8)
$matches = $regex.Matches($content)
Write-Host "Found $($matches.Count) invalid entities"
if ($matches.Count -gt 0) {
    Write-Host "First 5 matches:"
    $matches | Select-Object -First 5 | ForEach-Object { Write-Host "  $($_.Value)" }
}

# Nettoyer et parser
$cleaned = $regex.Replace($content, '')
Write-Host "Original length: $($content.Length), Cleaned length: $($cleaned.Length)"

Add-Type -AssemblyName System.Xml.Linq
try {
    $null = [System.Xml.Linq.XDocument]::Parse($cleaned)
    Write-Host "SUCCESS: Cleaned XML parses correctly!"
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}
