<#
.SYNOPSIS
    Parse un fichier XML Magic - Version 6 avec DIAGRAMME ASCII et EXPORT MARKDOWN

.DESCRIPTION
    Evolution de v5 avec:
    - Generation automatique de diagramme ASCII du flux
    - Resolution des CallTask/CallProgram avec noms programmes
    - Export Markdown structure pour tickets
    - Validation projet via magic-config.json (dynamique)
    - Detection automatique des points d'interet (Update, CallProgram)

.PARAMETER Project
    Nom du projet - valide contre magic-config.json

.PARAMETER PrgId
    ID du programme (numero du fichier Prg_XXX.xml)

.PARAMETER TaskIsn
    ISN_2 de la tache a analyser

.PARAMETER OutputFile
    Fichier Markdown de sortie (optionnel)

.EXAMPLE
    .\magic-logic-parser-v6.ps1 -Project VIL -PrgId 558 -TaskIsn 19
    .\magic-logic-parser-v6.ps1 -Project ADH -PrgId 121 -TaskIsn 3 -OutputFile analysis.md
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$PrgId,

    [Parameter(Mandatory=$true)]
    [int]$TaskIsn,

    [string]$OutputFile
)

$ErrorActionPreference = "Stop"

# Load dynamic config
$configPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\magic-config.json"
$config = $null
$validProjects = @("ADH", "PBG", "PBP", "PVE", "REF", "VIL", "PUG")

if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.projects.all) {
        $validProjects = $config.projects.all
    }
}

$Project = $Project.ToUpperInvariant()
if ($Project -notin $validProjects) {
    Write-Warning "Project '$Project' not in known projects. Run magic-config-generator.ps1 to update."
}

$BasePath = "D:\Data\Migration\XPA\PMS\$Project\Source"
$PrgFile = Join-Path $BasePath "Prg_$PrgId.xml"
$CompsFile = Join-Path $BasePath "Comps.xml"
$PrgHeadersFile = Join-Path $BasePath "ProgramHeaders.xml"

if (-not (Test-Path $PrgFile)) {
    Write-Error "Fichier non trouve: $PrgFile"
    exit 1
}

# Output buffer for Markdown
$mdOutput = [System.Text.StringBuilder]::new()

function Add-MD { param([string]$Text) [void]$mdOutput.AppendLine($Text) }

# ============================================
# CHARGEMENT DES DONNEES
# ============================================

Write-Host "Chargement des fichiers XML..." -ForegroundColor Cyan
[xml]$xml = Get-Content $PrgFile -Encoding UTF8
[xml]$comps = Get-Content $CompsFile -Encoding UTF8
[xml]$prgHeaders = Get-Content $PrgHeadersFile -Encoding UTF8

$refDSPath = "D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml"
[xml]$refDS = if (Test-Path $refDSPath) { Get-Content $refDSPath -Encoding UTF8 } else { $null }

$tableCache = @{}
$callGraph = @()  # Stocke les appels pour le diagramme

# ============================================
# FONCTIONS UTILITAIRES
# ============================================

function Convert-IndexToLetter {
    param([int]$Index)
    if ($Index -lt 0) { return "?" }
    if ($Index -lt 26) { return [char](65 + $Index) }
    elseif ($Index -lt 702) {
        $first = [int][Math]::Floor(($Index - 26) / 26)
        $second = ($Index - 26) % 26
        return [char](65 + $first) + [char](65 + $second)
    }
    else {
        $Index -= 702
        $first = [int][Math]::Floor($Index / 676)
        $remainder = $Index % 676
        $second = [int][Math]::Floor($remainder / 26)
        $third = $remainder % 26
        return [char](65 + $first) + [char](65 + $second) + [char](65 + $third)
    }
}

function Get-FieldType {
    param([System.Xml.XmlElement]$Column)
    $model = $Column.SelectSingleNode(".//Model/@attr_obj")
    if ($model) { return $model.Value -replace "FIELD_", "" }
    return "Unknown"
}

function Get-TableInfo {
    param([int]$CompId, [int]$ObjId)
    $cacheKey = "$CompId-$ObjId"
    if ($tableCache.ContainsKey($cacheKey)) { return $tableCache[$cacheKey] }

    $result = @{ Name = "?"; PhysicalName = "?"; Columns = @(); ColumnCount = 0 }
    if ($CompId -le 0) { $tableCache[$cacheKey] = $result; return $result }

    $comp = $comps.SelectSingleNode("//Component[@id='$CompId']")
    if (-not $comp) { $tableCache[$cacheKey] = $result; return $result }

    $obj = $comp.SelectSingleNode("./ComponentDataObjects/Object[id/@val='$ObjId']")
    if (-not $obj) { $tableCache[$cacheKey] = $result; return $result }

    $itemIsn = $obj.SelectSingleNode("ItemIsn/@val").Value
    $publicName = $obj.SelectSingleNode("PublicName/@val")
    if ($publicName) { $result.Name = $publicName.Value }

    if ($refDS) {
        $table = $refDS.SelectSingleNode("//DataObject[@id='$itemIsn']")
        if (-not $table) { $table = $refDS.SelectSingleNode("//DataObject[@ItemIsn='$itemIsn']") }
        if ($table) {
            $result.Name = $table.name
            $result.PhysicalName = $table.PhysicalName
            $cols = $table.SelectNodes("./Columns/Column")
            $result.ColumnCount = $cols.Count
            foreach ($col in $cols) {
                $result.Columns += @{ Id = $col.id; Name = $col.name; Type = Get-FieldType -Column $col }
            }
        }
    }

    $tableCache[$cacheKey] = $result
    return $result
}

function Get-ProgramInfo {
    param([int]$TaskId, [bool]$IsLocal = $false)

    # Local subtask
    if ($IsLocal) {
        $localTask = $xml.SelectSingleNode("//Task[Header[@ISN_2='$TaskId']]")
        if ($localTask) {
            return @{
                Type = "SubTask"
                Id = $TaskId
                Name = $localTask.Header.Description
                Display = "Tache $TaskIsn.$TaskId"
            }
        }
    }

    # External program
    $prgHeader = $prgHeaders.SelectSingleNode("//ProgramHeader[@id='$TaskId']")
    if ($prgHeader) {
        $publicName = $prgHeader.PublicName
        $name = if ($publicName) { $publicName } else { $prgHeader.Description }
        return @{
            Type = "Program"
            Id = $TaskId
            Name = $name
            Display = "$Project IDE $TaskId - $name"
        }
    }

    return @{ Type = "Unknown"; Id = $TaskId; Name = "?"; Display = "Programme $TaskId" }
}

# ============================================
# CONSTRUCTION DE LA HIERARCHIE
# ============================================

Write-Host "Construction de la hierarchie des taches..." -ForegroundColor Yellow

$targetTask = $xml.SelectSingleNode("//Task[Header[@ISN_2='$TaskIsn']]")
if (-not $targetTask) {
    Write-Error "Tache ISN_2=$TaskIsn non trouvee"
    exit 1
}

$taskName = $targetTask.Header.Description
Write-Host "Tache trouvee: $taskName (ISN_2=$TaskIsn)" -ForegroundColor Green

# Get program name
$prgInfo = Get-ProgramInfo -TaskId $PrgId -IsLocal $false
$programDisplay = "$Project IDE $PrgId"
if ($prgInfo.Name -ne "?") { $programDisplay += " - $($prgInfo.Name)" }

# Build path
$path = [System.Collections.ArrayList]::new()
$current = $targetTask
while ($current.LocalName -eq "Task") {
    [void]$path.Insert(0, $current)
    $current = $current.ParentNode
}

# ============================================
# CONSTRUIRE LA MAP PAR POSITION SEQUENTIELLE
# ============================================

$positionMap = @{}
$globalOffset = 0

for ($pathIdx = 0; $pathIdx -lt $path.Count; $pathIdx++) {
    $task = $path[$pathIdx]
    $level = $path.Count - 1 - $pathIdx
    $resource = $task.SelectSingleNode("./Resource")
    $localPosition = 0

    # Main Source columns
    $db = $resource.SelectSingleNode("./DB/DataObject")
    if ($db) {
        $tableInfo = Get-TableInfo -CompId $db.comp -ObjId $db.obj
        foreach ($col in $tableInfo.Columns) {
            $globalIndex = $globalOffset + $localPosition
            $letter = Convert-IndexToLetter -Index $globalIndex
            $positionMap["$level,$localPosition"] = @{
                Letter = $letter; Name = $col.Name; Type = $col.Type
                Source = "Table $($tableInfo.Name)"; GlobalIndex = $globalIndex
            }
            $localPosition++
        }
    }

    # Link columns
    $links = $resource.SelectNodes("./Links/Link")
    $linkNum = 1
    foreach ($link in $links) {
        $linkDb = $link.SelectSingleNode("./DB/DataObject")
        if ($linkDb) {
            $linkTableInfo = Get-TableInfo -CompId $linkDb.comp -ObjId $linkDb.obj
            foreach ($col in $linkTableInfo.Columns) {
                $globalIndex = $globalOffset + $localPosition
                $letter = Convert-IndexToLetter -Index $globalIndex
                $positionMap["$level,$localPosition"] = @{
                    Letter = $letter; Name = $col.Name; Type = $col.Type
                    Source = "Link$linkNum $($linkTableInfo.Name)"; GlobalIndex = $globalIndex
                }
                $localPosition++
            }
        }
        $linkNum++
    }

    # Local columns
    $localCols = $resource.SelectNodes("./Columns/Column")
    foreach ($col in $localCols) {
        $globalIndex = $globalOffset + $localPosition
        $letter = Convert-IndexToLetter -Index $globalIndex
        $positionMap["$level,$localPosition"] = @{
            Letter = $letter; Name = $col.name; Type = Get-FieldType -Column $col
            Source = "Local"; GlobalIndex = $globalIndex
        }
        $localPosition++
    }

    $globalOffset += $localPosition
}

# ============================================
# PARSE EXPRESSIONS
# ============================================

function Translate-Expression {
    param([string]$Formula, [hashtable]$PosMap)
    if (-not $Formula) { return @{ WithLetters = "?"; WithNames = "?" } }

    $withLetters = $Formula
    $withNames = $Formula
    $pattern = '\{(\d+),(\d+)\}'

    $allMatches = [regex]::Matches($Formula, $pattern)
    foreach ($match in $allMatches) {
        $level = [int]$match.Groups[1].Value
        $position = [int]$match.Groups[2].Value

        if ($level -eq 32768) {
            $withLetters = $withLetters -replace [regex]::Escape($match.Value), "VG.$position"
            $withNames = $withNames -replace [regex]::Escape($match.Value), "VG.$position"
            continue
        }

        $key = "$level,$position"
        if ($PosMap.ContainsKey($key)) {
            $varInfo = $PosMap[$key]
            $withLetters = $withLetters -replace [regex]::Escape($match.Value), $varInfo.Letter
            $withNames = $withNames -replace [regex]::Escape($match.Value), $varInfo.Name
        }
    }

    return @{ WithLetters = $withLetters; WithNames = $withNames }
}

$expressions = $targetTask.SelectSingleNode("./Expressions")
$expList = @{}

if ($expressions) {
    foreach ($exp in $expressions.SelectNodes("Expression")) {
        $expId = $exp.id
        $syntaxNode = $exp.SelectSingleNode("ExpSyntax/@val")
        $formula = if ($syntaxNode) { $syntaxNode.Value } else { $null }
        if ($formula) {
            $translated = Translate-Expression -Formula $formula -PosMap $positionMap
            $expList[$expId] = @{
                Id = $expId; Raw = $formula
                WithLetters = $translated.WithLetters
                WithNames = $translated.WithNames
            }
        }
    }
}

# ============================================
# PARSE LOGIC AND BUILD CALL GRAPH
# ============================================

$resource = $targetTask.SelectSingleNode("./Resource")
$columns = $targetTask.SelectNodes("./Resource/Columns/Column")

# Calculate local start position
$db = $resource.SelectSingleNode("./DB/DataObject")
$mainSourceCount = 0
if ($db) {
    $tableInfo = Get-TableInfo -CompId $db.comp -ObjId $db.obj
    $mainSourceCount = $tableInfo.ColumnCount
}
$links = $resource.SelectNodes("./Links/Link")
$linksCount = 0
foreach ($link in $links) {
    $linkDb = $link.SelectSingleNode("./DB/DataObject")
    if ($linkDb) {
        $linkTableInfo = Get-TableInfo -CompId $linkDb.comp -ObjId $linkDb.obj
        $linksCount += $linkTableInfo.ColumnCount
    }
}
$localStartPosition = $mainSourceCount + $linksCount

# FieldID to position map
$fieldIdToPosition = @{}
$pos = $localStartPosition
foreach ($col in $columns) {
    $fieldIdToPosition[[int]$col.id] = $pos
    $pos++
}

# Parse logic
$taskLogic = $targetTask.SelectSingleNode(".//TaskLogic")
$logicUnits = $taskLogic.SelectNodes("LogicUnit")
$logicLines = @()
$lineNumber = 1

$levelTypes = @{ "T" = "Task"; "R" = "Record"; "C" = "Control"; "G" = "Group" }

foreach ($unit in $logicUnits) {
    $unitLevel = $unit.Level.val
    $unitType = $unit.Type.val
    $handlerName = ""
    if ($levelTypes.ContainsKey($unitLevel)) { $handlerName = $levelTypes[$unitLevel] }
    if ($unitType -eq "P") { $handlerName += " Prefix" }
    elseif ($unitType -eq "S") { $handlerName += " Suffix" }

    $logicLines += @{ LineNum = $lineNumber; Operation = $handlerName.Trim(); Type = "Header"; Details = "" }
    $lineNumber++

    foreach ($line in $unit.SelectNodes("LogicLines/LogicLine")) {
        $childNode = $line.FirstChild
        if (-not $childNode) { continue }

        $operation = $childNode.LocalName
        $lineInfo = @{
            LineNum = $lineNumber; Operation = $operation; Type = ""
            Variable = ""; VarName = ""; ExpNum = ""; ExpLetters = ""; ExpNames = ""; Details = ""
            IsDisabled = ($line.Disabled.val -eq "1")
        }

        switch ($operation) {
            "Update" {
                $fieldId = [int]$childNode.FieldID.val
                $withValue = $childNode.WithValue.val

                if ($fieldIdToPosition.ContainsKey($fieldId)) {
                    $dvPos = $fieldIdToPosition[$fieldId]
                    $key = "0,$dvPos"
                    if ($positionMap.ContainsKey($key)) {
                        $varInfo = $positionMap[$key]
                        $lineInfo.Variable = $varInfo.Letter
                        $lineInfo.VarName = $varInfo.Name
                    }
                }

                $lineInfo.Type = "Variable"
                $lineInfo.ExpNum = $withValue
                if ($withValue -and $expList.ContainsKey($withValue)) {
                    $exp = $expList[$withValue]
                    $lineInfo.ExpLetters = $exp.WithLetters
                    $lineInfo.ExpNames = $exp.WithNames
                }
            }
            "CallTask" {
                $taskId = [int]$childNode.TaskID.obj
                $isLocal = ($childNode.TaskID.comp -eq "0")
                $progInfo = Get-ProgramInfo -TaskId $taskId -IsLocal $isLocal

                $lineInfo.Type = "Call"
                $lineInfo.Details = $progInfo.Display

                # Add to call graph
                $callGraph += @{
                    Line = $lineNumber
                    Type = if ($isLocal) { "CallSubTask" } else { "CallProgram" }
                    TargetId = $taskId
                    TargetName = $progInfo.Name
                    TargetDisplay = $progInfo.Display
                    Condition = $null
                }

                $condition = $childNode.SelectSingleNode("Condition")
                if ($condition -and $condition.Exp) {
                    $lineInfo.ExpNum = $condition.Exp
                    if ($expList.ContainsKey($condition.Exp)) {
                        $exp = $expList[$condition.Exp]
                        $lineInfo.ExpLetters = $exp.WithLetters
                    }
                    $callGraph[-1].Condition = $condition.Exp
                }
            }
            "BLOCK" {
                $condition = $childNode.SelectSingleNode("Condition")
                $lineInfo.Type = "If"
                if ($condition -and $condition.Exp) {
                    $lineInfo.ExpNum = $condition.Exp
                    if ($expList.ContainsKey($condition.Exp)) {
                        $exp = $expList[$condition.Exp]
                        $lineInfo.ExpLetters = $exp.WithLetters
                        $lineInfo.ExpNames = $exp.WithNames
                    }
                }
            }
            "END_BLK" { $lineInfo.Type = "End"; $lineInfo.Details = "}" }
            "Remark" { $lineInfo.Type = "Remark"; $lineInfo.Details = $childNode.Text.val }
            default { $lineInfo.Type = $operation }
        }

        $logicLines += $lineInfo
        $lineNumber++
    }
}

# ============================================
# GENERATE ASCII DIAGRAM
# ============================================

function Generate-AsciiDiagram {
    $diagram = [System.Text.StringBuilder]::new()
    [void]$diagram.AppendLine('```')
    [void]$diagram.AppendLine("FLUX: $programDisplay")
    [void]$diagram.AppendLine("Tache: $TaskIsn - $taskName")
    [void]$diagram.AppendLine(('=' * 50))
    [void]$diagram.AppendLine('')

    # Root box
    $boxWidth = 45
    [void]$diagram.AppendLine(('+' + ('-' * ($boxWidth - 2)) + '+'))
    [void]$diagram.AppendLine(('| ' + $programDisplay.PadRight($boxWidth - 4) + ' |'))
    [void]$diagram.AppendLine(('| Tache ' + $TaskIsn.ToString().PadRight($boxWidth - 10) + ' |'))
    [void]$diagram.AppendLine(('+' + ('-' * (($boxWidth - 2) / 2)) + '+' + ('-' * (($boxWidth - 2) / 2)) + '+'))

    if ($callGraph.Count -gt 0) {
        foreach ($call in $callGraph) {
            $arrow = if ($call.Condition) { " (cond: Exp $($call.Condition))" } else { "" }
            [void]$diagram.AppendLine(('                       |'))
            [void]$diagram.AppendLine(("                       | $($call.Type)$arrow"))
            [void]$diagram.AppendLine(('                       v'))

            $targetDisplay = $call.TargetDisplay
            if ($targetDisplay.Length -gt ($boxWidth - 6)) {
                $targetDisplay = $targetDisplay.Substring(0, $boxWidth - 9) + "..."
            }

            [void]$diagram.AppendLine(('         +' + ('-' * ($boxWidth - 12)) + '+'))
            [void]$diagram.AppendLine(('         | ' + $targetDisplay.PadRight($boxWidth - 14) + ' |'))
            [void]$diagram.AppendLine(('         +' + ('-' * ($boxWidth - 12)) + '+'))
        }
    } else {
        [void]$diagram.AppendLine(('                       |'))
        [void]$diagram.AppendLine(('                       v'))
        [void]$diagram.AppendLine(('              (pas d''appels externes)'))
    }

    [void]$diagram.AppendLine('')
    [void]$diagram.AppendLine('```')
    return $diagram.ToString()
}

# ============================================
# GENERATE MARKDOWN OUTPUT
# ============================================

Add-MD "## Analyse Logic - $programDisplay"
Add-MD ""
Add-MD "> **Tache**: $TaskIsn - $taskName"
Add-MD "> **Genere**: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Add-MD ""
Add-MD "---"
Add-MD ""

# Call Graph section
Add-MD "### Diagramme de Flux"
Add-MD ""
Add-MD (Generate-AsciiDiagram)
Add-MD ""

# Calls summary
if ($callGraph.Count -gt 0) {
    Add-MD "### Appels Detectes"
    Add-MD ""
    Add-MD "| Ligne | Type | Cible | Condition |"
    Add-MD "|-------|------|-------|-----------|"
    foreach ($call in $callGraph) {
        $cond = if ($call.Condition) { "Exp $($call.Condition)" } else { "-" }
        Add-MD "| $($call.Line) | $($call.Type) | $($call.TargetDisplay) | $cond |"
    }
    Add-MD ""
}

# Variables section
Add-MD "### Variables Locales"
Add-MD ""
Add-MD "| Lettre | Nom | Type | Source |"
Add-MD "|--------|-----|------|--------|"

$localVars = $positionMap.GetEnumerator() | Where-Object { $_.Key -like "0,*" -and $_.Value.Source -eq "Local" }
foreach ($v in $localVars | Sort-Object { $_.Value.GlobalIndex }) {
    Add-MD "| **$($v.Value.Letter)** | $($v.Value.Name) | $($v.Value.Type) | $($v.Value.Source) |"
}
Add-MD ""

# Expressions section
if ($expList.Count -gt 0) {
    Add-MD "### Expressions"
    Add-MD ""
    Add-MD "| # | Formule | Traduction |"
    Add-MD "|---|---------|------------|"
    foreach ($key in $expList.Keys | Sort-Object { [int]$_ }) {
        $e = $expList[$key]
        $letters = if ($e.WithLetters.Length -gt 50) { $e.WithLetters.Substring(0,47) + "..." } else { $e.WithLetters }
        Add-MD "| $($e.Id) | ``$($e.Raw)`` | ``$letters`` |"
    }
    Add-MD ""
}

# Logic section
Add-MD "### Logic"
Add-MD ""
Add-MD "| Ligne | Operation | Type | Variable | Expression |"
Add-MD "|-------|-----------|------|----------|------------|"

foreach ($l in $logicLines) {
    $disabled = if ($l.IsDisabled) { " [D]" } else { "" }
    if ($l.Type -eq "Header") {
        Add-MD "| **$($l.LineNum)** | **$($l.Operation)$disabled** | | | |"
    }
    elseif ($l.Type -in @("Variable", "Call", "If", "End")) {
        $varDisplay = if ($l.Variable) { "**$($l.Variable)** ($($l.VarName))" } else { "" }
        $expDisplay = if ($l.ExpLetters.Length -gt 40) { $l.ExpLetters.Substring(0,37) + "..." } else { $l.ExpLetters }
        $details = if ($l.Details -and $l.Details.Length -gt 30) { $l.Details.Substring(0,27) + "..." } else { $l.Details }

        if ($l.Type -eq "Call") {
            Add-MD "| $($l.LineNum)$disabled | $($l.Operation) | $($l.Type) | $details | Exp $($l.ExpNum) |"
        } else {
            Add-MD "| $($l.LineNum)$disabled | $($l.Operation) | $($l.Type) | $varDisplay | ``$expDisplay`` |"
        }
    }
}

Add-MD ""
Add-MD "---"
Add-MD "*Genere par magic-logic-parser-v6.ps1*"

# ============================================
# OUTPUT
# ============================================

$mdContent = $mdOutput.ToString()

# Console output
Write-Host ""
Write-Host "=== DIAGRAMME ===" -ForegroundColor Cyan
Write-Host (Generate-AsciiDiagram)

Write-Host "=== APPELS DETECTES ===" -ForegroundColor Yellow
if ($callGraph.Count -gt 0) {
    foreach ($call in $callGraph) {
        Write-Host "  Ligne $($call.Line): $($call.Type) -> $($call.TargetDisplay)"
    }
} else {
    Write-Host "  (aucun appel externe)"
}

Write-Host ""
Write-Host "=== VARIABLES LOCALES ===" -ForegroundColor Yellow
foreach ($v in $localVars | Sort-Object { $_.Value.GlobalIndex }) {
    Write-Host "  $($v.Value.Letter) = $($v.Value.Name) ($($v.Value.Type))"
}

# File output
if ($OutputFile) {
    $mdContent | Set-Content $OutputFile -Encoding UTF8
    Write-Host ""
    Write-Host "Markdown exporte: $OutputFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== FIN ===" -ForegroundColor Cyan
