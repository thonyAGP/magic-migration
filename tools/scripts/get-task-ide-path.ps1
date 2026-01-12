# Get IDE hierarchical path for a task
# Usage: .\get-task-ide-path.ps1 -Project PVE -IdePos 186 -TaskIsn 45

param(
    [string]$Project = "PVE",
    [int]$IdePos = 186,
    [int]$TaskIsn = 45
)

$projectsPath = "D:\Data\Migration\XPA\PMS"

# Find PrgId from IDE position
$progsPath = "$projectsPath\$Project\Source\Progs.xml"
[xml]$progsXml = Get-Content $progsPath -Encoding UTF8
$programs = $progsXml.SelectNodes('//Program[@id]')

$PrgId = $null
$idx = 0
foreach ($prg in $programs) {
    $idx++
    if ($idx -eq $IdePos) {
        $PrgId = [int]$prg.id
        break
    }
}

if (-not $PrgId) {
    Write-Error "IDE position $IdePos not found"
    exit 1
}

$xmlPath = "$projectsPath\$Project\Source\Prg_$PrgId.xml"
[xml]$xml = Get-Content $xmlPath -Encoding UTF8

# Get program name
$headersPath = "$projectsPath\$Project\Source\ProgramHeaders.xml"
[xml]$headers = Get-Content $headersPath -Encoding UTF8
$prgHeader = $headers.Application.ProgramsRepositoryHeaders.Programs.Program | Where-Object { $_.ISN_2 -eq $PrgId }
$prgName = if ($prgHeader.PublicName) { $prgHeader.PublicName } else { $prgHeader.Description }

function Find-PathWithPositions {
    param($node, [int]$targetIsn, [System.Collections.ArrayList]$pathInfo)

    if ([int]$node.Header.ISN_2 -eq $targetIsn) {
        return $true
    }

    if ($node.Task) {
        $pos = 0
        foreach ($subtask in @($node.Task)) {
            $pos++
            $newPath = [System.Collections.ArrayList]::new($pathInfo)
            [void]$newPath.Add(@{ isn = $subtask.Header.ISN_2; pos = $pos; name = $subtask.Header.Description })
            if (Find-PathWithPositions $subtask $targetIsn $newPath) {
                $pathInfo.Clear()
                $pathInfo.AddRange($newPath)
                return $true
            }
        }
    }
    return $false
}

$mainTask = $xml.Application.ProgramsRepository.Programs.Task
$pathInfo = [System.Collections.ArrayList]::new()

Write-Host "Programme: $Project IDE $IdePos - $prgName" -ForegroundColor Cyan

if (Find-PathWithPositions $mainTask $TaskIsn $pathInfo) {
    $hierarchyPath = "$IdePos"
    foreach ($p in $pathInfo) {
        $hierarchyPath += ".$($p.pos)"
    }
    Write-Host "Chemin hierarchique: $hierarchyPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Detail du chemin:"
    $level = 0
    foreach ($p in $pathInfo) {
        $level++
        $indent = "  " * $level
        Write-Host "$indent[$($p.pos)] ISN=$($p.isn) : $($p.name)"
    }
} else {
    Write-Host "TaskIsn=$TaskIsn non trouve" -ForegroundColor Red
}
