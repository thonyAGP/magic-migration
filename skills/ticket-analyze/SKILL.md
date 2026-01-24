---
name: ticket-analyze
description: Orchestrateur d'analyse de tickets Magic Jira. Force toutes les etapes du protocole pour atteindre 100% de resolution ou piste claire.
---

<objective>
Analyser systematiquement les tickets Jira lies aux applications Magic Unipaas.
Forcer les 6 phases du workflow pour garantir une analyse complete et verifiable.
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

<orchestration>
## WORKFLOW ORCHESTRE (6 PHASES OBLIGATOIRES)

**REGLE ABSOLUE**: Chaque phase DOIT etre completee avant de passer a la suivante.
Le skill bloque si une phase est incomplete.

### Phase 1: CONTEXTE JIRA (5 min max)

```
INPUTS:
- Ticket Jira (KEY format: CMDS-XXXXXX ou PMS-XXXXX)

ACTIONS OBLIGATOIRES:
1. Fetch ticket via API Jira (script jira-fetch.ps1)
2. Extraire:
   - Symptome (citation exacte)
   - Donnees d'entree (valeurs precises)
   - Resultat attendu vs obtenu
   - Indices (noms programmes, tables, villages)
3. SI contexte insuffisant → BLOQUER avec AskUserQuestion

OUTPUTS:
- Tableau contexte complet
- Liste programmes/tables a investiguer
- Fichier: .openspec/tickets/{KEY}/analysis.md cree

VALIDATION:
- [ ] Symptome documente (citation Jira)
- [ ] Donnees entree presentes
- [ ] Attendu vs Obtenu renseignes
```

### Phase 2: LOCALISATION (10 min max)

```
INPUTS:
- Noms programmes/tables du contexte

ACTIONS OBLIGATOIRES (EN PARALLELE):
1. magic_find_program() pour CHAQUE nom mentionne
2. magic_get_table() pour CHAQUE table mentionnee
3. Pour chaque resultat:
   - magic_get_position() pour confirmer IDE
   - magic_get_tree() pour structure taches

OUTPUTS:
- Tableau programmes avec IDE VERIFIE (format: "XXX IDE N - Nom")
- SI 0 programme trouve → BLOQUER demander clarification

VALIDATION:
- [ ] Tous les programmes ont un IDE verifie
- [ ] magic_get_position() documente pour chaque prog
- [ ] Aucun "Prg_XXX.xml" sans IDE correspondant
```

### Phase 3: TRACAGE FLUX (15 min max)

```
INPUTS:
- Programmes identifies en Phase 2

ACTIONS OBLIGATOIRES (EN PARALLELE):
1. magic_get_logic() pour chaque programme/tache suspecte
2. magic_kb_callgraph() pour dependances
3. Pour chaque CallTask/CallProgram trouve:
   - Noter TargetPrg
   - magic_get_position() pour resoudre IDE cible
4. magic_kb_dead_code() pour detecter code mort
5. magic_kb_constant_conditions() pour conditions IF(0,...)

OUTPUTS:
- Tableau flux avec operations, conditions, cibles
- Diagramme ASCII OBLIGATOIRE
- Liste code mort/conditions constantes

VALIDATION:
- [ ] Diagramme ASCII present
- [ ] Tous CallTask resolus en IDE
- [ ] Code mort identifie (ou "aucun")
```

### Phase 4: ANALYSE EXPRESSIONS (20 min max)

```
INPUTS:
- Expressions identifiees dans la logique

ACTIONS OBLIGATOIRES:
1. Identifier TOUTES les expressions {N,Y} dans le flux
2. magic_decode_expression() pour CHAQUE expression
3. magic_get_line() pour variables contextuelles
4. Generer formule lisible avec noms de variables

OUTPUTS:
- Tableau {N,Y} → Variable + nom logique
- Formule decodee pour chaque expression
- Offset calcule automatiquement (JAMAIS manuellement)

VALIDATION:
- [ ] AUCUNE reference {N,Y} sans decodage
- [ ] Formules lisibles documentees
- [ ] Pas de calcul d'offset manuel
```

### Phase 5: DIAGNOSTIC ROOT CAUSE (10 min max)

```
INPUTS:
- Flux trace + expressions decodees

ACTIONS:
1. Formuler hypothese basee sur analyse
2. Verifier via MCP (magic_get_line, etc.)
3. Confirmer localisation exacte
4. Rechercher patterns similaires: magic_kb_search()

OUTPUTS:
- Root Cause: "Programme.Tache.Ligne.Expression"
- OU Piste claire documentee si root cause non trouvee
- Patterns KB similaires (si existants)

VALIDATION:
- [ ] Root cause avec localisation precise
- [ ] OU piste documentee avec prochaines etapes
- [ ] Recherche patterns KB effectuee
```

### Phase 6: DOCUMENTATION SOLUTION (5 min max)

```
INPUTS:
- Root cause confirmee

ACTIONS:
1. Documenter Avant (bug) vs Apres (fix)
2. Identifier toutes les variables concernees
3. Generer fichier resolution.md
4. Proposer capitalisation si nouveau pattern

OUTPUTS:
- Comparaison Avant/Apres avec variables nommees
- Fichier: .openspec/tickets/{KEY}/resolution.md
- Suggestion pattern KB si applicable

VALIDATION:
- [ ] Avant/Apres documentes
- [ ] Variables avec noms logiques
- [ ] Hook validation passe
```

</orchestration>

<blocking_conditions>
## CONDITIONS DE BLOCAGE

Le skill BLOQUE et demande clarification si:

| Phase | Condition de blocage | Action |
|-------|---------------------|--------|
| 1 | Contexte insuffisant (pas de symptome clair) | AskUserQuestion avec template |
| 2 | 0 programme trouve | AskUserQuestion pour nom correct |
| 2 | Programme XML sans IDE verifie | Forcer magic_get_position() |
| 3 | Pas de diagramme flux | Generer avant de continuer |
| 4 | Reference {N,Y} sans decodage | Forcer magic_decode_expression() |
| 5 | Pas de root cause NI piste | Documenter blocage + escalade |
| 6 | Hook validation echoue | Corriger avant commit |

</blocking_conditions>

<mcp_tools_required>
## OUTILS MCP OBLIGATOIRES PAR PHASE

### Phase 2: Localisation
| Outil | Usage |
|-------|-------|
| `magic_find_program` | Trouver programmes par nom |
| `magic_get_position` | Confirmer IDE |
| `magic_get_tree` | Structure taches |
| `magic_get_table` | Info table |

### Phase 3: Tracage
| Outil | Usage |
|-------|-------|
| `magic_get_logic` | Operations/conditions |
| `magic_kb_callgraph` | Dependances |
| `magic_kb_dead_code` | Code desactive |
| `magic_kb_constant_conditions` | IF(0,...) detectes |
| `magic_kb_dynamic_calls` | Appels ProgIdx() |

### Phase 4: Expressions
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
| `magic_kb_field_usage` | Lineage champs |

</mcp_tools_required>

<pattern_matching>
## DETECTION AUTOMATIQUE TYPE DE BUG

| Mots-cles dans ticket | Type | Outils suggeres |
|----------------------|------|-----------------|
| "affiche", "ecran", "mauvais", "incorrect" | Display | `magic_get_dataview`, form analysis |
| "calcul", "montant", "total", "somme" | Logic | `magic_decode_expression`, `magic_get_logic` |
| "lent", "timeout", "erreur", "crash" | Performance | `magic_kb_table_usage`, indexes |
| "ne marche pas", "bloque", "rien" | Config | Checklist environnement |
| "date", "heure", "format" | Date/Time | `magic_get_line`, Time(0) check |
| "import", "export", "fichier" | I/O | `magic_get_logic`, parsing check |

### Patterns KB connus

Charger depuis `.openspec/patterns/index.json` et suggerer si symptome matche.

</pattern_matching>

<templates>
## TEMPLATES QUESTIONS STANDARDISEES

Utiliser selon type de blocage:

### Contexte insuffisant
```
Questions standardisees (templates/questions.json):
- "Quel est le chemin menu exact pour reproduire?"
- "Quelle est la valeur attendue vs affichee?"
- "Sur quel environnement (village, base)?"
- "Screenshot avec les donnees de test?"
```

### Programme non trouve
```
- "Quel est le nom exact du programme dans le titre de l'ecran?"
- "Dans quel module: Caisse, Ventes, Editions, Batch?"
- "Y a-t-il un code visible (ex: CA0142, PB027)?"
```

### Root cause non identifiee
```
- "Pouvez-vous fournir un jeu de donnees de test?"
- "Le bug est-il reproductible systematiquement?"
- "Depuis quand ce bug apparait-il?"
```

</templates>

<output_files>
## FICHIERS GENERES

| Fichier | Phase | Contenu |
|---------|-------|---------|
| `.openspec/tickets/{KEY}/analysis.md` | 1-5 | Analyse complete avec toutes les phases |
| `.openspec/tickets/{KEY}/resolution.md` | 6 | Solution detaillee |
| `.openspec/tickets/{KEY}/notes.md` | Any | Notes de travail |
| `.openspec/patterns/{pattern}.md` | Post | Pattern capitalise |

### Structure analysis.md

```markdown
# {KEY} - {TITRE}

> **Jira** : [{KEY}](https://clubmed.atlassian.net/browse/{KEY})
> **Protocole** : `/ticket-analyze` v1.0

---

## 1. Contexte Jira
[Tableau symptome, donnees, attendu/obtenu]

## 2. Localisation
[Tableau programmes avec IDE verifie]
[Appels MCP documentes]

## 3. Tracage Flux
[Diagramme ASCII]
[Tableau CallTask resolus]
[Code mort detecte]

## 4. Analyse Expressions
[Tableau {N,Y} → Variables]
[Formules decodees]

## 5. Root Cause
[Localisation precise OU piste documentee]

## 6. Solution
[Avant/Apres avec variables]

---
*Analyse: {TIMESTAMP}*
*Orchestrateur: /ticket-analyze v1.0*
```

</output_files>

<metrics>
## METRIQUES CIBLES

| Metrique | Actuel | Cible | Moyen |
|----------|--------|-------|-------|
| Root cause trouvee | 94% | **100%** | Orchestrateur + patterns |
| Utilisation MCP | 44% | **100%** | Phases bloquantes |
| Expressions decodees | 33% | **100%** | Phase 4 automatique |
| Diagrammes flux | 22% | **100%** | Phase 3 obligatoire |
| Tickets resolus | 56% | **90%** | Patterns + templates |

**Blocages irreductibles** (10%):
- Depend API externe
- Config materiel client
- Clarification impossible (ticket abandonne)

</metrics>

<validation_hook>
## VALIDATION FINALE

Le hook `.claude/hooks/validate-ticket-analysis.ps1` verifie:

1. **Lien Jira** present et formate correctement
2. **IDE verifie** pour chaque programme (pas de Prg_XXX.xml seul)
3. **Appels MCP documentes** (magic_get_position, magic_decode_expression)
4. **Diagramme flux** present (caracteres ASCII box drawing)
5. **Root cause** avec localisation precise (Programme.Tache.Ligne)
6. **Solution** avec Avant/Apres
7. **Aucun pattern interdit** ({N,Y} non decode, ISN_2=X, calcul offset manuel)

Si validation echoue → lister les corrections requises.

</validation_hook>

<references>
## REFERENCES

| Document | Lien |
|----------|------|
| Protocole complet | `.claude/protocols/ticket-analysis.md` |
| Hook validation | `.claude/hooks/validate-ticket-analysis.ps1` |
| Patterns KB | `.openspec/patterns/` |
| Templates questions | `skills/ticket-analyze/templates/questions.json` |
| Skill Magic principal | `skills/magic-unipaas/SKILL.md` |

</references>
