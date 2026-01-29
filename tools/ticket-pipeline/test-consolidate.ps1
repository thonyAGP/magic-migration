# Quick test for auto-consolidate.ps1
$ErrorActionPreference = "Stop"

Write-Host "=== Test Read JSON with BOM ===" -ForegroundColor Cyan

$path = "D:\Projects\Lecteur_Magic\.openspec\tickets\PMS-1457\context.json"
$raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$raw = $raw.TrimStart([char]0xFEFF)
Write-Host "Raw length: $($raw.Length)"
Write-Host "First char: [$($raw[0])]"

$obj = $raw | ConvertFrom-Json
Write-Host "TicketKey: $($obj.TicketKey)"
Write-Host "Symptom: $($obj.Symptom)"
Write-Host "Programs: $($obj.Programs.Count)"

Write-Host ""
Write-Host "=== Test programs.json ===" -ForegroundColor Cyan
$path2 = "D:\Projects\Lecteur_Magic\.openspec\tickets\PMS-1457\programs.json"
$raw2 = [System.IO.File]::ReadAllText($path2, [System.Text.Encoding]::UTF8)
$raw2 = $raw2.TrimStart([char]0xFEFF)
$prog = $raw2 | ConvertFrom-Json
Write-Host "Programs count: $($prog.Programs.Count)"
if ($prog.Programs.Count -gt 0) {
    $p = $prog.Programs[0]
    Write-Host "First: $($p.Project) IDE $($p.IDE) - $($p.Name) (Verified=$($p.Verified))"
}

Write-Host ""
Write-Host "=== Now running full consolidation ===" -ForegroundColor Cyan
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$ScriptDir\auto-consolidate.ps1" -TicketDir "D:\Projects\Lecteur_Magic\.openspec\tickets\PMS-1457"

Write-Host ""
Write-Host "=== Check output ===" -ForegroundColor Cyan
$outPath = "D:\Projects\Lecteur_Magic\.openspec\tickets\PMS-1457\pipeline-data.json"
if (Test-Path $outPath) {
    $data = [System.IO.File]::ReadAllText($outPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    Write-Host "Version: $($data.version)"
    Write-Host "TicketKey: $($data.ticketKey)"
    Write-Host "Score: $($data.validation.Score)"
    Write-Host "Programs: $($data.programs.Count)"
} else {
    Write-Host "OUTPUT NOT FOUND: $outPath" -ForegroundColor Red
}
