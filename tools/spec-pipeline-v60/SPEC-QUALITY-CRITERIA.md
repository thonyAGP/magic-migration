# Critères de Qualité des Specs V6.0

> Ce document définit les critères MESURABLES pour chaque section d'une spec.
> Les tests E2E valident ces critères automatiquement.

---

## 1. IDENTIFICATION

| Critère | Minimum | Idéal |
|---------|---------|-------|
| Projet présent | OUI | OUI |
| IDE Position | OUI | OUI |
| Nom Programme | > 5 caractères | Nom complet |
| Statut Orphelin | OUI | Avec raison |
| Callers listés | Si NON_ORPHELIN | Tous |

---

## 2. OBJECTIF METIER

| Critère | Minimum | Idéal |
|---------|---------|-------|
| Description | > 50 caractères | > 200 caractères |
| Fonctionnalités | >= 3 items | Toutes les tâches UI |
| Tables WRITE | Toutes listées | Avec description |
| Règles métier | >= 5 règles | TOUTES les règles |
| Longueur règle | **NON TRONQUÉE** | Texte complet |

### Règle critique: PAS DE TRONCATURE

Les règles métier doivent être affichées **EN ENTIER**:
- Pas de limite de caractères
- Si trop longue, utiliser un bloc `<details>` HTML
- Inclure expression décodée + langage naturel

---

## 3. ONGLET FONCTIONNEL

| Critère | Minimum | Idéal |
|---------|---------|-------|
| Flux utilisateur | Diagramme Mermaid | Avec annotations |
| Écrans (Forms) | Tous listés | Avec dimensions DLU |
| Contrôles UI | Boutons + Champs | Avec conditions visibilité |
| Messages erreur | Si présents | Tous avec codes |

---

## 4. ONGLET TECHNIQUE

| Critère | Minimum | Idéal |
|---------|---------|-------|
| Tables (toutes) | READ + WRITE + LINK | Avec colonnes utilisées |
| Paramètres | Tous avec types | Avec valeurs par défaut |
| Variables clés | >= 10 | Toutes avec lettres IDE |
| Expressions | >= 80% décodées | 100% décodées |
| Algorigramme | Flowchart basique | Avec toutes les branches |

### Algorigramme - Critères

L'algorigramme doit refléter la VRAIE logique:
- Nœuds pour chaque décision majeure (IF/CASE)
- Boucles visibles (WHILE équivalents)
- Appels externes marqués
- Pas de simplification excessive

---

## 5. ONGLET CARTOGRAPHIE

| Critère | Minimum | Idéal |
|---------|---------|-------|
| Chaîne Main | Présente | Diagramme Mermaid |
| Callers | Tous listés | Avec contexte d'appel |
| Callees 3 niveaux | Présent | Diagramme + Table |
| Impact | Résumé | Analyse détaillée |

---

## Métriques de Qualité Globales

```
Score = (Sections complètes / Total sections) × 100

Seuils:
- < 60%  : ÉCHEC - Ne pas déployer
- 60-79% : ACCEPTABLE - Amélioration requise
- 80-94% : BON
- >= 95% : EXCELLENT
```

### Formule détaillée

```
Score = (
  (identification_complete × 10) +
  (objectif_metier_riche × 25) +
  (regles_non_tronquees × 20) +
  (tables_completes × 15) +
  (expressions_100pct × 15) +
  (cartographie_complete × 15)
) / 100
```

---

## Tests E2E Requis

### Test 1: Validation Structure
- Vérifie présence des 3 onglets
- Vérifie présence des sections obligatoires

### Test 2: Validation Contenu Minimum
- Compte les fonctionnalités (>= 3)
- Compte les règles métier (>= 5)
- Compte les tables WRITE (>= 1 si programme modifie données)

### Test 3: Validation Non-Troncature
- Aucune règle ne se termine par "..."
- Aucune expression ne se termine par "..."

### Test 4: Validation Cohérence
- Nombre de callees dans tableau = nombre dans diagramme
- Nombre de tables WRITE cohérent entre sections

### Test 5: Comparaison Golden File
- Compare avec référence validée manuellement
- Alerte si différence significative (> 20%)

---

## Fichiers de Référence (Golden Files)

```
tools/spec-pipeline-v60/golden/
├── ADH-IDE-237-golden.md    # Programme complexe (49 tâches)
├── ADH-IDE-236-golden.md    # Programme moyen
├── ADH-IDE-192-golden.md    # Programme simple
└── quality-metrics.json     # Métriques attendues
```

---

*Document V1.0 - 2026-01-28*
