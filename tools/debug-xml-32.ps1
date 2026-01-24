# Debug XML structure around ISN_2=32
$content = Get-Content "D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml" -Raw
$content = $content -replace '&#x(0[0-8BbCc]|1[0-9A-Fa-f]|0[Ee]);', ''
[xml]$doc = $content

Write-Host "=== Debug XML structure ===" -ForegroundColor Cyan

# Find the task with ISN_2=32 directly
$allHeaders = $doc.SelectNodes("//Header[@ISN_2='32']")
Write-Host "Found $($allHeaders.Count) Header elements with ISN_2='32'"

foreach ($header in $allHeaders) {
    Write-Host ""
    Write-Host "Header attributes:"
    foreach ($attr in $header.Attributes) {
        Write-Host "  $($attr.Name) = $($attr.Value)"
    }

    # Get parent Task
    $parentTask = $header.ParentNode
    Write-Host ""
    Write-Host "Parent Task element:"
    Write-Host "  Name: $($parentTask.Name)"
    Write-Host "  MainProgram: $($parentTask.GetAttribute('MainProgram'))"

    # Check if Task has Resource/Columns
    $resource = $parentTask.SelectSingleNode("Resource")
    if ($resource) {
        $columns = $resource.SelectNodes("Columns/Column")
        Write-Host "  Columns count: $($columns.Count)"
        if ($columns.Count -gt 0) {
            Write-Host "  First few columns:"
            $i = 0
            foreach ($col in $columns) {
                if ($i -ge 3) { break }
                $colName = $col.GetAttribute("name")
                $colId = $col.GetAttribute("id")
                Write-Host "    Column id=$colId name='$colName'"
                $i++
            }
        }
    } else {
        Write-Host "  No Resource element found"
    }

    # Get parent's parent (grandparent Task)
    $grandparent = $parentTask.ParentNode
    Write-Host ""
    Write-Host "Grandparent element: $($grandparent.Name)"
    if ($grandparent.Name -eq "Task") {
        $gpHeader = $grandparent.SelectSingleNode("Header")
        if ($gpHeader) {
            Write-Host "  Grandparent ISN_2: $($gpHeader.GetAttribute('ISN_2'))"
            Write-Host "  Grandparent Desc: $($gpHeader.Description)"
        }
    }
}

# Let's manually trace back from ISN_2=32
Write-Host ""
Write-Host "=== Manual trace back from ISN_2=32 ===" -ForegroundColor Yellow

$node = $allHeaders[0].ParentNode  # Task containing Header with ISN_2=32
$level = 0
$chain = @()

while ($node -ne $null -and $node.NodeType -eq [System.Xml.XmlNodeType]::Element) {
    if ($node.Name -eq "Task") {
        $header = $node.SelectSingleNode("Header")
        $isn2 = if ($header) { $header.GetAttribute("ISN_2") } else { "" }
        $desc = if ($header) { $header.Description } else { "" }

        $resource = $node.SelectSingleNode("Resource")
        $columns = if ($resource) { $resource.SelectNodes("Columns/Column") } else { $null }
        $colCount = if ($columns) { $columns.Count } else { 0 }

        $chain += @{
            ISN_2 = $isn2
            Description = $desc
            ColumnCount = $colCount
            Level = $level
        }
        $level++
    }
    $node = $node.ParentNode
}

Write-Host ""
Write-Host "Chain from target to root (reversed):"
[array]::Reverse($chain)

$totalAncestorCols = 0
foreach ($t in $chain) {
    $indent = "  " * ([array]::IndexOf($chain, $t))
    $isTarget = if ($t.ISN_2 -eq "32") { " <-- TARGET" } else { "" }
    Write-Host "$indent ISN_2=$($t.ISN_2) '$($t.Description)' - $($t.ColumnCount) cols$isTarget"

    if ($t.ISN_2 -ne "32") {
        $totalAncestorCols += $t.ColumnCount
    }
}

Write-Host ""
Write-Host "Total ancestor columns: $totalAncestorCols"
$targetCols = ($chain | Where-Object { $_.ISN_2 -eq "32" }).ColumnCount
Write-Host "Target task columns: $targetCols"
$totalOffset = $totalAncestorCols + $targetCols
Write-Host "Total offset: $totalOffset"
Write-Host ""
Write-Host "Expected offset: 128"
Write-Host "Difference: $($totalOffset - 128)"
