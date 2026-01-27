# ADH IDE 307 - Programme supprime (Prg_304)

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
| **Quoi** | Programme supprime (Prg_304) |
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
| **Format IDE** | ADH IDE 307 |
| **Description** | Programme supprime (Prg_304) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #23 | `Table_23` | R | 1x |
| #23 | `Table_23` | **W** | 2x |
| #26 | `Table_26` | LINK | 1x |
| #30 | `Table_30` | LINK | 1x |
| #30 | `Table_30` | R | 1x |
| #32 | `Table_32` | R | 1x |
| #32 | `Table_32` | **W** | 2x |
| #34 | `Table_34` | LINK | 1x |
| #39 | `Table_39` | R | 1x |
| #46 | `Table_46` | LINK | 1x |
| #46 | `Table_46` | **W** | 1x |
| #47 | `Table_47` | **W** | 2x |
| #50 | `Table_50` | R | 3x |
| #67 | `Table_67` | LINK | 1x |
| #68 | `Table_68` | **W** | 1x |
| #70 | `Table_70` | R | 1x |
| #77 | `Table_77` | LINK | 2x |
| #77 | `Table_77` | R | 3x |
| #79 | `Table_79` | R | 1x |
| #89 | `Table_89` | LINK | 5x |
| #89 | `Table_89` | R | 4x |
| #96 | `Table_96` | LINK | 1x |
| #109 | `Table_109` | R | 1x |
| #139 | `Table_139` | R | 1x |
| #140 | `Table_140` | LINK | 1x |
| #197 | `Table_197` | LINK | 1x |
| #596 | `Table_596` | LINK | 5x |
| #596 | `Table_596` | R | 1x |
| #596 | `Table_596` | **W** | 2x |
| #697 | `Table_697` | LINK | 1x |
| #728 | `Table_728` | LINK | 1x |
| #737 | `Table_737` | LINK | 1x |
| #801 | `Table_801` | LINK | 1x |
| #847 | `Table_847` | LINK | 10x |
| #847 | `Table_847` | **W** | 2x |
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
    T[307 Programme]
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
    T[307 Programme]
    C152[152 Recup Classe et]
    T --> C152
    C84[84     SP Caractre]
    T --> C84
    C234[234  Print ticket v]
    T --> C234
    C43[43 Recuperation du]
    T --> C43
    C149[149 Calcul stock pr]
    T --> C149
    C179[179 Get Printer]
    T --> C179
    C180[180 Printer choice]
    T --> C180
    C181[181 Set Listing Num]
    T --> C181
    style T fill:#58a6ff,color:#000
    style C152 fill:#3fb950
    style C84 fill:#3fb950
    style C234 fill:#3fb950
    style C43 fill:#3fb950
    style C149 fill:#3fb950
    style C179 fill:#3fb950
    style C180 fill:#3fb950
    style C181 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 152 | Recup Classe et Lib du MOP | 4 |
| 1 | 84 |     SP Caractères Interdits | 2 |
| 1 | 234 |  Print ticket vente | 2 |
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 149 | Calcul stock produit WS | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 180 | Printer choice | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 247 | Deversement Transaction | 1 |
| 1 | 257 | Zoom articles | 1 |
| 1 | 269 | Zoom services village | 1 |
| 1 | 272 | Zoom modes de paiement | 1 |
| 1 | 275 | Zoom mode de paiement TPE | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:52 | **DATA POPULATED** - Tables, Callgraph (197 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
