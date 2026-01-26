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
# SPEC CONTEXT LOADING (P1-A: Spec Context Injection)
# ============================================================================

function Get-SpecContext {
    param(
        [string]$Project,
        [int]$IDE
    )

    # Check if spec file exists
    $SpecFile = Join-Path $ProjectRoot ".openspec\specs\$Project-IDE-$IDE.md"
    if (-not (Test-Path $SpecFile)) {
        return $null
    }

    try {
        $Content = Get-Content $SpecFile -Raw -Encoding UTF8

        $Context = @{
            SpecFile = $SpecFile
            SpecVersion = "2.0"
            Tables = @()
            WriteTables = @()
            ReadTables = @()
            Variables = @()
            ParameterCount = 0
            ExpressionCount = 0
            DecodedExpressionCount = 0
        }

        # Extract table count from ## 2. TABLES section header
        if ($Content -match '##\s*2\.\s*TABLES\s*\((\d+)\s*tables\s*-\s*(\d+)\s*en\s*ecriture\)') {
            $Context.TableCount = [int]$Matches[1]
            $Context.WriteTableCount = [int]$Matches[2]
            $Context.ReadTableCount = $Context.TableCount - $Context.WriteTableCount
        }

        # Extract tables from table section (| #NNN | ... | W/R |)
        $TableMatches = [regex]::Matches($Content, '\|\s*#(\d+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\s*\|\s*\*?\*?([WR])\*?\*?\s*\|\s*(\d+)x')
        foreach ($Match in $TableMatches) {
            $Table = @{
                Id = [int]$Match.Groups[1].Value
                PhysicalName = $Match.Groups[2].Value.Trim()
                LogicalName = $Match.Groups[3].Value.Trim()
                Access = $Match.Groups[4].Value
                UsageCount = [int]$Match.Groups[5].Value
            }
            $Context.Tables += $Table
            if ($Table.Access -eq 'W') {
                $Context.WriteTables += $Table
            } else {
                $Context.ReadTables += $Table
            }
        }

        # Extract parameter count from ## 3. PARAMETRES section
        if ($Content -match '##\s*3\.\s*PARAMETRES[^\(]*\((\d+)\)') {
            $Context.ParameterCount = [int]$Matches[1]
        }

        # Extract expression count from ## 5. EXPRESSIONS section
        if ($Content -match '##\s*5\.\s*EXPRESSIONS\s*\((\d+)\s*total,\s*(\d+)\s*decodees\)') {
            $Context.ExpressionCount = [int]$Matches[1]
            $Context.DecodedExpressionCount = [int]$Matches[2]
        }

        # Extract key variables from ## 4. VARIABLES section (first 20)
        $VarMatches = [regex]::Matches($Content, '\|\s*`\{([^}]+)\}`\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|')
        $VarCount = 0
        foreach ($Match in $VarMatches) {
            if ($VarCount -ge 20) { break }
            $Context.Variables += @{
                Ref = "{$($Match.Groups[1].Value)}"
                Name = $Match.Groups[2].Value.Trim()
                Type = $Match.Groups[3].Value.Trim()
            }
            $VarCount++
        }

        return $Context
    }
    catch {
        Write-Warning "Failed to parse spec for $Project IDE $IDE : $_"
        return $null
    }
}

# ============================================================================
# EXECUTION PRINCIPALE
# ============================================================================

$Result = @{
    LocalizedAt = (Get-Date).ToString("o")
    Programs = @()
    Tables = @()
    SpecContextLoaded = 0
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

# ============================================================================
# SPEC CONTEXT INJECTION (P1-A)
# ============================================================================

Write-Host "[Spec Context] Loading spec context for verified programs..." -ForegroundColor Cyan

foreach ($Prog in $Result.Programs) {
    if ($Prog.Verified -and $Prog.Project -and $Prog.IDE) {
        $SpecContext = Get-SpecContext -Project $Prog.Project -IDE $Prog.IDE
        if ($SpecContext) {
            $Prog.SpecContext = $SpecContext
            $Result.SpecContextLoaded++
            Write-Host "  [SPEC] $($Prog.Project) IDE $($Prog.IDE): $($SpecContext.TableCount) tables, $($SpecContext.ExpressionCount) expressions" -ForegroundColor Green
        }
    }
}

# Statistiques
$VerifiedProgs = ($Result.Programs | Where-Object { $_.Verified }).Count
$VerifiedTables = ($Result.Tables | Where-Object { $_.Verified }).Count

Write-Host "[Localization] Results:" -ForegroundColor Green
Write-Host "  - Programs: $VerifiedProgs verified / $($Result.Programs.Count) total" -ForegroundColor Gray
Write-Host "  - Tables: $VerifiedTables verified / $($Result.Tables.Count) total" -ForegroundColor Gray
Write-Host "  - Spec Context: $($Result.SpecContextLoaded) loaded" -ForegroundColor $(if ($Result.SpecContextLoaded -gt 0) { "Green" } else { "Yellow" })

# Sauvegarder (Depth 7 pour supporter SpecContext imbriqué)
$Result | ConvertTo-Json -Depth 7 | Set-Content $OutputFile -Encoding UTF8

Write-Host "[Localization] Output: $OutputFile" -ForegroundColor Green
