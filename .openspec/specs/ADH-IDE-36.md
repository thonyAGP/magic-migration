# ADH IDE 36 - Print Separation ou fusion

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
| **Quoi** | Print Separation ou fusion |
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
| **Format IDE** | ADH IDE 36 |
| **Description** | Print Separation ou fusion |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 31 | gm-complet_______gmc | `cafil009_dat` | R | 1x |
| 40 | comptable________cte | `cafil018_dat` | R | 10x |
| 70 | date_comptable___dat | `cafil048_dat` | L | 1x |
| 343 | histo_fusionseparation_saisie | `histo_fus_sep_saisie` | R | 11x |
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
| 4 | `Date ()` | - |
| 5 | `Time ()` | - |
| 6 | `{0,2}` | - |
| 7 | `{0,3}` | - |
| 8 | `SetCrsr (2)` | - |
| 9 | `SetCrsr (1)` | - |
| 10 | `GetParam ('CURRENTPRINTERNUM')=1` | - |
| 11 | `GetParam ('CURRENTPRINTERNUM')=4` | - |
| 12 | `GetParam ('CURRENTPRINTERNUM')=6` | - |
| 13 | `GetParam ('CURRENTPRINTERNUM')=8` | - |
| 14 | `GetParam ('CURRENTPRINTERNUM')=9` | - |
| 15 | `'TRUE'LOG` | - |

> **Total**: 15 expressions (affichees: 15)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 27 |
| **Lignes logique** | 426 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N27[27 Separation]
    N28[28 Fusion]
    N37[37 Menu changem]
    N1[1 Main Program]
    N163[163 Menu caisse ]
    T[36 Print Separa]
    N27 --> N28
    N28 --> N37
    N37 --> N1
    N1 --> N163
    N163 --> T
    style M fill:#8b5cf6,color:#fff
    style N27 fill:#f59e0b
    style N28 fill:#f59e0b
    style N37 fill:#f59e0b
    style N1 fill:#f59e0b
    style N163 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 27 | Separation | 1 |
| 28 | Fusion | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[36 Programme]
    C182[182 Raz Current ]
    T --> C182
    style T fill:#58a6ff,color:#000
    style C182 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
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
| 2026-01-27 19:44 | **DATA POPULATED** - Tables, Callgraph (15 expr) | Script |
| 2026-01-27 17:56 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
