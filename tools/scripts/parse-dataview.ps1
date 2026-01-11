# PARSE MAGIC DATA VIEW - VERSION DEFINITIVE V6
# Règles brutes basées sur analyse positions XML vs IDE
#
# RÈGLES CLÉS (2026-01-11):
# 1. Tables: XML obj → Comps.xml ItemIsn → id = IDE position
# 2. Programmes: Position dans ProgramsRepositoryOutLine = IDE position
# 3. Data View: Position dans LogicLines = IDE line number
# 4. Colonnes: Column.val = séquentiel (Main), vrais IDs (Links)
# 5. Variables: GLOBAL - Main TOUJOURS chargé en premier (offset AUTO-CALCULÉ)
# 6. Init: Task/Record Prefix Updates → WithValue Expression + Condition (Block IF)
# 7. Offset: Calculé automatiquement via chemin Main → Tâche cible
# 8. Conditions: Affichage compact (variables) ET expanded (noms colonnes)

param(
    [string]$Project = "ADH",
    [int]$PrgId = 159,
    [int]$TaskIsn = 1,
    [int]$MainOffset = 143  # Offset Main projet (ADH=143, à ajuster par projet)
)

# ============================================
# FONCTIONS CALCUL OFFSET AUTOMATIQUE
# ============================================

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

function Count-TaskSelects($taskNode) {
    # Compter le NOMBRE de Select dans TOUS les LogicUnits (pas le max FieldID)
    $count = 0
    foreach ($lu in $taskNode.TaskLogic.LogicUnit) {
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

if (-not (Test-Path $xmlPath)) {
    Write-Error "File not found: $xmlPath"
    exit 1
}

# Load XML
[xml]$xml = Get-Content $xmlPath -Encoding UTF8

# ============================================
# LOAD COMPONENT TABLE MAPPING (ItemIsn → IDE id)
# ============================================
$compsPath = "$projectsPath\$Project\Source\Comps.xml"
$tableIsnToIde = @{}  # ItemIsn → { ide, publicName }
$tablePublicToName = @{}  # PublicName → table name

# First load REF DataSources for table names
$dsPath = "$projectsPath\REF\Source\DataSources.xml"
$tableNamesById = @{}
$dbColumns = @{}

if (Test-Path $dsPath) {
    [xml]$dsXml = Get-Content $dsPath -Encoding UTF8
    foreach ($ds in $dsXml.Application.DataSourceRepository.DataObjects.DataObject) {
        $id = $ds.id
        $logicalName = $ds.name
        $publicName = $ds.Public
        if (-not $logicalName) { $logicalName = "Table_$id" }
        $tableNamesById["$id"] = $logicalName
        if ($publicName) {
            $tablePublicToName["$publicName"] = $logicalName
        }
        # Store column mappings
        if ($ds.Columns.Column) {
            $cols = @{}
            foreach ($col in $ds.Columns.Column) {
                $cols["$($col.id)"] = $col.name
            }
            $dbColumns["$id"] = $cols
        }
    }
}

# Load Comps.xml for ItemIsn → IDE mapping
if (Test-Path $compsPath) {
    [xml]$compsXml = Get-Content $compsPath -Encoding UTF8
    # Find REF component (id=4 typically named "Ref_Tables")
    foreach ($comp in $compsXml.Application.ComponentsRepository.Components.Component) {
        if ($comp.ComponentDataObjects) {
            foreach ($obj in $comp.ComponentDataObjects.Object) {
                $ideId = $obj.id.val
                $itemIsn = $obj.ItemIsn.val
                $publicName = $obj.PublicName.val
                if ($itemIsn) {
                    $tableIsnToIde["$itemIsn"] = @{ ide = $ideId; public = $publicName }
                }
            }
        }
    }
    Write-Host "Component mapping: $($tableIsnToIde.Count) tables mapped" -ForegroundColor DarkGray
}

# ============================================
# LOAD PROGRAM IDE POSITION
# ============================================
$progsPath = "$projectsPath\$Project\Source\Progs.xml"
$prgIdePos = $PrgId  # Default to XML id

if (Test-Path $progsPath) {
    [xml]$progsXml = Get-Content $progsPath -Encoding UTF8
    $programs = $progsXml.Application.ProgramsRepositoryOutLine.Programs.Program
    $pos = 1
    foreach ($prg in $programs) {
        if ($prg.id -eq "$PrgId") {
            $prgIdePos = $pos
            break
        }
        $pos++
    }
}

function Get-TableDisplay($objId) {
    # Rule: XML obj = ItemIsn → Comps.xml id = IDE position
    if ($tableIsnToIde.ContainsKey("$objId")) {
        $info = $tableIsnToIde["$objId"]
        $tableName = if ($tablePublicToName.ContainsKey($info.public)) {
            $tablePublicToName[$info.public]
        } else {
            $info.public
        }
        return "$($info.ide) $tableName"
    }
    # Fallback to direct lookup
    if ($tableNamesById.ContainsKey("$objId")) {
        return "? $($tableNamesById["$objId"])"
    }
    return "obj=$objId"
}

function Get-ColumnName($tableObj, $colId) {
    # Try ItemIsn-based lookup first
    if ($tableIsnToIde.ContainsKey("$tableObj")) {
        $info = $tableIsnToIde["$tableObj"]
        # Find REF table id by PublicName
        foreach ($key in $tableNamesById.Keys) {
            if ($tablePublicToName.ContainsKey($info.public) -and
                $tableNamesById[$key] -eq $tablePublicToName[$info.public]) {
                if ($dbColumns.ContainsKey($key)) {
                    $cols = $dbColumns[$key]
                    if ($cols.ContainsKey("$colId")) {
                        return $cols["$colId"]
                    }
                }
                break
            }
        }
    }
    # Direct lookup
    if ($dbColumns.ContainsKey("$tableObj")) {
        $cols = $dbColumns["$tableObj"]
        if ($cols.ContainsKey("$colId")) {
            return $cols["$colId"]
        }
    }
    return $null
}


# ============================================
# FIND TASK (recursive search for nested subtasks)
# ============================================
function Find-TaskByIsn {
    param($node, [int]$targetIsn)

    if ($node.Header.ISN_2 -eq $targetIsn) {
        return $node
    }

    # Search nested Task elements
    if ($node.Task) {
        foreach ($subtask in @($node.Task)) {
            $found = Find-TaskByIsn $subtask $targetIsn
            if ($found) { return $found }
        }
    }

    return $null
}

$task = $null

# Start from main program task
$mainTask = $xml.Application.ProgramsRepository.Programs.Task
if (-not $mainTask) {
    $mainTask = $xml.Application.Task | Select-Object -First 1
}

if ($mainTask) {
    $task = Find-TaskByIsn $mainTask $TaskIsn
}

if (-not $task) {
    Write-Error "Task ISN_2=$TaskIsn not found"
    exit 1
}

# ============================================
# CALCUL AUTOMATIQUE DE L'OFFSET
# ============================================
# Trouver le chemin depuis la racine vers la tâche cible
$path = [System.Collections.ArrayList]::new()
[void]$path.Add($mainTask)
$found = Find-PathToTask $mainTask $TaskIsn $path

# Calculer l'offset cumulatif le long du chemin (SAUF la tâche cible)
$calculatedOffset = $MainOffset
$pathDetails = @()

for ($i = 0; $i -lt $path.Count; $i++) {
    $pathTask = $path[$i]
    $taskVars = Count-TaskSelects $pathTask
    $taskDesc = $pathTask.Header.Description

    if ($i -lt $path.Count - 1) {
        # Ajouter à l'offset pour tous SAUF la tâche cible
        $calculatedOffset += $taskVars
        $pathDetails += "$taskDesc($taskVars)"
    }
}

$taskName = $task.Header.Description
Write-Host ""
Write-Host "=== $Project IDE $prgIdePos - $taskName ===" -ForegroundColor Cyan

# Afficher le chemin et l'offset calculé
if ($path.Count -gt 1) {
    Write-Host "Path: Main($MainOffset) + $($pathDetails -join ' + ') = $calculatedOffset" -ForegroundColor DarkGray
} else {
    Write-Host "Offset: $calculatedOffset (Main)" -ForegroundColor DarkGray
}
Write-Host ""

# Utiliser l'offset calculé
$MainOffset = $calculatedOffset

# ============================================
# LOAD VG NAMES (from Main program Prg_1.xml)
# ============================================
$vgNames = @{}
$mainPrgPath = "$projectsPath\$Project\Source\Prg_1.xml"
if (Test-Path $mainPrgPath) {
    [xml]$mainPrgXml = Get-Content $mainPrgPath -Encoding UTF8
    $mainPrgTask = $mainPrgXml.Application.ProgramsRepository.Programs.Task
    if ($mainPrgTask.Resource.Columns.Column) {
        foreach ($col in $mainPrgTask.Resource.Columns.Column) {
            $colId = $col.id
            $colName = $col.name
            if ($colName) {
                $vgNames["$colId"] = $colName
            }
        }
    }
    Write-Host "VG names loaded: $($vgNames.Count) variables" -ForegroundColor DarkGray
}

# ============================================
# GET DB LIST (needed for field mapping)
# ============================================
$dbList = @()
$dbIndex = 1

foreach ($db in $task.Resource.DB) {
    $obj = $db.DataObject.obj
    $dbList += @{ Index = $dbIndex; Obj = $obj; Display = (Get-TableDisplay $obj) }
    $dbIndex++
}

# ============================================
# BUILD FIELD TO COLUMN NAME MAP (for expanded view)
# MUST be done BEFORE expression resolution
# ============================================
$fieldToColName = @{}  # FieldID → column name (for expanded view)

# First, add virtual columns from Resource.Columns
foreach ($col in $task.Resource.Columns.Column) {
    $colId = $col.id
    $colName = $col.name
    if ($colName) {
        $fieldToColName["$colId"] = $colName
    }
}

# Parse ALL LogicUnits to get FieldID → column name mapping
# Track current table context for real columns
$currentTableObjForMapping = if ($dbList.Count -gt 0) { $dbList[0].Obj } else { $null }

foreach ($lu in $task.TaskLogic.LogicUnit) {
    foreach ($line in $lu.LogicLines.LogicLine) {
        # Track table context changes
        if ($line.DATAVIEW_SRC) {
            $idx = $line.DATAVIEW_SRC.IDX
            if ($idx -and $idx -ne "0") {
                $db = $dbList | Where-Object { $_.Index -eq [int]$idx } | Select-Object -First 1
                if ($db) { $currentTableObjForMapping = $db.Obj }
            }
        }
        elseif ($line.LNK) {
            $currentTableObjForMapping = $line.LNK.DB.obj
        }
        elseif ($line.END_LINK) {
            # Reset to main table
            if ($dbList.Count -gt 0) { $currentTableObjForMapping = $dbList[0].Obj }
        }
        elseif ($line.Select) {
            $sel = $line.Select
            $fieldId = $sel.FieldID
            $colNum = $sel.Column.val
            if ($colNum -is [System.Xml.XmlElement]) {
                $colNum = $colNum.InnerText
            }
            $type = $sel.Type.val
            if (-not $type) { $type = $sel.Type }

            # Get column name based on type
            $isParam = $sel.IsParameter.val
            if (-not $isParam) { $isParam = $sel.IsParameter }

            $colName = $null
            if ($isParam -eq "Y" -or $type -eq "V") {
                # Parameter or Virtual - Column.val is POSITION (1-based), not ID
                $colIdx = [int]$colNum - 1  # Convert to 0-based index
                $cols = @($task.Resource.Columns.Column)
                if ($colIdx -ge 0 -and $colIdx -lt $cols.Count) {
                    $colName = $cols[$colIdx].name
                }
            } else {
                # Real column - use current table context
                if ($currentTableObjForMapping) {
                    $colName = Get-ColumnName $currentTableObjForMapping $colNum
                }
            }

            if ($colName -and -not $fieldToColName.ContainsKey("$fieldId")) {
                $fieldToColName["$fieldId"] = $colName
            }
        }
    }
}

# ============================================
# EXPRESSION RESOLUTION FUNCTIONS
# ============================================
# Resolve expression to COMPACT format (variable letters: GI, GJ, etc.)
function Resolve-ExpressionCompact {
    param([string]$syntax)

    $result = $syntax

    # Replace VG refs {32768,X} with VG.Name
    $result = [regex]::Replace($result, '\{32768,(\d+)\}', {
        param($match)
        $vgId = $match.Groups[1].Value
        if ($vgNames.ContainsKey($vgId)) {
            return $vgNames[$vgId]
        }
        return "VG.$vgId"
    })

    # Replace local refs {0,X} with variable letter
    $result = [regex]::Replace($result, '\{0,(\d+)\}', {
        param($match)
        $fieldId = [int]$match.Groups[1].Value
        $idx = $fieldId - 1 + $MainOffset
        return Convert-IndexToVariable $idx
    })

    # Replace parent task refs {1,X}
    $result = [regex]::Replace($result, '\{1,(\d+)\}', {
        param($match)
        $fieldId = [int]$match.Groups[1].Value
        return "Parent." + (Convert-IndexToVariable ($fieldId - 1))
    })

    return $result
}

# Resolve expression to EXPANDED format (column names: P.Card Id, etc.)
function Resolve-ExpressionExpanded {
    param([string]$syntax)

    $result = $syntax

    # Replace VG refs {32768,X} with VG.Name
    $result = [regex]::Replace($result, '\{32768,(\d+)\}', {
        param($match)
        $vgId = $match.Groups[1].Value
        if ($vgNames.ContainsKey($vgId)) {
            return $vgNames[$vgId]
        }
        return "VG.$vgId"
    })

    # Replace local refs {0,X} with column name if available
    $result = [regex]::Replace($result, '\{0,(\d+)\}', {
        param($match)
        $fieldId = $match.Groups[1].Value
        if ($fieldToColName.ContainsKey($fieldId)) {
            return $fieldToColName[$fieldId]
        }
        # Fallback to variable letter
        $idx = [int]$fieldId - 1 + $MainOffset
        return Convert-IndexToVariable $idx
    })

    # Replace parent task refs {1,X}
    $result = [regex]::Replace($result, '\{1,(\d+)\}', {
        param($match)
        $fieldId = [int]$match.Groups[1].Value
        return "Parent." + (Convert-IndexToVariable ($fieldId - 1))
    })

    return $result
}

# ============================================
# LOAD EXPRESSIONS (both compact and expanded)
# ============================================
$expressionsCompact = @{}   # id → compact form (variable letters)
$expressionsExpanded = @{}  # id → expanded form (column names)
$expressionsRaw = @{}       # id → raw syntax

foreach ($exp in $task.Expressions.Expression) {
    $id = $exp.id
    $syntax = $exp.ExpSyntax.val
    if ($syntax) {
        $expressionsRaw["$id"] = $syntax
        $expressionsCompact["$id"] = Resolve-ExpressionCompact $syntax
        $expressionsExpanded["$id"] = Resolve-ExpressionExpanded $syntax
    }
}

# ============================================
# BUILD INIT MAP WITH CONDITIONS (from Prefix/Suffix)
# ============================================
$initMap = @{}  # FieldID → { compact, expanded, condCompact, condExpanded }

# Find Task/Record Prefix or Suffix for Init values
# Types: TP=Task Prefix, TS=Task Suffix, P=Record Prefix, S=Record Suffix
foreach ($lu in $task.TaskLogic.LogicUnit) {
    $level = $lu.Level.val
    $type = $lu.Type.val

    # Include Prefix (P, TP) and Suffix (S, TS) - all may have inits
    $isInitSource = ($level -eq "TP") -or ($level -eq "TS") -or
                    ($level -eq "R" -and ($type -eq "P" -or $type -eq "S"))

    if ($isInitSource) {
        # Track current block condition
        $currentCondCompact = $null
        $currentCondExpanded = $null
        $blockStack = @()  # Stack for nested blocks

        foreach ($line in $lu.LogicLines.LogicLine) {
            # Handle BLOCK IF
            if ($line.BLOCK) {
                $condExpId = $line.BLOCK.Condition.Exp
                if ($condExpId) {
                    $condCompact = if ($expressionsCompact.ContainsKey("$condExpId")) { $expressionsCompact["$condExpId"] } else { "Exp$condExpId" }
                    $condExpanded = if ($expressionsExpanded.ContainsKey("$condExpId")) { $expressionsExpanded["$condExpId"] } else { "Exp$condExpId" }
                    $blockStack += @{ compact = $condCompact; expanded = $condExpanded }
                    $currentCondCompact = $condCompact
                    $currentCondExpanded = $condExpanded
                }
            }
            # Handle END_BLK
            elseif ($line.END_BLK) {
                if ($blockStack.Count -gt 0) {
                    $blockStack = $blockStack[0..($blockStack.Count - 2)]  # Pop
                    if ($blockStack.Count -gt 0) {
                        $lastBlock = $blockStack[-1]
                        $currentCondCompact = $lastBlock.compact
                        $currentCondExpanded = $lastBlock.expanded
                    } else {
                        $currentCondCompact = $null
                        $currentCondExpanded = $null
                    }
                }
            }
            # Handle UPDATE
            elseif ($line.Update) {
                $upd = $line.Update
                $fieldId = $upd.FieldID.val
                $withValue = $upd.WithValue.val

                if ($fieldId -and $withValue) {
                    $valueCompact = if ($expressionsCompact.ContainsKey("$withValue")) { $expressionsCompact["$withValue"] } else { "Exp$withValue" }
                    $valueExpanded = if ($expressionsExpanded.ContainsKey("$withValue")) { $expressionsExpanded["$withValue"] } else { "Exp$withValue" }

                    $initMap["$fieldId"] = @{
                        compact = $valueCompact
                        expanded = $valueExpanded
                        condCompact = $currentCondCompact
                        condExpanded = $currentCondExpanded
                    }
                }
            }
        }
    }
}

if ($initMap.Count -gt 0) {
    Write-Host "Init expressions found: $($initMap.Count)" -ForegroundColor DarkGray
}

# ============================================
# GET VIRTUAL COLUMNS (indexed by position, not id)
# ============================================
$virtualColumns = @{}
$virtualColumnsList = @()
$pos = 1
foreach ($col in $task.Resource.Columns.Column) {
    $colId = $col.id
    $colName = $col.name
    $virtualColumns["$pos"] = $colName      # By position (for Select Column val)
    $virtualColumns["id$colId"] = $colName  # By id (backup)
    $virtualColumnsList += $colName
    # Also add to fieldToColName for expanded view
    $fieldToColName["$colId"] = $colName
    $pos++
}

# ============================================
# PARSE LOGIC LINES
# ============================================
$logicUnit = $null
foreach ($lu in $task.TaskLogic.LogicUnit) {
    if ($lu.Level.val -eq "R") {
        $logicUnit = $lu
        break
    }
}

if (-not $logicUnit) {
    Write-Error "No Record Main LogicUnit found"
    exit 1
}

Write-Host ""
Write-Host "Ln#  Var  Type        Details                          Init (Compact)"
Write-Host "---  ---  ----------  -------------------------------  --------------"

$lineNum = 1
$inLink = $false
$currentTableObj = $null  # Track current table for column names
$mainTableIdx = 1  # Main table DB index

# Collect lines for display
$outputLines = @()

foreach ($logicLine in $logicUnit.LogicLines.LogicLine) {
    $output = $null
    $varLetter = ""
    $initCompact = ""
    $initExpanded = ""
    $fieldId = $null

    # ----------------------------------------
    # DATAVIEW_SRC - Main table
    # ----------------------------------------
    if ($logicLine.DATAVIEW_SRC) {
        $dvSrc = $logicLine.DATAVIEW_SRC
        $idx = $dvSrc.IDX

        if (-not $idx -or $idx -eq "0") {
            $output = "{0,3}       Main Source 0 (No Main Source)" -f $lineNum
        } else {
            $idx = [int]$idx
            $db = $dbList | Where-Object { $_.Index -eq $idx }
            if ($db) {
                $currentTableObj = $db.Obj
                $mainTableIdx = $idx
                $output = "{0,3}       Main Source {1}" -f $lineNum, $db.Display
            } else {
                $output = "{0,3}       Main Source DB[$idx]" -f $lineNum
            }
        }
    }

    # ----------------------------------------
    # Select - Column
    # ----------------------------------------
    elseif ($logicLine.Select) {
        $sel = $logicLine.Select
        $fieldId = [int]$sel.FieldID
        $colNum = $sel.Column.val  # This is actually an XmlElement, need to get text
        if ($colNum -is [System.Xml.XmlElement]) {
            $colNum = $colNum.InnerText
        }
        # Type can be XmlElement with val attribute or plain text
        $type = $sel.Type.val
        if (-not $type) { $type = $sel.Type.InnerText }
        if (-not $type) { $type = $sel.Type }

        # Calculate variable letter (with auto-calculated offset)
        $fieldIdx = $fieldId - 1 + $MainOffset
        $varLetter = Convert-IndexToVariable $fieldIdx

        # Get Init expression if available (both formats)
        if ($initMap.ContainsKey("$fieldId")) {
            $initInfo = $initMap["$fieldId"]
            $initCompact = $initInfo.compact
            $initExpanded = $initInfo.expanded

            # Add condition if present
            if ($initInfo.condCompact) {
                $initCompact = "$initCompact [IF $($initInfo.condCompact)]"
                $initExpanded = "$initExpanded [IF $($initInfo.condExpanded)]"
            }
        }

        # Check if it's a parameter (IsParameter can be XmlElement with val)
        $isParam = $sel.IsParameter.val
        if (-not $isParam) { $isParam = $sel.IsParameter }

        $colName = ""
        if ($isParam -eq "Y") {
            # colNum is the position in virtual columns list
            $colName = if ($virtualColumns.ContainsKey("$colNum")) { $virtualColumns["$colNum"] } else { "Param $colNum" }
            $padded = "{0,-32}" -f $colName
            $output = "{0,3}  [{1,-2}] Parameter   {2}" -f $lineNum, $varLetter, $padded
        }
        # Get column info based on type
        elseif ($type -eq "V") {
            # Virtual column - colNum is position in list
            $colName = if ($virtualColumns.ContainsKey("$colNum")) { $virtualColumns["$colNum"] } else { "Virtual $colNum" }
            $padded = "{0,-32}" -f $colName
            $output = "{0,3}  [{1,-2}] Virtual     {2}" -f $lineNum, $varLetter, $padded
        } else {
            # Real column from table - look up name using new mapping
            $colName = Get-ColumnName $currentTableObj $colNum
            if (-not $colName) { $colName = "Col $colNum" }
            $padded = "{0,-32}" -f $colName
            $output = "{0,3}  [{1,-2}] Column      {2}" -f $lineNum, $varLetter, $padded
        }

        # Store column name for fieldToColName (for real columns)
        if ($colName -and -not $fieldToColName.ContainsKey("$fieldId")) {
            $fieldToColName["$fieldId"] = $colName
        }
    }

    # ----------------------------------------
    # LNK - Link Query/Create/Write
    # ----------------------------------------
    elseif ($logicLine.LNK) {
        $lnk = $logicLine.LNK
        $obj = $lnk.DB.obj
        $key = $lnk.Key
        $mode = $lnk.Mode

        # Mode: R=Read(Query), A=Add(Create), W=Write, L=Link(Inner)
        $linkType = switch ($mode) {
            "A" { "Link Create" }
            "W" { "Link Write" }
            "L" { "Link Inner" }
            default { "Link Query" }
        }

        $tableDisp = Get-TableDisplay $obj
        $inLink = $true
        $currentTableObj = $obj  # Switch to link table for column names

        $output = "{0,3}  [+]  {1,-11} {2}  Index: {3}" -f $lineNum, $linkType, $tableDisp, $key
    }

    # ----------------------------------------
    # END_LINK - Link Query end
    # ----------------------------------------
    elseif ($logicLine.END_LINK) {
        $output = "{0,3}       End Link" -f $lineNum
        $inLink = $false
        # Reset to main table (first DB with IDX from DATAVIEW_SRC)
        $mainDb = $dbList | Where-Object { $_.Index -eq $mainTableIdx } | Select-Object -First 1
        if ($mainDb) { $currentTableObj = $mainDb.Obj }
    }

    # ----------------------------------------
    # Remark - Empty line (comment/spacer)
    # ----------------------------------------
    elseif ($logicLine.Remark) {
        $output = "{0,3}" -f $lineNum
    }

    # Output if we have something
    if ($output) {
        # Store for later display
        $outputLines += @{
            line = $output
            initCompact = $initCompact
            initExpanded = $initExpanded
        }
        $lineNum++
    }
}

# Display compact view
foreach ($item in $outputLines) {
    $line = $item.line
    $init = $item.initCompact
    if ($init) {
        # Truncate if too long
        if ($init.Length -gt 40) {
            $init = $init.Substring(0, 37) + "..."
        }
        Write-Host "$line $init"
    } else {
        Write-Host $line
    }
}

Write-Host ""
Write-Host "Total: $($lineNum - 1) lines" -ForegroundColor DarkGray

# ============================================
# EXPANDED VIEW (only for lines with Init)
# ============================================
$hasInit = $outputLines | Where-Object { $_.initExpanded }
if ($hasInit) {
    Write-Host ""
    Write-Host "=== EXPANDED VIEW (Init avec noms colonnes) ===" -ForegroundColor Yellow
    Write-Host ""

    $lineIdx = 1
    foreach ($item in $outputLines) {
        if ($item.initExpanded) {
            # Extract variable from line (e.g., "[GS]")
            if ($item.line -match '\[([A-Z]+)\]') {
                $var = $matches[1]
                Write-Host "[$var] $($item.initExpanded)" -ForegroundColor Green
            }
        }
        $lineIdx++
    }
}
