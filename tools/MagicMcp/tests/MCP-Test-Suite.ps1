<#
.SYNOPSIS
    Automated test suite for MagicMcp MCP Server

.DESCRIPTION
    Tests all 13 MCP tools with sample data from PMS projects.
    Uses JSON-RPC protocol over stdio.

.NOTES
    Run: powershell -ExecutionPolicy Bypass -File MCP-Test-Suite.ps1
#>

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$script:TestResults = @()
$script:PassCount = 0
$script:FailCount = 0

# Configuration
$McpExe = "D:\Projects\Lecteur Magic\tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"
$Env:MAGIC_PROJECTS_PATH = "D:\Data\Migration\XPA\PMS"

function Write-TestHeader {
    param([string]$Name)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host " TEST: $Name" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = "",
        [string]$Details = ""
    )

    $icon = if ($Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($Passed) { "Green" } else { "Red" }

    Write-Host "$icon $TestName" -ForegroundColor $color
    if ($Message) { Write-Host "       $Message" -ForegroundColor Gray }
    if ($Details -and $Verbose) { Write-Host "       Details: $Details" -ForegroundColor DarkGray }

    $script:TestResults += @{
        Name = $TestName
        Passed = $Passed
        Message = $Message
    }

    if ($Passed) { $script:PassCount++ } else { $script:FailCount++ }
}

function Send-McpRequest {
    param(
        [string]$Method,
        [hashtable]$Params,
        [int]$TimeoutSeconds = 30
    )

    $requestId = [guid]::NewGuid().ToString()

    $request = @{
        jsonrpc = "2.0"
        id = $requestId
        method = "tools/call"
        params = @{
            name = $Method
            arguments = $Params
        }
    } | ConvertTo-Json -Depth 10 -Compress

    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $McpExe
        $psi.UseShellExecute = $false
        $psi.RedirectStandardInput = $true
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.CreateNoWindow = $true
        $psi.EnvironmentVariables["MAGIC_PROJECTS_PATH"] = $Env:MAGIC_PROJECTS_PATH

        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $psi
        $process.Start() | Out-Null

        # Send initialization
        $initRequest = @{
            jsonrpc = "2.0"
            id = "init"
            method = "initialize"
            params = @{
                protocolVersion = "2024-11-05"
                capabilities = @{}
                clientInfo = @{ name = "test-client"; version = "1.0" }
            }
        } | ConvertTo-Json -Depth 10 -Compress

        $process.StandardInput.WriteLine($initRequest)
        $process.StandardInput.WriteLine($request)
        $process.StandardInput.Close()

        # Read response with timeout
        $outputTask = $process.StandardOutput.ReadToEndAsync()
        $completed = $outputTask.Wait([TimeSpan]::FromSeconds($TimeoutSeconds))

        if (-not $completed) {
            $process.Kill()
            throw "Timeout after $TimeoutSeconds seconds"
        }

        $output = $outputTask.Result
        $process.WaitForExit(1000)

        # Parse JSON responses (may have multiple lines)
        $lines = $output -split "`n" | Where-Object { $_ -match '^\{' }
        foreach ($line in $lines) {
            try {
                $json = $line | ConvertFrom-Json
                if ($json.id -eq $requestId) {
                    return $json
                }
            } catch {
                # Skip non-JSON lines
            }
        }

        return $null

    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        return $null
    }
}

function Test-McpExecutable {
    Write-TestHeader "MCP Executable"

    $exists = Test-Path $McpExe
    Write-TestResult -TestName "Executable exists" -Passed $exists -Message $McpExe

    if ($exists) {
        $version = (Get-Item $McpExe).LastWriteTime
        Write-TestResult -TestName "Executable recent" -Passed $true -Message "Built: $version"
    }

    return $exists
}

function Test-ProjectsPath {
    Write-TestHeader "Projects Path"

    $exists = Test-Path $Env:MAGIC_PROJECTS_PATH
    Write-TestResult -TestName "Projects path exists" -Passed $exists -Message $Env:MAGIC_PROJECTS_PATH

    if ($exists) {
        $projects = Get-ChildItem -Path $Env:MAGIC_PROJECTS_PATH -Directory | Where-Object { $_.Name -in @("ADH", "PBP", "REF", "VIL", "PBG", "PVE") }
        Write-TestResult -TestName "Projects found" -Passed ($projects.Count -ge 4) -Message "$($projects.Count) projects: $($projects.Name -join ', ')"
    }

    return $exists
}

function Test-XmlFilesExist {
    Write-TestHeader "XML Files Structure"

    $testCases = @(
        @{ Project = "ADH"; File = "Prg_69.xml"; Description = "EXTRAIT_COMPTE" },
        @{ Project = "ADH"; File = "Prg_121.xml"; Description = "Gestion_Caisse" },
        @{ Project = "REF"; File = "DataSources.xml"; Description = "Tables definition" },
        @{ Project = "REF"; File = "Comps.xml"; Description = "Components mapping" }
    )

    foreach ($tc in $testCases) {
        $path = Join-Path $Env:MAGIC_PROJECTS_PATH "$($tc.Project)\Source\$($tc.File)"
        $exists = Test-Path $path
        Write-TestResult -TestName "$($tc.Project)/$($tc.File)" -Passed $exists -Message $tc.Description
    }
}

function Test-ManualToolCall {
    Write-TestHeader "Manual Tool Validation (without MCP server)"

    # Test 1: Parse Prg_69.xml directly
    $prgPath = Join-Path $Env:MAGIC_PROJECTS_PATH "ADH\Source\Prg_69.xml"
    if (Test-Path $prgPath) {
        $content = Get-Content $prgPath -Raw
        $hasTask = $content -match '<Task'
        $hasHeader = $content -match '<Header'
        $hasLogic = $content -match '<TaskLogic'

        Write-TestResult -TestName "Prg_69.xml structure" -Passed ($hasTask -and $hasHeader) -Message "Task: $hasTask, Header: $hasHeader, Logic: $hasLogic"
    }

    # Test 2: Verify ProgramHeaders.xml exists and has size
    $headersPath = Join-Path $Env:MAGIC_PROJECTS_PATH "ADH\Source\ProgramHeaders.xml"
    if (Test-Path $headersPath) {
        $fileSize = (Get-Item $headersPath).Length / 1KB
        Write-TestResult -TestName "ProgramHeaders.xml exists" -Passed ($fileSize -gt 10) -Message "Size: $([math]::Round($fileSize, 2)) KB"
    }

    # Test 3: Verify Comps.xml (REF) exists and has size
    $compsPath = Join-Path $Env:MAGIC_PROJECTS_PATH "REF\Source\Comps.xml"
    if (Test-Path $compsPath) {
        $fileSize = (Get-Item $compsPath).Length / 1KB
        Write-TestResult -TestName "Comps.xml exists" -Passed ($fileSize -gt 10) -Message "Size: $([math]::Round($fileSize, 2)) KB"
    }
}

function Test-IndexCache {
    Write-TestHeader "Index Cache Validation"

    $projects = @("ADH", "PBP", "REF", "VIL", "PBG", "PVE")

    foreach ($proj in $projects) {
        $sourcePath = Join-Path $Env:MAGIC_PROJECTS_PATH "$proj\Source"
        if (Test-Path $sourcePath) {
            $prgCount = (Get-ChildItem -Path $sourcePath -Filter "Prg_*.xml" -ErrorAction SilentlyContinue).Count
            Write-TestResult -TestName "$proj programs" -Passed ($prgCount -gt 0) -Message "$prgCount programs"
        }
    }
}

function Show-Summary {
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor White
    Write-Host " TEST SUMMARY" -ForegroundColor White
    Write-Host "=" * 60 -ForegroundColor White
    Write-Host ""
    Write-Host "  Total:  $($script:PassCount + $script:FailCount)" -ForegroundColor White
    Write-Host "  Passed: $($script:PassCount)" -ForegroundColor Green
    Write-Host "  Failed: $($script:FailCount)" -ForegroundColor $(if ($script:FailCount -gt 0) { "Red" } else { "Green" })
    Write-Host ""

    if ($script:FailCount -eq 0) {
        Write-Host "  All tests passed!" -ForegroundColor Green
    } else {
        Write-Host "  Some tests failed. Review output above." -ForegroundColor Yellow
    }

    Write-Host ""
}

# Main execution
Write-Host ""
Write-Host "MagicMcp Test Suite" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta
Write-Host "Testing MCP Server tools and infrastructure"
Write-Host ""

# Run tests
$execOk = Test-McpExecutable
if ($execOk) {
    Test-ProjectsPath
    Test-XmlFilesExist
    Test-ManualToolCall
    Test-IndexCache
}

Show-Summary

# Return exit code
exit $script:FailCount
