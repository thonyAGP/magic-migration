# auto-capitalize-pattern.ps1
# Extrait un pattern de resolution depuis analysis.md et le capitalise dans la KB
# Usage: .\auto-capitalize-pattern.ps1 -AnalysisFile ".openspec/tickets/PMS-1234/analysis.md"

param(
    [Parameter(Mandatory=$true)]
    [string]$AnalysisFile,

    [string]$PatternName = $null,

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KbPath = Join-Path $env:USERPROFILE ".magic-kb\knowledge.db"

# ============================================================================
# EXTRACTION DEPUIS ANALYSIS.MD
# ============================================================================

function Extract-PatternData {
    param([string]$Content)

    $Pattern = @{
        Symptom = ""
        RootCause = ""
        RootCauseType = ""
        Solution = ""
        SourceTicket = ""
    }

    # Extraire le ticket depuis le lien Jira
    if ($Content -match '\[([A-Z]+-\d+)\]\(https://clubmed\.atlassian\.net/browse/') {
        $Pattern.SourceTicket = $Matches[1]
    }

    # Extraire le symptome
    if ($Content -match '\|\s*\*\*Symptome\*\*\s*\|\s*(.+?)\s*\|') {
        $Pattern.Symptom = $Matches[1].Trim()
    } elseif ($Content -match '(?ms)## 1\. Contexte.*?(?:Symptome|Probleme)\s*[:\-]\s*(.+?)(?:\r?\n\r?\n|##)') {
        $Pattern.Symptom = $Matches[1].Trim()
    }

    # Extraire la root cause
    if ($Content -match '(?ms)## 5\. Root Cause.*?```(.+?)```') {
        $Pattern.RootCause = $Matches[1].Trim()
    } elseif ($Content -match '(?ms)## 5\. Root Cause\s*\r?\n(.+?)(?:\r?\n\r?\n|## 6\.)') {
        $Pattern.RootCause = $Matches[1].Trim()
    }

    # Determiner le type de root cause
    $Pattern.RootCauseType = Detect-RootCauseType -RootCause $Pattern.RootCause -Symptom $Pattern.Symptom

    # Extraire la solution
    if ($Content -match '(?ms)## 6\. Solution.*?### Avant.*?```(.+?)```.*?### Apres.*?```(.+?)```') {
        $Pattern.Solution = "AVANT:`n$($Matches[1].Trim())`n`nAPRES:`n$($Matches[2].Trim())"
    } elseif ($Content -match '(?ms)## 6\. Solution\s*\r?\n(.+?)(?:\r?\n\r?\n|$)') {
        $Pattern.Solution = $Matches[1].Trim()
    }

    return $Pattern
}

function Detect-RootCauseType {
    param(
        [string]$RootCause,
        [string]$Symptom
    )

    $Combined = "$RootCause $Symptom".ToLower()

    # Patterns connus
    $TypePatterns = @{
        "date-format" = @("date", "format", "ymd", "mdy", "dmy", "str(", "date(", "dtog", "gtod")
        "table-link" = @("table", "link", "jointure", "relation", "mainsource", "access")
        "expression-error" = @("expression", "{", "}", "variable", "offset", "decode")
        "picture-format" = @("picture", "format", "affichage", "display", "decimal")
        "condition" = @("condition", "if(", "case(", "constante", "toujours vrai", "toujours faux")
        "calltask" = @("calltask", "callprog", "appel", "parametre")
        "data-corruption" = @("corruption", "donnee", "base", "migration")
    }

    foreach ($Type in $TypePatterns.Keys) {
        foreach ($Keyword in $TypePatterns[$Type]) {
            if ($Combined -match [regex]::Escape($Keyword)) {
                return $Type
            }
        }
    }

    return "unknown"
}

function Generate-PatternName {
    param([hashtable]$Pattern)

    $Type = $Pattern.RootCauseType
    $Ticket = $Pattern.SourceTicket

    # Generer un nom base sur le type et le ticket
    $Name = switch ($Type) {
        "date-format" { "date-format-$Ticket" }
        "table-link" { "table-link-$Ticket" }
        "expression-error" { "expression-error-$Ticket" }
        "picture-format" { "picture-format-$Ticket" }
        "condition" { "condition-$Ticket" }
        "calltask" { "calltask-$Ticket" }
        "data-corruption" { "data-corruption-$Ticket" }
        default { "resolution-$Ticket" }
    }

    return $Name.ToLower()
}

function Extract-Keywords {
    param([hashtable]$Pattern)

    $Keywords = @()

    # Mots cles du symptome
    $SymptomWords = $Pattern.Symptom -split '\s+' | Where-Object { $_.Length -gt 4 }
    $Keywords += $SymptomWords | Select-Object -First 5

    # Ajouter le type
    $Keywords += $Pattern.RootCauseType

    # Ajouter le ticket
    $Keywords += $Pattern.SourceTicket

    return ($Keywords | Where-Object { $_ } | Select-Object -Unique) -join ","
}

# ============================================================================
# INSERTION KB
# ============================================================================

function Insert-Pattern {
    param(
        [string]$KbPath,
        [string]$PatternName,
        [string]$Keywords,
        [string]$RootCauseType,
        [string]$SolutionTemplate,
        [string]$SourceTicket
    )

    # Utiliser SQLite directement
    $InsertSql = @"
INSERT INTO resolution_patterns (pattern_name, symptom_keywords, root_cause_type, solution_template, source_ticket)
VALUES ('$PatternName', '$Keywords', '$RootCauseType', '$($SolutionTemplate -replace "'", "''")', '$SourceTicket')
ON CONFLICT(pattern_name) DO UPDATE SET
    symptom_keywords = excluded.symptom_keywords,
    root_cause_type = excluded.root_cause_type,
    solution_template = excluded.solution_template,
    usage_count = resolution_patterns.usage_count + 1,
    last_used_at = datetime('now');
"@

    $TempSqlFile = [System.IO.Path]::GetTempFileName()
    $InsertSql | Set-Content $TempSqlFile -Encoding UTF8

    try {
        & sqlite3 $KbPath ".read '$TempSqlFile'"
        if ($LASTEXITCODE -ne 0) {
            throw "SQLite insert failed"
        }
    } finally {
        Remove-Item $TempSqlFile -ErrorAction SilentlyContinue
    }
}

# ============================================================================
# MAIN
# ============================================================================

Write-Host "=== Auto-Capitalize Pattern ===" -ForegroundColor Cyan

if (-not (Test-Path $AnalysisFile)) {
    Write-Error "File not found: $AnalysisFile"
    exit 1
}

$Content = Get-Content $AnalysisFile -Raw -Encoding UTF8

# Extraire les donnees
Write-Host "[1/4] Extracting pattern data..." -ForegroundColor Gray
$PatternData = Extract-PatternData -Content $Content

if (-not $PatternData.SourceTicket) {
    Write-Warning "No ticket reference found in analysis"
}

if (-not $PatternData.RootCause) {
    Write-Warning "No Root Cause section found - pattern may be incomplete"
}

# Generer le nom si non fourni
if (-not $PatternName) {
    $PatternName = Generate-PatternName -Pattern $PatternData
}

# Extraire les mots cles
Write-Host "[2/4] Generating keywords..." -ForegroundColor Gray
$Keywords = Extract-Keywords -Pattern $PatternData

# Afficher le resume
Write-Host ""
Write-Host "Pattern Summary:" -ForegroundColor Cyan
Write-Host "  Name: $PatternName" -ForegroundColor White
Write-Host "  Type: $($PatternData.RootCauseType)" -ForegroundColor Gray
Write-Host "  Source: $($PatternData.SourceTicket)" -ForegroundColor Gray
Write-Host "  Keywords: $Keywords" -ForegroundColor Gray
Write-Host "  Symptom: $($PatternData.Symptom | Select-Object -First 100)..." -ForegroundColor Gray

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Would insert pattern into KB" -ForegroundColor Yellow
    exit 0
}

# Verifier que la KB existe
Write-Host "[3/4] Checking Knowledge Base..." -ForegroundColor Gray
if (-not (Test-Path $KbPath)) {
    Write-Error "Knowledge Base not found: $KbPath"
    exit 1
}

# Inserer dans la KB
Write-Host "[4/4] Inserting pattern into KB..." -ForegroundColor Gray
try {
    Insert-Pattern -KbPath $KbPath `
        -PatternName $PatternName `
        -Keywords $Keywords `
        -RootCauseType $PatternData.RootCauseType `
        -SolutionTemplate $PatternData.Solution `
        -SourceTicket $PatternData.SourceTicket

    Write-Host ""
    Write-Host "[OK] Pattern '$PatternName' capitalized successfully!" -ForegroundColor Green
    Write-Host "Search with: /ticket-search `"$($PatternData.RootCauseType)`"" -ForegroundColor Gray
} catch {
    Write-Error "Failed to insert pattern: $_"
    exit 1
}
