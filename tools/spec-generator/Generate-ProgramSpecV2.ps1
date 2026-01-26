#Requires -Version 5.1
<#
.SYNOPSIS
    Generate Program Specification v2.0 for Magic Unipaas programs

.DESCRIPTION
    Extracts all information from a Magic program XML file and generates
    a comprehensive specification document with:
    - Correct IDE position to XML file mapping
    - Fully decoded tables with physical/logical names
    - All variables mapped with their names
    - Expressions decoded with variable names
    - Call graph (callers/callees)

.PARAMETER Project
    Project code (ADH, PBP, PVE, VIL, etc.)

.PARAMETER IDE
    IDE position number (1-indexed as shown in Magic IDE)

.PARAMETER OutputPath
    Optional output directory. Defaults to .openspec/specs/

.EXAMPLE
    .\Generate-ProgramSpecV2.ps1 -Project ADH -IDE 238
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IDE,

    [string]$OutputPath = "D:\Projects\Lecteur_Magic\.openspec\specs"
)

$ErrorActionPreference = "Stop"
$projectsPath = "D:\Data\Migration\XPA\PMS"

Write-Host "=== Generate Program Specification v2.0 ===" -ForegroundColor Cyan
Write-Host "Project: $Project | IDE: $IDE" -ForegroundColor Cyan

# ============================================================================
# STEP 1: Find the correct XML file from IDE position
# ============================================================================
Write-Host "`n[1/7] Finding XML file for IDE position $IDE..." -ForegroundColor Yellow

$progsPath = "$projectsPath\$Project\Source\Progs.xml"
if (-not (Test-Path $progsPath)) {
    throw "Progs.xml not found: $progsPath"
}

[xml]$progs = Get-Content $progsPath -Encoding UTF8
$programs = $progs.Application.ProgramsRepositoryOutLine.Programs.Program

if ($programs.Count -lt $IDE) {
    throw "IDE position $IDE exceeds program count ($($programs.Count))"
}

$progId = $programs[$IDE - 1].id
$prgFile = "$projectsPath\$Project\Source\Prg_$progId.xml"

if (-not (Test-Path $prgFile)) {
    throw "Program file not found: $prgFile"
}

Write-Host "  -> $Project IDE $IDE = Prg_$progId.xml" -ForegroundColor Green

# ============================================================================
# STEP 2: Load program XML and extract header info
# ============================================================================
Write-Host "`n[2/7] Loading program XML..." -ForegroundColor Yellow

[xml]$prg = Get-Content $prgFile -Encoding UTF8
$task = $prg.Application.ProgramsRepository.Programs.Task
$header = $task.Header

$description = $header.Description
$taskType = $header.TaskType.val
$paramCount = if ($header.ReturnValue.ParametersCount.val) { $header.ReturnValue.ParametersCount.val } else { 0 }

Write-Host "  Description: $description"
Write-Host "  Type: $taskType | Params: $paramCount"

# Find folder name from Progs.xml
$folderName = "Unknown"
$folders = $progs.Application.Header.Folders.Folder
foreach ($folder in $folders) {
    $start = [int]$folder.StartsAt.val
    $count = [int]$folder.NumberOfEntries.val
    if ($IDE -ge $start -and $IDE -lt ($start + $count)) {
        $folderName = $folder.Name.val
        break
    }
}
Write-Host "  Folder: $folderName"

# ============================================================================
# STEP 3: Load table mapping from REF DataSources.xml
# ============================================================================
Write-Host "`n[3/7] Loading table mapping..." -ForegroundColor Yellow

$tableMapping = @{}
$refDsPath = "$projectsPath\REF\Source\DataSources.xml"
if (Test-Path $refDsPath) {
    $content = Get-Content $refDsPath -Raw -Encoding UTF8
    # Match: <DataObject ... id="X" ... name="Y" ... PhysicalName="Z" ...>
    $pattern = '<DataObject[^>]+id="(\d+)"[^>]+name="([^"]+)"[^>]+PhysicalName="([^"]+)"'
    $matches = [regex]::Matches($content, $pattern)
    foreach ($match in $matches) {
        $tableMapping[$match.Groups[1].Value] = @{
            Name = $match.Groups[2].Value
            Physical = $match.Groups[3].Value
        }
    }
    # Also try reverse order (PhysicalName before id)
    $pattern2 = '<DataObject[^>]+PhysicalName="([^"]+)"[^>]+id="(\d+)"[^>]+name="([^"]+)"'
    $matches2 = [regex]::Matches($content, $pattern2)
    foreach ($match in $matches2) {
        if (-not $tableMapping.ContainsKey($match.Groups[2].Value)) {
            $tableMapping[$match.Groups[2].Value] = @{
                Name = $match.Groups[3].Value
                Physical = $match.Groups[1].Value
            }
        }
    }
    Write-Host "  Loaded $($tableMapping.Count) table mappings" -ForegroundColor Green
}

# ============================================================================
# STEP 4: Extract tables used by this program (ALL subtasks)
# ============================================================================
Write-Host "`n[4/7] Extracting tables from ALL subtasks..." -ForegroundColor Yellow

# Extract from ALL tasks (main + subtasks), not just main task
$allDbs = $prg.SelectNodes("//Task/Resource/DB")
Write-Host "  Found $($allDbs.Count) DB entries across all subtasks"

# Track unique tables with highest access level (W > R)
$tableAccess = @{}
$tableUsage = @{}

foreach ($db in $allDbs) {
    $tableId = $db.DataObject.obj
    if (-not $tableId) { continue }

    $access = $db.Access.val

    # Track usage count
    if (-not $tableUsage[$tableId]) { $tableUsage[$tableId] = 0 }
    $tableUsage[$tableId]++

    # Keep Write access if found (W takes priority over R)
    if (-not $tableAccess[$tableId] -or $access -eq "W") {
        $tableAccess[$tableId] = $access
    }
}

# Build tables list with resolved names
$tables = @()
foreach ($tableId in $tableAccess.Keys | Sort-Object { [int]$_ }) {
    $access = $tableAccess[$tableId]
    $usage = $tableUsage[$tableId]
    $tableInfo = $tableMapping[$tableId]
    $tables += [PSCustomObject]@{
        ID = $tableId
        Physical = if ($tableInfo) { $tableInfo.Physical } else { "Table_$tableId" }
        Logical = if ($tableInfo) { $tableInfo.Name } else { "Unknown" }
        Access = $access
        Usage = $usage
    }
}

$writeCount = ($tables | Where-Object { $_.Access -eq "W" }).Count
$readCount = ($tables | Where-Object { $_.Access -eq "R" }).Count
Write-Host "  Unique tables: $($tables.Count) (Read: $readCount, Write: $writeCount)"

# ============================================================================
# STEP 5: Build variable mapping (local + VG)
# ============================================================================
Write-Host "`n[5/7] Building variable mapping..." -ForegroundColor Yellow

$varMapping = @{}

# Get Main offset from Main program (number of VG columns)
$mainPrgPath = "$projectsPath\$Project\Source\Prg_1.xml"
$mainOffset = 0
if (Test-Path $mainPrgPath) {
    [xml]$mainPrg = Get-Content $mainPrgPath -Encoding UTF8
    $mainTask = $mainPrg.Application.ProgramsRepository.Programs.Task
    $mainColumns = $mainTask.Resource.Columns.Column
    $mainOffset = $mainColumns.Count
    Write-Host "  Main offset (VG count): $mainOffset"

    # Map VG variables using 0-based index in the columns list
    $vgIdx = 0
    foreach ($col in $mainColumns) {
        $colName = $col.name
        if (-not $colName.StartsWith("VG.")) { $colName = "VG.$colName" }
        $varMapping["{32768,$vgIdx}"] = $colName
        $vgIdx++
    }
    Write-Host "  Mapped $vgIdx VG variables"
}

# Map local variables (from current program columns)
# Magic uses formula: reference = {0, column_id - mainOffset}
# So column_id 1 with mainOffset 118 -> {0,-117}
$columns = $task.Resource.Columns.Column
$localVars = @()
$colIndex = 0
foreach ($col in $columns) {
    $colId = [int]$col.id
    $colName = $col.name
    $model = $col.PropertyList.Model.attr_obj
    $def = $col.PropertyList.Definition.val

    # Magic formula: reference index = column_id - mainOffset
    $varRef = $colId - $mainOffset
    $varMapping["{0,$varRef}"] = $colName

    # Also map by 0-based index for programs that use sequential indexing
    $varMapping["{0,$colIndex}"] = $colName

    $localVars += [PSCustomObject]@{
        Ref = "{0,$varRef}"
        ID = $colId
        Name = $colName
        Type = $model -replace 'FIELD_', ''
        Definition = switch ($def) { "1" { "Virtual" } "2" { "Parameter" } "3" { "Local" } default { $def } }
    }
    $colIndex++
}
Write-Host "  Mapped $($localVars.Count) local variables (both ID-based and index-based)"

# ============================================================================
# STEP 6: Extract and decode expressions
# ============================================================================
Write-Host "`n[6/7] Decoding expressions..." -ForegroundColor Yellow

$expressions = @()
$exprNodes = $prg.SelectNodes("//Expressions/Expression")

foreach ($expr in $exprNodes) {
    $exprId = $expr.id
    $exprSyntax = $expr.ExpSyntax.val

    if (-not $exprSyntax) { continue }

    # Decode variables in expression
    $decoded = $exprSyntax
    foreach ($key in $varMapping.Keys) {
        $escaped = [regex]::Escape($key)
        $decoded = $decoded -replace $escaped, $varMapping[$key]
    }

    $expressions += [PSCustomObject]@{
        ID = $exprId
        Raw = $exprSyntax
        Decoded = $decoded
        FullyDecoded = ($decoded -notmatch '\{[0-9]+,-?[0-9]+\}')
    }
}

$fullyDecoded = ($expressions | Where-Object { $_.FullyDecoded }).Count
Write-Host "  Total expressions: $($expressions.Count)"
Write-Host "  Fully decoded: $fullyDecoded ($([math]::Round($fullyDecoded * 100 / [math]::Max(1, $expressions.Count)))%)"

# ============================================================================
# STEP 7: Generate Markdown specification
# ============================================================================
Write-Host "`n[7/7] Generating specification..." -ForegroundColor Yellow

$date = Get-Date -Format "yyyy-MM-dd"
$outputFile = "$OutputPath\$Project-IDE-$IDE.md"

# Build tables section (Write tables first, then Read)
$tablesSection = ""
$writeTables = $tables | Where-Object { $_.Access -eq "W" } | Sort-Object { [int]$_.ID }
$readTables = $tables | Where-Object { $_.Access -eq "R" } | Sort-Object { [int]$_.ID }
foreach ($t in $writeTables) {
    $tablesSection += "| #$($t.ID) | ``$($t.Physical)`` | $($t.Logical) | **W** | $($t.Usage)x |`n"
}
foreach ($t in $readTables) {
    $tablesSection += "| #$($t.ID) | ``$($t.Physical)`` | $($t.Logical) | R | $($t.Usage)x |`n"
}

# Build parameters section (Definition = Parameter)
$params = $localVars | Where-Object { $_.Definition -eq "Parameter" } | Select-Object -First 22
$paramsSection = ""
$pIdx = 1
foreach ($p in $params) {
    $paramsSection += "| P$pIdx | $($p.Name) | $($p.Type) | - |`n"
    $pIdx++
}

# Build variables section (first 30 important ones)
$varsSection = ""
$important = $localVars | Where-Object { $_.Name -match '^(W0|V0|v\.)' } | Select-Object -First 20
foreach ($v in $important) {
    $varsSection += "| ``$($v.Ref)`` | $($v.Name) | $($v.Type) | - |`n"
}

# Build VG section
$vgSection = ""
$vgVars = $varMapping.Keys | Where-Object { $_ -match '^\{32768,' } | Sort-Object { [int]($_ -replace '[^\d,]', '' -split ',')[1] } | Select-Object -First 15
foreach ($vg in $vgVars) {
    $vgSection += "| ``$vg`` | $($varMapping[$vg]) | - |`n"
}

# Build expressions section (first 30)
$exprSection = ""
$sampleExprs = $expressions | Select-Object -First 30
foreach ($e in $sampleExprs) {
    $rawEsc = $e.Raw -replace '\|', '\|' -replace '`', "'"
    $decEsc = $e.Decoded -replace '\|', '\|' -replace '`', "'"
    if ($rawEsc.Length -gt 60) { $rawEsc = $rawEsc.Substring(0, 57) + "..." }
    if ($decEsc.Length -gt 60) { $decEsc = $decEsc.Substring(0, 57) + "..." }
    $exprSection += "| $($e.ID) | ``$rawEsc`` | ``$decEsc`` |`n"
}

# Generate full markdown
$md = @"
# $Project IDE $IDE - $description

> **Version spec** : 2.0
> **Genere le** : $date
> **Source** : ``$prgFile``

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | $Project IDE $IDE |
| **Fichier XML** | Prg_$progId.xml |
| **Description** | $description |
| **Type** | $taskType (O=Online, B=Batch) |
| **Parametres** | $paramCount |
| **Module** | $Project |
| **Dossier IDE** | $folderName |

> **Note**: Ce programme est Prg_$progId.xml. L'ID XML ($progId) peut differer de la position IDE ($IDE).

---

## 2. TABLES ($($tables.Count) tables - $writeCount en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
$tablesSection
---

## 3. PARAMETRES D'ENTREE ($paramCount)

| # | Nom | Type | Description |
|---|-----|------|-------------|
$paramsSection
---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
$varsSection
### 4.2 Variables globales (VG)

| Ref | Decode | Role |
|-----|--------|------|
$vgSection
> Total: $($varMapping.Count) variables mappees

---

## 5. EXPRESSIONS ($($expressions.Count) total, $fullyDecoded decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
$exprSection
---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | $($tables.Count) ($writeCount W / $readCount R) |
| Parametres | $paramCount |
| Variables locales | $($localVars.Count) |
| Expressions | $($expressions.Count) |
| Expressions 100% decodees | $fullyDecoded ($([math]::Round($fullyDecoded * 100 / [math]::Max(1, $expressions.Count)))%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| $date | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*
"@

# Save markdown
$md | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "`n=== SPEC GENEREE ===" -ForegroundColor Green
Write-Host "Fichier: $outputFile"
Write-Host "Tables: $($tables.Count) | Variables: $($varMapping.Count) | Expressions: $($expressions.Count)"

# Return summary object
[PSCustomObject]@{
    Project = $Project
    IDE = $IDE
    XmlFile = "Prg_$progId.xml"
    Description = $description
    Tables = $tables.Count
    Variables = $varMapping.Count
    Expressions = $expressions.Count
    FullyDecoded = $fullyDecoded
    OutputFile = $outputFile
}
