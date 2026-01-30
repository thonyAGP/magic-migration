# ADH IDE 242 - Menu Choix Saisie/Annul vente

> **Analyse**: Phases 1-4 2026-01-30 09:43 -> 09:43 (8s) | Assemblage 09:43
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 242 |
| Nom Programme | Menu Choix Saisie/Annul vente |
| Fichier source | `Prg_242.xml` |
| Domaine metier | Ventes |
| Taches | 3 (1 ecrans visibles) |
| Tables modifiees | 1 |
| Programmes appeles | 10 |

## 2. DESCRIPTION FONCTIONNELLE

**Menu Choix Saisie/Annul vente** assure la gestion complete de ce processus, accessible depuis [Menu caisse GM - scroll (IDE 163)](ADH-IDE-163.md), [Transaction Nouv vente PMS-584 (IDE 0)](ADH-IDE-0.md), [Transaction Nouv vente PMS-710 (IDE 0)](ADH-IDE-0.md), [Transaction Nouv vente PMS-721 (IDE 0)](ADH-IDE-0.md).

Le flux de traitement s'organise en **2 blocs fonctionnels** :

- **Saisie** (2 taches) : ecrans de saisie utilisateur (formulaires, champs, donnees)
- **Traitement** (1 tache) : traitements metier divers

**Donnees modifiees** : 1 tables en ecriture (comptable_gratuite).

**Logique metier** : 1 regles identifiees couvrant conditions metier.

<details>
<summary>Detail : phases du traitement</summary>

#### Phase 1 : Saisie (2 taches)

- **T1** - Saisie/Annulation vente **[ECRAN]**
- **T2** - Existe vente gratuite ou IGR ?

Delegue a : [Transaction Nouv vente avec GP (IDE 237)](ADH-IDE-237.md), [Transaction Nouv vente PMS-584 (IDE 238)](ADH-IDE-238.md), [Transaction Nouv vente PMS-721 (IDE 239)](ADH-IDE-239.md), [Transaction Nouv vente PMS-710 (IDE 240)](ADH-IDE-240.md), [Histo ventes payantes (IDE 243)](ADH-IDE-243.md), [Histo ventes payantes /PMS-605 (IDE 244)](ADH-IDE-244.md), [Histo ventes payantes /PMS-623 (IDE 245)](ADH-IDE-245.md), [Histo ventes IGR (IDE 252)](ADH-IDE-252.md), [Histo ventes Gratuités (IDE 253)](ADH-IDE-253.md)

#### Phase 2 : Traitement (1 tache)

- **T3** - (sans nom)

Delegue a : [Appel programme (IDE 44)](ADH-IDE-44.md)

#### Tables impactees

| Table | Operations | Role metier |
|-------|-----------|-------------|
| comptable_gratuite | R/**W** (2 usages) |  |

</details>

## 3. BLOCS FONCTIONNELS

### 3.1 Saisie (2 taches)

L'operateur saisit les donnees de la transaction via 1 ecran (Saisie/Annulation vente).

---

#### <a id="t1"></a>T1 - Saisie/Annulation vente [ECRAN]

**Role** : Ecran de saisie pour la transaction.
**Ecran** : 600 x 143 DLU (MDI) | [Voir mockup](#ecran-t1)
**Delegue a** : [Transaction Nouv vente avec GP (IDE 237)](ADH-IDE-237.md), [Transaction Nouv vente PMS-584 (IDE 238)](ADH-IDE-238.md), [Transaction Nouv vente PMS-721 (IDE 239)](ADH-IDE-239.md)

---

#### <a id="t2"></a>T2 - Existe vente gratuite ou IGR ?

**Role** : Ecran de saisie pour la transaction.
**Delegue a** : [Transaction Nouv vente avec GP (IDE 237)](ADH-IDE-237.md), [Transaction Nouv vente PMS-584 (IDE 238)](ADH-IDE-238.md), [Transaction Nouv vente PMS-721 (IDE 239)](ADH-IDE-239.md)


### 3.2 Traitement (1 tache)

Traitements internes.

---

#### <a id="t3"></a>T3 - (sans nom)

**Role** : Traitement interne.
**Delegue a** : [Appel programme (IDE 44)](ADH-IDE-44.md)


## 5. REGLES METIER

1 regles identifiees:

### Saisie (1 regles)

#### <a id="rm-RM-001"></a>[RM-001] Traitement si Trim(VG115) est renseigne

| Element | Detail |
|---------|--------|
| **Condition** | `IF(Trim(VG115)<>'',Trim(VG115)&'|','')&'VENTE'` |
| **Action** | Traitement si Trim(VG115) est renseigne |

## 6. CONTEXTE

- **Appele par**: [Menu caisse GM - scroll (IDE 163)](ADH-IDE-163.md), [Transaction Nouv vente PMS-584 (IDE 0)](ADH-IDE-0.md), [Transaction Nouv vente PMS-710 (IDE 0)](ADH-IDE-0.md), [Transaction Nouv vente PMS-721 (IDE 0)](ADH-IDE-0.md)
- **Appelle**: 10 programmes | **Tables**: 4 (W:1 R:1 L:3) | **Taches**: 3 | **Expressions**: 29

<!-- TAB:Ecrans -->

## 8. ECRANS

### 8.1 Forms visibles (1 / 3)

| # | Position | Tache | Nom | Type | Largeur | Hauteur | Bloc |
|---|----------|-------|-----|------|---------|---------|------|
| 1 | 242.1 | T1 | Saisie/Annulation vente | MDI | 600 | 143 | Saisie |

### 8.2 Mockups Ecrans

---

#### <a id="ecran-t1"></a>242.1 - Saisie/Annulation vente
**Tache** : [T1](#t1) | **Type** : MDI | **Dimensions** : 600 x 143 DLU
**Bloc** : Saisie | **Titre IDE** : Saisie/Annulation vente

<!-- FORM-DATA:
{
    "width":  600,
    "controls":  [

                 ],
    "type":  "MDI",
    "height":  143,
    "taskId":  1
}
-->

## 9. NAVIGATION

Ecran unique: **Saisie/Annulation vente**

### 9.3 Structure hierarchique (3 taches)

- **242.1** [Saisie/Annulation vente (T1)](#t1) **[ECRAN]** (MDI) 600x143 -> [mockup](#ecran-t1) *[Saisie]*
  - **242.1.1** [Existe vente gratuite ou IGR ? (T2)](#t2)  
- **242.2** [(sans nom) (T3)](#t3)   *[Traitement]*

<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (4)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 38 | comptable_gratuite |  | DB | R | **W** |   | 2 |
| 264 | vente_gratuite | Donnees de ventes | DB |   |   | L | 1 |
| 400 | pv_cust_rentals |  | DB |   |   | L | 1 |
| 804 | valeur_credit_bar_defaut |  | DB |   |   | L | 1 |

### Colonnes par table

<details>
<summary>Table 38 - comptable_gratuite (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type | Utilisee |
|--------|----------|-------|------|----------|
| C | v.Existe Comptable Gratuite | W | Logical | **OUI** |

</details>

## 11. VARIABLES

### 11.1 Variables de session (4)

Variables persistantes pendant toute la session.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| R | v.fin | Logical | 1x refs |
| S | V.Existe IGR ? | Logical | 1x refs |
| T | V.Existe Gratuité ? | Logical | 1x refs |
| U | V.Session ouverte ? | Logical | 1x refs |

### 11.2 Variables de travail (1)

Variables internes au programme.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| Q | W0 choix action | Alpha | 5x refs |

### 11.3 Autres (16)

Variables diverses.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | P.Societe | Alpha | - |
| B | P.Devise locale | Alpha | - |
| C | P.Masque montant | Alpha | - |
| D | P.Solde compte | Numeric | - |
| E | P.Code GM | Numeric | - |
| F | P.Filiation | Numeric | - |
| G | P.Date fin sejour | Date | - |
| H | P.Etat compte | Alpha | - |
| I | P.Date solde | Date | - |
| J | P.Garanti O/N | Alpha | - |
| K | P.Nom & prénom | Alpha | - |
| L | P.UNI/BI | Alpha | - |
| M | P.Date debut sejour | Date | - |
| N | P.Valide ? | Numeric | - |
| O | P.Nb decimales | Numeric | - |
| P | P.Mode consultation | Logical | 1x refs |

<details>
<summary>Toutes les 21 variables (liste complete)</summary>

| Cat | Lettre | Nom Variable | Type |
|-----|--------|--------------|------|
| W0 | **Q** | W0 choix action | Alpha |
| V. | **R** | v.fin | Logical |
| V. | **S** | V.Existe IGR ? | Logical |
| V. | **T** | V.Existe Gratuité ? | Logical |
| V. | **U** | V.Session ouverte ? | Logical |
| Autre | **A** | P.Societe | Alpha |
| Autre | **B** | P.Devise locale | Alpha |
| Autre | **C** | P.Masque montant | Alpha |
| Autre | **D** | P.Solde compte | Numeric |
| Autre | **E** | P.Code GM | Numeric |
| Autre | **F** | P.Filiation | Numeric |
| Autre | **G** | P.Date fin sejour | Date |
| Autre | **H** | P.Etat compte | Alpha |
| Autre | **I** | P.Date solde | Date |
| Autre | **J** | P.Garanti O/N | Alpha |
| Autre | **K** | P.Nom & prénom | Alpha |
| Autre | **L** | P.UNI/BI | Alpha |
| Autre | **M** | P.Date debut sejour | Date |
| Autre | **N** | P.Valide ? | Numeric |
| Autre | **O** | P.Nb decimales | Numeric |
| Autre | **P** | P.Mode consultation | Logical |

</details>

## 12. EXPRESSIONS

**29 / 29 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CALCULATION | 1 | 0 |
| CONDITION | 10 | 5 |
| CONSTANTE | 1 | 0 |
| DATE | 1 | 0 |
| REFERENCE_VG | 1 | 0 |
| OTHER | 10 | 0 |
| CAST_LOGIQUE | 1 | 0 |
| NEGATION | 4 | 0 |

### 12.2 Expressions cles par type

#### CALCULATION (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CALCULATION | 23 | `CallProg('{323,-1}'PROG)` | - |

#### CONDITION (10 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 25 | `IF(Trim(VG115)<>'',Trim(VG115)&'\|','')&'VENTE'` | [RM-001](#rm-RM-001) |
| CONDITION | 10 | `W0 choix action [Q]='4'` | - |
| CONDITION | 9 | `W0 choix action [Q]='3'` | - |
| CONDITION | 26 | `VG111 AND VG112<>0` | - |
| CONDITION | 12 | `W0 choix action [Q]='3' OR W0 choix action [Q]='4'` | - |
| ... | | *+5 autres* | |

#### CONSTANTE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 3 | `''` | - |

#### DATE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| DATE | 1 | `Date ()` | - |

#### REFERENCE_VG (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| REFERENCE_VG | 2 | `VG2` | - |

#### OTHER (10 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 18 | `VG83 AND NOT VG85` | - |
| OTHER | 17 | `NOT(VG83) AND NOT(VG85)` | - |
| OTHER | 21 | `VG89 AND NOT VG93` | - |
| OTHER | 24 | `NOT(V.Session ouverte ? [U]) AND NOT(VG3)` | - |
| OTHER | 22 | `VG89 AND VG93` | - |
| ... | | *+5 autres* | |

#### CAST_LOGIQUE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 6 | `'TRUE'LOG` | - |

#### NEGATION (4 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| NEGATION | 19 | `NOT VG85 OR VG3` | - |
| NEGATION | 20 | `NOT VG89` | - |
| NEGATION | 15 | `NOT P.Mode consultation [P]` | - |
| NEGATION | 16 | `NOT VG81` | - |

### 12.3 Toutes les expressions (29)

<details>
<summary>Voir les 29 expressions</summary>

#### CALCULATION (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 23 | `CallProg('{323,-1}'PROG)` |

#### CONDITION (10)

| IDE | Expression Decodee |
|-----|-------------------|
| 25 | `IF(Trim(VG115)<>'',Trim(VG115)&'\|','')&'VENTE'` |
| 27 | `IF(Trim(VG115)<>'',Trim(VG115)&'\|','')&'HISTORIQUE DES VENTES'` |
| 28 | `IF(Trim(VG115)<>'',Trim(VG115)&'\|','')&'HISTORIQUE DES IGR'` |
| 29 | `IF(Trim(VG115)<>'',Trim(VG115)&'\|','')&'HISTORIQUE DES GRATUITES'` |
| 4 | `W0 choix action [Q]='1'` |
| 7 | `W0 choix action [Q]='2'` |
| 9 | `W0 choix action [Q]='3'` |
| 10 | `W0 choix action [Q]='4'` |
| 12 | `W0 choix action [Q]='3' OR W0 choix action [Q]='4'` |
| 26 | `VG111 AND VG112<>0` |

#### CONSTANTE (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 3 | `''` |

#### DATE (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 1 | `Date ()` |

#### REFERENCE_VG (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 2 | `VG2` |

#### OTHER (10)

| IDE | Expression Decodee |
|-----|-------------------|
| 5 | `v.fin [R]` |
| 8 | `DbDel('{933,4}'DSOURCE,'')` |
| 11 | `VG3 OR VG47` |
| 13 | `(VG3 OR VG47) AND V.Existe IGR ? [S]` |
| 14 | `(VG3 OR VG47) AND V.Existe Gratuité ? [T]` |
| 17 | `NOT(VG83) AND NOT(VG85)` |
| 18 | `VG83 AND NOT VG85` |
| 21 | `VG89 AND NOT VG93` |
| 22 | `VG89 AND VG93` |
| 24 | `NOT(V.Session ouverte ? [U]) AND NOT(VG3)` |

#### CAST_LOGIQUE (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 6 | `'TRUE'LOG` |

#### NEGATION (4)

| IDE | Expression Decodee |
|-----|-------------------|
| 15 | `NOT P.Mode consultation [P]` |
| 16 | `NOT VG81` |
| 19 | `NOT VG85 OR VG3` |
| 20 | `NOT VG89` |

</details>

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Menu caisse GM - scroll (IDE 163)](ADH-IDE-163.md) -> **Menu Choix Saisie/Annul vente (IDE 242)**

Main -> ... -> [Transaction Nouv vente PMS-584 (IDE 0)](ADH-IDE-0.md) -> **Menu Choix Saisie/Annul vente (IDE 242)**

Main -> ... -> [Transaction Nouv vente PMS-710 (IDE 0)](ADH-IDE-0.md) -> **Menu Choix Saisie/Annul vente (IDE 242)**

Main -> ... -> [Transaction Nouv vente PMS-721 (IDE 0)](ADH-IDE-0.md) -> **Menu Choix Saisie/Annul vente (IDE 242)**

```mermaid
graph LR
    T242[242 Menu Choix SaisieA...]
    style T242 fill:#58a6ff
    CC1[1 Main Program]
    style CC1 fill:#8b5cf6
    CC163[163 Menu caisse GM - s...]
    style CC163 fill:#3fb950
    CC1 --> CC163
    CC163 --> T242
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [163](ADH-IDE-163.md) | Menu caisse GM - scroll | 2 |
| [0](ADH-IDE-0.md) | Transaction Nouv vente PMS-584 | 1 |
| [0](ADH-IDE-0.md) | Transaction Nouv vente PMS-710 | 1 |
| [0](ADH-IDE-0.md) | Transaction Nouv vente PMS-721 | 1 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T242[242 Menu Choix SaisieA...]
    style T242 fill:#58a6ff
    C44[44 Appel programme]
    T242 --> C44
    style C44 fill:#3fb950
    C237[237 Transaction Nouv v...]
    T242 --> C237
    style C237 fill:#3fb950
    C238[238 Transaction Nouv v...]
    T242 --> C238
    style C238 fill:#3fb950
    C239[239 Transaction Nouv v...]
    T242 --> C239
    style C239 fill:#3fb950
    C240[240 Transaction Nouv v...]
    T242 --> C240
    style C240 fill:#3fb950
    C243[243 Histo ventes payantes]
    T242 --> C243
    style C243 fill:#3fb950
    C244[244 Histo ventes payan...]
    T242 --> C244
    style C244 fill:#3fb950
    C245[245 Histo ventes payan...]
    T242 --> C245
    style C245 fill:#3fb950
    C252[252 Histo ventes IGR]
    T242 --> C252
    style C252 fill:#3fb950
    C253[253 Histo ventes Gratu...]
    T242 --> C253
    style C253 fill:#3fb950
```

### 13.4 Detail Callees avec contexte

| IDE | Nom Programme | Appels | Contexte |
|-----|---------------|--------|----------|
| [44](ADH-IDE-44.md) | Appel programme | 1 | Sous-programme |
| [237](ADH-IDE-237.md) | Transaction Nouv vente avec GP | 1 | Sous-programme |
| [238](ADH-IDE-238.md) | Transaction Nouv vente PMS-584 | 1 | Sous-programme |
| [239](ADH-IDE-239.md) | Transaction Nouv vente PMS-721 | 1 | Sous-programme |
| [240](ADH-IDE-240.md) | Transaction Nouv vente PMS-710 | 1 | Sous-programme |
| [243](ADH-IDE-243.md) | Histo ventes payantes | 1 | Historique/consultation |
| [244](ADH-IDE-244.md) | Histo ventes payantes /PMS-605 | 1 | Historique/consultation |
| [245](ADH-IDE-245.md) | Histo ventes payantes /PMS-623 | 1 | Historique/consultation |
| [252](ADH-IDE-252.md) | Histo ventes IGR | 1 | Historique/consultation |
| [253](ADH-IDE-253.md) | Histo ventes Gratuités | 1 | Historique/consultation |

## 14. RECOMMANDATIONS MIGRATION

### 14.1 Profil du programme

| Metrique | Valeur | Impact migration |
|----------|--------|-----------------|
| Lignes de logique | 133 | Programme compact |
| Expressions | 29 | Peu de logique |
| Tables WRITE | 1 | Impact faible |
| Sous-programmes | 10 | Dependances moderees |
| Ecrans visibles | 1 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 133) | Code sain |
| Regles metier | 1 | Quelques regles a preserver |

### 14.2 Plan de migration par bloc

#### Saisie (2 taches: 1 ecran, 1 traitement)

- **Strategie** : Formulaire React/Blazor avec validation Zod/FluentValidation.
- Reproduire 1 ecran : Saisie/Annulation vente
- Validation temps reel cote client + serveur

#### Traitement (1 tache: 0 ecran, 1 traitement)

- Traitement standard a migrer

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| comptable_gratuite | Table WRITE (Database) | 1x | Schema + repository |
| [Histo ventes payantes /PMS-605 (IDE 244)](ADH-IDE-244.md) | Sous-programme | 1x | Normale - Historique/consultation |
| [Histo ventes payantes (IDE 243)](ADH-IDE-243.md) | Sous-programme | 1x | Normale - Historique/consultation |
| [Histo ventes payantes /PMS-623 (IDE 245)](ADH-IDE-245.md) | Sous-programme | 1x | Normale - Historique/consultation |
| [Histo ventes Gratuités (IDE 253)](ADH-IDE-253.md) | Sous-programme | 1x | Normale - Historique/consultation |
| [Histo ventes IGR (IDE 252)](ADH-IDE-252.md) | Sous-programme | 1x | Normale - Historique/consultation |
| [Transaction Nouv vente avec GP (IDE 237)](ADH-IDE-237.md) | Sous-programme | 1x | Normale - Sous-programme |
| [Appel programme (IDE 44)](ADH-IDE-44.md) | Sous-programme | 1x | Normale - Sous-programme |
| [Transaction Nouv vente PMS-584 (IDE 238)](ADH-IDE-238.md) | Sous-programme | 1x | Normale - Sous-programme |
| [Transaction Nouv vente PMS-710 (IDE 240)](ADH-IDE-240.md) | Sous-programme | 1x | Normale - Sous-programme |
| [Transaction Nouv vente PMS-721 (IDE 239)](ADH-IDE-239.md) | Sous-programme | 1x | Normale - Sous-programme |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-01-30 09:43*
