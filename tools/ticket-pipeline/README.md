# Ticket Pipeline

> Pipeline automatise pour l'analyse de tickets Jira CMDS/PMS

## Vue d'ensemble

Pipeline PowerShell 100% automatique qui analyse les tickets Magic sans intervention humaine.
Lit directement XML/KB, aucune dependance Claude.

## Architecture

```
Run-TicketPipeline.ps1 (orchestrateur)
         │
         ├── Phase 1: auto-extract-context.ps1
         │            └── Extraction Jira ou fichiers locaux
         │
         ├── Phase 2: auto-find-programs.ps1
         │            └── Localisation programmes (IDE verifie)
         │
         ├── Phase 3: auto-trace-flow.ps1
         │            └── Tracage flux + diagramme ASCII
         │
         ├── Phase 4: auto-decode-expressions.ps1
         │            └── Decodage expressions {N,Y}
         │
         ├── Phase 5: auto-match-patterns.ps1
         │            └── Matching patterns KB
         │
         └── Phase 6: auto-generate-analysis.ps1
                      └── Generation analysis.md
```

## Usage

### Pipeline complet (avec Jira)

```powershell
.\Run-TicketPipeline.ps1 -TicketKey "PMS-1234"
```

### Mode offline (sans Jira)

```powershell
.\Run-TicketPipeline.ps1 -TicketKey "PMS-1234" -SkipJira
```

### Phases individuelles

```powershell
# Phase 2 seule - trouver programmes
.\auto-find-programs.ps1 -TicketKey "PMS-1234" -ProgramNames "Gestion_Caisse,Print_ticket"

# Phase 4 seule - decoder expressions
.\auto-decode-expressions.ps1 -Project ADH -IDE 237
```

## Scripts

| Script | Phase | Input | Output |
|--------|-------|-------|--------|
| `Run-TicketPipeline.ps1` | ALL | TicketKey | analysis.md |
| `auto-extract-context.ps1` | 1 | Jira/fichiers | context.json |
| `auto-find-programs.ps1` | 2 | Noms programmes | programs.json |
| `auto-trace-flow.ps1` | 3 | Programmes | flow.json + diagram.txt |
| `auto-decode-expressions.ps1` | 4 | Expressions | expressions.json |
| `auto-match-patterns.ps1` | 5 | Symptomes | patterns.json |
| `auto-generate-analysis.ps1` | 6 | State complet | analysis.md |

## Outputs

Chaque execution cree un dossier dans `.openspec/tickets/{TICKET-KEY}/`:

```
.openspec/tickets/PMS-1234/
├── context.json       # Contexte Jira extrait
├── programs.json      # Programmes identifies
├── flow.json          # Flux traces
├── expressions.json   # Expressions decodees
├── patterns.json      # Patterns matches
├── analysis.md        # Analyse finale
└── diagram.txt        # Diagramme ASCII
```

## Fonctionnalites

### Lecture directe Knowledge Base

```powershell
# Connexion SQLite
$db = "$env:USERPROFILE\.magic-kb\knowledge.db"
$conn = [System.Data.SQLite.SQLiteConnection]::new("Data Source=$db")
```

### Parsing XML programmes

```powershell
# Lecture Prg_XXX.xml
$xml = [xml](Get-Content $progPath -Encoding UTF8)
$tasks = $xml.SelectNodes("//Task")
```

### Calcul offset automatique

```
Formule: Main_VG + Σ Selects predecesseurs

Main_VG = nombre Columns dans Task ISN_2=1
Select_offset = nombre Fields dans chaque Select
```

### Generation diagramme ASCII

```
Input: flow.json
Output:
    ┌─────────────────┐
    │ ADH IDE 121     │
    │ Gestion_Caisse  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ ADH IDE 229     │
    │ Print_ticket    │
    └─────────────────┘
```

### Matching patterns KB

```powershell
# Scoring patterns
Score = Σ (matched_keywords × weight)

Minimum score requis: 2 points
Top 3 patterns retournes
```

## Prerequis

- PowerShell 5.1+ ou PowerShell Core
- SQLite assemblies (System.Data.SQLite)
- Knowledge Base peuplee (`KbIndexRunner.exe`)
- Acces Jira (optionnel, pour Phase 1)

## Variables d'environnement

| Variable | Description | Default |
|----------|-------------|---------|
| `JIRA_BASE_URL` | URL base Jira | https://jira.example.com |
| `JIRA_USER` | Utilisateur Jira | - |
| `JIRA_TOKEN` | Token API Jira | - |
| `MAGIC_KB_PATH` | Chemin Knowledge Base | ~/.magic-kb/knowledge.db |

## Patterns KB Supportes

| Pattern | Description | Source |
|---------|-------------|--------|
| date-format-inversion | Inversion MM/DD | CMDS-174321 |
| add-filter-parameter | Parametre filtre | PMS-1373 |
| picture-format-mismatch | Mauvaise variable | CMDS-176521 |
| table-link-missing | Jointure manquante | PMS-1451 |
| ski-rental-duration-calc | Calcul duree sejour | PMS-1446 |
| + 11 autres | Voir `.openspec/patterns/` | KB |

## Troubleshooting

### Jira connection failed

```
[ERROR] Phase 1 - Cannot connect to Jira
```

**Solution**: Configurer variables d'environnement ou utiliser `-SkipJira`

### Programme non trouve

```
[WARN] Programme 'Gestion_Caisse' not found in KB
```

**Solution**: Verifier le nom exact dans ProgramHeaders.xml

### Pattern score trop bas

```
[INFO] No patterns matched (score < 2)
```

**Solution**: Enrichir patterns KB ou ajuster keywords

---

*Pipeline automatise - 6 phases - 100% PowerShell*
*Dernier audit PDCA: 2026-01-27*
