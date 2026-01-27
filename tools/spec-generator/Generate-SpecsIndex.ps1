#Requires -Version 5.1
<#
.SYNOPSIS
    Generate index page and JSON for all ADH specs

.DESCRIPTION
    Creates SPECS_ENRICHIES_V21.md with all programs organized by folder,
    and updates index.json with all specs metadata.
#>

$ErrorActionPreference = "Stop"
$projectRoot = "D:\Projects\Lecteur_Magic"
$rendersPath = "$projectRoot\.openspec\renders"
$specsPath = "$projectRoot\.openspec\specs"
$annotationsPath = "$projectRoot\.openspec\annotations"

Write-Host "=== Generate Specs Index ===" -ForegroundColor Cyan

# Parse spec metadata from V2.0 specs
$allSpecs = @()

$specFiles = Get-ChildItem "$specsPath\ADH-IDE-*.md" | Sort-Object {
    [int]([regex]::Match($_.BaseName, 'IDE-(\d+)').Groups[1].Value)
}

Write-Host "Parsing $($specFiles.Count) specs..." -ForegroundColor Yellow

foreach ($file in $specFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $ide = [int]([regex]::Match($file.BaseName, 'IDE-(\d+)').Groups[1].Value)

    # Extract metadata
    $title = ""
    if ($content -match '# ADH IDE \d+ - (.+)') {
        $title = $Matches[1].Trim()
    }

    $type = "Batch"
    if ($content -match '\| \*\*Type\*\* \| ([OB])') {
        $type = if ($Matches[1] -eq 'O') { 'Online' } else { 'Batch' }
    }

    $folder = ""
    if ($content -match '\| \*\*Dossier IDE\*\* \| (.+?) \|') {
        $folder = $Matches[1].Trim()
    }

    $tables = 0
    if ($content -match '\| Tables \| (\d+)') {
        $tables = [int]$Matches[1]
    }
    elseif ($content -match '## \d+\. TABLES \((\d+) tables') {
        $tables = [int]$Matches[1]
    }

    $expressions = 0
    if ($content -match '\| Expressions \| (\d+)') {
        $expressions = [int]$Matches[1]
    }
    elseif ($content -match '## \d+\. EXPRESSIONS \((\d+) total') {
        $expressions = [int]$Matches[1]
    }

    $xmlFile = ""
    if ($content -match '\| \*\*Fichier XML\*\* \| (Prg_\d+\.xml)') {
        $xmlFile = $Matches[1]
    }

    $hasAnnotation = Test-Path "$annotationsPath\ADH-IDE-$ide.yaml"
    $hasRender = Test-Path "$rendersPath\ADH-IDE-$ide.md"

    # Complexity estimation
    $complexity = "Faible"
    if ($expressions -gt 500 -or $tables -gt 30) {
        $complexity = "Eleve"
    }
    elseif ($expressions -gt 100 -or $tables -gt 10) {
        $complexity = "Moyen"
    }

    $allSpecs += [PSCustomObject]@{
        IDE = $ide
        Title = $title
        Type = $type
        Folder = $folder
        Tables = $tables
        Expressions = $expressions
        XmlFile = $xmlFile
        Complexity = $complexity
        HasAnnotation = $hasAnnotation
        HasRender = $hasRender
    }
}

Write-Host "Parsed $($allSpecs.Count) specs" -ForegroundColor Green

# Group by folder
$byFolder = $allSpecs | Group-Object -Property Folder | Sort-Object Name

# Generate SPECS_ENRICHIES_V21.md
Write-Host "`nGenerating index page..." -ForegroundColor Yellow

$onlineCount = ($allSpecs | Where-Object { $_.Type -eq 'Online' }).Count
$batchCount = ($allSpecs | Where-Object { $_.Type -eq 'Batch' }).Count
$annotatedCount = ($allSpecs | Where-Object { $_.HasAnnotation }).Count

$md = @"
# Specifications ADH Enrichies V2.1

> **$($allSpecs.Count) programmes** documentes | Genere le $(Get-Date -Format 'yyyy-MM-dd HH:mm')

---

## Vue d'ensemble

| Metrique | Valeur |
|----------|--------|
| Total programmes | $($allSpecs.Count) |
| Programmes Online | $onlineCount |
| Programmes Batch | $batchCount |
| Avec annotations YAML | $annotatedCount |
| Dossiers | $($byFolder.Count) |

---


"@

foreach ($group in $byFolder) {
    $folderName = if ($group.Name) { $group.Name } else { "Non classe" }
    $specs = $group.Group | Sort-Object IDE

    $md += "## $folderName ($($specs.Count) programmes)`n`n"
    $md += "| IDE | Nom | Type | Tables | Expr | Complexite | Spec | Annotation |`n"
    $md += "|-----|-----|------|--------|------|------------|------|------------|`n"

    foreach ($s in $specs) {
        $specLink = "[Spec](renders/ADH-IDE-$($s.IDE).md)"
        $yamlLink = if ($s.HasAnnotation) { "[YAML](annotations/ADH-IDE-$($s.IDE).yaml)" } else { "-" }
        $typeIcon = if ($s.Type -eq 'Online') { "O" } else { "B" }

        $md += "| $($s.IDE) | $($s.Title) | $typeIcon | $($s.Tables) | $($s.Expressions) | $($s.Complexity) | $specLink | $yamlLink |`n"
    }
    $md += "`n"
}

$md += @"
---

*Index genere automatiquement par Generate-SpecsIndex.ps1*
"@

$md | Out-File "$projectRoot\.openspec\SPECS_ENRICHIES_V21.md" -Encoding UTF8
Write-Host "  Created: SPECS_ENRICHIES_V21.md" -ForegroundColor Green

# Update index.json with all specs pointing to renders
Write-Host "`nUpdating index.json..." -ForegroundColor Yellow

$indexPath = "$projectRoot\.openspec\index.json"
$index = Get-Content $indexPath -Raw | ConvertFrom-Json

# Build new specs array
$newSpecs = @()

# Keep templates
$templates = $index.specs | Where-Object { $_.id -like 'TEMPLATE*' }
foreach ($t in $templates) {
    $newSpecs += $t
}

# Add all ADH specs pointing to renders
foreach ($s in ($allSpecs | Sort-Object IDE)) {
    $newSpecs += [PSCustomObject]@{
        id = "ADH-IDE-$($s.IDE)"
        title = $s.Title
        project = "ADH"
        ide = $s.IDE
        xmlFile = $s.XmlFile
        type = $s.Type
        file = "renders/ADH-IDE-$($s.IDE).md"
        tables = $s.Tables
        expressions = $s.Expressions
        folder = $s.Folder
        complexity = $s.Complexity
        specVersion = "2.1"
        hasAnnotation = $s.HasAnnotation
    }
}

$index.specs = $newSpecs
$index.lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss+01:00")

$index | ConvertTo-Json -Depth 10 | Out-File $indexPath -Encoding UTF8
Write-Host "  Updated: index.json ($($newSpecs.Count) specs)" -ForegroundColor Green

Write-Host "`n=== DONE ===" -ForegroundColor Cyan
Write-Host "All $($allSpecs.Count) ADH specs are now available in the viewer"
