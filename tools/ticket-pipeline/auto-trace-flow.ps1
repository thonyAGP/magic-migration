# auto-trace-flow.ps1
# Phase 3: Tracage du flux et generation de diagramme ASCII
# Lit les fichiers Prg_XXX.xml pour extraire CallTask et generer le diagramme

param(
    [Parameter(Mandatory=$true)]
    [array]$Programs,

    [string]$McpExe = $null,

    [Parameter(Mandatory=$true)]
    [string]$OutputFile,

    [Parameter(Mandatory=$true)]
    [string]$DiagramFile
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Paths
$ProjectsPath = "D:\Data\Migration\XPA\PMS"
$KbPath = Join-Path $env:USERPROFILE ".magic-kb\knowledge.db"

# ============================================================================
# FONCTIONS XML PARSING
# ============================================================================

function Get-ProgramXml {
    param(
        [string]$Project,
        [int]$ProgramId
    )

    $XmlPath = Join-Path $ProjectsPath "$Project\Source\Programs\Prg_$ProgramId.xml"
    if (Test-Path $XmlPath) {
        return [xml](Get-Content $XmlPath -Encoding UTF8)
    }
    return $null
}

function Get-TaskTree {
    param([xml]$Xml)

    $Tasks = @()
    $AllTasks = $Xml.ProgramContent.TaskTable.Task

    foreach ($Task in $AllTasks) {
        $Disabled = $Task.Disabled -eq "1"
        $Tasks += @{
            ISN_2 = [int]$Task.ISN_2
            Name = $Task.Name.InnerText
            Disabled = $Disabled
            Level = 0  # Sera calcule
            ParentISN = if ($Task.ParentRef) { [int]$Task.ParentRef } else { 0 }
        }
    }

    return $Tasks
}

function Get-LogicOperations {
    param([xml]$Xml, [int]$TaskISN = 0)

    $Operations = @()
    $AllLogic = $Xml.ProgramContent.TaskLogicTable.TaskLogic

    foreach ($Logic in $AllLogic) {
        $TaskRef = [int]$Logic.TaskRef
        if ($TaskISN -ne 0 -and $TaskRef -ne $TaskISN) { continue }

        $Lines = $Logic.LogicLines.LogicLine
        foreach ($Line in $Lines) {
            $Disabled = $Line.Disabled -eq "1"
            $OpType = $Line.Type

            $Op = @{
                TaskRef = $TaskRef
                LineId = [int]$Line.ISN
                Type = $OpType
                Disabled = $Disabled
                Condition = $null
                TargetPrg = $null
                TargetTask = $null
                Expression = $null
            }

            # Extraire les details selon le type
            switch ($OpType) {
                "C" {  # Call Task
                    if ($Line.CallTaskParms) {
                        $Op.TargetTask = $Line.CallTaskParms.TaskRef
                    }
                    if ($Line.ConditionRef) {
                        $Op.Condition = [int]$Line.ConditionRef
                    }
                }
                "X" {  # Call Program
                    if ($Line.CallProgParms) {
                        $Op.TargetPrg = $Line.CallProgParms.ProgRef
                    }
                    if ($Line.ConditionRef) {
                        $Op.Condition = [int]$Line.ConditionRef
                    }
                }
                "U" {  # Update
                    if ($Line.UpdateExp) {
                        $Op.Expression = [int]$Line.UpdateExp
                    }
                }
                "E" {  # Evaluate
                    if ($Line.EvalExp) {
                        $Op.Expression = [int]$Line.EvalExp
                    }
                }
            }

            $Operations += $Op
        }
    }

    return $Operations
}

function Get-Expressions {
    param([xml]$Xml)

    $Expressions = @()
    $AllExpr = $Xml.ProgramContent.ExpressionTable.Expression

    foreach ($Expr in $AllExpr) {
        $Expressions += @{
            ISN = [int]$Expr.ISN
            Value = $Expr.InnerText
            HasNY = $Expr.InnerText -match '\{[0-9,]+\}'
        }
    }

    return $Expressions
}

# ============================================================================
# GENERATION DIAGRAMME ASCII
# ============================================================================

function Generate-AsciiDiagram {
    param(
        [array]$Flow,
        [array]$Programs
    )

    $Lines = @()
    $Lines += '```'
    $Lines += 'FLUX PROGRAMMES MAGIC'
    $Lines += '====================='
    $Lines += ''

    $ProcessedProgs = @{}

    foreach ($Entry in $Flow) {
        $ProgKey = "$($Entry.Project)-$($Entry.ProgramId)"
        if ($ProcessedProgs[$ProgKey]) { continue }
        $ProcessedProgs[$ProgKey] = $true

        $ProgLabel = "$($Entry.Project) IDE $($Entry.IDE)"
        if ($Entry.Name) { $ProgLabel += " - $($Entry.Name)" }

        $Lines += ('+' + ('-' * 40) + '+')
        $Lines += ('| ' + $ProgLabel).PadRight(41) + '|'

        if ($Entry.CallTasks -and $Entry.CallTasks.Count -gt 0) {
            $Lines += ('|' + (' ' * 41) + '|')
            foreach ($Call in $Entry.CallTasks | Select-Object -First 5) {
                $CallLine = '  -> ' + $Call.Type + ': ' + $Call.Target
                if ($Call.Disabled) { $CallLine += ' [D]' }
                $Lines += ('| ' + $CallLine).PadRight(41) + '|'
            }
            if ($Entry.CallTasks.Count -gt 5) {
                $Remaining = $Entry.CallTasks.Count - 5
                $Lines += ("|   ... +$Remaining autres").PadRight(41) + '|'
            }
        }

        $Lines += ('+' + ('-' * 40) + '+')

        # Fleches vers les programmes appeles
        $CallProgs = $Entry.CallTasks | Where-Object { $_.Type -eq 'CallProgram' -and $_.Target }
        foreach ($CallProg in $CallProgs | Select-Object -First 3) {
            $Lines += '         |'
            $Lines += '         v'
            $Lines += "    [TargetPrg=$($CallProg.Target)]"
        }

        $Lines += ''
    }

    $Lines += '```'

    return $Lines -join "`n"
}

# ============================================================================
# EXECUTION PRINCIPALE
# ============================================================================

$Result = @{
    TracedAt = (Get-Date).ToString("o")
    Flow = @()
    CallTasks = @()
    Expressions = @()
}

Write-Host "[FlowTrace] Tracing $($Programs.Count) programs..." -ForegroundColor Cyan

# Filtrer les programmes verifies
$VerifiedProgs = $Programs | Where-Object { $_.Verified -eq $true }

foreach ($Prog in $VerifiedProgs) {
    Write-Host "  Tracing: $($Prog.Project) IDE $($Prog.IDE) - $($Prog.Name)" -ForegroundColor Gray

    $Xml = Get-ProgramXml -Project $Prog.Project -ProgramId $Prog.ProgramId
    if (-not $Xml) {
        Write-Warning "  XML not found for $($Prog.Project) Prg_$($Prog.ProgramId)"
        continue
    }

    $Tasks = Get-TaskTree -Xml $Xml
    $Operations = Get-LogicOperations -Xml $Xml
    $Expressions = Get-Expressions -Xml $Xml

    # Collecter les CallTask/CallProgram
    $Calls = @()
    foreach ($Op in $Operations) {
        if ($Op.Disabled) { continue }

        switch ($Op.Type) {
            "C" {  # Call Task
                $Calls += @{
                    Type = "CallTask"
                    Target = $Op.TargetTask
                    Condition = $Op.Condition
                    Disabled = $Op.Disabled
                    TaskRef = $Op.TaskRef
                    LineId = $Op.LineId
                }
            }
            "X" {  # Call Program
                $Calls += @{
                    Type = "CallProgram"
                    Target = $Op.TargetPrg
                    Condition = $Op.Condition
                    Disabled = $Op.Disabled
                    TaskRef = $Op.TaskRef
                    LineId = $Op.LineId
                }
            }
        }
    }

    # Collecter les expressions avec {N,Y}
    $NYExpressions = $Expressions | Where-Object { $_.HasNY }

    $FlowEntry = @{
        Project = $Prog.Project
        ProgramId = $Prog.ProgramId
        IDE = $Prog.IDE
        Name = $Prog.Name
        TaskCount = $Tasks.Count
        DisabledTaskCount = ($Tasks | Where-Object { $_.Disabled }).Count
        CallTasks = $Calls
        ExpressionCount = $Expressions.Count
        NYExpressionCount = $NYExpressions.Count
    }

    $Result.Flow += $FlowEntry
    $Result.CallTasks += $Calls | ForEach-Object {
        $_ | Add-Member -NotePropertyName "SourceProgram" -NotePropertyValue "$($Prog.Project)-$($Prog.ProgramId)" -PassThru
    }

    foreach ($Expr in $NYExpressions) {
        $Result.Expressions += @{
            Project = $Prog.Project
            ProgramId = $Prog.ProgramId
            ExpressionId = $Expr.ISN
            Value = $Expr.Value
            Decoded = $false
        }
    }
}

# Generer le diagramme ASCII
$Diagram = Generate-AsciiDiagram -Flow $Result.Flow -Programs $VerifiedProgs

# Statistiques
$TotalCalls = $Result.CallTasks.Count
$TotalExpr = $Result.Expressions.Count

Write-Host "[FlowTrace] Results:" -ForegroundColor Green
Write-Host "  - Programs traced: $($Result.Flow.Count)" -ForegroundColor Gray
Write-Host "  - CallTask/CallProgram: $TotalCalls" -ForegroundColor Gray
Write-Host "  - Expressions {N,Y}: $TotalExpr" -ForegroundColor Gray

# Sauvegarder
$Result | ConvertTo-Json -Depth 10 | Set-Content $OutputFile -Encoding UTF8
$Diagram | Set-Content $DiagramFile -Encoding UTF8

Write-Host "[FlowTrace] Output: $OutputFile" -ForegroundColor Green
Write-Host "[FlowTrace] Diagram: $DiagramFile" -ForegroundColor Green
