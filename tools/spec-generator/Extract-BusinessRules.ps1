#Requires -Version 5.1
<#
.SYNOPSIS
    Extract business rules from Magic program expressions

.DESCRIPTION
    Analyzes decoded expressions to identify potential business rules:
    - IF conditions that validate data
    - CASE statements for business logic
    - Comparison operators for thresholds/limits
    - Error handling patterns

    Results are stored in the KB business_rules table and can be
    used to enrich functional specifications.

.PARAMETER Project
    Project code (ADH, PBP, PVE, VIL, etc.)

.PARAMETER IDE
    IDE position number (1-indexed as shown in Magic IDE)

.PARAMETER SaveToKb
    Save extracted rules to Knowledge Base

.PARAMETER OutputYaml
    Generate YAML annotation file with extracted rules

.EXAMPLE
    .\Extract-BusinessRules.ps1 -Project ADH -IDE 238

.EXAMPLE
    .\Extract-BusinessRules.ps1 -Project ADH -IDE 238 -SaveToKb -OutputYaml
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IDE,

    [switch]$SaveToKb,

    [switch]$OutputYaml,

    [string]$KbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"
)

$ErrorActionPreference = "Stop"
$projectRoot = "D:\Projects\Lecteur_Magic"
$projectsPath = "D:\Data\Migration\XPA\PMS"

Write-Host "=== Extract Business Rules ===" -ForegroundColor Cyan
Write-Host "Project: $Project | IDE: $IDE" -ForegroundColor Cyan

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Get-KbData {
    param([string]$Query, [string]$DbPath)
    $result = sqlite3 $DbPath $Query 2>&1
    if ($LASTEXITCODE -ne 0) { return $null }
    return $result
}

function Get-RuleType {
    param([string]$Expression)

    if ($Expression -match '^IF\s*\(') { return "CONDITIONAL" }
    if ($Expression -match '^CASE\s*\(') { return "SWITCH" }
    if ($Expression -match '(>=|<=|>|<|=)\s*\d+') { return "VALIDATION" }
    if ($Expression -match 'ISEMPTY|ISNULL|LEN\s*\(') { return "PRESENCE" }
    if ($Expression -match 'ERR|WARN|MSG') { return "ERROR_HANDLING" }
    if ($Expression -match 'DBDEL|DBRECS|DBUPD') { return "DATA_INTEGRITY" }

    return "UNKNOWN"
}

function Get-RuleSeverity {
    param([string]$Expression, [string]$RuleType)

    # High severity for data modification checks
    if ($Expression -match 'DELETE|UPDATE|INSERT') { return "HIGH" }
    if ($RuleType -eq "DATA_INTEGRITY") { return "HIGH" }

    # Medium for validation
    if ($RuleType -eq "VALIDATION" -or $RuleType -eq "PRESENCE") { return "MEDIUM" }

    # Low for display logic
    if ($Expression -match 'FONT|COLOR|VISIBLE') { return "LOW" }

    return "MEDIUM"
}

function Extract-RuleDescription {
    param([string]$Expression)

    # Try to generate a human-readable description
    $desc = $Expression

    # Clean up common patterns
    $desc = $desc -replace '\s+', ' '
    $desc = $desc -replace 'IF\s*\(\s*', 'SI '
    $desc = $desc -replace '\s*,\s*', ' ALORS '
    $desc = $desc -replace 'ISEMPTY\s*\(([^)]+)\)', '$1 est vide'
    $desc = $desc -replace 'LEN\s*\(([^)]+)\)\s*=\s*0', '$1 est vide'
    $desc = $desc -replace '>=', ' >= '
    $desc = $desc -replace '<=', ' <= '
    $desc = $desc -replace '(\w+)\s*=\s*0', '$1 egal a zero'
    $desc = $desc -replace '(\w+)\s*>\s*0', '$1 positif'

    if ($desc.Length -gt 100) {
        $desc = $desc.Substring(0, 97) + "..."
    }

    return $desc
}

# ============================================================================
# STEP 1: Load program expressions
# ============================================================================
Write-Host "`n[1/4] Loading expressions..." -ForegroundColor Yellow

$expressions = @()

# Try KB first
if (Test-Path $KbPath) {
    $specQuery = "SELECT id FROM program_specs WHERE project='$Project' AND ide_position=$IDE;"
    $specId = Get-KbData -Query $specQuery -DbPath $KbPath

    if ($specId) {
        # Get decoded expressions from cache
        $exprQuery = @"
SELECT de.expression_id, de.raw_expression, de.decoded_text
FROM decoded_expressions de
JOIN programs p ON de.program_id = p.id
WHERE de.project = '$Project' AND p.ide_position = $IDE;
"@
        $exprData = Get-KbData -Query $exprQuery -DbPath $KbPath

        if ($exprData) {
            foreach ($line in $exprData) {
                $parts = $line -split '\|'
                if ($parts.Count -ge 3) {
                    $expressions += [PSCustomObject]@{
                        ID = $parts[0]
                        Raw = $parts[1]
                        Decoded = $parts[2]
                    }
                }
            }
        }
    }
}

# Fallback to XML if KB doesn't have decoded expressions
if ($expressions.Count -eq 0) {
    Write-Host "  Loading from XML source..." -ForegroundColor DarkYellow

    $progsPath = "$projectsPath\$Project\Source\Progs.xml"
    if (Test-Path $progsPath) {
        [xml]$progs = Get-Content $progsPath -Encoding UTF8
        $programs = $progs.Application.ProgramsRepositoryOutLine.Programs.Program
        $progId = $programs[$IDE - 1].id
        $prgFile = "$projectsPath\$Project\Source\Prg_$progId.xml"

        if (Test-Path $prgFile) {
            [xml]$prg = Get-Content $prgFile -Encoding UTF8
            $exprNodes = $prg.SelectNodes("//Expressions/Expression")

            foreach ($expr in $exprNodes) {
                $exprId = $expr.id
                $exprSyntax = $expr.ExpSyntax.val
                if ($exprSyntax) {
                    $expressions += [PSCustomObject]@{
                        ID = $exprId
                        Raw = $exprSyntax
                        Decoded = $exprSyntax  # Raw only without decoding
                    }
                }
            }
        }
    }
}

Write-Host "  Found $($expressions.Count) expressions" -ForegroundColor Green

# ============================================================================
# STEP 2: Identify business rule candidates
# ============================================================================
Write-Host "`n[2/4] Identifying business rules..." -ForegroundColor Yellow

$rules = @()
$ruleIndex = 1

foreach ($expr in $expressions) {
    $decoded = if ($expr.Decoded) { $expr.Decoded } else { $expr.Raw }

    # Skip simple expressions that are unlikely to be rules
    if ($decoded.Length -lt 10) { continue }
    if ($decoded -match '^\s*\d+\s*$') { continue }  # Just a number
    if ($decoded -match '^[A-Za-z_]+$') { continue } # Just a variable name

    # Check for rule patterns
    $isRule = $false
    $ruleType = "UNKNOWN"

    # Pattern 1: IF conditions
    if ($decoded -match 'IF\s*\(') {
        $isRule = $true
        $ruleType = Get-RuleType -Expression $decoded
    }

    # Pattern 2: CASE statements
    if ($decoded -match 'CASE\s*\(') {
        $isRule = $true
        $ruleType = "SWITCH"
    }

    # Pattern 3: Comparison with thresholds
    if ($decoded -match '(>=|<=|>|<)\s*\d+') {
        $isRule = $true
        $ruleType = "VALIDATION"
    }

    # Pattern 4: Empty/null checks
    if ($decoded -match 'ISEMPTY|ISNULL') {
        $isRule = $true
        $ruleType = "PRESENCE"
    }

    if ($isRule) {
        $rules += [PSCustomObject]@{
            Code = "RM-$('{0:D3}' -f $ruleIndex)"
            ExpressionId = $expr.ID
            RawExpression = $expr.Raw
            DecodedExpression = $decoded
            RuleType = $ruleType
            Severity = Get-RuleSeverity -Expression $decoded -RuleType $ruleType
            Description = Extract-RuleDescription -Expression $decoded
            IsValidated = $false
        }
        $ruleIndex++
    }
}

Write-Host "  Identified $($rules.Count) potential business rules" -ForegroundColor Green

# Group by type
$rulesByType = $rules | Group-Object RuleType
foreach ($group in $rulesByType) {
    Write-Host "    - $($group.Name): $($group.Count)"
}

# ============================================================================
# STEP 3: Save to KB if requested
# ============================================================================
if ($SaveToKb -and (Test-Path $KbPath) -and $rules.Count -gt 0) {
    Write-Host "`n[3/4] Saving to Knowledge Base..." -ForegroundColor Yellow

    # Get spec_id
    $specIdQuery = "SELECT id FROM program_specs WHERE project='$Project' AND ide_position=$IDE;"
    $specId = Get-KbData -Query $specIdQuery -DbPath $KbPath

    if ($specId) {
        # Delete existing rules for this spec
        sqlite3 $KbPath "DELETE FROM business_rules WHERE spec_id=$specId;" 2>$null

        # Insert new rules
        foreach ($rule in $rules) {
            $desc = $rule.Description -replace "'", "''"
            $decoded = $rule.DecodedExpression -replace "'", "''"

            $insertQuery = @"
INSERT INTO business_rules (spec_id, expression_id, rule_code, rule_description, condition_decoded, severity, is_validated)
VALUES ($specId, $($rule.ExpressionId), '$($rule.Code)', '$desc', '$decoded', '$($rule.Severity)', 0);
"@
            sqlite3 $KbPath $insertQuery 2>$null
        }

        Write-Host "  Saved $($rules.Count) rules to KB" -ForegroundColor Green
    } else {
        Write-Warning "Spec not found in KB for $Project IDE $IDE"
    }
} else {
    Write-Host "`n[3/4] KB save skipped (use -SaveToKb to enable)" -ForegroundColor DarkYellow
}

# ============================================================================
# STEP 4: Generate YAML output if requested
# ============================================================================
if ($OutputYaml) {
    Write-Host "`n[4/4] Generating YAML annotation..." -ForegroundColor Yellow

    $annotationPath = "$projectRoot\.openspec\annotations"
    if (-not (Test-Path $annotationPath)) {
        New-Item -ItemType Directory -Path $annotationPath -Force | Out-Null
    }

    $yamlFile = "$annotationPath\$Project-IDE-$IDE.yaml"

    # Check if file exists - only update business_rules section
    if (Test-Path $yamlFile) {
        Write-Host "  Annotation file exists - would need merge" -ForegroundColor DarkYellow
    } else {
        # Generate new file from template
        $templatePath = "$projectRoot\.openspec\annotations\TEMPLATE.yaml"
        if (Test-Path $templatePath) {
            $template = Get-Content $templatePath -Raw

            # Replace placeholders
            $template = $template -replace '"PROJECT"', "`"$Project`""
            $template = $template -replace 'ide: 0', "ide: $IDE"

            # Add business rules
            $rulesYaml = ""
            foreach ($rule in $rules | Select-Object -First 20) {
                $rulesYaml += @"

  - code: $($rule.Code)
    description: "$($rule.Description -replace '"', "'")"
    expression_id: $($rule.ExpressionId)
    rule_type: $($rule.RuleType)
    severity: $($rule.Severity)
    validated: false
"@
            }

            $template = $template -replace 'business_rules: \[\]', "business_rules:$rulesYaml"

            $template | Out-File $yamlFile -Encoding UTF8
            Write-Host "  Created: $yamlFile" -ForegroundColor Green
        }
    }
} else {
    Write-Host "`n[4/4] YAML output skipped (use -OutputYaml to enable)" -ForegroundColor DarkYellow
}

# ============================================================================
# OUTPUT SUMMARY
# ============================================================================
Write-Host "`n=== EXTRACTION COMPLETE ===" -ForegroundColor Green

# Display top rules
Write-Host "`nTop 10 Business Rules:" -ForegroundColor Cyan
$rules | Select-Object Code, RuleType, Severity, Description | Select-Object -First 10 | Format-Table -AutoSize

# Return results
[PSCustomObject]@{
    Project = $Project
    IDE = $IDE
    TotalExpressions = $expressions.Count
    RulesExtracted = $rules.Count
    RulesByType = $rulesByType | ForEach-Object { @{ $_.Name = $_.Count } }
    SavedToKb = $SaveToKb -and (Test-Path $KbPath)
    YamlGenerated = $OutputYaml
}
