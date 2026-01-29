# Validate Phase 2 criteria
param([string]$JsonPath = "output/ADH-IDE-237/mapping.json")

$json = Get-Content $JsonPath | ConvertFrom-Json

Write-Host "=== Phase 2 Validation Criteria ===" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

# 2.1 variables.local >= 100
$val = $json.variables.local.Count
$ok = $val -ge 100
Write-Host "2.1 variables.local: " -NoNewline
if ($ok) { Write-Host "$val items (>= 100)" -ForegroundColor Green; $passed++ } else { Write-Host "$val items (expected >= 100)" -ForegroundColor Red; $failed++ }

# 2.2 variables.local[].letter exists
$first = $json.variables.local[0]
$ok = $first.letter -match "^[A-Z]{1,2}$"
Write-Host "2.2 variables.local[].letter: " -NoNewline
if ($ok) { Write-Host "'$($first.letter)' (A-ZZ format)" -ForegroundColor Green; $passed++ } else { Write-Host "MISSING or invalid" -ForegroundColor Red; $failed++ }

# 2.3 variables.local[].name lisible
$ok = $first.name -and $first.name.Length -gt 0
Write-Host "2.3 variables.local[].name: " -NoNewline
if ($ok) { Write-Host "'$($first.name)'" -ForegroundColor Green; $passed++ } else { Write-Host "MISSING" -ForegroundColor Red; $failed++ }

# 2.4 variables.local[].data_type
$ok = $first.data_type -match "Alpha|Numeric|Logical|Date|Time|Blob"
Write-Host "2.4 variables.local[].data_type: " -NoNewline
if ($ok) { Write-Host "'$($first.data_type)'" -ForegroundColor Green; $passed++ } else { Write-Host "'$($first.data_type)' (expected Alpha/Numeric/etc)" -ForegroundColor Red; $failed++ }

# 2.5 variable_mapping present
$mappingCount = ($json.variable_mapping | Get-Member -MemberType NoteProperty).Count
$ok = $mappingCount -gt 0
Write-Host "2.5 variable_mapping: " -NoNewline
if ($ok) { Write-Host "$mappingCount entries" -ForegroundColor Green; $passed++ } else { Write-Host "EMPTY" -ForegroundColor Red; $failed++ }

# 2.6 statistics.mapping_entries > 0
$val = $json.statistics.mapping_entries
$ok = $val -gt 0
Write-Host "2.6 statistics.mapping_entries: " -NoNewline
if ($ok) { Write-Host "$val" -ForegroundColor Green; $passed++ } else { Write-Host "$val (expected > 0)" -ForegroundColor Red; $failed++ }

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passed / 6" -ForegroundColor $(if ($passed -eq 6) { "Green" } else { "Yellow" })
Write-Host "Failed: $failed / 6" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

# Sample data
Write-Host ""
Write-Host "=== Sample Variables ===" -ForegroundColor Cyan
$json.variables.local | Select-Object -First 5 | ForEach-Object {
    Write-Host "  $($_.letter): $($_.name) ($($_.data_type))"
}
