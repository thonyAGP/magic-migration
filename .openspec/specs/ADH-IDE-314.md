# ADH IDE 314 - Programme supprime (Prg_311)

> **Version spec**: 3.5
> **Analyse**: 2026-01-27 17:57
> **Source**: `Prg_XXX.xml`

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur |
| **Quoi** | Programme supprime (Prg_311) |
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
| **Format IDE** | ADH IDE 314 |
| **Description** | Programme supprime (Prg_311) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #23 | `Table_23` | R | 1x |
| #23 | `Table_23` | **W** | 2x |
| #34 | `Table_34` | R | 2x |
| #38 | `Table_38` | LINK | 1x |
| #40 | `Table_40` | LINK | 1x |
| #47 | `Table_47` | **W** | 1x |
| #67 | `Table_67` | LINK | 1x |
| #70 | `Table_70` | R | 1x |
| #89 | `Table_89` | LINK | 1x |
| #197 | `Table_197` | LINK | 1x |
| #263 | `Table_263` | LINK | 1x |
| #264 | `Table_264` | LINK | 1x |
| #596 | `Table_596` | LINK | 2x |
| #728 | `Table_728` | LINK | 1x |
| #737 | `Table_737` | LINK | 1x |
| #804 | `Table_804` | LINK | 3x |
| #804 | `Table_804` | **W** | 2x |
| #847 | `Table_847` | LINK | 2x |
| #933 | `Table_933` | LINK | 4x |
| #933 | `Table_933` | R | 1x |
| #933 | `Table_933` | **W** | 1x |
### 2.3 Parametres d'entree



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



### 2.6 Variables importantes



### 2.7 Statistiques



---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    T[314 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| - | **Aucun caller** (point d'entree ou orphelin) | - |
### 3.3 Callees

```mermaid
graph LR
    T[314 Programme]
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
| 2026-01-27 19:52 | **DATA POPULATED** - Tables, Callgraph (20 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
