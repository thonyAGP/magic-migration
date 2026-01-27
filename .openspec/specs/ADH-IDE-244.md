# ADH IDE 244 - Histo ventes payantes /PMS-605

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
| **Quoi** | Histo ventes payantes /PMS-605 |
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
| **Format IDE** | ADH IDE 244 |
| **Description** | Histo ventes payantes /PMS-605 |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #23 | `Table_23` | R | 1x |
| #23 | `Table_23` | **W** | 4x |
| #30 | `Table_30` | R | 1x |
| #34 | `Table_34` | R | 3x |
| #40 | `Table_40` | LINK | 3x |
| #40 | `Table_40` | R | 1x |
| #47 | `Table_47` | **W** | 2x |
| #67 | `Table_67` | LINK | 1x |
| #70 | `Table_70` | R | 2x |
| #77 | `Table_77` | LINK | 1x |
| #79 | `Table_79` | R | 1x |
| #89 | `Table_89` | LINK | 3x |
| #197 | `Table_197` | LINK | 3x |
| #263 | `Table_263` | LINK | 4x |
| #285 | `Table_285` | R | 1x |
| #400 | `Table_400` | LINK | 2x |
| #473 | `Table_473` | LINK | 3x |
| #519 | `Table_519` | R | 1x |
| #519 | `Table_519` | **W** | 1x |
| #596 | `Table_596` | LINK | 3x |
| #596 | `Table_596` | **W** | 2x |
| #728 | `Table_728` | LINK | 1x |
| #804 | `Table_804` | LINK | 3x |
| #847 | `Table_847` | LINK | 3x |
| #899 | `Table_899` | **W** | 2x |
| #910 | `Table_910` | LINK | 1x |
| #911 | `Table_911` | **W** | 1x |
| #933 | `Table_933` | LINK | 3x |
| #933 | `Table_933` | R | 3x |
| #933 | `Table_933` | **W** | 1x |
| #945 | `Table_945` | LINK | 4x |
| #945 | `Table_945` | R | 1x |
| #1069 | `Table_1069` | LINK | 1x |
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
    T[244 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 242 | Menu Choix Saisie/Annul vente | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[244 Programme]
    C233[233 Appel Print tic]
    T --> C233
    C235[235  Print ticket v]
    T --> C235
    C236[236  Print ticket v]
    T --> C236
    C179[179 Get Printer]
    T --> C179
    C181[181 Set Listing Num]
    T --> C181
    C182[182 Raz Current Pri]
    T --> C182
    C247[247 Deversement Tra]
    T --> C247
    C255[255 VAD valids  imp]
    T --> C255
    style T fill:#58a6ff,color:#000
    style C233 fill:#3fb950
    style C235 fill:#3fb950
    style C236 fill:#3fb950
    style C179 fill:#3fb950
    style C181 fill:#3fb950
    style C182 fill:#3fb950
    style C247 fill:#3fb950
    style C255 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 233 | Appel Print ticket vente PMS28 | 2 |
| 1 | 235 |  Print ticket vente LEX | 2 |
| 1 | 236 |  Print ticket vente PMS-584 | 2 |
| 1 | 179 | Get Printer | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 247 | Deversement Transaction | 1 |
| 1 | 255 | VAD validés à imprimer | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:50 | **DATA POPULATED** - Tables, Callgraph (15 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
