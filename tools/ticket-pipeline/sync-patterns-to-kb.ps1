# sync-patterns-to-kb.ps1
# Synchronize .openspec/patterns/*.md files to resolution_patterns table in KB
# Usage: .\sync-patterns-to-kb.ps1 [-PatternsPath <path>] [-DryRun]

param(
    [string]$PatternsPath = ".openspec/patterns",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$KbPath = Join-Path $env:USERPROFILE ".magic-kb\knowledge.db"

# Resolve patterns path relative to project root if not absolute
if (-not [System.IO.Path]::IsPathRooted($PatternsPath)) {
    $PatternsPath = Join-Path $ProjectRoot $PatternsPath
}

Write-Host "=== Pattern Sync to Knowledge Base ===" -ForegroundColor Cyan
Write-Host "Patterns: $PatternsPath" -ForegroundColor Gray
Write-Host "KB: $KbPath" -ForegroundColor Gray
Write-Host ""

# Verify paths exist
if (-not (Test-Path $PatternsPath)) {
    Write-Error "Patterns path not found: $PatternsPath"
    exit 1
}

if (-not (Test-Path $KbPath)) {
    Write-Error "Knowledge Base not found: $KbPath"
    exit 1
}

# ============================================================================
# PARSING FUNCTIONS
# ============================================================================

function Parse-PatternFile {
    param([string]$FilePath)

    $Content = Get-Content $FilePath -Raw -Encoding UTF8
    $FileName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)

    # Initialize pattern object
    $Pattern = @{
        PatternName = $FileName
        SourceTicket = $null
        RootCauseType = $null
        SymptomKeywords = @()
        SolutionTemplate = ""
        SpecReferences = @()
        AffectedTables = @()
    }

    # Extract header metadata
    # > **Source**: CMDS-174321
    if ($Content -match '>\s*\*\*Source\*\*:\s*([A-Z]+-\d+)') {
        $Pattern.SourceTicket = $Matches[1]
    }

    # > **Type**: Bug logique
    if ($Content -match '>\s*\*\*Type\*\*:\s*(.+)') {
        $Pattern.RootCauseType = $Matches[1].Trim()
    }

    # Extract symptoms (bullet list after ## Symptomes typiques)
    if ($Content -match '##\s*Symptomes?\s*typiques?\s*\r?\n([\s\S]*?)(?=\r?\n---|\r?\n##)') {
        $SymptomsSection = $Matches[1]
        $SymptomRegex = '-\s*["'']?([^"''\r\n]+)["'']?'
        $Symptoms = [regex]::Matches($SymptomsSection, $SymptomRegex)
        foreach ($Match in $Symptoms) {
            $Symptom = $Match.Groups[1].Value.Trim(' "''')
            if ($Symptom -and $Symptom.Length -gt 2) {
                $Pattern.SymptomKeywords += $Symptom
            }
        }
    }

    # Extract keywords (bullet list after ### Mots-cles)
    if ($Content -match '###\s*Mots-cles[^\r\n]*\r?\n([\s\S]*?)(?=\r?\n###|\r?\n##|\r?\n---)') {
        $KeywordsSection = $Matches[1]
        $KeywordRegex = '-\s*["'']?([^"''\r\n]+)["'']?'
        $Keywords = [regex]::Matches($KeywordsSection, $KeywordRegex)
        foreach ($Match in $Keywords) {
            $Keyword = $Match.Groups[1].Value.Trim(' "''')
            if ($Keyword -and $Keyword.Length -gt 2 -and $Keyword -notin $Pattern.SymptomKeywords) {
                $Pattern.SymptomKeywords += $Keyword
            }
        }
    }

    # Extract solution template (section after ## Solution type)
    if ($Content -match '##\s*Solution\s*type\s*\r?\n([\s\S]*?)(?=\r?\n##\s*[A-Z]|\r?\n---\s*\r?\n\*Pattern)') {
        $Pattern.SolutionTemplate = $Matches[1].Trim()
    }

    # Extract spec references (## Specs concernees section)
    # Look for links like [ADH-IDE-69](../specs/ADH-IDE-69.md)
    if ($Content -match '##\s*Specs?\s*concern[e\xe9]+es?([\s\S]*?)(?=\r?\n##|\r?\n---\s*\r?\n\*Pattern|\z)') {
        $SpecsSection = $Matches[1]
        $SpecLinks = [regex]::Matches($SpecsSection, '\[([A-Z]+-IDE-\d+)\]')
        foreach ($Match in $SpecLinks) {
            $SpecId = $Match.Groups[1].Value
            if ($SpecId -notin $Pattern.SpecReferences) {
                $Pattern.SpecReferences += $SpecId
            }
        }
    }

    # Extract affected tables (### Tables impactees section)
    # Look for patterns like `#849` or #849
    if ($Content -match '###?\s*Tables?\s*impact[e\xe9]+es?([\s\S]*?)(?=\r?\n##|\r?\n###|\r?\n---\s*\r?\n|\z)') {
        $TablesSection = $Matches[1]
        $TableIds = [regex]::Matches($TablesSection, '#(\d+)')
        foreach ($Match in $TableIds) {
            $TableId = [int]$Match.Groups[1].Value
            if ($TableId -notin $Pattern.AffectedTables) {
                $Pattern.AffectedTables += $TableId
            }
        }
    }

    return $Pattern
}

function Escape-SqlString {
    param([string]$Value)
    if ($null -eq $Value) { return "NULL" }
    $Escaped = $Value -replace "'", "''"
    return "'$Escaped'"
}

# ============================================================================
# MAIN
# ============================================================================

# Get all pattern files (exclude README)
$PatternFiles = Get-ChildItem -Path $PatternsPath -Filter "*.md" |
    Where-Object { $_.Name -ne "README.md" }

Write-Host "Found $($PatternFiles.Count) pattern file(s)" -ForegroundColor Yellow
Write-Host ""

$Patterns = @()
$SqlStatements = @()

foreach ($File in $PatternFiles) {
    Write-Host "Parsing: $($File.Name)" -ForegroundColor Gray

    $Pattern = Parse-PatternFile -FilePath $File.FullName
    $Patterns += $Pattern

    # Build SQL INSERT
    $KeywordsJson = ($Pattern.SymptomKeywords | ConvertTo-Json -Compress)
    if ($Pattern.SymptomKeywords.Count -eq 0) {
        $KeywordsJson = "[]"
    }
    if ($Pattern.SymptomKeywords.Count -eq 1) {
        $KeywordsJson = "[`"$($Pattern.SymptomKeywords[0])`"]"
    }

    # Spec references JSON
    $SpecsJson = ($Pattern.SpecReferences | ConvertTo-Json -Compress)
    if ($Pattern.SpecReferences.Count -eq 0) {
        $SpecsJson = "[]"
    }
    if ($Pattern.SpecReferences.Count -eq 1) {
        $SpecsJson = "[`"$($Pattern.SpecReferences[0])`"]"
    }

    # Affected tables JSON
    $TablesJson = ($Pattern.AffectedTables | ConvertTo-Json -Compress)
    if ($Pattern.AffectedTables.Count -eq 0) {
        $TablesJson = "[]"
    }
    if ($Pattern.AffectedTables.Count -eq 1) {
        $TablesJson = "[$($Pattern.AffectedTables[0])]"
    }

    $Sql = @"
INSERT INTO resolution_patterns (pattern_name, symptom_keywords, root_cause_type, solution_template, source_ticket, usage_count, spec_references_json, affected_tables_json)
VALUES (
    $(Escape-SqlString $Pattern.PatternName),
    $(Escape-SqlString $KeywordsJson),
    $(Escape-SqlString $Pattern.RootCauseType),
    $(Escape-SqlString $Pattern.SolutionTemplate),
    $(Escape-SqlString $Pattern.SourceTicket),
    0,
    $(Escape-SqlString $SpecsJson),
    $(Escape-SqlString $TablesJson)
)
ON CONFLICT(pattern_name) DO UPDATE SET
    symptom_keywords = excluded.symptom_keywords,
    root_cause_type = excluded.root_cause_type,
    solution_template = excluded.solution_template,
    source_ticket = excluded.source_ticket,
    spec_references_json = excluded.spec_references_json,
    affected_tables_json = excluded.affected_tables_json;
"@
    $SqlStatements += $Sql

    # Display parsed info
    Write-Host "  Name: $($Pattern.PatternName)" -ForegroundColor White
    Write-Host "  Source: $($Pattern.SourceTicket)" -ForegroundColor White
    Write-Host "  Type: $($Pattern.RootCauseType)" -ForegroundColor White
    Write-Host "  Keywords: $($Pattern.SymptomKeywords.Count)" -ForegroundColor White
    Write-Host "  Specs: $($Pattern.SpecReferences -join ', ')" -ForegroundColor Cyan
    Write-Host "  Tables: $($Pattern.AffectedTables -join ', ')" -ForegroundColor Cyan
    Write-Host ""
}

# Summary
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Patterns parsed: $($Patterns.Count)" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] SQL that would be executed:" -ForegroundColor Magenta
    Write-Host ""
    foreach ($Sql in $SqlStatements) {
        Write-Host $Sql -ForegroundColor DarkGray
        Write-Host ""
    }
    exit 0
}

# Execute SQL
Write-Host ""
Write-Host "Syncing to Knowledge Base..." -ForegroundColor Yellow

$TempFile = [System.IO.Path]::GetTempFileName()
$AllSql = $SqlStatements -join "`n"
$AllSql | Set-Content $TempFile -Encoding UTF8

try {
    $Result = & sqlite3 $KbPath ".read '$TempFile'" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "SQLite error: $Result"
    }
    Write-Host "[OK] Synced $($Patterns.Count) patterns to KB" -ForegroundColor Green
} catch {
    Write-Error "Failed to sync: $_"
    exit 1
} finally {
    Remove-Item $TempFile -ErrorAction SilentlyContinue
}

# Verify
Write-Host ""
Write-Host "Verifying..." -ForegroundColor Yellow

$CountResult = & sqlite3 $KbPath "SELECT COUNT(*) FROM resolution_patterns;" 2>&1
Write-Host "Total patterns in KB: $CountResult" -ForegroundColor Green

# List patterns
$ListResult = & sqlite3 -separator " | " $KbPath "SELECT pattern_name, COALESCE(source_ticket, '-'), usage_count FROM resolution_patterns ORDER BY pattern_name;" 2>&1
Write-Host ""
Write-Host "Patterns in KB:" -ForegroundColor Yellow
Write-Host "Name | Source | Usage" -ForegroundColor Gray
Write-Host "------------------------------" -ForegroundColor Gray
foreach ($Line in $ListResult) {
    Write-Host $Line
}

# ============================================================================
# P1-D: BIDIRECTIONAL LINKS - Update specs with known patterns
# ============================================================================

Write-Host ""
Write-Host "=== Bidirectional Links ===" -ForegroundColor Cyan
Write-Host "Updating program_specs with known patterns..." -ForegroundColor Yellow

# Build reverse mapping: spec -> patterns
$SpecPatternMap = @{}
foreach ($Pattern in $Patterns) {
    foreach ($SpecRef in $Pattern.SpecReferences) {
        # Parse spec reference (e.g., "ADH-IDE-69")
        if ($SpecRef -match '([A-Z]+)-IDE-(\d+)') {
            $Key = "$($Matches[1])|$($Matches[2])"
            if (-not $SpecPatternMap.ContainsKey($Key)) {
                $SpecPatternMap[$Key] = @()
            }
            if ($Pattern.PatternName -notin $SpecPatternMap[$Key]) {
                $SpecPatternMap[$Key] += $Pattern.PatternName
            }
        }
    }
}

# Generate SQL updates for each spec
$UpdateStatements = @()
foreach ($Key in $SpecPatternMap.Keys) {
    $Parts = $Key -split '\|'
    $Project = $Parts[0]
    $IDE = [int]$Parts[1]
    $PatternNames = $SpecPatternMap[$Key]

    $PatternsJson = ($PatternNames | ForEach-Object { "`"$_`"" }) -join ','
    $PatternsJson = "[$PatternsJson]"

    $UpdateSql = @"
UPDATE program_specs
SET known_patterns_json = '$PatternsJson'
WHERE project = '$Project' AND ide_position = $IDE;
"@
    $UpdateStatements += $UpdateSql
    Write-Host "  $Project IDE $IDE <- $($PatternNames -join ', ')" -ForegroundColor Gray
}

if ($UpdateStatements.Count -gt 0) {
    if (-not $DryRun) {
        $TempFile2 = [System.IO.Path]::GetTempFileName()
        $UpdateStatements -join "`n" | Set-Content $TempFile2 -Encoding UTF8

        try {
            $Result = & sqlite3 $KbPath ".read '$TempFile2'" 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "SQLite error updating specs: $Result"
            } else {
                Write-Host "[OK] Updated $($UpdateStatements.Count) specs with pattern links" -ForegroundColor Green
            }
        } finally {
            Remove-Item $TempFile2 -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "[DRY RUN] Would update $($UpdateStatements.Count) specs" -ForegroundColor Magenta
    }
} else {
    Write-Host "  No spec references found in patterns" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[DONE] Pattern sync complete with bidirectional links" -ForegroundColor Green
