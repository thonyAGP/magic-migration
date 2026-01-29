# Validate Phase 4 criteria
param([string]$JsonPath = "output/ADH-IDE-237/ui_forms.json")

$json = Get-Content $JsonPath | ConvertFrom-Json

Write-Host "=== Phase 4 Validation Criteria ===" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

# 4.1 forms >= 10
$val = $json.forms.Count
$ok = $val -ge 10
Write-Host "4.1 forms: " -NoNewline
if ($ok) { Write-Host "$val items (>= 10)" -ForegroundColor Green; $passed++ } else { Write-Host "$val items (expected >= 10)" -ForegroundColor Red; $failed++ }

# 4.2 forms[].name lisible
$first = $json.forms[0]
$ok = $first.name -and $first.name.Length -gt 0
Write-Host "4.2 forms[].name: " -NoNewline
if ($ok) { Write-Host "'$($first.name)'" -ForegroundColor Green; $passed++ } else { Write-Host "MISSING" -ForegroundColor Red; $failed++ }

# 4.3 forms[].window_type_str
$ok = $first.window_type_str -match "Modal|SDI|MDI|Type\d"
Write-Host "4.3 forms[].window_type_str: " -NoNewline
if ($ok) { Write-Host "'$($first.window_type_str)'" -ForegroundColor Green; $passed++ } else { Write-Host "'$($first.window_type_str)' (expected Modal/SDI/MDI/TypeN)" -ForegroundColor Red; $failed++ }

# 4.4 forms[].dimensions.width > 0 for visible forms
$visibleForm = $json.forms | Where-Object { $_.dimensions.width -gt 0 } | Select-Object -First 1
$ok = $null -ne $visibleForm
Write-Host "4.4 forms[].dimensions.width > 0: " -NoNewline
if ($ok) { Write-Host "$($visibleForm.dimensions.width) (for visible forms)" -ForegroundColor Green; $passed++ } else { Write-Host "No visible form with width" -ForegroundColor Red; $failed++ }

# 4.5 forms[].task_isn2
$ok = $first.task_isn2 -gt 0
Write-Host "4.5 forms[].task_isn2: " -NoNewline
if ($ok) { Write-Host "$($first.task_isn2)" -ForegroundColor Green; $passed++ } else { Write-Host "MISSING" -ForegroundColor Red; $failed++ }

# 4.6 screen_mockup_ascii not empty
$mockup = $json.screen_mockup_ascii
$ok = $mockup.Count -gt 5
Write-Host "4.6 screen_mockup_ascii: " -NoNewline
if ($ok) { Write-Host "$($mockup.Count) lines" -ForegroundColor Green; $passed++ } else { Write-Host "EMPTY or too short" -ForegroundColor Red; $failed++ }

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passed / 6" -ForegroundColor $(if ($passed -eq 6) { "Green" } else { "Yellow" })
Write-Host "Failed: $failed / 6" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

# Sample forms
Write-Host ""
Write-Host "=== Sample Forms ===" -ForegroundColor Cyan
$json.forms | Select-Object -First 5 | ForEach-Object {
    $size = if ($_.dimensions.width -gt 0) { "$($_.dimensions.width)x$($_.dimensions.height)" } else { "N/A" }
    Write-Host "  Task $($_.task_isn2): $($_.name) [$($_.window_type_str)] $size"
}
