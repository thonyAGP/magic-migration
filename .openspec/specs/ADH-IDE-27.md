# ADH IDE 27 - Separation

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
| **Quoi** | Separation |
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
| **Format IDE** | ADH IDE 27 |
| **Description** | Separation |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 15 | transac_entete_bar | `bartransacent` | **W** | 3x |
| 19 | bl_detail | `bldetail` | **W** | 3x |
| 23 | reseau_cloture___rec | `cafil001_dat` | R | 1x |
| 23 | reseau_cloture___rec | `cafil001_dat` | **W** | 4x |
| 29 | voyages__________voy | `cafil007_dat` | **W** | 3x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 2x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 7x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | **W** | 1x |
| 31 | gm-complet_______gmc | `cafil009_dat` | R | 1x |
| 31 | gm-complet_______gmc | `cafil009_dat` | **W** | 1x |
| 32 | prestations | `cafil010_dat` | **W** | 3x |
| 33 | prestations______pre | `cafil011_dat` | R | 1x |
| 33 | prestations______pre | `cafil011_dat` | **W** | 2x |
| 34 | hebergement______heb | `cafil012_dat` | **W** | 3x |
| 35 | personnel_go______go | `cafil013_dat` | R | 1x |
| 35 | personnel_go______go | `cafil013_dat` | **W** | 1x |
| 36 | client_gm | `cafil014_dat` | R | 1x |
| 36 | client_gm | `cafil014_dat` | **W** | 1x |
| 37 | commentaire_gm_________acc | `cafil015_dat` | **W** | 3x |
| 38 | comptable_gratuite | `cafil016_dat` | **W** | 3x |
| 39 | depot_garantie___dga | `cafil017_dat` | L | 1x |
| 39 | depot_garantie___dga | `cafil017_dat` | R | 4x |
| 39 | depot_garantie___dga | `cafil017_dat` | **W** | 1x |
| 40 | comptable________cte | `cafil018_dat` | R | 4x |
| 40 | comptable________cte | `cafil018_dat` | **W** | 6x |
| 44 | change___________chg | `cafil022_dat` | R | 1x |
| 44 | change___________chg | `cafil022_dat` | **W** | 1x |
| 46 | mvt_prestation___mpr | `cafil024_dat` | **W** | 3x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 5x |
| 51 | fusion_eclatementfec | `cafil029_dat` | **W** | 1x |
| 68 | compteurs________cpt | `cafil046_dat` | **W** | 3x |
| 70 | date_comptable___dat | `cafil048_dat` | R | 1x |
| 79 | gratuites________gra | `cafil057_dat` | **W** | 3x |
| 80 | codes_autocom____aut | `cafil058_dat` | R | 1x |
| 80 | codes_autocom____aut | `cafil058_dat` | **W** | 1x |
| 93 | vendeurs_________ven | `cafil071_dat` | **W** | 1x |
| 123 | fichier_messagerie | `cafil101_dat` | R | 1x |
| 123 | fichier_messagerie | `cafil101_dat` | **W** | 1x |
| 131 | fichier_validation | `cafil109_dat` | R | 1x |
| 131 | fichier_validation | `cafil109_dat` | **W** | 2x |
| 137 | fichier_histotel | `cafil115_dat` | R | 1x |
| 137 | fichier_histotel | `cafil115_dat` | **W** | 2x |
| 147 | change_vente_____chg | `cafil125_dat` | R | 1x |
| 147 | change_vente_____chg | `cafil125_dat` | **W** | 1x |
| 167 | troncon__________tro | `cafil145_dat` | **W** | 1x |
| 168 | heb_circuit______hci | `cafil146_dat` | **W** | 3x |
| 171 | commentaire______com | `cafil149_dat` | **W** | 1x |
| 263 | vente | `caisse_vente` | **W** | 2x |
| 266 | cc_comptable | `cccompta` | **W** | 3x |
| 268 | cc_total_par_type | `ccpartyp` | **W** | 3x |
| 271 | cc_total | `cctotal` | **W** | 3x |
| 272 | cc_type_detail | `cctypdet` | **W** | 3x |
| 285 | email | `email` | **W** | 1x |
| 298 | participants_____par | `excupar_dat` | **W** | 3x |
| 301 | details_partici__dpa | `excupta_dat` | **W** | 3x |
| 307 | vente_option_veo | `excuveo_dat` | **W** | 3x |
| 309 | vente____________vep | `excuvepe_dat` | **W** | 4x |
| 312 | ez_card | `ezcard` | R | 1x |
| 312 | ez_card | `ezcard` | **W** | 1x |
| 340 | histo_fusionseparation | `histo_fus_sep` | L | 2x |
| 340 | histo_fusionseparation | `histo_fus_sep` | R | 1x |
| 340 | histo_fusionseparation | `histo_fus_sep` | **W** | 2x |
| 342 | histo__fusionseparation_log | `histo_fus_sep_log` | R | 2x |
| 343 | histo_fusionseparation_saisie | `histo_fus_sep_saisie` | L | 5x |
| 343 | histo_fusionseparation_saisie | `histo_fus_sep_saisie` | R | 3x |
| 343 | histo_fusionseparation_saisie | `histo_fus_sep_saisie` | **W** | 3x |
| 358 | import_mod | `moddossier_dat` | **W** | 3x |
| 366 | pms_print_param | `pmsprintparam` | **W** | 3x |
| 377 | pv_contracts | `pv_contracts_dat` | **W** | 2x |
| 382 | pv_discount_reasons | `pv_discountlist_dat` | **W** | 2x |
| 400 | pv_cust_rentals | `pv_rentals_dat` | L | 2x |
| 463 | heure_de_passage | `verifpool_dat` | **W** | 3x |
| 786 | qualite_avant_reprise | `qualite_avant_reprise` | R | 1x |
| 786 | qualite_avant_reprise | `qualite_avant_reprise` | **W** | 1x |
| 804 | valeur_credit_bar_defaut | `valeur_credit_bar_defaut` | **W** | 1x |
| 805 | vente_par_moyen_paiement | `vente_par_moyen_paiement` | **W** | 3x |
| 807 | plafond_lit | `plafond_lit` | **W** | 3x |
| 831 | import_go_erreur_affection | `import_go_erreur_affection` | **W** | 3x |
| 834 | tpe_par_terminal | `tpe_par_terminal` | **W** | 3x |
| 837 | ##_pv_customer_dat | `##%club_user%_%term%_pv_customer` | **W** | 3x |
| 947 | Table_947 | - | **W** | 3x |
| 1059 | Table_1059 | - | **W** | 1x |
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
| 4 | `{0,30}<>'F'` | - |
| 5 | `{0,15}<>'R'` | - |
| 6 | `{0,16}` | - |
| 7 | `NOT ({0,16})` | - |
| 8 | `'F'` | - |
| 9 | `{0,30}='F'` | - |
| 10 | `Date ()` | - |
| 11 | `Time ()` | - |
| 12 | `{0,2}` | - |
| 13 | `{0,3}` | - |
| 14 | `SetCrsr (2)` | - |
| 15 | `SetCrsr (1)` | - |
| 16 | `{0,17}` | - |
| 17 | `NOT ({0,31})` | - |
| 18 | `{0,31}` | - |
| 19 | `27` | - |
| 20 | `{0,32}` | - |

> **Total**: 84 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 183 |
| **Lignes logique** | 3421 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N37[37 Menu changem]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    T[27 Separation]
    N37 --> N163
    N163 --> N1
    N1 --> T
    style M fill:#8b5cf6,color:#fff
    style N37 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 37 | Menu changement compte | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[27 Programme]
    C35[35 Write histoF]
    T --> C35
    C30[30 Read histo F]
    T --> C30
    C31[31 Write histoF]
    T --> C31
    C29[29 Write histo ]
    T --> C29
    C34[34 Read histoFu]
    T --> C34
    C36[36 Print Separa]
    T --> C36
    C43[43 Recuperation]
    T --> C43
    C179[179 Get Printer]
    T --> C179
    style T fill:#58a6ff,color:#000
    style C35 fill:#3fb950
    style C30 fill:#3fb950
    style C31 fill:#3fb950
    style C29 fill:#3fb950
    style C34 fill:#3fb950
    style C36 fill:#3fb950
    style C43 fill:#3fb950
    style C179 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 35 | Write histo_Fus_Sep_Log | 14 |
| 1 | 30 | Read histo Fus_Sep_Det | 11 |
| 1 | 31 | Write histo_Fus_Sep_Det | 11 |
| 1 | 29 | Write histo Fus_Sep | 6 |
| 1 | 34 | Read histo_Fus_Sep_Log | 1 |
| 1 | 36 | Print Separation ou fusion | 1 |
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 180 | Printer choice | 1 |
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
| 2026-01-27 20:18 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:44 | **DATA POPULATED** - Tables, Callgraph (84 expr) | Script |
| 2026-01-27 17:56 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
