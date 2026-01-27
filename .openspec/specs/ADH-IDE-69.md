# ADH IDE 69 - Extrait de compte

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
| **Quoi** | Extrait de compte |
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
| **Format IDE** | ADH IDE 69 |
| **Description** | Extrait de compte |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 1x |
| 40 | comptable________cte | `cafil018_dat` | R | 2x |
| 40 | comptable________cte | `cafil018_dat` | **W** | 1x |
| 47 | compte_gm________cgm | `cafil025_dat` | R | 2x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 1x |
| 67 | tables___________tab | `cafil045_dat` | L | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | L | 1x |
| 285 | email | `email` | L | 1x |
| 367 | pms_print_param_default | `pmsprintparamdefault` | **W** | 1x |
| 377 | pv_contracts | `pv_contracts_dat` | R | 1x |
| 395 | pv_ownership | `pv_ownership_dat` | L | 1x |
| 396 | pv_cust_packages | `pv_packages_dat` | L | 2x |
| 473 | comptage_caisse | `%club_user%_caisse_compcais` | L | 1x |
| 728 | arc_cc_total | `arc_cctotal` | L | 1x |
| 786 | qualite_avant_reprise | `qualite_avant_reprise` | L | 1x |
| 911 | log_booker | `log_booker` | **W** | 1x |
| 945 | Table_945 | - | L | 1x |
| 945 | Table_945 | - | R | 1x |
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
| 1 | `{0,1}=''` | - |
| 2 | `'C'` | - |
| 3 | `{0,1}` | - |
| 4 | `{0,3}` | - |
| 5 | `{0,4}` | - |
| 6 | `NOT {0,11}` | - |
| 7 | `{0,11}` | - |
| 8 | `{32768,37}` | - |
| 9 | `'TRUE'LOG` | - |

> **Total**: 9 expressions (affichees: 9)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 12 |
| **Lignes logique** | 464 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N163[163 Menu caisse ]
    N1[1 Main Program]
    T[69 Extrait de c]
    N163 --> N1
    N1 --> T
    style M fill:#8b5cf6,color:#fff
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 163 | Menu caisse GM - scroll | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[69 Programme]
    C179[179 Get Printer]
    T --> C179
    C181[181 Set Listing ]
    T --> C181
    C183[183 Other Listin]
    T --> C183
    C71[71 Print extrai]
    T --> C71
    C43[43 Recuperation]
    T --> C43
    C44[44 Appel progra]
    T --> C44
    C70[70 Print extrai]
    T --> C70
    C72[72 Print extrai]
    T --> C72
    style T fill:#58a6ff,color:#000
    style C179 fill:#3fb950
    style C181 fill:#3fb950
    style C183 fill:#3fb950
    style C71 fill:#3fb950
    style C43 fill:#3fb950
    style C44 fill:#3fb950
    style C70 fill:#3fb950
    style C72 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 179 | Get Printer | 7 |
| 1 | 181 | Set Listing Number | 7 |
| 1 | 183 | Other Listing | 6 |
| 1 | 71 | Print extrait compte /Date | 2 |
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 44 | Appel programme | 1 |
| 1 | 70 | Print extrait compte /Nom | 1 |
| 1 | 72 | Print extrait compte /Cum | 1 |
| 1 | 73 | Print extrait compte /Imp | 1 |
| 1 | 74 | Print extrait DateImp /O | 1 |
| 1 | 76 | Print extrait compte /Service | 1 |
| 1 | 180 | Printer choice | 1 |
| 1 | 182 | Raz Current Printer | 1 |
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
| 2026-01-27 20:19 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:45 | **DATA POPULATED** - Tables, Callgraph (9 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
