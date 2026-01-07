---
description: Initialise l'analyse d'un nouveau ticket Jira
arguments:
  - name: issue_key
    description: Cle du ticket (ex: CMDS-174321, PMS-89001)
    required: true
---

# Initialisation Ticket $ARGUMENTS

## Etapes automatiques

### 1. Fetch ticket Jira

```bash
powershell -ExecutionPolicy Bypass -File "D:\Projects\Lecteur Magic\.claude\scripts\jira-fetch.ps1" -IssueKey "$ARGUMENTS" -WithComments -WithAttachments
```

### 2. Creer structure locale

Creer le dossier `.openspec/tickets/$ARGUMENTS/` avec:

```
.openspec/tickets/$ARGUMENTS/
├── analysis.md      # Analyse technique (template ci-dessous)
├── notes.md         # Notes de travail
├── resolution.md    # Solution finale (vide initialement)
└── attachments/     # Pieces jointes
```

### 3. Telecharger attachments

```bash
powershell -ExecutionPolicy Bypass -File "D:\Projects\Lecteur Magic\.claude\scripts\jira-download-attachments.ps1" -IssueKey "$ARGUMENTS"
```

### 4. Generer analysis.md

Utiliser ce template:

```markdown
# Analyse $ARGUMENTS

## Symptome

[Description du probleme rapporte depuis Jira]

## Contexte

| Element | Valeur |
|---------|--------|
| **Village/Site** | |
| **Date incident** | |
| **GM/Dossier** | |
| **Reporter** | |

## Investigation

### Programmes impliques

| Projet | Prg ID | IDE | Description | Role |
|--------|--------|-----|-------------|------|
| | | | | |

### Tables concernees

| Table | ID REF | Fichier Physique | Champs cles |
|-------|--------|------------------|-------------|
| | | | |

### Hypotheses

| # | Hypothese | Probabilite | Explication |
|---|-----------|-------------|-------------|
| 1 | | | |

## Analyse technique

### Tracage flux

[Utiliser MCP: magic_get_tree, magic_get_logic, magic_get_dataview]

### Requetes SQL de verification

```sql
-- Requetes a executer sur la base concernee
```

## DONNEES REQUISES POUR COMPLETER L'ANALYSE

### Base de donnees

| Element | Valeur |
|---------|--------|
| **Village** | |
| **Date** | |
| **Dossier concerne** | |

### Tables a extraire

| Table SQL | Champs critiques | Description |
|-----------|------------------|-------------|
| | | |

---

*Rapport genere le [date]*
```

## Apres initialisation

1. **Lire le ticket Jira** pour comprendre le symptome
2. **Analyser les captures d'ecran** dans attachments/
3. **Identifier les programmes** avec `/magic-search`
4. **Tracer le flux** avec `/magic-tree` et `/magic-analyze`
5. **Documenter les hypotheses** dans analysis.md
6. **Demander les donnees requises** en fin d'analyse
