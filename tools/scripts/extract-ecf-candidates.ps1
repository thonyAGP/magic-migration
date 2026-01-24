<#
.SYNOPSIS
    Extract ECF candidate programs from Magic projects

.DESCRIPTION
    Scans ProgramHeaders.xml files to identify programs that could be in ECF
    (shared components) based on:
    - Having a PublicName (callable via ProgIdx())
    - Being referenced from other projects (cross-project calls)

.PARAMETER Projects
    Array of project names to scan. Default: all known projects

.PARAMETER OutputFormat
    Output format: 'table', 'json', or 'csharp' (for copy-paste into OrphanDetectionService)

.EXAMPLE
    .\extract-ecf-candidates.ps1 -OutputFormat csharp
#>

param(
    [string[]]$Projects = @("REF", "ADH", "PBP", "PBG", "PVE", "VIL"),
    [ValidateSet("table", "json", "csharp")]
    [string]$OutputFormat = "table"
)

$ErrorActionPreference = "Stop"
$BasePath = "D:\Data\Migration\XPA\PMS"

$results = @{}

foreach ($project in $Projects) {
    $headerPath = Join-Path $BasePath "$project\Source\ProgramHeaders.xml"

    if (-not (Test-Path $headerPath)) {
        Write-Warning "ProgramHeaders.xml not found for $project"
        continue
    }

    Write-Host "Scanning $project..." -ForegroundColor Cyan

    [xml]$xml = Get-Content $headerPath -Encoding UTF8

    $candidates = @()

    foreach ($prog in $xml.ProgramHeaders.ProgramHeader) {
        $publicName = $prog.PublicName
        $isEmptyTask = $prog.ISEMPTY_TSK -eq "1"
        $idePosition = [int]$prog.ISN
        $name = $prog.Name

        # Skip empty programs
        if ($isEmptyTask) { continue }

        # Candidate if has PublicName
        if (-not [string]::IsNullOrWhiteSpace($publicName)) {
            $candidates += [PSCustomObject]@{
                IdePosition = $idePosition
                Name = $name
                PublicName = $publicName
                IsEcfCandidate = $true
            }
        }
    }

    $results[$project] = $candidates | Sort-Object IdePosition
    Write-Host "  Found $($candidates.Count) programs with PublicName" -ForegroundColor Green
}

# Output based on format
switch ($OutputFormat) {
    "table" {
        foreach ($project in $results.Keys | Sort-Object) {
            Write-Host "`n=== $project ECF Candidates ===" -ForegroundColor Yellow
            $results[$project] | Format-Table -AutoSize
        }
    }

    "json" {
        $results | ConvertTo-Json -Depth 3
    }

    "csharp" {
        Write-Host "`n// Copy this into OrphanDetectionService.cs EcfPrograms dictionary" -ForegroundColor Cyan
        Write-Host ""

        foreach ($project in $results.Keys | Sort-Object) {
            $progs = $results[$project]
            if ($progs.Count -eq 0) { continue }

            Write-Host "[`"$project`"] = new HashSet<int>"
            Write-Host "{"

            # Group by function for readability
            $grouped = $progs | ForEach-Object {
                $comment = if ($_.PublicName) { $_.PublicName } else { $_.Name }
                "    $($_.IdePosition), // $comment"
            }

            # Output in batches of 6 for readability
            $i = 0
            foreach ($line in $grouped) {
                Write-Host $line
                $i++
            }

            Write-Host "},"
            Write-Host ""
        }
    }
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
foreach ($project in $results.Keys | Sort-Object) {
    $count = $results[$project].Count
    Write-Host "$project : $count ECF candidates"
}
