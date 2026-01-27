#Requires -Version 5.1
<#
.SYNOPSIS
    Merge existing V2 spec with YAML annotations to create enhanced spec

.DESCRIPTION
    This script takes an existing V2.0 spec (from .openspec/specs/) and merges it
    with human annotations (from .openspec/annotations/) to create an enhanced
    output with functional documentation.

    This is a lightweight alternative to Render-Spec.ps1 when KB access is not available.

.PARAMETER Project
    Project code (ADH, PBP, PVE, VIL, etc.)

.PARAMETER IDE
    IDE position number

.PARAMETER OutputPath
    Optional output directory. Defaults to .openspec/renders/

.EXAMPLE
    .\Merge-SpecWithAnnotations.ps1 -Project ADH -IDE 121
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IDE,

    [string]$OutputPath = "D:\Projects\Lecteur_Magic\.openspec\renders"
)

$ErrorActionPreference = "Stop"
$projectRoot = "D:\Projects\Lecteur_Magic"

Write-Host "=== Merge Spec with Annotations ===" -ForegroundColor Cyan
Write-Host "Project: $Project | IDE: $IDE" -ForegroundColor Cyan

# ============================================================================
# STEP 1: Load existing V2 spec
# ============================================================================
Write-Host "`n[1/4] Loading existing V2 spec..." -ForegroundColor Yellow

$specFile = "$projectRoot\.openspec\specs\$Project-IDE-$IDE.md"
if (-not (Test-Path $specFile)) {
    Write-Error "V2 spec not found: $specFile"
    exit 1
}

$specContent = Get-Content $specFile -Raw -Encoding UTF8
Write-Host "  Loaded: $specFile" -ForegroundColor Green

# Extract key info from V2 spec
$title = ""
if ($specContent -match '# (.+)') {
    $title = $Matches[1].Trim()
}

# ============================================================================
# STEP 2: Load YAML annotations
# ============================================================================
Write-Host "`n[2/4] Loading YAML annotations..." -ForegroundColor Yellow

$annotationFile = "$projectRoot\.openspec\annotations\$Project-IDE-$IDE.yaml"
$hasAnnotations = $false
$annotations = @{
    functional = @{
        objective = @{ who = ""; what = ""; why = "" }
        user_flow = @()
        error_cases = @()
    }
    business_rules = @()
    migration = @{
        complexity_override = $null
        target_architecture = "CQRS"
        notes = @()
    }
    dependencies = @{ external = @(); ecf_notes = "" }
    history = @()
    metadata = @{ tags = @() }
}

if (Test-Path $annotationFile) {
    $hasAnnotations = $true
    Write-Host "  Found: $annotationFile" -ForegroundColor Green

    # Simple YAML parsing with better nested object support
    $yamlContent = Get-Content $annotationFile -Raw -Encoding UTF8
    $lines = $yamlContent -split "`n"
    $currentSection = ""
    $currentSubSection = ""
    $currentSubSubSection = ""

    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }

        # Count leading spaces for indentation level
        $indent = 0
        if ($line -match '^(\s*)') {
            $indent = $Matches[1].Length
        }

        # Top-level section (no indentation)
        if ($indent -eq 0 -and $line -match '^(\w+):') {
            $currentSection = $Matches[1]
            $currentSubSection = ""
            $currentSubSubSection = ""
            continue
        }

        # Second-level section (2 spaces)
        if ($indent -eq 2 -and $line -match '^\s{2}(\w+):\s*$') {
            $currentSubSection = $Matches[1]
            $currentSubSubSection = ""
            continue
        }

        # Second-level value (2 spaces)
        if ($indent -eq 2 -and $line -match '^\s{2}(\w+):\s*"?([^"]+)"?\s*$') {
            $key = $Matches[1]
            $value = $Matches[2].Trim() -replace '^"', '' -replace '"$', ''

            if ($currentSection -eq 'migration') {
                if ($key -eq 'target_architecture') {
                    $annotations.migration.target_architecture = $value
                }
            }
            elseif ($currentSection -eq 'dependencies') {
                if ($key -eq 'ecf_notes') {
                    $annotations.dependencies.ecf_notes = $value
                }
            }
            continue
        }

        # Third-level value (4 spaces) - for objective.who, objective.what, etc.
        if ($indent -eq 4 -and $line -match '^\s{4}(\w+):\s*"?([^"]*)"?\s*$') {
            $key = $Matches[1]
            $value = $Matches[2].Trim() -replace '^"', '' -replace '"$', ''

            if ($currentSection -eq 'functional' -and $currentSubSection -eq 'objective') {
                $annotations.functional.objective[$key] = $value
            }
            continue
        }

        # List item (4 spaces with dash)
        if ($indent -ge 4 -and $line -match '^\s{4}-\s+(.+)$') {
            $item = $Matches[1].Trim() -replace '^"', '' -replace '"$', ''

            if ($currentSection -eq 'functional' -and $currentSubSection -eq 'user_flow') {
                $annotations.functional.user_flow += $item
            }
            elseif ($currentSection -eq 'migration' -and $currentSubSection -eq 'notes') {
                $annotations.migration.notes += $item
            }
            elseif ($currentSection -eq 'metadata' -and $currentSubSection -eq 'tags') {
                $annotations.metadata.tags += $item
            }
        }
    }

    Write-Host "  Parsed: objective=$($annotations.functional.objective.who -ne ''), user_flow=$($annotations.functional.user_flow.Count), notes=$($annotations.migration.notes.Count)" -ForegroundColor DarkGray
} else {
    Write-Host "  No annotations found (using V2 spec only)" -ForegroundColor DarkYellow
}

# ============================================================================
# STEP 3: Build enhanced output
# ============================================================================
Write-Host "`n[3/4] Building enhanced spec..." -ForegroundColor Yellow

$date = Get-Date -Format "yyyy-MM-dd"

# Build functional section
$functionalSection = @"

---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier

"@

if ($annotations.functional.objective.who) {
    $functionalSection += @"
- **Qui**: $($annotations.functional.objective.who)
- **Quoi**: $($annotations.functional.objective.what)
- **Pourquoi**: $($annotations.functional.objective.why)

"@
} else {
    $functionalSection += @"
> A completer dans ``.openspec/annotations/$Project-IDE-$IDE.yaml``

"@
}

$functionalSection += @"
### 1.2 Flux Utilisateur

"@

if ($annotations.functional.user_flow.Count -gt 0) {
    $idx = 1
    foreach ($step in $annotations.functional.user_flow) {
        $functionalSection += "$idx. $step`n"
        $idx++
    }
} else {
    $functionalSection += "> A completer dans annotations YAML`n"
}

$functionalSection += @"

### 1.3 Notes Migration

"@

if ($annotations.migration.notes.Count -gt 0) {
    foreach ($note in $annotations.migration.notes) {
        $functionalSection += "- $note`n"
    }
} else {
    $functionalSection += "> A completer dans annotations YAML`n"
}

$functionalSection += @"

### 1.4 Dependances ECF

$($annotations.dependencies.ecf_notes)

### 1.5 Tags

"@

if ($annotations.metadata.tags.Count -gt 0) {
    $functionalSection += "``$($annotations.metadata.tags -join '``, ``')```n"
} else {
    $functionalSection += "> Aucun tag defini`n"
}

# ============================================================================
# STEP 4: Combine V2 spec with functional section
# ============================================================================
Write-Host "`n[4/4] Generating enhanced output..." -ForegroundColor Yellow

# Find the "## 2. TABLES" section and insert functional section before it
$tablesSection = $specContent.IndexOf("## 2. TABLES")
if ($tablesSection -lt 0) {
    # Try alternate format
    $tablesSection = $specContent.IndexOf("## TABLES")
}

if ($tablesSection -gt 0) {
    # Find the "---" before the tables section
    $insertPoint = $specContent.LastIndexOf("---", $tablesSection)
    if ($insertPoint -gt 0) {
        $enhancedSpec = $specContent.Substring(0, $insertPoint) + $functionalSection + "`n" + $specContent.Substring($insertPoint)
    } else {
        # Insert directly before tables section
        $enhancedSpec = $specContent.Substring(0, $tablesSection) + $functionalSection + "`n---`n`n" + $specContent.Substring($tablesSection)
    }
} else {
    # Fallback: append at the end
    $enhancedSpec = $specContent + $functionalSection
}

# Update version marker
$enhancedSpec = $enhancedSpec -replace '\*\*Version spec\*\* : 2\.0', '**Version spec** : 2.1 (Enhanced)'

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$outputFile = "$OutputPath\$Project-IDE-$IDE.md"
$enhancedSpec | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "`n=== SPEC ENHANCED ===" -ForegroundColor Green
Write-Host "Input:  $specFile"
Write-Host "Output: $outputFile"
Write-Host "Annotations: $($hasAnnotations)"

[PSCustomObject]@{
    Project = $Project
    IDE = $IDE
    Title = $title
    HasAnnotations = $hasAnnotations
    OutputFile = $outputFile
}
