# Test si la regex C# fonctionne pour 0x10
$testString = "Hello" + [char]0x10 + "World"
Write-Host "Original length: $($testString.Length)"
Write-Host "Contains 0x10: $($testString.Contains([char]0x10))"

# Test avec la regex equivalente
$regex = [regex]::new('[\x00-\x08\x0B\x0C\x0E-\x1F]')
$cleaned = $regex.Replace($testString, '')
Write-Host "Cleaned length: $($cleaned.Length)"
Write-Host "Still contains 0x10: $($cleaned.Contains([char]0x10))"

# Maintenant testons sur le vrai fichier
Write-Host "`nTesting Prg_40.xml..."
$content = [System.IO.File]::ReadAllText('D:\Data\Migration\XPA\PMS\ADH\Source\Prg_40.xml', [System.Text.Encoding]::UTF8)
$matches = $regex.Matches($content)
Write-Host "Found $($matches.Count) invalid characters"

$cleaned = $regex.Replace($content, '')
Write-Host "Original length: $($content.Length), Cleaned length: $($cleaned.Length)"

# Essayons de parser le XML nettoye
try {
    $null = [System.Xml.Linq.XDocument]::Parse($cleaned)
    Write-Host "SUCCESS: Cleaned XML parses correctly!"
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}
