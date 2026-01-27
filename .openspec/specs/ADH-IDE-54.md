# ADH IDE 54 - Factures_Check_Out

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
| **Quoi** | Factures_Check_Out |
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
| **Format IDE** | ADH IDE 54 |
| **Description** | Factures_Check_Out |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #30 | `Table_30` | LINK | 1x |
| #31 | `Table_31` | LINK | 1x |
| #372 | `Table_372` | LINK | 1x |
| #866 | `Table_866` | LINK | 1x |
| #866 | `Table_866` | R | 4x |
| #866 | `Table_866` | **W** | 3x |
| #867 | `Table_867` | R | 1x |
| #868 | `Table_868` | R | 1x |
| #870 | `Table_870` | LINK | 3x |
| #870 | `Table_870` | R | 1x |
| #870 | `Table_870` | **W** | 1x |
| #932 | `Table_932` | LINK | 1x |
| #932 | `Table_932` | **W** | 1x |
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
    T[54 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 283 | Easy Check-Out === V2.00 | 2 |
| 64 | Solde Easy Check Out | 1 |
| 280 | Lanceur Facture | 1 |
| 287 | Solde Easy Check Out | 1 |
| 313 | Easy Check-Out === V2.00 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[54 Programme]
    C58[58 Incremente N de]
    T --> C58
    C60[60 Creation entete]
    T --> C60
    C61[61 Maj des lignes ]
    T --> C61
    C90[90 Edition Facture]
    T --> C90
    C93[93 Creation Pied F]
    T --> C93
    C98[98 EditFactureTvaC]
    T --> C98
    C105[105 Maj des lignes ]
    T --> C105
    C57[57 FacturesSejour]
    T --> C57
    style T fill:#58a6ff,color:#000
    style C58 fill:#3fb950
    style C60 fill:#3fb950
    style C61 fill:#3fb950
    style C90 fill:#3fb950
    style C93 fill:#3fb950
    style C98 fill:#3fb950
    style C105 fill:#3fb950
    style C57 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 58 | Incremente N° de Facture | 2 |
| 1 | 60 | Creation entete facture | 2 |
| 1 | 61 | Maj des lignes saisies | 2 |
| 1 | 90 | Edition Facture Tva(Compta&Ve) | 2 |
| 1 | 93 | Creation Pied Facture | 2 |
| 1 | 98 | EditFactureTva(Compta&Ve) V3 | 2 |
| 1 | 105 | Maj des lignes saisies V3 | 2 |
| 1 | 57 | Factures_Sejour | 1 |
| 1 | 59 | Facture - chargement boutique | 1 |
| 1 | 62 | Maj Hebergement Tempo | 1 |
| 1 | 91 | Verif boutique | 1 |
| 1 | 92 | flag ligne boutique | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:44 | **DATA POPULATED** - Tables, Callgraph (40 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
