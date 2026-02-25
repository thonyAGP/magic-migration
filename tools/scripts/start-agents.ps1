<#
.SYNOPSIS
    Launch Claude Code with Agent Teams for ClubMed\LecteurMagic
.DESCRIPTION
    Starts a Claude Code session with 5 specialized agents for Magic Unipaas migration:
    - magic-router: Lead agent, intent detection and routing (existing)
    - spec-validator: Batch validation of 3,996 generated specs
    - migration-coder: C#/.NET 8 code generation from Magic specs
    - test-runner: MCP tools testing and integration validation
    - module-explorer: Deep analysis of unexplored modules (PBP, PVE, PBG)
.PARAMETER Mode
    Agent mode: "subagents" (default) or "team" (experimental peer-to-peer)
.PARAMETER Model
    Model for lead agent: "opus" (default), "sonnet"
.PARAMETER Task
    Optional initial task to execute
.PARAMETER Focus
    Focus area: "all" (default), "specs", "migration", "testing", "exploration"
.EXAMPLE
    .\start-agents.ps1
    .\start-agents.ps1 -Focus migration
    .\start-agents.ps1 -Mode team -Task "Validate all ADH specs"
#>
param(
    [ValidateSet("subagents", "team")]
    [string]$Mode = "team",

    [ValidateSet("opus", "sonnet")]
    [string]$Model = "opus",

    [string]$Task = "",

    [ValidateSet("all", "specs", "migration", "testing", "exploration")]
    [string]$Focus = "all"
)

$ProjectDir = "D:\Projects\ClubMed\LecteurMagic"
$KbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"
$SourcePath = "D:\Data\Migration\XPA\PMS"

# Agent definitions
$agents = @{
    "spec-validator" = @{
        description = "Spec validation specialist. Use to batch-validate generated specs against Magic XML sources and detect inconsistencies."
        prompt      = @"
You are a spec validation expert for Magic Unipaas migration.
Your job: validate the 3,996 auto-generated specs in .openspec/specs/ against actual Magic XML sources.

Key paths:
- Specs: $ProjectDir/.openspec/specs/
- Magic sources: $SourcePath
- KB database: $KbPath
- Spec pipeline: $ProjectDir/tools/spec-pipeline-v72/

Validation checks:
1. Table references match actual DataView definitions
2. Parameter counts match program headers
3. Call graph matches KB callers/callees data
4. Expression descriptions match decoded values
5. Task count matches actual tree structure

ALWAYS use IDE format: [PROJECT] IDE [N] - [Name]
NEVER reference XML raw (Prg_XXX, ISN, FieldID)
Use magic_get_position for conversions when available.

Output: validation report with pass/fail per spec, issues found.
"@
        tools       = @("Read", "Grep", "Glob", "Bash")
        model       = "sonnet"
    }
    "migration-coder" = @{
        description = "C#/.NET 8 migration specialist. Use for generating Clean Architecture code from Magic program specs."
        prompt      = @"
You are a senior .NET 8 developer migrating Magic Unipaas to C# Clean Architecture + CQRS.

Architecture:
- API: ASP.NET Core Minimal API
- CQRS: MediatR handlers
- ORM: Entity Framework Core
- Tests: xUnit
- Existing API: $ProjectDir/API/

Patterns established in API Caisse (reference):
- Controllers: thin, delegate to MediatR
- Commands/Queries: one per use case
- Validators: FluentValidation
- Repositories: EF Core with explicit column selection

Migration workflow:
1. Read the spec (.openspec/specs/[project]-[id].md)
2. Identify tables, parameters, business rules
3. Generate: Entity, Repository, Command/Query, Handler, Controller, Tests
4. Follow naming: PascalCase, async suffix, I-prefix for interfaces

ALWAYS generate unit tests alongside code.
NEVER use 'var' when type is ambiguous. Use explicit types.
"@
        tools       = @("Read", "Edit", "Write", "Glob", "Grep", "Bash")
        model       = "sonnet"
    }
    "test-runner" = @{
        description = "Testing specialist. Use to run MCP tool tests, .NET tests, and validate infrastructure integrity."
        prompt      = @"
You are a QA engineer for the Magic migration infrastructure.

Test targets:
- MCP tools: 97 tools in $ProjectDir/tools/MagicMcp/
- .NET tests: dotnet test in $ProjectDir/tools/MagicMcp/
- KB integrity: $ProjectDir/tools/validate-kb.ps1
- Spec pipeline: $ProjectDir/tools/spec-pipeline-v72/

Test workflow:
1. Build: dotnet build $ProjectDir/tools/MagicMcp/
2. Run unit tests: dotnet test $ProjectDir/tools/MagicMcp/
3. Validate KB: powershell -File $ProjectDir/tools/validate-kb.ps1
4. Check spec consistency

Report format:
- Tests: X passed, Y failed
- KB: X tables, Y programs indexed
- Issues: [list with severity]
"@
        tools       = @("Read", "Grep", "Glob", "Bash")
        model       = "haiku"
    }
    "module-explorer" = @{
        description = "Module exploration specialist. Use to deep-analyze unexplored Magic modules (PBP, PVE, PBG, Import)."
        prompt      = @"
You are a Magic Unipaas analyst exploring uncharted modules for migration planning.

Modules to explore:
- PBP (419 programs): Editions, exports, batch printing
- PVE (449 programs): POS, mobile, stock management
- PBG (394 programs): Planning, batch processing
- Import (456 programs): Data ingestion

Magic XML sources: $SourcePath
KB database: $KbPath

Analysis workflow per module:
1. List all programs: magic_list_programs or KB search
2. Identify entry points (MainProgram, PublicName)
3. Map call graph (top 20 most-called programs)
4. Identify shared tables with ADH (cross-module dependencies)
5. Classify programs: active, orphan, dead code
6. Estimate migration complexity (simple/medium/complex)

ALWAYS use IDE format. NEVER raw XML references.
Output: module report with program inventory, dependency map, migration roadmap.
"@
        tools       = @("Read", "Grep", "Glob", "Bash")
        model       = "sonnet"
    }
    "pattern-hunter" = @{
        description = "Pattern capitalization specialist. Use to identify recurring patterns from tickets and document them in KB."
        prompt      = @"
You are a pattern analyst for Magic Unipaas bug resolution.

Your job: identify recurring bug patterns from resolved tickets and capitalize them in the KB.

Key paths:
- Resolved tickets: $ProjectDir/.openspec/tickets/
- Existing patterns: $ProjectDir/.openspec/patterns/ (17 patterns)
- Ticket pipeline: $ProjectDir/tools/ticket-pipeline/

Pattern template:
## [Pattern Name]
- **Ticket**: PMS-XXXX / CMDS-XXXXXX
- **Symptom**: What the user sees
- **Root Cause**: Technical explanation
- **Location**: [PROJECT] IDE [N] Task [X.Y] Line [Z]
- **Fix**: Step-by-step resolution
- **Detection**: How to find similar issues
- **Prevention**: How to avoid in future

Workflow:
1. Read existing patterns to avoid duplicates
2. Analyze unprocessed tickets
3. Extract common root causes
4. Document new patterns with full context
5. Link patterns to affected programs

Target: 30 documented patterns (currently 17).
"@
        tools       = @("Read", "Write", "Grep", "Glob")
        model       = "sonnet"
    }
}

# Filter agents by focus
if ($Focus -ne "all") {
    $focusMap = @{
        "specs"       = @("spec-validator")
        "migration"   = @("migration-coder", "test-runner")
        "testing"     = @("test-runner", "spec-validator")
        "exploration" = @("module-explorer", "pattern-hunter")
    }
    $keepAgents = $focusMap[$Focus]
    $filteredAgents = @{}
    foreach ($key in $agents.Keys) {
        if ($key -in $keepAgents) {
            $filteredAgents[$key] = $agents[$key]
        }
    }
    $agents = $filteredAgents
}

# Convert to JSON
$agentsJson = $agents | ConvertTo-Json -Depth 3 -Compress

Write-Host ""
Write-Host "=== ClubMed\LecteurMagic - Agent Teams ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Mode   : $Mode" -ForegroundColor Yellow
Write-Host "  Model  : $Model (lead)" -ForegroundColor Yellow
Write-Host "  Focus  : $Focus" -ForegroundColor Yellow
Write-Host "  Agents :" -ForegroundColor Yellow
foreach ($name in $agents.Keys | Sort-Object) {
    $m = $agents[$name].model
    Write-Host "    - $name ($m)" -ForegroundColor White
}
Write-Host "  Dir    : $ProjectDir" -ForegroundColor DarkGray
Write-Host "  KB     : $KbPath" -ForegroundColor DarkGray
Write-Host "  Sources: $SourcePath" -ForegroundColor DarkGray
Write-Host ""

# Build command
$cmdArgs = @(
    "--dangerously-skip-permissions"
    "--model", $Model
    "--agent", "magic-router"
    "--agents", $agentsJson
)

if ($Mode -eq "team") {
    $env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"
    Write-Host "  [EXPERIMENTAL] Agent Teams mode enabled (peer-to-peer)" -ForegroundColor Magenta
    Write-Host ""
}

if ($Task) {
    Write-Host "  Task   : $Task" -ForegroundColor Green
    Write-Host ""
    $cmdArgs += @("-p", $Task)
}

# Launch
Push-Location $ProjectDir
try {
    claude @cmdArgs
}
finally {
    Pop-Location
    if ($Mode -eq "team") {
        Remove-Item Env:\CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS -ErrorAction SilentlyContinue
    }
}
