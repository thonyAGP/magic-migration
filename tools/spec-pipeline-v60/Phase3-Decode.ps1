# Phase3-Decode.ps1 - V6.0 Pipeline
# Decodage 100% des expressions avec conversion {N,Y} -> Lettres Variables
# Extraction des regles metier en langage naturel via CLI

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$IdePosition,

    [string]$OutputPath,

    [int]$MaxExpressions = 500  # Limite pour eviter timeout
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KbIndexRunnerPath = Join-Path (Split-Path -Parent $ScriptDir) "KbIndexRunner"

# Default output path
if (-not $OutputPath) {
    $OutputPath = Join-Path $ScriptDir "output\$Project-IDE-$IdePosition"
}
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

Write-Host "=== Phase 3: DECODE (V6.0) ===" -ForegroundColor Cyan
Write-Host "Project: $Project"
Write-Host "IDE Position: $IdePosition"
Write-Host ""

# Load mapping.json for variable conversion
$mappingPath = Join-Path $OutputPath "mapping.json"
$variableMapping = @{}
if (Test-Path $mappingPath) {
    Write-Host "[1/5] Loading variable mapping..." -ForegroundColor Yellow
    $mapping = Get-Content $mappingPath -Raw | ConvertFrom-Json

    # Convert to hashtable for lookup
    if ($mapping.variable_mapping) {
        $mapping.variable_mapping.PSObject.Properties | ForEach-Object {
            $variableMapping[$_.Name] = $_.Value
        }
    }
    Write-Host "  Mapping entries loaded: $($variableMapping.Count)"
} else {
    Write-Host "WARNING: mapping.json not found - running without variable translation" -ForegroundColor Yellow
}
Write-Host ""

# Function: Convert Field number to IDE letter
function Convert-FieldToLetter {
    param([int]$FieldId)
    if ($FieldId -le 0) { return "?" }
    $result = ""
    [int]$n = $FieldId
    while ($n -gt 0) {
        $n--
        [int]$remainder = $n % 26
        [int]$charCode = $remainder + 65  # 65 = 'A'
        $result = [char]$charCode + $result
        $n = [int][math]::Floor($n / 26)
    }
    return $result
}

# Function: Decode expression - replace {N,Y} with readable format
function Decode-Expression {
    param(
        [string]$Expression,
        [hashtable]$VariableMapping
    )

    if ([string]::IsNullOrWhiteSpace($Expression)) {
        return $Expression
    }

    $decoded = $Expression

    # Replace local variables {0,N} -> VariableName [LETTER]
    # Format: "W0 imputation [W]" instead of "Var_W(W0 imputation)"
    $decoded = [regex]::Replace($decoded, '\{0,(\d+)\}', {
        param($match)
        $fieldId = [int]$match.Groups[1].Value
        $letter = Convert-FieldToLetter -FieldId $fieldId

        # Try to get name from mapping
        $key = "{0,$fieldId}"
        if ($VariableMapping.ContainsKey($key) -and $VariableMapping[$key].name) {
            $name = $VariableMapping[$key].name
            # Shorten very long names
            if ($name.Length -gt 25) {
                $name = $name.Substring(0, 22) + "..."
            }
            return "$name [$letter]"
        }
        return "[$letter]"
    })

    # Replace global variables {32768,N} -> VGN
    $decoded = [regex]::Replace($decoded, '\{32768,(\d+)\}', {
        param($match)
        $vgNum = $match.Groups[1].Value
        return "VG$vgNum"
    })

    return $decoded
}

# Function: Classify expression type
function Get-ExpressionType {
    param([string]$Expression)

    if ($Expression -match '^IF\s*\(' -or $Expression -match 'CASE\s*\(') {
        return "CONDITION"
    }
    if ($Expression -match 'Date\s*\(' -or $Expression -match 'DStr\s*\(' -or $Expression -match 'DVal\s*\(') {
        return "DATE"
    }
    if ($Expression -match '^\d+$' -or $Expression -match "^'[^']*'$") {
        return "CONSTANT"
    }
    if ($Expression -match '\+|\-|\*|/') {
        return "CALCULATION"
    }
    if ($Expression -match 'Trim\s*\(|Str\s*\(|Val\s*\(') {
        return "STRING"
    }
    return "OTHER"
}

# Function: Extract business rule from IF expression
function Extract-BusinessRule {
    param([string]$DecodedExpr)

    $rule = @{
        has_rule = $false
        type = ""
        condition = ""
        true_value = ""
        false_value = ""
        natural_language = ""
    }

    # Match IF(condition, true, false)
    if ($DecodedExpr -match '^IF\s*\((.*?),(.*?)(?:,(.*))?(?:\))?\s*$') {
        $rule.has_rule = $true
        $rule.type = "VALIDATION"
        $rule.condition = $Matches[1].Trim()
        $rule.true_value = $Matches[2].Trim()
        if ($Matches[3]) {
            $rule.false_value = $Matches[3].Trim()
        }

        # Generate natural language description
        $cond = $rule.condition -replace "Var_(\w+)\(([^)]+)\)", '$2' -replace "Var_(\w+)", "Variable $1"
        $rule.natural_language = "Si $cond alors $($rule.true_value) sinon $($rule.false_value)"
    }

    return $rule
}

# Step 2: Query KB for ALL expressions via CLI
Write-Host "[2/5] Fetching expressions via CLI..." -ForegroundColor Yellow

$expressionsCmd = "cd '$KbIndexRunnerPath'; dotnet run -- expressions '$Project $IdePosition' --limit $MaxExpressions"
$jsonOutput = powershell -NoProfile -Command $expressionsCmd 2>&1

# Parse JSON output
try {
    $exprData = $jsonOutput | ConvertFrom-Json

    if ($exprData.error) {
        Write-Host "ERROR: $($exprData.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to parse expressions output" -ForegroundColor Red
    Write-Host $jsonOutput
    exit 1
}

$totalExpressions = $exprData.statistics.total
$fetchedCount = $exprData.statistics.returned

Write-Host "  Program: $($exprData.program)" -ForegroundColor Green
Write-Host "  Total expressions in KB: $totalExpressions"
Write-Host "  Fetched: $fetchedCount"
Write-Host ""

# Step 3: Decode expressions
Write-Host "[3/5] Decoding expressions..." -ForegroundColor Yellow

$expressions = @()
$businessRules = @()
$ruleId = 1

foreach ($expr in $exprData.expressions) {
    $content = $expr.content
    $comment = $expr.comment

    # Decode expression
    $decoded = Decode-Expression -Expression $content -VariableMapping $variableMapping
    $exprType = Get-ExpressionType -Expression $content

    $exprObj = @{
        ide_position = $expr.ide
        raw = $content
        decoded = $decoded
        type = $exprType
        comment = $comment
    }

    # Extract business rule if IF/CASE
    if ($exprType -eq "CONDITION") {
        $rule = Extract-BusinessRule -DecodedExpr $decoded
        if ($rule.has_rule) {
            # Deduplicate: skip if condition already exists
            $conditionKey = $rule.condition.Trim()
            $isDuplicate = $businessRules | Where-Object { $_.condition.Trim() -eq $conditionKey }

            if (-not $isDuplicate) {
                $rule.id = "RM-{0:D3}" -f $ruleId
                $rule.expression_ide = $expr.ide
                $rule.raw_expression = $content
                $rule.decoded_expression = $decoded
                $businessRules += $rule
                $ruleId++

                $exprObj.business_rule_id = $rule.id
            }
        }
    }

    $expressions += $exprObj
}

$decodedCount = $expressions.Count
$coveragePercent = if ($totalExpressions -gt 0) { [math]::Round(($decodedCount / $totalExpressions) * 100, 1) } else { 0 }

Write-Host "  Expressions decoded: $decodedCount / $totalExpressions ($coveragePercent%)" -ForegroundColor Green
Write-Host "  Business rules extracted: $($businessRules.Count)"
Write-Host ""

# Step 4: Classify expressions by type
Write-Host "[4/5] Classifying expressions..." -ForegroundColor Yellow

$byType = @{
    CONDITION = @()
    CALCULATION = @()
    DATE = @()
    STRING = @()
    CONSTANT = @()
    OTHER = @()
}

foreach ($expr in $expressions) {
    if ($byType.ContainsKey($expr.type)) {
        $byType[$expr.type] += $expr
    }
}

Write-Host "  - CONDITIONS: $($byType.CONDITION.Count)"
Write-Host "  - CALCULATIONS: $($byType.CALCULATION.Count)"
Write-Host "  - DATES: $($byType.DATE.Count)"
Write-Host "  - STRINGS: $($byType.STRING.Count)"
Write-Host "  - CONSTANTS: $($byType.CONSTANT.Count)"
Write-Host "  - OTHER: $($byType.OTHER.Count)"
Write-Host ""

# Step 5: Build and save decoded.json
Write-Host "[5/5] Saving decoded.json..." -ForegroundColor Yellow

$decoded = @{
    metadata = @{
        project = $Project
        ide_position = $IdePosition
        program_name = $exprData.program
        generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        pipeline_version = "6.0"
    }

    statistics = @{
        total_in_program = $totalExpressions
        decoded_count = $decodedCount
        coverage_percent = $coveragePercent
        business_rules_count = $businessRules.Count
        by_type = @{
            condition = $byType.CONDITION.Count
            calculation = $byType.CALCULATION.Count
            date = $byType.DATE.Count
            string = $byType.STRING.Count
            constant = $byType.CONSTANT.Count
            other = $byType.OTHER.Count
        }
    }

    expressions = @{
        all = $expressions
        by_type = $byType
    }

    business_rules = @{
        all = $businessRules
        by_criticality = @{
            high = @($businessRules | Where-Object { $_.condition -match "Type|Mode|Status" })
            medium = @($businessRules | Where-Object { $_.condition -notmatch "Type|Mode|Status" })
        }
    }
}

$decodedPath = Join-Path $OutputPath "decoded.json"
$decoded | ConvertTo-Json -Depth 10 | Set-Content -Path $decodedPath -Encoding UTF8

Write-Host "=== Phase 3 COMPLETE ===" -ForegroundColor Green
Write-Host "Output: $decodedPath"
Write-Host ""

# Summary
Write-Host "DECODE SUMMARY:" -ForegroundColor Cyan
Write-Host "  - Expressions: $decodedCount / $totalExpressions ($coveragePercent%)"
Write-Host "  - Business Rules: $($businessRules.Count)"
Write-Host "  - Conditions: $($byType.CONDITION.Count)"

# Show top 5 business rules
if ($businessRules.Count -gt 0) {
    Write-Host ""
    Write-Host "TOP BUSINESS RULES:" -ForegroundColor Cyan
    $businessRules | Select-Object -First 5 | ForEach-Object {
        Write-Host "  [$($_.id)] $($_.natural_language)" -ForegroundColor White
    }
}

return $decoded
