# ADH IDE 257 - Programme supprime (Prg_253)

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
| **Quoi** | Programme supprime (Prg_253) |
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
| **Format IDE** | ADH IDE 257 |
| **Description** | Programme supprime (Prg_253) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 77 | articles_________art | `cafil055_dat` | R | 1x |
### 2.3 Parametres d'entree

| Variable | Nom | Type | Picture |
|----------|-----|------|---------|
| - | Aucun parametre | - | - |
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

| IDE | Expression | Commentaire |
|-----|------------|-------------|
| 1 | `'TRUE'LOG` | - |
| 2 | `Trim ({0,18})` | - |
| 3 | `'&Quitter'` | - |
| 4 | `41` | - |
| 5 | `'&Selectionner'` | - |
| 6 | `IF ({0,1}>'',{0,1},'')` | - |
| 7 | `{0,1}` | - |
| 8 | `{0,2}` | - |
| 9 | `{0,9}` | - |
| 10 | `{0,11}` | - |
| 11 | `{0,10}` | - |
| 12 | `{0,12}` | - |
| 13 | `{0,13}` | - |
| 14 | `{0,14}` | - |
| 15 | `' '` | - |
| 16 | `NOT ({0,8})` | - |
| 17 | `(({0,17}='VRL' OR {0,17}='VSL') AND {0,16}<>'X'...` | - |

> **Total**: 17 expressions (affichees: 17)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 35 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N242[242 Menu Choix S]
    N163[163 Menu caisse ]
    N0[0 Histo ventes]
    N0[0 Histo ventes]
    N0[0 Transaction ]
    T[257 Zoom article]
    M --> N242
    N242 --> N163
    N163 --> N0
    N0 --> N0
    N0 --> N0
    N0 --> T
    style M fill:#8b5cf6,color:#fff
    style N242 fill:#f59e0b
    style N163 fill:#f59e0b
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 0 |  Print ticket vente LEX | 5 |
| 0 |  Print ticket vente PMS-584 | 5 |
| 300 | Saisie transaction 154 N.U | 2 |
| 237 | Transaction Nouv vente avec GP | 1 |
| 238 | Transaction Nouv vente PMS-584 | 1 |
| 239 | Transaction Nouv vente PMS-721 | 1 |
| 240 | Transaction Nouv vente PMS-710 | 1 |
| 307 | Saisie transaction 154  N.U | 1 |
| 310 | Saisie transaction Nouv vente | 1 |
| 316 | Saisie transaction Nouv vente | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[257 Programme]
    C43[43 Recuperation]
    T --> C43
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:24 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:50 | **DATA POPULATED** - Tables, Callgraph (17 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
