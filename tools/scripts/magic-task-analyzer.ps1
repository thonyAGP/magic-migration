<#
.SYNOPSIS
    Analyze Magic program tasks and identify suspicious ones

.DESCRIPTION
    - Lists all tasks in a program with their hierarchy
    - Identifies suspicious tasks (Delete, Update, Purge operations)
    - Detects CallTask/CallProgram patterns
    - Highlights tasks with complex conditions
    - **NEW**: Detects disabled logic lines ([D] marker)
    - **NEW**: Calculates disabled code ratio per task
    - **NEW**: Identifies potentially dead expressions

.PARAMETER Project
    Project name

.PARAMETER PrgId
    Program IDE number

.PARAMETER ShowAll
    Show all tasks (default: only suspicious)

.PARAMETER ShowDeadCode
    Show disabled/dead code statistics

.EXAMPLE
    .\magic-task-analyzer.ps1 -Project ADH -PrgId 121
    .\magic-task-analyzer.ps1 -Project VIL -PrgId 558 -ShowAll
    .\magic-task-analyzer.ps1 -Project ADH -PrgId 69 -ShowDeadCode
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$PrgId,

    [switch]$ShowAll,

    [switch]$ShowDeadCode
)

$ErrorActionPreference = "Stop"

# Suspicion patterns
$SuspicionPatterns = @{
    HIGH = @{
        Keywords = @('Delete', 'Remove', 'Purge', 'Drop', 'Truncate', 'Destroy')
        Score = 3
        Color = "Red"
    }
    MEDIUM = @{
        Keywords = @('Update', 'Modify', 'Insert', 'Create', 'Write', 'Save')
        Score = 2
        Color = "Yellow"
    }
    LOW = @{
        Keywords = @('Select', 'Read', 'Fetch', 'Get', 'Check', 'Validate', 'Browse')
        Score = 1
        Color = "Green"
    }
}

# Load project files
$BasePath = "D:\Data\Migration\XPA\PMS\$Project\Source"
$PrgFile = Join-Path $BasePath "Prg_$PrgId.xml"
$PrgHeadersFile = Join-Path $BasePath "ProgramHeaders.xml"

if (-not (Test-Path $PrgFile)) {
    Write-Error "Fichier non trouve: $PrgFile"
    exit 1
}

[xml]$xml = Get-Content $PrgFile -Encoding UTF8
[xml]$prgHeaders = Get-Content $PrgHeadersFile -Encoding UTF8

# Get program name
$prgHeader = $prgHeaders.SelectSingleNode("//ProgramHeader[@id='$PrgId']")
$prgName = if ($prgHeader.PublicName) { $prgHeader.PublicName } else { $prgHeader.Description }

Write-Host "=== ANALYSE TACHES ===" -ForegroundColor Cyan
Write-Host "Programme: $Project IDE $PrgId - $prgName" -ForegroundColor Yellow
Write-Host ""

# Analyze suspicion level
function Get-SuspicionLevel {
    param([string]$Text)

    foreach ($level in @("HIGH", "MEDIUM", "LOW")) {
        $pattern = $SuspicionPatterns[$level]
        foreach ($keyword in $pattern.Keywords) {
            if ($Text -match $keyword) {
                return @{
                    Level = $level
                    Match = $keyword
                    Score = $pattern.Score
                    Color = $pattern.Color
                }
            }
        }
    }

    return @{ Level = "NONE"; Match = ""; Score = 0; Color = "Gray" }
}

# Collect all tasks
$tasks = $xml.SelectNodes("//Task")
$taskList = @()

foreach ($task in $tasks) {
    $header = $task.SelectSingleNode("Header")
    $isn2 = $header.ISN_2
    $description = $header.Description

    # Calculate level (depth in hierarchy)
    $level = 0
    $parent = $task.ParentNode
    while ($parent -and $parent.LocalName -eq "Task") {
        $level++
        $parent = $parent.ParentNode
    }

    # Get main source table
    $db = $task.SelectSingleNode("./Resource/DB/DataObject")
    $tableName = ""
    if ($db -and $db.obj -ne "0") {
        $tableName = "Table $($db.obj)"
    }

    # Count operations in logic
    $taskLogic = $task.SelectSingleNode(".//TaskLogic")
    $callTasks = 0
    $callPrograms = 0
    $updates = 0
    $blocks = 0
    $totalLines = 0
    $disabledLines = 0

    if ($taskLogic) {
        $callTasks = $taskLogic.SelectNodes(".//CallTask").Count
        $callPrograms = $taskLogic.SelectNodes(".//CallTask[TaskID/@comp!='0']").Count
        $updates = $taskLogic.SelectNodes(".//Update").Count
        $blocks = $taskLogic.SelectNodes(".//BLOCK").Count

        # Count all logic lines and disabled lines
        $allLogicLines = $taskLogic.SelectNodes(".//LogicLine/*")
        $totalLines = $allLogicLines.Count
        foreach ($line in $allLogicLines) {
            if ($line.Disabled -eq "1") {
                $disabledLines++
            }
        }
    }

    # Calculate disabled ratio
    $disabledRatio = if ($totalLines -gt 0) { [math]::Round($disabledLines / $totalLines * 100, 1) } else { 0 }

    # Suspicion analysis
    $suspicion = Get-SuspicionLevel -Text $description
    $operations = "$updates upd, $callTasks calls, $blocks cond"
    $combinedText = "$description $operations"
    $suspicion2 = Get-SuspicionLevel -Text $combinedText
    if ($suspicion2.Score -gt $suspicion.Score) {
        $suspicion = $suspicion2
    }

    # Has conditions?
    $hasConditions = ($blocks -gt 0)

    $taskList += @{
        ISN2 = $isn2
        Description = $description
        Level = $level
        Table = $tableName
        CallTasks = $callTasks
        CallPrograms = $callPrograms
        Updates = $updates
        Blocks = $blocks
        Suspicion = $suspicion
        HasConditions = $hasConditions
        TotalLines = $totalLines
        DisabledLines = $disabledLines
        DisabledRatio = $disabledRatio
        AllDisabled = ($totalLines -gt 0 -and $disabledLines -eq $totalLines)
        HasDeadCode = ($disabledRatio -gt 50)
    }
}

# Sort by suspicion score descending, then by ISN2
$taskList = $taskList | Sort-Object { -$_.Suspicion.Score }, ISN2

# Display
Write-Host "| ISN_2 | Niveau | Description | Table | Operations | Suspicion |"
Write-Host "|-------|--------|-------------|-------|------------|-----------|"

$suspicious = @()
$total = 0

foreach ($t in $taskList) {
    $total++
    $isSuspicious = $t.Suspicion.Score -ge 2

    if ($ShowAll -or $isSuspicious) {
        $desc = if ($t.Description.Length -gt 25) { $t.Description.Substring(0, 22) + "..." } else { $t.Description }
        $ops = "$($t.Updates)u/$($t.CallTasks)c/$($t.Blocks)b"
        $suspLabel = if ($t.Suspicion.Level -ne "NONE") { "$($t.Suspicion.Level): $($t.Suspicion.Match)" } else { "-" }

        $color = $t.Suspicion.Color
        if ($isSuspicious) {
            $suspicious += $t
            Write-Host ("| {0} | {1} | {2} | {3} | {4} | {5} |" -f $t.ISN2, $t.Level, $desc, $t.Table, $ops, $suspLabel) -ForegroundColor $color
        } else {
            Write-Host ("| {0} | {1} | {2} | {3} | {4} | {5} |" -f $t.ISN2, $t.Level, $desc, $t.Table, $ops, $suspLabel)
        }
    }
}

# Summary
Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Yellow
Write-Host "Total taches: $total"
Write-Host "Taches suspectes (MEDIUM+): $($suspicious.Count)" -ForegroundColor $(if ($suspicious.Count -gt 0) { "Red" } else { "Green" })

if ($suspicious.Count -gt 0) {
    Write-Host ""
    Write-Host "Points d'attention:" -ForegroundColor Red
    foreach ($s in $suspicious | Select-Object -First 5) {
        Write-Host "  - ISN_2 $($s.ISN2): $($s.Description) [$($s.Suspicion.Level)]"
    }
}

# Call graph summary
$totalCalls = ($taskList | Measure-Object -Property CallTasks -Sum).Sum
$externalCalls = ($taskList | Measure-Object -Property CallPrograms -Sum).Sum
Write-Host ""
Write-Host "Appels:" -ForegroundColor Cyan
Write-Host "  - CallTask total: $totalCalls"
Write-Host "  - CallProgram (externes): $externalCalls"

# Dead code summary
$totalLogicLines = ($taskList | Measure-Object -Property TotalLines -Sum).Sum
$totalDisabledLines = ($taskList | Measure-Object -Property DisabledLines -Sum).Sum
$globalDisabledRatio = if ($totalLogicLines -gt 0) { [math]::Round($totalDisabledLines / $totalLogicLines * 100, 1) } else { 0 }
$tasksWithDeadCode = ($taskList | Where-Object { $_.HasDeadCode }).Count
$fullyDisabledTasks = ($taskList | Where-Object { $_.AllDisabled }).Count

Write-Host ""
Write-Host "Code mort [D]:" -ForegroundColor $(if ($globalDisabledRatio -gt 20) { "Red" } elseif ($globalDisabledRatio -gt 10) { "Yellow" } else { "Cyan" })
Write-Host "  - Lignes logiques total: $totalLogicLines"
Write-Host "  - Lignes desactivees [D]: $totalDisabledLines ($globalDisabledRatio%)"
Write-Host "  - Taches avec >50% disabled: $tasksWithDeadCode"
Write-Host "  - Taches 100% disabled: $fullyDisabledTasks"

if ($ShowDeadCode -and ($tasksWithDeadCode -gt 0 -or $fullyDisabledTasks -gt 0)) {
    Write-Host ""
    Write-Host "=== DETAILS CODE MORT ===" -ForegroundColor Yellow

    # List tasks with significant dead code
    $deadCodeTasks = $taskList | Where-Object { $_.DisabledRatio -gt 20 } | Sort-Object -Property DisabledRatio -Descending

    if ($deadCodeTasks.Count -gt 0) {
        Write-Host ""
        Write-Host "| ISN_2 | Description | Disabled | Total | Ratio |"
        Write-Host "|-------|-------------|----------|-------|-------|"

        foreach ($t in $deadCodeTasks) {
            $desc = if ($t.Description.Length -gt 25) { $t.Description.Substring(0, 22) + "..." } else { $t.Description }
            $color = if ($t.AllDisabled) { "Red" } elseif ($t.DisabledRatio -gt 50) { "Yellow" } else { "Gray" }
            Write-Host ("| {0} | {1} | {2} | {3} | {4}% |" -f $t.ISN2, $desc, $t.DisabledLines, $t.TotalLines, $t.DisabledRatio) -ForegroundColor $color
        }
    }
}

# Export for use by other scripts
$output = @{
    Project = $Project
    ProgramId = $PrgId
    ProgramName = $prgName
    TotalTasks = $total
    SuspiciousTasks = $suspicious.Count
    TotalLogicLines = $totalLogicLines
    TotalDisabledLines = $totalDisabledLines
    DisabledRatio = $globalDisabledRatio
    TasksWithDeadCode = $tasksWithDeadCode
    FullyDisabledTasks = $fullyDisabledTasks
    Tasks = $taskList
    AnalyzedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
}

# Output JSON to stdout for piping
Write-Host ""
Write-Host "=== JSON OUTPUT ===" -ForegroundColor Gray
$output | ConvertTo-Json -Depth 4 -Compress
