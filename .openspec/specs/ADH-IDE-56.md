# ADH IDE 56 - Récap Trait Easy Check-Out

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
| **Quoi** | Récap Trait Easy Check-Out |
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
| **Format IDE** | ADH IDE 56 |
| **Description** | Récap Trait Easy Check-Out |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 34 | hebergement______heb | `cafil012_dat` | R | 2x |
| 39 | depot_garantie___dga | `cafil017_dat` | L | 2x |
| 47 | compte_gm________cgm | `cafil025_dat` | L | 2x |
| 48 | lignes_de_solde__sld | `cafil026_dat` | L | 2x |
| 372 | pv_budget | `pv_budget_dat` | L | 1x |
| 934 | selection enregistrement diver | `selection_enregistrement_div` | L | 2x |
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
| 1 | `'Quitter'` | - |
| 2 | `'Imprimer'` | - |
| 3 | `Date()` | - |
| 4 | `'C'` | - |
| 5 | `{0,2}` | - |
| 6 | `{0,3}` | - |
| 7 | `'Z'` | - |
| 8 | `IF({0,11}<>0,179,174)` | - |
| 9 | `NOT {0,6}` | - |
| 10 | `{0,29}` | - |
| 11 | `{0,30}=6` | - |
| 12 | `{32768,22}` | - |
| 13 | `'FALSE'LOG` | - |

> **Total**: 13 expressions (affichees: 13)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 2 |
| **Lignes logique** | 103 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N55[55 Easy Check O]
    N63[63 Test Easy Ch]
    N283[283 Easy Check O]
    N313[313 Easy Check O]
    T[56 Rcap Trait E]
    M --> N55
    N55 --> N63
    N63 --> N283
    N283 --> N313
    N313 --> T
    style M fill:#8b5cf6,color:#fff
    style N55 fill:#f59e0b
    style N63 fill:#f59e0b
    style N283 fill:#f59e0b
    style N313 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 55 | Easy Check-Out === V2.00 | 1 |
| 63 | Test Easy Check-Out Online | 1 |
| 283 | Easy Check-Out === V2.00 | 1 |
| 313 | Easy Check-Out === V2.00 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[56 Programme]
    C65[65 Edition  Mai]
    T --> C65
    style T fill:#58a6ff,color:#000
    style C65 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 65 | Edition & Mail Easy Check Out | 1 |
### 3.4 Verification orphelin

| Critere | Resultat |
|---------|----------|
| Callers actifs | A verifier |
| **Conclusion** | A analyser |

---

## HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 20:19 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:45 | **DATA POPULATED** - Tables, Callgraph (13 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
