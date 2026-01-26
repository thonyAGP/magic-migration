# Sync-SpecsToKb.ps1
# Synchronize program specifications from .openspec/specs/*.md to Knowledge Base
# Part of Phase 2A: KB Indexing Infrastructure

param(
    [string]$OpenspecPath = ".openspec",
    [string]$KbPath = "$env:USERPROFILE\.magic-kb\knowledge.db",
    [switch]$Force,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Ensure KB exists
if (-not (Test-Path $KbPath)) {
    Write-Error "Knowledge Base not found at: $KbPath"
    exit 1
}

$specsDir = Join-Path $OpenspecPath "specs"
if (-not (Test-Path $specsDir)) {
    Write-Error "Specs directory not found at: $specsDir"
    exit 1
}

# Load SQLite assembly
Add-Type -Path "$PSScriptRoot\..\MagicKnowledgeBase\bin\Release\net8.0\System.Data.SQLite.dll" -ErrorAction SilentlyContinue

function Get-FileHash-MD5 {
    param([string]$Path)
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $stream = [System.IO.File]::OpenRead($Path)
    try {
        $hash = $md5.ComputeHash($stream)
        return [BitConverter]::ToString($hash) -replace '-', ''
    }
    finally {
        $stream.Close()
    }
}

function Parse-SpecFile {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw -Encoding UTF8
    $spec = @{
        Tables = @()
        Parameters = @()
        Variables = @()
    }

    # Parse project and IDE from filename
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
    if ($fileName -match '^([A-Z]+)-IDE-(\d+)$') {
        $spec.Project = $Matches[1]
        $spec.IdePosition = [int]$Matches[2]
    }

    # Parse title
    if ($content -match '# (.+)') {
        $spec.Title = $Matches[1].Trim()
        if ($spec.Title -match 'IDE \d+ - (.+)') {
            $spec.Description = $Matches[1].Trim()
        }
    }

    # Parse version
    if ($content -match '\*\*Version spec\*\* : ([\d.]+)') {
        $spec.SpecVersion = $Matches[1]
    }

    # Parse source file
    if ($content -match '\*\*Source\*\* : `([^`]+)`') {
        $spec.XmlFile = [System.IO.Path]::GetFileName($Matches[1])
    }

    # Parse type
    if ($content -match '\| \*\*Type\*\* \| ([OB]) ') {
        $spec.ProgramType = if ($Matches[1] -eq 'O') { 'Online' } else { 'Batch' }
    }

    # Parse folder
    if ($content -match '\| \*\*Dossier IDE\*\* \| ([^|]+) \|') {
        $spec.Folder = $Matches[1].Trim()
    }

    # Parse tables: | #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
    $tablePattern = '\| #(\d+) \| `([^`]+)` \| ([^|]+) \| \*?\*?([WR])\*?\*? \| (\d+)x \|'
    $tableMatches = [regex]::Matches($content, $tablePattern)
    foreach ($match in $tableMatches) {
        $spec.Tables += @{
            Id = [int]$match.Groups[1].Value
            PhysicalName = $match.Groups[2].Value.Trim()
            LogicalName = $match.Groups[3].Value.Trim()
            Access = $match.Groups[4].Value
            UsageCount = [int]$match.Groups[5].Value
        }
    }

    # Parse parameters: | P1 | P0 societe | ALPHA | - |
    $paramPattern = '\| P(\d+) \| ([^|]+) \| ([^|]+) \| ([^|]*) \|'
    $paramMatches = [regex]::Matches($content, $paramPattern)
    foreach ($match in $paramMatches) {
        $spec.Parameters += @{
            Index = [int]$match.Groups[1].Value
            Name = $match.Groups[2].Value.Trim()
            Type = $match.Groups[3].Value.Trim()
        }
    }

    # Parse variables: | `{0,-37}` | W0 FIN SAISIE OD | LOGICAL | - |
    $varPattern = '\| `\{([^}]+)\}` \| ([^|]+) \| ([^|]+) \| ([^|]*) \|'
    $varMatches = [regex]::Matches($content, $varPattern)
    foreach ($match in $varMatches) {
        $spec.Variables += @{
            Reference = "{$($match.Groups[1].Value)}"
            Name = $match.Groups[2].Value.Trim()
            Type = $match.Groups[3].Value.Trim()
        }
    }

    # Parse expression count
    if ($content -match '## 5\. EXPRESSIONS \((\d+) total') {
        $spec.ExpressionCount = [int]$Matches[1]
    }

    return $spec
}

function Invoke-SqliteCommand {
    param(
        [string]$ConnectionString,
        [string]$Query,
        [hashtable]$Parameters = @{}
    )

    $connection = New-Object System.Data.SQLite.SQLiteConnection($ConnectionString)
    $connection.Open()

    try {
        $command = $connection.CreateCommand()
        $command.CommandText = $Query

        foreach ($key in $Parameters.Keys) {
            $param = $command.CreateParameter()
            $param.ParameterName = "@$key"
            $param.Value = if ($null -eq $Parameters[$key]) { [DBNull]::Value } else { $Parameters[$key] }
            [void]$command.Parameters.Add($param)
        }

        return $command.ExecuteNonQuery()
    }
    finally {
        $connection.Close()
    }
}

function Get-SqliteScalar {
    param(
        [string]$ConnectionString,
        [string]$Query,
        [hashtable]$Parameters = @{}
    )

    $connection = New-Object System.Data.SQLite.SQLiteConnection($ConnectionString)
    $connection.Open()

    try {
        $command = $connection.CreateCommand()
        $command.CommandText = $Query

        foreach ($key in $Parameters.Keys) {
            $param = $command.CreateParameter()
            $param.ParameterName = "@$key"
            $param.Value = if ($null -eq $Parameters[$key]) { [DBNull]::Value } else { $Parameters[$key] }
            [void]$command.Parameters.Add($param)
        }

        return $command.ExecuteScalar()
    }
    finally {
        $connection.Close()
    }
}

# Main sync logic
$connectionString = "Data Source=$KbPath;Version=3;"
$specFiles = Get-ChildItem -Path $specsDir -Filter "*-IDE-*.md" | Where-Object { $_.Name -notmatch '^TEMPLATE' }

Write-Host "Syncing $($specFiles.Count) specs to KB..."
$synced = 0
$skipped = 0
$errors = 0

foreach ($file in $specFiles) {
    try {
        $fileHash = Get-FileHash-MD5 -Path $file.FullName

        # Check if already indexed with same hash
        if (-not $Force) {
            $existingHash = Get-SqliteScalar -ConnectionString $connectionString -Query @"
                SELECT spec_file_hash FROM program_specs
                WHERE project = @project AND ide_position = @ide
"@ -Parameters @{
                project = $file.BaseName -replace '-IDE-\d+$', ''
                ide = [int]($file.BaseName -replace '^[A-Z]+-IDE-', '')
            }

            if ($existingHash -eq $fileHash) {
                $skipped++
                if ($Verbose) { Write-Host "  SKIP: $($file.Name) (unchanged)" -ForegroundColor DarkGray }
                continue
            }
        }

        # Parse spec file
        $spec = Parse-SpecFile -FilePath $file.FullName

        if (-not $spec.Project -or -not $spec.IdePosition) {
            Write-Warning "Could not parse project/IDE from: $($file.Name)"
            $errors++
            continue
        }

        # Convert to JSON
        $tablesJson = $spec.Tables | ConvertTo-Json -Compress -Depth 5
        $variablesJson = $spec.Variables | ConvertTo-Json -Compress -Depth 5
        $parametersJson = $spec.Parameters | ConvertTo-Json -Compress -Depth 5

        # Upsert spec
        $result = Invoke-SqliteCommand -ConnectionString $connectionString -Query @"
            INSERT INTO program_specs (
                project, ide_position, title, description, spec_version, xml_file,
                program_type, folder, tables_json, table_count, write_table_count, read_table_count,
                variables_json, variable_count, parameters_json, parameter_count,
                expression_count, spec_file_path, spec_file_hash, indexed_at
            ) VALUES (
                @project, @ide, @title, @description, @version, @xmlFile,
                @type, @folder, @tablesJson, @tableCount, @writeCount, @readCount,
                @varsJson, @varCount, @paramsJson, @paramCount,
                @exprCount, @filePath, @fileHash, datetime('now')
            )
            ON CONFLICT(project, ide_position) DO UPDATE SET
                title = @title,
                description = @description,
                spec_version = @version,
                xml_file = @xmlFile,
                program_type = @type,
                folder = @folder,
                tables_json = @tablesJson,
                table_count = @tableCount,
                write_table_count = @writeCount,
                read_table_count = @readCount,
                variables_json = @varsJson,
                variable_count = @varCount,
                parameters_json = @paramsJson,
                parameter_count = @paramCount,
                expression_count = @exprCount,
                spec_file_path = @filePath,
                spec_file_hash = @fileHash,
                indexed_at = datetime('now')
"@ -Parameters @{
            project = $spec.Project
            ide = $spec.IdePosition
            title = $spec.Title
            description = $spec.Description
            version = $spec.SpecVersion
            xmlFile = $spec.XmlFile
            type = $spec.ProgramType
            folder = $spec.Folder
            tablesJson = $tablesJson
            tableCount = $spec.Tables.Count
            writeCount = ($spec.Tables | Where-Object { $_.Access -eq 'W' }).Count
            readCount = ($spec.Tables | Where-Object { $_.Access -eq 'R' }).Count
            varsJson = $variablesJson
            varCount = $spec.Variables.Count
            paramsJson = $parametersJson
            paramCount = $spec.Parameters.Count
            exprCount = $spec.ExpressionCount
            filePath = $file.FullName
            fileHash = $fileHash
        }

        # Get spec ID for spec_tables
        $specId = Get-SqliteScalar -ConnectionString $connectionString -Query @"
            SELECT id FROM program_specs WHERE project = @project AND ide_position = @ide
"@ -Parameters @{ project = $spec.Project; ide = $spec.IdePosition }

        # Delete old table references
        Invoke-SqliteCommand -ConnectionString $connectionString -Query @"
            DELETE FROM spec_tables WHERE spec_id = @specId
"@ -Parameters @{ specId = $specId } | Out-Null

        # Insert table references
        foreach ($table in $spec.Tables) {
            Invoke-SqliteCommand -ConnectionString $connectionString -Query @"
                INSERT INTO spec_tables (spec_id, table_id, table_physical_name, table_logical_name, access_mode, usage_count)
                VALUES (@specId, @tableId, @physical, @logical, @access, @usage)
"@ -Parameters @{
                specId = $specId
                tableId = $table.Id
                physical = $table.PhysicalName
                logical = $table.LogicalName
                access = $table.Access
                usage = $table.UsageCount
            } | Out-Null
        }

        $synced++
        if ($Verbose) { Write-Host "  SYNC: $($file.Name) ($($spec.Tables.Count) tables)" -ForegroundColor Green }
    }
    catch {
        Write-Warning "Error processing $($file.Name): $_"
        $errors++
    }
}

Write-Host ""
Write-Host "Sync complete:" -ForegroundColor Cyan
Write-Host "  Synced:  $synced"
Write-Host "  Skipped: $skipped (unchanged)"
Write-Host "  Errors:  $errors"

# Show stats
$totalSpecs = Get-SqliteScalar -ConnectionString $connectionString -Query "SELECT COUNT(*) FROM program_specs"
$totalTables = Get-SqliteScalar -ConnectionString $connectionString -Query "SELECT COUNT(*) FROM spec_tables"
$writeTables = Get-SqliteScalar -ConnectionString $connectionString -Query "SELECT COUNT(*) FROM spec_tables WHERE access_mode = 'W'"

Write-Host ""
Write-Host "KB Statistics:" -ForegroundColor Cyan
Write-Host "  Total specs:  $totalSpecs"
Write-Host "  Table refs:   $totalTables ($writeTables writes)"
