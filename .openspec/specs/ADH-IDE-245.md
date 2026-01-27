# ADH IDE 245 - Histo ventes payantes /PMS-623

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
| **Quoi** | Histo ventes payantes /PMS-623 |
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
| **Format IDE** | ADH IDE 245 |
| **Description** | Histo ventes payantes /PMS-623 |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 23 | reseau_cloture___rec | `cafil001_dat` | R | 1x |
| 23 | reseau_cloture___rec | `cafil001_dat` | **W** | 4x |
| 34 | hebergement______heb | `cafil012_dat` | R | 5x |
| 38 | comptable_gratuite | `cafil016_dat` | L | 1x |
| 40 | comptable________cte | `cafil018_dat` | L | 3x |
| 40 | comptable________cte | `cafil018_dat` | R | 1x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 2x |
| 67 | tables___________tab | `cafil045_dat` | L | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | R | 2x |
| 77 | articles_________art | `cafil055_dat` | L | 1x |
| 89 | moyen_paiement___mop | `cafil067_dat` | L | 4x |
| 197 | articles_en_stock | `caisse_artstock` | L | 4x |
| 263 | vente | `caisse_vente` | L | 4x |
| 264 | vente_gratuite | `caisse_vente_gratuite` | L | 1x |
| 285 | email | `email` | R | 1x |
| 400 | pv_cust_rentals | `pv_rentals_dat` | L | 2x |
| 473 | comptage_caisse | `%club_user%_caisse_compcais` | L | 3x |
| 519 | pv_cust_rentals | `%club_user%_pv_rentals_dat` | R | 1x |
| 519 | pv_cust_rentals | `%club_user%_pv_rentals_dat` | **W** | 1x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | L | 5x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | **W** | 1x |
| 728 | arc_cc_total | `arc_cctotal` | L | 1x |
| 804 | valeur_credit_bar_defaut | `valeur_credit_bar_defaut` | L | 4x |
| 804 | valeur_credit_bar_defaut | `valeur_credit_bar_defaut` | **W** | 2x |
| 847 | stat_lieu_vente_date | `%club_user%_stat_lieu_vente_date` | L | 5x |
| 899 | Boo_ResultsRechercheHoraire | `Boo_ResultsRechercheHoraire` | **W** | 2x |
| 910 | classification_memory | `classification_memory` | L | 1x |
| 911 | log_booker | `log_booker` | **W** | 1x |
| 933 | taxe_add_vente | `taxe_add_vente` | L | 5x |
| 933 | taxe_add_vente | `taxe_add_vente` | R | 3x |
| 933 | taxe_add_vente | `taxe_add_vente` | **W** | 1x |
| 945 | Table_945 | - | L | 4x |
| 945 | Table_945 | - | R | 1x |
| 1069 | Table_1069 | - | L | 1x |
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
| 1 | `Date()` | - |
| 2 | `'V'` | - |
| 3 | `DbDel('{519,4}'DSOURCE,'')` | - |
| 4 | `DbDel('{596,4}'DSOURCE,'')` | - |
| 5 | `DbDel('{933,4}'DSOURCE,'')` | - |
| 6 | `NOT {0,18}` | - |
| 7 | `{0,18}` | - |
| 8 | `{0,19}=6` | - |
| 9 | `'Ventes payantes'` | - |
| 10 | `'VAD'` | - |
| 11 | `{0,20}>0` | - |
| 12 | `'TRUE'LOG` | - |
| 13 | `'\ '` | - |
| 14 | `'Tous les services'` | - |
| 15 | `'VSERV'` | - |
| 16 | `'O'` | - |
| 17 | `{0,20}=-1` | - |
| 18 | `'Histo_Vtes'` | - |
| 19 | `0` | - |
| 20 | `IF({32768,83},'V,A','V')` | - |

> **Total**: 24 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 31 |
| **Lignes logique** | 2059 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N0[0 Transaction ]
    N0[0 Transaction ]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    N0[0 Transaction ]
    T[245 Histo ventes]
    N0 --> N0
    N0 --> N163
    N163 --> N1
    N1 --> N0
    N0 --> T
    style M fill:#8b5cf6,color:#fff
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style N0 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 242 | Menu Choix Saisie/Annul vente | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[245 Programme]
    C233[233 Appel Print ]
    T --> C233
    C235[235  Print ticke]
    T --> C235
    C236[236  Print ticke]
    T --> C236
    C247[247 Deversement ]
    T --> C247
    C179[179 Get Printer]
    T --> C179
    C181[181 Set Listing ]
    T --> C181
    C182[182 Raz Current ]
    T --> C182
    C255[255 VAD valids  ]
    T --> C255
    style T fill:#58a6ff,color:#000
    style C233 fill:#3fb950
    style C235 fill:#3fb950
    style C236 fill:#3fb950
    style C247 fill:#3fb950
    style C179 fill:#3fb950
    style C181 fill:#3fb950
    style C182 fill:#3fb950
    style C255 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 233 | Appel Print ticket vente PMS28 | 3 |
| 1 | 235 |  Print ticket vente LEX | 2 |
| 1 | 236 |  Print ticket vente PMS-584 | 2 |
| 1 | 247 | Deversement Transaction | 2 |
| 1 | 179 | Get Printer | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 255 | VAD validés à imprimer | 1 |
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
| 2026-01-27 19:50 | **DATA POPULATED** - Tables, Callgraph (24 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
