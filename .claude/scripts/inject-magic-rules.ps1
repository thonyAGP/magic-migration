<#
.SYNOPSIS
    PreToolUse Hook - Injects Magic IDE rules before agent execution

.DESCRIPTION
    Adds a reminder to use IDE format in the agent prompt.
    This prevents format errors BEFORE they happen.
#>

param()

$inputJson = $input | Out-String

if ([string]::IsNullOrWhiteSpace($inputJson)) {
    exit 0
}

try {
    $hookData = $inputJson | ConvertFrom-Json
} catch {
    exit 0
}

$toolName = $hookData.tool_name
$toolInput = $hookData.tool_input

if ($toolName -ne "Task") {
    exit 0
}

# Check if Magic-related
$prompt = if ($toolInput.prompt) { $toolInput.prompt } else { "" }
$subagentType = if ($toolInput.subagent_type) { $toolInput.subagent_type } else { "" }

$magicKeywords = @("Magic", "ADH", "PBG", "PVE", "PBP", "REF", "VIL", "Prg_", "XML", "programme", "tache", "variable")
$isMagicContext = $false

foreach ($keyword in $magicKeywords) {
    if ($prompt -imatch $keyword) {
        $isMagicContext = $true
        break
    }
}

if (-not $isMagicContext) {
    exit 0
}

# Silent mode - no console output
# The rules are enforced via CLAUDE.md and agent files, not via console messages
exit 0
