# ADH IDE 21 - Recupere devise local

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
| **Quoi** | Recupere devise local |
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
| **Format IDE** | ADH IDE 21 |
| **Description** | Recupere devise local |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 69 | initialisation___ini | `cafil047_dat` | R | 1x |
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
| 1 | `{0,2}` | - |

> **Total**: 1 expressions (affichees: 1)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 5 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N287[287 Solde Easy C]
    N64[64 Solde Easy C]
    N7[7 Menu Data Ca]
    N53[53 Extrait Easy]
    N69[69 Extrait de c]
    T[21 Recupere dev]
    M --> N287
    N287 --> N64
    N64 --> N7
    N7 --> N53
    N53 --> N69
    N69 --> T
    style M fill:#8b5cf6,color:#fff
    style N287 fill:#f59e0b
    style N64 fill:#f59e0b
    style N7 fill:#f59e0b
    style N53 fill:#f59e0b
    style N69 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 0 | Print extrait compte /Service | 1 |
| 17 | Print C/O confirmation | 1 |
| 18 | Print extrait compte | 1 |
| 70 | Print extrait compte /Nom | 1 |
| 71 | Print extrait compte /Date | 1 |
| 72 | Print extrait compte /Cum | 1 |
| 73 | Print extrait compte /Imp | 1 |
| 74 | Print extrait DateImp /O | 1 |
| 76 | Print extrait compte /Service | 1 |
| 87 |     Print Plafonds alloués | 1 |
| 301 | Extrait Compte | 1 |
| 302 | Print extrait compte /Date | 1 |
| 303 | Print extrait compte /Cum | 1 |
| 304 | Print extrait compte /Imp | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[21 Programme]
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
| 2026-01-27 20:18 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:44 | **DATA POPULATED** - Tables, Callgraph (1 expr) | Script |
| 2026-01-27 17:56 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
