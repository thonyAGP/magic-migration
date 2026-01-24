<#
.SYNOPSIS
    Extract structured context from Jira ticket for Magic analysis.
    Automates manual extraction of symptom, input data, expected/actual results.

.PARAMETER TicketFile
    Path to the Jira ticket JSON/text file (from jira-fetch.ps1)

.OUTPUTS
    JSON object with extracted context ready for analysis
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$TicketFile
)

$ErrorActionPreference = "Stop"

# Load dynamic config
$configPath = "D:\Projects\Lecteur_Magic\.openspec\magic-config.json"
$config = $null
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
}

function Extract-Section {
    param([string]$Content, [string[]]$Patterns, [string]$DefaultValue = "Non spÃ©cifiÃ©")

    foreach ($pattern in $Patterns) {
        if ($Content -match "(?i)$pattern[:\s]*([^\n]+(?:\n(?![A-Z]).*)*)" ) {
            $match = $Matches[1].Trim()
            if ($match.Length -gt 10) {
                return $match -replace '\s+', ' '
            }
        }
    }
    return $DefaultValue
}

function Extract-Entities {
    param([string]$Content)

    $entities = @{
        Programs = @()
        Tables = @()
        Villages = @()
        Dates = @()
    }

    # Programs: "programme XXX", "program XXX", "PRG_XXX", "IDE XXX"
    $programPatterns = @(
        'programme\s+([A-Z_]+\d*)',
        'program\s+([A-Z_]+\d*)',
        'PRG[_-]?(\d+)',
        'IDE\s+(\d+)',
        '([A-Z]{3,}[_-][A-Z_]+)'
    )
    foreach ($p in $programPatterns) {
        if ($Content -match $p) {
            $entities.Programs += $Matches[1]
        }
    }
    $entities.Programs = $entities.Programs | Select-Object -Unique

    # Tables: "table XXX", SQL table names
    $tablePatterns = @(
        'table\s+([a-z_]+\d*_dat)',
        'table\s+n[Â°o]?\s*(\d+)',
        '(cafil\d+_dat)',
        '(cc[a-z_]+)',
        '([a-z]+_dat)'
    )
    foreach ($p in $tablePatterns) {
        $matches = [regex]::Matches($Content, $p, 'IgnoreCase')
        foreach ($m in $matches) {
            $entities.Tables += $m.Groups[1].Value
        }
    }
    $entities.Tables = $entities.Tables | Select-Object -Unique

    # Villages: 3-letter codes - use dynamic config or fallback
    if ($Content -match '\b([A-Z]{3}\d{4})\b') {
        $entities.Villages += $Matches[1]
    }
    # Use village codes from config or fallback pattern
    $villagePattern = if ($config -and $config.patterns.village) {
        $config.patterns.village
    } else {
        '\b(CSK|VPH|OPU|SMP|CHA|MAR|PLM|TRI|BAH|IXT|PUN|CAN|TUR)\b'
    }
    $villageMatches = [regex]::Matches($Content, $villagePattern, 'IgnoreCase')
    foreach ($m in $villageMatches) {
        $entities.Villages += $m.Groups[1].Value.ToUpperInvariant()
    }
    $entities.Villages = $entities.Villages | Select-Object -Unique

    # Dates: various formats
    $datePatterns = @(
        '(\d{2}/\d{2}/\d{4})',
        '(\d{4}-\d{2}-\d{2})',
        '(\d{2}\s+(?:jan|fev|mar|avr|mai|juin|juil|aout|sep|oct|nov|dec)[a-z]*\s+\d{4})'
    )
    foreach ($p in $datePatterns) {
        $matches = [regex]::Matches($Content, $p, 'IgnoreCase')
        foreach ($m in $matches) {
            $entities.Dates += $m.Groups[1].Value
        }
    }
    $entities.Dates = $entities.Dates | Select-Object -Unique

    return $entities
}

function Extract-TicketMetadata {
    param([string]$Content)

    $metadata = @{
        Key = ""
        Summary = ""
        Reporter = ""
        Created = ""
        Priority = ""
        Status = ""
    }

    # Try JSON format first
    try {
        $json = $Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($json) {
            $metadata.Key = $json.key
            $metadata.Summary = $json.fields.summary
            $metadata.Reporter = $json.fields.reporter.displayName
            $metadata.Created = $json.fields.created
            $metadata.Priority = $json.fields.priority.name
            $metadata.Status = $json.fields.status.name
            return $metadata
        }
    } catch {}

    # Fallback to text parsing
    if ($Content -match '(?i)key[:\s]+([A-Z]+-\d+)') { $metadata.Key = $Matches[1] }
    if ($Content -match '(?i)summary[:\s]+(.+)') { $metadata.Summary = $Matches[1].Trim() }
    if ($Content -match '(?i)reporter[:\s]+(.+)') { $metadata.Reporter = $Matches[1].Trim() }
    if ($Content -match '(?i)created[:\s]+(.+)') { $metadata.Created = $Matches[1].Trim() }

    return $metadata
}

# Main execution
if (-not (Test-Path $TicketFile)) {
    Write-Error "Ticket file not found: $TicketFile"
    exit 1
}

$content = Get-Content $TicketFile -Raw -Encoding UTF8

# Extract metadata
$metadata = Extract-TicketMetadata -Content $content

# Extract context sections
$symptomPatterns = @('symptom', 'symptÃ´me', 'problem', 'problÃ¨me', 'issue', 'bug', 'erreur', 'error')
$inputPatterns = @('input', 'donnÃ©es', 'data', 'entrÃ©e', 'contexte', 'context', 'scenario')
$expectedPatterns = @('expected', 'attendu', 'should', 'devrait', 'correct', 'normal')
$actualPatterns = @('actual', 'obtenu', 'got', 'rÃ©sultat', 'result', 'currently', 'actuellement')

$context = @{
    Metadata = $metadata
    Symptom = Extract-Section -Content $content -Patterns $symptomPatterns
    InputData = Extract-Section -Content $content -Patterns $inputPatterns
    Expected = Extract-Section -Content $content -Patterns $expectedPatterns
    Actual = Extract-Section -Content $content -Patterns $actualPatterns
    Entities = Extract-Entities -Content $content
    RawContentLength = $content.Length
    ExtractedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
}

# Output as JSON
$context | ConvertTo-Json -Depth 4

# Also output human-readable summary
Write-Host ""
Write-Host "=== CONTEXTE EXTRAIT AUTOMATIQUEMENT ===" -ForegroundColor Cyan
Write-Host "Ticket: $($metadata.Key) - $($metadata.Summary)" -ForegroundColor Yellow
Write-Host ""
Write-Host "SYMPTÃ"ME:" -ForegroundColor Green
Write-Host "  $($context.Symptom)"
Write-Host ""
Write-Host "DONNÃ‰ES ENTRÃ‰E:" -ForegroundColor Green
Write-Host "  $($context.InputData)"
Write-Host ""
Write-Host "ATTENDU:" -ForegroundColor Green
Write-Host "  $($context.Expected)"
Write-Host ""
Write-Host "OBTENU:" -ForegroundColor Green
Write-Host "  $($context.Actual)"
Write-Host ""
Write-Host "ENTITÃ‰S DÃ‰TECTÃ‰ES:" -ForegroundColor Green
Write-Host "  Programmes: $($context.Entities.Programs -join ', ')"
Write-Host "  Tables: $($context.Entities.Tables -join ', ')"
Write-Host "  Villages: $($context.Entities.Villages -join ', ')"
Write-Host "  Dates: $($context.Entities.Dates -join ', ')"

