<#
.SYNOPSIS
  Manage the SPECMAP Dashboard server (PM2).

.DESCRIPTION
  Start, stop, restart, rebuild, or check status of the specmap-server PM2 process.

.PARAMETER Action
  start    - Start the server (if not running)
  stop     - Stop the server
  restart  - Restart the server
  rebuild  - Build TypeScript then restart
  status   - Show PM2 status
  logs     - Show recent logs

.EXAMPLE
  .\specmap-service.ps1 start
  .\specmap-service.ps1 rebuild
  .\specmap-service.ps1 logs
#>

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'rebuild', 'status', 'logs')]
    [string]$Action = 'status'
)

$FactoryDir = Join-Path $PSScriptRoot 'migration-factory'
$EcosystemFile = Join-Path $FactoryDir 'ecosystem.config.cjs'
$ProcessName = 'specmap-server'

function Write-Step($msg) { Write-Host "  [specmap] $msg" -ForegroundColor Cyan }

switch ($Action) {
    'start' {
        Write-Step "Starting $ProcessName..."
        Push-Location $FactoryDir
        pm2 start $EcosystemFile
        Pop-Location
        pm2 save --force 2>$null
        Write-Step "Server running at http://localhost:3070"
    }
    'stop' {
        Write-Step "Stopping $ProcessName..."
        pm2 stop $ProcessName
        pm2 save --force 2>$null
        Write-Step "Server stopped"
    }
    'restart' {
        Write-Step "Restarting $ProcessName..."
        pm2 restart $ProcessName
        pm2 save --force 2>$null
        Write-Step "Server restarted at http://localhost:3070"
    }
    'rebuild' {
        Write-Step "Building TypeScript..."
        Push-Location $FactoryDir
        npx tsc -b
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [specmap] BUILD FAILED - not restarting" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        Pop-Location
        Write-Step "Restarting $ProcessName..."
        pm2 restart $ProcessName
        pm2 save --force 2>$null
        Write-Step "Server rebuilt and restarted at http://localhost:3070"
    }
    'status' {
        pm2 describe $ProcessName 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [specmap] Not running. Use: .\specmap-service.ps1 start" -ForegroundColor Yellow
        }
    }
    'logs' {
        pm2 logs $ProcessName --lines 30 --nostream
    }
}
