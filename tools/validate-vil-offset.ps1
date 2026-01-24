# Validate VIL 90.4.4.1.2.3.2 offset calculation
# Expected: Variable FC (index 132) at local position 5 (index 4)
# Therefore offset should be 128

$ErrorActionPreference = "Stop"

# Load XML
$vilPath = "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_558.xml"
$content = [System.IO.File]::ReadAllText($vilPath)
# Clean invalid XML entities
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
$content = $content -replace '&#([0-8]|1[1-2]|14|1[5-9]|2[0-9]|3[01]);', ''
[xml]$doc = $content

Write-Host "=== VIL IDE 90.4.4.1.2.3.2 Offset Validation ===" -ForegroundColor Cyan

# Find task BI (ISN_2=32) - the target task
$targetTask = $doc.SelectNodes("//Task[@ISN_2='32']")[0]
if (-not $targetTask) {
    Write-Host "ERROR: Task ISN_2=32 not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`nTarget Task: ISN_2=32"
$header = $targetTask.Header
Write-Host "  Name: $($header.publicName)"

# Function to count columns in a task
function Get-TaskColumnCount($task) {
    $columns = $task.SelectNodes("Resource/Columns/Column")
    return $columns.Count
}

# Function to count Main Source columns (Definition=R, not Virtual)
function Get-MainSourceColumnCount($task) {
    $columns = $task.SelectNodes("Resource/Columns/Column")
    $count = 0
    foreach ($col in $columns) {
        # Real columns have different attributes - let's check
        $colContent = $col.InnerXml
        if ($colContent -match 'Type="R"' -or ($col.Type -eq "R")) {
            $count++
        }
    }
    return $count
}

# Build parent chain for task 32
Write-Host "`n=== Parent Chain Traversal ===" -ForegroundColor Yellow

$chain = @()
$currentTask = $targetTask
while ($currentTask) {
    $isn2 = $currentTask.GetAttribute("ISN_2")
    $parentIsn2Attr = $currentTask.Header.GetAttribute("parentISN_2")
    $parentIsn2 = if ($parentIsn2Attr) { $parentIsn2Attr } else { $null }
    $name = $currentTask.Header.publicName
    $colCount = Get-TaskColumnCount $currentTask

    $chain += [PSCustomObject]@{
        ISN_2 = $isn2
        Name = $name
        ParentISN_2 = $parentIsn2
        ColumnCount = $colCount
    }

    if (-not $parentIsn2) {
        break
    }

    $currentTask = $doc.SelectNodes("//Task[@ISN_2='$parentIsn2']")[0]
}

# Reverse to show from root to target
[array]::Reverse($chain)

Write-Host "`nTask hierarchy (root to target):"
$level = 0
foreach ($t in $chain) {
    $indent = "  " * $level
    Write-Host "$indent ISN_2=$($t.ISN_2) '$($t.Name)' - $($t.ColumnCount) columns (Parent: $($t.ParentISN_2))"
    $level++
}

# Calculate offset
# Offset = sum of ALL columns from ancestors (not including target task's table columns in this sum)
# + target task's Main Source columns
Write-Host "`n=== Offset Calculation ===" -ForegroundColor Yellow

$ancestorOffset = 0
for ($i = 0; $i -lt $chain.Count - 1; $i++) {
    $t = $chain[$i]
    $ancestorOffset += $t.ColumnCount
    Write-Host "  + $($t.ColumnCount) columns from '$($t.Name)' (ISN_2=$($t.ISN_2))"
}

# Target task's Main Source columns
$targetColCount = Get-TaskColumnCount $targetTask
Write-Host "  + $targetColCount columns from target task (table columns)"

$totalOffset = $ancestorOffset + $targetColCount
Write-Host "`nTotal Offset: $totalOffset"

# Validate against expected
$localPosition = 5  # 1-based
$localIndex = $localPosition - 1  # 0-based
$expectedGlobalIndex = 132  # FC
$expectedOffset = $expectedGlobalIndex - $localIndex

Write-Host "`n=== Validation ===" -ForegroundColor Yellow
Write-Host "Local position: $localPosition (index $localIndex)"
Write-Host "Expected global index for FC: $expectedGlobalIndex"
Write-Host "Expected offset: $expectedOffset"
Write-Host "Calculated offset: $totalOffset"

if ($totalOffset -eq $expectedOffset) {
    Write-Host "`n[PASS] Offset matches!" -ForegroundColor Green
} else {
    Write-Host "`n[FAIL] Offset mismatch! Diff: $($totalOffset - $expectedOffset)" -ForegroundColor Red
}

# Convert to variable name
function IndexToVariable($index) {
    if ($index -lt 26) {
        return [char]([int][char]'A' + $index)
    }
    elseif ($index -lt 702) {
        $first = [math]::Floor($index / 26)
        $second = $index % 26
        return [char]([int][char]'A' + $first) + [char]([int][char]'A' + $second)
    }
    return "?"
}

$globalIndex = $totalOffset + $localIndex
$variableName = IndexToVariable $globalIndex

Write-Host "`nGlobal index: $globalIndex"
Write-Host "Variable name: $variableName"
Write-Host "Expected: FC"

if ($variableName -eq "FC") {
    Write-Host "`n[PASS] Variable name is correct!" -ForegroundColor Green
} else {
    Write-Host "`n[FAIL] Variable name should be FC, got $variableName" -ForegroundColor Red
}
