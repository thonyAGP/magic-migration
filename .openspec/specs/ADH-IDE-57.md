# ADH IDE 57 - Factures_Sejour

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
| **Quoi** | Factures_Sejour |
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
| **Format IDE** | ADH IDE 57 |
| **Description** | Factures_Sejour |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 30 | gm-recherche_____gmr | `cafil008_dat` | L | 1x |
| 40 | comptable________cte | `cafil018_dat` | L | 1x |
| 263 | vente | `caisse_vente` | L | 1x |
| 400 | pv_cust_rentals | `pv_rentals_dat` | L | 2x |
| 868 | Affectation_Gift_Pass | `affectation_gift_pass` | R | 1x |
| 868 | Affectation_Gift_Pass | `affectation_gift_pass` | **W** | 3x |
| 870 | Rayons_Boutique | `rayons_boutique` | **W** | 2x |
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
| 2 | `{0,2}` | - |
| 3 | `{0,3}` | - |
| 4 | `{0,8}` | - |
| 5 | `{0,9}` | - |
| 6 | `NOT({0,10})` | - |
| 7 | `DbDel('{870,4}'DSOURCE,'')` | - |

> **Total**: 7 expressions (affichees: 7)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 6 |
| **Lignes logique** | 252 |
| **Lignes desactivees** | 0 |
---

<!-- TAB:Cartographie -->

## CARTOGRAPHIE APPLICATIVE

### 3.1 Chaine d'appels depuis Main

```mermaid
graph LR
    M[1 Main]
    N190[190 Menu solde d]
    N163[163 Menu caisse ]
    N313[313 Easy Check O]
    N287[287 Solde Easy C]
    N193[193 Solde compte]
    T[57 FacturesSejo]
    M --> N190
    N190 --> N163
    N163 --> N313
    N313 --> N287
    N287 --> N193
    N193 --> T
    style M fill:#8b5cf6,color:#fff
    style N190 fill:#f59e0b
    style N163 fill:#f59e0b
    style N313 fill:#f59e0b
    style N287 fill:#f59e0b
    style N193 fill:#f59e0b
    style T fill:#58a6ff,color:#000
```
### 3.2 Callers directs

| IDE | Programme | Nb appels |
|-----|-----------|-----------|
| 54 | Factures_Check_Out | 1 |
| 89 | Factures (Tble Compta&Vent | 1 |
| 97 | Factures (Tble Compta&Vent) V3 | 1 |
| 280 | Lanceur Facture | 1 |
### 3.3 Callees

```mermaid
graph LR
    T[57 Programme]
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
| 2026-01-27 19:45 | **DATA POPULATED** - Tables, Callgraph (7 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
