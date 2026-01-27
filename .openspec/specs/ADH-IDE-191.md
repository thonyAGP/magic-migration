# ADH IDE 191 - Annulation solde

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
| **Quoi** | Annulation solde |
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
| **Format IDE** | ADH IDE 191 |
| **Description** | Annulation solde |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #30 | `Table_30` | LINK | 1x |
| #31 | `Table_31` | R | 1x |
| #40 | `Table_40` | LINK | 2x |
| #40 | `Table_40` | R | 2x |
| #44 | `Table_44` | LINK | 1x |
| #44 | `Table_44` | **W** | 2x |
| #47 | `Table_47` | LINK | 2x |
| #68 | `Table_68` | LINK | 4x |
| #70 | `Table_70` | LINK | 1x |
| #89 | `Table_89` | LINK | 5x |
| #140 | `Table_140` | LINK | 2x |
| #268 | `Table_268` | **W** | 2x |
| #271 | `Table_271` | LINK | 2x |
| #272 | `Table_272` | LINK | 2x |
| #517 | `Table_517` | LINK | 2x |
| #517 | `Table_517` | R | 2x |
| #582 | `Table_582` | LINK | 2x |
| #582 | `Table_582` | **W** | 2x |
| #945 | `Table_945` | **W** | 4x |
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
    T[191 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 190 | Menu solde d'un compte | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[191 Programme]
    C43[43 Recuperation du]
    T --> C43
    C179[179 Get Printer]
    T --> C179
    C181[181 Set Listing Num]
    T --> C181
    C189[189 Print solde com]
    T --> C189
    C195[195 Print solde com]
    T --> C195
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C179 fill:#3fb950
    style C181 fill:#3fb950
    style C189 fill:#3fb950
    style C195 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 189 | Print solde compte | 1 |
| 1 | 195 | Print solde compte TIK V1 | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (25 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
