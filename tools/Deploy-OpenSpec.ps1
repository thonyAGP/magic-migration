# Deploy-OpenSpec.ps1
# Deploys OpenSpec viewer and specs to jira.lb2i server or runs local server
# Usage:
#   .\Deploy-OpenSpec.ps1 -Target Remote   # Deploy to jira.lb2i
#   .\Deploy-OpenSpec.ps1 -Target Local    # Run local HTTP server
#   .\Deploy-OpenSpec.ps1 -GenerateIndex   # Only regenerate index.json

param(
    [ValidateSet("Remote", "Local")]
    [string]$Target = "Local",

    [switch]$GenerateIndex,

    [string]$RemotePath = "\\lvissvinstall\web$\jira\specs",  # UNC path to jira.lb2i/specs

    [int]$LocalPort = 8080
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$OpenSpecDir = Join-Path $ProjectRoot ".openspec"
$SpecsDir = Join-Path $OpenSpecDir "specs"
$ViewerFile = Join-Path $OpenSpecDir "viewer.html"
$IndexFile = Join-Path $OpenSpecDir "index.json"

Write-Host "=== OpenSpec Deployment Tool ===" -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot"
Write-Host "OpenSpec Dir: $OpenSpecDir"
Write-Host ""

# Function: Generate index.json from all specs
function Generate-SpecIndex {
    Write-Host "[1/3] Generating index.json..." -ForegroundColor Yellow

    $specs = @()
    $specFiles = Get-ChildItem -Path $SpecsDir -Filter "*.md" | Where-Object { $_.Name -notmatch "^TEMPLATE" }

    foreach ($file in $specFiles) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8

        # Extract metadata from spec
        $title = ""
        $project = ""
        $ide = 0
        $tables = 0
        $tasks = 0
        $complexity = "BASSE"
        $orphanStatus = ""
        $specVersion = "3.5"

        # Parse title (first H1)
        if ($content -match "^#\s+(.+)$" ) {
            $title = $Matches[1].Trim()
        }

        # Parse project and IDE from filename (ADH-IDE-237.md)
        if ($file.BaseName -match "^(\w+)-IDE-(\d+)") {
            $project = $Matches[1]
            $ide = [int]$Matches[2]
        }

        # Extract tables count
        if ($content -match "Tables\s*\(total\)\s*\|\s*(\d+)") {
            $tables = [int]$Matches[1]
        }

        # Extract tasks count
        if ($content -match "Taches\s*\|\s*(\d+)") {
            $tasks = [int]$Matches[1]
        }

        # Extract complexity
        if ($content -match "\*\*(HAUTE|MOYENNE|BASSE)\*\*") {
            $complexity = $Matches[1]
        }

        # Extract orphan status
        if ($content -match "Statut Orphelin\s*\|\s*(\w+)") {
            $orphanStatus = $Matches[1]
        }

        # Extract spec version
        if ($content -match "Pipeline.*V(\d+\.\d+)") {
            $specVersion = $Matches[1]
        }

        # Check if V6.0 spec (has tabs)
        $hasTabMarkers = $content -match "<!-- TAB:"

        $specs += @{
            id = $file.BaseName
            title = if ($title) { $title -replace "^$project\s+IDE\s+\d+\s*-?\s*", "" } else { $file.BaseName }
            project = $project
            ide = $ide
            type = if ($orphanStatus -eq "ORPHELIN") { "Orphelin" } else { "Programme" }
            file = "specs/$($file.Name)"
            tables = $tables
            tasks = $tasks
            complexity = $complexity
            specVersion = $specVersion
            hasTabMarkers = $hasTabMarkers
            orphanStatus = $orphanStatus
        }
    }

    # Sort by project then IDE
    $specs = $specs | Sort-Object { $_.project }, { $_.ide }

    $index = @{
        project = "Lecteur_Magic"
        lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
        totalSpecs = $specs.Count
        specs = $specs
    }

    $index | ConvertTo-Json -Depth 5 | Set-Content -Path $IndexFile -Encoding UTF8

    Write-Host "  Generated index with $($specs.Count) specs" -ForegroundColor Green
    Write-Host "  Output: $IndexFile"
    return $specs.Count
}

# Function: Deploy to remote server
function Deploy-ToRemote {
    param([string]$DestPath)

    Write-Host "[2/3] Deploying to remote server..." -ForegroundColor Yellow
    Write-Host "  Destination: $DestPath"

    # Check if path is accessible
    if (-not (Test-Path $DestPath -ErrorAction SilentlyContinue)) {
        Write-Host "  Creating remote directory..." -ForegroundColor Yellow
        try {
            New-Item -ItemType Directory -Path $DestPath -Force | Out-Null
        } catch {
            Write-Host "  ERROR: Cannot access $DestPath" -ForegroundColor Red
            Write-Host "  Make sure the network share is accessible and you have write permissions." -ForegroundColor Red
            Write-Host ""
            Write-Host "  Alternative: Run with -Target Local to test locally first" -ForegroundColor Yellow
            return $false
        }
    }

    # Create specs subdirectory
    $remoteSpecsDir = Join-Path $DestPath "specs"
    if (-not (Test-Path $remoteSpecsDir)) {
        New-Item -ItemType Directory -Path $remoteSpecsDir -Force | Out-Null
    }

    # Copy viewer.html
    Write-Host "  Copying viewer.html..."
    Copy-Item $ViewerFile -Destination $DestPath -Force

    # Copy index.json
    Write-Host "  Copying index.json..."
    Copy-Item $IndexFile -Destination $DestPath -Force

    # Copy all specs
    Write-Host "  Copying specs..."
    $specFiles = Get-ChildItem -Path $SpecsDir -Filter "*.md"
    $count = 0
    foreach ($file in $specFiles) {
        Copy-Item $file.FullName -Destination $remoteSpecsDir -Force
        $count++
    }
    Write-Host "  Copied $count spec files" -ForegroundColor Green

    return $true
}

# Function: Start local HTTP server
function Start-LocalServer {
    param([int]$Port)

    Write-Host "[2/3] Starting local HTTP server..." -ForegroundColor Yellow
    Write-Host "  Port: $Port"
    Write-Host "  Directory: $OpenSpecDir"
    Write-Host ""

    # Check if Python is available
    $pythonCmd = $null
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $pythonCmd = "python"
    } elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
        $pythonCmd = "python3"
    }

    if ($pythonCmd) {
        Write-Host "  Using Python HTTP server" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  ================================================" -ForegroundColor Green
        Write-Host "  OpenSpec Viewer available at:" -ForegroundColor Green
        Write-Host "  http://localhost:$Port/viewer.html" -ForegroundColor White
        Write-Host "  ================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""

        # Open browser
        Start-Process "http://localhost:$Port/viewer.html"

        # Start server
        Push-Location $OpenSpecDir
        try {
            & $pythonCmd -m http.server $Port
        } finally {
            Pop-Location
        }
    } else {
        # Try Node.js http-server or npx serve
        if (Get-Command npx -ErrorAction SilentlyContinue) {
            Write-Host "  Using npx serve" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  ================================================" -ForegroundColor Green
            Write-Host "  OpenSpec Viewer available at:" -ForegroundColor Green
            Write-Host "  http://localhost:$Port/viewer.html" -ForegroundColor White
            Write-Host "  ================================================" -ForegroundColor Green
            Write-Host ""

            Start-Process "http://localhost:$Port/viewer.html"

            Push-Location $OpenSpecDir
            try {
                npx serve -l $Port
            } finally {
                Pop-Location
            }
        } else {
            Write-Host "  ERROR: No HTTP server available" -ForegroundColor Red
            Write-Host "  Install Python or Node.js to run local server" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  Alternatives:" -ForegroundColor Cyan
            Write-Host "    - Install Python: winget install Python.Python.3"
            Write-Host "    - Install Node.js: winget install OpenJS.NodeJS"
            Write-Host "    - Use VS Code Live Server extension"
            return $false
        }
    }

    return $true
}

# Main execution
Write-Host "Target: $Target" -ForegroundColor Cyan
Write-Host ""

# Always regenerate index
$specCount = Generate-SpecIndex

if ($GenerateIndex) {
    Write-Host ""
    Write-Host "=== Index generation complete ===" -ForegroundColor Green
    exit 0
}

Write-Host ""

# Deploy based on target
if ($Target -eq "Remote") {
    $success = Deploy-ToRemote -DestPath $RemotePath

    if ($success) {
        Write-Host ""
        Write-Host "[3/3] Deployment complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "  ================================================" -ForegroundColor Green
        Write-Host "  OpenSpec Viewer available at:" -ForegroundColor Green
        Write-Host "  http://jira.lb2i/specs/viewer.html" -ForegroundColor White
        Write-Host "  ================================================" -ForegroundColor Green
    }
} else {
    Start-LocalServer -Port $LocalPort
}
