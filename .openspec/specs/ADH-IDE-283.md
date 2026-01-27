# ADH IDE 283 - Programme supprime (Prg_279)

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
| **Quoi** | Programme supprime (Prg_279) |
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
| **Format IDE** | ADH IDE 283 |
| **Description** | Programme supprime (Prg_279) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #30 | `Table_30` | LINK | 1x |
| #30 | `Table_30` | R | 1x |
| #31 | `Table_31` | LINK | 1x |
| #39 | `Table_39` | LINK | 2x |
| #40 | `Table_40` | **W** | 1x |
| #47 | `Table_47` | LINK | 1x |
| #47 | `Table_47` | **W** | 1x |
| #48 | `Table_48` | **W** | 1x |
| #53 | `Table_53` | **W** | 1x |
| #66 | `Table_66` | LINK | 1x |
| #68 | `Table_68` | **W** | 3x |
| #69 | `Table_69` | LINK | 1x |
| #70 | `Table_70` | LINK | 1x |
| #75 | `Table_75` | **W** | 1x |
| #78 | `Table_78` | LINK | 1x |
| #78 | `Table_78` | R | 1x |
| #80 | `Table_80` | LINK | 1x |
| #80 | `Table_80` | **W** | 1x |
| #87 | `Table_87` | LINK | 2x |
| #87 | `Table_87` | **W** | 2x |
| #136 | `Table_136` | **W** | 2x |
| #151 | `Table_151` | **W** | 2x |
| #285 | `Table_285` | LINK | 1x |
| #312 | `Table_312` | **W** | 1x |
| #911 | `Table_911` | **W** | 1x |
| #934 | `Table_934` | **W** | 1x |
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
    T[283 Programme]
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
    T[283 Programme]
    C54[54 FacturesCheckOu]
    T --> C54
    C56[56 Rcap Trait Easy]
    T --> C56
    C64[64 Solde Easy Chec]
    T --> C64
    style T fill:#58a6ff,color:#000
    style C54 fill:#3fb950
    style C56 fill:#3fb950
    style C64 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 54 | Factures_Check_Out | 2 |
| 1 | 56 | Récap Trait Easy Check-Out | 1 |
| 1 | 64 | Solde Easy Check Out | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (7 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
