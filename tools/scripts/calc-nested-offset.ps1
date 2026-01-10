# Calculate offset for NESTED subtasks
# Formula: Main + Program main + each parent subtask level
#
# Example: ADH 285.1.2.5
#   = Main (143) + Prg 285 main + 285.1 + 285.1.2 + local var 285.1.2.5
#
# RÈGLE IMPORTANTE: Les variables dans les Handlers comptent aussi!
# Même si elles ne sont pas visibles dans le DataView, elles s'ajoutent
# à la suite des variables du Record Main.

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
        # 3-letter variables (AAA onwards)
        $adjusted = $idx - 702
        $first = [int][math]::Floor($adjusted / 676)
        $rem = [int]($adjusted % 676)
        $second = [int][math]::Floor($rem / 26)
        $third = [int]($rem % 26)
        return [string][char]([int][char]'A' + $first) + [string][char]([int][char]'A' + $second) + [string][char]([int][char]'A' + $third)
    }
}

$projectsPath = "D:\Data\Migration\XPA\PMS"
$xmlPath = "$projectsPath\$Project\Source\Prg_$PrgId.xml"
[xml]$xml = Get-Content $xmlPath -Encoding UTF8
$root = $xml.Application.ProgramsRepository.Programs.Task

function Count-TaskVariables($task) {
    # RÈGLE: Compter TOUTES les variables (Select) dans TOUS les LogicUnits
    # pas seulement Record Main - les Handlers (H) peuvent avoir des variables cachées
    $allFieldIds = @()

    foreach ($lu in $task.TaskLogic.LogicUnit) {
        foreach ($ll in $lu.LogicLines.LogicLine) {
            if ($ll.Select) {
                $fieldId = [int]$ll.Select.FieldID
                if ($fieldId -notin $allFieldIds) {
                    $allFieldIds += $fieldId
                }
            }
        }
    }

    # Le nombre de variables = le FieldID max (car numérotés séquentiellement)
    if ($allFieldIds.Count -eq 0) { return 0 }
    return ($allFieldIds | Measure-Object -Maximum).Maximum
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

# Find path from root to target
$path = [System.Collections.ArrayList]::new()
[void]$path.Add($root)
$found = Find-PathToTask $root $TargetIsn $path

if (-not $found) {
    Write-Host "Task ISN=$TargetIsn not found!" -ForegroundColor Red
    exit 1
}

Write-Host "=== Calcul Offset pour sous-tâche imbriquée ===" -ForegroundColor Cyan
Write-Host ""

# Calculate cumulative offset
$offset = $MainOffset
Write-Host "Main offset: $MainOffset"

$level = 0
foreach ($task in $path) {
    $isn = $task.Header.ISN_2
    $name = $task.Header.Description
    $vars = Count-TaskVariables $task

    if ($level -eq 0) {
        Write-Host "  + Prg main task (ISN=$isn): $vars vars -> $name"
    } elseif ($level -lt $path.Count - 1) {
        Write-Host "  + Subtask (ISN=$isn): $vars vars -> $name"
    } else {
        Write-Host "  = Target task (ISN=$isn): $vars vars -> $name"
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

# Now show the target task's Data View with correct variables
$targetTask = $path[$path.Count - 1]
Write-Host "=== Data View avec variables globales ===" -ForegroundColor Cyan

$logicUnit = $null
foreach ($lu in $targetTask.TaskLogic.LogicUnit) {
    if ($lu.Level.val -eq 'R') {
        $logicUnit = $lu
        break
    }
}

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

        # Global variable
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
