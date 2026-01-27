# Populate-SpecData.ps1
# V2: Populate specs with COMPLETE data from KB (tables, expressions, params, stats, callchain)
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
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# ============================================================================
# KBINDEXRUNNER INTERFACE
# ============================================================================

function Test-KnowledgeBase {
    $kbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"
    if (-not (Test-Path $kbPath)) { return $false }
    $fileInfo = Get-Item $kbPath
    return ($fileInfo.Length -gt 1MB)
}

function Get-SpecData {
    param([string]$Project, [int]$IDE)

    Push-Location $KbRunnerPath
    try {
        $output = & dotnet run -- spec-data "$Project $IDE" 2>&1
        if ($LASTEXITCODE -ne 0) { return $null }
        $json = $output | Where-Object { $_ -match '^\{' } | Select-Object -First 1
        if (-not $json) { return $null }
        return $json | ConvertFrom-Json
    }
    catch { return $null }
    finally { Pop-Location }
}

# ============================================================================
# FORMATTING FUNCTIONS
# ============================================================================

function Format-TablesSection {
    param($Tables)

    if (-not $Tables -or $Tables.Count -eq 0) {
        return "| # | Nom logique | Nom physique | Acces | Usage |`n|---|-------------|--------------|-------|-------|`n| - | Aucune table | - | - | - |"
    }

    $header = "| # | Nom logique | Nom physique | Acces | Usage |`n|---|-------------|--------------|-------|-------|"
    $rows = $Tables | ForEach-Object {
        $access = switch ($_.access) {
            'WRITE' { '**W**' }
            'LINK'  { 'L' }
            default { 'R' }
        }
        $logical = if ($_.logical) { $_.logical } else { "Table_$($_.id)" }
        $physical = if ($_.physical) { "``$($_.physical)``" } else { "-" }
        "| $($_.id) | $logical | $physical | $access | $($_.count)x |"
    }

    return "$header`n$($rows -join "`n")"
}

function Format-ParametersSection {
    param($Parameters)

    if (-not $Parameters -or $Parameters.Count -eq 0) {
        return "| Variable | Nom | Type | Picture |`n|----------|-----|------|---------|`n| - | Aucun parametre | - | - |"
    }

    $header = "| Variable | Nom | Type | Picture |`n|----------|-----|------|---------|"
    $rows = $Parameters | ForEach-Object {
        $pic = if ($_.picture) { "``$($_.picture)``" } else { "-" }
        "| $($_.variable) | $($_.name) | $($_.type) | $pic |"
    }

    return "$header`n$($rows -join "`n")"
}

function Format-ExpressionsSection {
    param($Expressions, $ExpressionCount)

    if (-not $Expressions -or $Expressions.Count -eq 0) {
        return "| IDE | Expression | Commentaire |`n|-----|------------|-------------|`n| - | Aucune expression | - |`n`n> **Total**: 0 expressions"
    }

    $header = "| IDE | Expression | Commentaire |`n|-----|------------|-------------|"
    $rows = $Expressions | ForEach-Object {
        $expr = $_.content -replace '\|', '\|' -replace '`', "'"
        if ($expr.Length -gt 50) { $expr = $expr.Substring(0, 47) + "..." }
        $comment = if ($_.comment) { $_.comment } else { "-" }
        if ($comment.Length -gt 30) { $comment = $comment.Substring(0, 27) + "..." }
        "| $($_.ide) | ``$expr`` | $comment |"
    }

    $shown = $Expressions.Count
    $total = if ($ExpressionCount) { $ExpressionCount } else { $shown }

    return "$header`n$($rows -join "`n")`n`n> **Total**: $total expressions (affichees: $shown)"
}

function Format-StatisticsSection {
    param($Stats)

    if (-not $Stats) {
        return "| Metrique | Valeur |`n|----------|--------|`n| Taches | 0 |`n| Lignes logique | 0 |`n| Lignes desactivees | 0 |"
    }

    return @"
| Metrique | Valeur |
|----------|--------|
| **Taches** | $($Stats.taskCount) |
| **Lignes logique** | $($Stats.logicLineCount) |
| **Lignes desactivees** | $($Stats.disabledLineCount) |
"@
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

    # Build Mermaid diagram (max 8 nodes)
    $mermaid = "``````mermaid`ngraph LR`n    T[$IDE Programme]"
    foreach ($c in $Callees | Select-Object -First 8) {
        $safeName = ($c.name -replace '-',' ' -replace '[^a-zA-Z0-9 ]','')
        if (-not $safeName) { $safeName = "Prog$($c.ide)" }
        if ($safeName.Length -gt 12) { $safeName = $safeName.Substring(0, 12) }
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

function Format-CallChainSection {
    param($CallChain, $IDE, $ProgramName)

    if (-not $CallChain -or $CallChain.Count -eq 0) {
        return @"
``````mermaid
graph LR
    M[1 Main]
    T[$IDE $ProgramName]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
``````
"@
    }

    # Build proper call chain from Main
    $mermaid = "``````mermaid`ngraph LR"

    # Find Main in chain or add it
    $hasMain = $CallChain | Where-Object { $_.ide -eq 1 }

    # Build chain nodes
    $nodes = @()
    foreach ($c in $CallChain | Sort-Object -Property level -Descending | Select-Object -First 5) {
        $safeName = ($c.name -replace '-',' ' -replace '[^a-zA-Z0-9 ]','')
        if (-not $safeName) { $safeName = "Prog$($c.ide)" }
        if ($safeName.Length -gt 12) { $safeName = $safeName.Substring(0, 12) }
        $nodes += @{ ide = $c.ide; name = $safeName; level = $c.level }
    }

    # Add Main if not present
    if (-not $hasMain -and $nodes.Count -gt 0) {
        $mermaid += "`n    M[1 Main]"
    }

    # Add nodes in order (highest level = closest to Main)
    $sortedNodes = $nodes | Sort-Object -Property level -Descending
    foreach ($n in $sortedNodes) {
        $mermaid += "`n    N$($n.ide)[$($n.ide) $($n.name)]"
    }

    # Add target program
    $targetSafeName = ($ProgramName -replace '-',' ' -replace '[^a-zA-Z0-9 ]','')
    if ($targetSafeName.Length -gt 12) { $targetSafeName = $targetSafeName.Substring(0, 12) }
    $mermaid += "`n    T[$IDE $targetSafeName]"

    # Add connections
    if (-not $hasMain -and $sortedNodes.Count -gt 0) {
        $first = $sortedNodes[0]
        $mermaid += "`n    M --> N$($first.ide)"
    }

    for ($i = 0; $i -lt $sortedNodes.Count - 1; $i++) {
        $from = $sortedNodes[$i]
        $to = $sortedNodes[$i + 1]
        $mermaid += "`n    N$($from.ide) --> N$($to.ide)"
    }

    if ($sortedNodes.Count -gt 0) {
        $last = $sortedNodes[$sortedNodes.Count - 1]
        $mermaid += "`n    N$($last.ide) --> T"
    } elseif (-not $hasMain) {
        $mermaid += "`n    M --> T"
    }

    # Styles
    $mermaid += "`n    style M fill:#8b5cf6,color:#fff"
    foreach ($n in $sortedNodes) {
        $mermaid += "`n    style N$($n.ide) fill:#f59e0b"
    }
    $mermaid += "`n    style T fill:#58a6ff,color:#000"
    $mermaid += "`n``````"

    return $mermaid
}

# ============================================================================
# SPEC POPULATION
# ============================================================================

function Populate-Spec {
    param([int]$IDE, [string]$SpecPath, [switch]$DryRun)

    $specFile = Join-Path $SpecPath "ADH-IDE-$IDE.md"
    if (-not (Test-Path $specFile)) {
        return @{ Status = "SKIP"; Reason = "File not found" }
    }

    $content = Get-Content $specFile -Raw -Encoding UTF8

    # Check if already has REAL table data (not Table_XX)
    if ($content -match "\| \d+ \| [a-z_]+.*cafil" -and -not $Force) {
        return @{ Status = "SKIP"; Reason = "Already has real data" }
    }

    # Get data from KbIndexRunner
    $data = Get-SpecData -Project $Project -IDE $IDE
    if (-not $data) {
        return @{ Status = "SKIP"; Reason = "Not in KB" }
    }

    # Format all sections
    $tablesSection = Format-TablesSection $data.tables
    $paramsSection = Format-ParametersSection $data.parameters
    $expressionsSection = Format-ExpressionsSection $data.expressions $data.expressionCount
    $statsSection = Format-StatisticsSection $data.statistics
    $callersSection = Format-CallersSection $data.callers
    $calleesSection = Format-CalleesSection $data.callees $IDE
    $callChainSection = Format-CallChainSection $data.callChain $IDE $data.program

    $date = Get-Date -Format "yyyy-MM-dd HH:mm"

    # Replace tables section (2.2)
    if ($content -match "### 2\.2 Tables[\s\S]*?(?=### 2\.3)") {
        $content = $content -replace "### 2\.2 Tables[\s\S]*?(?=### 2\.3)", @"
### 2.2 Tables

$tablesSection

"@
    }

    # Replace parameters section (2.3)
    if ($content -match "### 2\.3 Parametres d'entree[\s\S]*?(?=### 2\.4)") {
        $content = $content -replace "### 2\.3 Parametres d'entree[\s\S]*?(?=### 2\.4)", @"
### 2.3 Parametres d'entree

$paramsSection

"@
    }

    # Replace expressions section (2.5)
    if ($content -match "### 2\.5 Expressions cles[\s\S]*?(?=### 2\.6)") {
        $content = $content -replace "### 2\.5 Expressions cles[\s\S]*?(?=### 2\.6)", @"
### 2.5 Expressions cles

$expressionsSection

"@
    }

    # Replace statistics section (2.7)
    if ($content -match "### 2\.7 Statistiques[\s\S]*?(?=---)") {
        $content = $content -replace "### 2\.7 Statistiques[\s\S]*?(?=---)", @"
### 2.7 Statistiques

$statsSection

"@
    }

    # Replace call chain section (3.1)
    if ($content -match "### 3\.1 Chaine d'appels depuis Main[\s\S]*?(?=### 3\.2)") {
        $content = $content -replace "### 3\.1 Chaine d'appels depuis Main[\s\S]*?(?=### 3\.2)", @"
### 3.1 Chaine d'appels depuis Main

$callChainSection

"@
    }

    # Replace callers section (3.2)
    if ($content -match "### 3\.2 Callers directs[\s\S]*?(?=### 3\.3)") {
        $content = $content -replace "### 3\.2 Callers directs[\s\S]*?(?=### 3\.3)", @"
### 3.2 Callers directs

$callersSection

"@
    }

    # Replace callees section (3.3)
    if ($content -match "### 3\.3 Callees[\s\S]*?(?=### 3\.4)") {
        $content = $content -replace "### 3\.3 Callees[\s\S]*?(?=### 3\.4)", @"
### 3.3 Callees

$calleesSection

"@
    }

    # Update history
    $historyEntry = "| $date | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |"
    if ($content -match "(\| Date \| Action \| Auteur \|[\s\S]*?\|[^\n]+\|)") {
        $content = $content -replace "(\| Date \| Action \| Auteur \|[\s\S]*?\|[^\n]+\|)", "`$1`n$historyEntry"
    }

    if (-not $DryRun) {
        $content | Out-File $specFile -Encoding UTF8 -NoNewline
    }

    $stats = @{
        Tables = @($data.tables).Count
        Expressions = @($data.expressions).Count
        ExpressionTotal = $data.expressionCount
        Parameters = @($data.parameters).Count
        Tasks = $data.statistics.taskCount
        LogicLines = $data.statistics.logicLineCount
        Callers = @($data.callers).Count
        Callees = @($data.callees).Count
    }

    return @{ Status = "OK"; Stats = $stats; Name = $data.program }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host "=== Populate Spec Data V2 ===" -ForegroundColor Cyan
Write-Host "Project: $Project" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-KnowledgeBase)) {
    Write-Host "[!] Knowledge Base not found" -ForegroundColor Red
    Write-Host "Run: cd $KbRunnerPath && dotnet run" -ForegroundColor Yellow
    exit 1
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
$totalStats = @{ Tables = 0; Expressions = 0; Tasks = 0; LogicLines = 0 }

for ($i = $StartIDE; $i -le $EndIDE; $i++) {
    $specFile = Join-Path $SpecsPath "ADH-IDE-$i.md"
    if (-not (Test-Path $specFile)) { continue }

    try {
        $result = Populate-Spec -IDE $i -SpecPath $SpecsPath -DryRun:$DryRun

        switch ($result.Status) {
            "OK" {
                $populated++
                $s = $result.Stats
                $totalStats.Tables += $s.Tables
                $totalStats.Expressions += $s.ExpressionTotal
                $totalStats.Tasks += $s.Tasks
                $totalStats.LogicLines += $s.LogicLines

                $name = if ($result.Name) { " - $($result.Name)" } else { "" }
                Write-Host "  [OK] ADH-IDE-$i$name" -ForegroundColor Green
                Write-Host "       T:$($s.Tables) E:$($s.ExpressionTotal) P:$($s.Parameters) Tasks:$($s.Tasks) Lines:$($s.LogicLines)" -ForegroundColor DarkGray
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
Write-Host "=== Total Data ===" -ForegroundColor Cyan
Write-Host "Tables:      $($totalStats.Tables)" -ForegroundColor White
Write-Host "Expressions: $($totalStats.Expressions)" -ForegroundColor White
Write-Host "Tasks:       $($totalStats.Tasks)" -ForegroundColor White
Write-Host "Logic Lines: $($totalStats.LogicLines)" -ForegroundColor White

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] No files modified" -ForegroundColor Magenta
}
