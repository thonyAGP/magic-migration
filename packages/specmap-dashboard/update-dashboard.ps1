# Regenerate the migration dashboard and copy to Vercel deployment folder
# Usage: .\dashboard\update-dashboard.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Write-Host "Regenerating migration report..." -ForegroundColor Cyan
Push-Location "$RootDir\tools\migration-factory"
npx tsx src/cli.ts report --project $RootDir --multi
Pop-Location

Write-Host "Copying to dashboard..." -ForegroundColor Cyan
Copy-Item "$RootDir\.openspec\migration\migration-report.html" "$ScriptDir\index.html" -Force

Write-Host "Dashboard updated!" -ForegroundColor Green
Write-Host "  git add dashboard/index.html && git commit -m 'chore: update migration dashboard' && git push" -ForegroundColor Yellow
