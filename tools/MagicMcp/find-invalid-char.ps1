$xmlFiles = Get-ChildItem 'D:\Data\Migration\XPA\PMS\ADH\Source\*.xml'
foreach ($file in $xmlFiles) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    for ($i = 0; $i -lt $bytes.Length; $i++) {
        if ($bytes[$i] -eq 0x10) {
            Write-Host "Found 0x10 in $($file.Name) at byte $i"
            $start = [Math]::Max(0, $i - 30)
            $end = [Math]::Min($bytes.Length - 1, $i + 30)
            $context = [System.Text.Encoding]::UTF8.GetString($bytes[$start..$end]) -replace '\x10', '[0x10]'
            Write-Host "Context: $context"
            break
        }
    }
}
