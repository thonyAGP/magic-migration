#Requires -Version 5.1
<#
.SYNOPSIS
    Lance MCP Inspector pour tester le serveur MagicMcp.

.DESCRIPTION
    Demarre MCP Inspector avec la configuration du serveur MagicMcp.
    Permet de tester les outils MCP sans redemarrer Claude Code.

.PARAMETER Build
    Recompile le serveur MCP avant de lancer l'Inspector.

.PARAMETER Port
    Port pour l'interface web (defaut: 6274).

.EXAMPLE
    .\start-mcp-inspector.ps1
    Lance l'Inspector avec le serveur MCP existant.

.EXAMPLE
    .\start-mcp-inspector.ps1 -Build
    Recompile puis lance l'Inspector.
#>

param(
    [switch]$Build,
    [int]$Port = 6274
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$McpServerPath = Join-Path $ProjectRoot "tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"
$McpProjectPath = Join-Path $ProjectRoot "tools\MagicMcp\MagicMcp.csproj"

# Couleurs
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   MCP Inspector - MagicMcp Server" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Build si demande ou si l'exe n'existe pas
if ($Build -or -not (Test-Path $McpServerPath)) {
    Write-Info "Compilation du serveur MCP..."

    $buildResult = dotnet build $McpProjectPath -c Release --nologo -v q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Echec de la compilation" -ForegroundColor Red
        exit 1
    }
    Write-Success "Serveur compile"
}

# Verifier que l'exe existe
if (-not (Test-Path $McpServerPath)) {
    Write-Host "[ERREUR] Serveur MCP non trouve: $McpServerPath" -ForegroundColor Red
    Write-Host "Lancez avec -Build pour compiler" -ForegroundColor Yellow
    exit 1
}

# Verifier npx
$npxVersion = npx --version 2>$null
if (-not $npxVersion) {
    Write-Host "[ERREUR] npx non trouve. Installez Node.js" -ForegroundColor Red
    exit 1
}

Write-Info "Serveur MCP: $McpServerPath"
Write-Info "Demarrage de MCP Inspector sur port $Port..."
Write-Host ""

# Definir la variable d'environnement pour le chemin des projets Magic
$env:MAGIC_PROJECTS_PATH = "D:\Data\Migration\XPA\PMS"

# Lancer MCP Inspector
Write-Host "Outils disponibles:" -ForegroundColor Yellow
Write-Host "  - magic_find_program     : Rechercher un programme"
Write-Host "  - magic_get_position     : Position IDE d'un programme"
Write-Host "  - magic_get_tree         : Arborescence des taches"
Write-Host "  - magic_get_dataview     : Data View d'une tache"
Write-Host "  - magic_get_logic        : Logic d'une tache"
Write-Host "  - magic_get_line         : Ligne Data View + Logic"
Write-Host "  - magic_get_expression   : Decoder une expression"
Write-Host "  - magic_get_params       : Parametres d'un programme"
Write-Host "  - magic_get_table        : Info table par ID ou nom"
Write-Host "  - magic_list_tables      : Liste des tables"
Write-Host "  - magic_list_programs    : Liste des programmes"
Write-Host "  - magic_get_history      : Historique Git d'un programme"
Write-Host "  - magic_get_dependencies : Dependances d'un projet"
Write-Host ""

# Lancer l'inspector
npx @modelcontextprotocol/inspector $McpServerPath

Write-Host ""
Write-Success "MCP Inspector termine"
