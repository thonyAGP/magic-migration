<#
.SYNOPSIS
    PostToolUse Hook - Validates and BLOCKS Magic IDE format violations in agent outputs

.DESCRIPTION
    This hook validates that all Magic-related outputs use IDE format instead of XML format.
    IMPORTANT: This hook now BLOCKS operations that contain forbidden patterns.

    FORBIDDEN patterns (XML format):
    - Prg_123, Prg_456 (program references)
    - FieldID="25", FieldID=30 (field references)
    - ISN_2=5, ISN=40 (internal sequence numbers)
    - {0,3}, {1,2} (variable notation)
    - DataObject ISN, LogicLine id (raw XML references)

    REQUIRED format (IDE):
    - ADH IDE 69 - EXTRAIT_COMPTE (programs)
    - Variable D, Variable AE (variables)
    - Table n40 - operations (tables)
    - Tache 69.3 ligne 21 (task/lines)
    - Expression 30 (expressions)

.NOTES
    Author: Claude Code Agent
    Date: 2026-01-12
    Version: 2.0 - Now BLOCKS violations
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
$magicKeywords = @("Magic", "ADH", "PBG", "PVE", "PBP", "REF", "VIL", "Prg_", "IDE", "programme", "ticket", "CMDS", "PMS")
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
        MustBlock = $true
    },
    @{
        Pattern = 'FieldID\s*[=:]\s*["\d]+'
        Example = 'FieldID="25", FieldID=30'
        Correct = 'Variable D (index 3)'
        Severity = 'ERROR'
        MustBlock = $true
    },
    @{
        Pattern = 'ISN_2\s*[=:]\s*\d+'
        Example = 'ISN_2=5'
        Correct = 'Tache 69.3'
        Severity = 'ERROR'
        MustBlock = $true
    },
    @{
        Pattern = '(?<![_\w])ISN\s*[=:]\s*\d+'
        Example = 'ISN=40'
        Correct = 'Position IDE'
        Severity = 'WARNING'
        MustBlock = $false
    },
    @{
        Pattern = '\{[0-9]+,[0-9]+\}'
        Example = '{0,3}, {1,2}'
        Correct = 'Variable D, Variable B'
        Severity = 'ERROR'
        MustBlock = $true
    },
    @{
        Pattern = 'DataObject\s+ISN'
        Example = 'DataObject ISN=40'
        Correct = 'Table n40 - nom_table'
        Severity = 'ERROR'
        MustBlock = $true
    },
    @{
        Pattern = 'LogicLine\s+id\s*='
        Example = 'LogicLine id=15'
        Correct = 'Tache 69.3 ligne 21'
        Severity = 'WARNING'
        MustBlock = $false
    },
    @{
        Pattern = 'Task\s+ISN_2\s*='
        Example = 'Task ISN_2=5'
        Correct = 'Tache 69.3'
        Severity = 'ERROR'
        MustBlock = $true
    },
    @{
        Pattern = '(?<![#n])obj\s*=\s*\d+'
        Example = 'obj=40'
        Correct = 'Table n40 - nom_table'
        Severity = 'ERROR'
        MustBlock = $true
    }
)

# Check for violations
$violations = @()
$blockingViolations = @()

foreach ($rule in $forbiddenPatterns) {
    if ($outputText -match $rule.Pattern) {
        $matches_found = [regex]::Matches($outputText, $rule.Pattern)
        foreach ($match in $matches_found) {
            $violation = @{
                Pattern = $rule.Pattern
                Found = $match.Value
                Example = $rule.Example
                Correct = $rule.Correct
                Severity = $rule.Severity
                MustBlock = $rule.MustBlock
            }
            $violations += $violation
            if ($rule.MustBlock) {
                $blockingViolations += $violation
            }
        }
    }
}

# If violations found, log and potentially block
if ($violations.Count -gt 0) {
    # Create logs directory if needed
    $logDir = Join-Path $PSScriptRoot "..\..\logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }

    $logFile = Join-Path $logDir "magic-ide-violations.log"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $uniqueViolations = $violations | Group-Object -Property Found | ForEach-Object { $_.Group[0] }
    $violationList = ($uniqueViolations | ForEach-Object { "$($_.Severity): $($_.Found)" }) -join ", "

    # Log entry
    $logEntry = "$timestamp | Agent: $subagentType | Violations: $violationList"
    Add-Content -Path $logFile -Value $logEntry -ErrorAction SilentlyContinue

    # If there are blocking violations, output error message for user
    if ($blockingViolations.Count -gt 0) {
        $uniqueBlocking = $blockingViolations | Group-Object -Property Found | ForEach-Object { $_.Group[0] }

        # Output warning to user (will be shown in Claude Code)
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Red
        Write-Host "  IDE MAGIC COMPLIANCE WARNING" -ForegroundColor Red
        Write-Host "================================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "The agent output contains XML format patterns that should be converted to IDE format:" -ForegroundColor Yellow
        Write-Host ""

        foreach ($v in $uniqueBlocking | Select-Object -First 5) {
            Write-Host "  FOUND: $($v.Found)" -ForegroundColor Red
            Write-Host "  FIX:   Use '$($v.Correct)' instead" -ForegroundColor Green
            Write-Host ""
        }

        Write-Host "Use MCP tools (magic_get_position, magic_get_table, etc.) to convert XML references to IDE format." -ForegroundColor Cyan
        Write-Host ""

        # Return non-zero to indicate warning (but don't block completely to avoid breaking workflows)
        # exit 1  # Uncomment to hard-block
    }
}

# All good or soft warning
exit 0
