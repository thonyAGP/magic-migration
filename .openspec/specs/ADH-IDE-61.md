# ADH IDE 61 - Maj des lignes saisies

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
| **Quoi** | Maj des lignes saisies |
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
| **Format IDE** | ADH IDE 61 |
| **Description** | Maj des lignes saisies |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 40 | comptable________cte | `cafil018_dat` | **W** | 1x |
| 263 | vente | `caisse_vente` | L | 1x |
| 866 | maj_appli_tpe | `maj_appli_tpe` | L | 1x |
| 870 | Rayons_Boutique | `rayons_boutique` | L | 1x |
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
| 1 | `{0,25}=0` | - |
| 2 | `{0,34}=0` | - |
| 3 | `{0,4}` | - |
| 4 | `Date()` | - |
| 5 | `{0,5}` | - |
| 6 | `{0,1}` | - |
| 7 | `{0,2}` | - |
| 8 | `Date()` | - |
| 9 | `IF({0,3},'TRUE'LOG,'FALSE'LOG)` | - |
| 10 | `{0,11}` | - |
| 11 | `{0,23}` | - |
| 12 | `{0,29}` | - |
| 13 | `{0,11}` | - |
| 14 | `{0,19}` | - |

> **Total**: 14 expressions (affichees: 14)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 62 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N0[0 Transaction ]
    N0[0 Transaction ]
    N0[0 Transaction ]
    N66[66 Lancement So]
    N55[55 Easy Check O]
    T[61 Maj des lign]
    M --> N0
    N0 --> N0
    N0 --> N0
    N0 --> N66
    N66 --> N55
    N55 --> T
    style M fill:#8b5cf6,color:#fff
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style N0 fill:#f59e0b
    style N66 fill:#f59e0b
    style N55 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 89 | Factures (Tble Compta&Vent | 3 |
| 54 | Factures_Check_Out | 2 |
### 3.3 Callees

```mermaid
graph LR
    T[61 Programme]
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
| 2026-01-27 20:19 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:45 | **DATA POPULATED** - Tables, Callgraph (14 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
