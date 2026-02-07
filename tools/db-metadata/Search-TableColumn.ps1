<#
.SYNOPSIS
    Recherche rapide dans la metadata SQL Server (tables, colonnes, FK, valeurs).
.PARAMETER MetadataPath
    Chemin du fichier JSON (defaut: CSK0912-metadata.json)
.PARAMETER Table
    Filtre sur le nom de table (wildcard)
.PARAMETER Column
    Filtre sur le nom de colonne (wildcard)
.PARAMETER Type
    Filtre sur le type SQL (ex: nvarchar, int, decimal)
.PARAMETER Value
    Recherche dans les valeurs echantillonnees
.PARAMETER ShowValues
    Affiche les valeurs distinctes des colonnes trouvees
.PARAMETER FK
    Affiche uniquement les colonnes avec FK
.EXAMPLE
    .\Search-TableColumn.ps1 -Table "cafil018*"
    .\Search-TableColumn.ps1 -Column "*societe*"
    .\Search-TableColumn.ps1 -Table "cafil008*" -Column "*filiation*"
    .\Search-TableColumn.ps1 -Value "EXCHANGE"
    .\Search-TableColumn.ps1 -Type "decimal" -Table "cafil018*"
#>
param(
    [string]$MetadataPath = "$PSScriptRoot\PHU2512-metadata.json",
    [string]$Table = '',
    [string]$Column = '',
    [string]$Type = '',
    [string]$Value = '',
    [switch]$ShowValues,
    [switch]$FK
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $MetadataPath)) {
    Write-Error "Fichier metadata introuvable: $MetadataPath. Lancer Extract-SqlMetadata.ps1 d'abord."
    return
}

$metadata = Get-Content $MetadataPath -Raw | ConvertFrom-Json

$results = @()

foreach ($prop in $metadata.tables.PSObject.Properties) {
    $tblName = $prop.Name
    $tbl = $prop.Value

    if ($Table -and $tblName -notlike $Table) { continue }

    foreach ($col in $tbl.columns) {
        $match = $true

        if ($Column -and $col.name -notlike $Column) { $match = $false }
        if ($Type -and $col.sqlType -notlike $Type) { $match = $false }
        if ($FK) {
            $hasFk = $false
            foreach ($fk in $tbl.foreignKeys) {
                if ($fk.columns -contains $col.name) { $hasFk = $true; break }
            }
            if (-not $hasFk) { $match = $false }
        }
        if ($Value -and $col.sampleValues) {
            $found = $false
            foreach ($sv in $col.sampleValues) {
                if ($sv -like "*$Value*") { $found = $true; break }
            }
            if (-not $found) { $match = $false }
        }
        elseif ($Value -and -not $col.sampleValues) {
            $match = $false
        }

        if ($match) {
            $sizeStr = ""
            if ($col.maxLength) {
                $sizeStr = if ($col.maxLength -eq -1) { "MAX" } else { "$($col.maxLength)" }
            }
            elseif ($col.numericPrecision) {
                $sizeStr = "$($col.numericPrecision)"
                if ($col.numericScale -and $col.numericScale -ne 0) {
                    $sizeStr += ",$($col.numericScale)"
                }
            }

            $fkInfo = ""
            foreach ($fk in $tbl.foreignKeys) {
                $idx = [array]::IndexOf($fk.columns, $col.name)
                if ($idx -ge 0) {
                    $fkInfo = "-> $($fk.referencedTable).$($fk.referencedColumns[$idx])"
                    break
                }
            }

            $results += [PSCustomObject]@{
                Table      = $tblName
                LogicalName = $tbl.logicalName
                Column     = $col.name
                Type       = $col.sqlType
                Size       = $sizeStr
                Nullable   = if ($col.nullable) { "Y" } else { "N" }
                PK         = if ($col.isPrimaryKey) { "PK" } else { "" }
                Distinct   = $col.distinctCount
                FK         = $fkInfo
                Values     = if ($col.sampleValues) { ($col.sampleValues | Select-Object -First 10) -join ', ' } else { "" }
            }
        }
    }
}

if ($results.Count -eq 0) {
    Write-Host "Aucun resultat." -ForegroundColor Yellow
    return
}

Write-Host "$($results.Count) colonnes trouvees" -ForegroundColor Green
Write-Host ""

if ($ShowValues) {
    foreach ($r in $results) {
        Write-Host "$($r.Table).$($r.Column)" -ForegroundColor Cyan -NoNewline
        Write-Host " ($($r.Type) $($r.Size))" -ForegroundColor DarkGray
        if ($r.Values) {
            Write-Host "  Valeurs: $($r.Values)" -ForegroundColor White
        }
        if ($r.FK) {
            Write-Host "  FK: $($r.FK)" -ForegroundColor Yellow
        }
    }
}
else {
    $cols = @('Table', 'Column', 'Type', 'Size', 'PK', 'Distinct')
    if ($FK) { $cols += 'FK' }
    $results | Format-Table $cols -AutoSize
}
