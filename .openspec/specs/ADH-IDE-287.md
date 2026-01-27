# ADH IDE 287 - Programme supprime (Prg_282)

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
| **Quoi** | Programme supprime (Prg_282) |
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
| **Format IDE** | ADH IDE 287 |
| **Description** | Programme supprime (Prg_282) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 1x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 31 | gm-complet_______gmc | `cafil009_dat` | L | 1x |
| 39 | depot_garantie___dga | `cafil017_dat` | L | 2x |
| 40 | comptable________cte | `cafil018_dat` | R | 1x |
| 40 | comptable________cte | `cafil018_dat` | **W** | 2x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 2x |
| 48 | lignes_de_solde__sld | `cafil026_dat` | **W** | 1x |
| 53 | ligne_telephone__lgn | `cafil031_dat` | **W** | 1x |
| 66 | imputations______imp | `cafil044_dat` | L | 2x |
| 68 | compteurs________cpt | `cafil046_dat` | **W** | 4x |
| 69 | initialisation___ini | `cafil047_dat` | L | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | L | 1x |
| 75 | commande_autocom_cot | `cafil053_dat` | **W** | 1x |
| 78 | param__telephone_tel | `cafil056_dat` | L | 1x |
| 78 | param__telephone_tel | `cafil056_dat` | R | 1x |
| 80 | codes_autocom____aut | `cafil058_dat` | L | 1x |
| 80 | codes_autocom____aut | `cafil058_dat` | **W** | 1x |
| 87 | sda_telephone____sda | `cafil065_dat` | L | 2x |
| 87 | sda_telephone____sda | `cafil065_dat` | **W** | 2x |
| 136 | fichier_echanges | `cafil114_dat` | **W** | 2x |
| 151 | nb_code__poste | `cafil129_dat` | **W** | 2x |
| 285 | email | `email` | L | 1x |
| 312 | ez_card | `ezcard` | **W** | 1x |
| 911 | log_booker | `log_booker` | **W** | 1x |
| 934 | selection enregistrement diver | `selection_enregistrement_div` | **W** | 1x |
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
| 1 | `{0,5}` | - |
| 2 | `{0,6}` | - |
| 3 | `{0,7}` | - |
| 4 | `{0,34}` | - |
| 5 | `Trim({0,9})&Trim({0,10})<>''` | - |
| 6 | `'00/00/0000'DATE` | - |
| 7 | `{0,1}` | - |
| 8 | `{32768,43} AND {0,50}<0` | - |
| 9 | `'S'` | - |
| 10 | `IF(Trim({0,10})<>'','A'&Trim({0,10}),{0,9})` | - |
| 11 | `Date()` | - |
| 12 | `Time()` | - |
| 13 | `Trim({0,30})<>'' AND Trim({0,51})<>''` | - |
| 14 | `'TRUE'LOG` | - |
| 15 | `'I'` | - |
| 16 | `{0,3}` | - |
| 17 | `INIPut('EmbedFonts=N','FALSE'LOG)` | - |
| 18 | `INIPut('CompressPDF=N','FALSE'LOG)` | - |
| 19 | `{32768,76} AND NOT {0,3}` | - |
| 20 | `IF({0,3},'TRUE'LOG,'FALSE'LOG)` | - |

> **Total**: 33 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 26 |
| **Lignes logique** | 598 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    T[287 Solde Easy Check Out]
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
    T[287 Programme]
    C54[54 FacturesChec]
    T --> C54
    C65[65 Edition  Mai]
    T --> C65
    C71[71 Print extrai]
    T --> C71
    C179[179 Get Printer]
    T --> C179
    C181[181 Set Listing ]
    T --> C181
    style T fill:#58a6ff,color:#000
    style C54 fill:#3fb950
    style C65 fill:#3fb950
    style C71 fill:#3fb950
    style C179 fill:#3fb950
    style C181 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 54 | Factures_Check_Out | 1 |
| 1 | 65 | Edition & Mail Easy Check Out | 1 |
| 1 | 71 | Print extrait compte /Date | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 181 | Set Listing Number | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:25 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (33 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
