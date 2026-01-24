# Invoke-MagicMcp.ps1
# Wrapper pour appeler les outils MCP Magic depuis PowerShell
# Utilise le protocole MCP JSON-RPC via stdin/stdout

param(
    [Parameter(Mandatory=$true)]
    [string]$Tool,

    [Parameter(Mandatory=$true)]
    [hashtable]$Params,

    [string]$McpExe = $null,

    [int]$TimeoutSeconds = 60
)

$ErrorActionPreference = "Stop"

# Trouver MagicMcp.exe
if (-not $McpExe) {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

    $McpExe = Join-Path $ProjectRoot "tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"
    if (-not (Test-Path $McpExe)) {
        $McpExe = Join-Path $ProjectRoot "tools\MagicMcp\bin\Debug\net8.0\MagicMcp.exe"
    }
}

if (-not (Test-Path $McpExe)) {
    throw "MagicMcp.exe not found. Build with: dotnet build tools/MagicMcp"
}

# Construire la requete JSON-RPC MCP
$RequestId = [guid]::NewGuid().ToString()
$McpRequest = @{
    jsonrpc = "2.0"
    id = $RequestId
    method = "tools/call"
    params = @{
        name = $Tool
        arguments = $Params
    }
} | ConvertTo-Json -Depth 10 -Compress

# Creer fichiers temporaires
$InputFile = [System.IO.Path]::GetTempFileName()
$OutputFile = [System.IO.Path]::GetTempFileName()
$ErrorFile = [System.IO.Path]::GetTempFileName()

try {
    # Ecrire la requete
    # MCP utilise Content-Length header puis JSON
    $Bytes = [System.Text.Encoding]::UTF8.GetBytes($McpRequest)
    $Header = "Content-Length: $($Bytes.Length)`r`n`r`n"
    $FullRequest = $Header + $McpRequest

    [System.IO.File]::WriteAllText($InputFile, $FullRequest, [System.Text.Encoding]::UTF8)

    # Demarrer le process MCP
    $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
    $ProcessInfo.FileName = $McpExe
    $ProcessInfo.RedirectStandardInput = $true
    $ProcessInfo.RedirectStandardOutput = $true
    $ProcessInfo.RedirectStandardError = $true
    $ProcessInfo.UseShellExecute = $false
    $ProcessInfo.CreateNoWindow = $true

    $Process = New-Object System.Diagnostics.Process
    $Process.StartInfo = $ProcessInfo
    $Process.Start() | Out-Null

    # Envoyer la requete
    $Process.StandardInput.Write($FullRequest)
    $Process.StandardInput.Flush()

    # Lire la reponse avec timeout
    $OutputBuilder = New-Object System.Text.StringBuilder
    $StartTime = Get-Date

    while (-not $Process.StandardOutput.EndOfStream) {
        if (((Get-Date) - $StartTime).TotalSeconds -gt $TimeoutSeconds) {
            $Process.Kill()
            throw "MCP timeout after $TimeoutSeconds seconds"
        }

        $Line = $Process.StandardOutput.ReadLine()
        if ($Line) {
            [void]$OutputBuilder.AppendLine($Line)

            # Chercher la reponse JSON
            if ($Line -match '^\{.*"jsonrpc".*\}$') {
                break
            }
        }
    }

    $Process.StandardInput.Close()
    $Process.WaitForExit(5000)

    $Output = $OutputBuilder.ToString()
    $StdErr = $Process.StandardError.ReadToEnd()

    # Parser la reponse MCP
    $Lines = $Output -split "`n" | Where-Object { $_ -match '^\{.*\}$' }
    if ($Lines.Count -eq 0) {
        # Fallback: chercher JSON dans stderr (logs MCP)
        throw "No MCP response found. StdErr: $StdErr"
    }

    $Response = $Lines[-1] | ConvertFrom-Json

    if ($Response.error) {
        throw "MCP Error: $($Response.error.message)"
    }

    # Retourner le resultat
    return $Response.result
}
finally {
    Remove-Item $InputFile -ErrorAction SilentlyContinue
    Remove-Item $OutputFile -ErrorAction SilentlyContinue
    Remove-Item $ErrorFile -ErrorAction SilentlyContinue
}
