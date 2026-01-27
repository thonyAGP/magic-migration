# Populate-SpecData.ps1
# P4-ACT: Populate empty V3.5 specs with REAL data from KB via KbIndexRunner
# Fixes CRITICAL gap: 322/323 specs are empty stubs
#
# PREREQUIS: La Knowledge Base doit etre indexee!
#   cd D:\Projects\Lecteur_Magic\tools\KbIndexRunner
#   dotnet run
#
# Usage:
#   .\Populate-SpecData.ps1 -IDE 237              # Single spec
#   .\Populate-SpecData.ps1 -StartIDE 1 -EndIDE 50   # Range
#   .\Populate-SpecData.ps1 -All                   # All 350 specs

param(
    [Parameter(ParameterSetName='Single')]
    [int]$IDE,

    [Parameter(ParameterSetName='Range')]
    [int]$StartIDE = 1,

    [Parameter(ParameterSetName='Range')]
    [int]$EndIDE = 350,

    [Parameter(ParameterSetName='All')]
    [switch]$All,

    [string]$Project = "ADH",
    [string]$SpecsPath = "D:\Projects\Lecteur_Magic\.openspec\specs",
    [string]$KbRunnerPath = "D:\Projects\Lecteur_Magic\tools\KbIndexRunner",
    [switch]$DryRun,
    [switch]$Force,
    [switch]$InitKb
)

$ErrorActionPreference = "Stop"

# ============================================================================
# KBINDEXRUNNER INTERFACE
# ============================================================================

function Test-KnowledgeBase {
    $kbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"
    if (-not (Test-Path $kbPath)) {
        return $false
    }

    # Check file size > 1MB (indicates populated)
    $fileInfo = Get-Item $kbPath
    return ($fileInfo.Length -gt 1MB)
}

function Initialize-KnowledgeBase {
    Write-Host "=== Initializing Knowledge Base ===" -ForegroundColor Cyan
    Write-Host "Running KbIndexRunner..." -ForegroundColor Yellow

    Push-Location $KbRunnerPath
    try {
        $result = & dotnet run 2>&1
        $result | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
    finally {
        Pop-Location
    }

    Write-Host ""
}

function Get-SpecData {
    param(
        [string]$Project,
        [int]$IDE
    )

    Push-Location $KbRunnerPath
    try {
        $output = & dotnet run -- spec-data "$Project $IDE" 2>&1

        # Check for errors
        if ($LASTEXITCODE -ne 0) {
            return $null
        }

        # Parse JSON output
        $json = $output | Where-Object { $_ -match '^\{' } | Select-Object -First 1
        if (-not $json) {
            return $null
        }

        return $json | ConvertFrom-Json
    }
    catch {
        return $null
    }
    finally {
        Pop-Location
    }
}

# ============================================================================
# FORMATTING FUNCTIONS
# ============================================================================

function Format-TablesSection {
    param($Tables)

    if (-not $Tables -or $Tables.Count -eq 0) {
        return "| # | Nom physique | Acces | Usage |`n|---|--------------|-------|-------|`n| - | Aucune table | - | - |"
    }

    $header = "| # | Nom physique | Acces | Usage |`n|---|--------------|-------|-------|"
    $rows = $Tables | ForEach-Object {
        $access = if ($_.access -eq 'WRITE') { '**W**' } elseif ($_.access -eq 'LINK') { 'LINK' } else { 'R' }
        $name = if ($_.name) { "``$($_.name)``" } else { "Table_$($_.id)" }
        "| #$($_.id) | $name | $access | $($_.count)x |"
    }

    return "$header`n$($rows -join "`n")"
}

function Format-CallersSection {
    param($Callers)

    if (-not $Callers -or $Callers.Count -eq 0) {
        return "| IDE | Programme | Nb appels |`n|-----|-----------|-----------|`n| - | **Aucun caller** (point d'entree ou orphelin) | - |"
    }

    $header = "| IDE | Programme | Nb appels |`n|-----|-----------|-----------|"
    $rows = $Callers | ForEach-Object {
        $name = if ($_.name) { $_.name } else { "Programme $($_.ide)" }
        "| $($_.ide) | $name | $($_.count) |"
    }

    return "$header`n$($rows -join "`n")"
}

function Format-CalleesSection {
    param($Callees, $IDE)

    if (-not $Callees -or $Callees.Count -eq 0) {
        return @"
``````mermaid
graph LR
    T[$IDE Programme]
    NONE[Aucun callee]
    T -.-> NONE
    style T fill:#58a6ff,color:#000
    style NONE fill:#6b7280,stroke-dasharray: 5 5
``````

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| - | - | Programme terminal | - |
"@
    }

    # Build Mermaid diagram
    $mermaid = "``````mermaid`ngraph LR`n    T[$IDE Programme]"
    foreach ($c in $Callees | Select-Object -First 8) {
        $safeName = ($c.name -replace '-',' ' -replace '[^a-zA-Z0-9 ]','')
        if (-not $safeName) { $safeName = "Prog$($c.ide)" }
        if ($safeName.Length -gt 15) { $safeName = $safeName.Substring(0, 15) }
        $mermaid += "`n    C$($c.ide)[$($c.ide) $safeName]"
        $mermaid += "`n    T --> C$($c.ide)"
    }
    $mermaid += "`n    style T fill:#58a6ff,color:#000"
    foreach ($c in $Callees | Select-Object -First 8) {
        $mermaid += "`n    style C$($c.ide) fill:#3fb950"
    }
    $mermaid += "`n``````"

    # Build table
    $header = "| Niv | IDE | Programme | Nb appels |`n|-----|-----|-----------|-----------|"
    $rows = $Callees | ForEach-Object {
        $name = if ($_.name) { $_.name } else { "Programme $($_.ide)" }
        "| 1 | $($_.ide) | $name | $($_.count) |"
    }

    return "$mermaid`n`n$header`n$($rows -join "`n")"
}

# ============================================================================
# SPEC POPULATION
# ============================================================================

function Populate-Spec {
    param(
        [int]$IDE,
        [string]$SpecPath,
        [switch]$DryRun
    )

    $specFile = Join-Path $SpecPath "ADH-IDE-$IDE.md"

    if (-not (Test-Path $specFile)) {
        return @{ Status = "SKIP"; Reason = "File not found" }
    }

    $content = Get-Content $specFile -Raw -Encoding UTF8

    # Check if already populated (has real table data)
    if ($content -match "\| #\d+ \| ``[a-z]" -and -not $Force) {
        return @{ Status = "SKIP"; Reason = "Already has data" }
    }

    # Get data from KbIndexRunner
    $data = Get-SpecData -Project $Project -IDE $IDE
    if (-not $data) {
        return @{ Status = "SKIP"; Reason = "Not in KB" }
    }

    # Format sections
    $tablesSection = Format-TablesSection $data.tables
    $callersSection = Format-CallersSection $data.callers
    $calleesSection = Format-CalleesSection $data.callees $IDE

    # Update spec content
    $date = Get-Date -Format "yyyy-MM-dd HH:mm"

    # Replace tables section
    if ($content -match "### 2\.2 Tables[\s\S]*?(?=### 2\.3)") {
        $content = $content -replace "### 2\.2 Tables[\s\S]*?(?=### 2\.3)", @"
### 2.2 Tables

$tablesSection

"@
    }

    # Replace callers section
    if ($content -match "### 3\.2 Callers directs[\s\S]*?(?=### 3\.3)") {
        $content = $content -replace "### 3\.2 Callers directs[\s\S]*?(?=### 3\.3)", @"
### 3.2 Callers directs

$callersSection

"@
    }

    # Replace callees section
    if ($content -match "### 3\.3 Callees[\s\S]*?(?=### 3\.4)") {
        $content = $content -replace "### 3\.3 Callees[\s\S]*?(?=### 3\.4)", @"
### 3.3 Callees

$calleesSection

"@
    }

    # Add history entry
    $historyEntry = "| $date | **DATA POPULATED** - Tables, Callgraph ($($data.expressionCount) expr) | Script |"
    if ($content -match "(\| Date \| Action \| Auteur \|[\s\S]*?\|[^\n]+\|)") {
        $content = $content -replace "(\| Date \| Action \| Auteur \|[\s\S]*?\|[^\n]+\|)", "`$1`n$historyEntry"
    }

    if (-not $DryRun) {
        $content | Out-File $specFile -Encoding UTF8 -NoNewline
    }

    $stats = @{
        Tables = @($data.tables).Count
        ExpressionCount = $data.expressionCount
        Callers = @($data.callers).Count
        Callees = @($data.callees).Count
    }

    return @{ Status = "OK"; Stats = $stats; Name = $data.program }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host "=== Populate Spec Data ===" -ForegroundColor Cyan
Write-Host "Project: $Project" -ForegroundColor Cyan
Write-Host "KbIndexRunner: $KbRunnerPath" -ForegroundColor Cyan
Write-Host ""

# Check/Initialize KB
if ($InitKb -or -not (Test-KnowledgeBase)) {
    Write-Host "[!] Knowledge Base not found or empty" -ForegroundColor Yellow
    Write-Host ""

    if ($InitKb) {
        Initialize-KnowledgeBase
    }
    else {
        Write-Host "Pour indexer la Knowledge Base, executez:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  cd D:\Projects\Lecteur_Magic\tools\KbIndexRunner" -ForegroundColor White
        Write-Host "  dotnet run" -ForegroundColor White
        Write-Host ""
        Write-Host "Ou relancez ce script avec -InitKb" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "[OK] Knowledge Base found" -ForegroundColor Green

# Determine range
if ($IDE) {
    $StartIDE = $IDE
    $EndIDE = $IDE
}
elseif ($All) {
    $StartIDE = 1
    $EndIDE = 350
}

Write-Host "Processing IDE $StartIDE to $EndIDE" -ForegroundColor Cyan
Write-Host ""

$populated = 0
$skipped = 0
$errors = 0
$totalStats = @{
    Tables = 0
    ExpressionCount = 0
    Callers = 0
    Callees = 0
}

for ($i = $StartIDE; $i -le $EndIDE; $i++) {
    $specFile = Join-Path $SpecsPath "ADH-IDE-$i.md"

    if (-not (Test-Path $specFile)) {
        continue
    }

    try {
        $result = Populate-Spec -IDE $i -SpecPath $SpecsPath -DryRun:$DryRun

        switch ($result.Status) {
            "OK" {
                $populated++
                $stats = $result.Stats
                $totalStats.Tables += $stats.Tables
                $totalStats.ExpressionCount += $stats.ExpressionCount
                $totalStats.Callers += $stats.Callers
                $totalStats.Callees += $stats.Callees

                $name = if ($result.Name) { " - $($result.Name)" } else { "" }
                Write-Host "  [OK] ADH-IDE-$i$name - T:$($stats.Tables) E:$($stats.ExpressionCount) C:$($stats.Callers)/$($stats.Callees)" -ForegroundColor Green
            }
            "SKIP" {
                $skipped++
                Write-Host "  [SKIP] ADH-IDE-$i ($($result.Reason))" -ForegroundColor Yellow
            }
        }
    }
    catch {
        $errors++
        Write-Host "  [ERROR] ADH-IDE-$i : $_" -ForegroundColor Red
    }
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Populated: $populated specs" -ForegroundColor Green
Write-Host "Skipped:   $skipped specs" -ForegroundColor Yellow
Write-Host "Errors:    $errors specs" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "=== Data Extracted ===" -ForegroundColor Cyan
Write-Host "Tables:      $($totalStats.Tables)" -ForegroundColor White
Write-Host "Expressions: $($totalStats.ExpressionCount)" -ForegroundColor White
Write-Host "Callers:     $($totalStats.Callers)" -ForegroundColor White
Write-Host "Callees:     $($totalStats.Callees)" -ForegroundColor White

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] No files were modified" -ForegroundColor Magenta
}
