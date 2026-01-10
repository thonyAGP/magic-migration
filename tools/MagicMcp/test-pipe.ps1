$env:MAGIC_PROJECTS_PATH = "D:\Data\Migration\XPA\PMS"
$exe = "D:\Projects\Lecteur Magic\tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"

# Create process with redirected streams
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $exe
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $true

$process = [System.Diagnostics.Process]::Start($psi)

# Wait for initialization
Start-Sleep -Seconds 3

# Send JSON-RPC request
$json = '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"magic_get_position","arguments":{"project":"ADH","programId":69}}}'
$process.StandardInput.WriteLine($json)
$process.StandardInput.Flush()

# Wait and read response
Start-Sleep -Seconds 2

Write-Host "=== STDERR ===" -ForegroundColor Yellow
while ($process.StandardError.Peek() -ge 0) {
    $line = $process.StandardError.ReadLine()
    Write-Host $line
}

Write-Host "`n=== STDOUT ===" -ForegroundColor Green
while ($process.StandardOutput.Peek() -ge 0) {
    $line = $process.StandardOutput.ReadLine()
    Write-Host $line
}

$process.Kill()
