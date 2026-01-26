#Requires -Version 5.1
<#
.SYNOPSIS
    Generate call graph for a Magic program

.DESCRIPTION
    Analyzes program calls (CallTask) to build a complete call graph:
    - Programs that call this program (callers)
    - Programs called by this program (callees)
    - Cross-project dependencies
    - ECF shared component usage

    Output formats:
    - Mermaid diagram (default)
    - ASCII tree
    - JSON for further processing

.PARAMETER Project
    Project code (ADH, PBP, PVE, VIL, etc.)

.PARAMETER IDE
    IDE position number (1-indexed as shown in Magic IDE)

.PARAMETER Depth
    Maximum depth for call graph traversal (default: 2)

.PARAMETER Format
    Output format: mermaid, ascii, json (default: mermaid)

.PARAMETER SaveToKb
    Save call graph to Knowledge Base

.EXAMPLE
    .\Generate-CallGraph.ps1 -Project ADH -IDE 238

.EXAMPLE
    .\Generate-CallGraph.ps1 -Project ADH -IDE 238 -Depth 3 -Format ascii
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IDE,

    [int]$Depth = 2,

    [ValidateSet("mermaid", "ascii", "json")]
    [string]$Format = "mermaid",

    [switch]$SaveToKb,

    [string]$KbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"
)

$ErrorActionPreference = "Stop"
$projectsPath = "D:\Data\Migration\XPA\PMS"

Write-Host "=== Generate Call Graph ===" -ForegroundColor Cyan
Write-Host "Project: $Project | IDE: $IDE | Depth: $Depth" -ForegroundColor Cyan

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Get-KbData {
    param([string]$Query, [string]$DbPath)
    $result = sqlite3 $DbPath $Query 2>&1
    if ($LASTEXITCODE -ne 0) { return $null }
    return $result
}

function Get-ProgramName {
    param([string]$Project, [int]$IDE, [string]$KbPath)

    if (Test-Path $KbPath) {
        $query = "SELECT name, public_name FROM programs p JOIN projects pr ON p.project_id=pr.id WHERE pr.name='$Project' AND p.ide_position=$IDE;"
        $result = Get-KbData -Query $query -DbPath $KbPath
        if ($result) {
            $parts = $result -split '\|'
            return if ($parts[1]) { $parts[1] } else { $parts[0] }
        }
    }

    # Fallback to XML
    $progsPath = "$projectsPath\$Project\Source\Progs.xml"
    if (Test-Path $progsPath) {
        [xml]$progs = Get-Content $progsPath -Encoding UTF8
        $programs = $progs.Application.ProgramsRepositoryOutLine.Programs.Program
        if ($IDE -le $programs.Count) {
            return $programs[$IDE - 1].name
        }
    }

    return "$Project IDE $IDE"
}

function Get-Callers {
    param([string]$Project, [int]$IDE, [string]$KbPath)

    $callers = @()

    if (Test-Path $KbPath) {
        $query = @"
SELECT DISTINCT pr.name, p.ide_position, p.name, pc.callee_project_name
FROM program_calls pc
JOIN tasks t ON pc.caller_task_id = t.id
JOIN programs p ON t.program_id = p.id
JOIN projects pr ON p.project_id = pr.id
WHERE pc.callee_project_name = '$Project'
  AND pc.callee_xml_id = (
    SELECT xml_id FROM programs p2
    JOIN projects pr2 ON p2.project_id = pr2.id
    WHERE pr2.name = '$Project' AND p2.ide_position = $IDE
  );
"@
        $result = Get-KbData -Query $query -DbPath $KbPath
        if ($result) {
            foreach ($line in $result) {
                $parts = $line -split '\|'
                $callers += [PSCustomObject]@{
                    Project = $parts[0]
                    IDE = [int]$parts[1]
                    Name = $parts[2]
                    IsCrossProject = ($parts[0] -ne $Project)
                }
            }
        }
    }

    return $callers
}

function Get-Callees {
    param([string]$Project, [int]$IDE, [string]$KbPath)

    $callees = @()

    if (Test-Path $KbPath) {
        $query = @"
SELECT DISTINCT pc.callee_project_name, p2.ide_position, p2.name
FROM program_calls pc
JOIN tasks t ON pc.caller_task_id = t.id
JOIN programs p ON t.program_id = p.id
JOIN projects pr ON p.project_id = pr.id
LEFT JOIN programs p2 ON pc.callee_program_id = p2.id
WHERE pr.name = '$Project' AND p.ide_position = $IDE;
"@
        $result = Get-KbData -Query $query -DbPath $KbPath
        if ($result) {
            foreach ($line in $result) {
                $parts = $line -split '\|'
                if ($parts[1]) {
                    $callees += [PSCustomObject]@{
                        Project = if ($parts[0]) { $parts[0] } else { $Project }
                        IDE = [int]$parts[1]
                        Name = $parts[2]
                        IsCrossProject = ($parts[0] -and $parts[0] -ne $Project)
                    }
                }
            }
        }
    }

    return $callees
}

# ============================================================================
# STEP 1: Get program info
# ============================================================================
Write-Host "`n[1/4] Loading program info..." -ForegroundColor Yellow

$programName = Get-ProgramName -Project $Project -IDE $IDE -KbPath $KbPath
Write-Host "  Program: $programName" -ForegroundColor Green

# ============================================================================
# STEP 2: Get callers and callees
# ============================================================================
Write-Host "`n[2/4] Analyzing call relationships..." -ForegroundColor Yellow

$callers = Get-Callers -Project $Project -IDE $IDE -KbPath $KbPath
$callees = Get-Callees -Project $Project -IDE $IDE -KbPath $KbPath

$crossProjectCallers = $callers | Where-Object { $_.IsCrossProject }
$crossProjectCallees = $callees | Where-Object { $_.IsCrossProject }

Write-Host "  Callers: $($callers.Count) ($($crossProjectCallers.Count) cross-project)" -ForegroundColor Green
Write-Host "  Callees: $($callees.Count) ($($crossProjectCallees.Count) cross-project)" -ForegroundColor Green

# ============================================================================
# STEP 3: Generate output in requested format
# ============================================================================
Write-Host "`n[3/4] Generating $Format output..." -ForegroundColor Yellow

$output = ""

switch ($Format) {
    "mermaid" {
        $output = "graph LR`n"
        $output += "    CURRENT[$Project IDE $IDE<br/>$programName]`n"

        # Add callers
        foreach ($caller in $callers) {
            $nodeId = "$($caller.Project)_$($caller.IDE)"
            $nodeLabel = "$($caller.Project) IDE $($caller.IDE)"
            if ($caller.IsCrossProject) {
                $output += "    $nodeId[$nodeLabel]:::crossProject --> CURRENT`n"
            } else {
                $output += "    $nodeId[$nodeLabel] --> CURRENT`n"
            }
        }

        # Add callees
        foreach ($callee in $callees) {
            $nodeId = "$($callee.Project)_$($callee.IDE)"
            $nodeLabel = "$($callee.Project) IDE $($callee.IDE)"
            if ($callee.IsCrossProject) {
                $output += "    CURRENT --> $nodeId[$nodeLabel]:::crossProject`n"
            } else {
                $output += "    CURRENT --> $nodeId[$nodeLabel]`n"
            }
        }

        # Add styles
        $output += "`n    classDef crossProject fill:#ffcccc,stroke:#cc0000`n"
        $output += "    classDef current fill:#ccffcc,stroke:#00cc00`n"
        $output += "    class CURRENT current`n"
    }

    "ascii" {
        $output = @"

    CALLERS ($($callers.Count))                   CALLEES ($($callees.Count))
    ================                              ================

"@
        $maxLines = [Math]::Max($callers.Count, $callees.Count)
        for ($i = 0; $i -lt $maxLines; $i++) {
            $callerStr = ""
            $calleeStr = ""

            if ($i -lt $callers.Count) {
                $c = $callers[$i]
                $cross = if ($c.IsCrossProject) { "*" } else { "" }
                $callerStr = "$($c.Project) IDE $($c.IDE)$cross"
            }

            if ($i -lt $callees.Count) {
                $c = $callees[$i]
                $cross = if ($c.IsCrossProject) { "*" } else { "" }
                $calleeStr = "$($c.Project) IDE $($c.IDE)$cross"
            }

            $output += "    {0,-30} --> [{1}] --> {2}`n" -f $callerStr, ($i -eq 0 ? "$Project IDE $IDE" : ""), $calleeStr
        }

        $output += @"

    * = Cross-project dependency

    CURRENT PROGRAM: $Project IDE $IDE - $programName

"@
    }

    "json" {
        $graph = @{
            program = @{
                project = $Project
                ide = $IDE
                name = $programName
            }
            callers = $callers | ForEach-Object {
                @{
                    project = $_.Project
                    ide = $_.IDE
                    name = $_.Name
                    isCrossProject = $_.IsCrossProject
                }
            }
            callees = $callees | ForEach-Object {
                @{
                    project = $_.Project
                    ide = $_.IDE
                    name = $_.Name
                    isCrossProject = $_.IsCrossProject
                }
            }
            statistics = @{
                totalCallers = $callers.Count
                totalCallees = $callees.Count
                crossProjectCallers = $crossProjectCallers.Count
                crossProjectCallees = $crossProjectCallees.Count
            }
        }
        $output = $graph | ConvertTo-Json -Depth 5
    }
}

Write-Host $output

# ============================================================================
# STEP 4: Save to KB if requested
# ============================================================================
if ($SaveToKb -and (Test-Path $KbPath)) {
    Write-Host "`n[4/4] Saving to Knowledge Base..." -ForegroundColor Yellow

    # Get spec_id
    $specIdQuery = "SELECT id FROM program_specs WHERE project='$Project' AND ide_position=$IDE;"
    $specId = Get-KbData -Query $specIdQuery -DbPath $KbPath

    if ($specId) {
        # Delete existing call graph for this spec
        sqlite3 $KbPath "DELETE FROM spec_call_graph WHERE spec_id=$specId;" 2>$null

        # Insert callers
        foreach ($caller in $callers) {
            $isCross = if ($caller.IsCrossProject) { 1 } else { 0 }
            $insertQuery = @"
INSERT INTO spec_call_graph (spec_id, direction, related_project, related_ide, related_name, is_cross_project)
VALUES ($specId, 'caller', '$($caller.Project)', $($caller.IDE), '$($caller.Name)', $isCross);
"@
            sqlite3 $KbPath $insertQuery 2>$null
        }

        # Insert callees
        foreach ($callee in $callees) {
            $isCross = if ($callee.IsCrossProject) { 1 } else { 0 }
            $insertQuery = @"
INSERT INTO spec_call_graph (spec_id, direction, related_project, related_ide, related_name, is_cross_project)
VALUES ($specId, 'callee', '$($callee.Project)', $($callee.IDE), '$($callee.Name)', $isCross);
"@
            sqlite3 $KbPath $insertQuery 2>$null
        }

        Write-Host "  Saved call graph to KB ($($callers.Count + $callees.Count) relationships)" -ForegroundColor Green
    } else {
        Write-Warning "Spec not found in KB for $Project IDE $IDE"
    }
} else {
    Write-Host "`n[4/4] KB save skipped (use -SaveToKb to enable)" -ForegroundColor DarkYellow
}

# ============================================================================
# OUTPUT SUMMARY
# ============================================================================
Write-Host "`n=== CALL GRAPH GENERATED ===" -ForegroundColor Green

# Return results
[PSCustomObject]@{
    Project = $Project
    IDE = $IDE
    ProgramName = $programName
    CallerCount = $callers.Count
    CalleeCount = $callees.Count
    CrossProjectCallers = $crossProjectCallers.Count
    CrossProjectCallees = $crossProjectCallees.Count
    Format = $Format
    SavedToKb = $SaveToKb -and (Test-Path $KbPath)
    Output = $output
}
