# Validate Phase 1 criteria
param([string]$JsonPath = "output/ADH-IDE-237/discovery.json")

$json = Get-Content $JsonPath | ConvertFrom-Json

Write-Host "=== Phase 1 Validation Criteria ===" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

# 1.1 metadata.project
$val = $json.metadata.project
$ok = $val -eq "ADH"
Write-Host "1.1 metadata.project: " -NoNewline
if ($ok) { Write-Host "$val" -ForegroundColor Green; $passed++ } else { Write-Host "$val (expected ADH)" -ForegroundColor Red; $failed++ }

# 1.2 metadata.ide_position
$val = $json.metadata.ide_position
$ok = $val -eq 237
Write-Host "1.2 metadata.ide_position: " -NoNewline
if ($ok) { Write-Host "$val" -ForegroundColor Green; $passed++ } else { Write-Host "$val (expected 237)" -ForegroundColor Red; $failed++ }

# 1.3 metadata.program_name
$val = $json.metadata.program_name
$ok = $val -ne "Prg_237" -and $val -match "\w"
Write-Host "1.3 metadata.program_name: " -NoNewline
if ($ok) { Write-Host "$val" -ForegroundColor Green; $passed++ } else { Write-Host "$val (should not be Prg_XXX)" -ForegroundColor Red; $failed++ }

# 1.4 orphan_analysis.status
$val = $json.orphan_analysis.status
$ok = $val -eq "NON_ORPHELIN"
Write-Host "1.4 orphan_analysis.status: " -NoNewline
if ($ok) { Write-Host "$val" -ForegroundColor Green; $passed++ } else { Write-Host "$val (expected NON_ORPHELIN)" -ForegroundColor Red; $failed++ }

# 1.5 orphan_analysis.reason
$val = $json.orphan_analysis.reason
$ok = $val -match "IDE"
Write-Host "1.5 orphan_analysis.reason: " -NoNewline
if ($ok) { Write-Host "$val" -ForegroundColor Green; $passed++ } else { Write-Host "$val (should mention IDEs)" -ForegroundColor Red; $failed++ }

# 1.6 call_graph.callers >= 3
$val = $json.call_graph.callers.Count
$ok = $val -ge 3
Write-Host "1.6 call_graph.callers: " -NoNewline
if ($ok) { Write-Host "$val items (>= 3)" -ForegroundColor Green; $passed++ } else { Write-Host "$val items (expected >= 3)" -ForegroundColor Red; $failed++ }

# 1.7 call_graph.callees >= 5
$val = $json.call_graph.callees.Count
$ok = $val -ge 5
Write-Host "1.7 call_graph.callees: " -NoNewline
if ($ok) { Write-Host "$val items (>= 5)" -ForegroundColor Green; $passed++ } else { Write-Host "$val items (expected >= 5)" -ForegroundColor Red; $failed++ }

# 1.8 tables.by_access.WRITE >= 9
$val = $json.tables.by_access.WRITE.Count
$ok = $val -ge 9
Write-Host "1.8 tables.by_access.WRITE: " -NoNewline
if ($ok) { Write-Host "$val tables (>= 9)" -ForegroundColor Green; $passed++ } else { Write-Host "$val tables (expected >= 9)" -ForegroundColor Red; $failed++ }

# 1.9 tables.by_access.READ > 0
$val = $json.tables.by_access.READ.Count
$ok = $val -gt 0
Write-Host "1.9 tables.by_access.READ: " -NoNewline
if ($ok) { Write-Host "$val tables" -ForegroundColor Green; $passed++ } else { Write-Host "$val tables (expected > 0)" -ForegroundColor Red; $failed++ }

# 1.10 statistics present
$taskCount = $json.statistics.task_count
$exprCount = $json.statistics.expression_count
$ok = $taskCount -and $exprCount
Write-Host "1.10 statistics: " -NoNewline
if ($ok) { Write-Host "task_count=$taskCount, expression_count=$exprCount" -ForegroundColor Green; $passed++ } else { Write-Host "MISSING" -ForegroundColor Red; $failed++ }

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passed / 10" -ForegroundColor $(if ($passed -eq 10) { "Green" } else { "Yellow" })
Write-Host "Failed: $failed / 10" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
