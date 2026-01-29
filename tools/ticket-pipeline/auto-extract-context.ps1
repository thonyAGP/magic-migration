# auto-extract-context.ps1
# Phase 1 (v2.0): Extraction automatique du contexte depuis Jira + index local
# Extrait: symptome, programmes mentionnes, tables, mots-cles, attachments
#
# Sources (par priorite):
#   1. Jira API (si disponible)
#   2. Index local (.openspec/tickets/index.json)
#   3. Fichiers locaux (notes.md, analysis.md)

param(
    [Parameter(Mandatory=$true)]
    [string]$TicketKey,

    [Parameter(Mandatory=$true)]
    [string]$OutputFile,

    [switch]$WithComments,
    [switch]$SkipJira
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
    Source = "unknown"
    Symptom = ""
    Programs = @()
    Tables = @()
    Keywords = @()
    Attachments = @()
}

$AllText = ""
$TicketDir = Join-Path $ProjectRoot ".openspec\tickets\$TicketKey"

# --- Source 1: Jira API ---
$jiraFetched = $false
if (-not $SkipJira -and (Test-Path $JiraScript)) {
    Write-Host "[Context] Fetching Jira ticket $TicketKey..." -ForegroundColor Cyan

    $TempFile = [System.IO.Path]::GetTempFileName()
    try {
        $JiraArgs = @("-IssueKey", $TicketKey)
        if ($WithComments) { $JiraArgs += "-WithComments" }

        & powershell -NoProfile -File $JiraScript @JiraArgs > $TempFile 2>&1
        $JiraOutput = [System.IO.File]::ReadAllText($TempFile, [System.Text.Encoding]::UTF8)

        if ($JiraOutput -and $JiraOutput.Length -gt 50) {
            $AllText += $JiraOutput
            $Result.Source = "jira"
            $jiraFetched = $true
            Write-Host "[Context] Jira fetched: $($JiraOutput.Length) chars" -ForegroundColor Green
        }
    }
    catch {
        Write-Warning "Erreur Jira: $_"
    }
    finally {
        Remove-Item $TempFile -ErrorAction SilentlyContinue
    }
}

# --- Source 2: Index local ---
$IndexPath = Join-Path (Split-Path $TicketDir) "index.json"
if (Test-Path $IndexPath) {
    $indexRaw = [System.IO.File]::ReadAllText($IndexPath, [System.Text.Encoding]::UTF8)
    $indexRaw = $indexRaw.TrimStart([char]0xFEFF)
    try {
        $IndexData = $indexRaw | ConvertFrom-Json
        if ($IndexData.localTickets) {
            $ticket = $IndexData.localTickets | Where-Object { $_.key -eq $TicketKey } | Select-Object -First 1
            if ($ticket) {
                Write-Host "[Context] Index local found: $($ticket.summary)" -ForegroundColor Green
                if (-not $jiraFetched) {
                    $Result.Source = "index"
                    $AllText += "`n$($ticket.summary)"
                }
                # Enrichir avec donnees index
                $Result.Summary    = [string]$ticket.summary
                $Result.Status     = [string]$ticket.status
                $Result.Program    = [string]$ticket.program
                $Result.RootCause  = [string]$ticket.rootCause
                $Result.CreatedDate = [string]$ticket.createdDate
                $Result.LastAnalysis = [string]$ticket.lastAnalysis

                # Extraire programme depuis index si present
                if ($ticket.program) {
                    $AllText += "`n$($ticket.program)"
                }
            }
        }
    } catch {
        Write-Warning "Index parse error: $_"
    }
}

# --- Source 3: Fichiers locaux ---
if (Test-Path $TicketDir) {
    foreach ($File in @("notes.md", "analysis.md")) {
        $FilePath = Join-Path $TicketDir $File
        if (Test-Path $FilePath) {
            $Content = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
            $AllText += "`n$Content"
            if ($Result.Source -eq "unknown") { $Result.Source = "offline" }
        }
    }

    # Detecter attachments
    $AttachDir = Join-Path $TicketDir "attachments"
    if (Test-Path $AttachDir) {
        $Result.Attachments = @(Get-ChildItem $AttachDir -File | ForEach-Object {
            @{
                name = [string]$_.Name
                size = [int]$_.Length
                type = [string]$_.Extension
            }
        })
    }
}

# --- Extraction depuis tout le texte collecte ---
if ($AllText.Length -gt 0) {
    $Result.Symptom  = [string](Extract-Symptom $AllText)
    $Result.Programs = @(Extract-Programs $AllText)
    $Result.Tables   = @(Extract-Tables $AllText)
    $Result.Keywords = @(Extract-Keywords $AllText)
}

# Deduplication
if ($Result.Programs.Count -gt 0) {
    $Result.Programs = @($Result.Programs | Sort-Object { $_.Raw } -Unique)
}
if ($Result.Tables.Count -gt 0) {
    $Result.Tables = @($Result.Tables | Sort-Object { $_.Raw } -Unique)
}
if ($Result.Keywords.Count -gt 0) {
    $Result.Keywords = @($Result.Keywords | Sort-Object { $_.Keyword } -Unique)
}

# Si symptom vide mais summary existe, utiliser summary
if ([string]::IsNullOrWhiteSpace($Result.Symptom) -and $Result.Summary) {
    $Result.Symptom = [string]$Result.Summary
}

# Statistiques
$symptomPreview = if ($Result.Symptom.Length -gt 80) { $Result.Symptom.Substring(0, 77) + "..." } else { $Result.Symptom }
Write-Host "[Context] Extracted:" -ForegroundColor Green
Write-Host "  - Source: $($Result.Source)" -ForegroundColor Gray
Write-Host "  - Symptom: $symptomPreview" -ForegroundColor Gray
Write-Host "  - Programs: $($Result.Programs.Count)" -ForegroundColor Gray
Write-Host "  - Tables: $($Result.Tables.Count)" -ForegroundColor Gray
Write-Host "  - Keywords: $($Result.Keywords.Count)" -ForegroundColor Gray
Write-Host "  - Attachments: $($Result.Attachments.Count)" -ForegroundColor Gray

# Sauvegarder (UTF-8 sans BOM)
$json = $Result | ConvertTo-Json -Depth 4
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($OutputFile, $json, $utf8NoBom)

Write-Host "[Context] Output: $OutputFile" -ForegroundColor Green
