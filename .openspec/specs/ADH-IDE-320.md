# ADH IDE 320 - Programme supprime (Prg_317)

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
| **Quoi** | Programme supprime (Prg_317) |
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
| **Format IDE** | ADH IDE 320 |
| **Description** | Programme supprime (Prg_317) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 26 | comptes_speciaux_spc | `cafil004_dat` | R | 1x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 1x |
| 31 | gm-complet_______gmc | `cafil009_dat` | L | 1x |
| 34 | hebergement______heb | `cafil012_dat` | L | 1x |
| 38 | comptable_gratuite | `cafil016_dat` | L | 1x |
| 38 | comptable_gratuite | `cafil016_dat` | **W** | 1x |
| 40 | comptable________cte | `cafil018_dat` | L | 2x |
| 47 | compte_gm________cgm | `cafil025_dat` | **W** | 1x |
| 65 | comptes_recette__cre | `cafil043_dat` | L | 2x |
| 65 | comptes_recette__cre | `cafil043_dat` | R | 3x |
| 67 | tables___________tab | `cafil045_dat` | L | 1x |
| 68 | compteurs________cpt | `cafil046_dat` | **W** | 1x |
| 77 | articles_________art | `cafil055_dat` | L | 4x |
| 89 | moyen_paiement___mop | `cafil067_dat` | L | 2x |
| 263 | vente | `caisse_vente` | L | 2x |
| 264 | vente_gratuite | `caisse_vente_gratuite` | L | 2x |
| 268 | cc_total_par_type | `ccpartyp` | L | 1x |
| 271 | cc_total | `cctotal` | L | 1x |
| 596 | tempo_ecran_police | `%club_user%tmp_ecrpolice_dat` | L | 1x |
| 804 | valeur_credit_bar_defaut | `valeur_credit_bar_defaut` | L | 1x |
| 847 | stat_lieu_vente_date | `%club_user%_stat_lieu_vente_date` | L | 3x |
| 847 | stat_lieu_vente_date | `%club_user%_stat_lieu_vente_date` | R | 2x |
| 933 | taxe_add_vente | `taxe_add_vente` | L | 1x |
| 945 | Table_945 | - | L | 1x |
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
| 1 | `{0,26}='OD' AND NOT {0,48} AND NOT {0,58}` | - |
| 2 | `NOT ({0,58})` | - |
| 3 | `{0,58}` | - |
| 4 | `{0,26}='OD' AND NOT {0,48} AND {0,58}` | - |
| 5 | `{0,17}` | - |
| 6 | `'99'` | - |
| 7 | `{0,65}='VSL'` | - |
| 8 | `{0,13}` | - |
| 9 | `{0,14}` | - |
| 10 | `{0,15}` | - |
| 11 | `{0,28}` | - |
| 12 | `'A'` | - |
| 13 | `{32768,7} AND ({0,65}='VRL' OR {0,65}='VSL')` | - |
| 14 | `{0,22}<>0 OR {0,51}<>0` | - |
| 15 | `{0,14}` | - |
| 16 | `{0,26}` | - |
| 17 | `'TRUE'LOG` | - |
| 18 | `Trim({0,26})='OD' AND {0,2}='O' AND NOT {0,58}` | - |
| 19 | `IF(Trim({0,26})='OD','OD','')` | - |
| 20 | `{0,93}` | - |

> **Total**: 31 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 9 |
| **Lignes logique** | 707 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    T[320 Deversement Transaction SAV]
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
    T[320 Programme]
    NONE[Aucun callee]
    T -.-> NONE
    style T fill:#58a6ff,color:#000
    style NONE fill:#6b7280,stroke-dasharray: 5 5
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| - | - | Programme terminal | - |
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
| 2026-01-27 19:52 | **DATA POPULATED** - Tables, Callgraph (31 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
