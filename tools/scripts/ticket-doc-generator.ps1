<#
.SYNOPSIS
    Generate ticket documentation from analysis results.
    Updates index.json files and prepares git commit.

.PARAMETER TicketKey
    Jira ticket key (e.g., PMS-1234, CMDS-176521)

.PARAMETER AnalysisData
    JSON file with analysis results or inline JSON

.PARAMETER AutoCommit
    If specified, automatically commits changes
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$TicketKey,

    [string]$AnalysisFile,

    [switch]$AutoCommit
)

$ErrorActionPreference = "Stop"
$ProjectRoot = "D:\Projects\ClubMed\LecteurMagic"
$TicketsDir = "$ProjectRoot\.openspec\tickets"
$TicketDir = "$TicketsDir\$TicketKey"

function Update-TicketIndex {
    param(
        [string]$TicketKey,
        [hashtable]$Metadata
    )

    $indexPath = "$TicketsDir\index.json"

    # Load or create index
    if (Test-Path $indexPath) {
        $index = Get-Content $indexPath -Raw | ConvertFrom-Json
    } else {
        $index = @{ tickets = @() }
    }

    # Check if ticket already exists
    $existingIndex = -1
    for ($i = 0; $i -lt $index.tickets.Count; $i++) {
        if ($index.tickets[$i].key -eq $TicketKey) {
            $existingIndex = $i
            break
        }
    }

    $entry = @{
        key = $TicketKey
        title = $Metadata.Title
        created = (Get-Date).ToString("yyyy-MM-dd")
        updated = (Get-Date).ToString("yyyy-MM-dd")
        status = $Metadata.Status
        programs = $Metadata.Programs
        tables = $Metadata.Tables
        rootCause = $Metadata.RootCause
    }

    if ($existingIndex -ge 0) {
        # Update existing entry - preserve created date
        $entry.created = $index.tickets[$existingIndex].created
        # Convert array to list, replace, convert back
        $ticketList = [System.Collections.ArrayList]@($index.tickets)
        $ticketList[$existingIndex] = [PSCustomObject]$entry
        $index.tickets = $ticketList.ToArray()
    } else {
        # Add new entry
        $index.tickets = @($index.tickets) + [PSCustomObject]$entry
    }

    # Sort by key
    $index.tickets = $index.tickets | Sort-Object { $_.key }

    # Save
    $index | ConvertTo-Json -Depth 4 | Set-Content $indexPath -Encoding UTF8
    Write-Host "Updated: $indexPath" -ForegroundColor Green
}

function Update-OpenSpecIndex {
    param(
        [string]$TicketKey,
        [hashtable]$Metadata
    )

    $indexPath = "$ProjectRoot\.openspec\index.json"

    if (Test-Path $indexPath) {
        $loaded = Get-Content $indexPath -Raw | ConvertFrom-Json
        # Convert to hashtable for easier manipulation
        $index = @{
            project = if ($loaded.project) { $loaded.project } else { "Lecteur_Magic" }
            updated = (Get-Date).ToString("yyyy-MM-dd")
            tickets = @{
                active = @(if ($loaded.tickets.active) { $loaded.tickets.active } else { @() })
                resolved = @(if ($loaded.tickets.resolved) { $loaded.tickets.resolved } else { @() })
            }
        }
    } else {
        $index = @{
            project = "Lecteur_Magic"
            updated = (Get-Date).ToString("yyyy-MM-dd")
            tickets = @{ active = @(); resolved = @() }
        }
    }

    # Add to appropriate list
    $ticketRef = "$TicketKey"
    $listName = if ($Metadata.Status -eq "RESOLVED") { "resolved" } else { "active" }

    if ($ticketRef -notin $index.tickets.$listName) {
        $index.tickets.$listName += $ticketRef
    }

    $index | ConvertTo-Json -Depth 4 | Set-Content $indexPath -Encoding UTF8
    Write-Host "Updated: $indexPath" -ForegroundColor Green
}

function Generate-AnalysisTemplate {
    param(
        [string]$TicketKey,
        [hashtable]$Context
    )

    $template = @"
# $TicketKey - $($Context.Title)

> **Jira** : [$TicketKey](https://clubmed.atlassian.net/browse/$TicketKey)
> **Protocole** : `.claude/protocols/ticket-analysis.md` appliqué
> **Généré** : $(Get-Date -Format "yyyy-MM-dd HH:mm")

---

<!-- ONGLET: Contexte -->
## 1. Contexte Jira

| Élément | Valeur |
|---------|--------|
| **Symptôme** | $($Context.Symptom) |
| **Données entrée** | $($Context.InputData) |
| **Attendu** | $($Context.Expected) |
| **Obtenu** | $($Context.Actual) |
| **Reporter** | $($Context.Reporter) |
| **Date** | $($Context.Created) |

### Indices extraits automatiquement
- Programmes mentionnés : $($Context.Programs -join ', ')
- Tables mentionnées : $($Context.Tables -join ', ')
- Villages : $($Context.Villages -join ', ')
- Dates : $($Context.Dates -join ', ')

---

<!-- ONGLET: Localisation -->
## 2. Localisation Programmes

### magic_find_program("[recherche]")

| Project | IDE | ID | Name | Public |
|---------|-----|----|------|--------|
| ... | ... | ... | ... | ... |

> **TODO** : Appeler magic_find_program() pour chaque indice extrait

### Programmes identifiés

| IDE Vérifié | Nom | Rôle dans le flux |
|-------------|-----|-------------------|
| ... | ... | ... |

---

<!-- ONGLET: Flux -->
## 3. Traçage Flux

### magic_get_tree("[projet]", [id])

| IDE | ISN_2 | Nom | Niveau |
|-----|-------|-----|--------|
| ... | ... | ... | ... |

> **TODO** : Appeler magic_get_tree() puis magic_get_logic() pour tâches suspectes

### Diagramme du flux

``````
┌─────────────────────────────────────────┐
│ [PROJET] IDE [N]                        │
│ [Nom Programme]                         │
└────────────────────┬────────────────────┘
                     │
                     ▼
         [À compléter avec appels MCP]
``````

---

<!-- ONGLET: Expressions -->
## 4. Analyse Expressions

> **Note** : L'offset est calculé automatiquement par OffsetCalculator.
> Utiliser magic_decode_expression() et magic_get_line().

### magic_decode_expression("[projet]", [prgId], [taskIsn2], [expId])

| Référence | Position | Index Global | Variable | Nom logique |
|-----------|----------|--------------|----------|-------------|
| ... | ... | ... | ... | ... |

### Formule décodée

``````
[À compléter avec résultat MCP]
``````

---

<!-- ONGLET: Root Cause -->
## 5. Root Cause

| Élément | Valeur |
|---------|--------|
| **Programme** | [PROJET] IDE [N] - [Nom] |
| **Sous-tâche** | Tâche [N.X.Y] |
| **Ligne Logic** | Ligne [L] |
| **Expression** | Expression [E] |
| **Erreur** | [Description précise] |
| **Impact** | [Conséquence observable] |

---

<!-- ONGLET: Solution -->
## 6. Solution

### Modification

| Élément | Avant (bug) | Après (fix) |
|---------|-------------|-------------|
| ... | ... | ... |

### Variables concernées

| Variable | Nom logique | Rôle | Statut |
|----------|-------------|------|--------|
| ... | ... | ... | ... |

---

## Données requises

- Base de données : [Village] à la date [JJ/MM/AAAA]
- Table(s) à extraire : [noms tables]

---

*Analyse générée : $(Get-Date -Format "yyyy-MM-ddTHH:mm")*
"@

    return $template
}

function Generate-CommitMessage {
    param(
        [string]$TicketKey,
        [string]$Status,
        [string[]]$Programs
    )

    $action = switch ($Status) {
        "ANALYSIS" { "add" }
        "IN_PROGRESS" { "update" }
        "RESOLVED" { "complete" }
        default { "add" }
    }

    $progs = if ($Programs) { " - $($Programs -join ', ')" } else { "" }

    return "docs(tickets): $action $TicketKey analysis$progs"
}

# Main execution
Write-Host "=== GÉNÉRATEUR DOCUMENTATION TICKET ===" -ForegroundColor Cyan
Write-Host "Ticket: $TicketKey" -ForegroundColor Yellow
Write-Host ""

# Ensure ticket directory exists
if (-not (Test-Path $TicketDir)) {
    New-Item -ItemType Directory -Path $TicketDir -Force | Out-Null
    Write-Host "Created directory: $TicketDir" -ForegroundColor Green
}

# Load analysis data if provided
$context = @{
    Title = "À compléter"
    Symptom = "À extraire du ticket Jira"
    InputData = "À extraire"
    Expected = "À extraire"
    Actual = "À extraire"
    Reporter = ""
    Created = (Get-Date).ToString("yyyy-MM-dd")
    Programs = @()
    Tables = @()
    Villages = @()
    Dates = @()
    Status = "ANALYSIS"
    RootCause = ""
}

if ($AnalysisFile -and (Test-Path $AnalysisFile)) {
    $analysisJson = Get-Content $AnalysisFile -Raw | ConvertFrom-Json
    if ($analysisJson.Metadata) {
        $context.Title = $analysisJson.Metadata.Summary
        $context.Reporter = $analysisJson.Metadata.Reporter
    }
    if ($analysisJson.Symptom) { $context.Symptom = $analysisJson.Symptom }
    if ($analysisJson.InputData) { $context.InputData = $analysisJson.InputData }
    if ($analysisJson.Expected) { $context.Expected = $analysisJson.Expected }
    if ($analysisJson.Actual) { $context.Actual = $analysisJson.Actual }
    if ($analysisJson.Entities) {
        $context.Programs = $analysisJson.Entities.Programs
        $context.Tables = $analysisJson.Entities.Tables
        $context.Villages = $analysisJson.Entities.Villages
        $context.Dates = $analysisJson.Entities.Dates
    }
}

# Generate analysis template
$analysisPath = "$TicketDir\analysis.md"
if (-not (Test-Path $analysisPath)) {
    $template = Generate-AnalysisTemplate -TicketKey $TicketKey -Context $context
    $template | Set-Content $analysisPath -Encoding UTF8
    Write-Host "Generated: $analysisPath" -ForegroundColor Green
} else {
    Write-Host "Exists: $analysisPath (not overwritten)" -ForegroundColor Yellow
}

# Update indexes
$metadata = @{
    Title = $context.Title
    Status = $context.Status
    Programs = $context.Programs
    Tables = $context.Tables
    RootCause = $context.RootCause
}

Update-TicketIndex -TicketKey $TicketKey -Metadata $metadata
Update-OpenSpecIndex -TicketKey $TicketKey -Metadata $metadata

# Generate commit message
$commitMsg = Generate-CommitMessage -TicketKey $TicketKey -Status $context.Status -Programs $context.Programs
Write-Host ""
Write-Host "COMMIT MESSAGE:" -ForegroundColor Cyan
Write-Host $commitMsg -ForegroundColor White

if ($AutoCommit) {
    Write-Host ""
    Write-Host "Committing changes..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    git add ".openspec/tickets/$TicketKey/" ".openspec/tickets/index.json" ".openspec/index.json"
    git commit -m $commitMsg
    Pop-Location
    Write-Host "Committed successfully" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "To commit manually:" -ForegroundColor Yellow
    Write-Host "  git add .openspec/tickets/$TicketKey/ .openspec/tickets/index.json .openspec/index.json"
    Write-Host "  git commit -m `"$commitMsg`""
}
