# ADH IDE 211 - Programme supprime (Prg_210)

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
| **Quoi** | Programme supprime (Prg_210) |
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
| **Format IDE** | ADH IDE 211 |
| **Description** | Programme supprime (Prg_210) |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | R | 1x |
| 53 | ligne_telephone__lgn | `cafil031_dat` | **W** | 1x |
| 68 | compteurs________cpt | `cafil046_dat` | **W** | 1x |
| 75 | commande_autocom_cot | `cafil053_dat` | **W** | 1x |
| 80 | codes_autocom____aut | `cafil058_dat` | **W** | 1x |
| 87 | sda_telephone____sda | `cafil065_dat` | L | 1x |
| 87 | sda_telephone____sda | `cafil065_dat` | **W** | 1x |
| 88 | historik_station | `cafil066_dat` | **W** | 1x |
| 136 | fichier_echanges | `cafil114_dat` | **W** | 2x |
| 151 | nb_code__poste | `cafil129_dat` | **W** | 1x |
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
| 2 | `{0,9}='O'` | - |
| 3 | `'F'` | - |
| 4 | `{0,10}='F'` | - |

> **Total**: 4 expressions (affichees: 4)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 13 |
| **Lignes logique** | 173 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    N204[204 Mise en oppo]
    N217[217 Menu telepho]
    N1[1 Main Program]
    N163[163 Menu caisse ]
    T[211 Opposition c]
    N204 --> N217
    N217 --> N1
    N1 --> N163
    N163 --> T
    style M fill:#8b5cf6,color:#fff
    style N204 fill:#f59e0b
    style N217 fill:#f59e0b
    style N1 fill:#f59e0b
    style N163 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 204 | Mise en opposition autocom | 1 |
| 217 | Menu telephone | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[211 Programme]
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
| 2026-01-27 20:23 | **DATA V2** - Tables reelles, Expressions, Stats, CallChain | Script |
| 2026-01-27 19:49 | **DATA POPULATED** - Tables, Callgraph (4 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
