# ADH IDE 253 - Histo ventes Gratuités

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
| **Quoi** | Histo ventes Gratuités |
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
| **Format IDE** | ADH IDE 253 |
| **Description** | Histo ventes Gratuités |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 23 | reseau_cloture___rec | `cafil001_dat` | R | 1x |
| 23 | reseau_cloture___rec | `cafil001_dat` | **W** | 4x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 34 | hebergement______heb | `cafil012_dat` | R | 2x |
| 38 | comptable_gratuite | `cafil016_dat` | L | 1x |
| 40 | comptable________cte | `cafil018_dat` | L | 1x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | R | 1x |
| 77 | articles_________art | `cafil055_dat` | L | 1x |
| 79 | gratuites________gra | `cafil057_dat` | R | 1x |
| 89 | moyen_paiement___mop | `cafil067_dat` | L | 2x |
| 197 | articles_en_stock | `caisse_artstock` | L | 2x |
| 263 | vente | `caisse_vente` | L | 1x |
| 264 | vente_gratuite | `caisse_vente_gratuite` | L | 1x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | L | 2x |
| 728 | arc_cc_total | `arc_cctotal` | L | 1x |
| 804 | valeur_credit_bar_defaut | `valeur_credit_bar_defaut` | L | 2x |
| 847 | stat_lieu_vente_date | `%club_user%_stat_lieu_vente_date` | L | 2x |
| 933 | taxe_add_vente | `taxe_add_vente` | L | 2x |
| 933 | taxe_add_vente | `taxe_add_vente` | R | 3x |
| 933 | taxe_add_vente | `taxe_add_vente` | **W** | 1x |
| 945 | Table_945 | - | L | 1x |
| 945 | Table_945 | - | **W** | 1x |
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
| 1 | `{32768,2}` | - |
| 2 | `Date()` | - |
| 3 | `DVal({0,8},'YYYYMMDD')` | - |
| 4 | `TVal({0,9},'HHMMSS')` | - |
| 5 | `Trim({0,19})&' '&Trim({0,18})` | - |
| 6 | `IF ({0,3}='','N15.2Z',{0,3})` | - |
| 7 | `{0,20}` | - |
| 8 | `{0,21}=0 AND {0,22}<>'A'` | - |
| 9 | `IF({0,21}<>0 OR {0,22}='A',36,110)` | - |
| 10 | `IF({0,22}='A',MlsTrans ('Annulation'),IF({0,21}...` | - |
| 11 | `{0,28}='VRL' OR {0,28}='TRF' OR {0,28}='VSL'` | - |
| 12 | `(ExpCalc('11'EXP) AND Trim({0,25})<>'') OR NOT ...` | - |
| 13 | `{0,26}=6` | - |
| 14 | `ExpCalc('11'EXP) AND Trim({0,25})=''` | - |
| 15 | `IF({0,12}='OD','OD','')` | - |
| 16 | `{0,7}` | - |
| 17 | `{0,12}` | - |
| 18 | `{0,28}` | - |
| 19 | `{0,45}>1` | - |
| 20 | `{0,44}>1` | - |

> **Total**: 41 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 17 |
| **Lignes logique** | 652 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N0[0 Histo ventes]
    N0[0 Transaction ]
    N0[0 Histo ventes]
    N0[0 Histo ventes]
    N0[0 Transaction ]
    T[253 Histo ventes]
    M --> N0
    N0 --> N0
    N0 --> N0
    N0 --> N0
    N0 --> N0
    N0 --> T
    style M fill:#8b5cf6,color:#fff
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 0 | Histo ventes payantes /PMS-623 | 2 |
| 0 | Histo ventes Gratuités | 1 |
| 0 | Histo ventes payantes /PMS-605 | 1 |
| 0 | Transaction Nouv vente PMS-584 | 1 |
| 0 | Transaction Nouv vente PMS-710 | 1 |
| 0 | Transaction Nouv vente PMS-721 | 1 |
| 242 | Menu Choix Saisie/Annul vente | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[253 Programme]
    C233[233 Appel Print ]
    T --> C233
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
    style C179 fill:#3fb950
    style C181 fill:#3fb950
    style C182 fill:#3fb950
    style C247 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 233 | Appel Print ticket vente PMS28 | 2 |
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
| 2026-01-27 19:50 | **DATA POPULATED** - Tables, Callgraph (41 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
