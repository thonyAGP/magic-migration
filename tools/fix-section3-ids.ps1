# Fix section 3: Replace T{ISN2} with ide_path and add [ECRAN] links
param(
    [string]$SpecPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\specs\ADH-IDE-237.md",
    [string]$AlgoPath = "D:\Projects\ClubMed\LecteurMagic\tools\spec-pipeline-v72\output\ADH-IDE-237\algo.json"
)

# Build ISN2 -> ide_path mapping
$algo = Get-Content $AlgoPath -Raw | ConvertFrom-Json
$map = @{}
foreach ($t in $algo.tasks) {
    $map[[int]$t.isn2] = $t.ide_path
}
Write-Host "Loaded $($map.Count) ISN2->ide_path mappings"

# Read spec
$content = [System.IO.File]::ReadAllText($SpecPath)
$originalLen = $content.Length

# ECRAN tasks (ISN2 values that have mockups)
$ecranTasks = @(1,2,7,8,10,11,18,19,30,38,39,40,46,49)

# 1. Replace heading display: </a>T{N} - Name  -->  </a>{ide_path} - Name
foreach ($isn2 in ($map.Keys | Sort-Object { -[int]$_ })) {
    $path = $map[$isn2]
    $old = "</a>T$isn2 - "
    $new = "</a>$path - "
    $content = $content.Replace($old, $new)
}

# 2. Replace table links: [T{N}](#t{N})  -->  [{ide_path}](#t{N})
# Process largest ISN2 first to avoid T1 matching T10, T11, etc.
foreach ($isn2 in ($map.Keys | Sort-Object { -[int]$_ })) {
    $path = $map[$isn2]
    $old = "[T$isn2](#t$isn2)"
    $new = "[$path](#t$isn2)"
    $content = $content.Replace($old, $new)
}

# 3. Replace [ECRAN] in headings with links to mockups
# Pattern: #### <a id="tN"></a>{path} - Name [ECRAN]
foreach ($isn2 in $ecranTasks) {
    if (-not $map.ContainsKey($isn2)) { continue }
    $path = [regex]::Escape($map[$isn2])
    $pattern = "(<a id=`"t$isn2`"></a>$path - [^\r\n]*?) \[ECRAN\]"
    $replacement = "`$1 [[ECRAN]](#ecran-t$isn2)"
    $content = [regex]::Replace($content, $pattern, $replacement)
}

# 4. Replace **[ECRAN]** in table cells with links
# Pattern: | [{path}](#tN) | Name **[ECRAN]** |
foreach ($isn2 in $ecranTasks) {
    if (-not $map.ContainsKey($isn2)) { continue }
    $pattern = "\(#t$isn2\) \| ([^\|]*?)\*\*\[ECRAN\]\*\*"
    $replacement = "(#t$isn2) | `$1**[[ECRAN]](#ecran-t$isn2)**"
    $content = [regex]::Replace($content, $pattern, $replacement)
}

# Write back
[System.IO.File]::WriteAllText($SpecPath, $content)

# Verification
$lines = $content.Split("`n")
Write-Host "`nVerification:"
$remainingT = 0
$remainingEcran = 0
$inSection3 = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match '^## 3\.') { $inSection3 = $true }
    if ($line -match '^## [5678]\.') { $inSection3 = $false }
    if ($inSection3) {
        if ($line -match '</a>T\d+ -') {
            Write-Host "  [T-OLD] L$($i+1): $($line.TrimEnd().Substring(0, [Math]::Min(80, $line.TrimEnd().Length)))"
            $remainingT++
        }
        if ($line -match '\[ECRAN\]' -and $line -notmatch '#ecran-t') {
            Write-Host "  [ECRAN-OLD] L$($i+1): $($line.TrimEnd().Substring(0, [Math]::Min(80, $line.TrimEnd().Length)))"
            $remainingEcran++
        }
    }
}

Write-Host "`nDelta: $($content.Length - $originalLen) chars"
Write-Host "Remaining T{N} in section 3: $remainingT"
Write-Host "Remaining raw [ECRAN] in section 3: $remainingEcran"
