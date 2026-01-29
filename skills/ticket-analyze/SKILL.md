---
name: ticket-analyze
description: Orchestrateur hybride d'analyse de tickets Magic Jira. Pipeline PS1 automatique + Claude pour l'analyse.
---

<objective>
Analyser systematiquement les tickets Jira lies aux applications Magic Unipaas.
Architecture hybride: pipeline PowerShell collecte les donnees → Claude ecrit analysis.md.
Objectif: 100% des tickets avec root cause identifiee ou piste claire documentee.
</objective>

<quick_start>
<workflow>
1. `/ticket-analyze {KEY}` - Lancer l'analyse orchestree complete
2. `/ticket-search {query}` - Chercher patterns similaires dans la KB
3. `/ticket-learn {KEY}` - Capitaliser resolution dans la KB
</workflow>

<example_usage>
Analyser un nouveau ticket:
```
/ticket-analyze PMS-1500
```

Rechercher patterns similaires:
```
/ticket-search "date incorrecte"
```

Capitaliser apres resolution:
```
/ticket-learn PMS-1500
```
</example_usage>
</quick_start>

<architecture>
## ARCHITECTURE HYBRIDE (v2.0)

### Pipeline PowerShell (collecte automatique)

Le pipeline PS1 collecte les donnees brutes en 6 phases:

```
Run-TicketPipeline.ps1 -TicketKey "PMS-1234" [-SkipJira]
    |
    +-- Phase 1: auto-extract-context.ps1    → context.json
    +-- Phase 2: auto-find-programs.ps1      → programs.json
    +-- Phase 3: auto-trace-flow.ps1         → flow.json + diagram.txt
    +-- Phase 4: auto-decode-expressions.ps1 → expressions.json
    +-- Phase 5: auto-match-patterns.ps1     → patterns.json
    +-- Consolidation: auto-consolidate.ps1  → pipeline-data.json
```

### Claude (analyse et redaction)

Claude lit `pipeline-data.json` et ecrit `analysis.md` avec 9 sections:

| Section | Contenu | Source |
|---------|---------|--------|
| 1. Contexte Jira | Symptome, indices, attachments | context.json + Jira |
| 2. Localisation | Programmes IDE verifies + callers/callees | programs.json |
| 3. Tables | Tables avec access modes R/W/L | programs.json + MCP |
| 4. Tracage Flux | Diagramme ASCII + logic units | flow.json + MCP |
| 5. Expressions | Formules decodees {N,Y} → variables | expressions.json |
| 6. Diagnostic | Root cause + pattern KB | patterns.json + analyse |
| 7. Checklist + Impact | Validation + downstream | programmes |
| 8. Commits | Historique git lie | git log |
| 9. Screenshots IDE | Captures ecran | attachments/ |

### Template

Template de reference: `tools/ticket-pipeline/TEMPLATE-ANALYSIS.md`

</architecture>

<orchestration>
## WORKFLOW ORCHESTRE

### Etape 1: LANCER LE PIPELINE

```powershell
# Avec Jira (recommande)
.\tools\ticket-pipeline\Run-TicketPipeline.ps1 -TicketKey "PMS-1234"

# Sans Jira (mode offline)
.\tools\ticket-pipeline\Run-TicketPipeline.ps1 -TicketKey "PMS-1234" -SkipJira
```

Le pipeline genere automatiquement:
- `context.json` - Contexte et mots-cles
- `programs.json` - Programmes verifies avec callers/callees
- `flow.json` - Flux traces (si XML disponible)
- `expressions.json` - Expressions decodees
- `patterns.json` - Patterns KB matches
- `pipeline-state.json` - Etat pipeline
- `diagram.txt` - Diagramme ASCII

### Etape 2: CONSOLIDER

```powershell
.\tools\ticket-pipeline\auto-consolidate.ps1 -TicketDir ".openspec\tickets\PMS-1234"
```

Genere `pipeline-data.json` (< 30KB) avec toutes les donnees consolidees.

### Etape 3: ANALYSER ET REDIGER

Claude lit `pipeline-data.json` et ecrit `analysis.md` en utilisant:
- Les donnees du pipeline comme base factuelle
- Les outils MCP pour completer les sections manquantes
- Le template TEMPLATE-ANALYSIS.md pour la structure

### Etape 4: VALIDATION

Le hook `.claude/hooks/validate-ticket-analysis.ps1` verifie:
- IDE verifie pour chaque programme
- Pas de references {N,Y} non decodees
- Diagramme ASCII present
- Root cause ou piste documentee

</orchestration>

<pipeline_phases>
## PHASES DU PIPELINE PS1

### Phase 1: CONTEXTE JIRA
- **Script**: `auto-extract-context.ps1`
- **Sources** (par priorite): Jira API → Index local → Fichiers locaux
- **Output**: `context.json` (symptome, programmes, tables, keywords, attachments)

### Phase 2: LOCALISATION PROGRAMMES
- **Script**: `auto-find-programs.ps1`
- **Methode**: Requetes KB SQLite (KbIndexRunner CLI)
- **Output**: `programs.json` (IDE verifie, callers, callees, tables)

### Phase 3: TRACAGE FLUX
- **Script**: `auto-trace-flow.ps1`
- **Methode**: Parsing XML Prg_XXX.xml directement
- **Output**: `flow.json` + `diagram.txt` (CallTasks, expressions, UI forms)

### Phase 4: DECODAGE EXPRESSIONS
- **Script**: `auto-decode-expressions.ps1`
- **Methode**: MagicMcp.exe CLI pour decoder {N,Y}
- **Output**: `expressions.json` (expressions decodees avec variables)

### Phase 5: MATCHING PATTERNS KB
- **Script**: `auto-match-patterns.ps1`
- **Methode**: Scoring symptomes/mots-cles vs index patterns
- **Output**: `patterns.json` (patterns tries par score, seuil min 2)

### Phase 6: CONSOLIDATION
- **Script**: `auto-consolidate.ps1`
- **Methode**: Lecture + validation inter-phase + JSON compact
- **Output**: `pipeline-data.json` (< 30KB, pret pour Claude)

</pipeline_phases>

<blocking_conditions>
## CONDITIONS DE BLOCAGE

| Situation | Pipeline | Claude |
|-----------|----------|--------|
| Pas de symptome | Phase 1 skip | AskUserQuestion |
| 0 programme trouve | Phase 2 vide | Demander nom programme |
| XML non disponible | Phase 3 vide | Utiliser MCP directement |
| Expression non decodee | Phase 4 skip | magic_decode_expression() |
| Pas de root cause | Normal | Documenter piste + prochaines etapes |

</blocking_conditions>

<mcp_tools_required>
## OUTILS MCP POUR COMPLETER LE PIPELINE

### Quand le pipeline suffit (score >= 4/6)
Claude redige directement depuis pipeline-data.json.

### Quand le pipeline est insuffisant (score < 4/6)
Claude complete avec les outils MCP:

| Outil | Usage |
|-------|-------|
| `magic_get_position` | Confirmer IDE si pipeline incomplet |
| `magic_get_tree` | Structure taches |
| `magic_get_logic` | Operations/conditions |
| `magic_decode_expression` | Decoder {N,Y} manquants |
| `magic_kb_callgraph` | Dependances |
| `magic_kb_dead_code` | Code desactive |
| `magic_get_line` | Variables ligne |
| `magic_kb_search` | Recherche patterns KB |

</mcp_tools_required>

<output_files>
## FICHIERS GENERES

### Pipeline (automatique)

| Fichier | Phase | Contenu |
|---------|-------|---------|
| `context.json` | 1 | Contexte Jira + mots-cles |
| `programs.json` | 2 | Programmes verifies + callers/callees |
| `flow.json` | 3 | Flux traces + UI |
| `diagram.txt` | 3 | Diagramme ASCII |
| `expressions.json` | 4 | Expressions decodees |
| `patterns.json` | 5 | Patterns KB matches |
| `pipeline-data.json` | 6 | Consolidation < 30KB |
| `pipeline-state.json` | - | Etat pipeline (timing, erreurs) |

### Claude (redaction)

| Fichier | Contenu |
|---------|---------|
| `analysis.md` | Analyse complete 9 sections |
| `resolution.md` | Solution detaillee (post-resolution) |
| `notes.md` | Notes de travail |

### Template

| Fichier | Usage |
|---------|-------|
| `TEMPLATE-ANALYSIS.md` | Structure des 9 sections |

</output_files>

<metrics>
## METRIQUES CIBLES

| Metrique | Pipeline seul | Hybride (cible) |
|----------|---------------|-----------------|
| Programmes verifies | 100% (KB) | 100% |
| Expressions decodees | ~50% (XML dispo) | 100% (+ MCP) |
| Patterns KB matches | 100% (auto) | 100% |
| Root cause trouvee | 0% (pas d'analyse) | 90% (Claude) |
| Diagrammes flux | ~30% (XML dispo) | 100% (+ MCP) |

</metrics>

<references>
## REFERENCES

| Document | Lien |
|----------|------|
| Protocole complet | `.claude/protocols/ticket-analysis.md` |
| Template 9 sections | `tools/ticket-pipeline/TEMPLATE-ANALYSIS.md` |
| Pipeline scripts | `tools/ticket-pipeline/` |
| Hook validation | `.claude/hooks/validate-ticket-analysis.ps1` |
| Patterns KB | `.openspec/patterns/` |
| Templates questions | `skills/ticket-analyze/templates/questions.json` |
| Skill Magic principal | `skills/magic-unipaas/SKILL.md` |

</references>
