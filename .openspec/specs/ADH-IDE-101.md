# ADH IDE 101 - Creation Pied Facture V3

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
| **Quoi** | Creation Pied Facture V3 |
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
| **Format IDE** | ADH IDE 101 |
| **Description** | Creation Pied Facture V3 |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 866 | maj_appli_tpe | `maj_appli_tpe` | R | 1x |
| 867 | log_maj_tpe | `log_maj_tpe` | L | 1x |
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
| 1 | `{0,1}` | - |
| 2 | `{0,4}` | - |
| 3 | `{0,24}` | - |
| 4 | `999` | - |
| 5 | `{0,2}` | - |
| 6 | `{0,3}` | - |
| 7 | `0` | - |
| 8 | `{0,38}+{0,25}` | - |
| 9 | `{0,47}+{0,25}` | - |
| 10 | `{0,39}+Round(({0,26}/(1+{0,24}/100)*{0,24}/100)...` | - |
| 11 | `{0,48}+Round(({0,26}/(1+{0,24}/100)*{0,24}/100)...` | - |
| 12 | `{0,40}+{0,26}` | - |
| 13 | `{0,49}+{0,26}` | - |
| 14 | `'O'` | - |
| 15 | `IsFirstRecordCycle(0)` | - |

> **Total**: 15 expressions (affichees: 15)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 2 |
| **Lignes logique** | 76 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N163[163 Menu caisse ]
    N190[190 Menu solde d]
    N193[193 Solde compte]
    N1[1 Main Program]
    N174[174 VersementRet]
    T[101 Creation Pie]
    N163 --> N190
    N190 --> N193
    N193 --> N1
    N1 --> N174
    N174 --> T
    style M fill:#8b5cf6,color:#fff
    style N163 fill:#f59e0b
    style N190 fill:#f59e0b
    style N193 fill:#f59e0b
    style N1 fill:#f59e0b
    style N174 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 97 | Factures (Tble Compta&Vent) V3 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[101 Programme]
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
| 2026-01-27 20:20 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:46 | **DATA POPULATED** - Tables, Callgraph (15 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
