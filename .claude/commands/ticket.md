---
description: Menu principal de gestion des tickets Jira CMDS/PMS
---

# Menu Tickets Jira

Affiche le menu des tickets actifs et les actions disponibles.

## Execution

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\Projects\Lecteur Magic\.claude\scripts\ticket-menu.ps1"
```

## Actions disponibles

| Action | Description |
|--------|-------------|
| **[N]** | Nouveau ticket - utiliser `/ticket-new CMDS-XXXXX` |
| **[M]** | Outils MCP Magic - `/magic-tree`, `/magic-analyze`, etc. |
| **[S]** | Skills et agents disponibles |
| **[R]** | Rafraichir la liste (sync Jira force) |
| **[numero]** | Selectionner un ticket par son numero |

## Commandes liees

| Commande | Description |
|----------|-------------|
| `/ticket-new {KEY}` | Initialiser l'analyse d'un nouveau ticket |
| `/ticket-learn {KEY}` | Capitaliser la resolution dans la KB |
| `/ticket-search {query}` | Rechercher des patterns similaires |

## Structure de stockage

```
.openspec/tickets/
├── index.json              # Cache tickets actifs
├── patterns.sqlite         # Knowledge Base
└── {ISSUE-KEY}/
    ├── analysis.md         # Analyse technique
    ├── notes.md            # Notes de travail
    ├── resolution.md       # Solution finale
    └── attachments/        # Pieces jointes
```

## Workflow recommande

1. Au demarrage, consulter le menu automatique (hook SessionStart)
2. Selectionner un ticket pour voir son analyse existante
3. Si nouveau ticket: `/ticket-new CMDS-XXXXX`
4. Analyser avec les outils MCP Magic
5. En fin de resolution: `/ticket-learn` pour capitaliser

## Projets configures

| Projet | Description | Prefixe |
|--------|-------------|---------|
| CMDS | Support PMS (incidents, questions) | CMDS-XXXXXX |
| PMS | Bugfix/Release (corrections, evolutions) | PMS-XXXXX |
