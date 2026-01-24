# Cahier des Charges Migration - {PROJECT}

> Document généré automatiquement le {DATE}
> Source: Magic Knowledge Base

---

## 1. Vue d'Ensemble

| Métrique | Valeur |
|----------|--------|
| **Programmes** | {PROGRAM_COUNT} |
| **Tâches totales** | {TASK_COUNT} |
| **Expressions totales** | {EXPRESSION_COUNT} |
| **Complexité moyenne** | {AVG_COMPLEXITY} |
| **Main Offset** | {MAIN_OFFSET} |

### Répartition par Complexité

| Niveau | Programmes | Description |
|--------|------------|-------------|
| 🔴 Haute (>1000) | {HIGH_COMPLEXITY_COUNT} | Nécessitent analyse approfondie |
| 🟡 Moyenne (100-1000) | {MEDIUM_COMPLEXITY_COUNT} | Migration standard |
| 🟢 Basse (<100) | {LOW_COMPLEXITY_COUNT} | Migration rapide |

---

## 2. Inventaire Programmes

| IDE | Nom | Public Name | Tâches | Expressions | Complexité |
|-----|-----|-------------|--------|-------------|------------|
{PROGRAMS_TABLE}

---

## 3. Tables et Données

### Tables utilisées par le projet

| Table | Nom | Type d'accès | Utilisée par (progs) |
|-------|-----|--------------|----------------------|
{TABLES_TABLE}

### Statistiques Tables

- **Tables en lecture (R)**: {READ_TABLES}
- **Tables en écriture (W)**: {WRITE_TABLES}
- **Tables liées (L)**: {LINK_TABLES}

---

## 4. Dépendances Cross-Projet

### Appels entrants (depuis autres projets)

Ce projet est appelé par d'autres projets:

{INCOMING_CALLS}

### Appels sortants (vers autres projets)

Ce projet appelle d'autres projets:

{OUTGOING_CALLS}

### Matrice de dépendances

```
{DEPENDENCY_MATRIX}
```

---

## 5. Interfaces Utilisateur

### Écrans (Forms)

| Programme | IDE | Écran | Type fenêtre | Dimensions |
|-----------|-----|-------|--------------|------------|
{FORMS_TABLE}

### Statistiques UI

- **Nombre total d'écrans**: {FORM_COUNT}
- **Fenêtres MDI (type 2)**: {MDI_COUNT}
- **Fenêtres modales (type 1)**: {MODAL_COUNT}

---

## 6. Composants Partagés (ECF)

### Utilisation des composants externes

{ECF_USAGE}

---

## 7. Recommandations Migration

### Priorités suggérées

1. **Phase 1 - Core**: Programmes avec publicName (API callable)
2. **Phase 2 - UI**: Écrans principaux (WindowType=2)
3. **Phase 3 - Batch**: Programmes de traitement
4. **Phase 4 - Support**: Utilitaires et helpers

### Risques identifiés

| Risque | Impact | Programmes concernés |
|--------|--------|---------------------|
| Complexité haute | Élevé | {HIGH_RISK_PROGRAMS} |
| Dépendances cross-projet | Moyen | {CROSS_DEP_PROGRAMS} |
| Expressions dynamiques | Moyen | À analyser |

### Effort estimé

| Catégorie | Programmes | Effort estimé |
|-----------|------------|---------------|
| Simple (complexité < 100) | {LOW_COMPLEXITY_COUNT} | {LOW_EFFORT} |
| Standard (100-1000) | {MEDIUM_COMPLEXITY_COUNT} | {MEDIUM_EFFORT} |
| Complexe (>1000) | {HIGH_COMPLEXITY_COUNT} | {HIGH_EFFORT} |
| **Total** | **{PROGRAM_COUNT}** | **{TOTAL_EFFORT}** |

---

## 8. Fichiers Générés

| Fichier | Description |
|---------|-------------|
| `programs.csv` | Liste complète des programmes |
| `tables.csv` | Liste des tables utilisées |
| `dependencies.json` | Graphe des dépendances |
| `complexity.json` | Scores de complexité |

---

*Document généré par Generate-MigrationSpec.ps1*
*Magic Knowledge Base Schema v2*
