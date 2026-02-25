# Link specs and patterns bidirectionally
# Phase 2 PDCA - Specs <-> Patterns linking

param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

$specsPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\specs"
$patternsPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\patterns"

# Pattern keywords for matching
$patternKeywords = @{
    "add-filter-parameter" = @("Range", "filter", "parametre", "Boolean", "EXTRAIT", "masquer", "filtrer")
    "date-format-inversion" = @("date", "YYMMDD", "MM/DD", "inversion", "parsing", "format")
    "empty-date-as-noend" = @("00/00/0000", "date vide", "sans fin", "empty date")
    "equipment-config-issue" = @("hardware", "equipement", "config", "imprimante", "TPE")
    "extension-treated-as-arrival" = @("extension", "arrivee", "sejour", "prolongation")
    "filter-not-implemented" = @("filtre", "non implemente", "missing", "absent")
    "local-config-regression" = @("Magic.ini", "config locale", "regression", "fausse")
    "missing-dataview-column" = @("DataView", "colonne manquante", "Select", "Column")
    "missing-time-validation" = @("heure", "time", "validation", "HH:MM")
    "missing-vv-condition" = @("Virtual Variable", "VV", "condition", "manquante")
    "modedayinc-date-display" = @("MODEDAYINC", "date", "affichage", "decalage", "jour inclus")
    "picture-format-mismatch" = @("Picture", "format", "N10", "decimales", "mismatch")
    "report-column-enhancement" = @("rapport", "colonne", "ajout", "total", "enhancement")
    "session-concurrency-check" = @("session", "concurrence", "double ouverture", "verrou")
    "ski-rental-duration-calc" = @("ski", "location", "duree", "calcul", "sejour")
    "table-link-missing" = @("Link", "table", "jointure", "manquant", "DataView")
}

# Analyze specs and find matching patterns
$results = @()
$specFiles = Get-ChildItem "$specsPath\ADH-IDE-*.md" | Where-Object { $_.Name -notmatch "TEMPLATE" }

Write-Host "## Analyse de $($specFiles.Count) specs..." -ForegroundColor Cyan

foreach ($spec in $specFiles) {
    $content = Get-Content $spec.FullName -Raw -Encoding UTF8
    $specName = $spec.BaseName

    $matchedPatterns = @()

    foreach ($pattern in $patternKeywords.Keys) {
        $keywords = $patternKeywords[$pattern]
        $matchCount = 0

        foreach ($kw in $keywords) {
            if ($content -match [regex]::Escape($kw)) {
                $matchCount++
            }
        }

        # Require at least 2 keyword matches
        if ($matchCount -ge 2) {
            $matchedPatterns += @{
                Pattern = $pattern
                Score = $matchCount
            }
        }
    }

    if ($matchedPatterns.Count -gt 0) {
        $results += @{
            Spec = $specName
            Patterns = $matchedPatterns | Sort-Object { $_.Score } -Descending
        }
    }
}

# Output results
Write-Host ""
Write-Host "## Resultats du linking" -ForegroundColor Green
Write-Host ""
Write-Host "| Spec | Patterns matches | Score |"
Write-Host "|------|------------------|-------|"

$linkedSpecs = 0
$linkedPatterns = @{}

foreach ($r in $results | Sort-Object { $_.Spec }) {
    $patternList = ($r.Patterns | ForEach-Object { $_.Pattern }) -join ", "
    $scoreList = ($r.Patterns | ForEach-Object { $_.Score }) -join ", "
    Write-Host "| $($r.Spec) | $patternList | $scoreList |"
    $linkedSpecs++

    foreach ($p in $r.Patterns) {
        if (-not $linkedPatterns.ContainsKey($p.Pattern)) {
            $linkedPatterns[$p.Pattern] = @()
        }
        $linkedPatterns[$p.Pattern] += $r.Spec
    }
}

Write-Host ""
Write-Host "## Resume" -ForegroundColor Cyan
Write-Host "- Specs avec patterns: $linkedSpecs / $($specFiles.Count)"
Write-Host "- Patterns utilises: $($linkedPatterns.Keys.Count) / $($patternKeywords.Keys.Count)"
Write-Host ""

# Generate linking report
$reportPath = "D:\Projects\ClubMed\LecteurMagic\.openspec\reports\LINKING_SPECS_PATTERNS.md"

$report = @"
# Linking Specs <-> Patterns

> **Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
> **Phase**: PDCA Phase 2
> **Specs analysees**: $($specFiles.Count)

---

## Matrice Specs -> Patterns

| Spec | Pattern(s) | Score |
|------|------------|-------|
"@

foreach ($r in $results | Sort-Object { $_.Spec }) {
    $patternLinks = ($r.Patterns | ForEach-Object {
        "[$($_.Pattern)](../patterns/$($_.Pattern).md)"
    }) -join ", "
    $scoreList = ($r.Patterns | ForEach-Object { $_.Score }) -join ", "
    $report += "`n| [$($r.Spec)](../specs/$($r.Spec).md) | $patternLinks | $scoreList |"
}

$report += @"


---

## Matrice Patterns -> Specs

"@

foreach ($pattern in $linkedPatterns.Keys | Sort-Object) {
    $specs = $linkedPatterns[$pattern]
    $report += "`n### $pattern`n`n"
    $report += "Specs utilisant ce pattern:`n`n"
    foreach ($s in $specs | Sort-Object) {
        $report += "- [$s](../specs/$s.md)`n"
    }
}

$report += @"

---

## Statistiques

| Metrique | Valeur |
|----------|--------|
| Specs avec pattern | $linkedSpecs |
| Specs sans pattern | $($specFiles.Count - $linkedSpecs) |
| Patterns utilises | $($linkedPatterns.Keys.Count) |
| Patterns non utilises | $($patternKeywords.Keys.Count - $linkedPatterns.Keys.Count) |
| Couverture specs | $([math]::Round($linkedSpecs / $specFiles.Count * 100, 1))% |
| Couverture patterns | $([math]::Round($linkedPatterns.Keys.Count / $patternKeywords.Keys.Count * 100, 1))% |

---

*Rapport genere automatiquement par link-specs-patterns.ps1*
"@

if (-not $DryRun) {
    $report | Out-File $reportPath -Encoding UTF8
    Write-Host "Rapport genere: $reportPath" -ForegroundColor Green
}

# Return stats
@{
    LinkedSpecs = $linkedSpecs
    TotalSpecs = $specFiles.Count
    LinkedPatterns = $linkedPatterns.Keys.Count
    TotalPatterns = $patternKeywords.Keys.Count
}
