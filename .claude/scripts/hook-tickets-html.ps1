<#
.SYNOPSIS
    Hook PostToolUse pour regenerer tickets.html
    quand un fichier dans .openspec/tickets/ est modifie
.DESCRIPTION
    Remplace hook-tickets-html.ts (Bun) par PowerShell pur
    pour eviter les crashs de Bun sur Windows
#>

param()

# Lire stdin (JSON du hook)
$input = $null
try {
    $input = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($input)) {
        exit 0
    }
    $hookData = $input | ConvertFrom-Json
} catch {
    exit 0
}

# Extraire le chemin du fichier modifie
$filePath = $hookData.tool_input.file_path
if (-not $filePath) {
    exit 0
}

# Normaliser le chemin
$normalizedPath = $filePath.Replace('\', '/').ToLower()

# Verifier si c'est un fichier dans .openspec/tickets/
if ($normalizedPath -notlike "*.openspec/tickets/*") {
    exit 0
}

# Determiner le repertoire racine du projet
$projectRoot = $hookData.cwd
$scriptPath = Join-Path $projectRoot ".claude\scripts\generate-tickets-html.ps1"

# Verifier que le script existe
if (-not (Test-Path $scriptPath)) {
    [Console]::Error.WriteLine("[tickets-hook] Script not found: $scriptPath")
    exit 0
}

# Executer le script de generation
try {
    & $scriptPath -ProjectRoot $projectRoot 2>&1 | Out-Null
    [Console]::Error.WriteLine("[tickets-hook] tickets.html regenerated")
} catch {
    [Console]::Error.WriteLine("[tickets-hook] Error: $_")
}

exit 0
