# Calculate offset for NESTED subtasks
#
# RÈGLES VALIDÉES:
# 1. Compter le NOMBRE de Select (pas le max FieldID) - gère les gaps/suppressions
# 2. Compter UNIQUEMENT le chemin direct (ancêtres), PAS les tâches siblings
# 3. Les variables dans les Handlers comptent aussi (tous les LogicUnits)
#
# Example: ADH 285.1.2.5
#   Path: Main → 285 main → 285.1 → 285.1.2 → 285.1.2.5
#   = 143 + 64 + 0 + 111 = 318

param(
    [string]$Project = "ADH",
    [int]$PrgId = 280,           # XML ID (not IDE)
    [int]$TargetIsn = 10,        # ISN_2 of target task
    [int]$MainOffset = 143       # ADH = 143
)

function Convert-IndexToVariable($idx) {
    if ($idx -lt 26) {
        return [string][char]([int][char]'A' + $idx)
    } elseif ($idx -lt 702) {
        $adjusted = $idx - 26
        $first = [int][math]::Floor($adjusted / 26)
        $second = [int]($adjusted % 26)
        return [string][char]([int][char]'A' + $first) + [string][char]([int][char]'A' + $second)
    } else {
        $adjusted = $idx - 702
        $first = [int][math]::Floor($adjusted / 676)
        $rem = [int]($adjusted % 676)
        $second = [int][math]::Floor($rem / 26)
        $third = [int]($rem % 26)
        return [string][char]([int][char]'A' + $first) + [string][char]([int][char]'A' + $second) + [string][char]([int][char]'A' + $third)
    }
}

function Count-TaskSelects($task) {
    # RÈGLE: Compter le NOMBRE de Select dans TOUS les LogicUnits
    $count = 0
    foreach ($lu in $task.TaskLogic.LogicUnit) {
        $count += @($lu.LogicLines.LogicLine | Where-Object { $_.Select }).Count
    }
    return $count
}

function Find-PathToTask {
    param($node, [int]$targetIsn, [System.Collections.ArrayList]$path)

    if ($node.Header.ISN_2 -eq $targetIsn) {
        return $true
    }

    if ($node.Task) {
        foreach ($subtask in @($node.Task)) {
            $newPath = [System.Collections.ArrayList]::new($path)
            [void]$newPath.Add($subtask)
            if (Find-PathToTask $subtask $targetIsn $newPath) {
                $path.Clear()
                $path.AddRange($newPath)
                return $true
            }
        }
    }
    return $false
}

$projectsPath = "D:\Data\Migration\XPA\PMS"
$xmlPath = "$projectsPath\$Project\Source\Prg_$PrgId.xml"
[xml]$xml = Get-Content $xmlPath -Encoding UTF8
$root = $xml.Application.ProgramsRepository.Programs.Task

# Find path from root to target (ancestors only)
$path = [System.Collections.ArrayList]::new()
[void]$path.Add($root)
$found = Find-PathToTask $root $TargetIsn $path

if (-not $found) {
    Write-Host "Task ISN=$TargetIsn not found!" -ForegroundColor Red
    exit 1
}

Write-Host "=== Calcul Offset (chemin direct uniquement) ===" -ForegroundColor Cyan
Write-Host ""

# Calculate cumulative offset along the path
$offset = $MainOffset
Write-Host "Main offset: $MainOffset"

$level = 0
foreach ($task in $path) {
    $isn = $task.Header.ISN_2
    $name = $task.Header.Description
    $vars = Count-TaskSelects $task

    if ($level -eq 0) {
        Write-Host "  + Prg main (ISN=$isn): $vars Select -> $name"
    } elseif ($level -lt $path.Count - 1) {
        Write-Host "  + Subtask (ISN=$isn): $vars Select -> $name"
    } else {
        Write-Host "  = Target (ISN=$isn): $vars Select -> $name" -ForegroundColor Green
    }

    # Add to offset for all EXCEPT the target task itself
    if ($level -lt $path.Count - 1) {
        $offset += $vars
    }
    $level++
}

Write-Host ""
Write-Host "OFFSET FINAL: $offset" -ForegroundColor Yellow
Write-Host ""

# Show target task's Data View with correct variables
$targetTask = $path[$path.Count - 1]
Write-Host "=== Data View ===" -ForegroundColor Cyan

$logicUnit = $null
foreach ($lu in $targetTask.TaskLogic.LogicUnit) {
    if ($lu.Level.val -eq 'R') {
        $logicUnit = $lu
        break
    }
}

if ($logicUnit) {
    $lineNum = 1
    foreach ($logicLine in $logicUnit.LogicLines.LogicLine) {
        $output = $null

        if ($logicLine.DATAVIEW_SRC) {
            $output = "{0,3}       Main Source" -f $lineNum
        }
        elseif ($logicLine.Select) {
            $sel = $logicLine.Select
            $fieldId = [int]$sel.FieldID
            $type = $sel.Type.val
            if (-not $type) { $type = $sel.Type }

            $globalIdx = $fieldId - 1 + $offset
            $var = Convert-IndexToVariable $globalIdx

            $typeStr = switch ($type) { "V" { "Virtual" } "R" { "Column" } "P" { "Param" } default { $type } }
            $output = "{0,3}  [{1,-2}] {2}" -f $lineNum, $var, $typeStr
        }
        elseif ($logicLine.LNK) {
            $output = "{0,3}  [+]  Link" -f $lineNum
        }
        elseif ($logicLine.END_LINK) {
            $output = "{0,3}       End Link" -f $lineNum
        }
        elseif ($logicLine.Remark) {
            $output = "{0,3}" -f $lineNum
        }

        if ($output) {
            Write-Host $output
            $lineNum++
        }
    }
}
