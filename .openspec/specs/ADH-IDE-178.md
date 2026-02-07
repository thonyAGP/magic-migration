# ADH IDE 178 - Set Village Address

> **Analyse**: Phases 1-4 2026-02-07 03:52 -> 03:52 (27s) | Assemblage 03:52
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 178 |
| Nom Programme | Set Village Address |
| Fichier source | `Prg_178.xml` |
| Dossier IDE | General |
| Taches | 1 (0 ecrans visibles) |
| Tables modifiees | 0 |
| Programmes appeles | 0 |

## 2. DESCRIPTION FONCTIONNELLE

**Set Village Address** assure la gestion complete de ce processus, accessible depuis [Extrait Easy Check Out à J+1 (IDE 53)](ADH-IDE-53.md), [Get Printer (IDE 179)](ADH-IDE-179.md).

Le flux de traitement s'organise en **1 blocs fonctionnels** :

- **Traitement** (1 tache) : traitements metier divers

## 3. BLOCS FONCTIONNELS

### 3.1 Traitement (1 tache)

Traitements internes.

---

#### <a id="t1"></a>178 - Set Village Address

**Role** : Traitement : Set Village Address.


## 5. REGLES METIER

*(Aucune regle metier identifiee)*

## 6. CONTEXTE

- **Appele par**: [Extrait Easy Check Out à J+1 (IDE 53)](ADH-IDE-53.md), [Get Printer (IDE 179)](ADH-IDE-179.md)
- **Appelle**: 0 programmes | **Tables**: 1 (W:0 R:1 L:0) | **Taches**: 1 | **Expressions**: 10

<!-- TAB:Ecrans -->

## 8. ECRANS

*(Programme sans ecran visible)*

## 9. NAVIGATION

### 9.3 Structure hierarchique (1 tache)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **178.1** | [**Set Village Address** (178)](#t1) | MDI | - | Traitement |

### 9.4 Algorigramme

```mermaid
flowchart TD
    START([START])
    INIT[Init controles]
    SAISIE[Traitement principal]
    ENDOK([END OK])

    START --> INIT --> SAISIE
    SAISIE --> ENDOK

    style START fill:#3fb950,color:#000
    style ENDOK fill:#3fb950,color:#000
```

> **Legende**: Vert = START/END OK | Rouge = END KO | Bleu = Decisions
> *Algorigramme auto-genere. Utiliser `/algorigramme` pour une synthese metier detaillee.*

<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (1)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 372 | pv_budget |  | DB | R |   |   | 1 |

### Colonnes par table (0 / 1 tables avec colonnes identifiees)

<details>
<summary>Table 372 - pv_budget (R) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

## 11. VARIABLES

*(Programme sans variables locales mappees)*

## 12. EXPRESSIONS

**10 / 10 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| OTHER | 4 | 0 |
| STRING | 6 | 0 |

### 12.2 Expressions cles par type

#### OTHER (4 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 3 | `SetParam ('VI_ADR1',[D])` | - |
| OTHER | 4 | `SetParam ('VI_ADR2',[E])` | - |
| OTHER | 1 | `SetParam ('VI_CLUB',[B])` | - |
| OTHER | 2 | `SetParam ('VI_NAME',[C])` | - |

#### STRING (6 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| STRING | 8 | `SetParam ('VI_MAIL',Trim([I]))` | - |
| STRING | 9 | `SetParam ('VI_SIRE',Trim([J]))` | - |
| STRING | 10 | `SetParam ('VI_VATN',Trim([K]))` | - |
| STRING | 5 | `SetParam ('VI_ZIPC',Trim([F]))` | - |
| STRING | 6 | `SetParam ('VI_PHON',Trim([G]))` | - |
| ... | | *+1 autres* | |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Extrait Easy Check Out à J+1 (IDE 53)](ADH-IDE-53.md) -> **Set Village Address (IDE 178)**

Main -> ... -> [Get Printer (IDE 179)](ADH-IDE-179.md) -> **Set Village Address (IDE 178)**

```mermaid
graph LR
    T178[178 Set Village Address]
    style T178 fill:#58a6ff
    CC37[37 Menu changement compte]
    style CC37 fill:#8b5cf6
    CC163[163 Menu caisse GM - s...]
    style CC163 fill:#8b5cf6
    CC55[55 Easy Check-Out === ...]
    style CC55 fill:#8b5cf6
    CC283[283 Easy Check-Out ===...]
    style CC283 fill:#8b5cf6
    CC66[66 Lancement Solde ECO]
    style CC66 fill:#8b5cf6
    CC64[64 Solde Easy Check Out]
    style CC64 fill:#f59e0b
    CC27[27 Separation]
    style CC27 fill:#f59e0b
    CC25[25 Change GM]
    style CC25 fill:#f59e0b
    CC40[40 Comptes de depôt]
    style CC40 fill:#f59e0b
    CC28[28 Fusion]
    style CC28 fill:#f59e0b
    CC53[53 Extrait Easy Check ...]
    style CC53 fill:#3fb950
    CC179[179 Get Printer]
    style CC179 fill:#3fb950
    CC25 --> CC53
    CC27 --> CC53
    CC28 --> CC53
    CC40 --> CC53
    CC64 --> CC53
    CC25 --> CC179
    CC27 --> CC179
    CC28 --> CC179
    CC40 --> CC179
    CC64 --> CC179
    CC163 --> CC25
    CC37 --> CC25
    CC55 --> CC25
    CC66 --> CC25
    CC283 --> CC25
    CC163 --> CC27
    CC37 --> CC27
    CC55 --> CC27
    CC66 --> CC27
    CC283 --> CC27
    CC163 --> CC28
    CC37 --> CC28
    CC55 --> CC28
    CC66 --> CC28
    CC283 --> CC28
    CC163 --> CC40
    CC37 --> CC40
    CC55 --> CC40
    CC66 --> CC40
    CC283 --> CC40
    CC163 --> CC64
    CC37 --> CC64
    CC55 --> CC64
    CC66 --> CC64
    CC283 --> CC64
    CC53 --> T178
    CC179 --> T178
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [53](ADH-IDE-53.md) | Extrait Easy Check Out à J+1 | 1 |
| [179](ADH-IDE-179.md) | Get Printer | 1 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T178[178 Set Village Address]
    style T178 fill:#58a6ff
    NONE[Aucun callee]
    T178 -.-> NONE
    style NONE fill:#6b7280,stroke-dasharray: 5 5
```

### 13.4 Detail Callees avec contexte

| IDE | Nom Programme | Appels | Contexte |
|-----|---------------|--------|----------|
| - | (aucun) | - | - |

## 14. RECOMMANDATIONS MIGRATION

### 14.1 Profil du programme

| Metrique | Valeur | Impact migration |
|----------|--------|-----------------|
| Lignes de logique | 30 | Programme compact |
| Expressions | 10 | Peu de logique |
| Tables WRITE | 0 | Impact faible |
| Sous-programmes | 0 | Peu de dependances |
| Ecrans visibles | 0 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 30) | Code sain |
| Regles metier | 0 | Pas de regle identifiee |

### 14.2 Plan de migration par bloc

#### Traitement (1 tache: 0 ecran, 1 traitement)

- **Strategie** : 1 service(s) backend injectable(s) (Domain Services).
- Decomposer les taches en services unitaires testables.

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 03:52*
