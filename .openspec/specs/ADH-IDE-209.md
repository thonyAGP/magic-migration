# ADH IDE 209 - Affectation code autocom

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
| **Quoi** | Affectation code autocom |
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
| **Format IDE** | ADH IDE 209 |
| **Description** | Affectation code autocom |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #30 | `Table_30` | LINK | 3x |
| #30 | `Table_30` | R | 1x |
| #34 | `Table_34` | LINK | 4x |
| #34 | `Table_34` | R | 1x |
| #34 | `Table_34` | **W** | 1x |
| #52 | `Table_52` | R | 1x |
| #52 | `Table_52` | **W** | 1x |
| #53 | `Table_53` | **W** | 4x |
| #68 | `Table_68` | **W** | 4x |
| #72 | `Table_72` | **W** | 1x |
| #73 | `Table_73` | R | 1x |
| #73 | `Table_73` | **W** | 1x |
| #75 | `Table_75` | **W** | 4x |
| #80 | `Table_80` | R | 1x |
| #80 | `Table_80` | **W** | 4x |
| #86 | `Table_86` | R | 1x |
| #86 | `Table_86` | **W** | 1x |
| #87 | `Table_87` | LINK | 3x |
| #87 | `Table_87` | **W** | 1x |
| #88 | `Table_88` | LINK | 1x |
| #104 | `Table_104` | R | 1x |
| #130 | `Table_130` | LINK | 1x |
| #131 | `Table_131` | LINK | 1x |
| #136 | `Table_136` | **W** | 8x |
| #151 | `Table_151` | **W** | 7x |
| #152 | `Table_152` | LINK | 1x |
| #152 | `Table_152` | R | 1x |
| #169 | `Table_169` | R | 2x |
| #188 | `Table_188` | LINK | 1x |
| #786 | `Table_786` | R | 1x |
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
    T[209 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 217 | Menu telephone | 2 |
### 3.3 Callees

```mermaid
graph LR
    T[209 Programme]
    C43[43 Recuperation du]
    T --> C43
    C216[216 Suppression lig]
    T --> C216
    C208[208 Print Reu code ]
    T --> C208
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C216 fill:#3fb950
    style C208 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 2 |
| 1 | 216 | Suppression ligne blanche f30 | 2 |
| 1 | 208 | Print Reçu code autocom | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:49 | **DATA POPULATED** - Tables, Callgraph (9 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
