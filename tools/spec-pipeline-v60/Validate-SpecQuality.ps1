<#
.SYNOPSIS
    Valide la qualité d'une spec générée contre des critères attendus (Golden File)

.DESCRIPTION
    Ce script compare la sortie du pipeline V6.0 avec un fichier de référence
    pour détecter les régressions AVANT le déploiement.

.PARAMETER Project
    Nom du projet (ADH, PBP, etc.)

.PARAMETER IdePosition
    Position IDE du programme

.PARAMETER StopOnFailure
    Arrête l'exécution à la première erreur

.EXAMPLE
    .\Validate-SpecQuality.ps1 -Project ADH -IdePosition 237
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [switch]$StopOnFailure
)

$ErrorActionPreference = "Stop"

# Chemins
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutputDir = Join-Path $ScriptRoot "output\$Project-IDE-$IdePosition"
$GoldenFile = Join-Path $ScriptRoot "golden\$Project-IDE-$IdePosition-expected.json"
$SpecFile = Join-Path $ScriptRoot "..\..\..\.openspec\specs\$Project-IDE-$IdePosition.md"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "         VALIDATION QUALITÉ SPEC - ANTI-RÉGRESSION              " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "`nTarget: $Project IDE $IdePosition"

# Vérifier existence du Golden File
if (-not (Test-Path $GoldenFile)) {
    Write-Host "`n[WARN] Pas de Golden File trouvé: $GoldenFile" -ForegroundColor Yellow
    Write-Host "       Validation basique uniquement." -ForegroundColor Yellow
    $golden = $null
} else {
    $golden = Get-Content $GoldenFile -Raw | ConvertFrom-Json
    Write-Host "Golden File: $GoldenFile" -ForegroundColor Green
}

# Charger les fichiers de sortie du pipeline
$discoveryFile = Join-Path $OutputDir "discovery.json"
$mappingFile = Join-Path $OutputDir "mapping.json"
$decodedFile = Join-Path $OutputDir "decoded.json"
$uiFormsFile = Join-Path $OutputDir "ui_forms.json"

if (-not (Test-Path $discoveryFile)) {
    Write-Host "`n[ERROR] Fichiers pipeline non trouvés. Exécutez d'abord le pipeline." -ForegroundColor Red
    exit 1
}

$discovery = Get-Content $discoveryFile -Raw | ConvertFrom-Json
$mapping = Get-Content $mappingFile -Raw | ConvertFrom-Json
$decoded = Get-Content $decodedFile -Raw | ConvertFrom-Json
$uiForms = Get-Content $uiFormsFile -Raw | ConvertFrom-Json

# Compteurs
$totalChecks = 0
$passedChecks = 0
$failedChecks = @()

function Test-Criterion {
    param(
        [string]$Category,
        [string]$Name,
        [object]$Actual,
        [object]$Expected,
        [string]$Operator = "gte"  # gte, eq, lte, contains
    )

    $script:totalChecks++

    $passed = switch ($Operator) {
        "gte" { $Actual -ge $Expected }
        "eq" { $Actual -eq $Expected }
        "lte" { $Actual -le $Expected }
        "contains" { $Actual -contains $Expected }
        default { $Actual -ge $Expected }
    }

    $status = if ($passed) { "[OK]" } else { "[FAIL]" }
    $color = if ($passed) { "Green" } else { "Red" }

    $opSymbol = switch ($Operator) {
        "gte" { ">=" }
        "eq" { "==" }
        "lte" { "<=" }
        "contains" { "contains" }
        default { ">=" }
    }

    Write-Host "  $status $Category.$Name : $Actual $opSymbol $Expected" -ForegroundColor $color

    if ($passed) {
        $script:passedChecks++
    } else {
        $script:failedChecks += "$Category.$Name (actual: $Actual, expected: $opSymbol $Expected)"
        if ($StopOnFailure) {
            throw "Validation failed: $Category.$Name"
        }
    }

    return $passed
}

Write-Host "`n-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " SECTION 1: IDENTIFICATION" -ForegroundColor White
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

Test-Criterion "identification" "project" $discovery.metadata.project "ADH" "eq"
Test-Criterion "identification" "ide_position" $discovery.metadata.ide_position $IdePosition "eq"
Test-Criterion "identification" "has_program_name" ($discovery.metadata.program_name.Length -gt 0) $true "eq"

if ($golden) {
    Test-Criterion "identification" "orphan_status" $discovery.orphan_analysis.status $golden.identification.orphan_status "eq"
    Test-Criterion "identification" "callers_count" $discovery.call_graph.callers.Count $golden.identification.callers_min "gte"
}

Write-Host "`n-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " SECTION 2: OBJECTIF METIER (Tables)" -ForegroundColor White
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

$tablesWrite = if ($discovery.tables.by_access.WRITE) { @($discovery.tables.by_access.WRITE).Count } else { 0 }
$tablesRead = if ($discovery.tables.by_access.READ) { @($discovery.tables.by_access.READ).Count } else { 0 }
$tablesLink = if ($discovery.tables.by_access.LINK) { @($discovery.tables.by_access.LINK).Count } else { 0 }

Write-Host "  Tables: WRITE=$tablesWrite, READ=$tablesRead, LINK=$tablesLink" -ForegroundColor Cyan

if ($golden) {
    Test-Criterion "tables" "write_count" $tablesWrite $golden.objectif_metier.tables_write_min "gte"
    Test-Criterion "tables" "read_count" $tablesRead $golden.objectif_metier.tables_read_min "gte"
}

Write-Host "`n-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " SECTION 3: RÈGLES MÉTIER (CRITIQUE)" -ForegroundColor White
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

$rulesCount = if ($decoded.business_rules.all) { @($decoded.business_rules.all).Count } else { 0 }
Write-Host "  Règles métier extraites: $rulesCount" -ForegroundColor Cyan

if ($golden) {
    Test-Criterion "regles" "count" $rulesCount $golden.objectif_metier.regles_metier_min "gte"
}

# Vérifier les troncatures dans la spec générée
if (Test-Path $SpecFile) {
    $specContent = Get-Content $SpecFile -Raw
    $truncatedRules = ([regex]::Matches($specContent, '\[RM-\d+\][^\n]*\.\.\.')).Count

    Write-Host "  Règles tronquées dans spec: $truncatedRules" -ForegroundColor $(if ($truncatedRules -eq 0) { "Green" } else { "Red" })

    if ($golden) {
        Test-Criterion "regles" "truncated_count" $truncatedRules $golden.objectif_metier.regles_truncated_max "lte"
    } else {
        # Même sans golden, ZÉRO troncature est obligatoire
        Test-Criterion "regles" "truncated_count" $truncatedRules 0 "lte"
    }
}

Write-Host "`n-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " SECTION 4: EXPRESSIONS DÉCODÉES" -ForegroundColor White
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

$exprTotal = $decoded.statistics.total_in_program
$exprDecoded = $decoded.statistics.decoded_count
$exprPercent = $decoded.statistics.coverage_percent

Write-Host "  Expressions: $exprDecoded / $exprTotal ($exprPercent%)" -ForegroundColor Cyan

if ($golden) {
    Test-Criterion "expressions" "decoded_percent" $exprPercent $golden.technique.expressions_decoded_min_percent "gte"
}

Write-Host "`n-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " SECTION 5: VARIABLES MAPPÉES" -ForegroundColor White
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

$varsMapped = if ($mapping.variable_mapping) { ($mapping.variable_mapping | Get-Member -MemberType NoteProperty).Count } else { 0 }
Write-Host "  Variables avec lettre IDE: $varsMapped" -ForegroundColor Cyan

if ($golden) {
    Test-Criterion "variables" "mapped_count" $varsMapped $golden.technique.variables_mapped_min "gte"
}

Write-Host "`n-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " SECTION 6: UI FORMS" -ForegroundColor White
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

$formsCount = if ($uiForms.forms) { @($uiForms.forms).Count } else { 0 }
Write-Host "  Forms (écrans UI): $formsCount" -ForegroundColor Cyan

Test-Criterion "ui" "forms_count" $formsCount 1 "gte"

Write-Host "`n-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " SECTION 7: CARTOGRAPHIE" -ForegroundColor White
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

$callersCount = if ($discovery.call_graph.callers) { @($discovery.call_graph.callers).Count } else { 0 }
$calleesCount = if ($discovery.call_graph.callees) { @($discovery.call_graph.callees).Count } else { 0 }

Write-Host "  Callers: $callersCount, Callees: $calleesCount" -ForegroundColor Cyan

if ($golden) {
    Test-Criterion "cartographie" "callees_count" $calleesCount $golden.cartographie.callees_min "gte"
}

# Vérifier présence du diagramme Mermaid dans la spec
if (Test-Path $SpecFile) {
    $hasMermaid = $specContent -match "```mermaid"
    Test-Criterion "cartographie" "mermaid_present" $hasMermaid $true "eq"
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "                    RÉSULTATS VALIDATION                        " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$passRate = [math]::Round(($passedChecks / $totalChecks) * 100, 1)
$resultColor = if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" }

Write-Host "`n  Tests passés: $passedChecks / $totalChecks ($passRate%)" -ForegroundColor $resultColor

if ($failedChecks.Count -gt 0) {
    Write-Host "`n  ÉCHECS:" -ForegroundColor Red
    foreach ($fail in $failedChecks) {
        Write-Host "    - $fail" -ForegroundColor Red
    }

    Write-Host "`n[RÉGRESSION DÉTECTÉE] Ne pas déployer cette spec!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n[VALIDATION OK] Spec prête pour déploiement." -ForegroundColor Green
    exit 0
}
