<#
.SYNOPSIS
    Analyze Magic function usage frequency across XML files
#>

$functions = @{}
$xmlFiles = Get-ChildItem -Path 'D:\Data\Migration\XPA\PMS' -Filter 'Prg_*.xml' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 200

Write-Host "Analyzing $($xmlFiles.Count) XML files..."

foreach ($file in $xmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Match function calls like FunctionName( - Magic functions start with uppercase
        $matches = [regex]::Matches($content, '(?<![A-Za-z])([A-Z][a-zA-Z0-9]+)\s*\(')
        foreach ($m in $matches) {
            $fn = $m.Groups[1].Value
            # Filter out common XML tags
            if ($fn -notin @('Resource', 'Columns', 'Column', 'Header', 'Task', 'Logic', 'LogicUnit', 'LogicLine', 'Update', 'Range', 'Link', 'Locate', 'Init', 'Expression', 'DataObject', 'Properties', 'Property', 'Control', 'Form', 'Handler', 'Event', 'Program', 'Menu', 'Button', 'Table', 'Field', 'Index', 'Segment')) {
                if ($functions.ContainsKey($fn)) {
                    $functions[$fn]++
                } else {
                    $functions[$fn] = 1
                }
            }
        }
    }
}

Write-Host ""
Write-Host "TOP 50 Most Used Functions:"
Write-Host "============================"
$functions.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 50 | ForEach-Object {
    Write-Host ("{0,5}`t{1}" -f $_.Value, $_.Key)
}
