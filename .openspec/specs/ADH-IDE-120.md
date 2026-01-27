# ADH IDE 120 - Saisie contenu caisse

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
| **Quoi** | Saisie contenu caisse |
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
| **Format IDE** | ADH IDE 120 |
| **Description** | Saisie contenu caisse |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #40 | `Table_40` | R | 3x |
| #50 | `Table_50` | R | 1x |
| #67 | `Table_67` | R | 1x |
| #70 | `Table_70` | R | 1x |
| #77 | `Table_77` | R | 2x |
| #89 | `Table_89` | LINK | 1x |
| #89 | `Table_89` | R | 7x |
| #90 | `Table_90` | LINK | 1x |
| #139 | `Table_139` | R | 1x |
| #140 | `Table_140` | R | 2x |
| #141 | `Table_141` | LINK | 1x |
| #197 | `Table_197` | LINK | 1x |
| #198 | `Table_198` | LINK | 1x |
| #199 | `Table_199` | LINK | 1x |
| #200 | `Table_200` | LINK | 1x |
| #200 | `Table_200` | R | 1x |
| #219 | `Table_219` | R | 1x |
| #220 | `Table_220` | LINK | 1x |
| #222 | `Table_222` | LINK | 5x |
| #222 | `Table_222` | R | 5x |
| #223 | `Table_223` | LINK | 1x |
| #232 | `Table_232` | LINK | 1x |
| #232 | `Table_232` | **W** | 1x |
| #246 | `Table_246` | LINK | 1x |
| #246 | `Table_246` | R | 1x |
| #249 | `Table_249` | R | 2x |
| #263 | `Table_263` | R | 3x |
| #372 | `Table_372` | R | 1x |
| #491 | `Table_491` | LINK | 3x |
| #491 | `Table_491` | R | 6x |
| #491 | `Table_491` | **W** | 13x |
| #492 | `Table_492` | LINK | 5x |
| #492 | `Table_492` | R | 2x |
| #492 | `Table_492` | **W** | 9x |
| #493 | `Table_493` | LINK | 7x |
| #493 | `Table_493` | R | 5x |
| #493 | `Table_493` | **W** | 11x |
| #501 | `Table_501` | LINK | 2x |
| #501 | `Table_501` | **W** | 2x |
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
    T[120 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 122 | Ouverture caisse | 1 |
| 131 | Fermeture caisse | 1 |
| 297 | Ouverture caisse 143 | 1 |
| 299 | Fermeture caisse 144 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[120 Programme]
    C43[43 Recuperation du]
    T --> C43
    C142[142 Devise update s]
    T --> C142
    C133[133 Mise a jour com]
    T --> C133
    C150[150 Print comptage ]
    T --> C150
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C142 fill:#3fb950
    style C133 fill:#3fb950
    style C150 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 2 |
| 1 | 142 | Devise update session WS | 2 |
| 1 | 133 | Mise a jour comptage caisse WS | 1 |
| 1 | 150 | Print comptage WS | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:46 | **DATA POPULATED** - Tables, Callgraph (11 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
