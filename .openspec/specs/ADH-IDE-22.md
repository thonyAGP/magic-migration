# ADH IDE 22 - Calcul equivalent

> **Version spec**: 3.5
> **Analyse**: 2026-01-27 17:56
> **Source**: `Prg_XXX.xml`

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur |
| **Quoi** | Calcul equivalent |
| **Pourquoi** | A documenter |
| **Declencheur** | A identifier |

### 1.2 Regles metier

| Code | Regle | Condition |
|------|-------|-----------|
| RM-001 | A documenter | - |

### 1.3 Flux utilisateur

1. Demarrage programme
2. Traitement principal
3. Fin programme

### 1.4 Cas d'erreur

| Erreur | Comportement |
|--------|--------------|
| - | A documenter |

---

<!-- TAB:Technique -->

## SPECIFICATION TECHNIQUE

### 2.1 Identification

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 22 |
| **Description** | Calcul equivalent |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 50 | moyens_reglement_mor | `cafil028_dat` | R | 1x |
| 139 | moyens_reglement_mor | `cafil117_dat` | L | 1x |
### 2.3 Parametres d'entree

| Variable | Nom | Type | Picture |
|----------|-----|------|---------|
| - | Aucun parametre | - | - |
### 2.4 Algorigramme

```mermaid
flowchart TD
    START([START])
    PROCESS[Traitement]
    ENDOK([END])
    START --> PROCESS --> ENDOK
    style START fill:#3fb950
    style ENDOK fill:#f85149
```

### 2.5 Expressions cles

| IDE | Expression | Commentaire |
|-----|------------|-------------|
| 1 | `{0,1}` | - |
| 2 | `{0,5}` | - |
| 3 | `{0,7}` | - |
| 4 | `''` | - |
| 5 | `{0,10}` | - |
| 6 | `'O'` | - |
| 7 | `Fix ({0,8}*{0,17},11,{0,4})` | - |
| 8 | `Fix ({0,8}*{0,24},11,{0,4})` | - |
| 9 | `Fix ({0,8}/{0,24},11,{0,4})` | - |
| 10 | `'FALSE'LOG` | - |
| 11 | `{0,11}` | - |
| 12 | `{0,10}='A' AND {0,2}<>'B'` | - |
| 13 | `{0,10}='A' AND {0,2}='B'` | - |
| 14 | `{0,2}<>'B'` | - |
| 15 | `{0,2}='B'` | - |
| 16 | `{0,10}<>'A'` | - |

> **Total**: 16 expressions (affichees: 16)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 34 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N299[299 Fermeture ca]
    N151[151 Reimpression]
    N193[193 Solde compte]
    N163[163 Menu caisse ]
    N131[131 Fermeture ca]
    T[22 Calcul equiv]
    M --> N299
    N299 --> N151
    N151 --> N193
    N193 --> N163
    N163 --> N131
    N131 --> T
    style M fill:#8b5cf6,color:#fff
    style N299 fill:#f59e0b
    style N151 fill:#f59e0b
    style N193 fill:#f59e0b
    style N163 fill:#f59e0b
    style N131 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 23 | Print reçu change achat | 7 |
| 24 | Print reçu change vente | 7 |
| 154 | Tableau recap fermeture | 6 |
### 3.3 Callees

```mermaid
graph LR
    T[22 Programme]
    NONE[Aucun callee]
    T -.-> NONE
    style T fill:#58a6ff,color:#000
    style NONE fill:#6b7280,stroke-dasharray: 5 5
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| - | - | Programme terminal | - |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:18 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:44 | **DATA POPULATED** - Tables, Callgraph (16 expr) | Script |
| 2026-01-27 17:56 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
