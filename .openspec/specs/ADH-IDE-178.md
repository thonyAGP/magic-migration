# ADH IDE 178 - Set Village Address

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
| **Quoi** | Set Village Address |
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
| **Format IDE** | ADH IDE 178 |
| **Description** | Set Village Address |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 372 | pv_budget | `pv_budget_dat` | R | 1x |
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
| 1 | `SetParam ('VI_CLUB',{0,2})` | - |
| 2 | `SetParam ('VI_NAME',{0,3})` | - |
| 3 | `SetParam ('VI_ADR1',{0,4})` | - |
| 4 | `SetParam ('VI_ADR2',{0,5})` | - |
| 5 | `SetParam ('VI_ZIPC',Trim({0,6}))` | - |
| 6 | `SetParam ('VI_PHON',Trim({0,7}))` | - |
| 7 | `SetParam ('VI_FAXN',Trim({0,8}))` | - |
| 8 | `SetParam ('VI_MAIL',Trim({0,9}))` | - |
| 9 | `SetParam ('VI_SIRE',Trim({0,10}))` | - |
| 10 | `SetParam ('VI_VATN',Trim({0,11}))` | - |

> **Total**: 10 expressions (affichees: 10)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 30 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N283[283 Easy Check O]
    N66[66 Lancement So]
    N55[55 Easy Check O]
    N37[37 Menu changem]
    N163[163 Menu caisse ]
    T[178 Set Village ]
    M --> N283
    N283 --> N66
    N66 --> N55
    N55 --> N37
    N37 --> N163
    N163 --> T
    style M fill:#8b5cf6,color:#fff
    style N283 fill:#f59e0b
    style N66 fill:#f59e0b
    style N55 fill:#f59e0b
    style N37 fill:#f59e0b
    style N163 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 53 | Extrait Easy Check Out à J+1 | 1 |
| 179 | Get Printer | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[178 Programme]
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
| 2026-01-27 20:22 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (10 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
