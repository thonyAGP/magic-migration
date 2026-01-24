# Complete offset calculation for VIL IDE 90 task 32
# Including both declared columns AND table columns from MainSource

$ErrorActionPreference = "Stop"

# Load VIL program
$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml" -Raw
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
[xml]$vilDoc = $content

# Load REF DataSources for table column counts
$refContent = Get-Content "D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml" -Raw
[xml]$refDoc = $refContent

Write-Host "=== Complete Offset Calculation for VIL IDE 90 Task 32 ===" -ForegroundColor Cyan

# Function to count columns in a table from REF DataSources
function Get-TableColumnCount($tableId) {
    $dataObj = $refDoc.SelectSingleNode("//DataObject[@id='$tableId']")
    if ($dataObj) {
        $cols = $dataObj.SelectNodes("Columns/Column")
        return @{
            Count = $cols.Count
            Name = $dataObj.GetAttribute("name")
        }
    }
    return @{ Count = 0; Name = "Unknown" }
}

# Build task chain from target to root
$allHeaders = $vilDoc.SelectNodes("//Header[@ISN_2='32']")
$node = $allHeaders[0].ParentNode

$chain = @()
while ($node -ne $null -and $node.NodeType -eq [System.Xml.XmlNodeType]::Element) {
    if ($node.Name -eq "Task") {
        $header = $node.SelectSingleNode("Header")
        $isn2 = if ($header) { $header.GetAttribute("ISN_2") } else { "" }
        $desc = if ($header) { $header.Description } else { "" }

        # Count declared columns (virtuals)
        $resource = $node.SelectSingleNode("Resource")
        $declaredCols = if ($resource) {
            $cols = $resource.SelectNodes("Columns/Column")
            if ($cols) { $cols.Count } else { 0 }
        } else { 0 }

        # Get MainSource table
        $mainSourceTable = $null
        $mainSourceCols = 0
        if ($resource) {
            $db = $resource.SelectSingleNode("DB/DataObject")
            if ($db) {
                $comp = $db.GetAttribute("comp")
                $obj = $db.GetAttribute("obj")
                if ($comp -eq "2") {  # REF component
                    $tableInfo = Get-TableColumnCount $obj
                    $mainSourceTable = $tableInfo.Name
                    $mainSourceCols = $tableInfo.Count
                }
            }
        }

        $chain += @{
            ISN_2 = $isn2
            Description = $desc
            DeclaredCols = $declaredCols
            MainSourceTable = $mainSourceTable
            MainSourceCols = $mainSourceCols
            TotalCols = $declaredCols + $mainSourceCols
        }
    }
    $node = $node.ParentNode
}

[array]::Reverse($chain)

Write-Host ""
Write-Host "Task hierarchy with COMPLETE column counts:" -ForegroundColor Yellow
Write-Host ""

$ancestorTotal = 0
$targetTableCols = 0
foreach ($t in $chain) {
    $isTarget = if ($t.ISN_2 -eq "32") { " <-- TARGET" } else { "" }

    Write-Host "ISN_2=$($t.ISN_2) '$($t.Description)'$isTarget"
    Write-Host "  Declared (virtual) cols: $($t.DeclaredCols)"
    Write-Host "  MainSource: $(if ($t.MainSourceTable) { "$($t.MainSourceTable) ($($t.MainSourceCols) cols)" } else { 'None' })"
    Write-Host "  Total cols: $($t.TotalCols)"
    Write-Host ""

    if ($t.ISN_2 -ne "32") {
        $ancestorTotal += $t.TotalCols
    } else {
        $targetTableCols = $t.MainSourceCols
    }
}

Write-Host "=== Offset Calculation ===" -ForegroundColor Cyan
$mainOffset = 52  # VIL main offset
Write-Host "Main offset (VIL): $mainOffset"
Write-Host "Ancestor total columns: $ancestorTotal"
Write-Host "Target task table columns: $targetTableCols"

$totalOffset = $mainOffset + $ancestorTotal + $targetTableCols
Write-Host ""
Write-Host "Formula: $mainOffset + $ancestorTotal + $targetTableCols = $totalOffset"

Write-Host ""
Write-Host "=== Validation ===" -ForegroundColor Yellow
$localPosition = 5
$localIndex = $localPosition - 1
$expectedGlobalIndex = 132  # FC
$expectedOffset = $expectedGlobalIndex - $localIndex

Write-Host "Local position: $localPosition (index $localIndex)"
Write-Host "Expected global index (FC): $expectedGlobalIndex"
Write-Host "Expected offset: $expectedOffset"
Write-Host "Calculated offset: $totalOffset"
Write-Host ""

$diff = $totalOffset - $expectedOffset
if ($diff -eq 0) {
    Write-Host "[PASS] Offset matches exactly!" -ForegroundColor Green
} else {
    Write-Host "[DIFF] Offset difference: $diff" -ForegroundColor Red
    if ($diff -gt 0) {
        Write-Host "Calculated offset is TOO HIGH by $diff"
    } else {
        Write-Host "Calculated offset is TOO LOW by $([Math]::Abs($diff))"
    }
}

# Convert calculated offset to variable name
function IndexToVariable($index) {
    if ($index -lt 0) { return "?" }
    if ($index -lt 26) {
        return [char]([int][char]'A' + $index)
    }
    elseif ($index -lt 702) {
        $first = [math]::Floor($index / 26)
        $second = $index % 26
        return "$([char]([int][char]'A' + $first))$([char]([int][char]'A' + $second))"
    }
    return "?"
}

$globalIndex = $totalOffset + $localIndex
$variableName = IndexToVariable $globalIndex

Write-Host ""
Write-Host "With calculated offset:"
Write-Host "  Global index: $totalOffset + $localIndex = $globalIndex"
Write-Host "  Variable: $variableName"
Write-Host "  Expected: FC (index 132)"
