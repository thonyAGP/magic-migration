<#
.SYNOPSIS
    Parse un fichier XML Magic - Version 5 DETERMINISTE 100%

.DESCRIPTION
    Version corrigee avec mapping par POSITION SEQUENTIELLE (pas Column ID):
    - {niveau, position} reference la position dans le DataView
    - Position = index sequentiel (0, 1, 2, ...) dans l'ordre:
      1. Colonnes table Main Source
      2. Colonnes tables Links
      3. Colonnes locales (virtuelles)

.PARAMETER Project
    Nom du projet (ADH, PBG, PBP, PVE, REF, VIL)

.PARAMETER PrgId
    ID du programme (numero du fichier Prg_XXX.xml)

.PARAMETER TaskIsn
    ISN_2 de la tache a analyser

.EXAMPLE
    .\magic-logic-parser-v5.ps1 -Project VIL -PrgId 558 -TaskIsn 19
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("ADH", "PBG", "PBP", "PVE", "REF", "VIL")]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$PrgId,

    [Parameter(Mandatory=$true)]
    [int]$TaskIsn
)

$BasePath = "D:\Data\Migration\XPA\PMS\$Project\Source"
$PrgFile = Join-Path $BasePath "Prg_$PrgId.xml"
$CompsFile = Join-Path $BasePath "Comps.xml"
$PrgHeadersFile = Join-Path $BasePath "ProgramHeaders.xml"

if (-not (Test-Path $PrgFile)) {
    Write-Error "Fichier non trouve: $PrgFile"
    exit 1
}

# ============================================
# CHARGEMENT DES DONNEES
# ============================================

Write-Host "Chargement des fichiers XML..." -ForegroundColor Cyan
[xml]$xml = Get-Content $PrgFile -Encoding UTF8
[xml]$comps = Get-Content $CompsFile -Encoding UTF8
[xml]$prgHeaders = Get-Content $PrgHeadersFile -Encoding UTF8
[xml]$refDS = Get-Content "D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml" -Encoding UTF8

$tableCache = @{}

# ============================================
# FONCTIONS UTILITAIRES
# ============================================

function Convert-IndexToLetter {
    param([int]$Index)

    if ($Index -lt 0) { return "?" }
    if ($Index -lt 26) {
        return [char](65 + $Index)
    }
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
    if ($model) {
        return $model.Value -replace "FIELD_", ""
    }
    return "Unknown"
}

function Get-TableInfo {
    param(
        [int]$CompId,
        [int]$ObjId
    )

    $cacheKey = "$CompId-$ObjId"
    if ($tableCache.ContainsKey($cacheKey)) {
        return $tableCache[$cacheKey]
    }

    $result = @{
        Name = "?"
        PhysicalName = "?"
        Columns = @()
        ColumnCount = 0
    }

    if ($CompId -le 0) {
        $tableCache[$cacheKey] = $result
        return $result
    }

    $comp = $comps.SelectSingleNode("//Component[@id='$CompId']")
    if (-not $comp) {
        $tableCache[$cacheKey] = $result
        return $result
    }

    $obj = $comp.SelectSingleNode("./ComponentDataObjects/Object[id/@val='$ObjId']")
    if (-not $obj) {
        $tableCache[$cacheKey] = $result
        return $result
    }

    $itemIsn = $obj.SelectSingleNode("ItemIsn/@val").Value
    $publicName = $obj.SelectSingleNode("PublicName/@val")
    if ($publicName) {
        $result.Name = $publicName.Value
    }

    $table = $refDS.SelectSingleNode("//DataObject[@id='$itemIsn']")
    if (-not $table) { $table = $refDS.SelectSingleNode("//DataObject[@ItemIsn='$itemIsn']") }

    if ($table) {
        $result.Name = $table.name
        $result.PhysicalName = $table.PhysicalName
        $cols = $table.SelectNodes("./Columns/Column")
        $result.ColumnCount = $cols.Count

        foreach ($col in $cols) {
            $result.Columns += @{
                Id = $col.id
                Name = $col.name
                Type = Get-FieldType -Column $col
            }
        }
    }

    $tableCache[$cacheKey] = $result
    return $result
}

function Get-ProgramName {
    param([int]$TaskId)

    $localTask = $xml.SelectSingleNode("//Task[Header[@ISN_2='$TaskId']]")
    if ($localTask) {
        return "Sous-tache $TaskId : $($localTask.Header.Description)"
    }

    $prgHeader = $prgHeaders.SelectSingleNode("//ProgramHeader[@id='$TaskId']")
    if ($prgHeader) {
        $publicName = $prgHeader.PublicName
        if ($publicName) {
            return "$Project IDE $TaskId - $publicName"
        }
        return "$Project IDE $TaskId - $($prgHeader.Description)"
    }

    return "Programme $TaskId"
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

$path = [System.Collections.ArrayList]::new()
$current = $targetTask

while ($current.LocalName -eq "Task") {
    [void]$path.Insert(0, $current)
    $current = $current.ParentNode
}

Write-Host "Chemin hierarchique:" -ForegroundColor Cyan
foreach ($t in $path) {
    $h = $t.SelectSingleNode("Header")
    Write-Host "  ISN=$($h.ISN_2) : $($h.Description)"
}

# ============================================
# CONSTRUIRE LA MAP PAR POSITION SEQUENTIELLE
# ============================================

Write-Host ""
Write-Host "Construction de la map par POSITION SEQUENTIELLE..." -ForegroundColor Yellow

# Map globale: "niveau,position" -> info variable
$positionMap = @{}

# Offset global pour calculer la lettre
$globalOffset = 0

# Pour chaque tache dans le chemin
for ($pathIdx = 0; $pathIdx -lt $path.Count; $pathIdx++) {
    $task = $path[$pathIdx]
    $level = $path.Count - 1 - $pathIdx  # Niveau inverse (0 = cible)
    $h = $task.SelectSingleNode("Header")
    $resource = $task.SelectSingleNode("./Resource")

    Write-Host "  Niveau $level (ISN=$($h.ISN_2)): globalOffset=$globalOffset" -ForegroundColor Gray

    $localPosition = 0  # Position dans le DataView de CETTE tache

    # 1. Colonnes de la table Main Source
    $db = $resource.SelectSingleNode("./DB/DataObject")
    if ($db) {
        $tableInfo = Get-TableInfo -CompId $db.comp -ObjId $db.obj
        foreach ($col in $tableInfo.Columns) {
            $globalIndex = $globalOffset + $localPosition
            $letter = Convert-IndexToLetter -Index $globalIndex
            $positionMap["$level,$localPosition"] = @{
                Letter = $letter
                Name = $col.Name
                Type = $col.Type
                Source = "Table $($tableInfo.Name)"
                GlobalIndex = $globalIndex
                LocalPosition = $localPosition
            }
            $localPosition++
        }
    }

    # 2. Colonnes des Links
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
                    Letter = $letter
                    Name = $col.Name
                    Type = $col.Type
                    Source = "Link$linkNum $($linkTableInfo.Name)"
                    GlobalIndex = $globalIndex
                    LocalPosition = $localPosition
                }
                $localPosition++
            }
        }
        $linkNum++
    }

    # 3. Colonnes locales (virtuelles)
    $localCols = $resource.SelectNodes("./Columns/Column")
    foreach ($col in $localCols) {
        $globalIndex = $globalOffset + $localPosition
        $letter = Convert-IndexToLetter -Index $globalIndex
        $positionMap["$level,$localPosition"] = @{
            Letter = $letter
            Name = $col.name
            Type = Get-FieldType -Column $col
            Source = "Local"
            GlobalIndex = $globalIndex
            LocalPosition = $localPosition
        }
        $localPosition++
    }

    # Incrementer l'offset global
    $globalOffset += $localPosition
}

# Offset pour les variables locales de la tache cible
$targetLocalCols = $targetTask.SelectNodes("./Resource/Columns/Column")
$targetOffset = $globalOffset - $targetLocalCols.Count

Write-Host ""
Write-Host "OFFSET pour variables locales cible: $targetOffset" -ForegroundColor Green
$firstLetter = Convert-IndexToLetter -Index $targetOffset
Write-Host "Premiere variable locale: $firstLetter (index $targetOffset)"

# ============================================
# AFFICHER LES TABLES UTILISEES
# ============================================

Write-Host ""
Write-Host "=== TABLES UTILISEES ===" -ForegroundColor Yellow

$resource = $targetTask.SelectSingleNode("./Resource")
$db = $resource.SelectSingleNode("./DB/DataObject")

if ($db) {
    $tableInfo = Get-TableInfo -CompId $db.comp -ObjId $db.obj
    Write-Host ""
    Write-Host "MAIN SOURCE: Table n$([char]0xB0)$($db.obj) - $($tableInfo.Name)" -ForegroundColor Cyan
    Write-Host "  Nom physique: $($tableInfo.PhysicalName)"
    Write-Host "  Colonnes: $($tableInfo.ColumnCount)"

    if ($tableInfo.Columns.Count -gt 0) {
        Write-Host ""
        Write-Host "  | # | Colonne | Type |"
        Write-Host "  |---|---------|------|"
        $idx = 0
        foreach ($col in $tableInfo.Columns) {
            if ($idx -lt 10) {
                Write-Host ("  | {0} | {1} | {2} |" -f $col.Id, $col.Name, $col.Type)
            }
            $idx++
        }
        if ($tableInfo.Columns.Count -gt 10) {
            Write-Host "  | ... | ... et $($tableInfo.Columns.Count - 10) autres | |"
        }
    }
}

$links = $resource.SelectNodes("./Links/Link")
$linkIdx = 1
foreach ($link in $links) {
    $linkDb = $link.SelectSingleNode("./DB/DataObject")
    if ($linkDb) {
        $linkTableInfo = Get-TableInfo -CompId $linkDb.comp -ObjId $linkDb.obj
        Write-Host ""
        Write-Host "LINK ${linkIdx}: Table n$([char]0xB0)$($linkDb.obj) - $($linkTableInfo.Name)" -ForegroundColor Cyan
        Write-Host "  Colonnes: $($linkTableInfo.ColumnCount)"
    }
    $linkIdx++
}

# ============================================
# AFFICHER LES VARIABLES LOCALES
# ============================================

Write-Host ""
Write-Host "=== VARIABLES LOCALES (niveau 0) ===" -ForegroundColor Yellow

$columns = $targetTask.SelectNodes("./Resource/Columns/Column")

Write-Host ""
Write-Host "| Lettre | Position | Nom | Type |"
Write-Host "|--------|----------|-----|------|"

# Calculer la position de depart des locales dans le DataView cible
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

$position = 0
foreach ($col in $columns) {
    $dataViewPosition = $localStartPosition + $position
    $globalIndex = $targetOffset + $position
    $letter = Convert-IndexToLetter -Index $globalIndex

    Write-Host ("| **{0}** | {1} | {2} | {3} |" -f $letter, $dataViewPosition, $col.name, (Get-FieldType -Column $col))
    $position++
}

# ============================================
# PARSER LES EXPRESSIONS
# ============================================

Write-Host ""
Write-Host "=== EXPRESSIONS ===" -ForegroundColor Yellow

function Translate-Expression {
    param(
        [string]$Formula,
        [hashtable]$PosMap
    )

    if (-not $Formula) { return @{ WithLetters = "?"; WithNames = "?" } }

    $withLetters = $Formula
    $withNames = $Formula
    $pattern = '\{(\d+),(\d+)\}'

    $allMatches = [regex]::Matches($Formula, $pattern)
    foreach ($match in $allMatches) {
        $level = [int]$match.Groups[1].Value
        $position = [int]$match.Groups[2].Value

        # Niveau special 32768 = variable globale VG
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

    return @{
        WithLetters = $withLetters
        WithNames = $withNames
    }
}

$expressions = $targetTask.SelectSingleNode("./Expressions")
$expList = @{}

if ($expressions) {
    $expNodes = $expressions.SelectNodes("Expression")
    foreach ($exp in $expNodes) {
        $expId = $exp.id
        $syntaxNode = $exp.SelectSingleNode("ExpSyntax/@val")
        $formula = if ($syntaxNode) { $syntaxNode.Value } else { $null }

        if ($formula) {
            $translated = Translate-Expression -Formula $formula -PosMap $positionMap
            $expList[$expId] = @{
                Id = $expId
                Raw = $formula
                WithLetters = $translated.WithLetters
                WithNames = $translated.WithNames
            }
        }
    }
}

if ($expList.Count -gt 0) {
    Write-Host ""
    Write-Host "| # | Formule brute | Variables | Traduction |"
    Write-Host "|---|---------------|-----------|------------|"
    foreach ($key in $expList.Keys | Sort-Object { [int]$_ }) {
        $e = $expList[$key]
        $raw = if ($e.Raw.Length -gt 30) { $e.Raw.Substring(0,27) + "..." } else { $e.Raw }
        $letters = if ($e.WithLetters.Length -gt 25) { $e.WithLetters.Substring(0,22) + "..." } else { $e.WithLetters }
        $names = if ($e.WithNames.Length -gt 30) { $e.WithNames.Substring(0,27) + "..." } else { $e.WithNames }
        Write-Host ("| {0} | ``{1}`` | ``{2}`` | ``{3}`` |" -f $e.Id, $raw, $letters, $names)
    }
}

# ============================================
# PARSER LA LOGIQUE
# ============================================

Write-Host ""
Write-Host "=== LOGIC ===" -ForegroundColor Yellow

$taskLogic = $targetTask.SelectSingleNode(".//TaskLogic")
$logicUnits = $taskLogic.SelectNodes("LogicUnit")

$lineNumber = 1
$logicLines = @()

$levelTypes = @{ "T" = "Task"; "R" = "Record"; "C" = "Control"; "G" = "Group" }

# Map pour Update: FieldID -> position dans le DataView
$fieldIdToPosition = @{}
$pos = $localStartPosition
foreach ($col in $columns) {
    $fieldIdToPosition[[int]$col.id] = $pos
    $pos++
}

foreach ($unit in $logicUnits) {
    $unitLevel = $unit.Level.val
    $unitType = $unit.Type.val

    $handlerName = ""
    if ($levelTypes.ContainsKey($unitLevel)) { $handlerName = $levelTypes[$unitLevel] }
    if ($unitType -eq "P") { $handlerName += " Prefix" }
    elseif ($unitType -eq "S") { $handlerName += " Suffix" }

    $logicLines += @{
        LineNum = $lineNumber
        Operation = $handlerName.Trim()
        Type = "Header"
        Details = ""
    }
    $lineNumber++

    $lines = $unit.SelectNodes("LogicLines/LogicLine")
    foreach ($line in $lines) {
        $childNode = $line.FirstChild
        if (-not $childNode) { continue }

        $operation = $childNode.LocalName
        $lineInfo = @{
            LineNum = $lineNumber
            Operation = $operation
            Type = ""
            Variable = ""
            VarName = ""
            ExpNum = ""
            ExpLetters = ""
            ExpNames = ""
            Details = ""
        }

        switch ($operation) {
            "Update" {
                $fieldId = [int]$childNode.FieldID.val
                $withValue = $childNode.WithValue.val

                # Trouver la variable via la position
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
                $taskId = $childNode.TaskID.obj
                $lineInfo.Type = "Call"
                $lineInfo.Details = Get-ProgramName -TaskId $taskId

                $condition = $childNode.SelectSingleNode("Condition")
                if ($condition -and $condition.Exp) {
                    $lineInfo.ExpNum = $condition.Exp
                    if ($expList.ContainsKey($condition.Exp)) {
                        $exp = $expList[$condition.Exp]
                        $lineInfo.ExpLetters = $exp.WithLetters
                    }
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

Write-Host ""
Write-Host "| Ligne | Operation | Type | Variable | Nom | Exp | Expression |"
Write-Host "|-------|-----------|------|----------|-----|-----|------------|"

foreach ($l in $logicLines) {
    if ($l.Type -eq "Header") {
        Write-Host ("| **{0}** | **{1}** | | | | | |" -f $l.LineNum, $l.Operation)
    }
    elseif ($l.Type -in @("Variable", "Call", "If", "End")) {
        $varDisplay = if ($l.Variable) { "**$($l.Variable)**" } else { "" }
        $expDisplay = if ($l.ExpLetters.Length -gt 40) { $l.ExpLetters.Substring(0,37) + "..." } else { $l.ExpLetters }
        $details = if ($l.Details -and $l.Details.Length -gt 30) { $l.Details.Substring(0,27) + "..." } else { $l.Details }

        if ($l.Type -eq "Call") {
            Write-Host ("| {0} | {1} | {2} | | | {3} | {4} |" -f $l.LineNum, $l.Operation, $l.Type, $l.ExpNum, $details)
        } else {
            Write-Host ("| {0} | {1} | {2} | {3} | {4} | {5} | ``{6}`` |" -f $l.LineNum, $l.Operation, $l.Type, $varDisplay, $l.VarName, $l.ExpNum, $expDisplay)
        }
    }
}

Write-Host ""
Write-Host "=== FIN ===" -ForegroundColor Cyan
