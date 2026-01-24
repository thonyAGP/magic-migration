$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Progs.xml" -Raw
[xml]$doc = $content

$programs = $doc.SelectNodes("//Program")
Write-Host "Programs in VIL (first 100):"

$position = 1
foreach ($p in $programs) {
    $id = $p.GetAttribute("id")
    if ($position -eq 90) {
        Write-Host ">>> IDE $position = Prg_$id.xml <<<" -ForegroundColor Green
    } else {
        Write-Host "  IDE $position = Prg_$id.xml"
    }
    $position++
    if ($position -gt 95) { break }
}
