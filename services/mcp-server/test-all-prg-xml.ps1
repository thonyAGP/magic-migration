Add-Type -AssemblyName System.Xml.Linq

$progFiles = Get-ChildItem 'D:\Data\Migration\XPA\PMS\ADH\Source\Prg_*.xml'
$failed = @()

foreach ($file in $progFiles) {
    try {
        $null = [System.Xml.Linq.XDocument]::Load($file.FullName)
    } catch {
        $failed += @{
            Name = $file.Name
            Error = $_.Exception.Message
        }
    }
}

Write-Host "Tested $($progFiles.Count) files"
Write-Host "Failed: $($failed.Count)"
foreach ($f in $failed) {
    Write-Host "  $($f.Name): $($f.Error)"
}
