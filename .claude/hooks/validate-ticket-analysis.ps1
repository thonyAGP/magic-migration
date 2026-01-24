# validate-ticket-analysis.ps1
# Hook de validation pour les analyses de tickets Magic
# Verifie que le protocole ticket-analysis.md est respecte
# Version 2.0 - Validation stricte pour workflow orchestre

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

$ErrorActionPreference = "Stop"

# Ne valider que les fichiers analysis.md dans tickets/
if ($FilePath -notmatch '\.openspec[\\/]tickets[\\/][A-Z]+-\d+[\\/]analysis\.md$') {
    exit 0
}

Write-Host "=== Validation Protocole Ticket Analysis v2.0 ===" -ForegroundColor Cyan
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
# PHASE 1: CONTEXTE JIRA (OBLIGATOIRE)
# ============================================================================

# Verification lien Jira
if ($content -match '\[([A-Z]+-\d+)\]\(https://clubmed\.atlassian\.net/browse/') {
    $phases["Phase1_Contexte"] = $true
} else {
    $errors += "[Phase 1] Lien Jira manquant ou mal formate"
}

# Verification symptome documente
if ($content -match '\|\s*\*\*Symptome\*\*\s*\|' -or $content -match '## 1\. Contexte') {
    # OK - section contexte presente
} else {
    $warnings += "[Phase 1] Section Contexte Jira incomplete"
}

# ============================================================================
# PHASE 2: LOCALISATION (OBLIGATOIRE)
# ============================================================================

# Verification utilisation magic_get_position ou magic_find_program
if ($content -match 'magic_get_position|magic_find_program') {
    $phases["Phase2_Localisation"] = $true
} else {
    $errors += "[Phase 2] Aucun appel magic_get_position ou magic_find_program documente"
}

# Verification IDE verifie pour chaque programme
$prgMatches = [regex]::Matches($content, 'Prg_(\d+)\.xml')
$ideMatches = [regex]::Matches($content, '(ADH|PVE|PBP|PBG|VIL|REF)\s+IDE\s+(\d+)')

if ($prgMatches.Count -gt 0 -and $ideMatches.Count -eq 0) {
    $errors += "[Phase 2] Fichiers Prg_XXX.xml mentionnes sans IDE verifie correspondant"
}

if ($prgMatches.Count -gt 0 -and $ideMatches.Count -lt $prgMatches.Count) {
    $warnings += "[Phase 2] Certains Prg_XXX.xml n'ont pas d'IDE verifie"
}

# ============================================================================
# PHASE 3: TRACAGE FLUX (OBLIGATOIRE)
# ============================================================================

# Verification diagramme ASCII present (pattern simple sans Unicode)
# Cherche des patterns de diagramme: lignes avec | ou +-- ou arrows
$hasAsciiDiagram = $false
if ($content -match '\+--|\|.*\|' -or $content -match '-->|<--|==>') {
    $hasAsciiDiagram = $true
}
# Cherche aussi les box drawing Unicode (encoded as bytes)
if ($content -match '\xE2\x94\x80|\xE2\x94\x82|\xE2\x94\x8C|\xE2\x96\xBC') {
    $hasAsciiDiagram = $true
}
# Cherche les fleches markdown
if ($content -match '\*\*.*->\s*\*\*' -or $content -match 'CallTask|TargetPrg') {
    $hasAsciiDiagram = $true
}

if ($hasAsciiDiagram) {
    $phases["Phase3_Flux"] = $true
} else {
    $errors += "[Phase 3] Diagramme de flux absent (utiliser ASCII art ou documenter flux CallTask)"
}

# Verification magic_get_logic ou magic_kb_callgraph
if ($content -match 'magic_get_logic|magic_kb_callgraph|magic_kb_callers|magic_kb_callees') {
    # OK - tracage flux documente
} else {
    $warnings += "[Phase 3] Aucun appel magic_get_logic ou magic_kb_callgraph documente"
}

# ============================================================================
# PHASE 4: ANALYSE EXPRESSIONS (OBLIGATOIRE)
# ============================================================================

# Verification decodage expressions - utilise pattern sans accolades dans string
$hasNYReferences = $content -match '\{0,\d+\}' -or $content -match '\{\d+,\d+\}'

if ($hasNYReferences) {
    # Verification qu'elles sont decodees
    if ($content -match 'magic_get_line|magic_decode_expression') {
        $phases["Phase4_Expressions"] = $true
    } else {
        $errors += "[Phase 4] References (N,Y) presentes sans decodage (utiliser magic_get_line ou magic_decode_expression)"
    }

    # Verification decodage en variables nommees
    if ($content -notmatch 'Variable [A-Z]{1,3}') {
        $warnings += "[Phase 4] References (N,Y) sans correspondance Variable explicite"
    }
} else {
    # Pas de references {N,Y} - marquer comme OK si pas necessaire
    $phases["Phase4_Expressions"] = $true
}

# Detection decodage manuel interdit
$manualDecodePattern = '\{0,\d+\}\s*[=:]\s*Variable\s+[A-Z]{1,3}'
if ($content -match $manualDecodePattern -and $content -notmatch 'magic_decode_expression|magic_get_line') {
    $warnings += "[Phase 4] Decodage (N,Y) manuel detecte - INTERDIT, utiliser MCP"
}

# Detection calcul offset manuel
if ($content -match '\d+\s*\+\s*\d+\s*\+\s*\d+' -and $content -match 'offset') {
    $errors += "[Phase 4] Calcul d'offset manuel detecte - INTERDIT, utiliser magic_calculate_offset()"
}

# ============================================================================
# PHASE 5: ROOT CAUSE (OBLIGATOIRE)
# ============================================================================

if ($content -match '## 5\. Root Cause|## Root Cause|### Root Cause') {
    # Verification localisation precise
    if ($content -match 'Programme.*IDE.*\d+.*Tache.*\d+|IDE\s+\d+.*Tache\s+\d+') {
        $phases["Phase5_RootCause"] = $true
    } elseif ($content -match 'piste|blocage|en attente|investigation') {
        # Piste documentee acceptable
        $phases["Phase5_RootCause"] = $true
        $warnings += "[Phase 5] Root cause non trouvee - piste documentee"
    } else {
        $errors += "[Phase 5] Root Cause sans localisation precise (Programme + Tache)"
    }
} else {
    $errors += "[Phase 5] Section Root Cause absente"
}

# ============================================================================
# PHASE 6: SOLUTION (OPTIONNELLE SI PAS DE ROOT CAUSE)
# ============================================================================

if ($content -match '## 6\. Solution|## Solution') {
    if ($content -match 'Avant.*Apres|Avant \(bug\)|Apres \(fix\)|Avant|Apres') {
        $phases["Phase6_Solution"] = $true
    } else {
        $warnings += "[Phase 6] Solution sans comparaison Avant/Apres"
    }
} elseif ($phases["Phase5_RootCause"]) {
    $warnings += "[Phase 6] Section Solution absente (recommandee si root cause trouvee)"
}

# ============================================================================
# PATTERNS INTERDITS (BLOQUANTS)
# ============================================================================

$forbiddenPatterns = @(
    @{ Pattern = 'ISN_2\s*[=:]\s*\d+'; Message = "[INTERDIT] Utilisation de ISN_2 au lieu de position hierarchique IDE" },
    @{ Pattern = 'FieldID\s*[=:]\s*\d+'; Message = "[INTERDIT] Utilisation de FieldID au lieu de nom de variable" },
    @{ Pattern = '\bobj=\d+\b'; Message = "[INTERDIT] Utilisation de obj=XX au lieu de Table n.XX" }
)

foreach ($pattern in $forbiddenPatterns) {
    if ($content -match $pattern.Pattern) {
        if ($pattern.Message -match '^\[INTERDIT\]') {
            $errors += $pattern.Message
        } else {
            $warnings += $pattern.Message
        }
    }
}

# ============================================================================
# DETECTION Time(0) POUR dga_heure
# ============================================================================

if ($content -match 'dga_heure|heure_arrivee|heure_depart' -and $content -notmatch 'Time\(0\)|Time\s*\(\s*0\s*\)') {
    $warnings += "[Phase 4] Champ heure mentionne sans Time(0) - verifier source"
}

# ============================================================================
# CHECKLIST ITEMS NON COCHES
# ============================================================================

$checklistItems = @('IDE', 'magic_get_line', 'magic_decode_expression', 'magic_get_position', 'root cause', 'diagramme')

$uncheckedCount = 0
foreach ($item in $checklistItems) {
    if ($content -match "\[ \].*$item") {
        $uncheckedCount++
    }
}

if ($uncheckedCount -gt 0) {
    $warnings += "[Checklist] $uncheckedCount items non coches"
}

# ============================================================================
# RESUME DES PHASES
# ============================================================================

Write-Host ""
Write-Host "=== Resume des phases ===" -ForegroundColor Cyan

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
    Write-Host "Protocole: .claude/protocols/ticket-analysis.md" -ForegroundColor Gray
    Write-Host "Skill: /ticket-analyze" -ForegroundColor Gray
    exit 1
}

if ($warnings.Count -eq 0 -and $errors.Count -eq 0) {
    Write-Host "[OK] Analyse conforme au protocole v2.0" -ForegroundColor Green
}

exit 0
