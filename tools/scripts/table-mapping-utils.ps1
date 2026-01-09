# Table Mapping Utilities - Auto-regenerates if .eci files changed

$script:MappingFile = "D:\Projects\Lecteur Magic\tools\MagicMcp\table-mapping.json"
$script:MappingMetaFile = "D:\Projects\Lecteur Magic\tools\MagicMcp\table-mapping.meta"
$script:RefDataSources = "D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml"
$script:RefEci = "D:\Data\Migration\XPA\PMS\REF\Ref_Tables.eci"

function Test-MappingNeedsUpdate {
    if (-not (Test-Path $script:MappingFile)) { return $true }
    if (-not (Test-Path $script:MappingMetaFile)) { return $true }

    $meta = Get-Content $script:MappingMetaFile -Raw | ConvertFrom-Json

    $eciDate = (Get-Item $script:RefEci).LastWriteTime.ToString("o")
    $dsDate = (Get-Item $script:RefDataSources).LastWriteTime.ToString("o")

    return ($meta.eciDate -ne $eciDate) -or ($meta.dsDate -ne $dsDate)
}

function Update-TableMapping {
    Write-Host "[Auto] Regenerating table mapping..." -ForegroundColor Yellow

    # Load DataSources.xml
    $dsContent = Get-Content $script:RefDataSources -Raw -Encoding UTF8
    $pattern = '<DataObject[^>]*\bid="(\d+)"[^>]*>'
    $dsMatches = [regex]::Matches($dsContent, $pattern)

    $xmlIdToPublic = @{}
    $xmlIdToName = @{}
    foreach ($m in $dsMatches) {
        $tag = $m.Value
        $id = $m.Groups[1].Value
        if ($tag -match 'Public="([^"]+)"') {
            $xmlIdToPublic[$id] = $Matches[1]
        }
        if ($tag -match 'name="([^"]+)"') {
            $xmlIdToName[$id] = $Matches[1]
        }
    }

    # Load .eci
    $eciLines = Get-Content $script:RefEci -Encoding UTF8
    $headerLines = 15

    $publicToIde = @{}
    for ($i = $headerLines; $i -lt $eciLines.Count; $i++) {
        $line = $eciLines[$i]
        if ($line -match 'PUBLIC="([^"]+)"') {
            $publicToIde[$Matches[1]] = $i - $headerLines + 1
        }
    }

    # Build mapping
    $mapping = @{}
    foreach ($xmlId in $xmlIdToPublic.Keys) {
        $publicName = $xmlIdToPublic[$xmlId]
        $idePos = $publicToIde[$publicName]
        if ($idePos) {
            $mapping[$xmlId] = @{
                publicName = $publicName
                ide = $idePos
                name = $xmlIdToName[$xmlId]
            }
        }
    }

    # Save mapping
    $mapping | ConvertTo-Json -Depth 3 | Out-File $script:MappingFile -Encoding UTF8

    # Save meta (dates)
    @{
        eciDate = (Get-Item $script:RefEci).LastWriteTime.ToString("o")
        dsDate = (Get-Item $script:RefDataSources).LastWriteTime.ToString("o")
        generated = (Get-Date).ToString("o")
    } | ConvertTo-Json | Out-File $script:MappingMetaFile -Encoding UTF8

    Write-Host "[Auto] Mapping updated ($($mapping.Count) tables)" -ForegroundColor Green
}

function Get-TableMapping {
    if (Test-MappingNeedsUpdate) {
        Update-TableMapping
    }
    return Get-Content $script:MappingFile -Raw | ConvertFrom-Json
}

function Get-TableIdePosition {
    param([int]$xmlId)

    $mapping = Get-TableMapping
    $entry = $mapping."$xmlId"

    if ($entry) {
        return @{
            XmlId = $xmlId
            IdePosition = $entry.ide
            Name = $entry.name
            PublicName = $entry.publicName
        }
    }
    return $null
}

# Export functions
Export-ModuleMember -Function Get-TableMapping, Get-TableIdePosition, Update-TableMapping, Test-MappingNeedsUpdate
