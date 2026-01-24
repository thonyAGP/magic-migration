# Complete offset calculation V2 - counting ALL tables per task

$ErrorActionPreference = "Stop"

# Load VIL program
$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml" -Raw
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
[xml]$vilDoc = $content

# Load REF DataSources for table column counts
$refContent = Get-Content "D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml" -Raw
[xml]$refDoc = $refContent

Write-Host "=== Complete Offset Calculation V2 ===" -ForegroundColor Cyan

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
        $declaredCols = 0
        if ($resource) {
            $cols = $resource.SelectNodes("Columns/Column")
            $declaredCols = if ($cols) { $cols.Count } else { 0 }
        }

        # Get ALL MainSource tables (can be multiple DB elements)
        $tableCols = 0
        $tableInfos = @()
        if ($resource) {
            # Main Source tables
            $dbElements = $resource.SelectNodes("DB")
            foreach ($db in $dbElements) {
                $dataObj = $db.SelectSingleNode("DataObject")
                if ($dataObj) {
                    $comp = $dataObj.GetAttribute("comp")
                    $obj = $dataObj.GetAttribute("obj")
                    if ($comp -eq "2" -and $obj) {  # REF component
                        $tableInfo = Get-TableColumnCount $obj
                        $tableCols += $tableInfo.Count
                        $tableInfos += "$($tableInfo.Name) ($($tableInfo.Count))"
                    }
                }
            }

            # Also check Links (linked tables)
            $links = $resource.SelectNodes("Links/Link/DB/DataObject")
            foreach ($link in $links) {
                $comp = $link.GetAttribute("comp")
                $obj = $link.GetAttribute("obj")
                if ($comp -eq "2" -and $obj) {
                    $tableInfo = Get-TableColumnCount $obj
                    $tableCols += $tableInfo.Count
                    $tableInfos += "[Link] $($tableInfo.Name) ($($tableInfo.Count))"
                }
            }
        }

        $chain += @{
            ISN_2 = $isn2
            Description = $desc
            DeclaredCols = $declaredCols
            TableCols = $tableCols
            TableInfos = $tableInfos
            TotalCols = $declaredCols + $tableCols
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
    Write-Host "  Declared (virtual): $($t.DeclaredCols)"
    Write-Host "  Table cols: $($t.TableCols)"
    if ($t.TableInfos.Count -gt 0) {
        foreach ($ti in $t.TableInfos) {
            Write-Host "    - $ti"
        }
    }
    Write-Host "  Total: $($t.TotalCols)"
    Write-Host ""

    if ($t.ISN_2 -ne "32") {
        $ancestorTotal += $t.TotalCols
    } else {
        $targetTableCols = $t.TableCols
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

    # What would the correct values be?
    Write-Host ""
    Write-Host "Analysis:"
    Write-Host "  Current: $mainOffset + $ancestorTotal + $targetTableCols = $totalOffset"
    Write-Host "  Need: ? + ? + ? = $expectedOffset"
    Write-Host ""

    # Maybe the main offset is wrong?
    $neededMainOffset = $expectedOffset - $ancestorTotal - $targetTableCols
    Write-Host "  If main offset should be: $neededMainOffset (instead of $mainOffset)"

    # Maybe we're not supposed to include target table cols?
    $withoutTargetTable = $mainOffset + $ancestorTotal
    Write-Host "  Without target table cols: $withoutTargetTable (diff from expected: $($withoutTargetTable - $expectedOffset))"
}
