# ADH IDE 25 - Change GM

> **Version spec**: 3.5
> **Analyse**: 2026-01-27 17:56
> **Source**: `Prg_XXX.xml`

---

<!-- TAB:Fonctionnel -->

## SPECIFICATION FONCTIONNELLE

### 1.1 Objectif metier

| Element | Description |
|---------|-------------|
| **Qui** | Operateur |
| **Quoi** | Change GM |
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
| **Format IDE** | ADH IDE 25 |
| **Description** | Change GM |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #23 | `Table_23` | R | 1x |
| #23 | `Table_23` | **W** | 4x |
| #30 | `Table_30` | LINK | 1x |
| #30 | `Table_30` | R | 1x |
| #35 | `Table_35` | R | 1x |
| #44 | `Table_44` | LINK | 1x |
| #44 | `Table_44` | R | 1x |
| #44 | `Table_44` | **W** | 2x |
| #47 | `Table_47` | **W** | 2x |
| #50 | `Table_50` | LINK | 1x |
| #50 | `Table_50` | R | 1x |
| #68 | `Table_68` | **W** | 1x |
| #70 | `Table_70` | LINK | 1x |
| #124 | `Table_124` | LINK | 1x |
| #139 | `Table_139` | LINK | 3x |
| #141 | `Table_141` | R | 1x |
| #147 | `Table_147` | LINK | 2x |
| #147 | `Table_147` | **W** | 2x |
| #474 | `Table_474` | R | 2x |
| #474 | `Table_474` | **W** | 1x |
| #945 | `Table_945` | **W** | 1x |
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
    T[25 Programme]
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
    T[25 Programme]
    C43[43 Recuperation du]
    T --> C43
    C44[44 Appel programme]
    T --> C44
    C23[23 Print reu chang]
    T --> C23
    C24[24 Print reu chang]
    T --> C24
    C47[47 DateHeure sessi]
    T --> C47
    C153[153 Calcul du stock]
    T --> C153
    C179[179 Get Printer]
    T --> C179
    C180[180 Printer choice]
    T --> C180
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C44 fill:#3fb950
    style C23 fill:#3fb950
    style C24 fill:#3fb950
    style C47 fill:#3fb950
    style C153 fill:#3fb950
    style C179 fill:#3fb950
    style C180 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 4 |
| 1 | 44 | Appel programme | 3 |
| 1 | 23 | Print reçu change achat | 1 |
| 1 | 24 | Print reçu change vente | 1 |
| 1 | 47 | Date/Heure session user | 1 |
| 1 | 153 | Calcul du stock devise | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 180 | Printer choice | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 258 | Zoom mode paiement change GM | 1 |
| 1 | 261 | Zoom des types de taux | 1 |
| 1 | 265 | Zoom devise | 1 |
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
| 2026-01-27 19:44 | **DATA POPULATED** - Tables, Callgraph (24 expr) | Script |
| 2026-01-27 17:56 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
