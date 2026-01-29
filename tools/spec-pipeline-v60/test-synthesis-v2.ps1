# test-synthesis-v2.ps1 - Validation tests for Phase5-Synthesis.ps1 V2
# Validates ALL 9 sections of decisions against generated specs
# Test programs: ADH IDE 237 (complex) + ADH IDE 121 (simple)

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$SpecsPath = Join-Path $ProjectRoot ".openspec\specs"

# ============================================================
# TEST FRAMEWORK
# ============================================================
$global:passCount = 0
$global:failCount = 0
$global:testResults = @()

function Assert-True {
    param([bool]$Condition, [string]$Name)
    if ($Condition) {
        $global:passCount++
        $global:testResults += @{ name = $Name; status = "PASS" }
        if ($Verbose) { Write-Host "  [PASS] $Name" -ForegroundColor Green }
    } else {
        $global:failCount++
        $global:testResults += @{ name = $Name; status = "FAIL" }
        Write-Host "  [FAIL] $Name" -ForegroundColor Red
    }
}

function Assert-Contains {
    param([string]$Content, [string]$Pattern, [string]$Name)
    $found = $Content -match [regex]::Escape($Pattern)
    Assert-True $found $Name
}

function Assert-Regex {
    param([string]$Content, [string]$Pattern, [string]$Name)
    $found = $Content -match $Pattern
    Assert-True $found $Name
}

function Assert-NotContains {
    param([string]$Content, [string]$Pattern, [string]$Name)
    $found = $Content -match [regex]::Escape($Pattern)
    Assert-True (-not $found) $Name
}

function Assert-GreaterOrEqual {
    param([int]$Actual, [int]$Expected, [string]$Name)
    Assert-True ($Actual -ge $Expected) "$Name (actual: $Actual, expected: >= $Expected)"
}

# ============================================================
# LOAD TEST DATA
# ============================================================
Write-Host "=== Loading test data ===" -ForegroundColor Cyan

# IDE 237 - Complex program
$spec237Path = Join-Path $SpecsPath "ADH-IDE-237.md"
$summary237Path = Join-Path $SpecsPath "ADH-IDE-237-summary.md"
$quality237Path = Join-Path $ScriptDir "output\ADH-IDE-237\quality.json"
$discovery237Path = Join-Path $ScriptDir "output\ADH-IDE-237\discovery.json"
$mapping237Path = Join-Path $ScriptDir "output\ADH-IDE-237\mapping.json"
$decoded237Path = Join-Path $ScriptDir "output\ADH-IDE-237\decoded.json"
$uiForms237Path = Join-Path $ScriptDir "output\ADH-IDE-237\ui_forms.json"

# IDE 121 - Simpler program
$spec121Path = Join-Path $SpecsPath "ADH-IDE-121.md"
$quality121Path = Join-Path $ScriptDir "output\ADH-IDE-121\quality.json"

# Load files
$spec237 = Get-Content $spec237Path -Raw
$summary237 = Get-Content $summary237Path -Raw
$quality237 = Get-Content $quality237Path -Raw | ConvertFrom-Json
$discovery237 = Get-Content $discovery237Path -Raw | ConvertFrom-Json
$mapping237 = Get-Content $mapping237Path -Raw | ConvertFrom-Json
$decoded237 = Get-Content $decoded237Path -Raw | ConvertFrom-Json
$uiForms237 = Get-Content $uiForms237Path -Raw | ConvertFrom-Json
$spec121 = Get-Content $spec121Path -Raw
$quality121 = Get-Content $quality121Path -Raw | ConvertFrom-Json

Write-Host "  Loaded IDE 237 spec ($($spec237.Length) chars)"
Write-Host "  Loaded IDE 121 spec ($($spec121.Length) chars)"
Write-Host ""

# ============================================================
# SECTION 1: IDENTIFICATION
# ============================================================
Write-Host "=== Section 1: IDENTIFICATION ===" -ForegroundColor Yellow

Assert-Contains $spec237 "## 1. IDENTIFICATION" "S1: Section header exists"
Assert-Contains $spec237 "| Pipeline | V6.0 |" "S1: Pipeline version line"
Assert-Regex $spec237 "Complexite \| \*\*HAUTE\*\*" "S1: Complexite line with level"
Assert-Regex $spec237 "\(85/100\)" "S1: Complexity score"
Assert-Contains $spec237 "Menu caisse GM - scroll (IDE 163)" "S1: Enriched Raison with program names"
Assert-Contains $spec237 "Menu Choix Saisie/Annul vente (IDE 242)" "S1: Second caller name in Raison"
Assert-Contains $spec237 "### Criteres Orphelin" "S1: Orphan criteria table"
Assert-Contains $spec237 "| Callers directs | OUI (3 callers) |" "S1: Callers criteria"
Assert-Contains $spec237 "| Public Name |" "S1: Public Name criteria"
Assert-Contains $spec237 "| Membre ECF |" "S1: ECF criteria"

Write-Host ""

# ============================================================
# SECTION 2: OBJECTIF METIER
# ============================================================
Write-Host "=== Section 2: OBJECTIF METIER ===" -ForegroundColor Yellow

# 2.1 Description from forms
Assert-Contains $spec237 "Programme comprenant 14 ecran(s) visible(s)" "S2.1: Description generated from forms count"
Assert-NotContains $spec237 "Programme de gestion des transactions et operations metier" "S2.1: No generic description"

# 2.2 Fonctionnalites from visible forms (width > 0)
Assert-Contains $spec237 "### Fonctionnalites principales" "S2.2: Fonctionnalites section"
Assert-Contains $spec237 "Saisie transaction" "S2.2: First visible form"
Assert-Contains $spec237 "1112x279" "S2.2: Dimensions shown"
Assert-Contains $spec237 "Saisie Bilaterale" "S2.2: Multiple forms shown"

# 2.3 Tables by access - ALL tables, no truncation
Assert-Contains $spec237 "#### Tables liees (LINK) - 18 tables" "S2.3: ALL 18 LINK tables (was 15)"
Assert-Contains $spec237 "#### Tables modifiees (WRITE) - 9 tables" "S2.3: 9 WRITE tables"
Assert-Contains $spec237 "#### Tables lues (READ) - 13 tables" "S2.3: 13 READ tables"

# Count actual LINK tables listed
$linkSection = ($spec237 -split "#### Tables liees \(LINK\)")[1]
$linkSection = ($linkSection -split "###")[0]
$linkTableCount = ([regex]::Matches($linkSection, "^- ``", [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count
Assert-GreaterOrEqual $linkTableCount 18 "S2.3: At least 18 LINK tables rendered"

# 2.4 Rules - Dual format, no truncation
Assert-Contains $spec237 "### Regles metier (17 regles)" "S2.4: All 17 rules shown"
Assert-Regex $spec237 "\*\*\[RM-001\]\*\*" "S2.4: Rule ID format"
Assert-Contains $spec237 "Si Trim(W0 service village" "S2.4: Natural language present"
# Note: "..." can appear legitimately in Magic variable names (e.g. "W0 Retour Transmission... [DY]")
# Instead of checking for "...", verify no rule is truncated to 80 chars (old bug)
$rulesSection = ($spec237 -split "### Regles metier")[1]
$rulesSection = ($rulesSection -split "###")[0]
$ruleLines = $rulesSection -split "`n" | Where-Object { $_ -match "^\- \*\*\[RM-" }
$truncatedRules = @($ruleLines | Where-Object { $_ -match '``[^`]{77}\.\.\.``' })
Assert-True ($truncatedRules.Count -eq 0) "S2.4: No rules truncated to 80 chars (old pipeline bug)"

# 2.5 Context - ALL callees
Assert-Contains $spec237 "### Contexte d'utilisation" "S2.5: Context section"
# Use regex on full content to find callees line (avoids \r\n split issues)
$calleesMatch = [regex]::Match($spec237, "- \*\*Appelle\*\*: (.+)")
if ($calleesMatch.Success) {
    $calleesText = $calleesMatch.Groups[1].Value
    $ideCount = ([regex]::Matches($calleesText, "IDE \d+")).Count
    Assert-GreaterOrEqual $ideCount 15 "S2.5: At least 15 callees in context (no limit)"
} else {
    Assert-True $false "S2.5: At least 15 callees in context (no limit) - Appelle line not found"
}

Write-Host ""

# ============================================================
# SECTION 3: MODELE DE DONNEES
# ============================================================
Write-Host "=== Section 3: MODELE DE DONNEES ===" -ForegroundColor Yellow

Assert-Contains $spec237 "## 3. MODELE DE DONNEES" "S3: Section header"
Assert-Contains $spec237 "### Tables (30 tables uniques)" "S3: Unified table with 30 unique tables"
Assert-Contains $spec237 "| R | W | L | Type |" "S3: R/W/L columns in header"

# Check specific table entries
Assert-Regex $spec237 "\| 23 \| reseau_cloture___rec .* R \| W \|" "S3: Table 23 has R+W"
Assert-Regex $spec237 "\| 34 \| hebergement______heb .* L \|" "S3: Table 34 has L only"

# Storage type indicator
Assert-Contains $spec237 "| Database |" "S3: Database storage type"
Assert-Contains $spec237 "| Temp |" "S3: Temp storage type (% prefix)"
Assert-Contains $spec237 "| Memory |" "S3: Memory storage type (empty physical)"

# No separate WRITE/READ/LINK sections in Section 3 (unified)
$section3 = ($spec237 -split "## 3\. MODELE")[1]
$section3 = ($section3 -split "## 4\.")[0]
Assert-NotContains $section3 "#### WRITE" "S3: No separate WRITE subsection"
Assert-NotContains $section3 "#### READ" "S3: No separate READ subsection"

Write-Host ""

# ============================================================
# SECTION 4: VARIABLES ET PARAMETRES
# ============================================================
Write-Host "=== Section 4: VARIABLES ET PARAMETRES ===" -ForegroundColor Yellow

Assert-Contains $spec237 "## 4. VARIABLES ET PARAMETRES" "S4: Section header"
Assert-Contains $spec237 "### Variables Mapping (171 entrees)" "S4: ALL 171 mappings (was 50)"

# Category column
Assert-Contains $spec237 "| Cat | Ref Expression | Lettre | Nom Variable | Type |" "S4: Category + Type columns"

# Check categories present
Assert-Regex $spec237 "\| P0 \|" "S4: P0 category present"
Assert-Regex $spec237 "\| W0 \|" "S4: W0 category present"
Assert-Regex $spec237 "\| V\. \|" "S4: V. category present"

# Check data types
Assert-Contains $spec237 "| Alpha |" "S4: Alpha data type"
Assert-Contains $spec237 "| Numeric |" "S4: Numeric data type"
Assert-Contains $spec237 "| Date |" "S4: Date data type"
Assert-Contains $spec237 "| Logical |" "S4: Logical data type"

# Count variable rows (lines starting with | P0|W0|V.|Autre)
$section4 = ($spec237 -split "## 4\. VARIABLES")[1]
$section4 = ($section4 -split "## 5\.")[0]
$varRows = ([regex]::Matches($section4, "^\| (P0|W0|V\.|VG|Autre) \|", [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count
Assert-GreaterOrEqual $varRows 170 "S4: At least 170 variable rows rendered"

Write-Host ""

# ============================================================
# SECTION 5: LOGIQUE METIER
# ============================================================
Write-Host "=== Section 5: LOGIQUE METIER ===" -ForegroundColor Yellow

Assert-Contains $spec237 "## 5. LOGIQUE METIER" "S5: Section header"
Assert-Contains $spec237 "### Algorigramme" "S5.1: Algorigramme present"
Assert-Contains $spec237 "flowchart TD" "S5.1: Flowchart TD format"

# Expressions by type - ALL, no truncation
Assert-Regex $spec237 "### Expressions \(305 / 305" "S5.2: All 305 expressions"
Assert-Contains $spec237 "#### CONDITION" "S5.2: CONDITION type group"
Assert-Contains $spec237 "#### CALCULATION" "S5.2: CALCULATION type group"
Assert-Contains $spec237 "#### CONSTANT" "S5.2: CONSTANT type group"
Assert-Contains $spec237 "#### OTHER" "S5.2: OTHER type group"

# No truncation in expressions
$exprSection = ($spec237 -split "### Expressions")[1]
$exprSection = ($exprSection -split "## 6\.")[0]
# Check no "..." truncation in expression cells
$truncatedExprs = ([regex]::Matches($exprSection, '``[^`]+\.\.\.[^`]*``')).Count
Assert-True ($truncatedExprs -eq 0) "S5.2: No truncated expressions (no '...' in backticks)"

# No duplicate rules section (rules are in section 2, not section 5)
$section5 = ($spec237 -split "## 5\. LOGIQUE")[1]
$section5 = ($section5 -split "## 6\.")[0]
Assert-NotContains $section5 "### Regles Metier" "S5: No duplicate rules in section 5"

Write-Host ""

# ============================================================
# SECTION 6: INTERFACE UTILISATEUR
# ============================================================
Write-Host "=== Section 6: INTERFACE UTILISATEUR ===" -ForegroundColor Yellow

Assert-Contains $spec237 "## 6. INTERFACE UTILISATEUR" "S6: Section header"
Assert-Regex $spec237 "### Forms Visibles \(14 / 49 total\)" "S6.1: Visible forms count"
Assert-Contains $spec237 "### Toutes les Forms (49)" "S6.2: All forms list"
Assert-Contains $spec237 "### Mockup" "S6.3: Mockup section present"

# Verify only visible forms in mockup (width > 0)
$mockupSection = ($spec237 -split "### Mockup")[1]
$mockupSection = ($mockupSection -split "## 7\.")[0]
Assert-NotContains $mockupSection "0x0" "S6.3: No 0x0 dimensions in mockup"

# IDE 121 - should show 2 visible forms (both are MDI with dimensions)
Assert-Regex $spec121 "### Forms Visibles \(2 / 32 total\)" "S6-121: IDE 121 shows 2 visible MDI forms"

Write-Host ""

# ============================================================
# SECTION 7: GRAPHE D'APPELS
# ============================================================
Write-Host "=== Section 7: GRAPHE D'APPELS ===" -ForegroundColor Yellow

Assert-Contains $spec237 "## 7. GRAPHE D'APPELS" "S7: Section header"
Assert-Contains $spec237 "### 7.1 Chaine depuis Main (Callers)" "S7.1: Callers diagram section"
Assert-Contains $spec237 "### 7.3 Callees (Qui j'appelle)" "S7.3: Callees diagram section"

# 2 separate Mermaid diagrams
$section7 = ($spec237 -split "## 7\. GRAPHE")[1]
$section7 = ($section7 -split "## 8\.")[0]
$mermaidCount = ([regex]::Matches($section7, "graph LR")).Count
Assert-GreaterOrEqual $mermaidCount 2 "S7: At least 2 separate Mermaid diagrams"

# No truncated names in Mermaid (no "..." in node labels)
Assert-True (-not ($section7 -match '\[.*\.\.\.\]')) "S7: No truncated names in Mermaid nodes"

# Full callees table
Assert-Contains $spec237 "### 7.4 Callees Detail" "S7.4: Callees detail table"
$calleeTable = ($spec237 -split "### 7\.4 Callees")[1]
$calleeTable = ($calleeTable -split "## 8\.")[0]
$calleeRows = ([regex]::Matches($calleeTable, "^\| \d+", [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count
Assert-GreaterOrEqual $calleeRows 20 "S7.4: All 20 callees in detail table"

Write-Host ""

# ============================================================
# SECTION 8: STATISTIQUES
# ============================================================
Write-Host "=== Section 8: STATISTIQUES ===" -ForegroundColor Yellow

Assert-Contains $spec237 "## 8. STATISTIQUES" "S8: Section header"
Assert-Contains $spec237 "| Tables LINK |" "S8: LINK count present"
Assert-Contains $spec237 "| Forms (total) |" "S8: Forms metric"
Assert-Contains $spec237 "| Forms Visibles |" "S8: Visible forms metric"
Assert-Contains $spec237 "| Variables Mappees |" "S8: Variables metric"
Assert-Regex $spec237 "Ratio lignes actives" "S8: Active lines ratio"
Assert-Regex $spec237 "Ratio lignes desactivees" "S8: Disabled lines ratio"
Assert-Regex $spec237 "Couverture expressions" "S8: Expression coverage"

Write-Host ""

# ============================================================
# SECTION 9: NOTES MIGRATION
# ============================================================
Write-Host "=== Section 9: NOTES MIGRATION ===" -ForegroundColor Yellow

Assert-Contains $spec237 "## 9. NOTES MIGRATION" "S9: Section header"
Assert-Regex $spec237 "### Complexite Estimee: \*\*HAUTE\*\* \(85/100\)" "S9.1: Composite score"
Assert-Contains $spec237 "| Critere | Score | Detail |" "S9.1: Score breakdown table"
Assert-Contains $spec237 "Expressions: 305" "S9.1: Expression score detail"
Assert-Contains $spec237 "Taches: 49" "S9.1: Task score detail"
Assert-Contains $spec237 "Tables WRITE: 9" "S9.1: Write table score detail"
Assert-Contains $spec237 "### Recommandations Migration" "S9.3: Recommendations section"
Assert-Contains $spec237 "Decomposer" "S9.3: High complexity recommendation"

# IDE 121 should have MOYENNE complexity
Assert-Regex $spec121 "Complexite Estimee: \*\*MOYENNE\*\*" "S9-121: IDE 121 has MOYENNE complexity"

Write-Host ""

# ============================================================
# QUALITY.JSON VALIDATION
# ============================================================
Write-Host "=== Quality JSON Validation ===" -ForegroundColor Yellow

Assert-True ($quality237.quality_score -eq 100) "Q: Quality score = 100"
Assert-True ($quality237.validation.tables_unified_count -eq 30) "Q: Tables unified = 30"
Assert-True ($quality237.validation.variables_mapped_count -eq 171) "Q: Variables mapped = 171"
Assert-True ($quality237.validation.visible_forms_count -eq 14) "Q: Visible forms = 14"
Assert-True ($quality237.validation.business_rules_count -eq 17) "Q: Business rules = 17"
Assert-True ($quality237.validation.callees_shown -eq 20) "Q: Callees shown = 20 (ALL)"
Assert-True ($quality237.validation.all_tables_no_truncation -eq $true) "Q: No table truncation flag"
Assert-True ($quality237.validation.all_variables_no_truncation -eq $true) "Q: No variable truncation flag"
Assert-True ($quality237.validation.all_expressions_no_truncation -eq $true) "Q: No expression truncation flag"
Assert-True ($quality237.validation.all_callees_no_truncation -eq $true) "Q: No callee truncation flag"
Assert-True ($quality237.complexity.level -eq "HAUTE") "Q: Complexity level = HAUTE"
Assert-True ($quality237.complexity.score -eq 85) "Q: Complexity score = 85"

Write-Host ""

# ============================================================
# CROSS-PROGRAM VALIDATION (IDE 121)
# ============================================================
Write-Host "=== Cross-Program: IDE 121 ===" -ForegroundColor Yellow

Assert-Contains $spec121 "## 1. IDENTIFICATION" "S1-121: Section 1 exists"
Assert-Contains $spec121 "Gestion caisse" "S1-121: Program name"
Assert-Contains $spec121 "| Pipeline | V6.0 |" "S1-121: Pipeline version"
Assert-Contains $spec121 "### Criteres Orphelin" "S1-121: Orphan criteria"

# IDE 121 has forms but most are invisible (width=0), only 2 with dimensions
Assert-Contains $spec121 "### Tables (" "S3-121: Unified tables"
Assert-Contains $spec121 "## 5. LOGIQUE METIER" "S5-121: Section 5 exists"
Assert-Contains $spec121 "## 7. GRAPHE D'APPELS" "S7-121: Section 7 exists"
Assert-Contains $spec121 "## 8. STATISTIQUES" "S8-121: Section 8 exists"
Assert-Contains $spec121 "## 9. NOTES MIGRATION" "S9-121: Section 9 exists"
Assert-True ($quality121.quality_score -eq 100) "Q-121: Quality score = 100"

Write-Host ""

# ============================================================
# STRUCTURAL VALIDATION
# ============================================================
Write-Host "=== Structural Validation ===" -ForegroundColor Yellow

# TAB markers
Assert-Contains $spec237 "<!-- TAB:Fonctionnel -->" "Struct: TAB Fonctionnel marker"
Assert-Contains $spec237 "<!-- TAB:Technique -->" "Struct: TAB Technique marker"
Assert-Contains $spec237 "<!-- TAB:Cartographie -->" "Struct: TAB Cartographie marker"

# All 9 sections
Assert-Contains $spec237 "## 1. IDENTIFICATION" "Struct: Section 1"
Assert-Contains $spec237 "## 2. OBJECTIF METIER" "Struct: Section 2"
Assert-Contains $spec237 "## 3. MODELE DE DONNEES" "Struct: Section 3"
Assert-Contains $spec237 "## 4. VARIABLES ET PARAMETRES" "Struct: Section 4"
Assert-Contains $spec237 "## 5. LOGIQUE METIER" "Struct: Section 5"
Assert-Contains $spec237 "## 6. INTERFACE UTILISATEUR" "Struct: Section 6"
Assert-Contains $spec237 "## 7. GRAPHE D'APPELS" "Struct: Section 7"
Assert-Contains $spec237 "## 8. STATISTIQUES" "Struct: Section 8"
Assert-Contains $spec237 "## 9. NOTES MIGRATION" "Struct: Section 9"

# No remnants of old bugs
Assert-NotContains $spec237 "Select-Object -First 15" "NoBug: No First 15 truncation"
Assert-NotContains $spec237 "Select-Object -First 50" "NoBug: No First 50 truncation"
Assert-NotContains $spec237 "Programme de gestion des transactions et operations metier" "NoBug: No generic description"

Write-Host ""

# ============================================================
# RESULTS
# ============================================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "RESULTS: $($global:passCount) PASSED, $($global:failCount) FAILED" -ForegroundColor $(if ($global:failCount -eq 0) { "Green" } else { "Red" })
Write-Host "============================================" -ForegroundColor Cyan

if ($global:failCount -gt 0) {
    Write-Host ""
    Write-Host "FAILURES:" -ForegroundColor Red
    $global:testResults | Where-Object { $_.status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.name)" -ForegroundColor Red
    }
}

Write-Host ""
return @{
    passed = $global:passCount
    failed = $global:failCount
    total = $global:passCount + $global:failCount
}
