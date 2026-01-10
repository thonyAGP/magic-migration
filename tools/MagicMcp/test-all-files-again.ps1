Add-Type -AssemblyName System.Xml.Linq

# Test tous les fichiers XML du projet ADH
$files = @(
    'Progs.xml',
    'ProgramHeaders.xml',
    'DataSources.xml',
    'Comps.xml'
)

foreach ($fileName in $files) {
    $path = "D:\Data\Migration\XPA\PMS\ADH\Source\$fileName"
    if (Test-Path $path) {
        try {
            $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
            $null = [System.Xml.Linq.XDocument]::Parse($content)
            Write-Host "OK: $fileName"
        } catch {
            Write-Host "FAIL: $fileName - $($_.Exception.Message)"
        }
    }
}

# Test tous les fichiers programme
$progFiles = Get-ChildItem 'D:\Data\Migration\XPA\PMS\ADH\Source\Prg_*.xml'
$failed = @()

foreach ($file in $progFiles) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $null = [System.Xml.Linq.XDocument]::Parse($content)
    } catch {
        $failed += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "`nTested $($progFiles.Count) program files"
Write-Host "Failed: $($failed.Count)"
foreach ($f in $failed) {
    Write-Host "  $f"
}
