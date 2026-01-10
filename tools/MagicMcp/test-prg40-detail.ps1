# Lire le fichier comme string UTF8
$path = 'D:\Data\Migration\XPA\PMS\ADH\Source\Prg_40.xml'
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

Write-Host "String length: $($content.Length)"

# Compter les lignes jusqu'a la ligne 2840
$lines = $content.Split("`n")
Write-Host "Total lines: $($lines.Length)"

if ($lines.Length -ge 2840) {
    $line = $lines[2839]  # 0-based
    Write-Host "Line 2840 length: $($line.Length)"
    Write-Host "Line 2840 (first 100 chars): $($line.Substring(0, [Math]::Min(100, $line.Length)))"

    # Chercher des caracteres de controle dans cette ligne
    for ($i = 0; $i -lt $line.Length; $i++) {
        $charCode = [int][char]$line[$i]
        if ($charCode -lt 32 -and $charCode -ne 9 -and $charCode -ne 10 -and $charCode -ne 13) {
            Write-Host "Found control char 0x$($charCode.ToString('X2')) at position $i"
        }
    }

    # Afficher les codes des caracteres autour de la position 37
    if ($line.Length -ge 50) {
        Write-Host "`nChar codes around position 37:"
        for ($i = 30; $i -lt [Math]::Min(50, $line.Length); $i++) {
            $charCode = [int][char]$line[$i]
            Write-Host "  [$i] = 0x$($charCode.ToString('X2')) ($charCode) = '$($line[$i])'"
        }
    }
}
