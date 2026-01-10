$env:MAGIC_PROJECTS_PATH = "D:\Data\Migration\XPA\PMS"
$exe = "D:\Projects\Lecteur Magic\tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"

$json = '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"magic_get_position","arguments":{"project":"ADH","programId":69}}}'

Write-Host "Sending: $json" -ForegroundColor Cyan
Write-Host "`n--- Raw output ---" -ForegroundColor Yellow

# Run and capture all output
$process = Start-Process -FilePath $exe -ArgumentList "" -NoNewWindow -PassThru -RedirectStandardInput stdin.txt -RedirectStandardOutput stdout.txt -RedirectStandardError stderr.txt

# Write input to stdin
$json | Out-File -FilePath stdin.txt -Encoding utf8
Start-Sleep -Seconds 5
$process.Kill()

Write-Host "`nSTDOUT:" -ForegroundColor Green
Get-Content stdout.txt -ErrorAction SilentlyContinue

Write-Host "`nSTDERR:" -ForegroundColor Red
Get-Content stderr.txt -ErrorAction SilentlyContinue | Select-Object -First 20

# Cleanup
Remove-Item stdin.txt, stdout.txt, stderr.txt -ErrorAction SilentlyContinue
