<#
.SYNOPSIS
    PreToolUse Hook - Validates Magic IDE format BEFORE writing to ticket files

.DESCRIPTION
    This hook validates that content written to .openspec/tickets/ uses IDE format.
    It runs BEFORE Edit/Write tools and can BLOCK the operation if violations are found.

    Target files: .openspec/tickets/**/*.md

.NOTES
    Author: Claude Code Agent
    Date: 2026-01-12
    Version: 1.0
#>

param()

# Read hook input from STDIN
$inputJson = $input | Out-String

if ([string]::IsNullOrWhiteSpace($inputJson)) {
    exit 0
}

try {
    $hookData = $inputJson | ConvertFrom-Json
} catch {
    exit 0
}

# Extract tool info
$toolName = $hookData.tool_name
$toolInput = $hookData.tool_input

# Only check Edit and Write tools
if ($toolName -notin @("Edit", "Write", "MultiEdit")) {
    exit 0
}

# Get file path
$filePath = $null
if ($toolInput -and $toolInput.file_path) {
    $filePath = $toolInput.file_path
}

if (-not $filePath) {
    exit 0
}

# Only check files in .openspec/tickets/
if ($filePath -notmatch '\.openspec[/\\]tickets[/\\]') {
    exit 0
}

# Get content to be written
$content = ""
if ($toolInput.content) {
    $content = $toolInput.content
}
if ($toolInput.new_string) {
    $content = $toolInput.new_string
}

if ([string]::IsNullOrWhiteSpace($content)) {
    exit 0
}

# Forbidden patterns (must block)
$forbiddenPatterns = @(
    @{ Pattern = 'Prg_\d+'; Name = 'Prg_XXX'; Fix = '[PROJET] IDE [N] - [Nom]' }
    @{ Pattern = '\{[0-9]+,[0-9]+\}'; Name = '{niveau,columnID}'; Fix = 'Variable lettre (A-Z)' }
    @{ Pattern = 'ISN_2\s*[=:]\s*\d+'; Name = 'ISN_2=XX'; Fix = 'Tache X.Y.Z' }
    @{ Pattern = 'FieldID\s*[=:]\s*["\d]+'; Name = 'FieldID'; Fix = 'Variable lettre' }
    @{ Pattern = '(?<![#n])obj\s*=\s*\d+'; Name = 'obj=XX'; Fix = 'Table nXX - [Nom]' }
)

$violations = @()

foreach ($rule in $forbiddenPatterns) {
    $matches = [regex]::Matches($content, $rule.Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    foreach ($match in $matches) {
        $violations += @{
            Pattern = $rule.Name
            Found = $match.Value
            Fix = $rule.Fix
        }
    }
}

if ($violations.Count -gt 0) {
    $uniqueViolations = $violations | Group-Object -Property Found | ForEach-Object { $_.Group[0] }

    # Output BLOCKING message
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  BLOCKED: IDE MAGIC FORMAT VIOLATION" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cannot write to ticket file: $filePath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The following XML format patterns were detected:" -ForegroundColor Yellow
    Write-Host ""

    foreach ($v in $uniqueViolations | Select-Object -First 5) {
        Write-Host "  FOUND: $($v.Found)" -ForegroundColor Red
        Write-Host "  FIX:   Convert to $($v.Fix)" -ForegroundColor Green
        Write-Host ""
    }

    Write-Host "Use MCP tools to convert:" -ForegroundColor Cyan
    Write-Host "  - magic_get_position(project, programId) -> IDE position" -ForegroundColor Cyan
    Write-Host "  - magic_get_table(query) -> Table nXX" -ForegroundColor Cyan
    Write-Host "  - Variable lettre: A-Z, AA-ZZ (voir CLAUDE.md)" -ForegroundColor Cyan
    Write-Host ""

    # BLOCK the operation
    exit 1
}

# All good
exit 0
