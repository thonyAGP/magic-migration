# Show nesting context for ISN_2=32
$lines = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml"
$lineNum = 0

foreach ($line in $lines) {
    $lineNum++
    if ($line -match 'ISN_2="32"') {
        # Count leading spaces
        $trimmed = $line.TrimStart()
        $indent = $line.Length - $trimmed.Length
        Write-Host "Line $lineNum (indent $indent spaces): $($line.Trim())"

        # Show context to understand nesting
        Write-Host ""
        Write-Host "--- Context showing Task nesting (lines before ISN_2=32) ---"
        $startLine = [Math]::Max(0, $lineNum - 100)

        for ($i = $startLine; $i -lt $lineNum - 1; $i++) {
            $ctx = $lines[$i]
            if ($ctx -match '<Task|</Task>|ISN_2=') {
                $ctxIndent = $ctx.Length - $ctx.TrimStart().Length
                Write-Host "  Line $($i+1) (indent $ctxIndent): $($ctx.Trim())"
            }
        }
        break
    }
}
