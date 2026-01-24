$ErrorActionPreference = "Stop"

$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_558.xml" -Raw
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
[xml]$doc = $content

# Find all tasks and their ISN_2
$tasks = $doc.SelectNodes('//Task')
Write-Host "All tasks in Prg_558.xml ($($tasks.Count) tasks):"

foreach ($t in $tasks) {
    $isn2 = $t.GetAttribute('ISN_2')
    $name = if ($t.Header) { $t.Header.publicName } else { "(no header)" }
    $parentIsn2 = if ($t.Header) { $t.Header.GetAttribute('parentISN_2') } else { "" }
    Write-Host "  ISN_2=$isn2, Parent=$parentIsn2, Name=$name"
}
