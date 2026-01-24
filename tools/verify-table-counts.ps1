# Verify table column counts

$refContent = Get-Content "D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml" -Raw
[xml]$refDoc = $refContent

$tables = @(55, 488, 490, 140)

foreach ($tableId in $tables) {
    Write-Host "=== Table obj=$tableId ===" -ForegroundColor Cyan

    $dataObj = $refDoc.SelectSingleNode("//DataObject[@id='$tableId']")
    if ($dataObj) {
        $name = $dataObj.GetAttribute("name")
        $physName = $dataObj.GetAttribute("PhysicalName")
        $cols = $dataObj.SelectNodes("Columns/Column")

        Write-Host "  Name: $name"
        Write-Host "  Physical: $physName"
        Write-Host "  Columns: $($cols.Count)"

        # Show first few column names
        $i = 0
        foreach ($col in $cols) {
            if ($i -ge 5) {
                Write-Host "  ... and $($cols.Count - 5) more"
                break
            }
            $colName = $col.GetAttribute("name")
            Write-Host "    $($i+1): $colName"
            $i++
        }
    } else {
        Write-Host "  NOT FOUND in REF DataSources!"
    }
    Write-Host ""
}
