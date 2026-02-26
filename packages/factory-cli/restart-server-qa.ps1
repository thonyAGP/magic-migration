# Migration Factory Server Restart Script
# Kill + Rebuild + Restart + Verify

param([int]$Port = 3070, [string]$ProjectPath = "../../")

Write-Host ""
Write-Host "=== Migration Factory Server Restart ===" -ForegroundColor Cyan
Write-Host ""

# 1. Kill existing server
Write-Host "[1/5] Killing server on port $Port..." -ForegroundColor Yellow
$conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($conn) {
    $serverPid = $conn.OwningProcess
    Write-Host "  Found PID: $serverPid" -ForegroundColor Gray
    Stop-Process -Id $serverPid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  Done Server killed" -ForegroundColor Green
} else {
    Write-Host "  No server running" -ForegroundColor Gray
}

# 2. Verify port is free
Write-Host ""
Write-Host "[2/5] Verifying port..." -ForegroundColor Yellow
$check = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($check) {
    Write-Host "  Error Port still in use!" -ForegroundColor Red
    exit 1
}
Write-Host "  Done Port $Port is free" -ForegroundColor Green

# 3. Rebuild code
Write-Host ""
Write-Host "[3/5] Building code..." -ForegroundColor Yellow
pnpm build | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Error Build failed!" -ForegroundColor Red
    exit 1
}
$buildTime = Get-Date -Format "HH:mm:ss"
Write-Host "  Done Build success at $buildTime" -ForegroundColor Green

# 4. Start server in background
Write-Host ""
Write-Host "[4/5] Starting server..." -ForegroundColor Yellow
$currentDir = Get-Location
$job = Start-Job -ScriptBlock {
    param($P, $Proj, $Dir)
    Set-Location $Dir
    npx tsx src/cli.ts serve --port $P --project $Proj
} -ArgumentList $Port, $ProjectPath, $currentDir

Start-Sleep -Seconds 3

# 5. Check version
Write-Host ""
Write-Host "[5/5] Checking version..." -ForegroundColor Yellow
$ver = $null
try {
    $ver = Invoke-RestMethod -Uri "http://localhost:$Port/api/version" -TimeoutSec 5
    Write-Host ""
    Write-Host "  Done Server running:" -ForegroundColor Green
    Write-Host "    Version:  $($ver.version)" -ForegroundColor Cyan
    Write-Host "    Commit:   $($ver.commit)" -ForegroundColor Cyan
    Write-Host "    Build:    $($ver.buildTimestamp)" -ForegroundColor Cyan
    Write-Host "    Started:  $($ver.serverStartTime)" -ForegroundColor Cyan

    $latest = git log -1 --format="%h"
    Write-Host ""
    if ($ver.commit -eq $latest) {
        Write-Host "  Success Server running LATEST code!" -ForegroundColor Green
    } else {
        Write-Host "  Warning Server OUTDATED!" -ForegroundColor Yellow
        Write-Host "    Expected: $latest" -ForegroundColor Yellow
        Write-Host "    Running:  $($ver.commit)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "  Error Version check failed" -ForegroundColor Red
    Write-Host "    Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Success Server ready at http://localhost:$Port" -ForegroundColor Green
Write-Host ""
Write-Host "Job ID: $($job.Id)" -ForegroundColor Gray
Write-Host ""
