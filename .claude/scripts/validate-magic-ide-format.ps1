<#
.SYNOPSIS
    PostToolUse Hook - Validates Magic IDE format in agent outputs

.DESCRIPTION
    This hook validates that all Magic-related outputs use IDE format instead of XML format.

    FORBIDDEN patterns (XML format):
    - Prg_123, Prg_456 (program references)
    - FieldID="25", FieldID=30 (field references)
    - ISN_2=5, ISN=40 (internal sequence numbers)
    - {0,3}, {1,2} (variable notation)
    - DataObject ISN, LogicLine id (raw XML references)

    REQUIRED format (IDE):
    - ADH IDE 69 - EXTRAIT_COMPTE (programs)
    - Variable D, Variable AE (variables)
    - Table n°40 - operations (tables)
    - Tache 69.3 ligne 21 (task/lines)
    - Expression 30 (expressions)

.NOTES
    Author: Claude Code Agent
    Date: 2026-01-11
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
    # Not valid JSON, skip validation
    exit 0
}

# Extract tool name and output
$toolName = $hookData.tool_name
$toolInput = $hookData.tool_input
$toolOutput = $hookData.tool_output

# Only validate for Task tool outputs (subagents)
if ($toolName -ne "Task") {
    exit 0
}

# Check if this is a Magic-related agent
$prompt = ""
if ($toolInput -and $toolInput.prompt) {
    $prompt = $toolInput.prompt
}
$subagentType = ""
if ($toolInput -and $toolInput.subagent_type) {
    $subagentType = $toolInput.subagent_type
}

# Only validate Magic-related agents
$magicAgents = @("magic-router", "magic-analyzer", "magic-debugger", "magic-migrator", "magic-documenter", "Explore")
$isMagicAgent = $magicAgents -contains $subagentType

# Also check if prompt mentions Magic
$magicKeywords = @("Magic", "ADH", "PBG", "PVE", "PBP", "REF", "VIL", "Prg_", "IDE")
$hasMagicContext = $false
foreach ($keyword in $magicKeywords) {
    if ($prompt -match $keyword) {
        $hasMagicContext = $true
        break
    }
}

if (-not $isMagicAgent -and -not $hasMagicContext) {
    exit 0
}

# Get the output to validate
$outputText = ""
if ($toolOutput) {
    if ($toolOutput -is [string]) {
        $outputText = $toolOutput
    } else {
        $outputText = $toolOutput | ConvertTo-Json -Depth 10
    }
}

if ([string]::IsNullOrWhiteSpace($outputText)) {
    exit 0
}

# Define forbidden patterns with explanations
$forbiddenPatterns = @(
    @{
        Pattern = 'Prg_\d+'
        Example = 'Prg_69, Prg_180'
        Correct = 'ADH IDE 69 - EXTRAIT_COMPTE'
        Severity = 'ERROR'
    },
    @{
        Pattern = 'FieldID\s*[=:]\s*["\d]+'
        Example = 'FieldID="25", FieldID=30'
        Correct = 'Variable D (index 3)'
        Severity = 'ERROR'
    },
    @{
        Pattern = 'ISN_2\s*[=:]\s*\d+'
        Example = 'ISN_2=5'
        Correct = 'Tache 69.3'
        Severity = 'ERROR'
    },
    @{
        Pattern = 'ISN\s*[=:]\s*\d+'
        Example = 'ISN=40'
        Correct = 'Table n40 - operations'
        Severity = 'WARNING'
    },
    @{
        Pattern = '\{[0-9]+,[0-9]+\}'
        Example = '{0,3}, {1,2}'
        Correct = 'Variable D, Variable B'
        Severity = 'ERROR'
    },
    @{
        Pattern = 'DataObject\s+ISN'
        Example = 'DataObject ISN=40'
        Correct = 'Table n40 - nom_table'
        Severity = 'ERROR'
    },
    @{
        Pattern = 'LogicLine\s+id\s*='
        Example = 'LogicLine id=15'
        Correct = 'Tache 69.3 ligne 21'
        Severity = 'WARNING'
    },
    @{
        Pattern = 'Task\s+ISN_2\s*='
        Example = 'Task ISN_2=5'
        Correct = 'Tache 69.3'
        Severity = 'ERROR'
    }
)

# Check for violations
$violations = @()

foreach ($rule in $forbiddenPatterns) {
    if ($outputText -match $rule.Pattern) {
        $matches_found = [regex]::Matches($outputText, $rule.Pattern)
        foreach ($match in $matches_found) {
            $violations += @{
                Pattern = $rule.Pattern
                Found = $match.Value
                Example = $rule.Example
                Correct = $rule.Correct
                Severity = $rule.Severity
            }
        }
    }
}

# If violations found, output warning (don't block, just warn)
if ($violations.Count -gt 0) {
    $errorCount = ($violations | Where-Object { $_.Severity -eq 'ERROR' }).Count
    $warningCount = ($violations | Where-Object { $_.Severity -eq 'WARNING' }).Count

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host " MAGIC IDE FORMAT VALIDATION" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""

    if ($errorCount -gt 0) {
        Write-Host " $errorCount ERROR(s) - XML format detected!" -ForegroundColor Red
    }
    if ($warningCount -gt 0) {
        Write-Host " $warningCount WARNING(s) - Potential XML format" -ForegroundColor DarkYellow
    }

    Write-Host ""
    Write-Host " Violations found:" -ForegroundColor White
    Write-Host ""

    $uniqueViolations = $violations | Group-Object -Property Found | ForEach-Object { $_.Group[0] }

    foreach ($v in $uniqueViolations) {
        $color = if ($v.Severity -eq 'ERROR') { 'Red' } else { 'DarkYellow' }
        Write-Host "   [$($v.Severity)] Found: $($v.Found)" -ForegroundColor $color
        Write-Host "          Correct: $($v.Correct)" -ForegroundColor Green
        Write-Host ""
    }

    Write-Host " Reminder: Use MCP tools for conversion:" -ForegroundColor Cyan
    Write-Host "   - magic_get_position <projet> <prg>" -ForegroundColor Gray
    Write-Host "   - magic_get_line <projet> <tache> <ligne>" -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""

    # Return result as JSON for Claude Code
    $result = @{
        status = "warning"
        message = "Magic IDE format violations detected"
        error_count = $errorCount
        warning_count = $warningCount
        violations = $uniqueViolations | ForEach-Object {
            @{
                found = $_.Found
                correct_format = $_.Correct
                severity = $_.Severity
            }
        }
    }

    # Don't block execution, just warn
    # To block, uncomment: exit 1
    exit 0
}

# All good, no violations
exit 0
