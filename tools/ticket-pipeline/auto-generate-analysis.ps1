# auto-generate-analysis.ps1
# Phase 6: Generation automatique du fichier analysis.md
# Compile toutes les donnees des phases precedentes en format protocole

param(
    [Parameter(Mandatory=$true)]
    [string]$StateFile,

    [Parameter(Mandatory=$true)]
    [string]$OutputFile
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Charger l'etat du pipeline
if (-not (Test-Path $StateFile)) {
    throw "State file not found: $StateFile"
}

$State = Get-Content $StateFile -Raw | ConvertFrom-Json
$OutputDir = Split-Path -Parent $StateFile

# Charger les fichiers intermediaires
$ContextFile = Join-Path $OutputDir "context.json"
$ProgramsFile = Join-Path $OutputDir "programs.json"
$FlowFile = Join-Path $OutputDir "flow.json"
$DiagramFile = Join-Path $OutputDir "diagram.txt"
$ExpressionsFile = Join-Path $OutputDir "expressions.json"
$PatternsFile = Join-Path $OutputDir "patterns.json"

$Context = if (Test-Path $ContextFile) { Get-Content $ContextFile -Raw | ConvertFrom-Json } else { $null }
$Programs = if (Test-Path $ProgramsFile) { Get-Content $ProgramsFile -Raw | ConvertFrom-Json } else { $null }
$Flow = if (Test-Path $FlowFile) { Get-Content $FlowFile -Raw | ConvertFrom-Json } else { $null }
$Diagram = if (Test-Path $DiagramFile) { Get-Content $DiagramFile -Raw } else { "" }
$Expressions = if (Test-Path $ExpressionsFile) { Get-Content $ExpressionsFile -Raw | ConvertFrom-Json } else { $null }
$Patterns = if (Test-Path $PatternsFile) { Get-Content $PatternsFile -Raw | ConvertFrom-Json } else { $null }

# ============================================================================
# GENERATION DU MARKDOWN
# ============================================================================

$Lines = @()

# Header
$Lines += "# Analyse Ticket $($State.TicketKey)"
$Lines += ""
$Lines += "> **Genere automatiquement** par le pipeline d'analyse Magic"
$Lines += "> Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$Lines += ""
$Lines += "---"
$Lines += ""

# ============================================================================
# PHASE 1: CONTEXTE JIRA
# ============================================================================

$Lines += "## 1. Contexte Jira"
$Lines += ""

if ($Context) {
    $JiraUrl = "https://clubmed.atlassian.net/browse/$($State.TicketKey)"
    $Lines += "[$($State.TicketKey)]($JiraUrl)"
    $Lines += ""

    $Lines += "| Element | Valeur |"
    $Lines += "|---------|--------|"
    $Lines += "| **Symptome** | $($Context.Symptom -replace '\|', '\|' -replace "`n", ' ') |"
    $Lines += "| **Source** | $($Context.Source) |"
    $Lines += ""

    if ($Context.Keywords -and $Context.Keywords.Count -gt 0) {
        $Lines += "### Mots-cles detectes"
        $Lines += ""
        $KeywordsByCategory = $Context.Keywords | Group-Object { $_.Category }
        foreach ($Group in $KeywordsByCategory) {
            $KwList = ($Group.Group | ForEach-Object { $_.Keyword }) -join ", "
            $Lines += "- **$($Group.Name)**: $KwList"
        }
        $Lines += ""
    }
}
else {
    $Lines += "*Contexte non extrait*"
    $Lines += ""
}

# ============================================================================
# PHASE 2: LOCALISATION
# ============================================================================

$Lines += "## 2. Localisation"
$Lines += ""

if ($Programs -and $Programs.Programs.Count -gt 0) {
    $VerifiedProgs = $Programs.Programs | Where-Object { $_.Verified }

    if ($VerifiedProgs.Count -gt 0) {
        $Lines += "### Programmes identifies"
        $Lines += ""
        $Lines += "| Fichier XML | IDE Verifie | Nom | Source |"
        $Lines += "|-------------|-------------|-----|--------|"

        foreach ($P in $VerifiedProgs) {
            $XmlFile = "Prg_$($P.ProgramId).xml"
            $IDE = "**$($P.Project) IDE $($P.IDE)**"
            $Lines += "| $XmlFile | $IDE | $($P.Name) | $($P.Source) |"
        }
        $Lines += ""

        $Lines += "### Appels MCP documentes"
        $Lines += ""
        foreach ($P in $VerifiedProgs | Select-Object -First 3) {
            $Lines += "- ``magic_get_position(`"$($P.Project)`", $($P.ProgramId))`` -> $($P.Project) IDE $($P.IDE)"
        }
        $Lines += ""
    }

    $UnverifiedProgs = $Programs.Programs | Where-Object { -not $_.Verified }
    if ($UnverifiedProgs.Count -gt 0) {
        $Lines += "### Programmes non trouves"
        $Lines += ""
        foreach ($P in $UnverifiedProgs) {
            $Lines += "- ``$($P.Raw)`` - non trouve dans la KB"
        }
        $Lines += ""
    }
}
else {
    $Lines += "*Aucun programme localise*"
    $Lines += ""
}

# ============================================================================
# PHASE 3: TRACAGE FLUX
# ============================================================================

$Lines += "## 3. Tracage Flux"
$Lines += ""

if ($Flow -and $Flow.Flow.Count -gt 0) {
    $Lines += "### Statistiques"
    $Lines += ""
    $Lines += "| Metrique | Valeur |"
    $Lines += "|----------|--------|"
    $Lines += "| Programmes traces | $($Flow.Flow.Count) |"
    $Lines += "| CallTask/CallProgram | $($Flow.CallTasks.Count) |"
    $Lines += "| Expressions {N,Y} | $($Flow.Expressions.Count) |"
    $Lines += ""

    if ($Diagram -and $Diagram.Length -gt 0) {
        $Lines += "### Diagramme de flux"
        $Lines += ""
        $Lines += $Diagram
        $Lines += ""
    }

    if ($Flow.CallTasks.Count -gt 0) {
        $Lines += "### Appels principaux"
        $Lines += ""
        $Lines += "| Source | Type | Cible | Condition |"
        $Lines += "|--------|------|-------|-----------|"

        foreach ($Call in $Flow.CallTasks | Select-Object -First 10) {
            $Cond = if ($Call.Condition) { "Exp $($Call.Condition)" } else { "-" }
            $Lines += "| $($Call.SourceProgram) | $($Call.Type) | $($Call.Target) | $Cond |"
        }

        if ($Flow.CallTasks.Count -gt 10) {
            $Lines += "| ... | +$($Flow.CallTasks.Count - 10) autres | ... | ... |"
        }
        $Lines += ""
    }
}
else {
    $Lines += "*Flux non trace*"
    $Lines += ""
}

# ============================================================================
# PHASE 4: ANALYSE EXPRESSIONS
# ============================================================================

$Lines += "## 4. Analyse Expressions"
$Lines += ""

if ($Expressions -and $Expressions.Expressions.Count -gt 0) {
    $DecodedExpr = $Expressions.Expressions | Where-Object { $_.Decoded }

    $Lines += "### Statistiques decodage"
    $Lines += ""
    $Lines += "| Metrique | Valeur |"
    $Lines += "|----------|--------|"
    $Lines += "| Total expressions | $($Expressions.Stats.Total) |"
    $Lines += "| Decodees | $($Expressions.Stats.Decoded) |"
    $Lines += "| Echecs | $($Expressions.Stats.Failed) |"
    $Lines += ""

    if ($DecodedExpr.Count -gt 0) {
        $Lines += "### Expressions decodees"
        $Lines += ""

        foreach ($Expr in $DecodedExpr | Select-Object -First 5) {
            $Lines += "#### Expression $($Expr.ExpressionId) (Prg_$($Expr.ProgramId), Offset=$($Expr.Offset))"
            $Lines += ""
            $Lines += "**Original**: ``$($Expr.Original)``"
            $Lines += ""
            $Lines += "**Decode**: ``$($Expr.Decoded)``"
            $Lines += ""

            if ($Expr.Variables -and $Expr.Variables.Count -gt 0) {
                $Lines += "| Reference | Type | Index Global | Variable |"
                $Lines += "|-----------|------|--------------|----------|"
                foreach ($V in $Expr.Variables) {
                    $GlobalIdx = if ($V.Info.GlobalIndex) { $V.Info.GlobalIndex } else { "-" }
                    $Letter = if ($V.Info.Letter) { "**$($V.Info.Letter)**" } else { "-" }
                    $Lines += "| $($V.Reference) | $($V.Info.Type) | $GlobalIdx | $Letter |"
                }
                $Lines += ""
            }
        }

        if ($DecodedExpr.Count -gt 5) {
            $Lines += "*... +$($DecodedExpr.Count - 5) autres expressions decodees*"
            $Lines += ""
        }
    }
}
else {
    $Lines += "*Aucune expression {N,Y} trouvee ou decodage non effectue*"
    $Lines += ""
}

# ============================================================================
# PHASE 5: PATTERNS KB
# ============================================================================

$Lines += "## 5. Patterns KB"
$Lines += ""

if ($Patterns -and $Patterns.Patterns.Count -gt 0) {
    $Lines += "### Patterns similaires trouves"
    $Lines += ""
    $Lines += "| Pattern | Score | Domaine | Source |"
    $Lines += "|---------|-------|---------|--------|"

    foreach ($P in $Patterns.Patterns) {
        $Lines += "| **$($P.Id)** | $($P.Score) | $($P.Domain) | $($P.Source) |"
    }
    $Lines += ""

    $TopPattern = $Patterns.Patterns[0]
    $Lines += "### Pattern suggere: $($TopPattern.Id)"
    $Lines += ""
    $Lines += "Correspondances:"
    foreach ($M in $TopPattern.Matches | Select-Object -First 5) {
        $Lines += "- [$($M.Type)] $($M.Value) (poids: $($M.Weight))"
    }
    $Lines += ""

    if ($TopPattern.HasContent) {
        $Lines += "> Voir: ``.openspec/patterns/$($TopPattern.Id).md`` pour la solution type"
        $Lines += ""
    }
}
else {
    $Lines += "*Aucun pattern KB correspondant*"
    $Lines += ""
    $Lines += "> **Note**: Apres resolution, capitaliser avec ``/ticket-learn $($State.TicketKey)``"
    $Lines += ""
}

# ============================================================================
# PHASE 6: ROOT CAUSE (A COMPLETER)
# ============================================================================

$Lines += "## 6. Root Cause"
$Lines += ""
$Lines += "### Hypothese"
$Lines += ""
$Lines += "*A completer manuellement apres analyse des donnees ci-dessus*"
$Lines += ""
$Lines += "### Localisation"
$Lines += ""
$Lines += "| Element | Valeur |"
$Lines += "|---------|--------|"
$Lines += "| Programme | *A definir* |"
$Lines += "| Tache | *A definir* |"
$Lines += "| Ligne | *A definir* |"
$Lines += "| Expression | *A definir* |"
$Lines += ""

# ============================================================================
# PHASE 7: SOLUTION (A COMPLETER)
# ============================================================================

$Lines += "## 7. Solution"
$Lines += ""
$Lines += "### Modification proposee"
$Lines += ""
$Lines += "| Element | Avant (bug) | Apres (fix) |"
$Lines += "|---------|-------------|-------------|"
$Lines += "| *A definir* | *valeur actuelle* | *valeur corrigee* |"
$Lines += ""

# ============================================================================
# CHECKLIST
# ============================================================================

$Lines += "---"
$Lines += ""
$Lines += "## Checklist Validation"
$Lines += ""

$CheckIDE = if ($Programs -and ($Programs.Programs | Where-Object { $_.Verified }).Count -gt 0) { "x" } else { " " }
$CheckExpr = if ($Expressions -and $Expressions.Stats.Decoded -gt 0) { "x" } else { " " }
$CheckDiagram = if ($Diagram -and $Diagram.Length -gt 50) { "x" } else { " " }
$CheckRootCause = " "  # Toujours a completer manuellement

$Lines += "- [$CheckIDE] IDE verifie pour chaque programme"
$Lines += "- [$CheckExpr] Expressions {N,Y} decodees"
$Lines += "- [$CheckDiagram] Diagramme de flux present"
$Lines += "- [$CheckRootCause] Root Cause identifiee (Programme + Tache + Ligne)"
$Lines += "- [ ] Solution Avant/Apres documentee"
$Lines += ""

# ============================================================================
# METADATA
# ============================================================================

$Lines += "---"
$Lines += ""
$Lines += "*Analyse generee par: ``tools/ticket-pipeline/Run-TicketPipeline.ps1``*"
$Lines += ""
$Lines += "*Pipeline version: 1.0*"
$Lines += ""

# Ecrire le fichier
$Content = $Lines -join "`n"
$Content | Set-Content $OutputFile -Encoding UTF8

Write-Host "[Generate] Analysis report generated: $OutputFile" -ForegroundColor Green
Write-Host "[Generate] Size: $($Content.Length) characters" -ForegroundColor Gray
