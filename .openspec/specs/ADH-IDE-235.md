# ADH IDE 235 -  Print ticket vente LEX

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
| **Quoi** |  Print ticket vente LEX |
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
| **Format IDE** | ADH IDE 235 |
| **Description** |  Print ticket vente LEX |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 31 | gm-complet_______gmc | `cafil009_dat` | R | 4x |
| 34 | hebergement______heb | `cafil012_dat` | L | 2x |
| 34 | hebergement______heb | `cafil012_dat` | R | 2x |
| 40 | comptable________cte | `cafil018_dat` | L | 2x |
| 40 | comptable________cte | `cafil018_dat` | R | 2x |
| 67 | tables___________tab | `cafil045_dat` | L | 2x |
| 67 | tables___________tab | `cafil045_dat` | R | 1x |
| 69 | initialisation___ini | `cafil047_dat` | R | 1x |
| 77 | articles_________art | `cafil055_dat` | L | 3x |
| 77 | articles_________art | `cafil055_dat` | R | 2x |
| 263 | vente | `caisse_vente` | L | 4x |
| 372 | pv_budget | `pv_budget_dat` | L | 1x |
| 417 | pv_weight | `pv_weight` | L | 2x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | L | 7x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | R | 7x |
| 728 | arc_cc_total | `arc_cctotal` | L | 1x |
| 818 | Circuit supprime | `zcircafil146` | L | 3x |
| 847 | stat_lieu_vente_date | `%club_user%_stat_lieu_vente_date` | L | 10x |
| 847 | stat_lieu_vente_date | `%club_user%_stat_lieu_vente_date` | R | 5x |
| 867 | log_maj_tpe | `log_maj_tpe` | R | 5x |
| 878 | categorie_operation_mw | `categorie_operation_mw` | R | 2x |
| 904 | Boo_AvailibleEmployees | `Boo_AvailibleEmployees` | L | 3x |
| 1037 | Table_1037 | - | R | 2x |
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
| 1 | `SetCrsr (2)` | - |
| 2 | `SetCrsr (1)` | - |
| 3 | `GetParam ('CURRENTPRINTERNUM')` | - |
| 4 | `GetParam ('CURRENTPRINTERNUM')=1` | - |
| 5 | `GetParam ('CURRENTPRINTERNUM')=4` | - |
| 6 | `GetParam ('CURRENTPRINTERNUM')=5` | - |
| 7 | `GetParam ('CURRENTPRINTERNUM')=8` | - |
| 8 | `GetParam ('CURRENTPRINTERNUM')=9` | - |
| 9 | `'VRL'` | - |
| 10 | `'VSL'` | - |
| 11 | `INIPut('EmbedFonts=N','FALSE'LOG)` | - |
| 12 | `INIPut('CompressPDF =Y','FALSE'LOG)` | - |
| 13 | `'TRUE'LOG` | - |
| 14 | `{32768,78}` | - |
| 15 | `NOT {32768,78}` | - |
| 16 | `Translate ('%TempDir%')&'ticket_vente_'&
Str({...` | - |
| 17 | `{0,32}` | - |
| 18 | `ExpCalc('3'EXP) OR ExpCalc('7'EXP)` | - |
| 19 | `{0,51}>0` | - |
| 20 | `StrTokenCnt({0,52},',')` | - |

> **Total**: 29 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 38 |
| **Lignes logique** | 1507 |
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
    N237[237 Transaction ]
    N240[240 Transaction ]
    N239[239 Transaction ]
    T[235  Print ticke]
    M --> N242
    N242 --> N163
    N163 --> N237
    N237 --> N240
    N240 --> N239
    N239 --> T
    style M fill:#8b5cf6,color:#fff
    style N242 fill:#f59e0b
    style N163 fill:#f59e0b
    style N237 fill:#f59e0b
    style N240 fill:#f59e0b
    style N239 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 238 | Transaction Nouv vente PMS-584 | 2 |
| 243 | Histo ventes payantes | 2 |
| 244 | Histo ventes payantes /PMS-605 | 2 |
| 245 | Histo ventes payantes /PMS-623 | 2 |
| 233 | Appel Print ticket vente PMS28 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[235 Programme]
    C152[152 Recup Classe]
    T --> C152
    C251[251 Creation pie]
    T --> C251
    C182[182 Raz Current ]
    T --> C182
    style T fill:#58a6ff,color:#000
    style C152 fill:#3fb950
    style C251 fill:#3fb950
    style C182 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 152 | Recup Classe et Lib du MOP | 5 |
| 1 | 251 | Creation pied Ticket | 5 |
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
| 2026-01-27 20:24 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:50 | **DATA POPULATED** - Tables, Callgraph (29 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
