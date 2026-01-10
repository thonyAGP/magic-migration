# Lire les premiers bytes pour detecter l'encodage
$bytes = [System.IO.File]::ReadAllBytes('D:\Data\Migration\XPA\PMS\ADH\Source\Prg_40.xml')
Write-Host "First 10 bytes: $($bytes[0..9] | ForEach-Object { '{0:X2}' -f $_ })"

# Chercher 0x10 dans les bytes bruts
$found = @()
for ($i = 0; $i -lt $bytes.Length; $i++) {
    if ($bytes[$i] -eq 0x10) {
        $found += $i
    }
}
Write-Host "Found 0x10 at byte positions: $found"

# Montrer le contexte autour du premier 0x10
if ($found.Count -gt 0) {
    $pos = $found[0]
    $start = [Math]::Max(0, $pos - 20)
    $end = [Math]::Min($bytes.Length - 1, $pos + 20)
    Write-Host "Context bytes: $($bytes[$start..$end] | ForEach-Object { '{0:X2}' -f $_ })"
    Write-Host "Context text: $([System.Text.Encoding]::UTF8.GetString($bytes[$start..$end]) -replace '\x10', '[0x10]')"
}

# Calculer la ligne ou se trouve le premier 0x10
if ($found.Count -gt 0) {
    $pos = $found[0]
    $lineNum = 1
    for ($i = 0; $i -lt $pos; $i++) {
        if ($bytes[$i] -eq 0x0A) { $lineNum++ }
    }
    Write-Host "0x10 found at line: $lineNum"
}
