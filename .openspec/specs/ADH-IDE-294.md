# ADH IDE 294 - Programme supprime (Prg_291)

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
| **Quoi** | Programme supprime (Prg_291) |
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
| **Format IDE** | ADH IDE 294 |
| **Description** | Programme supprime (Prg_291) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 23 | reseau_cloture___rec | `cafil001_dat` | R | 1x |
| 23 | reseau_cloture___rec | `cafil001_dat` | **W** | 2x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 35 | personnel_go______go | `cafil013_dat` | R | 1x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 2x |
| 68 | compteurs________cpt | `cafil046_dat` | **W** | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | L | 1x |
| 124 | type_taux_change | `cafil102_dat` | L | 1x |
| 124 | type_taux_change | `cafil102_dat` | R | 1x |
| 139 | moyens_reglement_mor | `cafil117_dat` | L | 2x |
| 139 | moyens_reglement_mor | `cafil117_dat` | R | 1x |
| 139 | moyens_reglement_mor | `cafil117_dat` | **W** | 1x |
| 141 | devises__________dev | `cafil119_dat` | R | 1x |
| 147 | change_vente_____chg | `cafil125_dat` | L | 1x |
| 147 | change_vente_____chg | `cafil125_dat` | R | 1x |
| 147 | change_vente_____chg | `cafil125_dat` | **W** | 2x |
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
| 1 | `{0,1}` | - |
| 2 | `{0,16}<>'F'` | - |
| 3 | `{0,16}='F'` | - |
| 4 | `{0,25}` | - |
| 5 | `{32768,1}` | - |
| 6 | `{0,23}<>'R'` | - |
| 7 | `{0,2}` | - |
| 8 | `{0,3}` | - |

> **Total**: 8 expressions (affichees: 8)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 16 |
| **Lignes logique** | 381 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N295[295 Menu change ]
    T[294 Bi  Change G]
    M --> N
    N --> N
    N --> N
    N --> T
    style M fill:#8b5cf6,color:#fff
    style N295 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 295 | Menu change bilateral | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[294 Programme]
    C43[43 Recuperation]
    T --> C43
    C44[44 Appel progra]
    T --> C44
    C47[47 DateHeure se]
    T --> C47
    C153[153 Calcul du st]
    T --> C153
    C179[179 Get Printer]
    T --> C179
    C180[180 Printer choi]
    T --> C180
    C181[181 Set Listing ]
    T --> C181
    C182[182 Raz Current ]
    T --> C182
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C44 fill:#3fb950
    style C47 fill:#3fb950
    style C153 fill:#3fb950
    style C179 fill:#3fb950
    style C180 fill:#3fb950
    style C181 fill:#3fb950
    style C182 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 4 |
| 1 | 44 | Appel programme | 1 |
| 1 | 47 | Date/Heure session user | 1 |
| 1 | 153 | Calcul du stock devise | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 180 | Printer choice | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 291 | Print reçu change vente | 1 |
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
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (8 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
