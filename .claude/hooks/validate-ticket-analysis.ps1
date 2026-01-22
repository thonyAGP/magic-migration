# validate-ticket-analysis.ps1
# Hook de validation pour les analyses de tickets Magic
# Vérifie que le protocole ticket-analysis.md est respecté

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

$ErrorActionPreference = "Stop"

# Ne valider que les fichiers analysis.md dans tickets/
if ($FilePath -notmatch '\.openspec[\\/]tickets[\\/][A-Z]+-\d+[\\/]analysis\.md$') {
    exit 0
}

Write-Host "=== Validation Protocole Ticket Analysis ===" -ForegroundColor Cyan
Write-Host "Fichier: $FilePath" -ForegroundColor Gray

$content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
if (-not $content) {
    Write-Host "[SKIP] Fichier vide ou inaccessible" -ForegroundColor Yellow
    exit 0
}

$errors = @()
$warnings = @()

# === SECTION 1: Vérification lien Jira ===
if ($content -notmatch '\[([A-Z]+-\d+)\]\(https://clubmed\.atlassian\.net/browse/') {
    $errors += "Section 1: Lien Jira manquant ou mal formaté"
}

# === SECTION 2: Vérification IDE vérifié ===
if ($content -notmatch 'magic_get_position|magic_find_program') {
    $errors += "Section 2: Aucun appel magic_get_position ou magic_find_program documenté"
}

if ($content -match 'Prg_\d+\.xml' -and $content -notmatch 'IDE Vérifié|IDE \*\*\d+\*\*') {
    $warnings += "Section 2: Fichier Prg_XXX.xml mentionné sans IDE vérifié correspondant"
}

# === SECTION 3: Vérification diagramme flux ===
if ($content -notmatch '┌|└|│|▼|→' -and $content -notmatch '```.*\n.*─.*\n.*```') {
    $warnings += "Section 3: Diagramme de flux ASCII absent"
}

# === SECTION 4: Vérification expressions ===
if ($content -match 'Expression \d+' -and $content -notmatch 'magic_get_expression') {
    $warnings += "Section 4: Expression mentionnée sans appel magic_get_expression"
}

if ($content -match '\{0,\d+\}|\{\d+,\d+\}') {
    if ($content -notmatch 'mainOffset|Variable [A-Z]{1,3}') {
        $errors += "Section 4: Références {N,Y} présentes sans décodage en variables"
    }
}

# === SECTION 5: Vérification Root Cause ===
if ($content -notmatch '## 5\. Root Cause|## Root Cause|### Root Cause') {
    $warnings += "Section 5: Section Root Cause absente"
} elseif ($content -notmatch 'Programme.*IDE.*\d+.*Tâche.*\d+') {
    $warnings += "Section 5: Root Cause sans localisation précise (Programme + Tâche)"
}

# === SECTION 6: Vérification Solution ===
if ($content -match '## 6\. Solution|## Solution') {
    if ($content -notmatch 'Avant.*Après|Avant \(bug\)|Après \(fix\)') {
        $warnings += "Section 6: Solution sans comparaison Avant/Après"
    }
}

# === Patterns interdits ===
$forbiddenPatterns = @(
    @{ Pattern = 'ISN_2\s*[=:]\s*\d+'; Message = "Utilisation de ISN_2 au lieu de position hiérarchique" },
    @{ Pattern = 'FieldID\s*[=:]\s*\d+'; Message = "Utilisation de FieldID au lieu de nom de variable" },
    @{ Pattern = '\bobj=\d+\b'; Message = "Utilisation de obj=XX au lieu de Table n°XX" },
    @{ Pattern = 'Variable [A-C]\b(?! \()'; Message = "Variable locale (A,B,C) sans contexte - utiliser variable globale avec offset" }
)

foreach ($pattern in $forbiddenPatterns) {
    if ($content -match $pattern.Pattern) {
        $warnings += "Pattern interdit: $($pattern.Message)"
    }
}

# === Checklist ===
$checklistItems = @(
    'IDE vérifié',
    'mainOffset',
    'expression.*décodée|formule.*lisible',
    'root cause',
    'Avant.*Après',
    'diagramme.*flux|flux.*ASCII'
)

$uncheckedCount = 0
foreach ($item in $checklistItems) {
    if ($content -match "\[ \].*$item") {
        $uncheckedCount++
    }
}

if ($uncheckedCount -gt 0) {
    $warnings += "Checklist: $uncheckedCount items non cochés"
}

# === Affichage résultats ===
Write-Host ""

if ($warnings.Count -gt 0) {
    Write-Host "[WARNINGS] $($warnings.Count) avertissement(s):" -ForegroundColor Yellow
    foreach ($w in $warnings) {
        Write-Host "  - $w" -ForegroundColor Yellow
    }
}

if ($errors.Count -gt 0) {
    Write-Host "[ERRORS] $($errors.Count) erreur(s) bloquante(s):" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host "  - $e" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Corrigez ces erreurs avant de committer." -ForegroundColor Red
    Write-Host "Protocole: .claude/protocols/ticket-analysis.md" -ForegroundColor Gray
    exit 1
}

if ($warnings.Count -eq 0 -and $errors.Count -eq 0) {
    Write-Host "[OK] Analyse conforme au protocole" -ForegroundColor Green
}

exit 0
