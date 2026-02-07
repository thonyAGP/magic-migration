# ADH IDE 93 - Creation Pied Facture

> **Analyse**: Phases 1-4 2026-02-07 03:46 -> 03:47 (30s) | Assemblage 03:47
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 93 |
| Nom Programme | Creation Pied Facture |
| Fichier source | `Prg_93.xml` |
| Dossier IDE | Facturation |
| Taches | 1 (0 ecrans visibles) |
| Tables modifiees | 0 |
| Programmes appeles | 0 |

## 2. DESCRIPTION FONCTIONNELLE

**Creation Pied Facture** assure la gestion complete de ce processus, accessible depuis [Factures (Tble Compta&Vent (IDE 89)](ADH-IDE-89.md), [Factures_Check_Out (IDE 54)](ADH-IDE-54.md).

Le flux de traitement s'organise en **1 blocs fonctionnels** :

- **Creation** (1 tache) : insertion d'enregistrements en base (mouvements, prestations)

**Logique metier** : 1 regles identifiees couvrant conditions metier.

## 3. BLOCS FONCTIONNELS

### 3.1 Creation (1 tache)

Insertion de nouveaux enregistrements en base.

---

#### <a id="t1"></a>93 - Creation Pied Facture [[ECRAN]](#ecran-t1)

**Role** : Creation d'enregistrement : Creation Pied Facture.
**Ecran** : 586 x 0 DLU | [Voir mockup](#ecran-t1)


## 5. REGLES METIER

1 regles identifiees:

### Autres (1 regles)

#### <a id="rm-RM-001"></a>[RM-001] Condition toujours vraie (flag actif)

| Element | Detail |
|---------|--------|
| **Condition** | `VG77` |
| **Si vrai** | 'TRUE'LOG |
| **Si faux** | [AD]<>'R') |
| **Expression source** | Expression 14 : `IF(VG77,'TRUE'LOG,[AD]<>'R')` |
| **Exemple** | Si VG77 â†’ 'TRUE'LOG. Sinon â†’ [AD]<>'R') |

## 6. CONTEXTE

- **Appele par**: [Factures (Tble Compta&Vent (IDE 89)](ADH-IDE-89.md), [Factures_Check_Out (IDE 54)](ADH-IDE-54.md)
- **Appelle**: 0 programmes | **Tables**: 2 (W:0 R:1 L:1) | **Taches**: 1 | **Expressions**: 16

<!-- TAB:Ecrans -->

## 8. ECRANS

*(Programme sans ecran visible)*

## 9. NAVIGATION

### 9.3 Structure hierarchique (1 tache)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **93.1** | [**Creation Pied Facture** (93)](#t1) [mockup](#ecran-t1) | - | 586x0 | Creation |

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

### Tables utilisees (2)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 866 | maj_appli_tpe |  | DB | R |   |   | 1 |
| 867 | log_maj_tpe |  | DB |   |   | L | 1 |

### Colonnes par table (1 / 1 tables avec colonnes identifiees)

<details>
<summary>Table 866 - maj_appli_tpe (R) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | p.Societe | R | Unicode |
| B | p.Compte | R | Numeric |
| C | p.Filiation | R | Numeric |
| D | p.NumFac | R | Numeric |
| E | P.Flaguee | R | Logical |

</details>

## 11. VARIABLES

### 11.1 Parametres entrants (5)

Variables recues du programme appelant ([Factures (Tble Compta&Vent (IDE 89)](ADH-IDE-89.md)).

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | p.Societe | Unicode | 1x parametre entrant |
| B | p.Compte | Numeric | 1x parametre entrant |
| C | p.Filiation | Numeric | 1x parametre entrant |
| D | p.NumFac | Numeric | 1x parametre entrant |
| E | P.Flaguee | Logical | - |

## 12. EXPRESSIONS

**16 / 16 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CALCULATION | 4 | 0 |
| CALCUL | 2 | 0 |
| CAST_LOGIQUE | 1 | 5 |
| CONSTANTE | 2 | 0 |
| OTHER | 7 | 0 |

### 12.2 Expressions cles par type

#### CALCULATION (4 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CALCULATION | 12 | `[AN]+[Z]` | - |
| CALCULATION | 13 | `[AW]+[Z]` | - |
| CALCULATION | 8 | `[AL]+[Y]` | - |
| CALCULATION | 9 | `[AU]+[Y]` | - |

#### CALCUL (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CALCUL | 11 | `[AV]+Round(([Z]/(1+[X]/100)*[X]/100),12,2)` | - |
| CALCUL | 10 | `[AM]+Round(([Z]/(1+[X]/100)*[X]/100),12,2)` | - |

#### CAST_LOGIQUE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 14 | `IF(VG77,'TRUE'LOG,[AD]<>'R')` | [RM-001](#rm-RM-001) |

#### CONSTANTE (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 7 | `0` | - |
| CONSTANTE | 4 | `999` | - |

#### OTHER (7 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 6 | `p.Filiation [C]` | - |
| OTHER | 15 | `CndRange(VG53,'O')` | - |
| OTHER | 16 | `IsFirstRecordCycle(0)` | - |
| OTHER | 5 | `p.Compte [B]` | - |
| OTHER | 1 | `p.Societe [A]` | - |
| ... | | *+2 autres* | |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Factures (Tble Compta&Vent (IDE 89)](ADH-IDE-89.md) -> **Creation Pied Facture (IDE 93)**

Main -> ... -> [Factures_Check_Out (IDE 54)](ADH-IDE-54.md) -> **Creation Pied Facture (IDE 93)**

```mermaid
graph LR
    T93[93 Creation Pied Facture]
    style T93 fill:#58a6ff
    CC55[55 Easy Check-Out === ...]
    style CC55 fill:#8b5cf6
    CC66[66 Lancement Solde ECO]
    style CC66 fill:#8b5cf6
    CC287[287 Solde Easy Check Out]
    style CC287 fill:#f59e0b
    CC313[313 Easy Check-Out ===...]
    style CC313 fill:#f59e0b
    CC283[283 Easy Check-Out ===...]
    style CC283 fill:#f59e0b
    CC64[64 Solde Easy Check Out]
    style CC64 fill:#f59e0b
    CC280[280 Lanceur Facture]
    style CC280 fill:#f59e0b
    CC54[54 Factures_Check_Out]
    style CC54 fill:#3fb950
    CC89[89 Factures Tble Compt...]
    style CC89 fill:#3fb950
    CC64 --> CC54
    CC280 --> CC54
    CC283 --> CC54
    CC287 --> CC54
    CC313 --> CC54
    CC64 --> CC89
    CC280 --> CC89
    CC283 --> CC89
    CC287 --> CC89
    CC313 --> CC89
    CC55 --> CC64
    CC66 --> CC64
    CC55 --> CC280
    CC66 --> CC280
    CC55 --> CC283
    CC66 --> CC283
    CC55 --> CC287
    CC66 --> CC287
    CC55 --> CC313
    CC66 --> CC313
    CC54 --> T93
    CC89 --> T93
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [89](ADH-IDE-89.md) | Factures (Tble Compta&Vent | 3 |
| [54](ADH-IDE-54.md) | Factures_Check_Out | 2 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T93[93 Creation Pied Facture]
    style T93 fill:#58a6ff
    NONE[Aucun callee]
    T93 -.-> NONE
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
| Lignes de logique | 72 | Programme compact |
| Expressions | 16 | Peu de logique |
| Tables WRITE | 0 | Impact faible |
| Sous-programmes | 0 | Peu de dependances |
| Ecrans visibles | 0 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 72) | Code sain |
| Regles metier | 1 | Quelques regles a preserver |

### 14.2 Plan de migration par bloc

#### Creation (1 tache: 1 ecran, 0 traitement)

- **Strategie** : Repository pattern avec Entity Framework Core.
- Insertion via `IRepository<T>.CreateAsync()`

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 03:47*
