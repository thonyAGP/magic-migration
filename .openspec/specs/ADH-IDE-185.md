# ADH IDE 185 - Chained Listing Printer Choice

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
| **Quoi** | Chained Listing Printer Choice |
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
| **Format IDE** | ADH IDE 185 |
| **Description** | Chained Listing Printer Choice |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 581 | tempo_comptage_bateau | `%club_user%tempocomptageb_dat` | R | 1x |
| 581 | tempo_comptage_bateau | `%club_user%tempocomptageb_dat` | **W** | 1x |
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
| 1 | `Counter (0)>={0,1}` | - |
| 2 | `DbDel ('{581,4}'DSOURCE,'')` | - |
| 3 | `VarSet ('{0,7}'VAR,VarCurr ('{0,1}'VAR+Counter ...` | - |

> **Total**: 3 expressions (affichees: 3)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 3 |
| **Lignes logique** | 40 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N163[163 Menu caisse ]
    N190[190 Menu solde d]
    N0[0 Garantie sur]
    N1[1 Main Program]
    N77[77 Club Med Pas]
    T[185 Chained List]
    N163 --> N190
    N190 --> N0
    N0 --> N1
    N1 --> N77
    N77 --> T
    style M fill:#8b5cf6,color:#fff
    style N163 fill:#f59e0b
    style N190 fill:#f59e0b
    style N0 fill:#f59e0b
    style N1 fill:#f59e0b
    style N77 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 111 | Garantie sur compte | 4 |
| 112 | Garantie sur compte PMS-584 | 4 |
| 288 | Garantie sur compte | 4 |
| 193 | Solde compte fin sejour | 2 |
| 79 | Balance Credit de conso | 1 |
| 174 | Versement/Retrait | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[185 Programme]
    C180[180 Printer choi]
    T --> C180
    C181[181 Set Listing ]
    T --> C181
    style T fill:#58a6ff,color:#000
    style C180 fill:#3fb950
    style C181 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 180 | Printer choice | 1 |
| 1 | 181 | Set Listing Number | 1 |
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
| 2026-01-27 19:48 | **DATA POPULATED** - Tables, Callgraph (3 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
