# Validate VIL IDE 90.4.4.1.2.3.2 offset calculation
# Target: Task BI (ISN_2=32)
# Expected: Variable FC (index 132) at local position 5 (index 4)
# Therefore offset should be 128

$ErrorActionPreference = "Stop"

# Load XML
$vilPath = "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml"
$content = [System.IO.File]::ReadAllText($vilPath)
# Clean invalid XML entities
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
$content = $content -replace '&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);', ''
[xml]$doc = $content

Write-Host "=== VIL IDE 90 (Prg_348.xml) Offset Validation ===" -ForegroundColor Cyan
Write-Host "Target: Task BI at ISN_2=32"
Write-Host ""

# Build a task dictionary
$tasks = @{}
foreach ($task in $doc.SelectNodes("//Task")) {
    $header = $task.Header
    if ($header) {
        $isn2 = $header.GetAttribute("ISN_2")
        if ($isn2) {
            $parentIsn2 = $header.GetAttribute("parentISN_2")
            $desc = $header.Description

            # Count columns in this task
            $columns = $task.SelectNodes("Resource/Columns/Column")
            $colCount = if ($columns) { $columns.Count } else { 0 }

            $tasks[$isn2] = @{
                ISN_2 = $isn2
                ParentISN_2 = $parentIsn2
                Description = $desc
                ColumnCount = $colCount
                Element = $task
            }
        }
    }
}

Write-Host "Found $($tasks.Count) tasks"
Write-Host ""

# Find task ISN_2=32
$targetIsn2 = "32"
if (-not $tasks.ContainsKey($targetIsn2)) {
    Write-Host "ERROR: Task ISN_2=32 not found!" -ForegroundColor Red
    exit 1
}

$targetTask = $tasks[$targetIsn2]
Write-Host "Target Task: ISN_2=$targetIsn2"
Write-Host "  Description: $($targetTask.Description)"
Write-Host "  Columns: $($targetTask.ColumnCount)"
Write-Host "  Parent: $($targetTask.ParentISN_2)"

# Build parent chain
Write-Host "`n=== Parent Chain (target to root) ===" -ForegroundColor Yellow

$chain = @()
$currentIsn2 = $targetIsn2
while ($currentIsn2 -and $tasks.ContainsKey($currentIsn2)) {
    $t = $tasks[$currentIsn2]
    $chain += $t
    $currentIsn2 = $t.ParentISN_2
}

# Reverse to show from root to target
[array]::Reverse($chain)

Write-Host "`nTask hierarchy (root to target):"
$level = 0
$ancestorOffset = 0
foreach ($t in $chain) {
    $indent = "  " * $level
    $isTarget = if ($t.ISN_2 -eq $targetIsn2) { " <-- TARGET" } else { "" }
    Write-Host "$indent ISN_2=$($t.ISN_2) '$($t.Description)' - $($t.ColumnCount) columns$isTarget"

    # Accumulate offset from ancestors (not including target)
    if ($t.ISN_2 -ne $targetIsn2) {
        $ancestorOffset += $t.ColumnCount
    }
    $level++
}

# Calculate offset
Write-Host "`n=== Offset Calculation ===" -ForegroundColor Yellow
Write-Host "Ancestor columns (sum excluding target): $ancestorOffset"

# Count Main Source columns of target task (Real columns from table, not Virtual)
$targetColCount = $targetTask.ColumnCount
Write-Host "Target task total columns: $targetColCount"

# The formula is: offset = mainOffset + ancestorOffset + targetTableColumns
# mainOffset for VIL should be calculated from the Main project config
$mainOffset = 0  # Need to check VIL main offset

$totalOffset = $mainOffset + $ancestorOffset + $targetColCount
Write-Host "`nOffset formula: mainOffset($mainOffset) + ancestors($ancestorOffset) + targetCols($targetColCount) = $totalOffset"

# Validation
$localPosition = 5  # 1-based
$localIndex = $localPosition - 1  # 0-based
$expectedGlobalIndex = 132  # FC
$expectedOffset = $expectedGlobalIndex - $localIndex

Write-Host "`n=== Validation ===" -ForegroundColor Yellow
Write-Host "Local position: $localPosition (index $localIndex)"
Write-Host "Expected global index for FC: $expectedGlobalIndex"
Write-Host "Expected offset: $expectedOffset"
Write-Host "Calculated offset: $totalOffset"

$diff = $totalOffset - $expectedOffset
if ($diff -eq 0) {
    Write-Host "`n[PASS] Offset matches!" -ForegroundColor Green
} else {
    Write-Host "`n[DIFF] Offset difference: $diff" -ForegroundColor Red
    Write-Host "Need to adjust offset by $diff"
}

# Convert to variable name
function IndexToVariable($index) {
    if ($index -lt 0) { return "?" }
    if ($index -lt 26) {
        return [char]([int][char]'A' + $index)
    }
    elseif ($index -lt 702) {
        $first = [math]::Floor($index / 26)
        $second = $index % 26
        return [string]([char]([int][char]'A' + $first)) + [string]([char]([int][char]'A' + $second))
    }
    return "?"
}

$globalIndex = $totalOffset + $localIndex
$variableName = IndexToVariable $globalIndex

Write-Host "`nWith calculated offset:"
Write-Host "  Global index: $totalOffset + $localIndex = $globalIndex"
Write-Host "  Variable name: $variableName"
Write-Host "  Expected: FC"

if ($variableName -eq "FC") {
    Write-Host "`n[PASS] Variable name is correct!" -ForegroundColor Green
} else {
    Write-Host "`n[FAIL] Variable name should be FC, got $variableName" -ForegroundColor Red

    # Show what the correct offset should produce
    $correctGlobalIndex = 132
    $correctVariable = IndexToVariable $correctGlobalIndex
    Write-Host ""
    Write-Host "Correct calculation:"
    Write-Host "  Global index 132 → Variable $correctVariable"
}
