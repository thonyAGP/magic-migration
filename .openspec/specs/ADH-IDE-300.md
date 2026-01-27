# ADH IDE 300 - Programme supprime (Prg_297)

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
| **Quoi** | Programme supprime (Prg_297) |
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
| **Format IDE** | ADH IDE 300 |
| **Description** | Programme supprime (Prg_297) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #23 | `Table_23` | R | 1x |
| #23 | `Table_23` | **W** | 2x |
| #26 | `Table_26` | LINK | 1x |
| #30 | `Table_30` | R | 1x |
| #32 | `Table_32` | R | 1x |
| #32 | `Table_32` | **W** | 2x |
| #34 | `Table_34` | LINK | 1x |
| #39 | `Table_39` | R | 1x |
| #46 | `Table_46` | LINK | 1x |
| #46 | `Table_46` | **W** | 1x |
| #47 | `Table_47` | **W** | 2x |
| #67 | `Table_67` | LINK | 1x |
| #70 | `Table_70` | R | 1x |
| #79 | `Table_79` | R | 1x |
| #96 | `Table_96` | LINK | 1x |
| #197 | `Table_197` | LINK | 1x |
| #596 | `Table_596` | LINK | 1x |
| #596 | `Table_596` | **W** | 3x |
| #697 | `Table_697` | LINK | 1x |
| #728 | `Table_728` | LINK | 1x |
| #737 | `Table_737` | LINK | 1x |
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
    T[300 Programme]
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
    T[300 Programme]
    C152[152 Recup Classe et]
    T --> C152
    C257[257 Zoom articles]
    T --> C257
    C269[269 Zoom services v]
    T --> C269
    C306[306 Print ticket ve]
    T --> C306
    C43[43 Recuperation du]
    T --> C43
    C149[149 Calcul stock pr]
    T --> C149
    C179[179 Get Printer]
    T --> C179
    C180[180 Printer choice]
    T --> C180
    style T fill:#58a6ff,color:#000
    style C152 fill:#3fb950
    style C257 fill:#3fb950
    style C269 fill:#3fb950
    style C306 fill:#3fb950
    style C43 fill:#3fb950
    style C149 fill:#3fb950
    style C179 fill:#3fb950
    style C180 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 152 | Recup Classe et Lib du MOP | 2 |
| 1 | 257 | Zoom articles | 2 |
| 1 | 269 | Zoom services village | 2 |
| 1 | 306 | Print ticket vente/OD N.U | 2 |
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 149 | Calcul stock produit WS | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 180 | Printer choice | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 272 | Zoom modes de paiement | 1 |
| 1 | 322 | Deversement Transaction | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (103 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
