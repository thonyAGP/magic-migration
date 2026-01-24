<#
.SYNOPSIS
    Score and rank Magic programs matching a search query

.DESCRIPTION
    - Searches programs by name, public name, or description
    - Scores matches based on relevance
    - Returns ranked list of candidate programs
    - Helps choose the right program when multiple matches exist

.PARAMETER Project
    Project name (optional - searches all if not specified)

.PARAMETER Query
    Search query (name, keyword, or pattern)

.PARAMETER Top
    Number of results to return (default: 10)

.EXAMPLE
    .\magic-program-scorer.ps1 -Query "caisse"
    .\magic-program-scorer.ps1 -Project ADH -Query "ouverture" -Top 5
#>

param(
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [string]$Query,

    [int]$Top = 10
)

$ErrorActionPreference = "Stop"

# Load config for project list
$configPath = "D:\Projects\Lecteur_Magic\.openspec\magic-config.json"
$config = $null
$projectList = @("ADH", "PBP", "REF", "VIL", "PBG", "PVE", "PUG")

if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.projects.active) {
        $projectList = $config.projects.active
    }
}

if ($Project) {
    $projectList = @($Project.ToUpperInvariant())
}

$BasePath = "D:\Data\Migration\XPA\PMS"

# Scoring weights
$Weights = @{
    ExactPublicName = 100
    ExactName = 80
    StartsWithPublicName = 60
    StartsWithName = 50
    ContainsPublicName = 40
    ContainsName = 30
    ContainsDescription = 20
    WordMatch = 10
}

# Collect all programs
$allPrograms = @()

foreach ($proj in $projectList) {
    $headersFile = Join-Path $BasePath "$proj\Source\ProgramHeaders.xml"
    if (-not (Test-Path $headersFile)) { continue }

    [xml]$headers = Get-Content $headersFile -Encoding UTF8

    foreach ($prg in $headers.SelectNodes("//ProgramHeader")) {
        $id = [int]$prg.id
        $name = $prg.Description
        $publicName = $prg.PublicName

        $allPrograms += @{
            Project = $proj
            Id = $id
            Name = $name
            PublicName = $publicName
            Score = 0
            Matches = @()
        }
    }
}

Write-Host "Recherche: '$Query' dans $($allPrograms.Count) programmes" -ForegroundColor Cyan
Write-Host ""

# Score each program
$queryLower = $Query.ToLowerInvariant()
$queryWords = $queryLower -split '\s+'

foreach ($prg in $allPrograms) {
    $nameLower = $prg.Name.ToLowerInvariant()
    $publicLower = if ($prg.PublicName) { $prg.PublicName.ToLowerInvariant() } else { "" }

    # Exact matches
    if ($publicLower -eq $queryLower) {
        $prg.Score += $Weights.ExactPublicName
        $prg.Matches += "Exact public name"
    }
    elseif ($nameLower -eq $queryLower) {
        $prg.Score += $Weights.ExactName
        $prg.Matches += "Exact name"
    }

    # Starts with
    if ($publicLower -and $publicLower.StartsWith($queryLower)) {
        $prg.Score += $Weights.StartsWithPublicName
        $prg.Matches += "Public starts with"
    }
    elseif ($nameLower.StartsWith($queryLower)) {
        $prg.Score += $Weights.StartsWithName
        $prg.Matches += "Name starts with"
    }

    # Contains
    if ($publicLower -and $publicLower.Contains($queryLower)) {
        $prg.Score += $Weights.ContainsPublicName
        $prg.Matches += "Public contains"
    }
    elseif ($nameLower.Contains($queryLower)) {
        $prg.Score += $Weights.ContainsName
        $prg.Matches += "Name contains"
    }

    # Word matches
    foreach ($word in $queryWords) {
        if ($word.Length -lt 3) { continue }
        if ($nameLower.Contains($word) -or $publicLower.Contains($word)) {
            $prg.Score += $Weights.WordMatch
            $prg.Matches += "Word: $word"
        }
    }
}

# Filter and sort
$matches = $allPrograms | Where-Object { $_.Score -gt 0 } | Sort-Object { -$_.Score } | Select-Object -First $Top

if ($matches.Count -eq 0) {
    Write-Host "Aucun programme trouve pour '$Query'" -ForegroundColor Yellow
    exit 0
}

# Display results
Write-Host "=== RESULTATS (Top $Top) ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "| Score | Project | IDE | Name | Public Name | Matches |"
Write-Host "|-------|---------|-----|------|-------------|---------|"

foreach ($m in $matches) {
    $name = if ($m.Name.Length -gt 25) { $m.Name.Substring(0, 22) + "..." } else { $m.Name }
    $public = if ($m.PublicName) {
        if ($m.PublicName.Length -gt 20) { $m.PublicName.Substring(0, 17) + "..." } else { $m.PublicName }
    } else { "-" }
    $matchList = ($m.Matches | Select-Object -First 2) -join ", "

    $color = if ($m.Score -ge 80) { "Green" } elseif ($m.Score -ge 40) { "Yellow" } else { "White" }
    Write-Host ("| {0,5} | {1} | {2,4} | {3} | {4} | {5} |" -f $m.Score, $m.Project, $m.Id, $name, $public, $matchList) -ForegroundColor $color
}

# Best match recommendation
$best = $matches[0]
Write-Host ""
Write-Host "=== RECOMMANDATION ===" -ForegroundColor Cyan
Write-Host "Meilleur candidat: $($best.Project) IDE $($best.Id) - $($best.Name)" -ForegroundColor Green
if ($best.PublicName) {
    Write-Host "  Public: $($best.PublicName)"
}
Write-Host "  Score: $($best.Score)"
Write-Host "  Raisons: $($best.Matches -join ', ')"

# If multiple high-score matches, warn
$highScores = $matches | Where-Object { $_.Score -ge ($best.Score * 0.8) }
if ($highScores.Count -gt 1) {
    Write-Host ""
    Write-Host "ATTENTION: $($highScores.Count) candidats avec score similaire" -ForegroundColor Yellow
    Write-Host "  Verifier manuellement le bon programme"
}

# JSON output for piping
Write-Host ""
Write-Host "=== JSON (best match) ===" -ForegroundColor Gray
@{
    Query = $Query
    BestMatch = @{
        Project = $best.Project
        Id = $best.Id
        Name = $best.Name
        PublicName = $best.PublicName
        Score = $best.Score
    }
    TotalMatches = $matches.Count
    Confidence = if ($best.Score -ge 80) { "HIGH" } elseif ($best.Score -ge 40) { "MEDIUM" } else { "LOW" }
} | ConvertTo-Json -Compress
