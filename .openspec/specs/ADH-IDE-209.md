# ADH IDE 209 - Affectation code autocom

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
| **Quoi** | Affectation code autocom |
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
| **Format IDE** | ADH IDE 209 |
| **Description** | Affectation code autocom |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 3x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 34 | hebergement______heb | `cafil012_dat` | L | 4x |
| 34 | hebergement______heb | `cafil012_dat` | R | 1x |
| 34 | hebergement______heb | `cafil012_dat` | **W** | 1x |
| 52 | serie_ligne______slg | `cafil030_dat` | R | 1x |
| 52 | serie_ligne______slg | `cafil030_dat` | **W** | 1x |
| 53 | ligne_telephone__lgn | `cafil031_dat` | **W** | 4x |
| 68 | compteurs________cpt | `cafil046_dat` | **W** | 4x |
| 72 | generation_code_gen | `cafil050_dat` | **W** | 1x |
| 73 | serie_telephone__stl | `cafil051_dat` | R | 1x |
| 73 | serie_telephone__stl | `cafil051_dat` | **W** | 1x |
| 75 | commande_autocom_cot | `cafil053_dat` | **W** | 4x |
| 80 | codes_autocom____aut | `cafil058_dat` | R | 1x |
| 80 | codes_autocom____aut | `cafil058_dat` | **W** | 4x |
| 86 | serie_sda________ssd | `cafil064_dat` | R | 1x |
| 86 | serie_sda________ssd | `cafil064_dat` | **W** | 1x |
| 87 | sda_telephone____sda | `cafil065_dat` | L | 3x |
| 87 | sda_telephone____sda | `cafil065_dat` | **W** | 1x |
| 88 | historik_station | `cafil066_dat` | L | 1x |
| 104 | fichier_menage | `cafil082_dat` | R | 1x |
| 130 | fichier_langue | `cafil108_dat` | L | 1x |
| 131 | fichier_validation | `cafil109_dat` | L | 1x |
| 136 | fichier_echanges | `cafil114_dat` | **W** | 8x |
| 151 | nb_code__poste | `cafil129_dat` | **W** | 7x |
| 152 | parametres_pour_pabx | `cafil130_dat` | L | 1x |
| 152 | parametres_pour_pabx | `cafil130_dat` | R | 1x |
| 169 | salle_seminaire__sse | `cafil147_dat` | R | 2x |
| 188 | correspondance_sda | `cafil216_dat` | L | 1x |
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
| 1 | `({0,6}='3' OR {0,6}='1') AND {0,18}<>'O'` | - |
| 2 | `({0,6}='3' OR {0,6}='1') AND {0,18}='O'` | - |
| 3 | `'F'` | - |
| 4 | `{0,21}='F'` | - |
| 5 | `{0,21}<>'F'` | - |
| 6 | `{0,10}='O' AND ({0,6}='1' OR {0,6}='2')` | - |
| 7 | `{0,17}<>'O' AND ({0,6}='1' OR {0,6}='2')` | - |
| 8 | `GetParam ('CURRENTPRINTERNUM')<>0` | - |
| 9 | `'TRUE'LOG` | - |

> **Total**: 9 expressions (affichees: 9)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 57 |
| **Lignes logique** | 1079 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N217[217 Menu telepho]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    T[209 Affectation ]
    N217 --> N163
    N163 --> N1
    N1 --> T
    style M fill:#8b5cf6,color:#fff
    style N217 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 217 | Menu telephone | 2 |
### 3.3 Callees

```mermaid
graph LR
    T[209 Programme]
    C43[43 Recuperation]
    T --> C43
    C216[216 Suppression ]
    T --> C216
    C208[208 Print Reu co]
    T --> C208
    style T fill:#58a6ff,color:#000
    style C43 fill:#3fb950
    style C216 fill:#3fb950
    style C208 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 43 | Recuperation du titre | 2 |
| 1 | 216 | Suppression ligne blanche f30 | 2 |
| 1 | 208 | Print Reçu code autocom | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:23 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:49 | **DATA POPULATED** - Tables, Callgraph (9 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
