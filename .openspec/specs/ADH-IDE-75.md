# ADH IDE 75 - Creation Pied Facture

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
| **Quoi** | Creation Pied Facture |
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
| **Format IDE** | ADH IDE 75 |
| **Description** | Creation Pied Facture |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 867 | log_maj_tpe | `log_maj_tpe` | **W** | 1x |
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
| 1 | `Val(Fill('9',10),'10')` | - |
| 2 | `{0,4}` | - |
| 3 | `999` | - |
| 4 | `{0,12}+({0,5}/(1+{0,4}/100))` | - |
| 5 | `{0,21}+({0,5}/(1+{0,4}/100))` | - |
| 6 | `{0,13}+Round(({0,5}/(1+{0,4}/100)*{0,4}/100),12,2)` | - |
| 7 | `{0,22}+Round(({0,5}/(1+{0,4}/100)*{0,4}/100),12,2)` | - |
| 8 | `{0,14}+{0,5}` | - |
| 9 | `{0,23}+{0,5}` | - |
| 10 | `{0,1}` | - |
| 11 | `{0,2}` | - |
| 12 | `{0,3}` | - |

> **Total**: 12 expressions (affichees: 12)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 39 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N0[0 Print extrai]
    N287[287 Solde Easy C]
    N69[69 Extrait de c]
    N64[64 Solde Easy C]
    N53[53 Extrait Easy]
    T[75 Creation Pie]
    M --> N0
    N0 --> N287
    N287 --> N69
    N69 --> N64
    N64 --> N53
    N53 --> T
    style M fill:#8b5cf6,color:#fff
    style N0 fill:#f59e0b
    style N287 fill:#f59e0b
    style N69 fill:#f59e0b
    style N64 fill:#f59e0b
    style N53 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 73 | Print extrait compte /Imp | 6 |
| 74 | Print extrait DateImp /O | 6 |
| 71 | Print extrait compte /Date | 5 |
| 72 | Print extrait compte /Cum | 5 |
| 70 | Print extrait compte /Nom | 4 |
| 76 | Print extrait compte /Service | 4 |
### 3.3 Callees

```mermaid
graph LR
    T[75 Programme]
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
| 2026-01-27 19:45 | **DATA POPULATED** - Tables, Callgraph (12 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
