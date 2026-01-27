# ADH IDE 97 - Factures (Tble Compta&Vent) V3

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
| **Quoi** | Factures (Tble Compta&Vent) V3 |
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
| **Format IDE** | ADH IDE 97 |
| **Description** | Factures (Tble Compta&Vent) V3 |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #30 | `Table_30` | LINK | 1x |
| #31 | `Table_31` | LINK | 1x |
| #40 | `Table_40` | **W** | 1x |
| #121 | `Table_121` | LINK | 1x |
| #263 | `Table_263` | LINK | 1x |
| #372 | `Table_372` | LINK | 1x |
| #744 | `Table_744` | LINK | 1x |
| #746 | `Table_746` | LINK | 1x |
| #786 | `Table_786` | LINK | 1x |
| #866 | `Table_866` | LINK | 2x |
| #866 | `Table_866` | R | 4x |
| #866 | `Table_866` | **W** | 6x |
| #867 | `Table_867` | R | 2x |
| #868 | `Table_868` | R | 1x |
| #868 | `Table_868` | **W** | 1x |
| #870 | `Table_870` | LINK | 5x |
| #870 | `Table_870` | R | 1x |
| #870 | `Table_870` | **W** | 1x |
| #871 | `Table_871` | LINK | 1x |
| #911 | `Table_911` | **W** | 1x |
| #932 | `Table_932` | LINK | 1x |
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
    T[97 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 163 | Menu caisse GM - scroll | 1 |
| 190 | Menu solde d'un compte | 1 |
| 193 | Solde compte fin sejour | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[97 Programme]
    C58[58 Incremente N de]
    T --> C58
    C91[91 Verif boutique]
    T --> C91
    C105[105 Maj des lignes ]
    T --> C105
    C106[106 Maj lignes sais]
    T --> C106
    C278[278 Zoom Pays Vente]
    T --> C278
    C57[57 FacturesSejour]
    T --> C57
    C59[59 Facture   charg]
    T --> C59
    C60[60 Creation entete]
    T --> C60
    style T fill:#58a6ff,color:#000
    style C58 fill:#3fb950
    style C91 fill:#3fb950
    style C105 fill:#3fb950
    style C106 fill:#3fb950
    style C278 fill:#3fb950
    style C57 fill:#3fb950
    style C59 fill:#3fb950
    style C60 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 58 | Incremente N° de Facture | 2 |
| 1 | 91 | Verif boutique | 2 |
| 1 | 105 | Maj des lignes saisies V3 | 2 |
| 1 | 106 | Maj lignes saisies archive V3 | 2 |
| 1 | 278 | Zoom Pays Vente | 2 |
| 1 | 57 | Factures_Sejour | 1 |
| 1 | 59 | Facture - chargement boutique | 1 |
| 1 | 60 | Creation entete facture | 1 |
| 1 | 92 | flag ligne boutique | 1 |
| 1 | 95 | Facture - Sejour archive | 1 |
| 1 | 98 | EditFactureTva(Compta&Ve) V3 | 1 |
| 1 | 101 | Creation Pied Facture V3 | 1 |
| 1 | 104 | Maj Hebergement Tempo V3 | 1 |
| 1 | 226 | Recherche Adresse Mail | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:46 | **DATA POPULATED** - Tables, Callgraph (85 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
