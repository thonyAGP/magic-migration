# ADH IDE 22 - Calcul equivalent

> **Analyse**: Phases 1-4 2026-02-07 03:40 -> 03:41 (27s) | Assemblage 03:41
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 22 |
| Nom Programme | Calcul equivalent |
| Fichier source | `Prg_22.xml` |
| Dossier IDE | General |
| Taches | 1 (0 ecrans visibles) |
| Tables modifiees | 0 |
| Programmes appeles | 0 |

## 2. DESCRIPTION FONCTIONNELLE

**Calcul equivalent** assure la gestion complete de ce processus, accessible depuis [Print reçu change achat (IDE 23)](ADH-IDE-23.md), [Print reçu change vente (IDE 24)](ADH-IDE-24.md), [Tableau recap fermeture (IDE 154)](ADH-IDE-154.md).

Le flux de traitement s'organise en **1 blocs fonctionnels** :

- **Consultation** (1 tache) : ecrans de recherche, selection et consultation

## 3. BLOCS FONCTIONNELS

### 3.1 Consultation (1 tache)

Ecrans de recherche et consultation.

---

#### <a id="t1"></a>22 - Creation/Affichage change [[ECRAN]](#ecran-t1)

**Role** : Reinitialisation : Creation/Affichage change.
**Ecran** : 874 x 210 DLU (MDI) | [Voir mockup](#ecran-t1)


## 5. REGLES METIER

*(Aucune regle metier identifiee)*

## 6. CONTEXTE

- **Appele par**: [Print reçu change achat (IDE 23)](ADH-IDE-23.md), [Print reçu change vente (IDE 24)](ADH-IDE-24.md), [Tableau recap fermeture (IDE 154)](ADH-IDE-154.md)
- **Appelle**: 0 programmes | **Tables**: 2 (W:0 R:1 L:1) | **Taches**: 1 | **Expressions**: 16

<!-- TAB:Ecrans -->

## 8. ECRANS

*(Programme sans ecran visible)*

## 9. NAVIGATION

### 9.3 Structure hierarchique (1 tache)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **22.1** | [**Creation/Affichage change** (22)](#t1) [mockup](#ecran-t1) | MDI | 874x210 | Consultation |

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
| 50 | moyens_reglement_mor | Reglements / paiements | DB | R |   |   | 1 |
| 139 | moyens_reglement_mor | Reglements / paiements | DB |   |   | L | 1 |

### Colonnes par table (1 / 1 tables avec colonnes identifiees)

<details>
<summary>Table 50 - moyens_reglement_mor (R) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | > Societe | R | Alpha |
| B | > Uni/BI | R | Alpha |
| C | > devise locale | R | Alpha |
| D | > nombre de decimal | R | Numeric |
| E | > Devise | R | Alpha |
| F | < cdrt devise in | R | Logical |
| G | > mode de paiement | R | Alpha |
| H | > quantite | R | Numeric |
| I | < Equivalent | R | Numeric |
| J | > Type operation | R | Alpha |
| K | > Type de devise | R | Numeric |

</details>

## 11. VARIABLES

### 11.1 Autres (11)

Variables diverses.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | > Societe | Alpha | 1x refs |
| B | > Uni/BI | Alpha | 4x refs |
| C | > devise locale | Alpha | - |
| D | > nombre de decimal | Numeric | 3x refs |
| E | > Devise | Alpha | 1x refs |
| F | < cdrt devise in | Logical | - |
| G | > mode de paiement | Alpha | 1x refs |
| H | > quantite | Numeric | 3x refs |
| I | < Equivalent | Numeric | - |
| J | > Type operation | Alpha | 4x refs |
| K | > Type de devise | Numeric | 1x refs |

## 12. EXPRESSIONS

**16 / 16 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CONDITION | 13 | 0 |
| CONSTANTE | 2 | 0 |
| CAST_LOGIQUE | 1 | 0 |

### 12.2 Expressions cles par type

#### CONDITION (13 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 13 | `> Type operation [J]='A' AND > Uni/BI [B]='B'` | - |
| CONDITION | 12 | `> Type operation [J]='A' AND > Uni/BI [B]<>'B'` | - |
| CONDITION | 11 | `> Type de devise [K]` | - |
| CONDITION | 16 | `> Type operation [J]<>'A'` | - |
| CONDITION | 15 | `> Uni/BI [B]='B'` | - |
| ... | | *+8 autres* | |

#### CONSTANTE (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 6 | `'O'` | - |
| CONSTANTE | 4 | `''` | - |

#### CAST_LOGIQUE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 10 | `'FALSE'LOG` | - |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Print reçu change achat (IDE 23)](ADH-IDE-23.md) -> **Calcul equivalent (IDE 22)**

Main -> ... -> [Print reçu change vente (IDE 24)](ADH-IDE-24.md) -> **Calcul equivalent (IDE 22)**

Main -> ... -> [Tableau recap fermeture (IDE 154)](ADH-IDE-154.md) -> **Calcul equivalent (IDE 22)**

```mermaid
graph LR
    T22[22 Calcul equivalent]
    style T22 fill:#58a6ff
    CC163[163 Menu caisse GM - s...]
    style CC163 fill:#8b5cf6
    CC131[131 Fermeture caisse]
    style CC131 fill:#f59e0b
    CC193[193 Solde compte fin s...]
    style CC193 fill:#f59e0b
    CC299[299 Fermeture caisse 144]
    style CC299 fill:#f59e0b
    CC151[151 Reimpression ticke...]
    style CC151 fill:#f59e0b
    CC25[25 Change GM]
    style CC25 fill:#f59e0b
    CC174[174 VersementRetrait]
    style CC174 fill:#f59e0b
    CC23[23 Print reçu change a...]
    style CC23 fill:#3fb950
    CC24[24 Print reçu change v...]
    style CC24 fill:#3fb950
    CC154[154 Tableau recap ferm...]
    style CC154 fill:#3fb950
    CC25 --> CC23
    CC174 --> CC23
    CC193 --> CC23
    CC131 --> CC23
    CC151 --> CC23
    CC299 --> CC23
    CC25 --> CC24
    CC174 --> CC24
    CC193 --> CC24
    CC131 --> CC24
    CC151 --> CC24
    CC299 --> CC24
    CC25 --> CC154
    CC174 --> CC154
    CC193 --> CC154
    CC131 --> CC154
    CC151 --> CC154
    CC299 --> CC154
    CC163 --> CC25
    CC163 --> CC174
    CC163 --> CC193
    CC163 --> CC131
    CC163 --> CC151
    CC163 --> CC299
    CC23 --> T22
    CC24 --> T22
    CC154 --> T22
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [23](ADH-IDE-23.md) | Print reçu change achat | 7 |
| [24](ADH-IDE-24.md) | Print reçu change vente | 7 |
| [154](ADH-IDE-154.md) | Tableau recap fermeture | 6 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T22[22 Calcul equivalent]
    style T22 fill:#58a6ff
    NONE[Aucun callee]
    T22 -.-> NONE
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
| Lignes de logique | 34 | Programme compact |
| Expressions | 16 | Peu de logique |
| Tables WRITE | 0 | Impact faible |
| Sous-programmes | 0 | Peu de dependances |
| Ecrans visibles | 0 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 34) | Code sain |
| Regles metier | 0 | Pas de regle identifiee |

### 14.2 Plan de migration par bloc

#### Consultation (1 tache: 1 ecran, 0 traitement)

- **Strategie** : Composants de recherche/selection en modales.
- 1 ecran : Creation/Affichage change

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 03:41*
