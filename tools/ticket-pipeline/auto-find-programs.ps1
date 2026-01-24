# auto-find-programs.ps1
# Phase 2: Localisation des programmes via Knowledge Base SQLite
# Utilise sqlite3.exe CLI pour requetes directes sur la KB

param(
    [Parameter(Mandatory=$true)]
    [array]$Programs,

    [array]$Tables = @(),

    [string]$McpExe = $null,

    [Parameter(Mandatory=$true)]
    [string]$OutputFile
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Paths
$KbPath = Join-Path $env:USERPROFILE ".magic-kb\knowledge.db"
$Sqlite3Exe = Join-Path $ScriptDir "sqlite3.exe"
$ProjectsPath = "D:\Data\Migration\XPA\PMS"

# Verifier que sqlite3.exe existe
if (-not (Test-Path $Sqlite3Exe)) {
    Write-Error "sqlite3.exe not found at: $Sqlite3Exe"
    exit 1
}

# Verifier que la KB existe
if (-not (Test-Path $KbPath)) {
    Write-Error "Knowledge Base not found at: $KbPath"
    exit 1
}

# Fonction pour executer SQL sur la KB via sqlite3.exe CLI
function Invoke-KbQuery {
    param([string]$Sql)

    try {
        # Executer sqlite3 avec sortie JSON
        $Output = & $Sqlite3Exe $KbPath -json $Sql 2>&1

        if ($LASTEXITCODE -ne 0) {
            Write-Warning "SQLite error: $Output"
            return @()
        }

        # Si pas de resultat, retourner tableau vide
        if ([string]::IsNullOrWhiteSpace($Output)) {
            return @()
        }

        # Parser le JSON
        $Results = $Output | ConvertFrom-Json
        return $Results
    }
    catch {
        Write-Warning "Query failed: $_"
        return @()
    }
}

# Fonction pour lire ProgramHeaders.xml et obtenir IDE
function Get-ProgramIDE {
    param(
        [string]$Project,
        [int]$ProgramId
    )

    $HeadersPath = Join-Path $ProjectsPath "$Project\Source\ProgramHeaders.xml"
    if (-not (Test-Path $HeadersPath)) {
        return $null
    }

    [xml]$Xml = Get-Content $HeadersPath -Encoding UTF8
    $Prg = $Xml.ProgramHeadersTable.ProgramHeader | Where-Object { $_.ISN -eq $ProgramId }

    if ($Prg) {
        return @{
            IDE = $Prg.externalname
            Name = $Prg.name
            PublicName = $Prg.publicName
            Component = $Prg.comp_ref
        }
    }

    return $null
}

# Fonction de recherche fuzzy dans la KB
function Search-Program {
    param([string]$Query)

    $SafeQuery = $Query -replace "'", "''"

    $Sql = @"
SELECT p.name as project, pr.xml_id as program_id, pr.name, pr.public_name, pr.ide_position
FROM programs pr
JOIN projects p ON pr.project_id = p.id
WHERE pr.name LIKE '%$SafeQuery%'
   OR pr.public_name LIKE '%$SafeQuery%'
   OR CAST(pr.ide_position AS TEXT) LIKE '%$SafeQuery%'
LIMIT 20
"@

    return Invoke-KbQuery -Sql $Sql
}

# ============================================================================
# EXECUTION PRINCIPALE
# ============================================================================

$Result = @{
    LocalizedAt = (Get-Date).ToString("o")
    Programs = @()
    Tables = @()
}

Write-Host "[Localization] Processing $($Programs.Count) program candidates..." -ForegroundColor Cyan

foreach ($Prog in $Programs) {
    $Query = if ($Prog.Raw) { $Prog.Raw } else { $Prog }
    Write-Host "  Searching: $Query" -ForegroundColor Gray

    # Extraire le pattern
    $SearchTerm = $Query

    # Pattern: ADH IDE 69
    if ($Query -match '([A-Z]{2,3})\s+IDE\s+(\d+)') {
        $Project = $Matches[1]
        $IDE = $Matches[2]

        $Sql = @"
SELECT pj.name as project, pr.xml_id as program_id, pr.name, pr.public_name, pr.ide_position
FROM programs pr
JOIN projects pj ON pr.project_id = pj.id
WHERE pj.name='$Project' AND pr.ide_position=$IDE
LIMIT 1
"@
        $Found = Invoke-KbQuery -Sql $Sql

        if ($Found) {
            $Result.Programs += @{
                Raw = $Query
                Project = $Found.project
                ProgramId = $Found.program_id
                IDE = $Found.ide_position
                Name = $Found.name
                PublicName = $Found.public_name
                Verified = $true
                Source = "kb-exact"
            }
            continue
        }
    }

    # Pattern: Prg_123
    if ($Query -match 'Prg[_\s]?(\d+)') {
        $ProgramId = $Matches[1]

        $Sql = @"
SELECT pj.name as project, pr.xml_id as program_id, pr.name, pr.public_name, pr.ide_position
FROM programs pr
JOIN projects pj ON pr.project_id = pj.id
WHERE pr.xml_id=$ProgramId
LIMIT 5
"@
        $Found = Invoke-KbQuery -Sql $Sql

        if ($Found) {
            foreach ($F in $Found) {
                $Result.Programs += @{
                    Raw = $Query
                    Project = $F.project
                    ProgramId = $F.program_id
                    IDE = $F.ide_position
                    Name = $F.name
                    PublicName = $F.public_name
                    Verified = $true
                    Source = "kb-id"
                }
            }
            continue
        }
    }

    # Pattern: Nom de programme (EXTRAIT_COMPTE, Main Sale, etc.)
    $SearchTerm = $Query -replace '^programme\s+', '' -replace '^program\s+', ''
    $KbResults = Search-Program -Query $SearchTerm

    if ($KbResults) {
        foreach ($R in $KbResults) {
            $Result.Programs += @{
                Raw = $Query
                Project = $R.project
                ProgramId = $R.program_id
                IDE = $R.ide_position
                Name = $R.name
                PublicName = $R.public_name
                Verified = $true
                Source = "kb-fuzzy"
            }
        }
    }
    else {
        # Non trouve - ajouter comme non verifie
        $Result.Programs += @{
            Raw = $Query
            Verified = $false
            Source = "not-found"
        }
    }
}

# Traiter les tables
Write-Host "[Localization] Processing $($Tables.Count) table candidates..." -ForegroundColor Cyan

foreach ($Table in $Tables) {
    $Query = if ($Table.Raw) { $Table.Raw } else { $Table }

    # Pattern: Table n°40
    if ($Query -match 'Table\s+n[°o]?\s*(\d+)') {
        $TableId = $Matches[1]

        $Sql = "SELECT xml_id as table_id, logical_name as name, public_name FROM tables WHERE xml_id=$TableId LIMIT 1"
        $Found = Invoke-KbQuery -Sql $Sql

        if ($Found) {
            $Result.Tables += @{
                Raw = $Query
                TableId = $Found.table_id
                Name = $Found.name
                PublicName = $Found.public_name
                Verified = $true
            }
            continue
        }
    }

    # Pattern: nom de table
    $SafeQuery = $Query -replace "'", "''"
    $Sql = "SELECT xml_id as table_id, logical_name as name, public_name FROM tables WHERE logical_name LIKE '%$SafeQuery%' OR public_name LIKE '%$SafeQuery%' LIMIT 5"
    $Found = Invoke-KbQuery -Sql $Sql

    if ($Found) {
        foreach ($F in $Found) {
            $Result.Tables += @{
                Raw = $Query
                TableId = $F.table_id
                Name = $F.name
                PublicName = $F.public_name
                Verified = $true
            }
        }
    }
}

# Deduplication
$Result.Programs = @($Result.Programs | Group-Object { "$($_.Project)-$($_.ProgramId)" } | ForEach-Object { $_.Group[0] })
$Result.Tables = @($Result.Tables | Group-Object { $_.TableId } | ForEach-Object { $_.Group[0] })

# Statistiques
$VerifiedProgs = ($Result.Programs | Where-Object { $_.Verified }).Count
$VerifiedTables = ($Result.Tables | Where-Object { $_.Verified }).Count

Write-Host "[Localization] Results:" -ForegroundColor Green
Write-Host "  - Programs: $VerifiedProgs verified / $($Result.Programs.Count) total" -ForegroundColor Gray
Write-Host "  - Tables: $VerifiedTables verified / $($Result.Tables.Count) total" -ForegroundColor Gray

# Sauvegarder
$Result | ConvertTo-Json -Depth 5 | Set-Content $OutputFile -Encoding UTF8

Write-Host "[Localization] Output: $OutputFile" -ForegroundColor Green
