# Trace task hierarchy to ISN_2=32 based on XML nesting
$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml" -Raw
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
[xml]$doc = $content

Write-Host "=== Tracing hierarchy to ISN_2=32 via XML nesting ===" -ForegroundColor Cyan

# Function to recursively find ISN_2=32 and build path
function Find-TaskPath {
    param(
        [System.Xml.XmlElement]$task,
        [string[]]$path,
        [int]$level
    )

    $header = $task.Header
    if (-not $header) { return $null }

    $isn2 = $header.GetAttribute("ISN_2")
    $desc = $header.Description

    # Count columns
    $columns = $task.SelectNodes("Resource/Columns/Column")
    $colCount = if ($columns) { $columns.Count } else { 0 }

    $info = @{
        ISN_2 = $isn2
        Description = $desc
        ColumnCount = $colCount
        Level = $level
    }

    $newPath = $path + @($info)

    if ($isn2 -eq "32") {
        return $newPath
    }

    # Check child tasks
    $childTasks = $task.SelectNodes("Task")
    foreach ($child in $childTasks) {
        $result = Find-TaskPath -task $child -path $newPath -level ($level + 1)
        if ($result) {
            return $result
        }
    }

    return $null
}

# Find the main task (root)
$mainTask = $doc.SelectSingleNode("//Task[@MainProgram='Y']")
if (-not $mainTask) {
    $mainTask = $doc.SelectSingleNode("//Task[1]")
}

$path = Find-TaskPath -task $mainTask -path @() -level 0

if ($path) {
    Write-Host "`nHierarchy found (root to target):"
    $totalAncestorCols = 0

    for ($i = 0; $i -lt $path.Count; $i++) {
        $t = $path[$i]
        $indent = "  " * $t.Level
        $isTarget = if ($t.ISN_2 -eq "32") { " <-- TARGET" } else { "" }
        Write-Host "$indent ISN_2=$($t.ISN_2) '$($t.Description)' - $($t.ColumnCount) cols$isTarget"

        if ($t.ISN_2 -ne "32") {
            $totalAncestorCols += $t.ColumnCount
        }
    }

    Write-Host "`n=== Offset Calculation ===" -ForegroundColor Yellow
    Write-Host "Sum of ancestor columns: $totalAncestorCols"

    $targetTask = $path[-1]
    Write-Host "Target task columns: $($targetTask.ColumnCount)"

    # Main offset for VIL (if any)
    $mainOffset = 0
    $totalOffset = $mainOffset + $totalAncestorCols + $targetTask.ColumnCount
    Write-Host "Total offset: $mainOffset + $totalAncestorCols + $($targetTask.ColumnCount) = $totalOffset"

    # Validate
    $localPosition = 5
    $localIndex = $localPosition - 1
    $expectedGlobalIndex = 132
    $expectedOffset = $expectedGlobalIndex - $localIndex

    Write-Host "`nExpected offset for FC (index 132) at position 5: $expectedOffset"
    Write-Host "Calculated offset: $totalOffset"
    Write-Host "Difference: $($totalOffset - $expectedOffset)"
} else {
    Write-Host "ERROR: ISN_2=32 not found!" -ForegroundColor Red
}
