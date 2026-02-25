<#
.SYNOPSIS
    Analyze Magic program flow: parse Logic, identify CallTask/CallProgram,
    build ASCII diagram, identify suspicious tasks.

.PARAMETER Project
    Project name - validated against magic-config.json (dynamic list)

.PARAMETER ProgramId
    Program IDE number

.PARAMETER McpEndpoint
    MCP server endpoint (default: uses Claude MCP)

.OUTPUTS
    Structured flow analysis with ASCII diagram
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$ProgramId,

    [string]$OutputFormat = "markdown"
)

$ErrorActionPreference = "Stop"

# Load dynamic config for project validation
$configPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\magic-config.json"
$config = $null
$validProjects = @("ADH", "PBP", "REF", "VIL", "PBG", "PVE", "PUG")  # Fallback

if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.projects.all) {
        $validProjects = $config.projects.all
    }
}

# Validate project
$Project = $Project.ToUpperInvariant()
if ($Project -notin $validProjects) {
    Write-Warning "Project '$Project' not in known projects: $($validProjects -join ', ')"
    Write-Warning "Run magic-config-generator.ps1 to update the list if this is a valid project."
}

# Suspicious patterns for task analysis
$SuspiciousPatterns = @{
    HIGH = @('Delete', 'Remove', 'Purge', 'Drop', 'Truncate')
    MEDIUM = @('Update', 'Modify', 'Insert', 'Create', 'Write')
    LOW = @('Select', 'Read', 'Fetch', 'Get', 'Check', 'Validate')
}

function Get-TaskSuspicionLevel {
    param([string]$TaskName, [string]$Operations)

    $combined = "$TaskName $Operations"

    foreach ($pattern in $SuspiciousPatterns.HIGH) {
        if ($combined -match $pattern) { return @{ Level = "HIGH"; Match = $pattern } }
    }
    foreach ($pattern in $SuspiciousPatterns.MEDIUM) {
        if ($combined -match $pattern) { return @{ Level = "MEDIUM"; Match = $pattern } }
    }
    foreach ($pattern in $SuspiciousPatterns.LOW) {
        if ($combined -match $pattern) { return @{ Level = "LOW"; Match = $pattern } }
    }
    return @{ Level = "NONE"; Match = "" }
}

function Parse-LogicOutput {
    param([string]$LogicText)

    $operations = @()
    $lines = $LogicText -split "`n"
    $lineNum = 0

    foreach ($line in $lines) {
        $lineNum++
        $op = @{
            LineNumber = $lineNum
            Raw = $line.Trim()
            Type = "UNKNOWN"
            Target = $null
            Condition = $null
            IsDisabled = $line -match '^\s*\[D\]'
        }

        # Parse operation type
        if ($line -match 'Call\s+Task|CallTask|CALL.*TASK') {
            $op.Type = "CALL_TASK"
            if ($line -match 'Task\s+(\d+\.[\d\.]+)') { $op.Target = $Matches[1] }
            elseif ($line -match 'ISN_2[=:]\s*(\d+)') { $op.Target = "ISN_2:$($Matches[1])" }
        }
        elseif ($line -match 'Call\s+Program|CallProg|CALL.*PROG') {
            $op.Type = "CALL_PROGRAM"
            if ($line -match 'TargetPrg[=:]\s*(\d+)') { $op.Target = $Matches[1] }
            elseif ($line -match 'Program\s+(\d+)') { $op.Target = $Matches[1] }
        }
        elseif ($line -match '\bUpdate\b') { $op.Type = "UPDATE" }
        elseif ($line -match '\bSelect\b') { $op.Type = "SELECT" }
        elseif ($line -match '\bLink\b') { $op.Type = "LINK" }
        elseif ($line -match '\bBlock\s+(Begin|End)') { $op.Type = "BLOCK" }
        elseif ($line -match '\bEvaluate\b') { $op.Type = "EVALUATE" }
        elseif ($line -match 'Exp\s+(\d+)') {
            $op.Type = "EXPRESSION"
            $op.Target = "Exp $($Matches[1])"
        }

        # Parse condition
        if ($line -match 'Condition[=:]\s*Exp\s*(\d+)') {
            $op.Condition = "Exp $($Matches[1])"
        }

        if ($op.Type -ne "UNKNOWN" -or $op.Raw.Length -gt 5) {
            $operations += $op
        }
    }

    return $operations
}

function Build-FlowGraph {
    param([array]$Tasks, [array]$Calls)

    $nodes = @{}
    $edges = @()

    # Add all tasks as nodes
    foreach ($task in $Tasks) {
        $suspicion = Get-TaskSuspicionLevel -TaskName $task.Name -Operations ""
        $nodes[$task.Position] = @{
            Position = $task.Position
            Name = $task.Name
            Level = $task.Level
            Suspicion = $suspicion.Level
            SuspicionMatch = $suspicion.Match
        }
    }

    # Add edges for calls
    foreach ($call in $Calls) {
        $edges += @{
            From = $call.FromTask
            To = $call.ToTarget
            Type = $call.Type
            Line = $call.Line
            Condition = $call.Condition
        }
    }

    return @{ Nodes = $nodes; Edges = $edges }
}

function Render-AsciiDiagram {
    param([hashtable]$Graph, [string]$RootPosition)

    $output = @()
    $output += "```"
    $output += "FLUX PROGRAMME - $Project IDE $ProgramId"
    $output += "=" * 50
    $output += ""

    # Render root
    $root = $Graph.Nodes[$RootPosition]
    if ($root) {
        $marker = if ($root.Suspicion -eq "HIGH") { " â† SUSPECT" } else { "" }
        $output += "â"Œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â""
        $output += "â"‚ $Project IDE $ProgramId                 â"‚$marker"
        $output += "â"‚ $($root.Name.PadRight(35))     â"‚"
        $output += "â""â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"¬â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"˜"
    }

    # Render edges and targets
    $rendered = @{}
    foreach ($edge in $Graph.Edges) {
        if ($rendered[$edge.To]) { continue }
        $rendered[$edge.To] = $true

        $condText = if ($edge.Condition) { " (cond: $($edge.Condition))" } else { "" }
        $output += "                     â"‚"
        $output += "                     â"‚ $($edge.Type)$condText"
        $output += "                     â–¼"

        $target = $Graph.Nodes[$edge.To]
        if ($target) {
            $marker = if ($target.Suspicion -eq "HIGH") { " â† SUSPECT" }
                      elseif ($target.Suspicion -eq "MEDIUM") { " â† ATTENTION" }
                      else { "" }
            $output += "         â"Œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â""
            $output += "         â"‚ $($edge.To.PadRight(27)) â"‚$marker"
            $output += "         â"‚ $($target.Name.Substring(0, [Math]::Min(27, $target.Name.Length)).PadRight(27)) â"‚"
            $output += "         â""â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"˜"
        } else {
            $output += "         â"Œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â""
            $output += "         â"‚ â†' $($edge.To.PadRight(25)) â"‚"
            $output += "         â"‚ (External/Unresolved)         â"‚"
            $output += "         â""â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"˜"
        }
    }

    $output += "```"
    return $output -join "`n"
}

function Format-MarkdownOutput {
    param([hashtable]$Analysis)

    $md = @()
    $md += "## Analyse de Flux - $Project IDE $ProgramId"
    $md += ""
    $md += "### TÃ¢ches IdentifiÃ©es"
    $md += ""
    $md += "| Position | Nom | Niveau | Suspicion |"
    $md += "|----------|-----|--------|-----------|"

    foreach ($task in $Analysis.Tasks | Sort-Object { $_.Level }) {
        $susp = Get-TaskSuspicionLevel -TaskName $task.Name -Operations ""
        $suspIcon = switch ($susp.Level) {
            "HIGH" { "ðŸ"´ HIGH" }
            "MEDIUM" { "ðŸŸ¡ MEDIUM" }
            "LOW" { "ðŸŸ¢ LOW" }
            default { "-" }
        }
        $md += "| $($task.Position) | $($task.Name) | $($task.Level) | $suspIcon |"
    }

    $md += ""
    $md += "### Appels DÃ©tectÃ©s"
    $md += ""
    $md += "| Depuis | Ligne | Type | Vers | Condition |"
    $md += "|--------|-------|------|------|-----------|"

    foreach ($call in $Analysis.Calls) {
        $cond = if ($call.Condition) { $call.Condition } else { "-" }
        $md += "| $($call.FromTask) | $($call.Line) | $($call.Type) | $($call.ToTarget) | $cond |"
    }

    $md += ""
    $md += "### Diagramme de Flux"
    $md += ""
    $md += $Analysis.Diagram

    $md += ""
    $md += "### Points d'IntÃ©rÃªt"
    $md += ""

    $suspects = $Analysis.Tasks | Where-Object {
        (Get-TaskSuspicionLevel -TaskName $_.Name -Operations "").Level -in @("HIGH", "MEDIUM")
    }

    if ($suspects) {
        foreach ($s in $suspects) {
            $susp = Get-TaskSuspicionLevel -TaskName $s.Name -Operations ""
            $md += "- **$($s.Position)** - $($s.Name) [$($susp.Level): $($susp.Match)]"
        }
    } else {
        $md += "- Aucune tÃ¢che suspecte dÃ©tectÃ©e automatiquement"
        $md += "- Analyser manuellement les expressions et conditions"
    }

    return $md -join "`n"
}

# Main execution
Write-Host "=== ANALYSE DE FLUX MAGIC ===" -ForegroundColor Cyan
Write-Host "Projet: $Project, Programme: $ProgramId" -ForegroundColor Yellow
Write-Host ""

# Note: This script generates the STRUCTURE for flow analysis
# Actual MCP calls should be made by Claude or orchestrator script

$analysis = @{
    Project = $Project
    ProgramId = $ProgramId
    Tasks = @()
    Calls = @()
    Diagram = ""
    GeneratedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
}

# Output template for Claude to fill with MCP results
Write-Host "TEMPLATE POUR ANALYSE:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Appeler: magic_get_tree('$Project', $ProgramId)"
Write-Host "2. Pour chaque tÃ¢che suspecte: magic_get_logic('$Project', $ProgramId, <isn2>)"
Write-Host "3. Pour chaque CallProgram trouvÃ©: magic_get_position() pour rÃ©soudre"
Write-Host "4. ExÃ©cuter ce script avec les rÃ©sultats pour gÃ©nÃ©rer le diagramme"
Write-Host ""

# Output markdown template
$template = @"
## 3. TraÃ§age Flux

### Appel MCP : magic_get_tree("$Project", $ProgramId)

| IDE | ISN_2 | Nom | Niveau |
|-----|-------|-----|--------|
| ... | ... | ... | ... |

### RÃ©solution des CallTask/CallProgram

<!-- Remplir avec rÃ©sultats magic_get_position() -->

### Diagramme du flux

``````
â"Œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"
â"‚ $Project IDE $ProgramId                 â"‚
â"‚ [Nom Programme]                         â"‚
â""â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"¬â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"˜
                     â"‚ [Type appel]
                     â–¼
         â"Œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"
         â"‚ [Cible]                       â"‚
         â"‚ â† POINT D'INTÃ‰RÃŠT             â"‚
         â""â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"˜
``````

### Points d'intÃ©rÃªt

- **TÃ¢che X.Y.Z** - [Raison suspicion]
"@

Write-Host $template

