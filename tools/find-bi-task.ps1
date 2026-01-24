$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_558.xml" -Raw
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
[xml]$doc = $content

Write-Host "Looking for task 'BI' in Prg_558.xml..."

# Find all Header elements with publicName containing BI
$headers = $doc.SelectNodes("//Header")
foreach ($h in $headers) {
    $name = $h.publicName
    $isn2 = $h.GetAttribute("ISN_2")
    $parentIsn2 = $h.GetAttribute("parentISN_2")
    $desc = $h.Description

    # Look for BI
    if ($name -eq "BI" -or $desc -like "*BI*") {
        Write-Host "Found: ISN_2=$isn2, Parent=$parentIsn2, Name='$name', Desc='$desc'"
    }
}

Write-Host ""
Write-Host "All tasks with their hierarchy:"
foreach ($h in $headers) {
    $name = $h.publicName
    $isn2 = $h.GetAttribute("ISN_2")
    $parentIsn2 = $h.GetAttribute("parentISN_2")
    $desc = $h.Description
    Write-Host "  ISN_2=$isn2 Parent=$parentIsn2 Name='$name' Desc='$desc'"
}
