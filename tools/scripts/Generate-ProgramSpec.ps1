<#
.SYNOPSIS
    Génère une spécification complète pour un programme Magic ADH/PBP/PVE/etc.

.DESCRIPTION
    Combine spécification fonctionnelle, technique et cartographie applicative
    en un seul document Markdown structuré.

.PARAMETER Project
    Projet Magic (ADH, PBP, PVE, PBG, VIL, REF)

.PARAMETER IDE
    Position IDE du programme

.PARAMETER OutputPath
    Chemin de sortie (défaut: .openspec/specs/)

.EXAMPLE
    .\Generate-ProgramSpec.ps1 -Project ADH -IDE 238
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('ADH','PBP','PVE','PBG','VIL','REF')]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IDE,

    [string]$OutputPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\specs"
)

$ErrorActionPreference = "Stop"

# Chemins sources
$sourcePath = "D:\Data\Migration\XPA\PMS\$Project\Source"
$refDataSources = "D:\Data\Migration\XPA\PMS\REF\Source\DataSources.xml"
$prgFile = Join-Path $sourcePath "Prg_$IDE.xml"
$headersFile = Join-Path $sourcePath "ProgramHeaders.xml"

Write-Host "=== Génération Spécification $Project IDE $IDE ===" -ForegroundColor Cyan

# Vérifier existence fichier
if (-not (Test-Path $prgFile)) {
    Write-Error "Fichier $prgFile introuvable"
    exit 1
}

# ============================================================================
# 1. EXTRACTION HEADER
# ============================================================================

Write-Host "`n[1/5] Extraction Header..." -ForegroundColor Yellow

[xml]$prg = Get-Content $prgFile -Encoding UTF8
$header = $prg.Application.ProgramsRepository.Programs.Task.Header

$spec = @{
    Project = $Project
    IDE = $IDE
    Description = $header.Description
    PublicName = $header.Public.val
    TaskType = $header.TaskType.val
    LastModified = $header.LastModified.date
    ParamCount = $header.ReturnValue.ParametersCount.val
}

Write-Host "  Description: $($spec.Description)"
Write-Host "  Public: $($spec.PublicName)"
Write-Host "  Type: $($spec.TaskType)"

# ============================================================================
# 2. EXTRACTION TABLES
# ============================================================================

Write-Host "`n[2/5] Extraction Tables..." -ForegroundColor Yellow

$dbs = $prg.SelectNodes('//Resource/DB')
$tables = @()

foreach ($db in $dbs) {
    $obj = $db.DataObject.obj
    $comp = $db.DataObject.comp
    $access = $db.Access.val

    if ($comp -eq "4" -or $comp -eq "-1") {
        $tables += @{
            ID = $obj
            Comp = $comp
            Access = $access
            PhysicalName = ""
            LogicalName = ""
        }
    }
}

# Mapper les noms physiques depuis REF
if (Test-Path $refDataSources) {
    foreach ($table in $tables) {
        $id = $table.ID
        $match = Select-String -Path $refDataSources -Pattern "id=`"$id`".*PhysicalName=`"([^`"]+)`"" | Select-Object -First 1
        if ($match) {
            $table.PhysicalName = ($match.Line -replace '.*PhysicalName="([^"]+)".*','$1')
            $table.LogicalName = ($match.Line -replace '.*name="([^"]+)".*','$1')
        }
    }
}

$spec.Tables = $tables
Write-Host "  Tables trouvées: $($tables.Count)"

# ============================================================================
# 3. EXTRACTION TACHES
# ============================================================================

Write-Host "`n[3/5] Extraction Tâches..." -ForegroundColor Yellow

$tasks = $prg.SelectNodes('//Task')
$taskList = @()

foreach ($task in $tasks) {
    $taskHeader = $task.Header
    if ($taskHeader -and $taskHeader.ISN_2) {
        $taskList += @{
            ISN2 = $taskHeader.ISN_2
            ID = $taskHeader.id
            Description = $taskHeader.Description
            TaskType = $taskHeader.TaskType.val
        }
    }
}

$spec.Tasks = $taskList
Write-Host "  Tâches trouvées: $($taskList.Count)"

# ============================================================================
# 4. EXTRACTION CALLERS/CALLEES
# ============================================================================

Write-Host "`n[4/5] Extraction Relations d'appel..." -ForegroundColor Yellow

$callers = @()
$callees = @()

# Chercher les CallTask vers ce programme dans tous les Prg_*.xml
$allPrgs = Get-ChildItem "$sourcePath\Prg_*.xml"
foreach ($file in $allPrgs) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match "FlowIsn=`"$IDE`"" -or $content -match "TargetTask.*$IDE") {
        $callerIDE = $file.BaseName -replace 'Prg_',''
        if ($callerIDE -ne "$IDE") {
            $callers += $callerIDE
        }
    }
}

# Chercher les CallTask depuis ce programme
$callMatches = [regex]::Matches($prg.OuterXml, 'FlowIsn="(\d+)"')
foreach ($match in $callMatches) {
    $targetIDE = $match.Groups[1].Value
    if ($targetIDE -ne "$IDE" -and $targetIDE -notin $callees) {
        $callees += $targetIDE
    }
}

# Chercher CallProg
$callProgMatches = [regex]::Matches($prg.OuterXml, "CallProg\('\{(\d+)")
foreach ($match in $callProgMatches) {
    $targetIDE = $match.Groups[1].Value
    if ($targetIDE -notin $callees) {
        $callees += $targetIDE
    }
}

$spec.Callers = $callers | Select-Object -Unique
$spec.Callees = $callees | Select-Object -Unique

Write-Host "  Callers: $($spec.Callers.Count)"
Write-Host "  Callees: $($spec.Callees.Count)"

# ============================================================================
# 5. GENERATION DOCUMENT
# ============================================================================

Write-Host "`n[5/5] Génération Document..." -ForegroundColor Yellow

$date = Get-Date -Format "yyyy-MM-dd"
$outputFile = Join-Path $OutputPath "$Project-IDE-$IDE.md"

$markdown = @"
# $Project IDE $IDE - $($spec.Description)

> **Généré le** : $date
> **Source** : ``$prgFile``
> **Modèle** : Spécification Programme Magic v1.0

---

## 1. SPÉCIFICATION FONCTIONNELLE

### 1.1 Identification

| Attribut | Valeur |
|----------|--------|
| **IDE Position** | $IDE |
| **Nom Public** | $($spec.PublicName) |
| **Description** | $($spec.Description) |
| **Type** | $($spec.TaskType) (O=Online, B=Batch) |
| **Module** | $Project |
| **Dernière modification** | $($spec.LastModified) |

### 1.2 Paramètres ($($spec.ParamCount))

*À documenter manuellement ou via extraction détaillée*

---

## 2. SPÉCIFICATION TECHNIQUE

### 2.1 Tables Utilisées ($($spec.Tables.Count))

| ID | Nom Physique | Nom Logique | Access |
|----|--------------|-------------|--------|
"@

foreach ($table in $spec.Tables) {
    $markdown += "| $($table.ID) | ``$($table.PhysicalName)`` | $($table.LogicalName) | $($table.Access) |`n"
}

$markdown += @"

### 2.2 Structure des Tâches ($($spec.Tasks.Count))

``````
$Project IDE $IDE - $($spec.Description)
"@

foreach ($task in $spec.Tasks) {
    $markdown += "`n+-- Tache $IDE.$($task.ISN2) - $($task.Description) [Type: $($task.TaskType)]"
}

$markdown += @"

``````

---

## 3. CARTOGRAPHIE APPLICATIVE

### 3.1 Programmes Appelants ($($spec.Callers.Count))

| IDE | Fichier |
|-----|---------|
"@

foreach ($caller in $spec.Callers) {
    $markdown += "| $caller | Prg_$caller.xml |`n"
}

$markdown += @"

### 3.2 Programmes Appelés ($($spec.Callees.Count))

| IDE | Fichier |
|-----|---------|
"@

foreach ($callee in $spec.Callees) {
    $markdown += "| $callee | Prg_$callee.xml |`n"
}

$markdown += @"

### 3.3 Diagramme de Dépendances

``````
"@

if ($spec.Callers.Count -gt 0) {
    foreach ($caller in $spec.Callers) {
        $markdown += "Prg_$caller --> "
    }
}
$markdown += "[$Project IDE $IDE]"
if ($spec.Callees.Count -gt 0) {
    $markdown += " --> "
    $markdown += ($spec.Callees | ForEach-Object { "Prg_$_" }) -join ", "
}

$markdown += @"

``````

---

## 4. NOTES DE MIGRATION

### 4.1 Complexité Estimée

| Critère | Valeur |
|---------|--------|
| Tâches | $($spec.Tasks.Count) |
| Tables | $($spec.Tables.Count) |
| Tables en écriture | $(($spec.Tables | Where-Object { $_.Access -eq 'W' }).Count) |
| Callers | $($spec.Callers.Count) |
| Callees | $($spec.Callees.Count) |

---

*Généré automatiquement par Generate-ProgramSpec.ps1*
"@

# Créer le dossier si nécessaire
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$markdown | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "`n[OK] Spécification générée: $outputFile" -ForegroundColor Green
Write-Host ""
