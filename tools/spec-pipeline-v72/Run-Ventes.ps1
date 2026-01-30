# Run-Ventes.ps1 - Batch Runner V7.2 pour programmes Ventes ADH
# Execute Phase1-4 (spec-pipeline-v60) + Phase5-Synthesis V7.2

param(
    [string]$Project = "ADH",
    [switch]$SkipPhase4
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$V60Dir = Join-Path (Split-Path -Parent $ScriptDir) "spec-pipeline-v60"

# Programmes Ventes ADH
$VentesPrograms = @(229, 233, 236, 237, 241, 242, 247, 254, 316)

$globalStart = Get-Date
$results = @()

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "         PIPELINE V7.2 - BATCH VENTES ADH                       " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Debut: $($globalStart.ToString('HH:mm:ss'))"
Write-Host "Programmes: $($VentesPrograms -join ', ')"
Write-Host "Total: $($VentesPrograms.Count) programmes"
Write-Host ""

foreach ($ide in $VentesPrograms) {
    $progStart = Get-Date
    $outputPath = Join-Path $ScriptDir "output\$Project-IDE-$ide"
    $specsPath = Join-Path $ProjectRoot ".openspec\specs"

    if (-not (Test-Path $outputPath)) {
        New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
    }

    Write-Host "=================================================================" -ForegroundColor Yellow
    Write-Host " [$($VentesPrograms.IndexOf($ide)+1)/$($VentesPrograms.Count)] $Project IDE $ide" -ForegroundColor Yellow
    Write-Host "=================================================================" -ForegroundColor Yellow

    $phaseStatus = @{}

    # Phase 1: Discovery
    try {
        Write-Host "  Phase 1: Discovery..." -NoNewline
        & (Join-Path $V60Dir "Phase1-Discovery.ps1") -Project $Project -IdePosition $ide -OutputPath $outputPath | Out-Null
        $phaseStatus["P1"] = "OK"
        Write-Host " OK" -ForegroundColor Green
    } catch {
        $phaseStatus["P1"] = "FAIL"
        Write-Host " FAIL: $_" -ForegroundColor Red
        $results += [PSCustomObject]@{
            IDE = $ide; Status = "FAIL"; Phase = "P1"; Duration = 0; Error = $_.ToString()
        }
        continue
    }

    # Phase 2: Mapping
    try {
        Write-Host "  Phase 2: Mapping..." -NoNewline
        & (Join-Path $V60Dir "Phase2-Mapping.ps1") -Project $Project -IdePosition $ide -OutputPath $outputPath | Out-Null
        $phaseStatus["P2"] = "OK"
        Write-Host " OK" -ForegroundColor Green
    } catch {
        $phaseStatus["P2"] = "FAIL"
        Write-Host " FAIL: $_" -ForegroundColor Red
    }

    # Phase 3: Decode
    try {
        Write-Host "  Phase 3: Decode..." -NoNewline
        & (Join-Path $V60Dir "Phase3-Decode.ps1") -Project $Project -IdePosition $ide -OutputPath $outputPath | Out-Null
        $phaseStatus["P3"] = "OK"
        Write-Host " OK" -ForegroundColor Green
    } catch {
        $phaseStatus["P3"] = "FAIL"
        Write-Host " FAIL: $_" -ForegroundColor Red
    }

    # Phase 4: UI Forms
    if (-not $SkipPhase4) {
        try {
            Write-Host "  Phase 4: UI Forms..." -NoNewline
            & (Join-Path $V60Dir "Phase4-UIForms.ps1") -Project $Project -IdePosition $ide -OutputPath $outputPath | Out-Null
            $phaseStatus["P4"] = "OK"
            Write-Host " OK" -ForegroundColor Green
        } catch {
            $phaseStatus["P4"] = "FAIL"
            Write-Host " FAIL: $_" -ForegroundColor Red
        }
    } else {
        $phaseStatus["P4"] = "SKIP"
        Write-Host "  Phase 4: SKIP" -ForegroundColor DarkGray
    }

    # Phase 5: Synthesis V7.2
    try {
        Write-Host "  Phase 5: Synthesis V7.2..." -NoNewline
        & (Join-Path $ScriptDir "Phase5-Synthesis.ps1") -Project $Project -IdePosition $ide -OutputPath $outputPath -SpecsOutputPath $specsPath | Out-Null
        $phaseStatus["P5"] = "OK"
        Write-Host " OK" -ForegroundColor Green
    } catch {
        $phaseStatus["P5"] = "FAIL"
        Write-Host " FAIL: $_" -ForegroundColor Red
    }

    $progEnd = Get-Date
    $progDuration = [math]::Round(($progEnd - $progStart).TotalSeconds, 1)

    $statusAll = if ($phaseStatus.Values -contains "FAIL") { "PARTIAL" } else { "OK" }

    $results += [PSCustomObject]@{
        IDE = $ide
        Status = $statusAll
        P1 = $phaseStatus["P1"]
        P2 = $phaseStatus["P2"]
        P3 = $phaseStatus["P3"]
        P4 = $phaseStatus["P4"]
        P5 = $phaseStatus["P5"]
        Duration = $progDuration
        Error = ""
    }

    Write-Host "  -> $statusAll en ${progDuration}s" -ForegroundColor $(if ($statusAll -eq "OK") { "Green" } else { "Yellow" })
    Write-Host ""
}

$globalEnd = Get-Date
$totalDuration = [math]::Round(($globalEnd - $globalStart).TotalSeconds, 1)
$totalMinutes = [math]::Round($totalDuration / 60, 1)

# Summary
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "         PIPELINE V7.2 - RESULTATS BATCH VENTES                 " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Debut:  $($globalStart.ToString('HH:mm:ss'))"
Write-Host "Fin:    $($globalEnd.ToString('HH:mm:ss'))"
Write-Host "Duree:  ${totalDuration}s (${totalMinutes} min)"
Write-Host ""

Write-Host "DETAIL PAR PROGRAMME:" -ForegroundColor Cyan
Write-Host ("-" * 70)
Write-Host ("{0,-8} {1,-8} {2,-5} {3,-5} {4,-5} {5,-5} {6,-5} {7,-10}" -f "IDE", "Status", "P1", "P2", "P3", "P4", "P5", "Duree(s)")
Write-Host ("-" * 70)

foreach ($r in $results) {
    $color = switch ($r.Status) { "OK" { "Green" } "PARTIAL" { "Yellow" } default { "Red" } }
    Write-Host ("{0,-8} {1,-8} {2,-5} {3,-5} {4,-5} {5,-5} {6,-5} {7,-10}" -f $r.IDE, $r.Status, $r.P1, $r.P2, $r.P3, $r.P4, $r.P5, $r.Duration) -ForegroundColor $color
}

Write-Host ("-" * 70)
$okCount = ($results | Where-Object { $_.Status -eq "OK" }).Count
$failCount = ($results | Where-Object { $_.Status -ne "OK" }).Count
Write-Host ""
Write-Host "OK: $okCount / $($results.Count)  |  FAIL/PARTIAL: $failCount  |  Total: ${totalDuration}s" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })

# Save report
$reportPath = Join-Path $ScriptDir "output\ventes-v72-report.json"
$report = @{
    pipeline_version = "7.2"
    start_time = $globalStart.ToString("yyyy-MM-dd HH:mm:ss")
    end_time = $globalEnd.ToString("yyyy-MM-dd HH:mm:ss")
    duration_seconds = $totalDuration
    programs = $results | ForEach-Object {
        @{ ide = $_.IDE; status = $_.Status; duration = $_.Duration; phases = @{ p1=$_.P1; p2=$_.P2; p3=$_.P3; p4=$_.P4; p5=$_.P5 } }
    }
}
$report | ConvertTo-Json -Depth 5 | Set-Content -Path $reportPath -Encoding UTF8
Write-Host ""
Write-Host "Rapport: $reportPath"
