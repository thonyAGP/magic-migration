# ADH IDE 251 - Creation pied Ticket

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
| **Quoi** | Creation pied Ticket |
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
| **Format IDE** | ADH IDE 251 |
| **Description** | Creation pied Ticket |
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
| 1 | `Val(Fill ('9',10),'10')` | - |
| 2 | `{0,4}` | - |
| 3 | `{0,14}+{0,5}` | - |
| 4 | `{0,15}+{0,6}` | - |
| 5 | `{0,16}+{0,7}` | - |
| 6 | `999` | - |
| 7 | `{0,23}+{0,5}` | - |
| 8 | `{0,24}+{0,6}` | - |
| 9 | `{0,25}+{0,7}` | - |
| 10 | `'C'` | - |
| 11 | `'TICK'` | - |
| 12 | `{0,2}` | - |
| 13 | `0` | - |

> **Total**: 13 expressions (affichees: 13)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 50 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N318[318 Historique d]
    N316[316 Saisie trans]
    N233[233 Appel Print ]
    N310[310 Saisie trans]
    N307[307 Saisie trans]
    T[251 Creation pie]
    M --> N318
    N318 --> N316
    N316 --> N233
    N233 --> N310
    N310 --> N307
    N307 --> T
    style M fill:#8b5cf6,color:#fff
    style N318 fill:#f59e0b
    style N316 fill:#f59e0b
    style N233 fill:#f59e0b
    style N310 fill:#f59e0b
    style N307 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 234 |  Print ticket vente | 5 |
| 235 |  Print ticket vente LEX | 5 |
| 236 |  Print ticket vente PMS-584 | 5 |
| 285 |  Print ticket vente LEX | 5 |
| 323 |  Print ticket vente | 5 |
### 3.3 Callees

```mermaid
graph LR
    T[251 Programme]
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
| 2026-01-27 20:24 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:50 | **DATA POPULATED** - Tables, Callgraph (13 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
