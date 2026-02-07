<#
.SYNOPSIS
    Genere un fichier Markdown par table depuis le JSON de metadata.
.PARAMETER MetadataPath
    Chemin du fichier JSON (defaut: CSK0912-metadata.json)
.PARAMETER OutputDir
    Dossier de sortie pour les fichiers MD (defaut: tables/)
.PARAMETER TableFilter
    Filtre optionnel sur les noms de tables
.EXAMPLE
    .\Generate-TableDocs.ps1
    .\Generate-TableDocs.ps1 -TableFilter "cafil008*"
#>
param(
    [string]$MetadataPath = "$PSScriptRoot\PHU2512-metadata.json",
    [string]$OutputDir = "$PSScriptRoot\tables",
    [string]$TableFilter = ''
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $MetadataPath)) {
    Write-Error "Fichier metadata introuvable: $MetadataPath. Lancer Extract-SqlMetadata.ps1 d'abord."
    return
}

$metadata = Get-Content $MetadataPath -Raw | ConvertFrom-Json

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$tables = $metadata.tables.PSObject.Properties
if ($TableFilter) {
    $tables = $tables | Where-Object { $_.Name -like $TableFilter }
}

$count = 0
foreach ($prop in $tables) {
    $tblName = $prop.Name
    $tbl = $prop.Value
    $count++

    $sb = [System.Text.StringBuilder]::new()

    # Header
    [void]$sb.AppendLine("# $tblName")
    if ($tbl.logicalName) {
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine("**Nom logique Magic** : ``$($tbl.logicalName)``")
    }
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| Info | Valeur |")
    [void]$sb.AppendLine("|------|--------|")
    [void]$sb.AppendLine("| Lignes | $($tbl.rowCount) |")
    [void]$sb.AppendLine("| Colonnes | $($tbl.columnCount) |")

    if ($tbl.primaryKey -and $tbl.primaryKey.Count -gt 0) {
        $pkStr = ($tbl.primaryKey -join ', ')
        [void]$sb.AppendLine("| Clef primaire | $pkStr |")
    }
    [void]$sb.AppendLine("")

    # Colonnes
    [void]$sb.AppendLine("## Colonnes")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |")
    [void]$sb.AppendLine("|---|---------|----------|--------|----------|----|----------|")

    foreach ($col in $tbl.columns) {
        $typeStr = $col.sqlType
        $sizeStr = ""
        if ($col.maxLength) {
            $sizeStr = "$($col.maxLength)"
            if ($col.maxLength -eq -1) { $sizeStr = "MAX" }
        }
        elseif ($col.numericPrecision) {
            $sizeStr = "$($col.numericPrecision)"
            if ($col.numericScale -and $col.numericScale -ne 0) {
                $sizeStr += ",$($col.numericScale)"
            }
        }

        $nullStr = if ($col.nullable) { "oui" } else { "non" }
        $pkStr = if ($col.isPrimaryKey) { "PK" } else { "" }
        $dcStr = if ($col.distinctCount -ge 0) { "$($col.distinctCount)" } else { "?" }

        [void]$sb.AppendLine("| $($col.position) | ``$($col.name)`` | $typeStr | $sizeStr | $nullStr | $pkStr | $dcStr |")
    }

    # Valeurs distinctes
    $colsWithSamples = $tbl.columns | Where-Object { $_.sampleValues -and $_.sampleValues.Count -gt 0 }
    if ($colsWithSamples) {
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine("## Valeurs distinctes")
        [void]$sb.AppendLine("")

        foreach ($col in $colsWithSamples) {
            [void]$sb.AppendLine("### ``$($col.name)`` ($($col.distinctCount) valeurs)")
            [void]$sb.AppendLine("")
            [void]$sb.AppendLine('```')
            [void]$sb.AppendLine(($col.sampleValues -join ', '))
            [void]$sb.AppendLine('```')
            [void]$sb.AppendLine("")
        }
    }

    # Foreign Keys
    if ($tbl.foreignKeys -and $tbl.foreignKeys.Count -gt 0) {
        [void]$sb.AppendLine("## Clefs etrangeres")
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine("| FK | Colonne(s) | Table referencee | Colonne(s) ref |")
        [void]$sb.AppendLine("|----|------------|------------------|----------------|")

        foreach ($fk in $tbl.foreignKeys) {
            $childCols = $fk.columns -join ', '
            $parentCols = $fk.referencedColumns -join ', '
            [void]$sb.AppendLine("| $($fk.name) | $childCols | $($fk.referencedTable) | $parentCols |")
        }
        [void]$sb.AppendLine("")
    }

    # Index
    if ($tbl.indexes -and $tbl.indexes.Count -gt 0) {
        [void]$sb.AppendLine("## Index")
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine("| Nom | Type | Unique | Colonnes |")
        [void]$sb.AppendLine("|-----|------|--------|----------|")

        foreach ($idx in $tbl.indexes) {
            $uStr = if ($idx.isUnique) { "oui" } else { "non" }
            $cols = $idx.columns -join ', '
            [void]$sb.AppendLine("| $($idx.name) | $($idx.type) | $uStr | $cols |")
        }
        [void]$sb.AppendLine("")
    }

    $outFile = Join-Path $OutputDir "$tblName.md"
    [System.IO.File]::WriteAllText($outFile, $sb.ToString(), [System.Text.UTF8Encoding]::new($false))
}

Write-Host "=== TERMINE ===" -ForegroundColor Green
Write-Host "$count fichiers MD generes dans $OutputDir"
