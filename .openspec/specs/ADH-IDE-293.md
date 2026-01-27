# ADH IDE 293 - Programme supprime (Prg_290)

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
| **Quoi** | Programme supprime (Prg_290) |
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
| **Format IDE** | ADH IDE 293 |
| **Description** | Programme supprime (Prg_290) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 23 | reseau_cloture___rec | `cafil001_dat` | R | 1x |
| 23 | reseau_cloture___rec | `cafil001_dat` | **W** | 2x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 1x |
| 44 | change___________chg | `cafil022_dat` | R | 2x |
| 44 | change___________chg | `cafil022_dat` | **W** | 2x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 2x |
| 68 | compteurs________cpt | `cafil046_dat` | **W** | 1x |
| 70 | date_comptable___dat | `cafil048_dat` | R | 1x |
| 124 | type_taux_change | `cafil102_dat` | L | 1x |
| 124 | type_taux_change | `cafil102_dat` | R | 1x |
| 139 | moyens_reglement_mor | `cafil117_dat` | L | 2x |
| 139 | moyens_reglement_mor | `cafil117_dat` | R | 1x |
| 139 | moyens_reglement_mor | `cafil117_dat` | **W** | 1x |
| 141 | devises__________dev | `cafil119_dat` | R | 1x |
| 474 | comptage_caisse_devise | `%club_user%_caisse_compcais_devise` | L | 1x |
| 474 | comptage_caisse_devise | `%club_user%_caisse_compcais_devise` | **W** | 1x |
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
| 1 | `'C'` | - |
| 2 | `Trim ({0,27})` | - |
| 3 | `81` | - |
| 4 | `{0,1}` | - |
| 5 | `{0,16}<>'F'` | - |
| 6 | `{0,16}='F'` | - |
| 7 | `{0,25}` | - |
| 8 | `{32768,1}` | - |
| 9 | `{0,23}<>'R'` | - |

> **Total**: 9 expressions (affichees: 9)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 17 |
| **Lignes logique** | 377 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N295[295 Menu change ]
    T[293 Bi  Change G]
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
    T[293 Programme]
    C43[43 Recuperation]
    T --> C43
    C44[44 Appel progra]
    T --> C44
    C47[47 DateHeure se]
    T --> C47
    C179[179 Get Printer]
    T --> C179
    C180[180 Printer choi]
    T --> C180
    C181[181 Set Listing ]
    T --> C181
    C182[182 Raz Current ]
    T --> C182
    C290[290 Print reu ch]
    T --> C290
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C44 fill:#3fb950
    style C47 fill:#3fb950
    style C179 fill:#3fb950
    style C180 fill:#3fb950
    style C181 fill:#3fb950
    style C182 fill:#3fb950
    style C290 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 4 |
| 1 | 44 | Appel programme | 1 |
| 1 | 47 | Date/Heure session user | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 180 | Printer choice | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
| 1 | 290 | Print reçu change | 1 |
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
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (9 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
