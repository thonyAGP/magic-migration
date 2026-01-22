---
description: Analyse complete automatisee d'un ticket Jira avec outils MCP Magic
arguments:
  - name: issue_key
    description: Cle du ticket (ex: PMS-1451, CMDS-176521)
    required: true
---

# Analyse Automatisee Ticket $ARGUMENTS

> **WORKFLOW COMPLET** : Cette commande execute les 6 etapes du protocole `.claude/protocols/ticket-analysis.md`

## Phase 1 : FETCH Jira + Creation structure

### 1.1 Recuperer le ticket Jira

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File ".claude/scripts/jira-fetch.ps1" -IssueKey "$ARGUMENTS" -WithComments
```

### 1.2 Creer le dossier ticket

```bash
mkdir -p ".openspec/tickets/$ARGUMENTS"
```

### 1.3 Telecharger les pieces jointes

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File ".claude/scripts/jira-download-attachments.ps1" -IssueKey "$ARGUMENTS"
```

## Phase 2 : LOCALISATION Programmes

### 2.1 Extraire les indices du ticket

Depuis la description Jira, identifier :
- **Mots-cles fonctionnels** (purge, transfert, caisse, vente, etc.)
- **Noms de programmes** mentionnes
- **Tables suspectes**

### 2.2 Rechercher les programmes

Pour CHAQUE mot-cle identifie, appeler :

```
magic_find_program(query="{mot-cle}", limit=15)
```

### 2.3 Verifier les positions IDE

Pour CHAQUE programme trouve, appeler :

```
magic_get_position(project="{PROJET}", programId={id})
```

**REGLE ABSOLUE** : Ne JAMAIS utiliser Prg_XXX dans le rapport. Toujours convertir en IDE.

### 2.4 Obtenir l'arborescence

Pour le programme principal :

```
magic_get_tree(project="{PROJET}", programId={id})
```

## Phase 3 : TRACAGE Flux

### 3.1 Analyser la logique

```
magic_get_logic(project="{PROJET}", programId={id}, isn2=1)
```

### 3.2 Resoudre les CallTask/CallProgram

Pour chaque appel trouve, utiliser `magic_get_position()` pour identifier la cible.

### 3.3 Construire le diagramme ASCII

```
┌─────────────────┐
│ PROJET IDE XXX  │ Nom Programme
│ Tâche XXX.Y     │ Description
└────────┬────────┘
         │ Type appel
         ▼
┌─────────────────┐
│ PROJET IDE YYY  │ Programme cible
└─────────────────┘
```

## Phase 4 : ANALYSE Expressions

### 4.1 Parser avec magic-logic-parser-v5

Pour la tache suspecte :

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File "tools/magic-logic-parser-v5.ps1" -Project {PROJET} -PrgId {id} -TaskIsn {isn}
```

### 4.2 Decoder les expressions

Pour chaque expression suspecte :

```
magic_get_expression(project="{PROJET}", programId={id}, expressionId={exp})
```

### 4.3 Obtenir les variables

```
magic_get_line(project="{PROJET}", taskPosition="{X.Y.Z}", lineNumber={N}, mainOffset={offset})
```

**Offsets par projet** :
- ADH: 117
- PVE: 143
- PBG: 91
- VIL: 52
- PBP: 88
- REF: 107

## Phase 5 : ROOT CAUSE

### 5.1 Formuler l'hypothese

Basee sur les expressions decodees et le flux trace.

### 5.2 Verifier avec MCP

Utiliser les outils pour confirmer ou infirmer.

### 5.3 Documenter la root cause

| Element | Valeur |
|---------|--------|
| **Programme** | {PROJET} IDE {N} - {Nom} |
| **Sous-tache** | Tache {N.X.Y} |
| **Ligne Logic** | Ligne {L} |
| **Expression** | Expression {E} |
| **Erreur** | {Description precise} |

## Phase 6 : SOLUTION + DOCUMENTATION

### 6.1 Rediger analysis.md

Utiliser le template `.openspec/tickets/TEMPLATE/analysis.md`

### 6.2 Mettre a jour les index

Modifier `.openspec/tickets/index.json` ET `.openspec/index.json`

### 6.3 Commit et push

```bash
git add .openspec/tickets/$ARGUMENTS/ .openspec/tickets/index.json .openspec/index.json
git commit -m "docs(tickets): add $ARGUMENTS analysis"
git push origin master
```

## Resume des outils MCP a utiliser

| Outil | Usage |
|-------|-------|
| `magic_find_program` | Rechercher programmes par nom/mot-cle |
| `magic_get_position` | Convertir ID XML en position IDE |
| `magic_get_tree` | Obtenir arborescence des taches |
| `magic_get_logic` | Obtenir les operations Logic |
| `magic_get_expression` | Decoder une expression |
| `magic_get_line` | Obtenir DataView + Logic d'une ligne |
| `magic_get_dataview` | Structure DataView complete |
| `magic_get_table` | Informations sur une table |

## Output attendu

A la fin de cette commande, les fichiers suivants doivent exister :

1. `.openspec/tickets/$ARGUMENTS/analysis.md` - Analyse complete
2. `.openspec/tickets/index.json` - Mis a jour
3. `.openspec/index.json` - Mis a jour
4. Commit pousse vers origin

---

*Commande creee : 2026-01-22*
*Protocole : ticket-analysis.md v1.0*
