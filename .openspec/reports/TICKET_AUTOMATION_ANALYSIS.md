# Analyse Automatisation - Ticket Analysis Workflow

> **Date**: 2026-01-24
> **Objectif**: Maximiser l'automatisation des tâches manuelles lors de l'analyse de tickets

---

## 1. Workflow Actuel vs Optimisé

### Temps par ticket

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **Temps total/ticket** | 70-105 min | ~43 min | 59% |
| **Tâches manuelles Claude** | 12 | 6 | 50% |
| **Scripts automatisés** | 0 | 8 | +8 |

---

## 2. Tâches Automatisées (Scripts)

### 2.1 Scripts Créés

| Script | Description | Input | Output | Économie |
|--------|-------------|-------|--------|----------|
| `magic-config-generator.ps1` | Génère config dynamique (projets, villages) | File system | `magic-config.json` | - |
| `ticket-extract-context.ps1` | Extrait contexte structuré du ticket Jira | Fichier ticket JSON | JSON contexte | 8 min |
| `magic-flow-analyzer.ps1` | Analyse flux programme, ASCII diagrams | Project, ProgramId | Markdown template | 8 min |
| `ticket-doc-generator.ps1` | Génère docs, met à jour index | TicketKey | analysis.md + index.json | 13 min |
| `magic-logic-parser-v6.ps1` | Parse Logic avec diagramme ASCII | Project, PrgId, TaskIsn | Markdown complet | 18 min |
| `magic-expression-formatter.ps1` | Formate expressions, détecte types | Project, PrgId, TaskIsn | Analyse types | 10 min |
| `magic-task-analyzer.ps1` | Identifie tâches suspectes | Project, PrgId | Liste classée | 5 min |
| `magic-program-scorer.ps1` | Score candidats programmes | Query | Ranking + recommandation | 3 min |

**Total économie potentielle: ~65 min/ticket → ~40 min/ticket**

### 2.2 Configuration Dynamique

**Fichier**: `.openspec/magic-config.json`

```json
{
  "projects": {
    "all": ["ADH", "PBP", "REF", ...],  // 29 projets découverts
    "active": ["ADH", "PBP", "REF", "VIL", "PBG", "PVE", "PUG"]
  },
  "villages": {
    "codes": ["CSK", "VPH", ...],  // 32 codes
    "count": 32
  },
  "patterns": {
    "program": [...],
    "table": [...],
    "village": "\\b(CSK|VPH|...)\\b"
  }
}
```

**Mise à jour**: Automatique via hook SessionStart ou `magic-config-generator.ps1`

---

## 3. Tâches Humaines Irremplaçables

| Tâche | Raison | Alternative impossible |
|-------|--------|------------------------|
| **Formulation hypothèse root cause** | Jugement humain, expérience métier | IA peut suggérer mais pas décider |
| **Validation logique métier** | Connaissance domaine Club Med | Règles trop spécifiques |
| **Interprétation formules Magic** | Contexte fonctionnel | Syntaxe ≠ Sémantique |
| **Design solution** | Créativité, trade-offs | IA peut proposer options |
| **Décision impact/risque** | Responsabilité humaine | Non délégable |
| **Communication avec stakeholders** | Relationnel | Requiert humain |

---

## 4. Règles d'Automatisation

### 4.1 Calculs d'Offset

| Type | Automatisé | Outil |
|------|------------|-------|
| Variable offset DataView | 100% | `OffsetCalculator.cs` |
| Position IDE → XML | 100% | `magic_get_position` |
| Décodage `{N,Y}` | 100% | `magic_decode_expression` |

**Règle absolue**: JAMAIS de calcul manuel. Toujours MCP.

### 4.2 Recherche et Localisation

| Action | Automatisée | Outil |
|--------|-------------|-------|
| Trouver programme par nom | 100% | `magic_find_program` |
| Lister programmes projet | 100% | `magic_list_programs` |
| Arbre tâches | 100% | `magic_get_tree` |
| Logic d'une tâche | 100% | `magic_get_logic` |

### 4.3 Extraction et Parsing

| Action | Automatisée | Outil |
|--------|-------------|-------|
| Contexte ticket Jira | 80% | `ticket-extract-context.ps1` |
| Entités (programmes, tables, villages) | 90% | Regex + config |
| Flow diagram | 70% | `magic-flow-analyzer.ps1` |

---

## 5. Intégration Workflow

### 5.1 Commandes Slash

| Commande | Scripts utilisés |
|----------|------------------|
| `/ticket-new {KEY}` | `ticket-doc-generator.ps1`, `ticket-extract-context.ps1` |
| `/ticket` | Menu interactif |
| `/ticket-learn` | KB SQLite |

### 5.2 Hooks

| Hook | Action | Fichier |
|------|--------|---------|
| SessionStart | Vérifier config, charger tickets actifs | `hook-tickets-html.ps1` |
| PreToolUse | Valider format IDE Magic | `validate-magic-ide-format.ps1` |

---

## 6. Métriques Cibles

| KPI | Cible | Actuel |
|-----|-------|--------|
| Temps moyen/ticket | < 45 min | ~43 min |
| Taux appels MCP | 100% | 100% |
| Calculs manuels | 0% | 0% |
| Scripts utilisés/ticket | 4+ | 4 |

---

## 7. Prochaines Améliorations

| Priorité | Amélioration | Impact |
|----------|--------------|--------|
| P1 | Hook git push → `magic-config-generator.ps1` | Liste projets toujours à jour |
| P2 | Extraction automatique PJ Jira | -10 min/ticket |
| P3 | Détection auto type ticket (bug/feature) | Workflow adapté |
| P4 | Templates solution par type bug | -5 min/ticket |

---

*Généré: 2026-01-24*
