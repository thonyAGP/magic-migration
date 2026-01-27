# ADH IDE 59 - Facture - chargement boutique

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
| **Quoi** | Facture - chargement boutique |
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
| **Format IDE** | ADH IDE 59 |
| **Description** | Facture - chargement boutique |
| **Module** | ADH |

### 2.2 Tables

| # | Nom logique | Nom physique | Acces | Usage |
|---|-------------|--------------|-------|-------|
| 866 | maj_appli_tpe | `maj_appli_tpe` | R | 1x |
| 870 | Rayons_Boutique | `rayons_boutique` | L | 1x |
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
| 3 | `{0,8}` | - |
| 4 | `'R'` | - |
| 5 | `{0,35}` | - |
| 6 | `{0,36}` | - |
| 7 | `{0,33}` | - |
| 8 | `{0,25}` | - |
| 9 | `{0,37}` | - |
| 10 | `{0,38}` | - |
| 11 | `{0,39}` | - |
| 12 | `{0,40}` | - |
| 13 | `{0,41}` | - |
| 14 | `{0,42}` | - |
| 15 | `{0,43}` | - |
| 16 | `{0,44}` | - |
| 17 | `{0,24}` | - |
| 18 | `''` | - |
| 19 | `{0,8}` | - |
| 20 | `{0,21}` | - |

> **Total**: 29 expressions (affichees: 20)
### 2.6 Variables importantes



### 2.7 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Taches** | 1 |
| **Lignes logique** | 104 |
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
    T[59 Facture   ch]
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
### 3.3 Callees

```mermaid
graph LR
    T[59 Programme]
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
| 2026-01-27 19:45 | **DATA POPULATED** - Tables, Callgraph (29 expr) | Script |
| 2026-01-27 17:57 | **Upgrade V3.5** - TAB markers, Mermaid | Claude |

---

*Specification V3.5 - Format avec TAB markers et Mermaid*
