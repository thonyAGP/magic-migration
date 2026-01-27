# ADH IDE 7 - Menu Data Catching

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
| **Quoi** | Menu Data Catching |
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
| **Format IDE** | ADH IDE 7 |
| **Description** | Menu Data Catching |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 22 | address_data_catching | `cafil_address_ec` | R | 3x |
| 22 | address_data_catching | `cafil_address_ec` | **W** | 2x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 2x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 2x |
| 31 | gm-complet_______gmc | `cafil009_dat` | L | 2x |
| 31 | gm-complet_______gmc | `cafil009_dat` | R | 4x |
| 34 | hebergement______heb | `cafil012_dat` | L | 3x |
| 40 | comptable________cte | `cafil018_dat` | L | 1x |
| 40 | comptable________cte | `cafil018_dat` | R | 1x |
| 47 | compte_gm________cgm | `cafil025_dat` | L | 1x |
| 47 | compte_gm________cgm | `cafil025_dat` | R | 3x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 1x |
| 312 | ez_card | `ezcard` | **W** | 1x |
| 780 | log_affec_auto_detail | `log_affec_auto_detail` | R | 1x |
| 781 | log_affec_auto_entete | `log_affec_auto_entete` | L | 1x |
| 783 | vrl_hp | `vrl_hp` | L | 3x |
| 783 | vrl_hp | `vrl_hp` | R | 1x |
| 783 | vrl_hp | `vrl_hp` | **W** | 2x |
| 784 | type_repas_nenc_vill | `type_repas_nenc_vill` | L | 2x |
| 785 | effectif_quotidien | `effectif_quotidien` | L | 4x |
| 785 | effectif_quotidien | `effectif_quotidien` | **W** | 1x |
| 786 | qualite_avant_reprise | `qualite_avant_reprise` | R | 1x |
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
| 1 | `{32768,79}` | - |
| 2 | `SetParam ('LANGUAGE','ENG')` | - |
| 3 | `NOT ({0,1})` | - |
| 4 | `NOT ({0,3})` | - |
| 5 | `'FALSE'LOG` | - |

> **Total**: 5 expressions (affichees: 5)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 33 |
| **Lignes logique** | 1073 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    T[7 Menu Data Catching]
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
    T[7 Programme]
    C15[15 keyboard]
    T --> C15
    C5[5 Alimentation]
    T --> C5
    C8[8      Set Vil]
    T --> C8
    C9[9 System avail]
    T --> C9
    C10[10 Print list C]
    T --> C10
    C12[12 Catching sta]
    T --> C12
    C16[16 Browse   Cou]
    T --> C16
    C17[17 Print CO con]
    T --> C17
    style T fill:#58a6ff,color:#000
    style C15 fill:#3fb950
    style C5 fill:#3fb950
    style C8 fill:#3fb950
    style C9 fill:#3fb950
    style C10 fill:#3fb950
    style C12 fill:#3fb950
    style C16 fill:#3fb950
    style C17 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 15 | keyboard | 6 |
| 1 | 5 | Alimentation Combos NATION P | 1 |
| 1 | 8 |      Set Village info | 1 |
| 1 | 9 | System avail (top left corner | 1 |
| 1 | 10 | Print list Checkout (shift F9) | 1 |
| 1 | 12 | Catching stats | 1 |
| 1 | 16 | Browse - Countries iso | 1 |
| 1 | 17 | Print C/O confirmation | 1 |
| 1 | 18 | Print extrait compte | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:17 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:43 | **DATA POPULATED** - Tables, Callgraph (5 expr) | Script |
| 2026-01-27 17:56 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
