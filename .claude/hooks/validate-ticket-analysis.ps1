# validate-ticket-analysis.ps1
# Hook de validation pour les analyses de tickets Magic
# Verifie que le protocole ticket-analysis.md est respecte
# Version 3.1 - Validation SEMANTIQUE + SPEC VALIDATION (MCP Evidence, Variable Mapping, FieldID bloque, Spec coherence)

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

$ErrorActionPreference = "Stop"

# Ne valider que les fichiers analysis.md dans tickets/
if ($FilePath -notmatch '\.openspec[\\/]tickets[\\/][A-Z]+-\d+[\\/]analysis\.md$') {
    exit 0
}

Write-Host "=== Validation Protocole Ticket Analysis v3.1 ===" -ForegroundColor Cyan
Write-Host "Fichier: $FilePath" -ForegroundColor Gray

$content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
if (-not $content) {
    Write-Host "[SKIP] Fichier vide ou inaccessible" -ForegroundColor Yellow
    exit 0
}

$errors = @()
$warnings = @()
$phases = @{
    "Phase1_Contexte" = $false
    "Phase2_Localisation" = $false
    "Phase3_Flux" = $false
    "Phase4_Expressions" = $false
    "Phase5_RootCause" = $false
    "Phase6_Solution" = $false
}

# ============================================================================
# VALIDATION V3.0: PATTERNS INTERDITS (BLOQUANTS PARTOUT)
# ============================================================================

Write-Host "`n--- Validation Patterns Interdits ---" -ForegroundColor Cyan

# FieldID est INTERDIT partout dans le fichier (pas seulement dans format specifique)
$fieldIdMatches = [regex]::Matches($content, 'FieldID\s*[=:]\s*\d+|FieldID\s+\d+|fieldId\s*[=:]\s*\d+')
if ($fieldIdMatches.Count -gt 0) {
    foreach ($m in $fieldIdMatches) {
        $errors += "[INTERDIT] FieldID brut detecte: '$($m.Value)' - Utiliser magic_get_line pour decoder en Variable"
    }
} else {
    Write-Host "[OK] Aucun FieldID brut detecte" -ForegroundColor Green
}

# ISN_2 brut est INTERDIT
$isn2Matches = [regex]::Matches($content, 'ISN_2\s*[=:]\s*\d+|ISN_2\s+\d+|isn2\s*[=:]\s*\d+')
if ($isn2Matches.Count -gt 0) {
    foreach ($m in $isn2Matches) {
        $errors += "[INTERDIT] ISN_2 brut detecte: '$($m.Value)' - Utiliser format hierarchique 'Tache N.X'"
    }
} else {
    Write-Host "[OK] Aucun ISN_2 brut detecte" -ForegroundColor Green
}

# obj=XX brut est INTERDIT
$objMatches = [regex]::Matches($content, '\bobj\s*=\s*\d+\b|\bDataObject\s+\d+\b')
if ($objMatches.Count -gt 0) {
    foreach ($m in $objMatches) {
        $errors += "[INTERDIT] Reference objet brute: '$($m.Value)' - Utiliser 'Table nXX - nom'"
    }
} else {
    Write-Host "[OK] Aucune reference objet brute detectee" -ForegroundColor Green
}

# ============================================================================
# VALIDATION V3.0: MCP EVIDENCE OBLIGATOIRE (Section 2 ET Section 4)
# ============================================================================

Write-Host "`n--- Validation MCP Evidence ---" -ForegroundColor Cyan

$mcpEvidenceCount = ([regex]::Matches($content, '### MCP Evidence')).Count

if ($mcpEvidenceCount -eq 0) {
    $errors += "[MCP Evidence] AUCUNE section '### MCP Evidence' trouvee - OBLIGATOIRE dans Section 2 (Localisation) et Section 4 (Expressions)"
} elseif ($mcpEvidenceCount -lt 2) {
    $warnings += "[MCP Evidence] Une seule section MCP Evidence trouvee - Recommande: 2 sections (Localisation + Expressions)"
    Write-Host "[WARN] Une seule section MCP Evidence" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Sections MCP Evidence presentes ($mcpEvidenceCount)" -ForegroundColor Green
}

# Verifier que les tables MCP Evidence contiennent des donnees
$mcpTablePattern = '\|\s*`?magic_\w+`?\s*\|.*\|.*\|'
$mcpTableMatches = [regex]::Matches($content, $mcpTablePattern)

if ($mcpTableMatches.Count -eq 0 -and $mcpEvidenceCount -gt 0) {
    $errors += "[MCP Evidence] Section MCP Evidence presente mais VIDE - Documenter les appels effectues"
} elseif ($mcpTableMatches.Count -gt 0) {
    Write-Host "[OK] $($mcpTableMatches.Count) appels MCP documentes" -ForegroundColor Green
}

# ============================================================================
# VALIDATION V3.0: VARIABLE MAPPING SI {N,Y} PRESENT
# ============================================================================

Write-Host "`n--- Validation Variable Mapping ---" -ForegroundColor Cyan

# Detecter references {N,Y}
$nyPatterns = @(
    '\{0,\d+\}',    # {0,X}
    '\{1,\d+\}',    # {1,X}
    '\{\d+,\d+\}'   # {N,Y} general
)

$hasNYReferences = $false
$nyRefCount = 0
foreach ($pattern in $nyPatterns) {
    $matches = [regex]::Matches($content, $pattern)
    $nyRefCount += $matches.Count
    if ($matches.Count -gt 0) { $hasNYReferences = $true }
}

if ($hasNYReferences) {
    Write-Host "[INFO] $nyRefCount references {N,Y} detectees" -ForegroundColor Gray

    # Verifier presence section Variable Mapping
    if ($content -match '### Variable Mapping') {
        # Verifier format de la table
        $mappingPattern = '\|\s*\{[0-9,]+\}\s*\|.*\|.*\*\*[A-Z]{1,3}\*\*'
        if ($content -match $mappingPattern) {
            Write-Host "[OK] Variable Mapping present avec format valide" -ForegroundColor Green
            $phases["Phase4_Expressions"] = $true
        } else {
            $errors += "[Variable Mapping] Table presente mais format invalide - Attendu: | {N,Y} | pos | **VAR** | nom | localisation |"
        }
    } else {
        $errors += "[Variable Mapping] $nyRefCount references {N,Y} trouvees SANS section '### Variable Mapping' - OBLIGATOIRE"
    }

    # Verifier qu'un outil MCP de decodage est utilise
    if ($content -notmatch 'magic_get_line|magic_decode_expression') {
        $errors += "[Variable Mapping] References {N,Y} presentes sans appel magic_get_line ou magic_decode_expression"
    }
} else {
    Write-Host "[INFO] Pas de references {N,Y} - Variable Mapping non requis" -ForegroundColor Gray
    $phases["Phase4_Expressions"] = $true
}

# ============================================================================
# VALIDATION V3.0: ARBORESCENCE TACHES OBLIGATOIRE
# ============================================================================

Write-Host "`n--- Validation Arborescence Taches ---" -ForegroundColor Cyan

if ($content -match '### Arborescence Taches|### Task Tree|Arborescence des taches') {
    # Verifier format hierarchique (caracteres de tree: box-drawing ou ASCII)
    $hasTreeChars = $content -match '[\u251C\u2514\u2502\u2500]' -or $content -match '\+--|\|--'
    $hasTacheFormat = $content -match 'Tache\s+\d+\.\d+'

    if ($hasTreeChars -and $hasTacheFormat) {
        Write-Host "[OK] Arborescence taches presente avec format hierarchique" -ForegroundColor Green
    } elseif ($hasTacheFormat) {
        $warnings += "[Arborescence] Section presente mais sans format hierarchique"
        Write-Host "[WARN] Arborescence sans format tree" -ForegroundColor Yellow
    } else {
        $errors += "[Arborescence] Section presente mais pas de taches au format N.X"
    }
} else {
    $warnings += "[Arborescence] Section '### Arborescence Taches' absente - Recommande pour tracabilite"
}

# ============================================================================
# SECTIONS OBLIGATOIRES (Verification structure)
# ============================================================================

Write-Host "`n--- Validation Structure ---" -ForegroundColor Cyan

$requiredSections = @(
    @{ Pattern = "## 1\. Contexte|## Contexte|## Context"; Name = "Contexte"; Phase = 1 },
    @{ Pattern = "## 2\. Localisation|## Programme|## Programs"; Name = "Localisation"; Phase = 2 },
    @{ Pattern = "## 3\. (Tracage )?Flux|## Flux|## Flow"; Name = "Flux"; Phase = 3 },
    @{ Pattern = "## 4\. (Analyse )?Expression|## Expression|## Variables"; Name = "Expressions"; Phase = 4 },
    @{ Pattern = "## 5\. Root Cause|## Cause|## Root Cause"; Name = "Root Cause"; Phase = 5 },
    @{ Pattern = "## 6\. Solution|## Solution"; Name = "Solution"; Phase = 6 }
)

$missingSections = @()
foreach ($section in $requiredSections) {
    if ($content -notmatch $section.Pattern) {
        $missingSections += $section.Name
    }
}

if ($missingSections.Count -gt 0) {
    $warnings += "[Structure] Sections manquantes: $($missingSections -join ', ')"
    Write-Host "[WARN] Sections manquantes: $($missingSections -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Toutes les sections obligatoires presentes" -ForegroundColor Green
}

# ============================================================================
# PHASE 1: CONTEXTE JIRA
# ============================================================================

if ($content -match '\[([A-Z]+-\d+)\]\(https://clubmed\.atlassian\.net/browse/') {
    $phases["Phase1_Contexte"] = $true
    Write-Host "[OK] Lien Jira present" -ForegroundColor Green
} else {
    $errors += "[Phase 1] Lien Jira manquant ou mal formate"
}

# ============================================================================
# PHASE 2: LOCALISATION
# ============================================================================

# Verification utilisation magic_get_position
if ($content -match 'magic_get_position|magic_find_program') {
    $phases["Phase2_Localisation"] = $true
} else {
    $errors += "[Phase 2] Aucun appel magic_get_position ou magic_find_program documente"
}

# Verification format IDE
$ideMatches = [regex]::Matches($content, '(ADH|PVE|PBP|PBG|VIL|REF)\s+IDE\s+(\d+)')
if ($ideMatches.Count -eq 0) {
    $errors += "[Phase 2] Aucun programme au format '{PROJET} IDE {N}' trouve"
} else {
    Write-Host "[OK] $($ideMatches.Count) programme(s) au format IDE" -ForegroundColor Green
}

# ============================================================================
# PHASE 3: TRACAGE FLUX
# ============================================================================

# Verification diagramme ASCII ou box-drawing
$hasAsciiDiagram = $false

# Patterns ASCII classiques
if ($content -match '\+--|\|.*\|' -or $content -match '-->|<--|==>') {
    $hasAsciiDiagram = $true
}

# Box-drawing Unicode (detect common characters)
if ($content -match '[\u250C\u2514\u251C\u2502\u2500\u2518\u2510\u25BC\u2534\u252C\u253C]') {
    $hasAsciiDiagram = $true
}

# Documentation CallTask
if ($content -match 'CallTask|TargetPrg|CallProg') {
    $hasAsciiDiagram = $true
}

if ($hasAsciiDiagram) {
    $phases["Phase3_Flux"] = $true
    Write-Host "[OK] Diagramme de flux present" -ForegroundColor Green
} else {
    $errors += "[Phase 3] Diagramme de flux absent (ASCII art ou documentation CallTask)"
}

# ============================================================================
# PHASE 5: ROOT CAUSE
# ============================================================================

if ($content -match '## 5\. Root Cause|## Root Cause|### Root Cause') {
    # Verification localisation precise avec format IDE + Tache
    if ($content -match '(ADH|PVE|PBP|PBG|VIL|REF)\s+IDE\s+\d+.*Tache\s+\d+\.\d+|Tache\s+\d+\.\d+.*(ADH|PVE|PBP|PBG|VIL|REF)\s+IDE\s+\d+') {
        $phases["Phase5_RootCause"] = $true
        Write-Host "[OK] Root cause avec localisation precise" -ForegroundColor Green
    } elseif ($content -match 'piste|blocage|en attente|investigation|a confirmer') {
        $phases["Phase5_RootCause"] = $true
        $warnings += "[Phase 5] Root cause non confirmee - piste documentee"
        Write-Host "[WARN] Root cause non confirmee" -ForegroundColor Yellow
    } else {
        $errors += "[Phase 5] Root Cause sans localisation precise (IDE + Tache N.X)"
    }
} else {
    $errors += "[Phase 5] Section Root Cause absente"
}

# ============================================================================
# PHASE 6: SOLUTION
# ============================================================================

if ($content -match '## 6\. Solution|## Solution') {
    if ($content -match 'Avant.*bug|Apres.*fix|### Avant|### Apres') {
        $phases["Phase6_Solution"] = $true
        Write-Host "[OK] Solution avec Avant/Apres" -ForegroundColor Green
    } else {
        $warnings += "[Phase 6] Solution sans format Avant/Apres"
    }
} elseif ($phases["Phase5_RootCause"]) {
    $warnings += "[Phase 6] Section Solution absente (recommandee)"
}

# ============================================================================
# VALIDATION V3.1: SPEC VALIDATION (Phase 3A - Capitalisation Plan)
# ============================================================================

Write-Host "`n--- Validation Specs ---" -ForegroundColor Cyan

$validateSpecScript = Join-Path $PSScriptRoot "..\scripts\validate-change-against-spec.ps1"
$specsDir = Join-Path $PSScriptRoot "..\..\..\.openspec\specs"

if (Test-Path $validateSpecScript) {
    # Extract ticket key from path
    $ticketKey = ""
    if ($FilePath -match '[\\/]([A-Z]+-\d+)[\\/]analysis\.md$') {
        $ticketKey = $Matches[1]
    }

    # Extract all program references (ADH IDE 69, etc.)
    $programRefs = @()
    $progMatches = [regex]::Matches($content, '(ADH|PVE|PBP|PBG|VIL|REF)\s+IDE\s+(\d+)')
    foreach ($m in $progMatches) {
        $ref = "$($m.Groups[1].Value):$($m.Groups[2].Value)"
        if ($ref -notin $programRefs) {
            $programRefs += $ref
        }
    }

    # Extract table references (Table n23, #849, etc.)
    $tableRefs = @()
    $tableMatches = [regex]::Matches($content, '(?:Table\s*n|#)(\d+)|table_id\s*[=:]\s*(\d+)')
    foreach ($m in $tableMatches) {
        $tableId = if ($m.Groups[1].Value) { $m.Groups[1].Value } else { $m.Groups[2].Value }
        if ($tableId -and $tableId -notin $tableRefs) {
            $tableRefs += $tableId
        }
    }

    if ($programRefs.Count -gt 0 -and $ticketKey) {
        Write-Host "[INFO] Validating $($programRefs.Count) programs against specs..." -ForegroundColor Gray

        try {
            $specValidation = & $validateSpecScript `
                -TicketKey $ticketKey `
                -ModifiedPrograms $programRefs `
                -ChangedTables $tableRefs `
                -OpenspecPath (Join-Path $PSScriptRoot "..\..\..\.openspec") 2>&1

            # Parse JSON result
            $validationResult = $specValidation | ConvertFrom-Json -ErrorAction SilentlyContinue

            if ($validationResult) {
                # Report specs found
                if ($validationResult.SpecsFound.Count -gt 0) {
                    Write-Host "[OK] $($validationResult.SpecsFound.Count) spec(s) validated" -ForegroundColor Green
                    foreach ($spec in $validationResult.SpecsFound) {
                        Write-Host "     - $($spec.Program): $($spec.Title)" -ForegroundColor Gray
                    }
                }

                # Report specs not found (warnings)
                foreach ($notFound in $validationResult.SpecsNotFound) {
                    $warnings += "[Spec] No spec found for $notFound - Generate spec before major changes"
                }

                # Report spec validation warnings
                foreach ($w in $validationResult.Warnings) {
                    $warnings += "[Spec] $($w.Message)"
                }

                # Report spec validation errors
                foreach ($e in $validationResult.Errors) {
                    if ($e.Severity -eq "High") {
                        $errors += "[Spec] $($e.Message)"
                    } else {
                        $warnings += "[Spec] $($e.Message)"
                    }
                }

                # Report recommendations
                foreach ($rec in $validationResult.Recommendations) {
                    Write-Host "[REC] $($rec.Message)" -ForegroundColor Cyan
                }
            }
        } catch {
            Write-Host "[WARN] Spec validation skipped: $_" -ForegroundColor Yellow
        }
    } elseif ($programRefs.Count -eq 0) {
        Write-Host "[SKIP] No program references found for spec validation" -ForegroundColor Gray
    }
} else {
    Write-Host "[SKIP] Spec validation script not found" -ForegroundColor Gray
}

# ============================================================================
# VALIDATION SUPPLEMENTAIRE: CALCUL OFFSET MANUEL INTERDIT
# ============================================================================

if ($content -match '\d+\s*\+\s*\d+\s*\+\s*\d+' -and $content -match 'offset|mainOffset|Main_VG') {
    $errors += "[INTERDIT] Calcul d'offset manuel detecte - Utiliser magic_calculate_offset() ou magic_get_line()"
}

# ============================================================================
# RESUME DES PHASES
# ============================================================================

Write-Host "`n=== Resume des phases ===" -ForegroundColor Cyan

$phaseNames = @{
    "Phase1_Contexte" = "Phase 1: Contexte Jira"
    "Phase2_Localisation" = "Phase 2: Localisation"
    "Phase3_Flux" = "Phase 3: Tracage Flux"
    "Phase4_Expressions" = "Phase 4: Expressions"
    "Phase5_RootCause" = "Phase 5: Root Cause"
    "Phase6_Solution" = "Phase 6: Solution"
}

$validPhases = 0
foreach ($phase in $phases.Keys | Sort-Object) {
    $status = if ($phases[$phase]) { "[OK]" } else { "[MANQUANT]" }
    $color = if ($phases[$phase]) { "Green" } else { "Red" }
    Write-Host "  $status $($phaseNames[$phase])" -ForegroundColor $color
    if ($phases[$phase]) { $validPhases++ }
}

Write-Host ""
$scoreColor = if ($validPhases -ge 5) { "Green" } elseif ($validPhases -ge 3) { "Yellow" } else { "Red" }
Write-Host "Score: $validPhases/6 phases validees" -ForegroundColor $scoreColor

# ============================================================================
# AFFICHAGE RESULTATS
# ============================================================================

Write-Host ""

if ($warnings.Count -gt 0) {
    Write-Host "[WARNINGS] $($warnings.Count) avertissement(s):" -ForegroundColor Yellow
    foreach ($w in $warnings) {
        Write-Host "  - $w" -ForegroundColor Yellow
    }
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "[ERRORS] $($errors.Count) erreur(s) bloquante(s):" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host "  - $e" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Corrigez ces erreurs avant de committer." -ForegroundColor Red
    Write-Host "Template: .openspec/tickets/TEMPLATE/analysis.md" -ForegroundColor Gray
    Write-Host "Protocole: .claude/protocols/ticket-analysis.md" -ForegroundColor Gray
    Write-Host "Skill: /ticket-analyze" -ForegroundColor Gray
    exit 1
}

if ($warnings.Count -eq 0 -and $errors.Count -eq 0) {
    Write-Host "[OK] Analyse conforme au protocole v3.0" -ForegroundColor Green
}

exit 0
