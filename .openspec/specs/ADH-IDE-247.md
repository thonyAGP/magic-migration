# ADH IDE 247 - Deversement Transaction

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
| **Quoi** | Deversement Transaction |
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
| **Format IDE** | ADH IDE 247 |
| **Description** | Deversement Transaction |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #26 | `Table_26` | R | 1x |
| #30 | `Table_30` | LINK | 1x |
| #31 | `Table_31` | LINK | 1x |
| #34 | `Table_34` | LINK | 1x |
| #34 | `Table_34` | **W** | 2x |
| #38 | `Table_38` | LINK | 1x |
| #38 | `Table_38` | **W** | 2x |
| #40 | `Table_40` | LINK | 3x |
| #47 | `Table_47` | **W** | 2x |
| #65 | `Table_65` | LINK | 3x |
| #65 | `Table_65` | R | 4x |
| #67 | `Table_67` | LINK | 2x |
| #68 | `Table_68` | **W** | 1x |
| #77 | `Table_77` | LINK | 4x |
| #89 | `Table_89` | LINK | 3x |
| #113 | `Table_113` | LINK | 1x |
| #263 | `Table_263` | LINK | 3x |
| #263 | `Table_263` | R | 1x |
| #263 | `Table_263` | **W** | 1x |
| #264 | `Table_264` | LINK | 3x |
| #264 | `Table_264` | **W** | 1x |
| #268 | `Table_268` | LINK | 1x |
| #271 | `Table_271` | LINK | 1x |
| #382 | `Table_382` | LINK | 1x |
| #473 | `Table_473` | **W** | 1x |
| #596 | `Table_596` | LINK | 2x |
| #804 | `Table_804` | **W** | 1x |
| #839 | `Table_839` | LINK | 1x |
| #847 | `Table_847` | LINK | 6x |
| #847 | `Table_847` | R | 1x |
| #899 | `Table_899` | R | 1x |
| #899 | `Table_899` | **W** | 1x |
| #933 | `Table_933` | LINK | 1x |
| #945 | `Table_945` | LINK | 2x |
| #980 | `Table_980` | LINK | 1x |
| #1033 | `Table_1033` | **W** | 2x |
| #1037 | `Table_1037` | R | 1x |
| #1069 | `Table_1069` | **W** | 1x |
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
    T[247 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 245 | Histo ventes payantes /PMS-623 | 2 |
| 237 | Transaction Nouv vente avec GP | 1 |
| 238 | Transaction Nouv vente PMS-584 | 1 |
| 239 | Transaction Nouv vente PMS-721 | 1 |
| 240 | Transaction Nouv vente PMS-710 | 1 |
| 243 | Histo ventes payantes | 1 |
| 244 | Histo ventes payantes /PMS-605 | 1 |
| 253 | Histo ventes Gratuités | 1 |
| 305 | Ventes Gratuites | 1 |
| 307 | Saisie transaction 154  N.U | 1 |
| 310 | Saisie transaction Nouv vente | 1 |
| 312 | Historique des ventes - Gratui | 1 |
| 315 | Ventes Gratuites | 1 |
| 318 | Historique des ventes P247 | 1 |
| 319 | Annulation Ventes Gratuites | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[247 Programme]
    C249[249 Reinit Aff PYR]
    T --> C249
    style T fill:#58a6ff,color:#000
    style C249 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 249 | Reinit Aff PYR | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:50 | **DATA POPULATED** - Tables, Callgraph (69 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
