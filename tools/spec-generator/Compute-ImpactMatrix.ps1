# Compute-ImpactMatrix.ps1
# Compute and populate change_impacts table from specs and KB data
# Pre-calculates impact relationships for instant queries

param(
    [string]$KbPath = "$env:USERPROFILE\.magic-kb\knowledge.db",
    [string]$SpecsPath = "D:\Projects\Lecteur_Magic\.openspec\specs",
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "=== Compute Impact Matrix ===" -ForegroundColor Cyan
Write-Host "KB: $KbPath" -ForegroundColor Gray
Write-Host "Specs: $SpecsPath" -ForegroundColor Gray

if (-not (Test-Path $KbPath)) {
    Write-Error "Knowledge Base not found: $KbPath"
    exit 1
}

# ============================================================================
# COLLECT DATA FROM SPECS
# ============================================================================

Write-Host "`n[1/4] Collecting spec data..." -ForegroundColor Yellow

$specFiles = Get-ChildItem -Path $SpecsPath -Filter "*.md" -ErrorAction SilentlyContinue
Write-Host "  Found $($specFiles.Count) spec files" -ForegroundColor Gray

$specData = @()

foreach ($file in $specFiles) {
    if ($file.Name -match '^([A-Z]+)-IDE-(\d+)\.md$') {
        $project = $Matches[1]
        $ide = [int]$Matches[2]

        $content = Get-Content $file.FullName -Raw -Encoding UTF8

        # Parse tables section
        $tables = @()
        $tableMatches = [regex]::Matches($content, '\| #(\d+) \| `([^`]+)` \| ([^|]+) \| \*?\*?([WR])\*?\*? \| (\d+)x \|')
        foreach ($m in $tableMatches) {
            $tables += @{
                Id = [int]$m.Groups[1].Value
                Name = $m.Groups[2].Value.Trim()
                Access = $m.Groups[4].Value
                Count = [int]$m.Groups[5].Value
            }
        }

        $specData += @{
            Project = $project
            IDE = $ide
            File = $file.Name
            Tables = $tables
            WriteTableCount = ($tables | Where-Object { $_.Access -eq 'W' }).Count
        }

        if ($Verbose) {
            Write-Host "  $($file.Name): $($tables.Count) tables, $($specData[-1].WriteTableCount) writes" -ForegroundColor Gray
        }
    }
}

Write-Host "  Parsed $($specData.Count) specs" -ForegroundColor Green

# ============================================================================
# COMPUTE TABLE IMPACT RELATIONSHIPS
# ============================================================================

Write-Host "`n[2/4] Computing table impact relationships..." -ForegroundColor Yellow

$tableImpacts = @{}  # tableId -> list of (project, ide, access)

foreach ($spec in $specData) {
    foreach ($table in $spec.Tables) {
        $key = $table.Id
        if (-not $tableImpacts.ContainsKey($key)) {
            $tableImpacts[$key] = @{
                Name = $table.Name
                Writers = @()
                Readers = @()
            }
        }

        $entry = @{
            Project = $spec.Project
            IDE = $spec.IDE
            UsageCount = $table.Count
        }

        if ($table.Access -eq 'W') {
            $tableImpacts[$key].Writers += $entry
        } else {
            $tableImpacts[$key].Readers += $entry
        }
    }
}

$multiWriterTables = $tableImpacts.GetEnumerator() | Where-Object { $_.Value.Writers.Count -gt 1 }
Write-Host "  $($multiWriterTables.Count) tables with multiple writers" -ForegroundColor Green

# ============================================================================
# GENERATE IMPACT RECORDS
# ============================================================================

Write-Host "`n[3/4] Generating impact records..." -ForegroundColor Yellow

$impactRecords = @()

# For each table with multiple writers, create cross-program impacts
foreach ($tableEntry in $multiWriterTables) {
    $tableId = $tableEntry.Key
    $tableInfo = $tableEntry.Value
    $writers = $tableInfo.Writers

    # Each writer potentially affects other writers
    for ($i = 0; $i -lt $writers.Count; $i++) {
        for ($j = 0; $j -lt $writers.Count; $j++) {
            if ($i -ne $j) {
                $source = $writers[$i]
                $affected = $writers[$j]

                # Determine severity based on cross-project
                $severity = if ($source.Project -eq $affected.Project) { "high" } else { "critical" }

                $impactRecords += @{
                    SourceProject = $source.Project
                    SourceProgram = $source.IDE
                    SourceType = "table"
                    SourceElement = $tableId.ToString()
                    AffectedProject = $affected.Project
                    AffectedProgram = $affected.IDE
                    ImpactType = "writes_same_table"
                    Severity = $severity
                }
            }
        }
    }
}

Write-Host "  Generated $($impactRecords.Count) impact records" -ForegroundColor Green

# ============================================================================
# INSERT INTO KB
# ============================================================================

Write-Host "`n[4/4] Updating Knowledge Base..." -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "[DRY RUN] Would insert $($impactRecords.Count) records" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Sample records:" -ForegroundColor Yellow
    foreach ($r in $impactRecords | Select-Object -First 5) {
        Write-Host "  $($r.SourceProject) IDE $($r.SourceProgram) -> $($r.AffectedProject) IDE $($r.AffectedProgram) [$($r.ImpactType), $($r.Severity)]"
    }
    exit 0
}

# Build SQL statements
$sqlStatements = @("DELETE FROM change_impacts WHERE impact_type = 'writes_same_table';")

foreach ($r in $impactRecords) {
    $sql = @"
INSERT OR IGNORE INTO change_impacts (source_project, source_program_id, source_element_type, source_element_id, affected_project, affected_program_id, impact_type, severity)
VALUES ('$($r.SourceProject)', $($r.SourceProgram), '$($r.SourceType)', '$($r.SourceElement)', '$($r.AffectedProject)', $($r.AffectedProgram), '$($r.ImpactType)', '$($r.Severity)');
"@
    $sqlStatements += $sql
}

$tempFile = [System.IO.Path]::GetTempFileName()
$sqlStatements -join "`n" | Set-Content $tempFile -Encoding UTF8

try {
    $result = & sqlite3 $KbPath ".read '$tempFile'" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "SQLite error: $result"
    }
    Write-Host "[OK] Inserted $($impactRecords.Count) impact records" -ForegroundColor Green
} catch {
    Write-Error "Failed to update KB: $_"
    exit 1
} finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host ""
Write-Host "=== Impact Matrix Summary ===" -ForegroundColor Cyan

# Get stats
$totalImpacts = & sqlite3 $KbPath "SELECT COUNT(*) FROM change_impacts;"
$criticalImpacts = & sqlite3 $KbPath "SELECT COUNT(*) FROM change_impacts WHERE severity = 'critical';"
$highRiskTables = & sqlite3 $KbPath "SELECT COUNT(DISTINCT source_element_id) FROM change_impacts WHERE source_element_type = 'table' AND severity = 'critical';"

Write-Host "Total impact records: $totalImpacts" -ForegroundColor White
Write-Host "Critical (cross-project): $criticalImpacts" -ForegroundColor Red
Write-Host "High-risk tables: $highRiskTables" -ForegroundColor Yellow

Write-Host ""
Write-Host "[DONE] Impact matrix computed" -ForegroundColor Green
Write-Host "Use magic_precheck_change to query impact before changes" -ForegroundColor Gray
