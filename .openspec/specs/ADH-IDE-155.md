# ADH IDE 155 - Controle fermeture caisse WS

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
| **Quoi** | Controle fermeture caisse WS |
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
| **Format IDE** | ADH IDE 155 |
| **Description** | Controle fermeture caisse WS |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #31 | `Table_31` | R | 4x |
| #40 | `Table_40` | LINK | 3x |
| #44 | `Table_44` | R | 1x |
| #77 | `Table_77` | LINK | 2x |
| #90 | `Table_90` | R | 4x |
| #147 | `Table_147` | R | 1x |
| #197 | `Table_197` | LINK | 2x |
| #232 | `Table_232` | R | 5x |
| #232 | `Table_232` | **W** | 2x |
| #241 | `Table_241` | LINK | 8x |
| #241 | `Table_241` | R | 2x |
| #241 | `Table_241` | **W** | 8x |
| #242 | `Table_242` | LINK | 4x |
| #242 | `Table_242` | R | 4x |
| #242 | `Table_242` | **W** | 10x |
| #243 | `Table_243` | LINK | 12x |
| #243 | `Table_243` | R | 4x |
| #243 | `Table_243` | **W** | 6x |
| #246 | `Table_246` | R | 18x |
| #246 | `Table_246` | **W** | 1x |
| #247 | `Table_247` | LINK | 2x |
| #248 | `Table_248` | LINK | 5x |
| #249 | `Table_249` | LINK | 2x |
| #249 | `Table_249` | R | 23x |
| #250 | `Table_250` | LINK | 2x |
| #250 | `Table_250` | R | 9x |
| #251 | `Table_251` | R | 1x |
| #263 | `Table_263` | LINK | 1x |
| #505 | `Table_505` | LINK | 1x |
| #505 | `Table_505` | **W** | 5x |
| #510 | `Table_510` | **W** | 1x |
| #697 | `Table_697` | R | 1x |
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
    T[155 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 131 | Fermeture caisse | 3 |
| 298 | Gestion caisse 142 | 3 |
| 299 | Fermeture caisse 144 | 3 |
| 121 | Gestion caisse | 2 |
### 3.3 Callees

```mermaid
graph LR
    T[155 Programme]
    C135[135 Generation tabl]
    T --> C135
    C142[142 Devise update s]
    T --> C142
    C152[152 Recup Classe et]
    T --> C152
    style T fill:#58a6ff,color:#000
    style C135 fill:#3fb950
    style C142 fill:#3fb950
    style C152 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 135 | Generation tableau recap WS | 13 |
| 1 | 142 | Devise update session WS | 11 |
| 1 | 152 | Recup Classe et Lib du MOP | 3 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:47 | **DATA POPULATED** - Tables, Callgraph (14 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
