# auto-decode-expressions.ps1
# Phase 4: Decodage automatique des expressions {N,Y}
# Utilise la formule d'offset validee: Main_VG + Σ(Selects ancetres, sauf Access=W)

param(
    [array]$Expressions = @(),

    [string]$McpExe = $null,

    [Parameter(Mandatory=$true)]
    [string]$OutputFile
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Paths
$ProjectsPath = "D:\Data\Migration\XPA\PMS"
$KbPath = Join-Path $env:USERPROFILE ".magic-kb\knowledge.db"

# Guard: Empty expressions array
if ($null -eq $Expressions -or $Expressions.Count -eq 0) {
    Write-Host "[Expressions] No expressions to decode" -ForegroundColor Yellow
    @{
        DecodedAt = (Get-Date).ToString("o")
        Expressions = @()
        Stats = @{ Total = 0; Decoded = 0; Failed = 0 }
    } | ConvertTo-Json -Depth 5 | Set-Content $OutputFile -Encoding UTF8
    return
}

# Load Main_VG offsets from KB if available, otherwise use fallback
$MainVGOffsets = @{}
$Sqlite3Exe = "sqlite3"

try {
    if (Test-Path $KbPath) {
        $OffsetQuery = "SELECT name, main_offset FROM projects WHERE main_offset > 0"
        $OffsetResult = & $Sqlite3Exe $KbPath $OffsetQuery 2>$null

        if ($OffsetResult) {
            foreach ($Line in $OffsetResult) {
                $Parts = $Line -split '\|'
                if ($Parts.Count -eq 2) {
                    $MainVGOffsets[$Parts[0]] = [int]$Parts[1]
                }
            }
            Write-Host "[Decode] Loaded offsets from KB: $($MainVGOffsets.Count) projects" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Warning "[Decode] Could not load offsets from KB: $_"
}

# Fallback offsets if KB not available or empty
if ($MainVGOffsets.Count -eq 0) {
    Write-Host "[Decode] Using fallback offsets (KB unavailable)" -ForegroundColor Yellow
    $MainVGOffsets = @{
        "ADH" = 117
        "PVE" = 143
        "VIL" = 52
        "PBG" = 91
        "PBP" = 88
        "REF" = 107
    }
}

# ============================================================================
# FONCTIONS OFFSET CALCULATION
# ============================================================================

function Get-TaskAncestorChain {
    param(
        [xml]$Xml,
        [int]$TaskISN2
    )

    $Chain = @()
    $AllTasks = $Xml.ProgramContent.TaskTable.Task

    # Construire un dictionnaire ISN_2 -> Task
    $TaskDict = @{}
    foreach ($Task in $AllTasks) {
        $ISN2 = [int]$Task.ISN_2
        $TaskDict[$ISN2] = $Task
    }

    # Remonter la chaine des parents
    $Current = $TaskDict[$TaskISN2]
    while ($Current) {
        $Chain += @{
            ISN2 = [int]$Current.ISN_2
            Name = $Current.Name.InnerText
            ParentRef = if ($Current.ParentRef) { [int]$Current.ParentRef } else { 0 }
        }

        if ($Current.ParentRef -and $Current.ParentRef -ne "0") {
            $Current = $TaskDict[[int]$Current.ParentRef]
        }
        else {
            $Current = $null
        }
    }

    # Inverser pour avoir root -> target
    [array]::Reverse($Chain)
    return $Chain
}

function Count-SelectsInTask {
    param(
        [xml]$Xml,
        [int]$TaskISN2
    )

    $Count = 0
    $AllLogic = $Xml.ProgramContent.TaskLogicTable.TaskLogic | Where-Object { $_.TaskRef -eq $TaskISN2 }

    foreach ($Logic in $AllLogic) {
        $Lines = $Logic.LogicLines.LogicLine | Where-Object { $_.Type -eq "Q" -and $_.Disabled -ne "1" }
        $Count += $Lines.Count
    }

    return $Count
}

function Has-MainSourceWriteAccess {
    param(
        [xml]$Xml,
        [int]$TaskISN2
    )

    $DataView = $Xml.ProgramContent.DataViewTable.DataView | Where-Object { $_.TaskRef -eq $TaskISN2 }
    if (-not $DataView) { return $false }

    $MainSource = $DataView.MainSource
    if ($MainSource -and $MainSource.Access -eq "W") {
        return $true
    }

    return $false
}

function Calculate-Offset {
    param(
        [string]$Project,
        [int]$ProgramId,
        [int]$TaskISN2
    )

    $MainVG = $MainVGOffsets[$Project]
    if ($null -eq $MainVG) { $MainVG = 0 }

    # Charger le XML
    $XmlPath = Join-Path $ProjectsPath "$Project\Source\Programs\Prg_$ProgramId.xml"
    if (-not (Test-Path $XmlPath)) {
        return @{
            Offset = $MainVG
            Error = "XML not found"
            Chain = @()
        }
    }

    [xml]$Xml = Get-Content $XmlPath -Encoding UTF8

    $Chain = Get-TaskAncestorChain -Xml $Xml -TaskISN2 $TaskISN2
    $Offset = $MainVG

    foreach ($Task in $Chain) {
        # Skip la tache cible elle-meme
        if ($Task.ISN2 -eq $TaskISN2) { continue }

        # Skip les taches avec MainSource Write
        $HasWrite = Has-MainSourceWriteAccess -Xml $Xml -TaskISN2 $Task.ISN2
        if ($HasWrite) { continue }

        # Compter les Selects
        $Selects = Count-SelectsInTask -Xml $Xml -TaskISN2 $Task.ISN2
        $Offset += $Selects

        $Task.Selects = $Selects
        $Task.Contribution = $Selects
    }

    return @{
        Offset = $Offset
        MainVG = $MainVG
        Chain = $Chain
        Error = $null
    }
}

function Get-VariableLetter {
    param([int]$Index)

    if ($Index -lt 26) {
        return [char]([int][char]'A' + $Index)
    }
    elseif ($Index -lt 702) {
        $First = [char]([int][char]'A' + [math]::Floor(($Index - 26) / 26))
        $Second = [char]([int][char]'A' + (($Index - 26) % 26))
        return "$First$Second"
    }
    else {
        return "VAR$Index"
    }
}

function Decode-NYReference {
    param(
        [string]$Reference,
        [int]$Offset
    )

    # Pattern: {N,Y} ou {0,Y}
    if ($Reference -match '\{(\d+),(\d+)\}') {
        $N = [int]$Matches[1]
        $Y = [int]$Matches[2]

        if ($N -eq 0) {
            # Variable globale
            $GlobalIndex = $Offset + $Y
            $Letter = Get-VariableLetter -Index $GlobalIndex
            return @{
                Type = "Global"
                LocalIndex = $Y
                GlobalIndex = $GlobalIndex
                Letter = $Letter
                Offset = $Offset
            }
        }
        else {
            # Variable locale ou parametre
            return @{
                Type = "Local"
                LocalIndex = $Y
                N = $N
                Letter = "L$Y"
            }
        }
    }

    return $null
}

function Decode-Expression {
    param(
        [string]$Expression,
        [int]$Offset
    )

    $Decoded = $Expression
    $Variables = @()

    $Matches = [regex]::Matches($Expression, '\{(\d+),(\d+)\}')

    foreach ($Match in $Matches) {
        $Ref = $Match.Value
        $Info = Decode-NYReference -Reference $Ref -Offset $Offset

        if ($Info) {
            $Variables += @{
                Reference = $Ref
                Info = $Info
            }

            if ($Info.Type -eq "Global") {
                $Decoded = $Decoded -replace [regex]::Escape($Ref), $Info.Letter
            }
        }
    }

    return @{
        Original = $Expression
        Decoded = $Decoded
        Variables = $Variables
    }
}

# ============================================================================
# EXECUTION PRINCIPALE
# ============================================================================

$Result = @{
    DecodedAt = (Get-Date).ToString("o")
    Expressions = @()
    Stats = @{
        Total = 0
        Decoded = 0
        Failed = 0
    }
}

Write-Host "[Decode] Processing $($Expressions.Count) expressions with {N,Y} references..." -ForegroundColor Cyan

foreach ($Expr in $Expressions) {
    $Result.Stats.Total++

    Write-Host "  Decoding: $($Expr.Project) Prg_$($Expr.ProgramId) Expr $($Expr.ExpressionId)" -ForegroundColor Gray

    try {
        # Trouver la tache qui contient cette expression
        $XmlPath = Join-Path $ProjectsPath "$($Expr.Project)\Source\Programs\Prg_$($Expr.ProgramId).xml"
        if (-not (Test-Path $XmlPath)) {
            throw "XML not found"
        }

        [xml]$Xml = Get-Content $XmlPath -Encoding UTF8

        # Chercher quelle tache utilise cette expression
        $TaskISN2 = 0
        $AllLogic = $Xml.ProgramContent.TaskLogicTable.TaskLogic
        foreach ($Logic in $AllLogic) {
            $Lines = $Logic.LogicLines.LogicLine
            foreach ($Line in $Lines) {
                $ExpRefs = @($Line.ConditionRef, $Line.UpdateExp, $Line.EvalExp) | Where-Object { $_ }
                if ($ExpRefs -contains $Expr.ExpressionId.ToString()) {
                    $TaskISN2 = [int]$Logic.TaskRef
                    break
                }
            }
            if ($TaskISN2 -ne 0) { break }
        }

        if ($TaskISN2 -eq 0) {
            # Expression orpheline - utiliser offset Main
            $TaskISN2 = 0
        }

        # Calculer l'offset
        $OffsetResult = Calculate-Offset -Project $Expr.Project -ProgramId $Expr.ProgramId -TaskISN2 $TaskISN2

        # Decoder l'expression
        $DecodeResult = Decode-Expression -Expression $Expr.Value -Offset $OffsetResult.Offset

        $Result.Expressions += @{
            Project = $Expr.Project
            ProgramId = $Expr.ProgramId
            ExpressionId = $Expr.ExpressionId
            TaskISN2 = $TaskISN2
            Offset = $OffsetResult.Offset
            OffsetChain = $OffsetResult.Chain
            Original = $DecodeResult.Original
            DecodedValue = $DecodeResult.Decoded
            Variables = $DecodeResult.Variables
            Success = $true
            Error = $null
        }

        $Result.Stats.Decoded++
    }
    catch {
        $Result.Expressions += @{
            Project = $Expr.Project
            ProgramId = $Expr.ProgramId
            ExpressionId = $Expr.ExpressionId
            Original = $Expr.Value
            Success = $false
            Error = $_.Exception.Message
        }

        $Result.Stats.Failed++
        Write-Warning "  Failed: $_"
    }
}

# Statistiques
Write-Host "[Decode] Results:" -ForegroundColor Green
Write-Host "  - Total: $($Result.Stats.Total)" -ForegroundColor Gray
Write-Host "  - Decoded: $($Result.Stats.Decoded)" -ForegroundColor Gray
Write-Host "  - Failed: $($Result.Stats.Failed)" -ForegroundColor Gray

# Sauvegarder
$Result | ConvertTo-Json -Depth 10 | Set-Content $OutputFile -Encoding UTF8

Write-Host "[Decode] Output: $OutputFile" -ForegroundColor Green
