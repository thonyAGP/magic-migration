function Build-Paths {
    param($tasks, $ide)
    $byParent = @{}
    foreach ($t in $tasks) {
        $p = if ($null -eq $t.parent_isn2) { 'root' } else { [string]$t.parent_isn2 }
        if (-not $byParent.ContainsKey($p)) { $byParent[$p] = @() }
        $byParent[$p] += $t
    }
    
    function Get-Path($parentIsn, $parentPath) {
        $key = if ($null -eq $parentIsn) { 'root' } else { [string]$parentIsn }
        if (-not $byParent.ContainsKey($key)) { return }
        $children = $byParent[$key]
        for ($i = 0; $i -lt $children.Count; $i++) {
            $child = $children[$i]
            $childPath = if ($parentPath -eq '') { [string]$ide } else { $parentPath + '.' + ($i + 1) }
            if ($child.level -gt 0) {
                Write-Output ('ISN2={0} | Path={1} | Name={2}' -f $child.isn2, $childPath, $child.name)
            } else {
                Write-Output ('ISN2={0} | Path={1} (ROOT) | Name={2}' -f $child.isn2, $childPath, $child.name)
            }
            Get-Path $child.isn2 $childPath
        }
    }
    
    Get-Path $null ''
}

Write-Host '=== ADH IDE 237 ===' -ForegroundColor Cyan
$json237 = Get-Content 'D:\Projects\ClubMed\LecteurMagic\tools\spec-pipeline-v72\output\ADH-IDE-237\algo.json' -Raw | ConvertFrom-Json
Build-Paths $json237.tasks 237

Write-Host ''
Write-Host '=== ADH IDE 121 ===' -ForegroundColor Cyan
$json121 = Get-Content 'D:\Projects\ClubMed\LecteurMagic\tools\spec-pipeline-v72\output\ADH-IDE-121\algo.json' -Raw | ConvertFrom-Json
Build-Paths $json121.tasks 121
