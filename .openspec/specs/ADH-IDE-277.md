# ADH IDE 277 - Programme supprime (Prg_273)

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
| **Quoi** | Programme supprime (Prg_273) |
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
| **Format IDE** | ADH IDE 277 |
| **Description** | Programme supprime (Prg_273) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 1020 | Table_1020 | - | **W** | 1x |
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
| 1 | `{0,14}` | - |
| 2 | `{0,15}` | - |
| 3 | `'&Selectionner'` | - |
| 4 | `'&Quitter'` | - |
| 5 | `{0,3}` | - |
| 6 | `{0,1}` | - |
| 7 | `{0,4}` | - |
| 8 | `{0,5}` | - |
| 9 | `{0,2}` | - |
| 10 | `'TRUE'LOG` | - |
| 11 | `''` | - |
| 12 | `0` | - |
| 13 | `IF ({0,7},'TRUE'LOG,InStr ('VV1,VV2,VV3',Trim (...` | - |
| 14 | `{0,16}` | - |
| 15 | `StrBuild(MlsTrans('Aucun vol aller n''est défin...` | - |
| 16 | `StrBuild(MlsTrans('Aucun vol retour n''est défi...` | - |
| 17 | `{0,3}='A'` | - |
| 18 | `{0,3}='R'` | - |
| 19 | `NOT {0,20}` | - |
| 20 | `{0,8}` | - |

> **Total**: 20 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 46 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N316[316 Saisie trans]
    N0[0 Transaction ]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    N242[242 Menu Choix S]
    T[277 Selection Vo]
    N316 --> N0
    N0 --> N163
    N163 --> N1
    N1 --> N242
    N242 --> T
    style M fill:#8b5cf6,color:#fff
    style N316 fill:#f59e0b
    style N0 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style N242 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 237 | Transaction Nouv vente avec GP | 2 |
| 238 | Transaction Nouv vente PMS-584 | 2 |
| 239 | Transaction Nouv vente PMS-721 | 2 |
| 240 | Transaction Nouv vente PMS-710 | 2 |
| 0 | Transaction Nouv vente PMS-584 | 1 |
| 0 | Transaction Nouv vente PMS-710 | 1 |
| 0 | Transaction Nouv vente PMS-721 | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[277 Programme]
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
| 2026-01-27 20:25 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:51 | **DATA POPULATED** - Tables, Callgraph (20 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
