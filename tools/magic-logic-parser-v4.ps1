<#
.SYNOPSIS
    Parse un fichier XML Magic - Version 4 COMPLETE

.DESCRIPTION
    Version complete avec:
    - Noms des tables (Main Source + Links)
    - Colonnes des tables listees
    - Variables de tous les niveaux (ancetres)
    - Noms des programmes appeles (CallTask)
    - Expressions completement traduites

.PARAMETER Project
    Nom du projet (ADH, PBG, PBP, PVE, REF, VIL)

.PARAMETER PrgId
    ID du programme (numero du fichier Prg_XXX.xml)

.PARAMETER TaskIsn
    ISN_2 de la tache a analyser

.EXAMPLE
    .\magic-logic-parser-v4.ps1 -Project VIL -PrgId 558 -TaskIsn 19
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("ADH", "PBG", "PBP", "PVE", "REF", "VIL")]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$PrgId,

    [Parameter(Mandatory=$true)]
    [int]$TaskIsn,

    [Parameter(Mandatory=$false)]
    [string]$OutputFile
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

# Cache pour les tables
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

    # Trouver l'objet dans le composant
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

    # Trouver la table dans REF
    $table = $refDS.SelectSingleNode("//DataObject[@id='$itemIsn']")
    if (-not $table) {
        $table = $refDS.SelectSingleNode("//DataObject[@ItemIsn='$itemIsn']")
    }

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

    # TaskId peut etre un ISN de sous-tache locale ou un ID de programme externe
    # D'abord chercher dans les sous-taches du programme courant
    $localTask = $xml.SelectSingleNode("//Task[Header[@ISN_2='$TaskId']]")
    if ($localTask) {
        return "Sous-tache $TaskId : $($localTask.Header.Description)"
    }

    # Sinon chercher dans ProgramHeaders (programme externe)
    $prgHeader = $prgHeaders.SelectSingleNode("//ProgramHeader[@id='$TaskId']")
    if ($prgHeader) {
        $desc = $prgHeader.Description
        $publicName = $prgHeader.PublicName
        if ($publicName) {
            return "$Project IDE $TaskId - $publicName"
        }
        return "$Project IDE $TaskId - $desc"
    }

    return "Programme $TaskId"
}

function Get-TaskTotalColumns {
    param([System.Xml.XmlElement]$Task)

    $resource = $Task.SelectSingleNode("./Resource")
    $total = 0

    # Colonnes de la table Main Source
    $db = $resource.SelectSingleNode("./DB/DataObject")
    if ($db) {
        $tableInfo = Get-TableInfo -CompId $db.comp -ObjId $db.obj
        $total += $tableInfo.ColumnCount
    }

    # Colonnes des Links
    $links = $resource.SelectNodes("./Links/Link/DB/DataObject")
    foreach ($linkDb in $links) {
        $tableInfo = Get-TableInfo -CompId $linkDb.comp -ObjId $linkDb.obj
        $total += $tableInfo.ColumnCount
    }

    # Colonnes locales (virtuelles)
    $localCols = $resource.SelectNodes("./Columns/Column")
    $total += $localCols.Count

    return $total
}

function Get-TaskMainSourceColumns {
    param([System.Xml.XmlElement]$Task)

    $resource = $Task.SelectSingleNode("./Resource")
    $total = 0

    $db = $resource.SelectSingleNode("./DB/DataObject")
    if ($db) {
        $tableInfo = Get-TableInfo -CompId $db.comp -ObjId $db.obj
        $total += $tableInfo.ColumnCount
    }

    $links = $resource.SelectNodes("./Links/Link/DB/DataObject")
    foreach ($linkDb in $links) {
        $tableInfo = Get-TableInfo -CompId $linkDb.comp -ObjId $linkDb.obj
        $total += $tableInfo.ColumnCount
    }

    return $total
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

# Construire le chemin en remontant
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
# CONSTRUIRE LA MAP COMPLETE DES VARIABLES
# ============================================

Write-Host ""
Write-Host "Construction de la map des variables..." -ForegroundColor Yellow

$globalVariableMap = @{}  # Cle: "niveau,colId" -> Info variable
$currentOffset = 0

# Pour chaque tache dans le chemin (de Main vers la cible)
for ($pathIdx = 0; $pathIdx -lt $path.Count; $pathIdx++) {
    $task = $path[$pathIdx]
    $level = $path.Count - 1 - $pathIdx  # Niveau inverse (0 = cible, 1 = parent, etc.)
    $h = $task.SelectSingleNode("Header")
    $resource = $task.SelectSingleNode("./Resource")

    Write-Host "  Niveau $level (ISN=$($h.ISN_2)): offset=$currentOffset" -ForegroundColor Gray

    # 1. Colonnes de la table Main Source
    $db = $resource.SelectSingleNode("./DB/DataObject")
    if ($db) {
        $tableInfo = Get-TableInfo -CompId $db.comp -ObjId $db.obj
        $colIdx = 0
        foreach ($col in $tableInfo.Columns) {
            $globalIndex = $currentOffset + $colIdx
            $letter = Convert-IndexToLetter -Index $globalIndex
            $globalVariableMap["$level,$($col.Id)"] = @{
                Letter = $letter
                Name = $col.Name
                Type = $col.Type
                Source = "Table $($tableInfo.Name)"
                GlobalIndex = $globalIndex
            }
            $colIdx++
        }
        $currentOffset += $tableInfo.ColumnCount
    }

    # 2. Colonnes des Links
    $links = $resource.SelectNodes("./Links/Link")
    $linkIdx = 1
    foreach ($link in $links) {
        $linkDb = $link.SelectSingleNode("./DB/DataObject")
        if ($linkDb) {
            $linkTableInfo = Get-TableInfo -CompId $linkDb.comp -ObjId $linkDb.obj
            $colIdx = 0
            foreach ($col in $linkTableInfo.Columns) {
                $globalIndex = $currentOffset + $colIdx
                $letter = Convert-IndexToLetter -Index $globalIndex
                $globalVariableMap["$level,$($col.Id)"] = @{
                    Letter = $letter
                    Name = $col.Name
                    Type = $col.Type
                    Source = "Link$linkIdx $($linkTableInfo.Name)"
                    GlobalIndex = $globalIndex
                }
                $colIdx++
            }
            $currentOffset += $linkTableInfo.ColumnCount
        }
        $linkIdx++
    }

    # 3. Colonnes locales (virtuelles)
    $localCols = $resource.SelectNodes("./Columns/Column")
    $colIdx = 0
    foreach ($col in $localCols) {
        $globalIndex = $currentOffset + $colIdx
        $letter = Convert-IndexToLetter -Index $globalIndex
        $globalVariableMap["$level,$($col.id)"] = @{
            Letter = $letter
            Name = $col.name
            Type = Get-FieldType -Column $col
            Source = "Local"
            GlobalIndex = $globalIndex
        }
        $colIdx++
    }
    $currentOffset += $localCols.Count
}

# L'offset pour les variables locales de la tache cible
$targetOffset = $currentOffset - $targetTask.SelectNodes("./Resource/Columns/Column").Count

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
    Write-Host "MAIN SOURCE: Table n°$($db.obj) - $($tableInfo.Name)" -ForegroundColor Cyan
    Write-Host "  Nom physique: $($tableInfo.PhysicalName)"
    Write-Host "  Colonnes: $($tableInfo.ColumnCount)"

    if ($tableInfo.Columns.Count -gt 0) {
        Write-Host ""
        Write-Host "  | # | Colonne | Type |"
        Write-Host "  |---|---------|------|"
        $idx = 0
        foreach ($col in $tableInfo.Columns) {
            if ($idx -lt 15) {
                Write-Host ("  | {0} | {1} | {2} |" -f $col.Id, $col.Name, $col.Type)
            }
            $idx++
        }
        if ($tableInfo.Columns.Count -gt 15) {
            Write-Host "  | ... | ... et $($tableInfo.Columns.Count - 15) autres | |"
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
        Write-Host "LINK ${linkIdx}: Table n°$($linkDb.obj) - $($linkTableInfo.Name)" -ForegroundColor Cyan
        Write-Host "  Nom physique: $($linkTableInfo.PhysicalName)"
        Write-Host "  Colonnes: $($linkTableInfo.ColumnCount)"
    }
    $linkIdx++
}

# ============================================
# AFFICHER LES VARIABLES LOCALES
# ============================================

Write-Host ""
Write-Host "=== VARIABLES LOCALES ===" -ForegroundColor Yellow

$columns = $targetTask.SelectNodes("./Resource/Columns/Column")
$variables = @()
$localVarMap = @{}

Write-Host ""
Write-Host "| Lettre | Col ID | Nom | Type |"
Write-Host "|--------|--------|-----|------|"

$position = 0
foreach ($col in $columns) {
    $colId = [int]$col.id
    $globalIndex = $targetOffset + $position
    $letter = Convert-IndexToLetter -Index $globalIndex

    $varInfo = @{
        Position = $position
        GlobalIndex = $globalIndex
        Letter = $letter
        ColId = $colId
        Name = $col.name
        Type = Get-FieldType -Column $col
    }

    $variables += $varInfo
    $localVarMap[$colId] = $varInfo

    Write-Host ("| **{0}** | {1} | {2} | {3} |" -f $letter, $colId, $col.name, (Get-FieldType -Column $col))
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
        [hashtable]$VarMap
    )

    if (-not $Formula) { return @{ WithLetters = "?"; WithNames = "?" } }

    $withLetters = $Formula
    $withNames = $Formula
    $pattern = '\{(\d+),(\d+)\}'

    $allMatches = [regex]::Matches($Formula, $pattern)
    foreach ($match in $allMatches) {
        $level = [int]$match.Groups[1].Value
        $colId = [int]$match.Groups[2].Value

        # Niveau special 32768 = variable globale VG
        if ($level -eq 32768) {
            $withLetters = $withLetters -replace [regex]::Escape($match.Value), "VG.$colId"
            $withNames = $withNames -replace [regex]::Escape($match.Value), "VG.$colId"
            continue
        }

        $key = "$level,$colId"
        if ($VarMap.ContainsKey($key)) {
            $varInfo = $VarMap[$key]
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
            $translated = Translate-Expression -Formula $formula -VarMap $globalVariableMap
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
                $fieldId = $childNode.FieldID.val
                $withValue = $childNode.WithValue.val

                if ($localVarMap.ContainsKey([int]$fieldId)) {
                    $varInfo = $localVarMap[[int]$fieldId]
                    $lineInfo.Variable = $varInfo.Letter
                    $lineInfo.VarName = $varInfo.Name
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
            "LNK" { $lineInfo.Type = "Link" }
            "END_LINK" { $lineInfo.Type = "EndLink" }
            "DATAVIEW_SRC" { $lineInfo.Type = "MainSource" }
            "Select" { $lineInfo.Type = "Select" }
            "Form" { $lineInfo.Type = "Output"; $lineInfo.Details = "Form" }
            "FormIO" { $lineInfo.Type = "FormIO" }
            default { $lineInfo.Type = $operation }
        }

        $logicLines += $lineInfo
        $lineNumber++
    }
}

# Afficher les lignes importantes
Write-Host ""
Write-Host "| Ligne | Operation | Type | Variable | Nom | Exp | Expression |"
Write-Host "|-------|-----------|------|----------|-----|-----|------------|"

foreach ($l in $logicLines) {
    if ($l.Type -eq "Header") {
        Write-Host ("| **{0}** | **{1}** | | | | | |" -f $l.LineNum, $l.Operation)
    }
    elseif ($l.Type -in @("Variable", "Call", "If", "End")) {
        $varDisplay = if ($l.Variable) { "**$($l.Variable)**" } else { "" }
        $expDisplay = if ($l.ExpLetters.Length -gt 35) { $l.ExpLetters.Substring(0,32) + "..." } else { $l.ExpLetters }
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
