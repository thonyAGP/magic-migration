param(
    [string]$Project = "PVE",
    [int]$PrgId = 312
)

$projectsPath = "D:\Data\Migration\XPA\PMS"
$prgPath = "$projectsPath\$Project\Source\Prg_$PrgId.xml"

[xml]$doc = Get-Content $prgPath -Encoding UTF8

# Table mapping
$tableMappingPath = "D:\Projects\Lecteur_Magic\tools\MagicMcp\table-mapping.json"
$tableMapping = @{}
if (Test-Path $tableMappingPath) {
    $json = Get-Content $tableMappingPath -Raw | ConvertFrom-Json
    foreach ($prop in $json.PSObject.Properties) {
        $tableMapping[[int]$prop.Name] = "#$($prop.Value.ide) $($prop.Value.name)"
    }
}

function Get-TableName($objId) {
    $id = [int]$objId
    if ($tableMapping.ContainsKey($id)) { return $tableMapping[$id] }
    return "Table_$objId"
}

# Decode FieldId to letter - Magic IDE convention
# A=1..Z=26, BA=27..BZ=52, CA=53..CZ=78, etc.
# NOTE: After Z comes BA (not AA) - this is Magic IDE, not Excel style.
function Get-FieldLetter($fieldId) {
    $fid = [int]$fieldId
    if ($fid -le 0) { return "?" }

    $index = $fid - 1  # Convert to 0-based

    if ($index -lt 26) {
        # A-Z: indices 0-25 (FieldId 1-26)
        return [string][char](65 + $index)
    }
    elseif ($index -lt 702) {
        # BA-ZZ: indices 26-701 (FieldId 27-702)
        $first = [int][math]::Floor($index / 26)   # 1=B, 2=C, 3=D...
        $second = $index % 26                       # 0=A, 1=B, 2=C...
        return [string][char](65 + $first) + [string][char](65 + $second)
    }
    else {
        # BAA-ZZZ: indices 702+ (FieldId 703+)
        $adjusted = $index - 702
        $first = [int][math]::Floor($adjusted / 676) + 1
        $rem = $adjusted % 676
        $second = [int][math]::Floor($rem / 26)
        $third = $rem % 26
        return [string][char](65 + $first) + [string][char](65 + $second) + [string][char](65 + $third)
    }
}

Write-Host "================================================================"
Write-Host "=== $Project Prg_$PrgId ==="
$mainHeader = $doc.Application.ProgramsRepository.Programs.Task.Header
Write-Host "=== $($mainHeader.Description) ==="
Write-Host "================================================================"

# === EXPRESSIONS ===
Write-Host ""
Write-Host "--- EXPRESSIONS ---"

# Find expressions in the XML
$expressions = @{}
$exprNodes = $doc.SelectNodes("//Expression")
foreach ($exprNode in $exprNodes) {
    $id = $exprNode.GetAttribute("id")
    if ($id) {
        $text = $exprNode.InnerText
        if ($text) {
            $expressions[$id] = $text.Substring(0, [Math]::Min($text.Length, 200))
        }
    }
}

# Alternatively, look in Expressions section
$exprSection = $doc.SelectNodes("//Expressions/Expression")
foreach ($expr in $exprSection) {
    $id = $expr.GetAttribute("id")
    $valNodes = $expr.SelectNodes("Val")
    if ($valNodes.Count -gt 0) {
        $fullExpr = ""
        foreach ($v in $valNodes) {
            $fullExpr += $v.InnerText
        }
        $expressions[$id] = $fullExpr.Substring(0, [Math]::Min($fullExpr.Length, 300))
    }
}

# Show all expressions
foreach ($key in ($expressions.Keys | Sort-Object { [int]$_ })) {
    Write-Host "  Expr $key : $($expressions[$key])"
}

# === ALL TASKS with full logic ===
Write-Host ""
Write-Host "--- DETAILED TASK LOGIC ---"

$allTasks = $doc.SelectNodes("//Task")
$taskIdx = 0

foreach ($task in $allTasks) {
    $taskIdx++
    $header = $task.Header
    if (-not $header) { continue }

    $desc = $header.Description
    $isn2 = $header.ISN_2
    $taskType = $header.TaskType.val

    Write-Host ""
    Write-Host "== Task ISN2=$isn2 ($taskType) : $desc =="

    # DataView info
    $dvHeader = $task.DataView.DVHeader
    if ($dvHeader) {
        $mainObj = $dvHeader.MainDsrc.obj
        if ($mainObj) {
            Write-Host "  MainTable: $(Get-TableName $mainObj)"
        }
        # Init expression (condition for task)
        $initExpr = $dvHeader.DVInit
        if ($initExpr) {
            Write-Host "  InitExpr: $initExpr"
        }
    }

    # Columns (variables)
    $cols = $task.Resource.Columns.Column
    if ($cols) {
        Write-Host "  Variables:"
        foreach ($c in $cols) {
            $cName = $c.name
            $cId = $c.id
            $letter = Get-FieldLetter $cId
            $model = $c.PropertyList.Model.attr_obj
            $type = switch ($model) {
                "FIELD_ALPHA" { "Alpha" }
                "FIELD_DATE" { "Date" }
                "FIELD_NUMERIC" { "Numeric" }
                "FIELD_LOGICAL" { "Logical" }
                "FIELD_TIME" { "Time" }
                "FIELD_UNICODE" { "Unicode" }
                default { $model }
            }
            Write-Host "    $letter = $cName ($type)"
        }
    }

    # Links
    $links = $task.DataView.Link
    if ($links) {
        Write-Host "  Links:"
        foreach ($link in $links) {
            $obj = $link.DataObject.obj
            if ($obj) {
                $linkType = $link.LinkType.val
                Write-Host "    $linkType : $(Get-TableName $obj)"
            }
        }
    }

    # Logic handlers
    $logicUnits = $task.TaskLogic.LogicUnit
    if (-not $logicUnits) { continue }

    if ($logicUnits -is [System.Xml.XmlElement]) {
        $logicUnits = @($logicUnits)
    }

    foreach ($handler in $logicUnits) {
        $handlerType = $handler.Type.val
        $eventType = $handler.Event.EventType.val
        $handlerDesc = switch ($handlerType) {
            "H" { "RecordPrefix" }
            "P" { "RecordSuffix" }
            "C" { "ControlPrefix" }
            "V" { "ControlSuffix" }
            "T" { "TaskPrefix" }
            "S" { "TaskSuffix" }
            "M" { "RecordMain" }
            default { "Handler_$handlerType" }
        }

        $condition = $handler.Condition
        $condStr = if ($condition -and $condition.val) { " [Cond:Expr$($condition.val)]" } else { "" }
        $handlerDisabled = if ($handler.Disabled -and $handler.Disabled.val -eq "1") { " [D]" } else { "" }

        $logicLines = $handler.LogicLines.LogicLine
        if (-not $logicLines) { continue }

        if ($logicLines -is [System.Xml.XmlElement]) {
            $logicLines = @($logicLines)
        }

        Write-Host "  --- $handlerDesc (Event=$eventType)$condStr$handlerDisabled ---"

        $lineIdx = 0
        foreach ($line in $logicLines) {
            $lineIdx++

            # Determine operation type from child elements
            $childOp = $line.FirstChild
            if (-not $childOp) { continue }
            $opName = $childOp.Name

            $flowIsn = $childOp.FlowIsn

            switch ($opName) {
                "Select" {
                    $fieldId = $childOp.FieldID
                    $letter = Get-FieldLetter $fieldId
                    $isParam = $childOp.IsParameter.val
                    $paramMark = if ($isParam -eq "Y") { " [PARAM]" } else { "" }
                    Write-Host "    L$lineIdx SELECT $letter (Field$fieldId)$paramMark"
                }
                "DATAVIEW_SRC" {
                    $idx = $childOp.IDX
                    $type = $childOp.Type.val
                    $cond = $childOp.Condition.val
                    Write-Host "    L$lineIdx DATAVIEW IDX=$idx Type=$type Cond=$cond"
                }
                "Update" {
                    $fieldId = $childOp.FieldID
                    $letter = Get-FieldLetter $fieldId
                    $expr = $childOp.Expression
                    $cond = $childOp.Condition
                    $condStr2 = if ($cond -and $cond.val -and $cond.val -ne "Y") { " IF(Expr$($cond.val))" } else { "" }
                    $exprVal = if ($expr -and $expr.val) { "Expr$($expr.val)" } else { "?" }
                    Write-Host "    L$lineIdx UPDATE $letter (Field$fieldId) = $exprVal$condStr2"
                }
                "CallProg" {
                    $comp = $childOp.comp
                    $obj = $childOp.obj
                    $cond = $childOp.Condition
                    $condStr2 = if ($cond -and $cond.val -and $cond.val -ne "Y") { " IF(Expr$($cond.val))" } else { "" }
                    Write-Host "    L$lineIdx CALL Prg comp=$comp obj=$obj$condStr2"
                }
                "CallTask" {
                    $comp = $childOp.comp
                    $obj = $childOp.obj
                    $cond = $childOp.Condition
                    $condStr2 = if ($cond -and $cond.val -and $cond.val -ne "Y") { " IF(Expr$($cond.val))" } else { "" }
                    Write-Host "    L$lineIdx CALL Task comp=$comp obj=$obj$condStr2"
                }
                "BLOCK" {
                    $endBlock = $childOp.EndBlock
                    $type = $childOp.Type.val
                    $cond = $childOp.Condition
                    $condStr2 = if ($cond -and $cond.val -and $cond.val -ne "Y") { " IF(Expr$($cond.val))" } else { "" }
                    Write-Host "    L$lineIdx BLOCK (Type=$type EndAt=$endBlock)$condStr2"
                }
                "ENDBLOCK" {
                    Write-Host "    L$lineIdx END BLOCK"
                }
                "Remark" {
                    $text = $childOp.Text.val
                    Write-Host "    L$lineIdx // $text"
                }
                "Raise" {
                    $eventName = $childOp.Event
                    $cond = $childOp.Condition
                    $condStr2 = if ($cond -and $cond.val -and $cond.val -ne "Y") { " IF(Expr$($cond.val))" } else { "" }
                    Write-Host "    L$lineIdx RAISE EVENT$condStr2"
                }
                "Verify" {
                    $expr = $childOp.Expression
                    $msg = $childOp.Message
                    Write-Host "    L$lineIdx VERIFY Expr=$($expr.val) Msg=$($msg.val)"
                }
                default {
                    Write-Host "    L$lineIdx $opName"
                }
            }
        }
    }
}
