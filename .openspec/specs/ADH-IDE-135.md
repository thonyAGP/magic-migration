# ADH IDE 135 - Generation tableau recap WS

> **Analyse**: Phases 1-4 2026-02-07 07:10 -> 07:10 (15s) | Assemblage 07:10
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 135 |
| Nom Programme | Generation tableau recap WS |
| Fichier source | `Prg_135.xml` |
| Dossier IDE | Gestion |
| Taches | 1 (0 ecrans visibles) |
| Tables modifiees | 0 |
| Programmes appeles | 0 |
| :warning: Statut | **ORPHELIN_POTENTIEL** |

## 2. DESCRIPTION FONCTIONNELLE

**Generation tableau recap WS** assure la gestion complete de ce processus.

## 3. BLOCS FONCTIONNELS

## 5. REGLES METIER

*(Aucune regle metier identifiee)*

## 6. CONTEXTE

- **Appele par**: (aucun)
- **Appelle**: 0 programmes | **Tables**: 2 (W:0 R:1 L:1) | **Taches**: 1 | **Expressions**: 30

<!-- TAB:Ecrans -->

## 8. ECRANS

*(Programme sans ecran visible)*

## 9. NAVIGATION

### 9.3 Structure hierarchique (0 tache)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|

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
| 510 | pv_discounts |  | TMP |   |   | L | 1 |
| 693 | devise_in | Devises / taux de change | DB | R |   |   | 1 |

### Colonnes par table (1 / 1 tables avec colonnes identifiees)

<details>
<summary>Table 693 - devise_in (R) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | Param date comptable | R | Date |
| B | Param numero session | R | Numeric |
| C | Param type | R | Alpha |
| D | Param type appro_vers_coffre | R | Alpha |
| E | Param mode de paiement | R | Alpha |
| F | Param avec change | R | Alpha |
| G | Param code devise | R | Alpha |
| H | Param quantite devise | R | Numeric |
| I | Param taux devise | R | Numeric |
| J | Param montant | R | Numeric |
| K | Param montant monnaie | R | Numeric |
| L | Param montant produits | R | Numeric |
| M | Param montant cartes | R | Numeric |
| N | Param montant chèque | R | Numeric |
| O | Param montant od | R | Numeric |
| P | Param societe | R | Alpha |
| Q | Param compte village | R | Numeric |
| R | Param filiation | R | Numeric |
| S | Param imputation | R | Numeric |
| T | Param sous imputation | R | Numeric |
| U | Param libelle | R | Alpha |
| V | Param libelle complementaire | R | Alpha |
| W | Param nom GM | R | Alpha |
| X | Param quantite article | R | Numeric |
| Y | Param prix article | R | Numeric |

</details>

## 11. VARIABLES

### 11.1 Autres (25)

Variables diverses.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | Param date comptable | Date | 1x refs |
| B | Param numero session | Numeric | 1x refs |
| C | Param type | Alpha | 2x refs |
| D | Param type appro_vers_coffre | Alpha | - |
| E | Param mode de paiement | Alpha | 1x refs |
| F | Param avec change | Alpha | 1x refs |
| G | Param code devise | Alpha | 1x refs |
| H | Param quantite devise | Numeric | 1x refs |
| I | Param taux devise | Numeric | 1x refs |
| J | Param montant | Numeric | 6x refs |
| K | Param montant monnaie | Numeric | 1x refs |
| L | Param montant produits | Numeric | 1x refs |
| M | Param montant cartes | Numeric | 1x refs |
| N | Param montant chèque | Numeric | 1x refs |
| O | Param montant od | Numeric | 1x refs |
| P | Param societe | Alpha | 1x refs |
| Q | Param compte village | Numeric | 1x refs |
| R | Param filiation | Numeric | 1x refs |
| S | Param imputation | Numeric | 1x refs |
| T | Param sous imputation | Numeric | 1x refs |
| U | Param libelle | Alpha | 2x refs |
| V | Param libelle complementaire | Alpha | - |
| W | Param nom GM | Alpha | 1x refs |
| X | Param quantite article | Numeric | 1x refs |
| Y | Param prix article | Numeric | 1x refs |

<details>
<summary>Toutes les 25 variables (liste complete)</summary>

| Cat | Lettre | Nom Variable | Type |
|-----|--------|--------------|------|
| Autre | **A** | Param date comptable | Date |
| Autre | **B** | Param numero session | Numeric |
| Autre | **C** | Param type | Alpha |
| Autre | **D** | Param type appro_vers_coffre | Alpha |
| Autre | **E** | Param mode de paiement | Alpha |
| Autre | **F** | Param avec change | Alpha |
| Autre | **G** | Param code devise | Alpha |
| Autre | **H** | Param quantite devise | Numeric |
| Autre | **I** | Param taux devise | Numeric |
| Autre | **J** | Param montant | Numeric |
| Autre | **K** | Param montant monnaie | Numeric |
| Autre | **L** | Param montant produits | Numeric |
| Autre | **M** | Param montant cartes | Numeric |
| Autre | **N** | Param montant chèque | Numeric |
| Autre | **O** | Param montant od | Numeric |
| Autre | **P** | Param societe | Alpha |
| Autre | **Q** | Param compte village | Numeric |
| Autre | **R** | Param filiation | Numeric |
| Autre | **S** | Param imputation | Numeric |
| Autre | **T** | Param sous imputation | Numeric |
| Autre | **U** | Param libelle | Alpha |
| Autre | **V** | Param libelle complementaire | Alpha |
| Autre | **W** | Param nom GM | Alpha |
| Autre | **X** | Param quantite article | Numeric |
| Autre | **Y** | Param prix article | Numeric |

</details>

## 12. EXPRESSIONS

**30 / 30 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CALCULATION | 1 | 0 |
| CONSTANTE | 2 | 0 |
| REFERENCE_VG | 1 | 0 |
| OTHER | 26 | 0 |

### 12.2 Expressions cles par type

#### CALCULATION (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CALCULATION | 1 | `[AA]+1` | - |

#### CONSTANTE (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 4 | `'T'` | - |
| CONSTANTE | 3 | `'FRA'` | - |

#### REFERENCE_VG (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| REFERENCE_VG | 2 | `VG1` | - |

#### OTHER (26 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 21 | `Param societe [P]` | - |
| OTHER | 22 | `Param compte village [Q]` | - |
| OTHER | 23 | `Param filiation [R]` | - |
| OTHER | 18 | `Param montant cartes [M]` | - |
| OTHER | 19 | `Param montant chèque [N]` | - |
| ... | | *+21 autres* | |

### 12.3 Toutes les expressions (30)

<details>
<summary>Voir les 30 expressions</summary>

#### CALCULATION (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 1 | `[AA]+1` |

#### CONSTANTE (2)

| IDE | Expression Decodee |
|-----|-------------------|
| 3 | `'FRA'` |
| 4 | `'T'` |

#### REFERENCE_VG (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 2 | `VG1` |

#### OTHER (26)

| IDE | Expression Decodee |
|-----|-------------------|
| 5 | `Param date comptable [A]` |
| 6 | `Param numero session [B]` |
| 7 | `Param type [C]` |
| 8 | `[BG]` |
| 9 | `Param type appro_vers_... [D]` |
| 10 | `Param mode de paiement [E]` |
| 11 | `Param avec change [F]` |
| 12 | `Param code devise [G]` |
| 13 | `Param quantite devise [H]` |
| 14 | `Param taux devise [I]` |
| 15 | `Param montant [J]` |
| 16 | `Param montant monnaie [K]` |
| 17 | `Param montant produits [L]` |
| 18 | `Param montant cartes [M]` |
| 19 | `Param montant chèque [N]` |
| 20 | `Param montant od [O]` |
| 21 | `Param societe [P]` |
| 22 | `Param compte village [Q]` |
| 23 | `Param filiation [R]` |
| 24 | `Param imputation [S]` |
| 25 | `Param sous imputation [T]` |
| 26 | `Param libelle [U]` |
| 27 | `Param libelle compleme... [V]` |
| 28 | `Param nom GM [W]` |
| 29 | `Param quantite article [X]` |
| 30 | `Param prix article [Y]` |

</details>

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

**Chemin**: (pas de callers directs)

```mermaid
graph LR
    T135[135 Generation tableau...]
    style T135 fill:#58a6ff
    NONE[Aucun caller]
    NONE -.-> T135
    style NONE fill:#6b7280,stroke-dasharray: 5 5
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| - | (aucun) | - |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T135[135 Generation tableau...]
    style T135 fill:#58a6ff
    NONE[Aucun callee]
    T135 -.-> NONE
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
| Lignes de logique | 98 | Programme compact |
| Expressions | 30 | Peu de logique |
| Tables WRITE | 0 | Impact faible |
| Sous-programmes | 0 | Peu de dependances |
| Ecrans visibles | 0 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 98) | Code sain |
| Regles metier | 0 | Pas de regle identifiee |

### 14.2 Plan de migration par bloc

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 07:10*
