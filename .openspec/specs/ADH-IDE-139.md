# ADH IDE 139 - Ticket appro remise

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
| **Quoi** | Ticket appro remise |
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
| **Format IDE** | ADH IDE 139 |
| **Description** | Ticket appro remise |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #30 | `Table_30` | R | 2x |
| #44 | `Table_44` | R | 2x |
| #70 | `Table_70` | R | 1x |
| #147 | `Table_147` | LINK | 2x |
| #196 | `Table_196` | R | 8x |
| #232 | `Table_232` | R | 6x |
| #244 | `Table_244` | R | 6x |
| #249 | `Table_249` | R | 15x |
| #250 | `Table_250` | R | 2x |
| #251 | `Table_251` | R | 6x |
| #266 | `Table_266` | R | 3x |
| #463 | `Table_463` | LINK | 2x |
| #463 | `Table_463` | R | 1x |
| #505 | `Table_505` | R | 4x |
| #513 | `Table_513` | LINK | 4x |
| #693 | `Table_693` | R | 4x |
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
    T[139 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 121 | Gestion caisse | 3 |
| 298 | Gestion caisse 142 | 3 |
| 122 | Ouverture caisse | 1 |
| 131 | Fermeture caisse | 1 |
| 151 | Reimpression tickets fermeture | 1 |
| 297 | Ouverture caisse 143 | 1 |
| 299 | Fermeture caisse 144 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[139 Programme]
    C43[43 Recuperation du]
    T --> C43
    C179[179 Get Printer]
    T --> C179
    C181[181 Set Listing Num]
    T --> C181
    C182[182 Raz Current Pri]
    T --> C182
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C179 fill:#3fb950
    style C181 fill:#3fb950
    style C182 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:47 | **DATA POPULATED** - Tables, Callgraph (10 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
