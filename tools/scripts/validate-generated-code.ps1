# validate-generated-code.ps1
# Validates that generated TypeScript/C# code compiles correctly
# Usage: .\validate-generated-code.ps1 -Expression "Trim({0,1})" -Language typescript

param(
    [Parameter(Mandatory = $false)]
    [string]$Expression,

    [Parameter(Mandatory = $false)]
    [ValidateSet("typescript", "csharp", "python", "all")]
    [string]$Language = "all",

    [Parameter(Mandatory = $false)]
    [switch]$RunAllTests,

    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "$env:TEMP\magic-validation"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Ensure output directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Test expressions covering various features
$TestExpressions = @(
    # Simple literals
    @{ Expr = "42"; Desc = "Number literal" }
    @{ Expr = "'hello'"; Desc = "String literal" }
    @{ Expr = "'TRUE'LOG"; Desc = "Boolean literal" }

    # Field references
    @{ Expr = "{0,5}"; Desc = "Local field reference" }
    @{ Expr = "{32768,138}"; Desc = "Main program reference" }

    # Arithmetic
    @{ Expr = "1 + 2"; Desc = "Addition" }
    @{ Expr = "10 - 3"; Desc = "Subtraction" }
    @{ Expr = "4 * 5"; Desc = "Multiplication" }
    @{ Expr = "20 / 4"; Desc = "Division" }
    @{ Expr = "2 ^ 3"; Desc = "Power" }
    @{ Expr = "10 MOD 3"; Desc = "Modulo" }

    # Comparison
    @{ Expr = "{0,1} = 0"; Desc = "Equals" }
    @{ Expr = "{0,1} <> 0"; Desc = "Not equals" }
    @{ Expr = "{0,1} > 10"; Desc = "Greater than" }
    @{ Expr = "{0,1} < 10"; Desc = "Less than" }
    @{ Expr = "{0,1} >= 10"; Desc = "Greater or equal" }
    @{ Expr = "{0,1} <= 10"; Desc = "Less or equal" }

    # Logical
    @{ Expr = "{0,1} > 0 AND {0,2} > 0"; Desc = "Logical AND" }
    @{ Expr = "{0,1} = 0 OR {0,2} = 0"; Desc = "Logical OR" }
    @{ Expr = "NOT {0,1} = 0"; Desc = "Logical NOT" }

    # String operations
    @{ Expr = "Trim({0,1})"; Desc = "Trim function" }
    @{ Expr = "Upper({0,1})"; Desc = "Upper function" }
    @{ Expr = "Lower({0,1})"; Desc = "Lower function" }
    @{ Expr = "Len({0,1})"; Desc = "Length function" }
    @{ Expr = "{0,1} & ' ' & {0,2}"; Desc = "String concatenation" }

    # Date functions
    @{ Expr = "Date()"; Desc = "Current date" }
    @{ Expr = "Time()"; Desc = "Current time" }
    @{ Expr = "DStr({0,1},'YYYYMMDD')"; Desc = "Date format" }

    # Conditional
    @{ Expr = "IF({0,1} > 0, 'Yes', 'No')"; Desc = "IF function" }
    @{ Expr = "IF({0,1} = '', 0, Val({0,1}))"; Desc = "IF with Val" }

    # Nested
    @{ Expr = "Upper(Trim({0,1}))"; Desc = "Nested functions" }
    @{ Expr = "IF(Len(Trim({0,1})) > 0, {0,1}, 'Empty')"; Desc = "Complex nested" }
)

function Test-TypeScriptCompile {
    param([string]$Code)

    $TsFile = Join-Path $OutputDir "test.ts"
    $WrapperCode = @"
// Auto-generated validation wrapper
interface Fields { [key: string]: string | number | boolean | null; }
interface MainProgram { [key: string]: string | number | boolean | null; }

const fields: Fields = {};
const mainProgram: MainProgram = {};

const result = $Code;
console.log(result);
"@

    Set-Content -Path $TsFile -Value $WrapperCode -Encoding UTF8

    try {
        $result = & npx tsc --noEmit --strict $TsFile 2>&1
        if ($LASTEXITCODE -eq 0) {
            return @{ Success = $true; Output = "" }
        }
        return @{ Success = $false; Output = $result -join "`n" }
    }
    catch {
        return @{ Success = $false; Output = $_.Exception.Message }
    }
}

function Test-CSharpCompile {
    param([string]$Code)

    $CsFile = Join-Path $OutputDir "Test.cs"
    $WrapperCode = @"
// Auto-generated validation wrapper
using System;

public class Fields {
    public dynamic this[string key] => null;
    public dynamic V1 => "";
    public dynamic V2 => "";
    public dynamic V5 => "";
}

public class MainProgram {
    public dynamic V138 => null;
    public dynamic V42 => false;
}

public class Test {
    private Fields Fields = new Fields();
    private MainProgram MainProgram = new MainProgram();

    public object GetResult() {
        return $Code;
    }
}
"@

    Set-Content -Path $CsFile -Value $WrapperCode -Encoding UTF8

    $CsprojFile = Join-Path $OutputDir "test.csproj"
    if (-not (Test-Path $CsprojFile)) {
        @"
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
"@ | Set-Content -Path $CsprojFile -Encoding UTF8
    }

    try {
        Push-Location $OutputDir
        $result = & dotnet build --nologo -v q 2>&1
        Pop-Location
        if ($LASTEXITCODE -eq 0) {
            return @{ Success = $true; Output = "" }
        }
        return @{ Success = $false; Output = $result -join "`n" }
    }
    catch {
        Pop-Location
        return @{ Success = $false; Output = $_.Exception.Message }
    }
}

function Convert-Expression {
    param(
        [string]$Expression,
        [string]$Language
    )

    Push-Location $ProjectRoot
    try {
        $result = & node -e "const { convert } = require('./dist/parser'); console.log(convert('$($Expression -replace "'", "\'")','$Language'));" 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $result
        }
        throw "Conversion failed: $result"
    }
    finally {
        Pop-Location
    }
}

# Main execution
Write-Host "=== Magic Code Generation Validator ===" -ForegroundColor Cyan
Write-Host ""

if ($RunAllTests) {
    Write-Host "Running all test expressions..." -ForegroundColor Yellow
    Write-Host ""

    $Results = @{
        typescript = @{ passed = 0; failed = 0; errors = @() }
        csharp = @{ passed = 0; failed = 0; errors = @() }
    }

    $languages = if ($Language -eq "all") { @("typescript", "csharp") } else { @($Language) }

    foreach ($test in $TestExpressions) {
        foreach ($lang in $languages) {
            Write-Host "[$lang] $($test.Desc): $($test.Expr)" -ForegroundColor Gray -NoNewline

            try {
                $code = Convert-Expression -Expression $test.Expr -Language $lang

                $compileResult = if ($lang -eq "typescript") {
                    Test-TypeScriptCompile -Code $code
                } else {
                    Test-CSharpCompile -Code $code
                }

                if ($compileResult.Success) {
                    Write-Host " OK" -ForegroundColor Green
                    $Results[$lang].passed++
                }
                else {
                    Write-Host " FAIL" -ForegroundColor Red
                    $Results[$lang].failed++
                    $Results[$lang].errors += @{
                        Expr = $test.Expr
                        Desc = $test.Desc
                        Code = $code
                        Error = $compileResult.Output
                    }
                }
            }
            catch {
                Write-Host " ERROR" -ForegroundColor Red
                $Results[$lang].failed++
                $Results[$lang].errors += @{
                    Expr = $test.Expr
                    Desc = $test.Desc
                    Code = "N/A"
                    Error = $_.Exception.Message
                }
            }
        }
    }

    Write-Host ""
    Write-Host "=== RESULTS ===" -ForegroundColor Cyan

    foreach ($lang in $languages) {
        $r = $Results[$lang]
        $total = $r.passed + $r.failed
        $pct = if ($total -gt 0) { [math]::Round(($r.passed / $total) * 100, 1) } else { 0 }
        $color = if ($pct -ge 90) { "Green" } elseif ($pct -ge 70) { "Yellow" } else { "Red" }

        Write-Host "$lang : $($r.passed)/$total ($pct%)" -ForegroundColor $color

        if ($r.errors.Count -gt 0 -and $r.errors.Count -le 5) {
            foreach ($err in $r.errors) {
                Write-Host "  - $($err.Desc): $($err.Expr)" -ForegroundColor Red
                Write-Host "    Code: $($err.Code)" -ForegroundColor DarkGray
            }
        }
        elseif ($r.errors.Count -gt 5) {
            Write-Host "  ($($r.errors.Count) errors - see output file)" -ForegroundColor Red
        }
    }

    # Save results
    $ResultsFile = Join-Path $OutputDir "validation-results.json"
    $Results | ConvertTo-Json -Depth 5 | Set-Content $ResultsFile -Encoding UTF8
    Write-Host ""
    Write-Host "Results saved to: $ResultsFile" -ForegroundColor Gray
}
elseif ($Expression) {
    Write-Host "Testing expression: $Expression" -ForegroundColor Yellow
    Write-Host ""

    $languages = if ($Language -eq "all") { @("typescript", "csharp") } else { @($Language) }

    foreach ($lang in $languages) {
        Write-Host "=== $($lang.ToUpper()) ===" -ForegroundColor Cyan

        try {
            $code = Convert-Expression -Expression $Expression -Language $lang
            Write-Host "Generated code:" -ForegroundColor Gray
            Write-Host "  $code" -ForegroundColor White

            $compileResult = if ($lang -eq "typescript") {
                Test-TypeScriptCompile -Code $code
            } else {
                Test-CSharpCompile -Code $code
            }

            if ($compileResult.Success) {
                Write-Host "Compile: OK" -ForegroundColor Green
            }
            else {
                Write-Host "Compile: FAILED" -ForegroundColor Red
                Write-Host $compileResult.Output -ForegroundColor DarkRed
            }
        }
        catch {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }

        Write-Host ""
    }
}
else {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\validate-generated-code.ps1 -Expression `"Trim({0,1})`" -Language typescript"
    Write-Host "  .\validate-generated-code.ps1 -RunAllTests -Language all"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Expression   : Magic expression to validate"
    Write-Host "  -Language     : typescript, csharp, python, or all"
    Write-Host "  -RunAllTests  : Run all predefined test expressions"
    Write-Host "  -OutputDir    : Directory for temp files (default: %TEMP%\magic-validation)"
}
