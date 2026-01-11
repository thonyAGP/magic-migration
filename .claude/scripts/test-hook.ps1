# Test script for PostToolUse hook validation

$testInput = @'
{
  "tool_name": "Task",
  "tool_input": {
    "subagent_type": "magic-analyzer",
    "prompt": "Analyze ADH program"
  },
  "tool_output": "Le programme Prg_69 contient la variable {0,3} qui reference FieldID=25. La table DataObject ISN=40 est utilisee dans Task ISN_2=5."
}
'@

Write-Host "=== TEST 1: With violations ===" -ForegroundColor Cyan
$testInput | & "$PSScriptRoot\validate-magic-ide-format.ps1"
Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Gray
Write-Host ""

# Test 2: Clean output (no violations)
$cleanInput = @'
{
  "tool_name": "Task",
  "tool_input": {
    "subagent_type": "magic-analyzer",
    "prompt": "Analyze ADH program"
  },
  "tool_output": "Le programme ADH IDE 69 - EXTRAIT_COMPTE contient la variable D qui est liee a la Table n40 - operations. La sous-tache 69.3 ligne 21 effectue le calcul."
}
'@

Write-Host "=== TEST 2: Clean output (no violations) ===" -ForegroundColor Cyan
$cleanInput | & "$PSScriptRoot\validate-magic-ide-format.ps1"
Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Gray
Write-Host ""

# Test 3: Non-Magic agent (should skip)
$nonMagicInput = @'
{
  "tool_name": "Task",
  "tool_input": {
    "subagent_type": "general-purpose",
    "prompt": "Search for files"
  },
  "tool_output": "Found 5 files matching pattern."
}
'@

Write-Host "=== TEST 3: Non-Magic agent (should skip) ===" -ForegroundColor Cyan
$nonMagicInput | & "$PSScriptRoot\validate-magic-ide-format.ps1"
Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Gray
Write-Host ""

Write-Host "=== TESTS COMPLETE ===" -ForegroundColor Green
