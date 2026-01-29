# Validate Phase 3 criteria
param([string]$JsonPath = "output/ADH-IDE-237/decoded.json")

$json = Get-Content $JsonPath | ConvertFrom-Json

Write-Host "=== Phase 3 Validation Criteria ===" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

# 3.1 statistics.coverage_percent = 100%
$val = $json.statistics.coverage_percent
$ok = $val -eq 100
Write-Host "3.1 statistics.coverage_percent: " -NoNewline
if ($ok) { Write-Host "$val%" -ForegroundColor Green; $passed++ } else { Write-Host "$val% (expected 100%)" -ForegroundColor Red; $failed++ }

# 3.2 statistics.decoded_count = total_in_program
$decoded = $json.statistics.decoded_count
$total = $json.statistics.total_in_program
$ok = $decoded -eq $total
Write-Host "3.2 decoded_count = total_in_program: " -NoNewline
if ($ok) { Write-Host "$decoded = $total" -ForegroundColor Green; $passed++ } else { Write-Host "$decoded != $total" -ForegroundColor Red; $failed++ }

# 3.3 business_rules_count >= 15
$val = $json.statistics.business_rules_count
$ok = $val -ge 15
Write-Host "3.3 business_rules_count: " -NoNewline
if ($ok) { Write-Host "$val (>= 15)" -ForegroundColor Green; $passed++ } else { Write-Host "$val (expected >= 15)" -ForegroundColor Red; $failed++ }

# 3.4 expressions.all[].decoded without {0,N}
$first = $json.expressions.all | Where-Object { $_.decoded -match '\{0,\d+\}' } | Select-Object -First 1
$ok = $null -eq $first
Write-Host "3.4 expressions decoded (no {0,N}): " -NoNewline
if ($ok) { Write-Host "OK - no raw refs" -ForegroundColor Green; $passed++ } else { Write-Host "FAIL - found '$($first.decoded)'" -ForegroundColor Red; $failed++ }

# 3.5 business_rules.all[].id format RM-001
$first = $json.business_rules.all[0]
$ok = $first.id -match '^RM-\d{3}$'
Write-Host "3.5 business_rules.all[].id: " -NoNewline
if ($ok) { Write-Host "'$($first.id)'" -ForegroundColor Green; $passed++ } else { Write-Host "'$($first.id)' (expected RM-XXX)" -ForegroundColor Red; $failed++ }

# 3.6 business_rules.all[].natural_language NOT truncated
$hasEllipsis = $json.business_rules.all | Where-Object { $_.natural_language -match '\.\.\.$' -and $_.natural_language.Length -lt 100 } | Select-Object -First 1
$ok = $null -eq $hasEllipsis
Write-Host "3.6 business_rules not truncated: " -NoNewline
if ($ok) { Write-Host "OK - no truncation" -ForegroundColor Green; $passed++ } else { Write-Host "FAIL - found truncated" -ForegroundColor Red; $failed++ }

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passed / 6" -ForegroundColor $(if ($passed -eq 6) { "Green" } else { "Yellow" })
Write-Host "Failed: $failed / 6" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

# Sample rules
Write-Host ""
Write-Host "=== Sample Business Rules ===" -ForegroundColor Cyan
$json.business_rules.all | Select-Object -First 3 | ForEach-Object {
    $text = $_.natural_language
    if ($text.Length -gt 100) { $text = $text.Substring(0, 97) + "..." }
    Write-Host "  [$($_.id)] $text"
}
