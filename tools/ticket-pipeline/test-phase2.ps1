# Quick test for Phase 2 (auto-find-programs.ps1) using PMS-1427 context
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Test Phase 2 with PMS-1427 ===" -ForegroundColor Cyan

# Read context.json from Phase 1
$ctxPath = "D:\Projects\Lecteur_Magic\.openspec\tickets\PMS-1427\context.json"
$raw = [System.IO.File]::ReadAllText($ctxPath, [System.Text.Encoding]::UTF8)
$raw = $raw.TrimStart([char]0xFEFF)
$context = $raw | ConvertFrom-Json

Write-Host "Programs from context: $($context.Programs.Count)" -ForegroundColor Gray
foreach ($p in $context.Programs) {
    Write-Host "  - $($p.Raw)" -ForegroundColor Gray
}

# Run Phase 2
$outPath = "D:\Projects\Lecteur_Magic\.openspec\tickets\PMS-1427\programs.json"
& "$ScriptDir\auto-find-programs.ps1" -Programs $context.Programs -Tables $context.Tables -OutputFile $outPath

# Check output
Write-Host ""
Write-Host "=== Check output ===" -ForegroundColor Cyan
if (Test-Path $outPath) {
    $data = [System.IO.File]::ReadAllText($outPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    Write-Host "Programs found: $($data.Programs.Count)" -ForegroundColor Green
    foreach ($p in $data.Programs) {
        $status = if ($p.Verified) { "[OK]" } else { "[??]" }
        $callers = if ($p.Callers) { "callers=$($p.Callers.Count)" } else { "" }
        $callees = if ($p.Callees) { "callees=$($p.Callees.Count)" } else { "" }
        Write-Host "  $status $($p.Project) IDE $($p.IDE) - $($p.Name) ($($p.Source)) $callers $callees" -ForegroundColor $(if ($p.Verified) { "Green" } else { "Yellow" })
    }
    Write-Host "Tables: $($data.Tables.Count)" -ForegroundColor Gray
} else {
    Write-Host "OUTPUT NOT FOUND" -ForegroundColor Red
}
