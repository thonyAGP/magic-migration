<#
.SYNOPSIS
    Extrait la metadata complete d'une base SQL Server (colonnes, types, PK, FK, index, valeurs distinctes).
.DESCRIPTION
    Interroge INFORMATION_SCHEMA et sys.* pour generer un fichier JSON complet.
.PARAMETER ServerInstance
    Instance SQL Server (defaut: LENOVO_LB2I\SQLEXPRESS)
.PARAMETER Database
    Base de donnees (defaut: CSK0912)
.PARAMETER OutputPath
    Chemin du fichier JSON en sortie
.PARAMETER MaxDistinctSample
    Seuil max de valeurs distinctes pour echantillonner (defaut: 50)
.PARAMETER TableFilter
    Filtre optionnel sur les noms de tables (ex: "cafil%")
.EXAMPLE
    .\Extract-SqlMetadata.ps1
    .\Extract-SqlMetadata.ps1 -TableFilter "cafil008_dat"
    .\Extract-SqlMetadata.ps1 -MaxDistinctSample 100
#>
param(
    [string]$ServerInstance = 'LENOVO_P14S',
    [string]$Database = 'PHU2512',
    [string]$OutputPath = "$PSScriptRoot\PHU2512-metadata.json",
    [int]$MaxDistinctSample = 50,
    [string]$TableFilter = ''
)

$ErrorActionPreference = 'Stop'

function Invoke-Sql {
    param([string]$Query)
    Invoke-Sqlcmd -ServerInstance $ServerInstance -Database $Database -Query $Query -QueryTimeout 120 -TrustServerCertificate
}

Write-Host "=== Extract-SqlMetadata ===" -ForegroundColor Cyan
Write-Host "Server: $ServerInstance"
Write-Host "Database: $Database"
Write-Host ""

# -------------------------------------------------------
# 1. COLONNES (INFORMATION_SCHEMA.COLUMNS)
# -------------------------------------------------------
Write-Host "[1/5] Extraction colonnes..." -ForegroundColor Yellow

$colQuery = @"
SELECT
    c.TABLE_NAME,
    c.COLUMN_NAME,
    c.ORDINAL_POSITION,
    c.DATA_TYPE,
    c.CHARACTER_MAXIMUM_LENGTH,
    c.NUMERIC_PRECISION,
    c.NUMERIC_SCALE,
    c.IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS c
INNER JOIN INFORMATION_SCHEMA.TABLES t
    ON t.TABLE_NAME = c.TABLE_NAME AND t.TABLE_SCHEMA = c.TABLE_SCHEMA
WHERE c.TABLE_SCHEMA = 'dbo'
  AND t.TABLE_TYPE = 'BASE TABLE'
$(if ($TableFilter) { "AND c.TABLE_NAME LIKE '$TableFilter'" })
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION
"@

$allColumns = Invoke-Sql -Query $colQuery
Write-Host "  $($allColumns.Count) colonnes trouvees"

# -------------------------------------------------------
# 2. CLEFS PRIMAIRES (sys.indexes)
# -------------------------------------------------------
Write-Host "[2/5] Extraction clefs primaires..." -ForegroundColor Yellow

$pkQuery = @"
SELECT
    OBJECT_NAME(i.object_id) AS TableName,
    c.name AS ColumnName,
    ic.key_ordinal
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.is_primary_key = 1
$(if ($TableFilter) { "AND OBJECT_NAME(i.object_id) LIKE '$TableFilter'" })
ORDER BY OBJECT_NAME(i.object_id), ic.key_ordinal
"@

$allPKs = Invoke-Sql -Query $pkQuery
Write-Host "  $($allPKs.Count) colonnes PK trouvees"

# -------------------------------------------------------
# 3. CLEFS ETRANGERES (sys.foreign_keys)
# -------------------------------------------------------
Write-Host "[3/5] Extraction clefs etrangeres..." -ForegroundColor Yellow

$fkQuery = @"
SELECT
    fk.name AS FkName,
    OBJECT_NAME(fk.parent_object_id) AS ChildTable,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ChildColumn,
    OBJECT_NAME(fk.referenced_object_id) AS ParentTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ParentColumn,
    fkc.constraint_column_id AS ColOrdinal
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
$(if ($TableFilter) { "WHERE OBJECT_NAME(fk.parent_object_id) LIKE '$TableFilter' OR OBJECT_NAME(fk.referenced_object_id) LIKE '$TableFilter'" })
ORDER BY ChildTable, fk.name, fkc.constraint_column_id
"@

$allFKs = Invoke-Sql -Query $fkQuery
Write-Host "  $($allFKs.Count) colonnes FK trouvees"

# -------------------------------------------------------
# 4. INDEX (sys.indexes)
# -------------------------------------------------------
Write-Host "[4/5] Extraction index..." -ForegroundColor Yellow

$idxQuery = @"
SELECT
    OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    c.name AS ColumnName,
    i.type_desc AS IndexType,
    i.is_unique,
    i.is_primary_key,
    ic.is_included_column,
    ic.key_ordinal
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.name IS NOT NULL
$(if ($TableFilter) { "AND OBJECT_NAME(i.object_id) LIKE '$TableFilter'" })
ORDER BY TableName, i.index_id, ic.key_ordinal
"@

$allIndexes = Invoke-Sql -Query $idxQuery
Write-Host "  $($allIndexes.Count) colonnes d'index trouvees"

# -------------------------------------------------------
# 5. ROW COUNT + VALEURS DISTINCTES
# -------------------------------------------------------
Write-Host "[5/5] Comptage lignes et valeurs distinctes..." -ForegroundColor Yellow

$tableNames = $allColumns | Select-Object -ExpandProperty TABLE_NAME -Unique
$tableStats = @{}

$tableCount = $tableNames.Count
$i = 0
foreach ($tbl in $tableNames) {
    $i++
    Write-Host "  [$i/$tableCount] $tbl" -NoNewline

    # Row count
    $rc = Invoke-Sql -Query "SELECT COUNT(*) AS cnt FROM [$tbl]"
    $rowCount = $rc.cnt

    # Distinct count per column
    $tblCols = $allColumns | Where-Object { $_.TABLE_NAME -eq $tbl }
    $distinctCounts = @{}
    $sampleValues = @{}

    foreach ($col in $tblCols) {
        $colName = $col.COLUMN_NAME
        try {
            $dc = Invoke-Sql -Query "SELECT COUNT(DISTINCT [$colName]) AS dc FROM [$tbl]"
            $distinctCounts[$colName] = $dc.dc

            # Echantillonner si cardinalite faible
            if ($dc.dc -le $MaxDistinctSample -and $dc.dc -gt 0) {
                $samples = Invoke-Sql -Query "SELECT DISTINCT TOP 50 CAST([$colName] AS NVARCHAR(200)) AS val FROM [$tbl] WHERE [$colName] IS NOT NULL ORDER BY val"
                $sampleValues[$colName] = @($samples | ForEach-Object { $_.val })
            }
        }
        catch {
            $distinctCounts[$colName] = -1
        }
    }

    $tableStats[$tbl] = @{
        rowCount = $rowCount
        distinctCounts = $distinctCounts
        sampleValues = $sampleValues
    }

    Write-Host " ($rowCount lignes)"
}

# -------------------------------------------------------
# ASSEMBLAGE JSON
# -------------------------------------------------------
Write-Host ""
Write-Host "Assemblage JSON..." -ForegroundColor Yellow

# Charger mapping Magic si disponible
$magicMapping = @{}
$mappingFile = "$PSScriptRoot\..\MagicMcp\table-mapping.json"
if (Test-Path $mappingFile) {
    $rawMapping = Get-Content $mappingFile -Raw | ConvertFrom-Json
    foreach ($prop in $rawMapping.PSObject.Properties) {
        $entry = $prop.Value
        if ($entry.publicName) {
            $magicMapping[$entry.publicName] = @{
                xmlId = [int]$prop.Name
                ide = $entry.ide
                name = $entry.name
            }
        }
    }
}

$metadata = [ordered]@{
    extractedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    server = $ServerInstance
    database = $Database
    tableCount = $tableNames.Count
    tables = [ordered]@{}
}

# Group PK by table
$pkByTable = @{}
foreach ($pk in $allPKs) {
    if (-not $pkByTable[$pk.TableName]) { $pkByTable[$pk.TableName] = @() }
    $pkByTable[$pk.TableName] += $pk.ColumnName
}

# Group FK by table
$fkByTable = @{}
foreach ($fk in $allFKs) {
    if (-not $fkByTable[$fk.ChildTable]) { $fkByTable[$fk.ChildTable] = @() }
    $fkByTable[$fk.ChildTable] += @{
        name = $fk.FkName
        childColumn = $fk.ChildColumn
        parentTable = $fk.ParentTable
        parentColumn = $fk.ParentColumn
    }
}

# Group Index by table
$idxByTable = @{}
foreach ($idx in $allIndexes) {
    if ($idx.is_primary_key) { continue }
    if (-not $idxByTable[$idx.TableName]) { $idxByTable[$idx.TableName] = @{} }
    if (-not $idxByTable[$idx.TableName][$idx.IndexName]) {
        $idxByTable[$idx.TableName][$idx.IndexName] = @{
            type = $idx.IndexType
            isUnique = [bool]$idx.is_unique
            columns = @()
        }
    }
    $idxByTable[$idx.TableName][$idx.IndexName].columns += $idx.ColumnName
}

foreach ($tbl in $tableNames) {
    $tblCols = $allColumns | Where-Object { $_.TABLE_NAME -eq $tbl }
    $stats = $tableStats[$tbl]
    $pkCols = if ($pkByTable[$tbl]) { $pkByTable[$tbl] } else { @() }

    # Trouver nom logique Magic
    $logicalName = ""
    $magicEntry = $magicMapping[$tbl]
    if ($magicEntry) {
        $logicalName = $magicEntry.name
    }

    $columns = @()
    foreach ($col in $tblCols) {
        $colName = $col.COLUMN_NAME
        $isPK = $colName -in $pkCols

        $maxLen = $null
        if ($col.CHARACTER_MAXIMUM_LENGTH -and $col.CHARACTER_MAXIMUM_LENGTH -ne [DBNull]::Value) {
            $maxLen = [int]$col.CHARACTER_MAXIMUM_LENGTH
        }
        $numPrec = $null
        if ($col.NUMERIC_PRECISION -and $col.NUMERIC_PRECISION -ne [DBNull]::Value) {
            $numPrec = [int]$col.NUMERIC_PRECISION
        }
        $numScale = $null
        if ($col.NUMERIC_SCALE -and $col.NUMERIC_SCALE -ne [DBNull]::Value) {
            $numScale = [int]$col.NUMERIC_SCALE
        }

        $dc = $stats.distinctCounts[$colName]
        $sv = $stats.sampleValues[$colName]

        $colObj = [ordered]@{
            name = $colName
            position = [int]$col.ORDINAL_POSITION
            sqlType = $col.DATA_TYPE
            nullable = ($col.IS_NULLABLE -eq 'YES')
            isPrimaryKey = $isPK
            distinctCount = $dc
        }
        if ($maxLen) { $colObj.maxLength = $maxLen }
        if ($numPrec) { $colObj.numericPrecision = $numPrec }
        if ($numScale -ne $null -and $numScale -ne 0) { $colObj.numericScale = $numScale }
        if ($sv -and $sv.Count -gt 0) { $colObj.sampleValues = $sv }

        $columns += $colObj
    }

    $fks = @()
    if ($fkByTable[$tbl]) {
        $fkGroups = $fkByTable[$tbl] | Group-Object { $_.name }
        foreach ($grp in $fkGroups) {
            $fks += [ordered]@{
                name = $grp.Name
                columns = @($grp.Group | ForEach-Object { $_.childColumn })
                referencedTable = $grp.Group[0].parentTable
                referencedColumns = @($grp.Group | ForEach-Object { $_.parentColumn })
            }
        }
    }

    $indexes = @()
    if ($idxByTable[$tbl]) {
        foreach ($idxName in $idxByTable[$tbl].Keys) {
            $idx = $idxByTable[$tbl][$idxName]
            $indexes += [ordered]@{
                name = $idxName
                type = $idx.type
                isUnique = $idx.isUnique
                columns = $idx.columns
            }
        }
    }

    $metadata.tables[$tbl] = [ordered]@{
        logicalName = $logicalName
        rowCount = $stats.rowCount
        columnCount = $columns.Count
        primaryKey = $pkCols
        columns = $columns
        foreignKeys = $fks
        indexes = $indexes
    }
}

# -------------------------------------------------------
# ECRITURE
# -------------------------------------------------------
$json = $metadata | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($OutputPath, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "=== TERMINE ===" -ForegroundColor Green
Write-Host "Tables: $($tableNames.Count)"
Write-Host "Colonnes: $($allColumns.Count)"
Write-Host "Output: $OutputPath"
Write-Host "Taille: $([math]::Round((Get-Item $OutputPath).Length / 1KB)) KB"
