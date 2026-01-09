param([string]$project, [int]$prgId, [int]$targetLine = 0, [int]$offset = 0)

# === Auto-update table mapping if DataSources.xml changed ===
$MappingFile = "D:\Projects\Lecteur Magic\tools\MagicMcp\table-mapping.json"
$MappingMetaFile = "D:\Projects\Lecteur Magic\tools\MagicMcp\table-mapping.meta"
$RefDataSources = "D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml"

function Update-MappingIfNeeded {
    $needsUpdate = $false

    if (-not (Test-Path $MappingFile) -or -not (Test-Path $MappingMetaFile)) {
        $needsUpdate = $true
    } else {
        $meta = Get-Content $MappingMetaFile -Raw | ConvertFrom-Json
        $dsDate = (Get-Item $RefDataSources).LastWriteTime.ToString("o")
        $needsUpdate = ($meta.dsDate -ne $dsDate)
    }

    if ($needsUpdate) {
        Write-Host "[Auto] Updating table mapping..." -ForegroundColor Yellow

        $dsContent = Get-Content $RefDataSources -Raw -Encoding UTF8
        $dsMatches = [regex]::Matches($dsContent, '<DataObject[^>]+>')

        # Collecter toutes les tables et identifier celles sans PublicName
        $tablesWithPublic = @()
        $idsWithoutPublic = @()

        foreach ($m in $dsMatches) {
            $tag = $m.Value
            $id = $null
            $pub = $null
            $name = $null

            if ($tag -match '\bid="(\d+)"') { $id = [int]$Matches[1] }
            if ($tag -match 'Public="([^"]+)"') { $pub = $Matches[1] }
            if ($tag -match 'name="([^"]+)"') { $name = $Matches[1] }

            if ($id) {
                if ($pub) {
                    $tablesWithPublic += [PSCustomObject]@{Id=$id; Pub=$pub; Name=$name}
                } else {
                    $idsWithoutPublic += $id
                }
            }
        }

        # Trier les ids sans PublicName pour le calcul du decalage
        $idsWithoutPublic = $idsWithoutPublic | Sort-Object

        Write-Host "  Tables avec Public: $($tablesWithPublic.Count)"
        Write-Host "  Tables sans Public: $($idsWithoutPublic.Count) (ids: $($idsWithoutPublic -join ', '))"

        # Calculer la position IDE pour chaque table
        # Position IDE = id - (nombre de tables sans PublicName avec id < cet id)
        $mapping = @{}
        foreach ($t in $tablesWithPublic) {
            $noBefore = ($idsWithoutPublic | Where-Object { $_ -lt $t.Id }).Count
            $idePos = $t.Id - $noBefore
            $mapping["$($t.Id)"] = @{ publicName=$t.Pub; ide=$idePos; name=$t.Name }
        }

        $mapping | ConvertTo-Json -Depth 3 | Out-File $MappingFile -Encoding UTF8
        @{
            dsDate = (Get-Item $RefDataSources).LastWriteTime.ToString("o")
            idsWithoutPublic = $idsWithoutPublic
        } | ConvertTo-Json | Out-File $MappingMetaFile -Encoding UTF8

        Write-Host "[Auto] Done ($($mapping.Count) tables mapped)" -ForegroundColor Green
    }
}

Update-MappingIfNeeded
$TableMapping = Get-Content $MappingFile -Raw | ConvertFrom-Json

function Get-TableInfo([int]$xmlId) {
    $entry = $TableMapping."$xmlId"
    if ($entry) {
        return "IDE #$($entry.ide) $($entry.name)"
    }
    return "XML id=$xmlId (no mapping)"
}

# === Main script ===
$basePath = "D:\Data\Migration\XPA\PMS\$project\Source"
$prgFile = Join-Path $basePath "Prg_$prgId.xml"

$content = Get-Content $prgFile -Raw -Encoding UTF8

# Extract Resource tables (IDX is 1-based index into this list)
$resourceTables = @()
$resourcePattern = '(?s)<Resource>(.*?)</Resource>'
$resourceMatch = [regex]::Match($content, $resourcePattern)
if ($resourceMatch.Success) {
    $dbPattern = '<DataObject[^>]*comp="(\d+)"[^>]*obj="(\d+)"'
    $dbMatches = [regex]::Matches($resourceMatch.Groups[1].Value, $dbPattern)
    foreach ($db in $dbMatches) {
        $resourceTables += [PSCustomObject]@{Comp=$db.Groups[1].Value; Obj=[int]$db.Groups[2].Value}
    }
}

function Get-TableFromIdx([int]$idx) {
    if ($idx -ge 1 -and $idx -le $resourceTables.Count) {
        $obj = $resourceTables[$idx - 1].Obj
        return Get-TableInfo $obj
    }
    return "IDX=$idx (unknown)"
}

function Get-VarLetter([int]$idx) {
    if ($idx -lt 26) { return [string][char](65 + $idx) }
    [int]$first = [Math]::Floor($idx / 26)
    [int]$second = $idx % 26
    return "$([char](65 + $first))$([char](65 + $second))"
}

# Find Record Main LogicUnit
$mainPattern = '(?s)<LogicUnit id="2"[^>]*>\s*<Level val="R"/>\s*<Type val="M"/>.*?<LogicLines>(.*?)</LogicLines>'
$mainMatch = [regex]::Match($content, $mainPattern)

if (-not $mainMatch.Success) {
    Write-Host "Record Main not found!"
    exit
}

$logicContent = $mainMatch.Groups[1].Value
$linePattern = '(?s)<LogicLine>(.*?)</LogicLine>'
$lineMatches = [regex]::Matches($logicContent, $linePattern)

Write-Host "=== Data View Mapping (with IDE table numbers) ===" -ForegroundColor Cyan

$selectCount = 0
$visibleLine = 1
$currentTable = ""

foreach ($lm in $lineMatches) {
    $lc = $lm.Groups[1].Value
    $type = $null
    $extra = ""
    $varStr = "-"

    # DATAVIEW_SRC
    if ($lc -match '<DATAVIEW_SRC') {
        $type = "Main Source"
        if ($lc -match 'IDX="(\d+)"') {
            $currentTable = Get-TableFromIdx ([int]$Matches[1])
            $extra = $currentTable
        } elseif ($lc -match '<DB[^>]*obj="(\d+)"') {
            $currentTable = Get-TableInfo ([int]$Matches[1])
            $extra = $currentTable
        }
    }
    # Select
    elseif ($lc -match '<Select[^>]*FieldID="(\d+)"') {
        $fieldId = $Matches[1]
        $varIdx = $offset + $selectCount
        $varStr = Get-VarLetter $varIdx
        $selectCount++

        # Check if Virtual
        if ($lc -match '<Type val="V"') {
            $type = "Virtual"
        } else {
            $type = "Column"
        }

        if ($lc -match '<Column val="(\d+)"') {
            $extra = "Col $($Matches[1])"
        }
    }
    # LNK
    elseif ($lc -match '<LNK' -and $lc -notmatch '<END_LINK') {
        $type = "Link Query"
        if ($lc -match 'IDX="(\d+)"') {
            $currentTable = Get-TableFromIdx ([int]$Matches[1])
            $extra = $currentTable
        } elseif ($lc -match '<DB[^>]*obj="(\d+)"') {
            $currentTable = Get-TableInfo ([int]$Matches[1])
            $extra = $currentTable
        }
    }
    # END_LINK
    elseif ($lc -match '<END_LINK') {
        $type = "End Link"
        $currentTable = ""
    }
    # Remark
    elseif ($lc -match '<Remark') {
        $type = "(empty)"
        if ($lc -match '<Text val="([^"]*)"') {
            $text = $Matches[1].Trim()
            if ($text) { $type = "Remark"; $extra = $text }
        }
    }
    else {
        continue
    }

    # Show lines around target or all if target is 0
    $showLine = ($targetLine -eq 0) -or ($visibleLine -ge ($targetLine - 5) -and $visibleLine -le ($targetLine + 5))

    if ($showLine) {
        $marker = if ($visibleLine -eq $targetLine) { " <<<" } else { "" }
        $varDisplay = if ($varStr -ne "-") { "[$varStr]" } else { "    " }

        Write-Host ("{0,3} {1,4} {2,-12} {3}$marker" -f $visibleLine, $varDisplay, $type, $extra)
    }

    $visibleLine++
}

Write-Host ""
Write-Host "Total lines: $($visibleLine - 1) | Variables: $selectCount"
