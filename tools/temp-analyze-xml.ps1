# Analyze XML structure to find all elements and attributes
param([string]$XmlPath = "D:/Data/Migration/XPA/PMS/ADH/Source/Prg_233.xml")

[xml]$xml = Get-Content $XmlPath

$allPaths = @{}

function Get-AllElements($node, $path='') {
    if ($node -is [System.Xml.XmlElement]) {
        $currentPath = if ($path) { "$path/$($node.Name)" } else { $node.Name }

        # Collect attributes
        $attrs = @()
        foreach ($attr in $node.Attributes) {
            $attrs += "@$($attr.Name)"
        }

        $key = if ($attrs.Count -gt 0) {
            "$currentPath [$($attrs -join ', ')]"
        } else {
            $currentPath
        }

        if (-not $allPaths.ContainsKey($key)) {
            $allPaths[$key] = 1
        } else {
            $allPaths[$key]++
        }

        foreach ($child in $node.ChildNodes) {
            Get-AllElements $child $currentPath
        }
    }
}

Get-AllElements $xml.DocumentElement

# Output sorted by path
$allPaths.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Output "$($_.Name) (count: $($_.Value))"
}
