# ADH IDE 86 - Bar Limit

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
| **Quoi** | Bar Limit |
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
| **Format IDE** | ADH IDE 86 |
| **Description** | Bar Limit |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 19 | bl_detail | `bldetail` | L | 2x |
| 19 | bl_detail | `bldetail` | R | 5x |
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 312 | ez_card | `ezcard` | R | 2x |
| 312 | ez_card | `ezcard` | **W** | 2x |
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
| 1 | `''` | - |
| 2 | `Date ()` | - |
| 3 | `{32768,1}` | - |
| 4 | `{0,1}` | - |
| 5 | `{0,2}` | - |
| 6 | `{0,3}` | - |
| 7 | `40` | - |
| 8 | `'LISTEOPE'` | - |
| 9 | `{0,14}='A'` | - |
| 10 | `{0,14}='B'` | - |
| 11 | `{0,14}='C'` | - |

> **Total**: 11 expressions (affichees: 11)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 14 |
| **Lignes logique** | 177 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N77[77 Club Med Pas]
    N163[163 Menu caisse ]
    N1[1 Main Program]
    T[86 Bar Limit]
    N77 --> N163
    N163 --> N1
    N1 --> T
    style M fill:#8b5cf6,color:#fff
    style N77 fill:#f59e0b
    style N163 fill:#f59e0b
    style N1 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 77 | Club Med Pass menu | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[86 Programme]
    C44[44 Appel progra]
    T --> C44
    C87[87     Print Pl]
    T --> C87
    C179[179 Get Printer]
    T --> C179
    C180[180 Printer choi]
    T --> C180
    C181[181 Set Listing ]
    T --> C181
    C182[182 Raz Current ]
    T --> C182
    style T fill:#58a6ff,color:#000
    style C44 fill:#3fb950
    style C87 fill:#3fb950
    style C179 fill:#3fb950
    style C180 fill:#3fb950
    style C181 fill:#3fb950
    style C182 fill:#3fb950
```

| Niv | IDE | Programme | Nb appels |
|-----|-----|-----------|-----------|
| 1 | 44 | Appel programme | 1 |
| 1 | 87 |     Print Plafonds alloués | 1 |
| 1 | 179 | Get Printer | 1 |
| 1 | 180 | Printer choice | 1 |
| 1 | 181 | Set Listing Number | 1 |
| 1 | 182 | Raz Current Printer | 1 |
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
| 2026-01-27 19:45 | **DATA POPULATED** - Tables, Callgraph (11 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
