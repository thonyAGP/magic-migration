# auto-match-patterns.ps1
# Phase 5: Matching automatique avec les patterns de la Knowledge Base
# Algorithme de scoring base sur symptomes et mots-cles

param(
    [string]$Symptom = "",

    [array]$Keywords = @(),

    [Parameter(Mandatory=$true)]
    [string]$OutputFile
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Charger l'index des patterns
$PatternsIndexPath = Join-Path $ProjectRoot "skills\ticket-analyze\templates\patterns.json"
$PatternsDir = Join-Path $ProjectRoot ".openspec\patterns"

if (-not (Test-Path $PatternsIndexPath)) {
    Write-Warning "Patterns index not found at $PatternsIndexPath"
    @{
        MatchedAt = (Get-Date).ToString("o")
        Patterns = @()
        NoIndex = $true
    } | ConvertTo-Json | Set-Content $OutputFile -Encoding UTF8
    exit 0
}

$PatternsIndex = Get-Content $PatternsIndexPath -Raw | ConvertFrom-Json

# ============================================================================
# ALGORITHME DE SCORING
# ============================================================================

function Calculate-PatternScore {
    param(
        [PSObject]$Pattern,
        [string]$Symptom,
        [array]$Keywords
    )

    $Score = 0
    $Matches = @()
    $SymptomLower = $Symptom.ToLower()

    # Score pour les symptomes (poids 3)
    foreach ($S in $Pattern.symptoms) {
        if ($SymptomLower -match [regex]::Escape($S.ToLower())) {
            $Score += 3
            $Matches += @{ Type = "symptom"; Value = $S; Weight = 3 }
        }
    }

    # Score pour les mots-cles (poids 1)
    $KeywordsLower = $Keywords | ForEach-Object {
        if ($_.Keyword) { $_.Keyword.ToLower() }
        elseif ($_.Category) { $_.Category.ToLower() }
        else { $_.ToLower() }
    }

    foreach ($K in $Pattern.keywords) {
        $KLower = $K.ToLower()
        if ($KeywordsLower -contains $KLower -or $SymptomLower -match [regex]::Escape($KLower)) {
            $Score += 1
            $Matches += @{ Type = "keyword"; Value = $K; Weight = 1 }
        }
    }

    # Bonus pour le domaine (poids 2)
    $DomainKeywords = @{
        "import" = @("import", "fichier", "na", "booker", "interface")
        "display" = @("affiche", "ecran", "mauvais", "incorrect", "format")
        "date" = @("date", "arrivee", "depart", "timestamp")
        "calcul" = @("calcul", "montant", "total", "prix", "remise")
        "data" = @("jointure", "link", "table", "manquant", "incomplet")
        "session" = @("session", "ouverture", "fermeture", "caisse")
    }

    $PatternDomain = $Pattern.domain
    if ($DomainKeywords[$PatternDomain]) {
        foreach ($DK in $DomainKeywords[$PatternDomain]) {
            if ($SymptomLower -match [regex]::Escape($DK)) {
                $Score += 2
                $Matches += @{ Type = "domain"; Value = $DK; Weight = 2 }
                break
            }
        }
    }

    return @{
        PatternId = $Pattern.id
        Score = $Score
        Matches = $Matches
    }
}

# ============================================================================
# EXECUTION PRINCIPALE
# ============================================================================

$Result = @{
    MatchedAt = (Get-Date).ToString("o")
    Input = @{
        Symptom = $Symptom
        Keywords = $Keywords
    }
    Patterns = @()
    MinimumScore = $PatternsIndex.search_algorithm.minimum_score
}

Write-Host "[PatternMatch] Searching patterns for symptom..." -ForegroundColor Cyan
Write-Host "  Symptom: $($Symptom.Substring(0, [Math]::Min(80, $Symptom.Length)))..." -ForegroundColor Gray
Write-Host "  Keywords: $($Keywords.Count)" -ForegroundColor Gray

$AllScores = @()

foreach ($Pattern in $PatternsIndex.patterns) {
    $ScoreResult = Calculate-PatternScore -Pattern $Pattern -Symptom $Symptom -Keywords $Keywords

    if ($ScoreResult.Score -gt 0) {
        # Charger les details du pattern
        $PatternFile = Join-Path $PatternsDir "$($Pattern.id).md"
        $PatternContent = ""
        if (Test-Path $PatternFile) {
            $PatternContent = Get-Content $PatternFile -Raw -ErrorAction SilentlyContinue
        }

        $AllScores += @{
            Id = $Pattern.id
            Name = $Pattern.name
            Domain = $Pattern.domain
            Score = $ScoreResult.Score
            Matches = $ScoreResult.Matches
            File = $PatternFile
            Source = $Pattern.source
            HasContent = ($PatternContent.Length -gt 0)
        }
    }
}

# Trier par score decroissant
$AllScores = $AllScores | Sort-Object { -$_.Score }

# Filtrer par score minimum
$MinScore = $PatternsIndex.search_algorithm.minimum_score
$FilteredPatterns = $AllScores | Where-Object { $_.Score -ge $MinScore }

$Result.Patterns = $FilteredPatterns

# Statistiques
Write-Host "[PatternMatch] Results:" -ForegroundColor Green
Write-Host "  - Patterns evaluated: $($PatternsIndex.patterns.Count)" -ForegroundColor Gray
Write-Host "  - Patterns with matches: $($AllScores.Count)" -ForegroundColor Gray
Write-Host "  - Patterns above threshold ($MinScore): $($FilteredPatterns.Count)" -ForegroundColor Gray

if ($FilteredPatterns.Count -gt 0) {
    Write-Host ""
    Write-Host "[PatternMatch] Top matches:" -ForegroundColor Yellow
    foreach ($P in $FilteredPatterns | Select-Object -First 3) {
        Write-Host "  - $($P.Id) (score: $($P.Score))" -ForegroundColor Cyan
        foreach ($M in $P.Matches | Select-Object -First 3) {
            Write-Host "    [$($M.Type)] $($M.Value)" -ForegroundColor Gray
        }
    }
}
else {
    Write-Host ""
    Write-Host "[PatternMatch] No patterns matched. Consider:" -ForegroundColor Yellow
    Write-Host "  - Creating a new pattern after resolution" -ForegroundColor Gray
    Write-Host "  - Manual analysis required" -ForegroundColor Gray
}

# Sauvegarder
$Result | ConvertTo-Json -Depth 10 | Set-Content $OutputFile -Encoding UTF8

Write-Host "[PatternMatch] Output: $OutputFile" -ForegroundColor Green
