# Protocole Analyse Ticket Magic

> **LECTURE OBLIGATOIRE** avant toute analyse de ticket.
> Ce protocole garantit une analyse structuree et verifiable.
>
> **Architecture** : Pipeline PS1 (collecte) + Claude (analyse)
> **Skill orchestrateur** : `/ticket-analyze {KEY}`

---

## ARCHITECTURE HYBRIDE (v2.0)

### Etape 1: Pipeline PS1 (automatique)

```powershell
# Lancer le pipeline complet
.\tools\ticket-pipeline\Run-TicketPipeline.ps1 -TicketKey "PMS-1234" -SkipJira

# Consolider les donnees
.\tools\ticket-pipeline\auto-consolidate.ps1 -TicketDir ".openspec\tickets\PMS-1234"
```

Le pipeline genere 8 fichiers JSON dans `.openspec/tickets/{KEY}/`:
- `context.json` - Symptome, programmes, mots-cles (Phase 1)
- `programs.json` - Programmes verifies + callers/callees (Phase 2)
- `flow.json` + `diagram.txt` - Flux traces (Phase 3)
- `expressions.json` - Expressions decodees (Phase 4)
- `patterns.json` - Patterns KB matches (Phase 5)
- `pipeline-data.json` - Consolidation < 30KB (Phase 6)

### Etape 2: Claude analyse et redige (9 sections)

Claude lit `pipeline-data.json` et ecrit `analysis.md` selon le template:
`tools/ticket-pipeline/TEMPLATE-ANALYSIS.md`

| Section | Contenu | Source pipeline |
|---------|---------|----------------|
| 1. Contexte Jira | Symptome, indices, attachments | context.json |
| 2. Localisation | Programmes IDE + callers/callees | programs.json |
| 3. Tables | Tables R/W/L avec relations | programs.json + MCP |
| 4. Tracage Flux | Diagramme ASCII + logic | flow.json + MCP |
| 5. Expressions | Formules decodees | expressions.json |
| 6. Diagnostic | Root cause + pattern KB | patterns.json + analyse |
| 7. Checklist + Impact | Validation + downstream | programmes |
| 8. Commits | Historique git | git log |
| 9. Screenshots IDE | Captures ecran | attachments/ |

---

## REGLES IMPERATIVES (MANDATORY)

### 1. JAMAIS D'ANALYSE MANUELLE - TOUJOURS MCP

> **REGLE ABSOLUE** : Ne JAMAIS decoder ou calculer manuellement. TOUJOURS appeler MCP.

| Action | INTERDIT (manuel) | OBLIGATOIRE (MCP ou pipeline) |
|--------|-------------------|-------------------------------|
| Decoder `{0,21}` | "Variable V = prix" (devine) | `magic_decode_expression()` |
| Calculer offset | `143 + 119 + 3 = 265` (a la main) | Pipeline Phase 4 ou MCP |
| Trouver variable ligne N | "Variable C = date" (lu dans XML) | `magic_get_line()` |
| Localiser programme | "Prg_69 = IDE 69" (suppose) | Pipeline Phase 2 ou `magic_get_position()` |

**POURQUOI** : Le calcul manuel est source d'erreurs. Seul OffsetCalculator a la formule validee.

### 2. HEURE = HEURE SYSTEME (JAMAIS HARDCODE)

| Champ | Source | Exemple |
|-------|--------|---------|
| `dga_heure` | `Time(0)` ou `MTime()` | Heure systeme au moment du traitement |
| `dga_date` | `Date(0)` ou parametre | Date comptable |

### 3. STRUCTURE 9 SECTIONS (OBLIGATOIRE)

Toute analyse DOIT suivre la structure du template (9 sections).
Si une section est vide, la mentionner avec "*Non applicable*" ou "*Donnees manquantes*".

---

## QUAND UTILISER LE PIPELINE vs MCP DIRECT

| Situation | Approche |
|-----------|----------|
| Nouveau ticket a analyser | Pipeline complet → consolidation → Claude |
| Pipeline score >= 4/6 | Claude redige directement depuis pipeline-data.json |
| Pipeline score < 4/6 | Claude complete avec outils MCP interactifs |
| Complement d'info en cours d'analyse | MCP direct (magic_get_logic, magic_decode_expression) |
| Question ponctuelle sur programme | MCP direct (magic_get_position) |

---

## PARALLELISATION (OPTIMISATION)

> Pour reduire le temps d'analyse, lancer les appels **independants** en parallele.

| Etape | Appels parallelisables |
|-------|------------------------|
| Phase 2 | `magic_find_program()` pour chaque nom |
| Phase 3 | `magic_get_logic()` pour chaque tache |
| Phase 4 | `magic_decode_expression()` pour chaque expression |

---

## OUTILS MCP PAR PHASE

### Phase 2: Localisation (si pipeline incomplet)
| Outil | Usage |
|-------|-------|
| `magic_find_program` | Trouver programmes par nom |
| `magic_get_position` | Confirmer IDE |
| `magic_get_tree` | Structure taches |
| `magic_get_table` | Info table |

### Phase 3: Tracage (si XML non disponible)
| Outil | Usage |
|-------|-------|
| `magic_get_logic` | Operations/conditions |
| `magic_kb_callgraph` | Dependances |
| `magic_kb_dead_code` | Code desactive |
| `magic_kb_constant_conditions` | IF(0,...) detectes |

### Phase 4: Expressions (si pipeline n'a pas decode)
| Outil | Usage |
|-------|-------|
| `magic_decode_expression` | Decoder {N,Y} |
| `magic_get_line` | Variables ligne |
| `magic_get_expression` | Contenu expression |

### Phase 5: Diagnostic
| Outil | Usage |
|-------|-------|
| `magic_kb_search` | Recherche patterns |
| `magic_kb_table_usage` | Impact donnees |
| `magic_impact_program` | Impact downstream |

---

## KNOWLEDGE BASE PATTERNS

### Patterns disponibles (16)

| Pattern | Symptomes | Source |
|---------|-----------|--------|
| `date-format-inversion` | Date +1 mois, inversion MM/DD | CMDS-174321 |
| `add-filter-parameter` | Masquer lignes, filtrer donnees | PMS-1373 |
| `picture-format-mismatch` | Prix sans decimales | CMDS-176521 |
| `table-link-missing` | Donnees incompletes, jointure | PMS-1451 |
| `ski-rental-duration-calc` | Calcul selon duree sejour | PMS-1446 |
| `empty-date-as-noend` | Accepter 00/00/0000 | PMS-1332 |
| `report-column-enhancement` | Colonnes/totaux rapport | PMS-1400 |
| `filter-not-implemented` | Filtres non codes | PMS-1404 |
| `equipment-config-issue` | Probleme hardware vs code | CMDS-176818 |
| `session-concurrency-check` | Double ouverture session | PMS-1337 |
| `local-config-regression` | Fausse regression Magic.ini | PMS-1407 |
| `modedayinc-date-display` | Decalage date MODEDAYINC | PMS-1437 |
| `missing-dataview-column` | Variable absente DataView | - |
| `missing-vv-condition` | VV sans condition | - |
| `missing-time-validation` | Validation heure manquante | - |
| `extension-treated-as-arrival` | Extension = nouvelle arrivee | - |

### Commandes KB

```
/ticket-search "symptome"    # Recherche patterns similaires
/ticket-learn PMS-1234       # Capitaliser resolution
```

---

## CHECKLIST FINALE

Avant de committer l'analyse:

- [ ] Pipeline execute (6/6 ou justifier les phases manquantes)
- [ ] Tous les programmes ont un IDE verifie
- [ ] Toutes les variables sont decodees (pas de {N,Y} brut)
- [ ] Root cause identifie OU piste documentee
- [ ] Diagramme de flux present
- [ ] Template 9 sections respecte

---

## REGLES D'OR

1. **PIPELINE D'ABORD** : Toujours lancer le pipeline avant d'utiliser MCP
2. **JAMAIS** deduire un IDE d'un nom de fichier XML
3. **TOUJOURS** documenter chaque appel MCP avec son resultat
4. **JAMAIS** citer une expression sans la decoder en variables lisibles
5. **TOUJOURS** donner la localisation exacte: Programme.Tache.Ligne

---

## VALIDATION HOOK (v2.0)

Le hook `.claude/hooks/validate-ticket-analysis.ps1` valide:

| Phase | Validation |
|-------|------------|
| 1. Contexte | Lien Jira present |
| 2. Localisation | IDE verifie pour chaque programme |
| 3. Flux | Diagramme ASCII present |
| 4. Expressions | {N,Y} decodees via MCP |
| 5. Root Cause | Localisation precise |
| 6. Solution | Avant/Apres documente |

### Patterns bloquants

Le hook BLOQUE si:
- ISN_2 utilise au lieu de position IDE
- FieldID utilise au lieu de nom variable
- Calcul offset manuel detecte
- Reference {N,Y} non decodee

**Score minimum** : 5/6 phases validees pour passer

---

*Protocole v2.0 - 2026-01-29*
*Architecture hybride: Pipeline PS1 + Claude*
*Skill orchestrateur: `/ticket-analyze`*
