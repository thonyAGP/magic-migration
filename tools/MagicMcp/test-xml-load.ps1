$xmlFiles = @(
    'Progs.xml',
    'ProgramHeaders.xml',
    'DataSources.xml',
    'Comps.xml'
)

foreach ($fileName in $xmlFiles) {
    $path = "D:\Data\Migration\XPA\PMS\ADH\Source\$fileName"
    if (Test-Path $path) {
        try {
            [xml]$doc = Get-Content $path -Raw
            Write-Host "OK: $fileName"
        } catch {
            Write-Host "FAIL: $fileName - $($_.Exception.Message)"
        }
    } else {
        Write-Host "NOT FOUND: $fileName"
    }
}

# Test individual program files
$progFiles = Get-ChildItem 'D:\Data\Migration\XPA\PMS\ADH\Source\Prg_*.xml' | Select-Object -First 50
foreach ($file in $progFiles) {
    try {
        [xml]$doc = Get-Content $file.FullName -Raw
    } catch {
        Write-Host "FAIL: $($file.Name) - $($_.Exception.Message)"
    }
}
Write-Host "Tested $($progFiles.Count) program files"
