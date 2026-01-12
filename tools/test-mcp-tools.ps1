#Requires -Version 5.1
<#
.SYNOPSIS
    Suite de tests automatises pour les 13 outils MCP Magic.

.DESCRIPTION
    Teste chaque outil MCP via JSON-RPC direct et verifie :
    1. Que l'outil repond sans erreur
    2. Que la sortie est au format IDE Magic (pas de patterns XML interdits)

.EXAMPLE
    .\test-mcp-tools.ps1
    Lance tous les tests.

.EXAMPLE
    .\test-mcp-tools.ps1 -Verbose
    Lance avec sortie detaillee.
#>

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$McpServerPath = Join-Path $ProjectRoot "tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"

# Patterns XML INTERDITS dans les sorties
$ForbiddenPatterns = @(
    @{ Pattern = 'Prg_\d+'; Name = 'Prg_XXX (fichier XML)'; Fix = 'magic_get_position' }
    @{ Pattern = '\{[0-9]+,[0-9]+\}'; Name = '{niveau,columnID}'; Fix = 'Variable lettre' }
    @{ Pattern = 'ISN_2\s*[=:]\s*\d+'; Name = 'ISN_2=XX'; Fix = 'Tache X.Y.Z' }
    @{ Pattern = 'ISN\s*[=:]\s*\d+'; Name = 'ISN=XX'; Fix = 'Position IDE' }
    @{ Pattern = 'FieldID\s*[=:]\s*"\d+"'; Name = 'FieldID="XX"'; Fix = 'Nom variable' }
    @{ Pattern = 'obj\s*=\s*\d+'; Name = 'obj=XX (table)'; Fix = 'Table n°XX' }
    @{ Pattern = 'ItemIsn\s*=\s*"\d+"'; Name = 'ItemIsn="XX"'; Fix = 'Position IDE' }
)

# Compteurs
$script:TotalTests = 0
$script:PassedTests = 0
$script:FailedTests = 0
$script:Warnings = 0

# Couleurs
function Write-TestHeader { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Pass { param($msg) Write-Host "[PASS] $msg" -ForegroundColor Green; $script:PassedTests++ }
function Write-Fail { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red; $script:FailedTests++ }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow; $script:Warnings++ }
function Write-Info { param($msg) if ($Verbose) { Write-Host "[INFO] $msg" -ForegroundColor Gray } }

# Fonction pour envoyer une requete JSON-RPC au serveur MCP
function Send-McpRequest {
    param(
        [string]$Method,
        [hashtable]$Params,
        [System.Diagnostics.Process]$Process
    )

    $request = @{
        jsonrpc = "2.0"
        method = $Method
        params = $Params
        id = [guid]::NewGuid().ToString()
    } | ConvertTo-Json -Depth 10 -Compress

    Write-Info "Request: $request"

    try {
        $Process.StandardInput.WriteLine($request)
        $Process.StandardInput.Flush()

        # Lire la reponse (timeout 10s)
        $response = $null
        $timeout = [DateTime]::Now.AddSeconds(10)

        while ([DateTime]::Now -lt $timeout) {
            if ($Process.StandardOutput.Peek() -ge 0) {
                $line = $Process.StandardOutput.ReadLine()
                if ($line -and $line.StartsWith("{")) {
                    $response = $line | ConvertFrom-Json
                    break
                }
            }
            Start-Sleep -Milliseconds 100
        }

        return $response
    }
    catch {
        return @{ error = @{ message = $_.Exception.Message } }
    }
}

# Fonction pour verifier les patterns interdits
function Test-IdeCompliance {
    param(
        [string]$Content,
        [string]$ToolName
    )

    $violations = @()

    foreach ($pattern in $ForbiddenPatterns) {
        $matches = [regex]::Matches($Content, $pattern.Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        if ($matches.Count -gt 0) {
            foreach ($match in $matches) {
                $violations += @{
                    Pattern = $pattern.Name
                    Match = $match.Value
                    Fix = $pattern.Fix
                }
            }
        }
    }

    return $violations
}

# Demarrer le serveur MCP
function Start-McpServer {
    Write-Info "Demarrage du serveur MCP..."

    $env:MAGIC_PROJECTS_PATH = "D:\Data\Migration\XPA\PMS"

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $McpServerPath
    $psi.UseShellExecute = $false
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    $psi.EnvironmentVariables["MAGIC_PROJECTS_PATH"] = "D:\Data\Migration\XPA\PMS"

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi
    $process.Start() | Out-Null

    # Attendre que le serveur soit pret
    Start-Sleep -Seconds 3

    return $process
}

# Cas de test pour chaque outil
$TestCases = @(
    @{
        Name = "magic_find_program"
        Method = "tools/call"
        Params = @{ name = "magic_find_program"; arguments = @{ query = "EXTRAIT" } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_list_programs"
        Method = "tools/call"
        Params = @{ name = "magic_list_programs"; arguments = @{ project = "ADH"; take = 5 } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_position"
        Method = "tools/call"
        Params = @{ name = "magic_get_position"; arguments = @{ project = "ADH"; programId = 69 } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_tree"
        Method = "tools/call"
        Params = @{ name = "magic_get_tree"; arguments = @{ project = "ADH"; programId = 69 } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_dataview"
        Method = "tools/call"
        Params = @{ name = "magic_get_dataview"; arguments = @{ project = "ADH"; programId = 69 } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_logic"
        Method = "tools/call"
        Params = @{ name = "magic_get_logic"; arguments = @{ project = "ADH"; programId = 69; isn2 = 1 } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_expression"
        Method = "tools/call"
        Params = @{ name = "magic_get_expression"; arguments = @{ project = "ADH"; programId = 69; expressionId = 1 } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_line"
        Method = "tools/call"
        Params = @{ name = "magic_get_line"; arguments = @{ project = "ADH"; taskPosition = "69"; lineNumber = 1 } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_params"
        Method = "tools/call"
        Params = @{ name = "magic_get_params"; arguments = @{ project = "ADH"; programId = 69 } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_table"
        Method = "tools/call"
        Params = @{ name = "magic_get_table"; arguments = @{ query = "operations" } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_dump_dataview"
        Method = "tools/call"
        Params = @{ name = "magic_dump_dataview"; arguments = @{ project = "ADH"; taskPosition = "69" } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_dependencies"
        Method = "tools/call"
        Params = @{ name = "magic_get_dependencies"; arguments = @{ project = "ADH" } }
        ExpectSuccess = $true
    }
    @{
        Name = "magic_get_history"
        Method = "tools/call"
        Params = @{ name = "magic_get_history"; arguments = @{ project = "ADH"; programId = 69 } }
        ExpectSuccess = $true
    }
)

# ========== MAIN ==========

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   MCP Magic Tools - Suite de Tests" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Verifier que le serveur existe
if (-not (Test-Path $McpServerPath)) {
    Write-Fail "Serveur MCP non trouve: $McpServerPath"
    Write-Host "Lancez: dotnet build tools/MagicMcp -c Release"
    exit 1
}

Write-Info "Serveur MCP: $McpServerPath"

# Executer les tests via le serveur MCP
Write-TestHeader "Tests des 13 outils MCP"

$process = $null
try {
    $process = Start-McpServer
    Write-Info "Serveur MCP demarre (PID: $($process.Id))"

    # Initialiser le serveur
    $initRequest = @{
        jsonrpc = "2.0"
        method = "initialize"
        params = @{
            protocolVersion = "2024-11-05"
            capabilities = @{}
            clientInfo = @{ name = "test-suite"; version = "1.0" }
        }
        id = "init"
    } | ConvertTo-Json -Depth 10 -Compress

    $process.StandardInput.WriteLine($initRequest)
    $process.StandardInput.Flush()
    Start-Sleep -Milliseconds 500

    # Lire la reponse d'init
    $initResponse = $null
    $timeout = [DateTime]::Now.AddSeconds(5)
    while ([DateTime]::Now -lt $timeout -and -not $initResponse) {
        if ($process.StandardOutput.Peek() -ge 0) {
            $line = $process.StandardOutput.ReadLine()
            if ($line -and $line.Contains("serverInfo")) {
                $initResponse = $line | ConvertFrom-Json
                break
            }
        }
        Start-Sleep -Milliseconds 100
    }

    if ($initResponse) {
        Write-Info "Serveur initialise: $($initResponse.result.serverInfo.name)"
    }

    # Executer chaque test
    foreach ($test in $TestCases) {
        $script:TotalTests++
        Write-Host ""
        Write-Host "Testing: $($test.Name)" -ForegroundColor White

        $requestJson = @{
            jsonrpc = "2.0"
            method = $test.Method
            params = $test.Params
            id = [guid]::NewGuid().ToString()
        } | ConvertTo-Json -Depth 10 -Compress

        Write-Info "Request: $requestJson"

        $process.StandardInput.WriteLine($requestJson)
        $process.StandardInput.Flush()

        # Lire la reponse
        $response = $null
        $responseText = ""
        $timeout = [DateTime]::Now.AddSeconds(10)

        while ([DateTime]::Now -lt $timeout) {
            if ($process.StandardOutput.Peek() -ge 0) {
                $line = $process.StandardOutput.ReadLine()
                if ($line -and $line.StartsWith("{")) {
                    $responseText = $line
                    try {
                        $response = $line | ConvertFrom-Json
                    } catch {
                        Write-Info "Parse error: $line"
                    }
                    break
                }
            }
            Start-Sleep -Milliseconds 100
        }

        if (-not $response) {
            Write-Fail "$($test.Name): Pas de reponse (timeout)"
            continue
        }

        if ($response.error) {
            Write-Fail "$($test.Name): Erreur - $($response.error.message)"
            continue
        }

        # Extraire le contenu de la reponse
        $content = ""
        if ($response.result -and $response.result.content) {
            foreach ($item in $response.result.content) {
                if ($item.text) {
                    $content += $item.text
                }
            }
        }

        if (-not $content) {
            Write-Warn "$($test.Name): Reponse vide"
            continue
        }

        Write-Info "Response length: $($content.Length) chars"

        # Verifier la conformite IDE Magic
        $violations = Test-IdeCompliance -Content $content -ToolName $test.Name

        if ($violations.Count -eq 0) {
            Write-Pass "$($test.Name): OK (format IDE conforme)"
        } else {
            Write-Fail "$($test.Name): $($violations.Count) violation(s) IDE Magic"
            foreach ($v in $violations) {
                Write-Host "         Pattern: $($v.Pattern) -> '$($v.Match)'" -ForegroundColor Red
                Write-Host "         Fix: Utiliser $($v.Fix)" -ForegroundColor Yellow
            }
        }
    }
}
finally {
    if ($process -and -not $process.HasExited) {
        Write-Info "Arret du serveur MCP..."
        $process.Kill()
        $process.Dispose()
    }
}

# Resume
Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   RESUME DES TESTS" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Total:    $script:TotalTests tests" -ForegroundColor White
Write-Host "Passes:   $script:PassedTests" -ForegroundColor Green
Write-Host "Echecs:   $script:FailedTests" -ForegroundColor $(if ($script:FailedTests -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings: $script:Warnings" -ForegroundColor $(if ($script:Warnings -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

$successRate = if ($script:TotalTests -gt 0) { [math]::Round(($script:PassedTests / $script:TotalTests) * 100) } else { 0 }
Write-Host "Taux de reussite: $successRate%" -ForegroundColor $(if ($successRate -ge 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

# Code de sortie
if ($script:FailedTests -gt 0) {
    exit 1
} else {
    exit 0
}
