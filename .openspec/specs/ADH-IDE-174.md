# ADH IDE 174 - Versement/Retrait

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
| **Quoi** | Versement/Retrait |
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
| **Format IDE** | ADH IDE 174 |
| **Description** | Versement/Retrait |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #23 | `Table_23` | LINK | 1x |
| #23 | `Table_23` | **W** | 8x |
| #30 | `Table_30` | R | 1x |
| #31 | `Table_31` | LINK | 1x |
| #39 | `Table_39` | LINK | 1x |
| #39 | `Table_39` | **W** | 1x |
| #40 | `Table_40` | R | 3x |
| #40 | `Table_40` | **W** | 4x |
| #44 | `Table_44` | LINK | 1x |
| #44 | `Table_44` | **W** | 3x |
| #47 | `Table_47` | LINK | 6x |
| #47 | `Table_47` | **W** | 3x |
| #50 | `Table_50` | R | 1x |
| #66 | `Table_66` | LINK | 2x |
| #66 | `Table_66` | R | 1x |
| #68 | `Table_68` | LINK | 1x |
| #68 | `Table_68` | **W** | 5x |
| #70 | `Table_70` | R | 1x |
| #88 | `Table_88` | LINK | 1x |
| #89 | `Table_89` | LINK | 1x |
| #124 | `Table_124` | LINK | 1x |
| #139 | `Table_139` | LINK | 1x |
| #147 | `Table_147` | LINK | 1x |
| #147 | `Table_147` | **W** | 1x |
| #173 | `Table_173` | LINK | 1x |
| #372 | `Table_372` | LINK | 1x |
| #474 | `Table_474` | LINK | 2x |
| #474 | `Table_474` | **W** | 1x |
| #728 | `Table_728` | LINK | 1x |
| #786 | `Table_786` | R | 1x |
| #934 | `Table_934` | LINK | 1x |
| #945 | `Table_945` | **W** | 2x |
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
    T[174 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 163 | Menu caisse GM - scroll | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[174 Programme]
    C181[181 Set Listing Num]
    T --> C181
    C184[184 Get Printer for]
    T --> C184
    C186[186 Chained Listing]
    T --> C186
    C44[44 Appel programme]
    T --> C44
    C193[193 Solde compte fi]
    T --> C193
    C23[23 Print reu chang]
    T --> C23
    C24[24 Print reu chang]
    T --> C24
    C171[171 Print versement]
    T --> C171
    style T fill:#58a6ff,color:#000
    style C181 fill:#3fb950
    style C184 fill:#3fb950
    style C186 fill:#3fb950
    style C44 fill:#3fb950
    style C193 fill:#3fb950
    style C23 fill:#3fb950
    style C24 fill:#3fb950
    style C171 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 181 | Set Listing Number | 4 |
| 1 | 184 | Get Printer for chained list | 3 |
| 1 | 186 | Chained Listing Load Default | 3 |
| 1 | 44 | Appel programme | 2 |
| 1 | 193 | Solde compte fin sejour | 2 |
| 1 | 23 | Print reçu change achat | 1 |
| 1 | 24 | Print reçu change vente | 1 |
| 1 | 171 | Print versement retrait | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 185 | Chained Listing Printer Choice | 1 |
| 1 | 260 | Zoom moyen de règlement | 1 |
| 1 | 261 | Zoom des types de taux | 1 |
| 1 | 270 | Zoom sur modes de paiement a/v | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (20 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
