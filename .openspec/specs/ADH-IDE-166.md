# ADH IDE 166 - Start

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
| **Quoi** | Start |
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
| **Format IDE** | ADH IDE 166 |
| **Description** | Start |
| **Module** | ADH |

### 2.2 Tables

| # | Nom physique | Acces | Usage |
|---|--------------|-------|-------|
| #67 | `Table_67` | R | 1x |
| #69 | `Table_69` | LINK | 1x |
| #81 | `Table_81` | R | 1x |
| #118 | `Table_118` | LINK | 1x |
| #219 | `Table_219` | R | 1x |
| #728 | `Table_728` | LINK | 1x |
| #740 | `Table_740` | R | 1x |
| #878 | `Table_878` | R | 1x |
| #878 | `Table_878` | **W** | 1x |
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
    T[166 Programme]
    M --> T
    style M fill:#8b5cf6,color:#fff
    style T fill:#58a6ff,color:#000
```

### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 0 | VAD validés à imprimer | 2 |
| 0 | Histo ventes Gratuités | 1 |
| 0 | Histo ventes IGR | 1 |
| 0 | Histo ventes payantes /PMS-605 | 1 |
| 0 | Histo ventes payantes /PMS-623 | 1 |
| 0 | Print extrait compte /Service | 1 |
| 0 | Transaction Nouv vente PMS-584 | 1 |
| 0 | Transaction Nouv vente PMS-710 | 1 |
| 0 | Transaction Nouv vente PMS-721 | 1 |
| 0 | Transferts | 1 |
| 1 | Main Program | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[166 Programme]
    C45[45 Recuperation la]
    T --> C45
    C50[50   Initialistaio]
    T --> C50
    C52[52 Creation adress]
    T --> C52
    C200[200 Verification si]
    T --> C200
    C224[224 Alimentation Co]
    T --> C224
    C231[231 Raisons utilisa]
    T --> C231
    style T fill:#58a6ff,color:#000
    style C45 fill:#3fb950
    style C50 fill:#3fb950
    style C52 fill:#3fb950
    style C200 fill:#3fb950
    style C224 fill:#3fb950
    style C231 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 45 | Recuperation langue | 1 |
| 1 | 50 |   Initialistaion Easy Arrival | 1 |
| 1 | 52 | Creation adresse_village | 1 |
| 1 | 200 | Verification si client/serveur | 1 |
| 1 | 224 | Alimentation Combos LIEU SEJ | 1 |
| 1 | 231 | Raisons utilisation ADH | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (30 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
