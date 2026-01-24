# Count columns in detail for each task in the chain
$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml" -Raw
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
[xml]$doc = $content

Write-Host "=== Detailed Column Analysis ===" -ForegroundColor Cyan

# Get the chain of tasks to ISN_2=32
$allHeaders = $doc.SelectNodes("//Header[@ISN_2='32']")
$node = $allHeaders[0].ParentNode

$chain = @()
while ($node -ne $null -and $node.NodeType -eq [System.Xml.XmlNodeType]::Element) {
    if ($node.Name -eq "Task") {
        $header = $node.SelectSingleNode("Header")
        $isn2 = if ($header) { $header.GetAttribute("ISN_2") } else { "" }
        $desc = if ($header) { $header.Description } else { "" }

        $chain += @{
            ISN_2 = $isn2
            Description = $desc
            TaskElement = $node
        }
    }
    $node = $node.ParentNode
}

[array]::Reverse($chain)

Write-Host ""
Write-Host "Detailed column analysis per task:"
Write-Host ""

$totalCols = 0
foreach ($t in $chain) {
    $task = $t.TaskElement
    $isn2 = $t.ISN_2
    $desc = $t.Description

    Write-Host "=== ISN_2=$isn2 '$desc' ===" -ForegroundColor Yellow

    # Get Resource element
    $resource = $task.SelectSingleNode("Resource")
    if ($resource) {
        # Count all columns
        $columns = $resource.SelectNodes("Columns/Column")
        $colCount = if ($columns) { $columns.Count } else { 0 }
        Write-Host "  Columns count: $colCount"

        # Check for DB elements (Main Source and Links)
        $dbElements = $resource.SelectNodes("DB")
        Write-Host "  DB elements: $($dbElements.Count)"

        foreach ($db in $dbElements) {
            $dataObj = $db.SelectSingleNode("DataObject")
            $comp = if ($dataObj) { $dataObj.GetAttribute("comp") } else { "" }
            $obj = if ($dataObj) { $dataObj.GetAttribute("obj") } else { "" }
            $link = $db.GetAttribute("Link")
            $linkType = if ($link) { "Link $link" } else { "MainSource" }
            Write-Host "    ${linkType}: comp=${comp} obj=${obj}"
        }

        # Show column details
        if ($colCount -gt 0) {
            Write-Host "  Column details:"
            foreach ($col in $columns | Select-Object -First 5) {
                $colName = $col.GetAttribute("name")
                $colId = $col.GetAttribute("id")
                # Check for field reference to understand if it's Real or Virtual
                $field = $col.SelectSingleNode("Field")
                $fieldInfo = ""
                if ($field) {
                    $fieldComp = $field.GetAttribute("comp")
                    $fieldObj = $field.GetAttribute("obj")
                    $db = $field.GetAttribute("db")
                    $fieldInfo = " (Field: comp=$fieldComp obj=$fieldObj db=$db)"
                }
                Write-Host "    id=$colId name='$colName'$fieldInfo"
            }
            if ($colCount -gt 5) {
                Write-Host "    ... and $($colCount - 5) more columns"
            }
        }

        $totalCols += $colCount
    } else {
        Write-Host "  No Resource element"
    }
    Write-Host ""
}

Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Total columns across all tasks: $totalCols"
Write-Host "Expected offset: 128"
Write-Host "Difference: $($totalCols - 128)"

# Check if there's something about Main project offset
Write-Host ""
Write-Host "Checking if VIL has a Main project offset..."

# Look at the main task (ISN_2=1) more carefully
$mainTaskHeader = $doc.SelectSingleNode("//Header[@ISN_2='1']")
if ($mainTaskHeader) {
    $mainTask = $mainTaskHeader.ParentNode
    $mainResource = $mainTask.SelectSingleNode("Resource")
    if ($mainResource) {
        $mainColumns = $mainResource.SelectNodes("Columns/Column")
        Write-Host "Main task (ISN_2=1) has $($mainColumns.Count) columns"

        # Check for Virtual vs Real columns
        $virtualCount = 0
        $realCount = 0
        foreach ($col in $mainColumns) {
            $field = $col.SelectSingleNode("Field")
            if ($field) {
                $db = $field.GetAttribute("db")
                if ($db -eq "0" -or $db -eq "") {
                    $virtualCount++
                } else {
                    $realCount++
                }
            } else {
                $virtualCount++  # No Field = likely Virtual
            }
        }
        Write-Host "  Virtual columns: $virtualCount"
        Write-Host "  Real columns: $realCount"
    }
}
