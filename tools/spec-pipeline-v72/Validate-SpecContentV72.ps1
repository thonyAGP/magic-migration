<#
.SYNOPSIS
    Validation systematique du contenu d'une spec V7.2 generee

.DESCRIPTION
    Verifie que la spec respecte les 17 criteres V7.2 :
    - 8 checks structurels (TAB, anchors, links, FORM-DATA, roles, types)
    - 7 checks GAP (roles specifiques, sous-taches, regles enrichies,
      boutons, colonnes, variables, migration)
    - 2 checks integrite (liens internes, syntaxe Mermaid)

.PARAMETER SpecFile
    Chemin vers le fichier .md a valider

.PARAMETER SpecDir
    Dossier contenant des specs .md a valider en batch

.PARAMETER StopOnFailure
    Arrete a la premiere erreur FAIL

.PARAMETER OutputJson
    Genere un rapport JSON

.EXAMPLE
    .\Validate-SpecContentV72.ps1 -SpecFile ".openspec\specs\ADH-IDE-237.md"

.EXAMPLE
    .\Validate-SpecContentV72.ps1 -SpecDir ".openspec\specs" -OutputJson
#>

param(
    [Parameter(ParameterSetName="Single")]
    [string]$SpecFile,

    [Parameter(ParameterSetName="Batch")]
    [string]$SpecDir,

    [switch]$StopOnFailure,
    [switch]$OutputJson
)

$ErrorActionPreference = "Stop"

# ============================================================
# VALIDATION ENGINE
# ============================================================

function Test-SpecV72 {
    param(
        [string]$FilePath,
        [switch]$Quiet
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "[ERROR] Fichier introuvable: $FilePath" -ForegroundColor Red
        return $null
    }

    $content = Get-Content $FilePath -Raw -Encoding UTF8
    $fileName = Split-Path $FilePath -Leaf

    # Skip summary files
    if ($fileName -match '-summary\.md$') { return $null }

    if (-not $Quiet) {
        Write-Host "`n--- Validation: $fileName ---" -ForegroundColor Cyan
    }

    $checks = [System.Collections.ArrayList]::new()

    # ========================================
    # SECTION A: STRUCTURAL CHECKS (1-8)
    # ========================================

    # CHECK 1: Version V7.2
    if ($content -match 'V7\.2') {
        [void]$checks.Add([PSCustomObject]@{ check = "VERSION_72"; status = "PASS"; detail = "V7.2 present" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "VERSION_72"; status = "FAIL"; detail = "V7.2 absent" })
    }

    # CHECK 2: 4 TAB markers
    $tabMarkers = ([regex]::Matches($content, '<!-- TAB:\w+ -->')).Count
    if ($tabMarkers -eq 4) {
        [void]$checks.Add([PSCustomObject]@{ check = "TAB_STRUCTURE"; status = "PASS"; detail = "4 onglets" })
    } elseif ($tabMarkers -gt 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "TAB_STRUCTURE"; status = "WARN"; detail = "$tabMarkers/4 onglets" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "TAB_STRUCTURE"; status = "FAIL"; detail = "Aucun onglet TAB" })
    }

    # CHECK 3: Anchors
    $anchorCount = ([regex]::Matches($content, '<a id="t\d+">')).Count
    if ($anchorCount -gt 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_ANCHORS"; status = "PASS"; detail = "$anchorCount ancres" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_ANCHORS"; status = "WARN"; detail = "Pas d'ancres" })
    }

    # CHECK 4: Clickable links
    $linkCount = ([regex]::Matches($content, '\]\([A-Z]+-IDE-\d+\.md\)')).Count
    if ($linkCount -gt 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_LINKS"; status = "PASS"; detail = "$linkCount liens cliquables" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_LINKS"; status = "WARN"; detail = "Pas de liens cliquables" })
    }

    # CHECK 5: FORM-DATA blocks
    $formDataCount = ([regex]::Matches($content, '<!-- FORM-DATA:')).Count
    $hasEcranSection = $content -match '<!-- TAB:ECRANS -->'
    if ($formDataCount -gt 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_FORMDATA"; status = "PASS"; detail = "$formDataCount blocs FORM-DATA" })
    } elseif (-not $hasEcranSection) {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_FORMDATA"; status = "PASS"; detail = "N/A (pas de section ecrans)" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_FORMDATA"; status = "WARN"; detail = "Section ecrans sans FORM-DATA" })
    }

    # CHECK 6: No placeholder rules
    $placeholders = ([regex]::Matches($content, '\[Phase 2\] Regle complexe')).Count
    if ($placeholders -eq 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "RULES_NO_PLACEHOLDER"; status = "PASS"; detail = "Pas de placeholder" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "RULES_NO_PLACEHOLDER"; status = "FAIL"; detail = "$placeholders placeholders" })
    }

    # CHECK 7: Variables by role
    $roleHeaders = ([regex]::Matches($content, '### 11\.\d+ (Parametres entrants|Variables de session|Variables de travail|Variables globales)')).Count
    if ($roleHeaders -gt 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_VAR_ROLES"; status = "PASS"; detail = "$roleHeaders groupes par role" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_VAR_ROLES"; status = "WARN"; detail = "Variables non groupees par role" })
    }

    # CHECK 8: Expression types precise
    $preciseTypes = ([regex]::Matches($content, '\| (CONSTANTE|CONDITION|NEGATION|CALCUL|FORMAT|REFERENCE_VG|CAST_LOGIQUE|CONCATENATION|UI_POSITION) \|')).Count
    if ($preciseTypes -gt 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_EXPR_TYPES"; status = "PASS"; detail = "$preciseTypes types precis" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "V72_EXPR_TYPES"; status = "WARN"; detail = "Pas de types precis" })
    }

    # ========================================
    # SECTION B: GAP CONTENT CHECKS (9-15)
    # ========================================

    # Detect program complexity from content
    $taskAnchors = ([regex]::Matches($content, '<a id="t\d+">')).Count
    $isComplexProgram = $taskAnchors -gt 3

    # CHECK 9 (GAP1): No generic task roles
    $genericRoles = ([regex]::Matches($content, 'Role\s*:\s*(Traitement interne|Traitement donnees|Traitement des donnees)\b')).Count
    if ($genericRoles -eq 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP1_SPECIFIC_ROLES"; status = "PASS"; detail = "Roles specifiques aux taches" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP1_SPECIFIC_ROLES"; status = "FAIL"; detail = "$genericRoles roles generiques" })
    }

    # CHECK 10 (GAP2): Sub-tasks + Variables liees
    if ($isComplexProgram) {
        $hasSubTasks = $content -match '<details>' -and $content -match 'Sous-taches'
        $hasVarsLiees = $content -match 'Variables liees'
        if ($hasSubTasks) {
            [void]$checks.Add([PSCustomObject]@{ check = "GAP2_SUBTASKS"; status = "PASS"; detail = "Liste sous-taches presente" })
        } else {
            [void]$checks.Add([PSCustomObject]@{ check = "GAP2_SUBTASKS"; status = "WARN"; detail = "Pas de sous-taches ($taskAnchors taches)" })
        }
        if ($hasVarsLiees) {
            [void]$checks.Add([PSCustomObject]@{ check = "GAP2_VARS_TASK"; status = "PASS"; detail = "Variables liees aux taches" })
        } else {
            [void]$checks.Add([PSCustomObject]@{ check = "GAP2_VARS_TASK"; status = "WARN"; detail = "Pas de variables liees" })
        }
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP2_SUBTASKS"; status = "PASS"; detail = "N/A (programme simple)" })
        [void]$checks.Add([PSCustomObject]@{ check = "GAP2_VARS_TASK"; status = "PASS"; detail = "N/A (programme simple)" })
    }

    # CHECK 11 (GAP3): Enriched business rules
    $hasRules = $content -match '## 4\. REGLES METIER'
    if ($hasRules) {
        $hasExprSource = $content -match 'Expression source'
        $hasExemple = $content -match '\*\*Exemple\*\*'
        $hasImpact = $content -match '\*\*Impact\*\*'
        $gap3Score = @($hasExprSource, $hasExemple, $hasImpact) | Where-Object { $_ } | Measure-Object | Select-Object -ExpandProperty Count
        if ($gap3Score -ge 2) {
            [void]$checks.Add([PSCustomObject]@{ check = "GAP3_ENRICHED_RULES"; status = "PASS"; detail = "$gap3Score/3 champs enrichis" })
        } else {
            [void]$checks.Add([PSCustomObject]@{ check = "GAP3_ENRICHED_RULES"; status = "WARN"; detail = "$gap3Score/3 champs enrichis seulement" })
        }
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP3_ENRICHED_RULES"; status = "PASS"; detail = "N/A (pas de regles)" })
    }

    # CHECK 12 (GAP4): No generic button actions
    # "Action declenchee" = old generic (FAIL), "Bouton fonctionnel" = unmatched fallback (WARN)
    $oldGenericBtns = ([regex]::Matches($content, 'Action declenchee')).Count
    $newFallbackBtns = ([regex]::Matches($content, 'Bouton fonctionnel')).Count
    if ($oldGenericBtns -eq 0 -and $newFallbackBtns -eq 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP4_BTN_ACTIONS"; status = "PASS"; detail = "Actions boutons specifiques" })
    } elseif ($oldGenericBtns -gt 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP4_BTN_ACTIONS"; status = "FAIL"; detail = "$oldGenericBtns 'Action declenchee' (ancien generique)" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP4_BTN_ACTIONS"; status = "WARN"; detail = "$newFallbackBtns boutons sans pattern reconnu" })
    }

    # CHECK 13 (GAP5): No MCP fallback
    $mcpFallback = ([regex]::Matches($content, 'Colonnes accessibles via MCP')).Count
    if ($mcpFallback -eq 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP5_COLUMNS"; status = "PASS"; detail = "Pas de fallback MCP" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP5_COLUMNS"; status = "FAIL"; detail = "$mcpFallback fallbacks MCP" })
    }

    # CHECK 14 (GAP6): No "Xx refs" in variables
    $genericRefs = ([regex]::Matches($content, '\|\s*\d+\s+refs\s*\|')).Count
    if ($genericRefs -eq 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP6_VAR_LINKS"; status = "PASS"; detail = "Variables avec contexte" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP6_VAR_LINKS"; status = "FAIL"; detail = "$genericRefs 'Xx refs' generiques" })
    }

    # CHECK 15 (GAP7): No generic migration
    $genericMigration = ([regex]::Matches($content, 'Traitement standard a migrer')).Count
    if ($genericMigration -eq 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP7_MIGRATION"; status = "PASS"; detail = "Migration concrete" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "GAP7_MIGRATION"; status = "FAIL"; detail = "$genericMigration blocs generiques" })
    }

    # ========================================
    # SECTION C: LINK INTEGRITY (16-17)
    # ========================================

    # CHECK 16: Internal anchor integrity
    $internalLinks = [regex]::Matches($content, '\[([^\]]+)\]\(#([^\)]+)\)')
    $anchors = [regex]::Matches($content, '<a id="([^"]+)">')
    $anchorIds = @($anchors | ForEach-Object { $_.Groups[1].Value })
    $brokenLinks = 0
    foreach ($link in $internalLinks) {
        $target = $link.Groups[2].Value
        if ($target -notin $anchorIds -and $target -notmatch '^http') {
            $brokenLinks++
        }
    }
    if ($brokenLinks -eq 0) {
        [void]$checks.Add([PSCustomObject]@{ check = "LINK_INTEGRITY"; status = "PASS"; detail = "Liens internes OK ($($internalLinks.Count) liens)" })
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "LINK_INTEGRITY"; status = "WARN"; detail = "$brokenLinks/$($internalLinks.Count) liens internes casses" })
    }

    # CHECK 17: Mermaid syntax (basic validation)
    $mermaidBlocks = [regex]::Matches($content, '(?s)```mermaid\r?\n(.*?)```')
    $mermaidOk = $true
    foreach ($block in $mermaidBlocks) {
        $mBody = $block.Groups[1].Value
        if ($mBody -match '<br/?>') { $mermaidOk = $false }
    }
    if ($mermaidBlocks.Count -gt 0) {
        if ($mermaidOk) {
            [void]$checks.Add([PSCustomObject]@{ check = "MERMAID_SYNTAX"; status = "PASS"; detail = "$($mermaidBlocks.Count) diagrammes valides" })
        } else {
            [void]$checks.Add([PSCustomObject]@{ check = "MERMAID_SYNTAX"; status = "WARN"; detail = "Syntaxe Mermaid suspecte" })
        }
    } else {
        [void]$checks.Add([PSCustomObject]@{ check = "MERMAID_SYNTAX"; status = "WARN"; detail = "Aucun diagramme Mermaid" })
    }

    # ========================================
    # COMPUTE RESULTS
    # ========================================

    $passCount = @($checks | Where-Object { $_.status -eq "PASS" }).Count
    $failCount = @($checks | Where-Object { $_.status -eq "FAIL" }).Count
    $warnCount = @($checks | Where-Object { $_.status -eq "WARN" }).Count
    $totalChecks = $checks.Count

    if (-not $Quiet) {
        Write-Host ""
        foreach ($r in $checks) {
            $icon = switch ($r.status) { "PASS" { "[OK]" } "FAIL" { "[KO]" } "WARN" { "[!!]" } }
            $color = switch ($r.status) { "PASS" { "Green" } "FAIL" { "Red" } "WARN" { "Yellow" } }
            Write-Host "  $icon $($r.check): $($r.detail)" -ForegroundColor $color
        }
        Write-Host ""
        $rate = if ($totalChecks -gt 0) { [math]::Round($passCount / $totalChecks * 100, 0) } else { 0 }
        $color = if ($failCount -gt 0) { "Red" } elseif ($warnCount -gt 0) { "Yellow" } else { "Green" }
        Write-Host "  RESULTAT: $passCount PASS | $failCount FAIL | $warnCount WARN ($rate%)" -ForegroundColor $color
    }

    return [PSCustomObject]@{
        file = $fileName
        total = $totalChecks
        pass = $passCount
        fail = $failCount
        warn = $warnCount
        checks = $checks
    }
}

# ============================================================
# MAIN
# ============================================================

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "    VALIDATION CONTENU V7.2 - 17 CRITERES SYSTEMATIQUES        " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$allResults = [System.Collections.ArrayList]::new()

if ($SpecFile) {
    $result = Test-SpecV72 -FilePath $SpecFile
    if ($result) { [void]$allResults.Add($result) }
}
elseif ($SpecDir) {
    $specFiles = Get-ChildItem -Path $SpecDir -Filter "*.md" | Where-Object { $_.Name -notmatch '-summary\.md$' -and $_.Name -match '^[A-Z]+-IDE-\d+\.md$' }
    Write-Host "`nSpecs a valider: $($specFiles.Count)" -ForegroundColor White

    foreach ($f in $specFiles) {
        $result = Test-SpecV72 -FilePath $f.FullName
        if ($result) {
            [void]$allResults.Add($result)
            if ($StopOnFailure -and $result.fail -gt 0) {
                Write-Host "`n[STOP] Echec detecte sur $($f.Name)" -ForegroundColor Red
                break
            }
        }
    }
}
else {
    Write-Host "[ERROR] Specifiez -SpecFile ou -SpecDir" -ForegroundColor Red
    exit 1
}

# ============================================================
# SUMMARY
# ============================================================

if ($allResults.Count -gt 1) {
    Write-Host "`n=================================================================" -ForegroundColor Cyan
    Write-Host "                    SYNTHESE BATCH                              " -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan

    $totalPass = ($allResults | Measure-Object -Property pass -Sum).Sum
    $totalFail = ($allResults | Measure-Object -Property fail -Sum).Sum
    $totalWarn = ($allResults | Measure-Object -Property warn -Sum).Sum
    $totalChecksAll = ($allResults | Measure-Object -Property total -Sum).Sum

    Write-Host "`n  Specs validees: $($allResults.Count)"
    Write-Host "  Checks totaux:  $totalChecksAll"
    Write-Host "  PASS: $totalPass | FAIL: $totalFail | WARN: $totalWarn" -ForegroundColor $(if ($totalFail -gt 0) { "Red" } elseif ($totalWarn -gt 0) { "Yellow" } else { "Green" })

    $failedSpecs = @($allResults | Where-Object { $_.fail -gt 0 })
    if ($failedSpecs.Count -gt 0) {
        Write-Host "`n  SPECS EN ECHEC:" -ForegroundColor Red
        foreach ($fs in $failedSpecs) {
            $failedChecks = ($fs.checks | Where-Object { $_.status -eq "FAIL" } | ForEach-Object { $_.check }) -join ", "
            Write-Host "    - $($fs.file): $failedChecks" -ForegroundColor Red
        }
    }
}

# JSON output
if ($OutputJson -and $allResults.Count -gt 0) {
    $jsonReport = [PSCustomObject]@{
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        pipeline_version = "7.2"
        specs_validated = $allResults.Count
        results = @($allResults)
    }
    $jsonPath = if ($SpecFile) {
        $SpecFile -replace '\.md$', '-validation.json'
    } else {
        Join-Path $SpecDir "validation-report.json"
    }
    $jsonReport | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8
    Write-Host "`n  Rapport JSON: $jsonPath" -ForegroundColor Green
}

$exitCode = if (@($allResults | Where-Object { $_.fail -gt 0 }).Count -gt 0) { 1 } else { 0 }
exit $exitCode
