# ADH IDE 290 - Programme supprime (Prg_287)

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
| **Quoi** | Programme supprime (Prg_287) |
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
| **Format IDE** | ADH IDE 290 |
| **Description** | Programme supprime (Prg_287) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 5x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 2x |
| 44 | change___________chg | `cafil022_dat` | L | 2x |
| 44 | change___________chg | `cafil022_dat` | R | 6x |
| 122 | unilateral_bilateral | `cafil100_dat` | R | 1x |
| 324 | frais_change___fchg | `fraissurchange_dat` | L | 1x |
| 368 | pms_village | `pmsvillage` | L | 1x |
| 474 | comptage_caisse_devise | `%club_user%_caisse_compcais_devise` | L | 7x |
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
| 1 | `SetCrsr (2)` | - |
| 2 | `SetCrsr (1)` | - |
| 3 | `{0,1}` | - |
| 4 | `{0,2}` | - |
| 5 | `{0,4}` | - |
| 6 | `{0,5}` | - |
| 7 | `GetParam ('CURRENTPRINTERNUM')=1` | - |
| 8 | `GetParam ('CURRENTPRINTERNUM')=4` | - |
| 9 | `GetParam ('CURRENTPRINTERNUM')=5` | - |
| 10 | `GetParam ('CURRENTPRINTERNUM')=8` | - |
| 11 | `GetParam ('CURRENTPRINTERNUM')=9` | - |
| 12 | `{0,15}` | - |

> **Total**: 12 expressions (affichees: 12)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 14 |
| **Lignes logique** | 380 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N293[293 Bi  Change G]
    N0[0 Garantie sur]
    N295[295 Menu change ]
    T[290 Print reu ch]
    M --> N293
    N293 --> N0
    N0 --> N295
    N295 --> T
    style M fill:#8b5cf6,color:#fff
    style N293 fill:#f59e0b
    style N0 fill:#f59e0b
    style N295 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 0 | Garantie sur compte PMS-584 | 2 |
| 293 | Bi  Change GM Achat | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[290 Programme]
    C250[250 Lancement Ch]
    T --> C250
    C289[289 Calcul equiv]
    T --> C289
    style T fill:#58a6ff,color:#000
    style C250 fill:#3fb950
    style C289 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 250 | Lancement Choix Chambre | 7 |
| 1 | 289 | Calcul equivalent BI locale | 7 |
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
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (12 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
