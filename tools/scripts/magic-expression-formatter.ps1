<#
.SYNOPSIS
    Format Magic expressions into readable formulas with type analysis

.DESCRIPTION
    - Converts {N,Y} references to variable letters/names
    - Detects type mismatches (string vs numeric operations)
    - Identifies Magic functions and their purposes
    - Generates readable formula representation

.PARAMETER Project
    Project name

.PARAMETER PrgId
    Program IDE number

.PARAMETER TaskIsn
    Task ISN_2

.PARAMETER ExpId
    Expression ID to format (optional - all if not specified)

.EXAMPLE
    .\magic-expression-formatter.ps1 -Project ADH -PrgId 121 -TaskIsn 3
    .\magic-expression-formatter.ps1 -Project VIL -PrgId 558 -TaskIsn 19 -ExpId 31
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Project,

    [Parameter(Mandatory=$true)]
    [int]$PrgId,

    [Parameter(Mandatory=$true)]
    [int]$TaskIsn,

    [int]$ExpId = -1
)

$ErrorActionPreference = "Stop"

# Magic function categories for analysis
$MagicFunctions = @{
    # String functions
    "Trim" = @{ Category = "String"; Returns = "Alpha"; Description = "Remove leading/trailing spaces" }
    "Upper" = @{ Category = "String"; Returns = "Alpha"; Description = "Convert to uppercase" }
    "Lower" = @{ Category = "String"; Returns = "Alpha"; Description = "Convert to lowercase" }
    "Left" = @{ Category = "String"; Returns = "Alpha"; Description = "Left substring" }
    "Right" = @{ Category = "String"; Returns = "Alpha"; Description = "Right substring" }
    "Mid" = @{ Category = "String"; Returns = "Alpha"; Description = "Middle substring" }
    "Len" = @{ Category = "String"; Returns = "Numeric"; Description = "String length" }
    "InStr" = @{ Category = "String"; Returns = "Numeric"; Description = "Find substring position" }
    "Val" = @{ Category = "String"; Returns = "Numeric"; Description = "String to number" }
    "Str" = @{ Category = "String"; Returns = "Alpha"; Description = "Number to string" }
    "Rep" = @{ Category = "String"; Returns = "Alpha"; Description = "Repeat string" }
    "Fill" = @{ Category = "String"; Returns = "Alpha"; Description = "Fill string with character" }

    # Date functions
    "Date" = @{ Category = "Date"; Returns = "Date"; Description = "Current date" }
    "Time" = @{ Category = "Date"; Returns = "Time"; Description = "Current time" }
    "Day" = @{ Category = "Date"; Returns = "Numeric"; Description = "Day of month" }
    "Month" = @{ Category = "Date"; Returns = "Numeric"; Description = "Month number" }
    "Year" = @{ Category = "Date"; Returns = "Numeric"; Description = "Year" }
    "DOW" = @{ Category = "Date"; Returns = "Numeric"; Description = "Day of week" }
    "AddDate" = @{ Category = "Date"; Returns = "Date"; Description = "Add days to date" }
    "DVal" = @{ Category = "Date"; Returns = "Numeric"; Description = "Date to number" }
    "DStr" = @{ Category = "Date"; Returns = "Alpha"; Description = "Date to string" }

    # Numeric functions
    "Abs" = @{ Category = "Numeric"; Returns = "Numeric"; Description = "Absolute value" }
    "Round" = @{ Category = "Numeric"; Returns = "Numeric"; Description = "Round number" }
    "Mod" = @{ Category = "Numeric"; Returns = "Numeric"; Description = "Modulo" }
    "Min" = @{ Category = "Numeric"; Returns = "Numeric"; Description = "Minimum value" }
    "Max" = @{ Category = "Numeric"; Returns = "Numeric"; Description = "Maximum value" }

    # Logical functions
    "IF" = @{ Category = "Logic"; Returns = "Varies"; Description = "Conditional" }
    "AND" = @{ Category = "Logic"; Returns = "Logical"; Description = "Logical AND" }
    "OR" = @{ Category = "Logic"; Returns = "Logical"; Description = "Logical OR" }
    "NOT" = @{ Category = "Logic"; Returns = "Logical"; Description = "Logical NOT" }
    "IsNull" = @{ Category = "Logic"; Returns = "Logical"; Description = "Check if null" }
    "IsDefault" = @{ Category = "Logic"; Returns = "Logical"; Description = "Check if default" }

    # Database functions
    "Counter" = @{ Category = "DB"; Returns = "Numeric"; Description = "Get counter value" }
    "DbViewRowId" = @{ Category = "DB"; Returns = "Numeric"; Description = "Current row ID" }
    "DbViewSize" = @{ Category = "DB"; Returns = "Numeric"; Description = "View record count" }

    # System functions
    "GetParam" = @{ Category = "System"; Returns = "Alpha"; Description = "Get INI parameter" }
    "SetParam" = @{ Category = "System"; Returns = "Logical"; Description = "Set INI parameter" }
    "User" = @{ Category = "System"; Returns = "Alpha"; Description = "Current user" }
    "Terminal" = @{ Category = "System"; Returns = "Alpha"; Description = "Terminal ID" }
    "Prog" = @{ Category = "System"; Returns = "Numeric"; Description = "Program number" }
    "Level" = @{ Category = "System"; Returns = "Numeric"; Description = "Task level" }
    "MlsTrans" = @{ Category = "System"; Returns = "Alpha"; Description = "Translate message" }
}

# Load project files
$BasePath = "D:\Data\Migration\XPA\PMS\$Project\Source"
$PrgFile = Join-Path $BasePath "Prg_$PrgId.xml"

if (-not (Test-Path $PrgFile)) {
    Write-Error "Fichier non trouve: $PrgFile"
    exit 1
}

[xml]$xml = Get-Content $PrgFile -Encoding UTF8

# Find target task
$targetTask = $xml.SelectSingleNode("//Task[Header[@ISN_2='$TaskIsn']]")
if (-not $targetTask) {
    Write-Error "Tache ISN_2=$TaskIsn non trouvee"
    exit 1
}

$taskName = $targetTask.Header.Description
Write-Host "Tache: $taskName (ISN_2=$TaskIsn)" -ForegroundColor Cyan

# Get expressions
$expressions = $targetTask.SelectSingleNode("./Expressions")
if (-not $expressions) {
    Write-Host "Aucune expression dans cette tache" -ForegroundColor Yellow
    exit 0
}

$expNodes = $expressions.SelectNodes("Expression")
Write-Host "Expressions trouvees: $($expNodes.Count)" -ForegroundColor Green

# Analysis results
$results = @()

foreach ($exp in $expNodes) {
    $id = [int]$exp.id
    if ($ExpId -ge 0 -and $id -ne $ExpId) { continue }

    $syntaxNode = $exp.SelectSingleNode("ExpSyntax/@val")
    $formula = if ($syntaxNode) { $syntaxNode.Value } else { "" }

    if (-not $formula) { continue }

    $analysis = @{
        Id = $id
        Raw = $formula
        Variables = @()
        Functions = @()
        Operators = @()
        TypeIssues = @()
        Formatted = $formula
        ReturnType = "Unknown"
    }

    # Extract variables {N,Y}
    $varPattern = '\{(\d+),(\d+)\}'
    $varMatches = [regex]::Matches($formula, $varPattern)
    foreach ($m in $varMatches) {
        $level = [int]$m.Groups[1].Value
        $position = [int]$m.Groups[2].Value
        $analysis.Variables += @{
            Raw = $m.Value
            Level = $level
            Position = $position
            IsGlobal = ($level -eq 32768)
        }
    }

    # Extract functions
    $funcPattern = '([A-Za-z_][A-Za-z0-9_]*)\s*\('
    $funcMatches = [regex]::Matches($formula, $funcPattern)
    foreach ($m in $funcMatches) {
        $funcName = $m.Groups[1].Value
        $funcInfo = @{ Name = $funcName; Known = $false; Category = "Unknown"; Returns = "Unknown" }

        if ($MagicFunctions.ContainsKey($funcName)) {
            $info = $MagicFunctions[$funcName]
            $funcInfo.Known = $true
            $funcInfo.Category = $info.Category
            $funcInfo.Returns = $info.Returns
            $funcInfo.Description = $info.Description
        }

        $analysis.Functions += $funcInfo
    }

    # Detect operators
    $opPattern = '(>=|<=|<>|!=|==|=|>|<|\+|-|\*|/|&)'
    $opMatches = [regex]::Matches($formula, $opPattern)
    foreach ($m in $opMatches) {
        $op = $m.Value
        $opType = switch ($op) {
            { $_ -in @(">=", "<=", "<>", "!=", "==", "=", ">", "<") } { "Comparison" }
            { $_ -in @("+", "-", "*", "/") } { "Arithmetic" }
            "&" { "String" }
            default { "Unknown" }
        }
        $analysis.Operators += @{ Op = $op; Type = $opType }
    }

    # Detect potential type issues
    # String concatenation (&) with non-string functions
    if ($analysis.Operators | Where-Object { $_.Op -eq "&" }) {
        $numericFuncs = $analysis.Functions | Where-Object { $_.Returns -eq "Numeric" }
        foreach ($nf in $numericFuncs) {
            $analysis.TypeIssues += "Potential type mismatch: '$($nf.Name)' returns Numeric in string concatenation"
        }
    }

    # Arithmetic with string functions
    $arithmeticOps = $analysis.Operators | Where-Object { $_.Type -eq "Arithmetic" }
    if ($arithmeticOps) {
        $stringFuncs = $analysis.Functions | Where-Object { $_.Returns -eq "Alpha" }
        foreach ($sf in $stringFuncs) {
            if ($sf.Name -notin @("Val", "Len")) {
                $analysis.TypeIssues += "Potential type mismatch: '$($sf.Name)' returns Alpha in arithmetic expression"
            }
        }
    }

    # Determine return type
    if ($analysis.Functions.Count -gt 0) {
        $mainFunc = $analysis.Functions[0]
        if ($mainFunc.Known) {
            $analysis.ReturnType = $mainFunc.Returns
        }
    }
    elseif ($analysis.Operators | Where-Object { $_.Type -eq "Comparison" }) {
        $analysis.ReturnType = "Logical"
    }
    elseif ($analysis.Operators | Where-Object { $_.Op -eq "&" }) {
        $analysis.ReturnType = "Alpha"
    }
    elseif ($analysis.Operators | Where-Object { $_.Type -eq "Arithmetic" }) {
        $analysis.ReturnType = "Numeric"
    }

    $results += $analysis
}

# Output
Write-Host ""
Write-Host "=== ANALYSE DES EXPRESSIONS ===" -ForegroundColor Yellow
Write-Host ""

foreach ($r in $results | Sort-Object { $_.Id }) {
    Write-Host "Expression $($r.Id):" -ForegroundColor Cyan
    Write-Host "  Formule: $($r.Raw)" -ForegroundColor White

    if ($r.Variables.Count -gt 0) {
        Write-Host "  Variables: $($r.Variables.Count)" -ForegroundColor Gray
        foreach ($v in $r.Variables) {
            $label = if ($v.IsGlobal) { "VG.$($v.Position)" } else { "{$($v.Level),$($v.Position)}" }
            Write-Host "    - $label" -ForegroundColor DarkGray
        }
    }

    if ($r.Functions.Count -gt 0) {
        Write-Host "  Fonctions:" -ForegroundColor Gray
        foreach ($f in $r.Functions) {
            $knownMarker = if ($f.Known) { "[OK]" } else { "[?]" }
            $desc = if ($f.Description) { " - $($f.Description)" } else { "" }
            Write-Host "    - $($f.Name) $knownMarker ($($f.Category) -> $($f.Returns))$desc" -ForegroundColor DarkGray
        }
    }

    Write-Host "  Type retour: $($r.ReturnType)" -ForegroundColor Green

    if ($r.TypeIssues.Count -gt 0) {
        Write-Host "  ALERTES TYPE:" -ForegroundColor Red
        foreach ($issue in $r.TypeIssues) {
            Write-Host "    - $issue" -ForegroundColor Red
        }
    }

    Write-Host ""
}

# Summary
Write-Host "=== RESUME ===" -ForegroundColor Yellow
Write-Host "Expressions analysees: $($results.Count)"
$withIssues = $results | Where-Object { $_.TypeIssues.Count -gt 0 }
if ($withIssues) {
    Write-Host "Expressions avec alertes type: $($withIssues.Count)" -ForegroundColor Red
} else {
    Write-Host "Aucune alerte de type detectee" -ForegroundColor Green
}

# Function usage
$allFuncs = $results.Functions | Group-Object Name | Sort-Object Count -Descending
if ($allFuncs) {
    Write-Host ""
    Write-Host "Fonctions utilisees:"
    foreach ($g in $allFuncs | Select-Object -First 10) {
        Write-Host "  $($g.Name): $($g.Count) fois"
    }
}
