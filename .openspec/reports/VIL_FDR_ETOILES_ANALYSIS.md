# Analyse VIL - Étoiles F.D.R. INITIAL

**Date**: 2026-01-05
**Projet**: VIL (Village)
**Demande**: Vérifier la logique des 2 étoiles (**) sur la colonne F.D.R. INITIAL de l'édition RECAPITULATIF SESSIONS PMS
**Statut**: **CODE CORRECT - ANALYSE INITIALE ERRONÉE**

---

## 1. Règle métier

> Les 2 étoiles (**) doivent apparaître lorsque le **FDR Final de la veille** est différent du **FDR Initial du jour**.

---

## 2. ANALYSE CORRIGÉE (après validation screenshots)

### Ce que montre l'IDE Magic (screenshots 2025-01-05)

**Panneau Logic - Task 22.16.1:**
```
Ligne  | Type    | Variable                  | With
-------|---------|---------------------------|------
14     | Update  | v.Ecart F.D.R. COFFRE2   | 32
18     | Update  | v.Ecart F.D.R. RECEPTION | 32
```

**Panneau Expression Rules - Task 22.16.1:**
```
#  | Expression
---|------------------------------------------
31 | DK+ExpCalc('10'EXP)+DO+DQ+DR+DS+DT<>DL   ← Somme complexe (NON utilisée)
32 | DK<>EU                                   ← FDR Initial <> FDR Previous (UTILISÉE!)
```

### Conclusion

**Le code EST CORRECT.** Les Updates utilisent `With: 32` qui référence Expression 32 = `DK<>EU`, qui est EXACTEMENT la formule correspondant à la règle métier.

---

## 3. Erreur d'analyse initiale

### Ce que j'avais mal compris

J'ai fait une erreur fondamentale sur le mapping `WithValue` :

| Hypothèse initiale (FAUSSE) | Réalité (VALIDÉE) |
|----------------------------|-------------------|
| `WithValue val="32"` référence XML id="32" | `WithValue val="32"` référence **IDE Expression #32** |
| XML id="32" = Expression 31 dans IDE | Le numéro 32 EST le numéro IDE affiché |

### Pourquoi l'erreur

1. J'ai supposé que `WithValue` dans le XML faisait référence à l'attribut `id` des expressions XML
2. En réalité, le numéro dans `WithValue` correspond au numéro **AFFICHÉ dans l'IDE**
3. L'IDE renumérote séquentiellement mais `WithValue` utilise cette numérotation IDE

### Impact de l'erreur

Mon rapport initial concluait à un bug alors que le code fonctionne correctement :
- J'ai dit "Expression 32 incorrecte" → FAUX, c'est Expression 31 qui est la somme complexe
- J'ai dit "changer vers 38" → INUTILE, le code utilise déjà 32 (DK<>EU)

---

## 4. Mapping confirmé

### Variables DataView

| Variable IDE | Description | Rôle |
|--------------|-------------|------|
| DK | fdr_ouverture | FDR Initial du jour |
| EU | v.FDR fermeture de la veille | FDR Final de la session précédente |

### Formule correcte

```
DK <> EU
= fdr_ouverture <> v.FDR_fermeture_veille
= FDR Initial ≠ FDR Previous
```

Cette formule correspond **exactement** à la règle métier demandée.

---

## 5. Leçons apprises (Skill mis à jour)

| Leçon | Détail |
|-------|--------|
| **WithValue = numéro IDE** | `WithValue val="N"` référence Expression #N dans l'IDE, PAS l'id XML |
| **Toujours vérifier dans l'IDE** | Les screenshots IDE sont la source de vérité |
| **XML id ≠ numéro IDE** | Le XML garde les id originaux avec trous, l'IDE renumérote |
| **FlowIsn ≠ ligne IDE** | FlowIsn est un ID interne, pas le numéro de ligne |

### Mise à jour du Skill

Ces apprentissages ont été intégrés dans `skills/magic-unipaas/SKILL.md` :
- Section "MAPPING EXPRESSIONS - XML id vs Position IDE" corrigée
- Section "Numérotation des Lignes IDE" ajoutée
- Documentation officielle Magic Software référencée

---

## 6. Aucune action requise

Le code fonctionne correctement. Les Updates aux lignes 14 et 18 utilisent Expression 32 (`DK<>EU`) qui implémente correctement la règle métier.

Si les étoiles ne s'affichent pas, le problème est ailleurs :
- Variable EU (FDR veille) non alimentée ?
- Condition d'exécution du Record Suffix non remplie ?
- Autre logique en amont ?

---

## Références Magic IDE

### Programme

| IDE | Projet | Nom Public | Description |
|-----|--------|------------|-------------|
| 22 | VIL | CV Print base articles | Édition RECAPITULATIF SESSIONS PMS |

### Tâche analysée

| Tâche | Nom | Type |
|-------|-----|------|
| 22.16.1 | Record Suffix | Output |

### Variables DataView (Tâche 22.16)

| Variable | Index | Description |
|----------|-------|-------------|
| DK | 114 | fdr_ouverture (FDR Initial du jour) |
| DL | 115 | Somme partielle |
| DO | 118 | Composant somme |
| DQ | 120 | Composant somme |
| DR | 121 | Composant somme |
| DS | 122 | Composant somme |
| DT | 123 | Composant somme |
| EU | 150 | v.FDR fermeture veille (FDR Previous) |

### Expressions clés (Tâche 22.16.1)

| N° IDE | Formule | Rôle |
|--------|---------|------|
| 31 | `DK+ExpCalc('10'EXP)+DO+DQ+DR+DS+DT<>DL` | Somme complexe (NON utilisée) |
| 32 | `DK<>EU` | **Comparaison FDR Initial vs Previous (UTILISÉE)** |

---

*Rapport corrigé le 2026-01-05 - Validation par screenshots IDE*
*Mis à jour 2026-01-08 - Format IDE Magic*
