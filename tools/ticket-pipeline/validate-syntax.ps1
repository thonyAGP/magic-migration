# validate-syntax.ps1
# Valide la syntaxe de tous les scripts du pipeline

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$Scripts = @(
    "Run-TicketPipeline.ps1",
    "auto-extract-context.ps1",
    "auto-find-programs.ps1",
    "auto-trace-flow.ps1",
    "auto-decode-expressions.ps1",
    "auto-match-patterns.ps1",
    "auto-generate-analysis.ps1"
)

$Passed = 0
$Failed = 0

foreach ($Script in $Scripts) {
    $Path = Join-Path $ScriptDir $Script
    if (-not (Test-Path $Path)) {
        Write-Host "[SKIP] $Script - not found" -ForegroundColor Yellow
        continue
    }

    $Tokens = $null
    $Errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($Path, [ref]$Tokens, [ref]$Errors)

    if ($Errors.Count -gt 0) {
        Write-Host "[FAIL] $Script" -ForegroundColor Red
        foreach ($Err in $Errors) {
            Write-Host "  Line $($Err.Extent.StartLineNumber): $($Err.Message)" -ForegroundColor Red
        }
        $Failed++
    }
    else {
        Write-Host "[OK] $Script" -ForegroundColor Green
        $Passed++
    }
}

Write-Host ""
Write-Host "Results: $Passed passed, $Failed failed" -ForegroundColor $(if ($Failed -eq 0) { "Green" } else { "Red" })

exit $Failed
