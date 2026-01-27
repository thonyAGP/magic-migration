# ADH IDE 300 - Programme supprime (Prg_297)

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
| **Quoi** | Programme supprime (Prg_297) |
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
| **Format IDE** | ADH IDE 300 |
| **Description** | Programme supprime (Prg_297) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 23 | reseau_cloture___rec | `cafil001_dat` | R | 1x |
| 23 | reseau_cloture___rec | `cafil001_dat` | **W** | 2x |
| 26 | comptes_speciaux_spc | `cafil004_dat` | L | 1x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 32 | prestations | `cafil010_dat` | R | 1x |
| 32 | prestations | `cafil010_dat` | **W** | 2x |
| 34 | hebergement______heb | `cafil012_dat` | L | 1x |
| 39 | depot_garantie___dga | `cafil017_dat` | R | 1x |
| 46 | mvt_prestation___mpr | `cafil024_dat` | L | 1x |
| 46 | mvt_prestation___mpr | `cafil024_dat` | **W** | 1x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 2x |
| 67 | tables___________tab | `cafil045_dat` | L | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | R | 1x |
| 79 | gratuites________gra | `cafil057_dat` | R | 1x |
| 96 | table_prestation_pre | `cafil074_dat` | L | 1x |
| 197 | articles_en_stock | `caisse_artstock` | L | 1x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | L | 1x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | **W** | 3x |
| 697 | droits_applications | `droits` | L | 1x |
| 728 | arc_cc_total | `arc_cctotal` | L | 1x |
| 737 | pv_package_detail | `pv_packdetail_dat` | L | 1x |
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
| 1 | `MlsTrans ('Verifier que la transaction est bien...` | - |
| 2 | `Date ()` | - |
| 3 | `{32768,2}` | - |
| 4 | `Trim ({0,71})` | - |
| 5 | `154` | - |
| 6 | `{0,1}` | - |
| 7 | `{0,5}` | - |
| 8 | `{0,6}` | - |
| 9 | `'F'` | - |
| 10 | `Date ()` | - |
| 11 | `{0,39}*{0,44}` | - |
| 12 | `'FALSE'LOG` | - |
| 13 | `'N'` | - |
| 14 | `1` | - |
| 15 | `{0,28}=''` | - |
| 16 | `{0,18}=0` | - |
| 17 | `'CAISSE'` | - |
| 18 | `{0,18}` | - |
| 19 | `{0,39}>0 AND {0,44}=0` | - |
| 20 | `{0,43} AND {0,27}='N'` | - |

> **Total**: 103 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 18 |
| **Lignes logique** | 575 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    T[300 Saisie transaction 154 N.U]
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
    T[300 Programme]
    C152[152 Recup Classe]
    T --> C152
    C257[257 Zoom article]
    T --> C257
    C269[269 Zoom service]
    T --> C269
    C306[306 Print ticket]
    T --> C306
    C43[43 Recuperation]
    T --> C43
    C149[149 Calcul stock]
    T --> C149
    C179[179 Get Printer]
    T --> C179
    C180[180 Printer choi]
    T --> C180
    style T fill:#58a6ff,color:#000
    style C152 fill:#3fb950
    style C257 fill:#3fb950
    style C269 fill:#3fb950
    style C306 fill:#3fb950
    style C43 fill:#3fb950
    style C149 fill:#3fb950
    style C179 fill:#3fb950
    style C180 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 152 | Recup Classe et Lib du MOP | 2 |
| 1 | 257 | Zoom articles | 2 |
| 1 | 269 | Zoom services village | 2 |
| 1 | 306 | Print ticket vente/OD N.U | 2 |
| 1 | 43 | Recuperation du titre | 1 |
| 1 | 149 | Calcul stock produit WS | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 180 | Printer choice | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 272 | Zoom modes de paiement | 1 |
| 1 | 322 | Deversement Transaction | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:26 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (103 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
