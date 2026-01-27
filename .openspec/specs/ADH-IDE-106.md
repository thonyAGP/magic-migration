# ADH IDE 106 - Maj lignes saisies archive V3

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
| **Quoi** | Maj lignes saisies archive V3 |
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
| **Format IDE** | ADH IDE 106 |
| **Description** | Maj lignes saisies archive V3 |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 746 | projet | `version` | **W** | 1x |
| 866 | maj_appli_tpe | `maj_appli_tpe` | L | 1x |
| 870 | Rayons_Boutique | `rayons_boutique` | L | 1x |
| 871 | Activite | `activite` | L | 1x |
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
| 1 | `{0,29}=0` | - |
| 2 | `{0,39}=0` | - |
| 3 | `{0,4}` | - |
| 4 | `Date()` | - |
| 5 | `Time()` | - |
| 6 | `{0,5}` | - |
| 7 | `{0,1}` | - |
| 8 | `{0,2}` | - |
| 9 | `Date()` | - |
| 10 | `IF({0,3},'TRUE'LOG,'FALSE'LOG)` | - |
| 11 | `{0,13}` | - |
| 12 | `{0,27}` | - |
| 13 | `{0,34}` | - |
| 14 | `{0,13}` | - |
| 15 | `{0,21}` | - |
| 16 | `{0,16}=0 OR {0,29}=0` | - |
| 17 | `{0,6}` | - |
| 18 | `{0,7}` | - |

> **Total**: 18 expressions (affichees: 18)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 71 |
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
    T[106 Maj lignes s]
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
| 97 | Factures (Tble Compta&Vent) V3 | 2 |
### 3.3 Callees

```mermaid
graph LR
    T[106 Programme]
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
| 2026-01-27 19:46 | **DATA POPULATED** - Tables, Callgraph (18 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
