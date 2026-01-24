#Requires -Version 5.1
param(
    [string]$Project = "VIL",
    [int]$ProgramId = 558,
    [int]$TaskIsn2 = 56
)

$ErrorActionPreference = "Stop"
$env:MAGIC_PROJECTS_PATH = "D:\Data\Migration\XPA\PMS"
$McpServer = "D:\Projects\Lecteur Magic\tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"

Write-Host "Querying magic_get_logic for $Project program $ProgramId task ISN_2=$TaskIsn2" -ForegroundColor Cyan

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $McpServer
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $true
$psi.EnvironmentVariables["MAGIC_PROJECTS_PATH"] = $env:MAGIC_PROJECTS_PATH

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $psi
$process.Start() | Out-Null

Start-Sleep -Seconds 3

# Initialize
$init = @{
    jsonrpc = "2.0"
    method = "initialize"
    params = @{
        protocolVersion = "2024-11-05"
        capabilities = @{}
        clientInfo = @{ name = "test"; version = "1.0" }
    }
    id = "init"
} | ConvertTo-Json -Depth 10 -Compress

$process.StandardInput.WriteLine($init)
$process.StandardInput.Flush()
Start-Sleep -Milliseconds 500

# Read init response
$timeout = [DateTime]::Now.AddSeconds(5)
while ([DateTime]::Now -lt $timeout) {
    if ($process.StandardOutput.Peek() -ge 0) {
        $line = $process.StandardOutput.ReadLine()
        if ($line -and $line.Contains("serverInfo")) { break }
    }
    Start-Sleep -Milliseconds 100
}

# Call magic_get_logic
$request = @{
    jsonrpc = "2.0"
    method = "tools/call"
    params = @{
        name = "magic_get_logic"
        arguments = @{
            project = $Project
            programId = $ProgramId
            isn2 = $TaskIsn2
        }
    }
    id = "test1"
} | ConvertTo-Json -Depth 10 -Compress

$process.StandardInput.WriteLine($request)
$process.StandardInput.Flush()

# Read response
$response = $null
$timeout = [DateTime]::Now.AddSeconds(15)
while ([DateTime]::Now -lt $timeout) {
    if ($process.StandardOutput.Peek() -ge 0) {
        $line = $process.StandardOutput.ReadLine()
        if ($line -and $line.StartsWith("{") -and $line.Contains("result")) {
            $response = $line | ConvertFrom-Json
            break
        }
    }
    Start-Sleep -Milliseconds 100
}

$process.Kill()

if ($response -and $response.result -and $response.result.content) {
    foreach ($item in $response.result.content) {
        if ($item.text) {
            Write-Host $item.text
        }
    }
} elseif ($response -and $response.error) {
    Write-Host "Error: $($response.error.message)" -ForegroundColor Red
} else {
    Write-Host "No response received" -ForegroundColor Yellow
    if ($response) {
        $response | ConvertTo-Json -Depth 5
    }
}
