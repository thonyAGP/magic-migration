# ADH IDE 243 - Histo ventes payantes

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
| **Quoi** | Histo ventes payantes |
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
| **Format IDE** | ADH IDE 243 |
| **Description** | Histo ventes payantes |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 23 | reseau_cloture___rec | `cafil001_dat` | R | 1x |
| 23 | reseau_cloture___rec | `cafil001_dat` | **W** | 4x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 34 | hebergement______heb | `cafil012_dat` | R | 3x |
| 40 | comptable________cte | `cafil018_dat` | L | 3x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 2x |
| 67 | tables___________tab | `cafil045_dat` | L | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | R | 1x |
| 77 | articles_________art | `cafil055_dat` | L | 1x |
| 79 | gratuites________gra | `cafil057_dat` | R | 1x |
| 89 | moyen_paiement___mop | `cafil067_dat` | L | 3x |
| 197 | articles_en_stock | `caisse_artstock` | L | 3x |
| 263 | vente | `caisse_vente` | L | 3x |
| 285 | email | `email` | R | 1x |
| 400 | pv_cust_rentals | `pv_rentals_dat` | L | 2x |
| 473 | comptage_caisse | `%club_user%_caisse_compcais` | L | 3x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | L | 3x |
| 728 | arc_cc_total | `arc_cctotal` | L | 1x |
| 804 | valeur_credit_bar_defaut | `valeur_credit_bar_defaut` | L | 3x |
| 847 | stat_lieu_vente_date | `%club_user%_stat_lieu_vente_date` | L | 3x |
| 899 | Boo_ResultsRechercheHoraire | `Boo_ResultsRechercheHoraire` | **W** | 2x |
| 910 | classification_memory | `classification_memory` | L | 1x |
| 911 | log_booker | `log_booker` | **W** | 1x |
| 933 | taxe_add_vente | `taxe_add_vente` | L | 3x |
| 933 | taxe_add_vente | `taxe_add_vente` | R | 3x |
| 945 | Table_945 | - | L | 3x |
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
| 1 | `MlsTrans('Liste des ventes du compte')` | - |
| 2 | `{32768,2}` | - |
| 3 | `Date()` | - |
| 4 | `DVal({0,16},'YYYYMMDD')` | - |
| 5 | `TVal({0,17},'HHMMSS')` | - |
| 6 | `Trim({0,29})&' '&Trim({0,28})` | - |
| 7 | `IF ({0,3}='','N15.2Z',{0,3})` | - |
| 8 | `{0,30}` | - |
| 9 | `{0,33}=0 AND {0,34}<>'A'` | - |
| 10 | `IF({0,33}<>0 OR {0,34}='A',36,110)` | - |
| 11 | `IF({0,34}='A',MlsTrans ('Annulation'),IF({0,33}...` | - |
| 12 | `{0,54}<>0 OR {0,61}<>0` | - |
| 13 | `Trim({0,40})<>''` | - |
| 14 | `{0,41}=6` | - |
| 15 | `Trim({0,40})=''` | - |
| 16 | `IF({0,21}='OD','OD','')` | - |
| 17 | `{0,15}` | - |
| 18 | `{0,21}` | - |
| 19 | `{0,43}` | - |
| 20 | `{0,65}>1` | - |

> **Total**: 72 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 22 |
| **Lignes logique** | 1528 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N242[242 Menu Choix S]
    N0[0 Transaction ]
    N0[0 Transaction ]
    N1[1 Main Program]
    N163[163 Menu caisse ]
    T[243 Histo ventes]
    N242 --> N0
    N0 --> N0
    N0 --> N1
    N1 --> N163
    N163 --> T
    style M fill:#8b5cf6,color:#fff
    style N242 fill:#f59e0b
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style N1 fill:#f59e0b
    style N163 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 0 | Transaction Nouv vente PMS-584 | 1 |
| 0 | Transaction Nouv vente PMS-710 | 1 |
| 0 | Transaction Nouv vente PMS-721 | 1 |
| 242 | Menu Choix Saisie/Annul vente | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[243 Programme]
    C233[233 Appel Print ]
    T --> C233
    C235[235  Print ticke]
    T --> C235
    C236[236  Print ticke]
    T --> C236
    C179[179 Get Printer]
    T --> C179
    C181[181 Set Listing ]
    T --> C181
    C182[182 Raz Current ]
    T --> C182
    C247[247 Deversement ]
    T --> C247
    style T fill:#58a6ff,color:#000
    style C233 fill:#3fb950
    style C235 fill:#3fb950
    style C236 fill:#3fb950
    style C179 fill:#3fb950
    style C181 fill:#3fb950
    style C182 fill:#3fb950
    style C247 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 233 | Appel Print ticket vente PMS28 | 2 |
| 1 | 235 |  Print ticket vente LEX | 2 |
| 1 | 236 |  Print ticket vente PMS-584 | 2 |
| 1 | 179 | Get Printer | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 247 | Deversement Transaction | 1 |
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
| 2026-01-27 19:50 | **DATA POPULATED** - Tables, Callgraph (72 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
