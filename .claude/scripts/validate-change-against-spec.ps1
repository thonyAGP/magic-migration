# validate-change-against-spec.ps1
# Validate proposed changes against program specifications
# Returns JSON with validation results

param(
    [Parameter(Mandatory=$true)]
    [string]$TicketKey,

    [Parameter(Mandatory=$true)]
    [string[]]$ModifiedPrograms,  # Format: "ADH:238", "ADH:245"

    [string[]]$ChangedTables,     # Format: "849", "263"

    [string]$OpenspecPath = ".openspec",

    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# ============================================================================
# SPEC LOADING
# ============================================================================

function Get-Spec {
    param(
        [string]$Project,
        [int]$IdePosition,
        [string]$SpecsPath
    )

    $specFile = Join-Path $SpecsPath "$Project-IDE-$IdePosition.md"
    if (-not (Test-Path $specFile)) {
        return $null
    }

    $content = Get-Content $specFile -Raw -Encoding UTF8

    $spec = @{
        Project = $Project
        IdePosition = $IdePosition
        Title = ""
        Tables = @()
        Parameters = @()
        Variables = @()
        ExpressionCount = 0
    }

    # Parse title
    if ($content -match '# ([^\r\n]+)') {
        $spec.Title = $Matches[1].Trim()
    }

    # Parse tables: | #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
    $tableMatches = [regex]::Matches($content, '\| #(\d+) \| `([^`]+)` \| ([^|]+) \| \*?\*?([WR])\*?\*? \| (\d+)x \|')
    foreach ($match in $tableMatches) {
        $spec.Tables += @{
            Id = [int]$match.Groups[1].Value
            PhysicalName = $match.Groups[2].Value.Trim()
            LogicalName = $match.Groups[3].Value.Trim()
            Access = $match.Groups[4].Value
            UsageCount = [int]$match.Groups[5].Value
        }
    }

    # Parse expression count
    if ($content -match '## 5\. EXPRESSIONS \((\d+) total') {
        $spec.ExpressionCount = [int]$Matches[1]
    }

    return $spec
}

# ============================================================================
# VALIDATION
# ============================================================================

$results = @{
    TicketKey = $TicketKey
    ValidationTime = (Get-Date).ToString("o")
    IsValid = $true
    Warnings = @()
    Errors = @()
    Recommendations = @()
    SpecsFound = @()
    SpecsNotFound = @()
}

$specsDir = Join-Path $OpenspecPath "specs"

# Validate each modified program
foreach ($progRef in $ModifiedPrograms) {
    if ($progRef -match '^([A-Z]+):(\d+)$') {
        $project = $Matches[1]
        $idePos = [int]$Matches[2]

        $spec = Get-Spec -Project $project -IdePosition $idePos -SpecsPath $specsDir

        if ($null -eq $spec) {
            $results.SpecsNotFound += "$project IDE $idePos"
            $results.Warnings += @{
                Type = "SPEC_NOT_FOUND"
                Program = "$project IDE $idePos"
                Message = "No spec found for $project IDE $idePos. Consider generating spec before modifying."
                Severity = "Medium"
            }
            continue
        }

        $results.SpecsFound += @{
            Program = "$project IDE $idePos"
            Title = $spec.Title
            TableCount = $spec.Tables.Count
            WriteTableCount = ($spec.Tables | Where-Object { $_.Access -eq 'W' }).Count
        }

        # Check if changed tables are documented in spec
        if ($ChangedTables) {
            foreach ($tableId in $ChangedTables) {
                $tableInSpec = $spec.Tables | Where-Object { $_.Id -eq [int]$tableId }

                if (-not $tableInSpec) {
                    $results.Errors += @{
                        Type = "UNDOCUMENTED_TABLE"
                        Program = "$project IDE $idePos"
                        TableId = $tableId
                        Message = "Table #$tableId is being modified but not documented in spec for $project IDE $idePos"
                        Severity = "High"
                    }
                    $results.IsValid = $false
                }
                elseif ($tableInSpec.Access -eq 'R') {
                    $results.Warnings += @{
                        Type = "READ_ONLY_TABLE_MODIFIED"
                        Program = "$project IDE $idePos"
                        TableId = $tableId
                        TableName = $tableInSpec.PhysicalName
                        Message = "Table #$tableId ($($tableInSpec.PhysicalName)) is documented as READ-ONLY but being modified"
                        Severity = "High"
                    }
                }
            }
        }

        # Check for high-impact tables (written by multiple specs)
        $writesTables = $spec.Tables | Where-Object { $_.Access -eq 'W' }
        if ($writesTables.Count -gt 5) {
            $results.Recommendations += @{
                Type = "HIGH_IMPACT_PROGRAM"
                Program = "$project IDE $idePos"
                WriteTableCount = $writesTables.Count
                Message = "This program writes to $($writesTables.Count) tables. Extra testing recommended."
            }
        }
    }
    else {
        $results.Errors += @{
            Type = "INVALID_PROGRAM_FORMAT"
            Input = $progRef
            Message = "Invalid program format. Expected: PROJECT:IDE (e.g., ADH:238)"
            Severity = "Low"
        }
    }
}

# Check if any changed tables affect other programs (cross-impact)
if ($ChangedTables -and $results.SpecsFound.Count -gt 0) {
    $results.Recommendations += @{
        Type = "CROSS_IMPACT_CHECK"
        Message = "Run magic_kb_table_impact for tables: $($ChangedTables -join ', ') to verify no other programs are affected"
    }
}

# Generate summary
if ($results.Errors.Count -gt 0) {
    $results.IsValid = $false
    $results.Summary = "BLOCKED: $($results.Errors.Count) error(s) found. Review and fix before proceeding."
}
elseif ($results.Warnings.Count -gt 0) {
    $results.Summary = "WARNING: $($results.Warnings.Count) warning(s). Proceed with caution."
}
else {
    $results.Summary = "PASSED: All checks passed. Changes align with documented specs."
}

# Output JSON
$results | ConvertTo-Json -Depth 10
