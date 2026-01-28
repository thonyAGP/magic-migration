#Requires -Version 5.1
<#
.SYNOPSIS
    Pipeline V5.0 - Generation de specifications Magic de haute qualite

.DESCRIPTION
    Pipeline 6 phases rigoureux pour produire des specs exploitables:
    - Phase 1: DISCOVERY - Cartographie du programme
    - Phase 2: MAPPING - Documentation des donnees
    - Phase 3: DECODE - Comprehension de la logique
    - Phase 4: SYNTHESIS - Production de la spec finale
    - Phase 5: DEPLOY - Copie vers renders (optionnel, -Deploy)
    - Phase 6: VALIDATE - Tests Playwright (optionnel, -Validate)

.PARAMETER Project
    Projet Magic (ADH, PBP, PVE, VIL, PBG, REF)

.PARAMETER IdePosition
    Position IDE du programme a analyser

.PARAMETER OutputFolder
    Dossier de sortie pour les fichiers intermediaires

.PARAMETER Force
    Force la regeneration meme si la spec existe

.PARAMETER SkipPhase
    Phase(s) a sauter (1-4), pour reprise

.EXAMPLE
    .\Run-SpecPipelineV50.ps1 -Project ADH -IdePosition 237

.NOTES
    Version: 5.0
    Auteur: Claude Opus 4.5
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("ADH", "PBP", "PVE", "VIL", "PBG", "REF")]
    [string]$Project,

    [Parameter(Mandatory = $true)]
    [int]$IdePosition,

    [string]$OutputFolder,

    [switch]$Force,

    [int[]]$SkipPhase = @(),

    [switch]$VerboseOutput,

    [switch]$Deploy,

    [switch]$Validate
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot

# Trouver la racine du projet Lecteur_Magic
$ProjectRoot = (Get-Item "$ScriptDir\..\..").FullName

# ============================================================================
# CONFIGURATION
# ============================================================================

# Definir chemins absolus
if (!$OutputFolder) {
    $OutputFolder = Join-Path $ProjectRoot ".openspec\specs"
}
$OutputFolder = [System.IO.Path]::GetFullPath($OutputFolder)

$IntermediateDir = Join-Path $ProjectRoot ".openspec\pipeline-output\$Project-IDE-$IdePosition"
$IntermediateDir = [System.IO.Path]::GetFullPath($IntermediateDir)

$Config = @{
    ProjectsPath    = "D:\Data\Migration\XPA\PMS"
    KbRunnerPath    = Join-Path $ScriptDir "..\KbIndexRunner"
    IntermediateDir = $IntermediateDir
    SpecsDir        = $OutputFolder
    MaxRetries      = 3
    TimeoutSeconds  = 60
}

# Creer les dossiers si necessaires
if (!(Test-Path $Config.IntermediateDir)) {
    New-Item -ItemType Directory -Path $Config.IntermediateDir -Force | Out-Null
}
if (!(Test-Path $Config.SpecsDir)) {
    New-Item -ItemType Directory -Path $Config.SpecsDir -Force | Out-Null
}

# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

function Write-Phase {
    param([int]$Number, [string]$Name, [string]$Status = "START")

    $Color = switch ($Status) {
        "START" { "Cyan" }
        "DONE" { "Green" }
        "SKIP" { "Yellow" }
        "ERROR" { "Red" }
        default { "White" }
    }

    $StatusIcon = switch ($Status) {
        "START" { ">>>" }
        "DONE" { "[OK]" }
        "SKIP" { "[--]" }
        "ERROR" { "[!!]" }
        default { "   " }
    }

    Write-Host ""
    Write-Host ("=" * 80) -ForegroundColor $Color
    Write-Host "$StatusIcon PHASE $Number - $Name" -ForegroundColor $Color
    Write-Host ("=" * 80) -ForegroundColor $Color
}

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host "  [$Step] $Message" -ForegroundColor Gray
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Warning2 {
    param([string]$Message)
    Write-Host "  [!!] $Message" -ForegroundColor Yellow
}

function Write-Error2 {
    param([string]$Message)
    Write-Host "  [XX] $Message" -ForegroundColor Red
}

function Invoke-KbRunner {
    param([string]$Command)

    $KbRunnerExe = "dotnet"
    $KbRunnerArgs = "run --project `"$($Config.KbRunnerPath)`" -- $Command"

    try {
        $Result = & $KbRunnerExe run --project $Config.KbRunnerPath -- $Command.Split(' ') 2>&1
        return $Result -join "`n"
    }
    catch {
        Write-Warning2 "KbRunner command failed: $Command"
        return $null
    }
}

function Test-PhaseOutput {
    param([string]$FilePath, [string]$PhaseName)

    if (!(Test-Path $FilePath)) {
        Write-Error2 "$PhaseName output file not found: $FilePath"
        return $false
    }

    $Content = Get-Content $FilePath -Raw | ConvertFrom-Json
    if ($null -eq $Content) {
        Write-Error2 "$PhaseName output is empty or invalid JSON"
        return $false
    }

    return $true
}

# ============================================================================
# MAIN PIPELINE
# ============================================================================

$StartTime = Get-Date

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Magenta
Write-Host "       SPEC PIPELINE V5.0 - $Project IDE $IdePosition" -ForegroundColor Magenta
Write-Host "       $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Magenta
Write-Host ("=" * 80) -ForegroundColor Magenta

# Chemins des fichiers intermediaires
$DiscoveryFile = Join-Path $Config.IntermediateDir "discovery.json"
$MappingFile = Join-Path $Config.IntermediateDir "mapping.json"
$DecodeFile = Join-Path $Config.IntermediateDir "decoded.json"
$SpecFile = Join-Path $Config.SpecsDir "$Project-IDE-$IdePosition.md"

# ============================================================================
# PHASE 1: DISCOVERY
# ============================================================================

if ($SkipPhase -notcontains 1) {
    Write-Phase -Number 1 -Name "DISCOVERY - Cartographier le terrain"

    $Phase1Script = Join-Path $ScriptDir "Phase1-Discovery.ps1"
    if (Test-Path $Phase1Script) {
        & $Phase1Script -Project $Project -IdePosition $IdePosition -OutputFile $DiscoveryFile -Config $Config

        if (Test-PhaseOutput $DiscoveryFile "Discovery") {
            Write-Phase -Number 1 -Name "DISCOVERY" -Status "DONE"
        }
        else {
            Write-Phase -Number 1 -Name "DISCOVERY" -Status "ERROR"
            throw "Phase 1 failed: Discovery output invalid"
        }
    }
    else {
        Write-Error2 "Phase 1 script not found: $Phase1Script"
        throw "Phase 1 script missing"
    }
}
else {
    Write-Phase -Number 1 -Name "DISCOVERY" -Status "SKIP"
}

# ============================================================================
# PHASE 2: MAPPING
# ============================================================================

if ($SkipPhase -notcontains 2) {
    Write-Phase -Number 2 -Name "MAPPING - Documenter les donnees"

    $Phase2Script = Join-Path $ScriptDir "Phase2-Mapping.ps1"
    if (Test-Path $Phase2Script) {
        & $Phase2Script -Project $Project -IdePosition $IdePosition -DiscoveryFile $DiscoveryFile -OutputFile $MappingFile -Config $Config

        if (Test-PhaseOutput $MappingFile "Mapping") {
            Write-Phase -Number 2 -Name "MAPPING" -Status "DONE"
        }
        else {
            Write-Phase -Number 2 -Name "MAPPING" -Status "ERROR"
            throw "Phase 2 failed: Mapping output invalid"
        }
    }
    else {
        Write-Error2 "Phase 2 script not found: $Phase2Script"
        throw "Phase 2 script missing"
    }
}
else {
    Write-Phase -Number 2 -Name "MAPPING" -Status "SKIP"
}

# ============================================================================
# PHASE 3: DECODE
# ============================================================================

if ($SkipPhase -notcontains 3) {
    Write-Phase -Number 3 -Name "DECODE - Comprendre la logique"

    $Phase3Script = Join-Path $ScriptDir "Phase3-Decode.ps1"
    if (Test-Path $Phase3Script) {
        & $Phase3Script -Project $Project -IdePosition $IdePosition -DiscoveryFile $DiscoveryFile -MappingFile $MappingFile -OutputFile $DecodeFile -Config $Config

        if (Test-PhaseOutput $DecodeFile "Decode") {
            Write-Phase -Number 3 -Name "DECODE" -Status "DONE"
        }
        else {
            Write-Phase -Number 3 -Name "DECODE" -Status "ERROR"
            throw "Phase 3 failed: Decode output invalid"
        }
    }
    else {
        Write-Error2 "Phase 3 script not found: $Phase3Script"
        throw "Phase 3 script missing"
    }
}
else {
    Write-Phase -Number 3 -Name "DECODE" -Status "SKIP"
}

# ============================================================================
# PHASE 4: SYNTHESIS
# ============================================================================

if ($SkipPhase -notcontains 4) {
    Write-Phase -Number 4 -Name "SYNTHESIS - Produire la spec"

    $Phase4Script = Join-Path $ScriptDir "Phase4-Synthesis.ps1"
    if (Test-Path $Phase4Script) {
        & $Phase4Script -Project $Project -IdePosition $IdePosition -DiscoveryFile $DiscoveryFile -MappingFile $MappingFile -DecodeFile $DecodeFile -OutputFile $SpecFile -Config $Config

        if (Test-Path $SpecFile) {
            Write-Phase -Number 4 -Name "SYNTHESIS" -Status "DONE"
        }
        else {
            Write-Phase -Number 4 -Name "SYNTHESIS" -Status "ERROR"
            throw "Phase 4 failed: Spec file not created"
        }
    }
    else {
        Write-Error2 "Phase 4 script not found: $Phase4Script"
        throw "Phase 4 script missing"
    }
}
else {
    Write-Phase -Number 4 -Name "SYNTHESIS" -Status "SKIP"
}

# ============================================================================
# PHASE 5: DEPLOY (optional - with -Deploy switch)
# ============================================================================

if ($Deploy -and $SkipPhase -notcontains 5) {
    Write-Phase -Number 5 -Name "DEPLOY - Copier vers renders"

    $RendersFolder = Join-Path $ProjectRoot ".openspec\renders"
    if (-not (Test-Path $RendersFolder)) {
        New-Item -ItemType Directory -Path $RendersFolder -Force | Out-Null
    }

    $RenderFile = Join-Path $RendersFolder "$Project-IDE-$IdePosition.md"

    if (Test-Path $SpecFile) {
        Copy-Item -Path $SpecFile -Destination $RenderFile -Force
        Write-OK "Spec copiee vers renders: $RenderFile"
        Write-Phase -Number 5 -Name "DEPLOY" -Status "DONE"
    }
    else {
        Write-Error2 "Spec file not found: $SpecFile"
        Write-Phase -Number 5 -Name "DEPLOY" -Status "ERROR"
    }
}
elseif ($Deploy) {
    Write-Phase -Number 5 -Name "DEPLOY" -Status "SKIP"
}

# ============================================================================
# PHASE 6: VALIDATE (optional - with -Validate switch)
# ============================================================================

if ($Validate -and $SkipPhase -notcontains 6) {
    Write-Phase -Number 6 -Name "VALIDATE - Tests Playwright"

    $TestFile = Join-Path $ProjectRoot "tests\e2e\verify-spec-v50.spec.ts"

    if (Test-Path $TestFile) {
        Write-OK "Lancement tests Playwright..."

        try {
            $TestResult = & npx playwright test $TestFile --reporter=list 2>&1
            $ExitCode = $LASTEXITCODE

            if ($ExitCode -eq 0) {
                Write-OK "Tous les tests passes"
                Write-Phase -Number 6 -Name "VALIDATE" -Status "DONE"
            }
            else {
                Write-Error2 "Certains tests ont echoue (exit code: $ExitCode)"
                $TestResult | Where-Object { $_ -match "failed|passed" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
                Write-Phase -Number 6 -Name "VALIDATE" -Status "WARN"
            }
        }
        catch {
            Write-Error2 "Erreur execution tests: $_"
            Write-Phase -Number 6 -Name "VALIDATE" -Status "ERROR"
        }
    }
    else {
        Write-Error2 "Test file not found: $TestFile"
        Write-Phase -Number 6 -Name "VALIDATE" -Status "SKIP"
    }
}
elseif ($Validate) {
    Write-Phase -Number 6 -Name "VALIDATE" -Status "SKIP"
}

# ============================================================================
# RAPPORT FINAL
# ============================================================================

$EndTime = Get-Date
$Duration = ($EndTime - $StartTime).TotalSeconds

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Green
Write-Host "       PIPELINE V5.0 COMPLETE" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Green
Write-Host ""
Write-Host "  Programme:    $Project IDE $IdePosition" -ForegroundColor White
Write-Host "  Duree:        $([math]::Round($Duration, 1)) secondes" -ForegroundColor White
Write-Host "  Spec:         $SpecFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Fichiers intermediaires:" -ForegroundColor Gray
Write-Host "    - discovery.json: $(if (Test-Path $DiscoveryFile) { 'OK' } else { 'MISSING' })" -ForegroundColor Gray
Write-Host "    - mapping.json:   $(if (Test-Path $MappingFile) { 'OK' } else { 'MISSING' })" -ForegroundColor Gray
Write-Host "    - decoded.json:   $(if (Test-Path $DecodeFile) { 'OK' } else { 'MISSING' })" -ForegroundColor Gray
Write-Host ""

# Return spec path for further processing
return $SpecFile
