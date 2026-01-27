# ADH IDE 73 - Print extrait compte /Imp

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
| **Quoi** | Print extrait compte /Imp |
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
| **Format IDE** | ADH IDE 73 |
| **Description** | Print extrait compte /Imp |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 7x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 31 | gm-complet_______gmc | `cafil009_dat` | L | 1x |
| 31 | gm-complet_______gmc | `cafil009_dat` | R | 6x |
| 34 | hebergement______heb | `cafil012_dat` | L | 1x |
| 40 | comptable________cte | `cafil018_dat` | L | 6x |
| 40 | comptable________cte | `cafil018_dat` | R | 7x |
| 867 | log_maj_tpe | `log_maj_tpe` | **W** | 6x |
| 928 | type_lit | `type_lit` | L | 2x |
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
| 1 | `GetParam ('LISTINGNUMPRINTERCHOICE')` | - |
| 2 | `IsComponent () AND NOT({0,14})` | - |
| 3 | `SetCrsr (1)` | - |
| 4 | `SetCrsr (2)` | - |
| 5 | `Left ({0,4},Len (RTrim ({0,4}))-1)` | - |
| 6 | `GetParam ('CURRENTPRINTERNUM')=1` | - |
| 7 | `GetParam ('CURRENTPRINTERNUM')=4` | - |
| 8 | `GetParam ('CURRENTPRINTERNUM')=6` | - |
| 9 | `GetParam ('CURRENTPRINTERNUM')=8` | - |
| 10 | `GetParam ('CURRENTPRINTERNUM')=9` | - |
| 11 | `DbDel ('{867,4}'DSOURCE,'')` | - |
| 12 | `'TRUE'LOG` | - |

> **Total**: 12 expressions (affichees: 12)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 26 |
| **Lignes logique** | 792 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N69[69 Extrait de c]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    T[73 Print extrai]
    N69 --> N163
    N163 --> N1
    N1 --> T
    style M fill:#8b5cf6,color:#fff
    style N69 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 69 | Extrait de compte | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[73 Programme]
    C75[75 Creation Pie]
    T --> C75
    C21[21 Recupere dev]
    T --> C21
    C179[179 Get Printer]
    T --> C179
    C181[181 Set Listing ]
    T --> C181
    C182[182 Raz Current ]
    T --> C182
    style T fill:#58a6ff,color:#000
    style C75 fill:#3fb950
    style C21 fill:#3fb950
    style C179 fill:#3fb950
    style C181 fill:#3fb950
    style C182 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 75 | Creation Pied Facture | 6 |
| 1 | 21 | Recupere devise local | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:19 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:45 | **DATA POPULATED** - Tables, Callgraph (12 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
