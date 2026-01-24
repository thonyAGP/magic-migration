# auto-extract-context.ps1
# Phase 1: Extraction automatique du contexte depuis Jira
# Extrait: symptome, programmes mentionnes, tables, mots-cles

param(
    [Parameter(Mandatory=$true)]
    [string]$TicketKey,

    [Parameter(Mandatory=$true)]
    [string]$OutputFile,

    [switch]$WithComments
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Script Jira existant
$JiraScript = Join-Path $ProjectRoot ".claude\scripts\jira-fetch.ps1"

# Patterns de detection
$ProgramPatterns = @(
    'Prg[_\s]?(\d+)',                    # Prg_123, Prg 123
    '([A-Z]{2,3})\s+IDE\s+(\d+)',        # ADH IDE 69
    'programme\s+([A-Za-z_]+)',          # programme Main_Sale
    'program\s+([A-Za-z_]+)',            # program Main_Sale
    'EXTRAIT_[A-Z_]+',                   # EXTRAIT_COMPTE
    'SOLDE_[A-Z_]+',                     # SOLDE_EASY_CHECK_OUT
    'Gestion_[A-Za-z_]+',                # Gestion_Caisse
    '(?:Main|Init|Menu)[_\s][A-Za-z_]+'  # Main Sale, Init params
)

$TablePatterns = @(
    'Table\s+n[°o]?\s*(\d+)',            # Table n°40
    'table\s+(\w+_dat)',                 # table operations_dat
    'cafil(\d+)_dat',                    # cafil048_dat
    'ccpartyp|operations|depot|troncon|hebergement|gm_complet'  # Tables connues
)

$KeywordCategories = @{
    "date" = @('date', 'arrivee', 'depart', 'timestamp', 'heure', 'time')
    "calcul" = @('calcul', 'montant', 'total', 'somme', 'prix', 'remise', 'pourcentage')
    "affichage" = @('affiche', 'ecran', 'mauvais', 'incorrect', 'manquant', 'vide')
    "import" = @('import', 'fichier', 'na', 'booker', 'interface', 'synchro')
    "session" = @('session', 'ouverture', 'fermeture', 'caisse', 'operateur')
    "table" = @('jointure', 'link', 'relation', 'manquant', 'incomplet')
}

function Extract-Programs {
    param([string]$Text)

    $Programs = @()

    foreach ($Pattern in $ProgramPatterns) {
        $Matches = [regex]::Matches($Text, $Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        foreach ($Match in $Matches) {
            $Programs += @{
                Raw = $Match.Value
                Source = "jira"
                Verified = $false
            }
        }
    }

    return $Programs | Sort-Object { $_.Raw } -Unique
}

function Extract-Tables {
    param([string]$Text)

    $Tables = @()

    foreach ($Pattern in $TablePatterns) {
        $Matches = [regex]::Matches($Text, $Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        foreach ($Match in $Matches) {
            $Tables += @{
                Raw = $Match.Value
                Source = "jira"
            }
        }
    }

    return $Tables | Sort-Object { $_.Raw } -Unique
}

function Extract-Keywords {
    param([string]$Text)

    $TextLower = $Text.ToLower()
    $FoundKeywords = @()

    foreach ($Category in $KeywordCategories.Keys) {
        foreach ($Keyword in $KeywordCategories[$Category]) {
            if ($TextLower -match $Keyword) {
                $FoundKeywords += @{
                    Keyword = $Keyword
                    Category = $Category
                }
            }
        }
    }

    return $FoundKeywords
}

function Extract-Symptom {
    param([string]$Text)

    # Chercher la section "Description" ou le premier paragraphe significatif
    $Lines = $Text -split "`n"
    $Symptom = ""

    foreach ($Line in $Lines) {
        $Line = $Line.Trim()
        if ($Line.Length -gt 20 -and $Line -notmatch '^(#|---|\*\*|http)') {
            $Symptom = $Line
            break
        }
    }

    # Limiter a 500 caracteres
    if ($Symptom.Length -gt 500) {
        $Symptom = $Symptom.Substring(0, 497) + "..."
    }

    return $Symptom
}

# ============================================================================
# EXECUTION PRINCIPALE
# ============================================================================

$Result = @{
    TicketKey = $TicketKey
    ExtractedAt = (Get-Date).ToString("o")
    Source = "jira"
    Symptom = ""
    Programs = @()
    Tables = @()
    Keywords = @()
    RawDescription = ""
    Comments = @()
}

# Appeler le script Jira si disponible
if (Test-Path $JiraScript) {
    Write-Host "[Context] Fetching Jira ticket $TicketKey..." -ForegroundColor Cyan

    $TempFile = [System.IO.Path]::GetTempFileName()
    try {
        $JiraArgs = @("-IssueKey", $TicketKey)
        if ($WithComments) { $JiraArgs += "-WithComments" }

        & powershell -NoProfile -File $JiraScript @JiraArgs > $TempFile 2>&1
        $JiraOutput = Get-Content $TempFile -Raw -ErrorAction SilentlyContinue

        if ($JiraOutput) {
            $Result.RawDescription = $JiraOutput
            $Result.Symptom = Extract-Symptom $JiraOutput
            $Result.Programs = @(Extract-Programs $JiraOutput)
            $Result.Tables = @(Extract-Tables $JiraOutput)
            $Result.Keywords = @(Extract-Keywords $JiraOutput)
        }
    }
    catch {
        Write-Warning "Erreur Jira: $_"
    }
    finally {
        Remove-Item $TempFile -ErrorAction SilentlyContinue
    }
}
else {
    # Mode offline - chercher dans les fichiers existants
    Write-Host "[Context] Mode offline - recherche fichiers locaux" -ForegroundColor Yellow

    $TicketDir = Join-Path $ProjectRoot ".openspec\tickets\$TicketKey"
    if (Test-Path $TicketDir) {
        $NotesFile = Join-Path $TicketDir "notes.md"
        $AnalysisFile = Join-Path $TicketDir "analysis.md"

        foreach ($File in @($NotesFile, $AnalysisFile)) {
            if (Test-Path $File) {
                $Content = Get-Content $File -Raw
                $Result.RawDescription += $Content
                $Result.Programs += @(Extract-Programs $Content)
                $Result.Tables += @(Extract-Tables $Content)
                $Result.Keywords += @(Extract-Keywords $Content)
            }
        }

        $Result.Symptom = Extract-Symptom $Result.RawDescription
    }
}

# Deduplication
$Result.Programs = @($Result.Programs | Sort-Object { $_.Raw } -Unique)
$Result.Tables = @($Result.Tables | Sort-Object { $_.Raw } -Unique)
$Result.Keywords = @($Result.Keywords | Sort-Object { $_.Keyword } -Unique)

# Statistiques
Write-Host "[Context] Extracted:" -ForegroundColor Green
Write-Host "  - Symptom: $($Result.Symptom.Substring(0, [Math]::Min(80, $Result.Symptom.Length)))..." -ForegroundColor Gray
Write-Host "  - Programs: $($Result.Programs.Count)" -ForegroundColor Gray
Write-Host "  - Tables: $($Result.Tables.Count)" -ForegroundColor Gray
Write-Host "  - Keywords: $($Result.Keywords.Count)" -ForegroundColor Gray

# Sauvegarder
$Result | ConvertTo-Json -Depth 5 | Set-Content $OutputFile -Encoding UTF8

Write-Host "[Context] Output: $OutputFile" -ForegroundColor Green
