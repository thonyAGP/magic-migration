# ADH IDE 173 - Gestion forfait TAI LOCAL

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
| **Quoi** | Gestion forfait TAI LOCAL |
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
| **Format IDE** | ADH IDE 173 |
| **Description** | Gestion forfait TAI LOCAL |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 23 | reseau_cloture___rec | `cafil001_dat` | R | 2x |
| 23 | reseau_cloture___rec | `cafil001_dat` | **W** | 6x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 3x |
| 34 | hebergement______heb | `cafil012_dat` | R | 1x |
| 39 | depot_garantie___dga | `cafil017_dat` | R | 1x |
| 40 | comptable________cte | `cafil018_dat` | L | 2x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 4x |
| 70 | date_comptable___dat | `cafil048_dat` | L | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | R | 1x |
| 77 | articles_________art | `cafil055_dat` | L | 3x |
| 173 | intermed_compta__ite | `cafil181_dat` | **W** | 2x |
| 463 | heure_de_passage | `verifpool_dat` | L | 4x |
| 463 | heure_de_passage | `verifpool_dat` | R | 2x |
| 463 | heure_de_passage | `verifpool_dat` | **W** | 1x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | **W** | 4x |
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
| 2 | `Date ()` | - |
| 3 | `{0,23}='A'` | - |
| 4 | `InStr ('BC',{0,23})<>0` | - |
| 5 | `{0,24}` | - |
| 6 | `{0,23}='B'` | - |
| 7 | `{0,23}='C'` | - |
| 8 | `NOT ({0,24}) AND NOT ({0,20})` | - |
| 9 | `''` | - |
| 10 | `136` | - |
| 11 | `Trim ({0,22})` | - |
| 12 | `'AUTO'` | - |
| 13 | `'MANU'` | - |
| 14 | `{0,25}` | - |
| 15 | `{0,26}` | - |
| 16 | `{0,8}<Date () AND NOT ({0,20})` | - |
| 17 | `{0,8}>=Date ()` | - |
| 18 | `'TRUE'LOG` | - |
| 19 | `{0,15}='1'` | - |
| 20 | `{0,1}` | - |

> **Total**: 25 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 27 |
| **Lignes logique** | 918 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N0[0 Garantie sur]
    N77[77 Club Med Pas]
    N1[1 Main Program]
    N163[163 Menu caisse ]
    T[173 Gestion forf]
    N0 --> N77
    N77 --> N1
    N1 --> N163
    N163 --> T
    style M fill:#8b5cf6,color:#fff
    style N0 fill:#f59e0b
    style N77 fill:#f59e0b
    style N1 fill:#f59e0b
    style N163 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 0 | Garantie sur compte PMS-584 | 2 |
| 77 | Club Med Pass menu | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[173 Programme]
    C43[43 Recuperation]
    T --> C43
    C179[179 Get Printer]
    T --> C179
    C180[180 Printer choi]
    T --> C180
    C181[181 Set Listing ]
    T --> C181
    C269[269 Zoom service]
    T --> C269
    C273[273 Zoom article]
    T --> C273
    C306[306 Print ticket]
    T --> C306
    C44[44 Appel progra]
    T --> C44
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C179 fill:#3fb950
    style C180 fill:#3fb950
    style C181 fill:#3fb950
    style C269 fill:#3fb950
    style C273 fill:#3fb950
    style C306 fill:#3fb950
    style C44 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 4 |
| 1 | 179 | Get Printer | 2 |
| 1 | 180 | Printer choice | 2 |
| 1 | 181 | Set Listing Number | 2 |
| 1 | 269 | Zoom services village | 2 |
| 1 | 273 | Zoom articles TAI | 2 |
| 1 | 306 | Print ticket vente/OD N.U | 2 |
| 1 | 44 | Appel programme | 1 |
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
| 2026-01-27 20:22 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (25 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
