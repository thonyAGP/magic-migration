<#
.SYNOPSIS
    Validates the Magic Knowledge Base integrity
.DESCRIPTION
    Wrapper script that calls KbIndexRunner validate mode.
    Performs various integrity checks on the SQLite Knowledge Base:
    - PRAGMA integrity_check
    - Foreign key constraint validation
    - Orphan detection in program_calls
    - Data consistency checks
.EXAMPLE
    .\validate-kb.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

# Find KbIndexRunner
$runnerPath = "$PSScriptRoot\KbIndexRunner\bin\Debug\net8.0\KbIndexRunner.dll"
if (-not (Test-Path $runnerPath)) {
    $runnerPath = "$PSScriptRoot\KbIndexRunner\bin\Release\net8.0\KbIndexRunner.dll"
}

if (-not (Test-Path $runnerPath)) {
    Write-Host "[ERROR] KbIndexRunner not found. Run 'dotnet build' in tools/KbIndexRunner first." -ForegroundColor Red
    exit 1
}

# Run validation
& dotnet $runnerPath validate
exit $LASTEXITCODE
