$xml = [xml](Get-Content "D:\Data\Migration\XPA\PMS\ADH\Source\Progs.xml")
$programs = $xml.Application.ProgramsRepositoryOutLine.Programs.Program
$pos = 1
foreach ($prg in $programs) {
    $id = [int]$prg.id
    $diff = $pos - $id
    if ($diff -ne 0) {
        Write-Host "Pos $pos = Prg $id (diff: $diff)"
    }
    $pos++
}
