# ADH IDE 36 - Print Separation ou fusion

> **Analyse**: Phases 1-4 2026-02-07 03:42 -> 03:42 (26s) | Assemblage 03:42
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 36 |
| Nom Programme | Print Separation ou fusion |
| Fichier source | `Prg_36.xml` |
| Dossier IDE | Impression |
| Taches | 27 (1 ecrans visibles) |
| Tables modifiees | 0 |
| Programmes appeles | 1 |

## 2. DESCRIPTION FONCTIONNELLE

**Print Separation ou fusion** assure la gestion complete de ce processus, accessible depuis [Separation (IDE 27)](ADH-IDE-27.md), [Fusion (IDE 28)](ADH-IDE-28.md).

Le flux de traitement s'organise en **2 blocs fonctionnels** :

- **Traitement** (22 taches) : traitements metier divers
- **Impression** (5 taches) : generation de tickets et documents

<details>
<summary>Detail : phases du traitement</summary>

#### Phase 1 : Traitement (22 taches)

- **36** - Veuillez patienter... **[[ECRAN]](#ecran-t1)**
- **36.1** - Nbre Record Histo
- **36.2.1** - Traitement **[[ECRAN]](#ecran-t4)**
- **36.2.1.1** - Detail
- **36.2.2** - Traitement **[[ECRAN]](#ecran-t6)**
- **36.2.2.1** - Detail
- **36.3.1** - Traitement **[[ECRAN]](#ecran-t9)**
- **36.3.1.1** - Detail
- **36.3.2** - Traitement **[[ECRAN]](#ecran-t11)**
- **36.3.2.1** - Detail
- **36.4.1** - Traitement **[[ECRAN]](#ecran-t14)**
- **36.4.1.1** - Detail
- **36.4.2** - Traitement **[[ECRAN]](#ecran-t16)**
- **36.4.2.1** - Detail
- **36.5.1** - Traitement **[[ECRAN]](#ecran-t19)**
- **36.5.1.1** - Detail
- **36.5.2** - Traitement **[[ECRAN]](#ecran-t21)**
- **36.5.2.1** - Detail
- **36.6.1** - Traitement **[[ECRAN]](#ecran-t24)**
- **36.6.1.1** - Detail
- **36.6.2** - Traitement **[[ECRAN]](#ecran-t26)**
- **36.6.2.1** - Detail

#### Phase 2 : Impression (5 taches)

- **36.2** - Printer 1 **[[ECRAN]](#ecran-t3)**
- **36.3** - Printer 4 **[[ECRAN]](#ecran-t8)**
- **36.4** - Printer 6 **[[ECRAN]](#ecran-t13)**
- **36.5** - Printer 8 **[[ECRAN]](#ecran-t18)**
- **36.6** - Printer 9 **[[ECRAN]](#ecran-t23)**

Delegue a : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

</details>

## 3. BLOCS FONCTIONNELS

### 3.1 Traitement (22 taches)

Traitements internes.

---

#### <a id="t1"></a>36 - Veuillez patienter... [[ECRAN]](#ecran-t1)

**Role** : Tache d'orchestration : point d'entree du programme (22 sous-taches). Coordonne l'enchainement des traitements.
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t1)

<details>
<summary>21 sous-taches directes</summary>

| Tache | Nom | Bloc |
|-------|-----|------|
| [36.1](#t2) | Nbre Record Histo | Traitement |
| [36.2.1](#t4) | Traitement **[[ECRAN]](#ecran-t4)** | Traitement |
| [36.2.1.1](#t5) | Detail | Traitement |
| [36.2.2](#t6) | Traitement **[[ECRAN]](#ecran-t6)** | Traitement |
| [36.2.2.1](#t7) | Detail | Traitement |
| [36.3.1](#t9) | Traitement **[[ECRAN]](#ecran-t9)** | Traitement |
| [36.3.1.1](#t10) | Detail | Traitement |
| [36.3.2](#t11) | Traitement **[[ECRAN]](#ecran-t11)** | Traitement |
| [36.3.2.1](#t12) | Detail | Traitement |
| [36.4.1](#t14) | Traitement **[[ECRAN]](#ecran-t14)** | Traitement |
| [36.4.1.1](#t15) | Detail | Traitement |
| [36.4.2](#t16) | Traitement **[[ECRAN]](#ecran-t16)** | Traitement |
| [36.4.2.1](#t17) | Detail | Traitement |
| [36.5.1](#t19) | Traitement **[[ECRAN]](#ecran-t19)** | Traitement |
| [36.5.1.1](#t20) | Detail | Traitement |
| [36.5.2](#t21) | Traitement **[[ECRAN]](#ecran-t21)** | Traitement |
| [36.5.2.1](#t22) | Detail | Traitement |
| [36.6.1](#t24) | Traitement **[[ECRAN]](#ecran-t24)** | Traitement |
| [36.6.1.1](#t25) | Detail | Traitement |
| [36.6.2](#t26) | Traitement **[[ECRAN]](#ecran-t26)** | Traitement |
| [36.6.2.1](#t27) | Detail | Traitement |

</details>

---

#### <a id="t2"></a>36.1 - Nbre Record Histo

**Role** : Traitement : Nbre Record Histo.
**Variables liees** : N (W0 nbre filiation), S (W0 Nbre Record Histo)

---

#### <a id="t4"></a>36.2.1 - Traitement [[ECRAN]](#ecran-t4)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t4)

---

#### <a id="t5"></a>36.2.1.1 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t6"></a>36.2.2 - Traitement [[ECRAN]](#ecran-t6)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t6)

---

#### <a id="t7"></a>36.2.2.1 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t9"></a>36.3.1 - Traitement [[ECRAN]](#ecran-t9)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t9)

---

#### <a id="t10"></a>36.3.1.1 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t11"></a>36.3.2 - Traitement [[ECRAN]](#ecran-t11)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t11)

---

#### <a id="t12"></a>36.3.2.1 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t14"></a>36.4.1 - Traitement [[ECRAN]](#ecran-t14)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t14)

---

#### <a id="t15"></a>36.4.1.1 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t16"></a>36.4.2 - Traitement [[ECRAN]](#ecran-t16)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t16)

---

#### <a id="t17"></a>36.4.2.1 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t19"></a>36.5.1 - Traitement [[ECRAN]](#ecran-t19)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t19)

---

#### <a id="t20"></a>36.5.1.1 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t21"></a>36.5.2 - Traitement [[ECRAN]](#ecran-t21)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t21)

---

#### <a id="t22"></a>36.5.2.1 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t24"></a>36.6.1 - Traitement [[ECRAN]](#ecran-t24)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t24)

---

#### <a id="t25"></a>36.6.1.1 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t26"></a>36.6.2 - Traitement [[ECRAN]](#ecran-t26)

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t26)

---

#### <a id="t27"></a>36.6.2.1 - Detail

**Role** : Traitement : Detail.


### 3.2 Impression (5 taches)

Generation des documents et tickets.

---

#### <a id="t3"></a>36.2 - Printer 1 [[ECRAN]](#ecran-t3)

**Role** : Generation du document : Printer 1.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t3)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

---

#### <a id="t8"></a>36.3 - Printer 4 [[ECRAN]](#ecran-t8)

**Role** : Generation du document : Printer 4.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t8)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

---

#### <a id="t13"></a>36.4 - Printer 6 [[ECRAN]](#ecran-t13)

**Role** : Generation du document : Printer 6.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t13)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

---

#### <a id="t18"></a>36.5 - Printer 8 [[ECRAN]](#ecran-t18)

**Role** : Generation du document : Printer 8.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t18)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

---

#### <a id="t23"></a>36.6 - Printer 9 [[ECRAN]](#ecran-t23)

**Role** : Generation du document : Printer 9.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t23)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)


## 5. REGLES METIER

*(Aucune regle metier identifiee)*

## 6. CONTEXTE

- **Appele par**: [Separation (IDE 27)](ADH-IDE-27.md), [Fusion (IDE 28)](ADH-IDE-28.md)
- **Appelle**: 1 programmes | **Tables**: 4 (W:0 R:3 L:1) | **Taches**: 27 | **Expressions**: 15

<!-- TAB:Ecrans -->

## 8. ECRANS

### 8.1 Forms visibles (1 / 27)

| # | Position | Tache | Nom | Type | Largeur | Hauteur | Bloc |
|---|----------|-------|-----|------|---------|---------|------|
| 1 | 36 | 36 | Veuillez patienter... | MDI | 422 | 56 | Traitement |

### 8.2 Mockups Ecrans

---

#### <a id="ecran-t1"></a>36 - Veuillez patienter...
**Tache** : [36](#t1) | **Type** : MDI | **Dimensions** : 422 x 56 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  422,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Impression en cours ...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  72,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  280,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Separation de comptes",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "36",
    "height":  56
}
-->

## 9. NAVIGATION

Ecran unique: **Veuillez patienter...**

### 9.3 Structure hierarchique (27 taches)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **36.1** | [**Veuillez patienter...** (36)](#t1) [mockup](#ecran-t1) | MDI | 422x56 | Traitement |
| 36.1.1 | [Nbre Record Histo (36.1)](#t2) | MDI | - | |
| 36.1.2 | [Traitement (36.2.1)](#t4) [mockup](#ecran-t4) | MDI | 308x56 | |
| 36.1.3 | [Detail (36.2.1.1)](#t5) | MDI | - | |
| 36.1.4 | [Traitement (36.2.2)](#t6) [mockup](#ecran-t6) | MDI | 308x56 | |
| 36.1.5 | [Detail (36.2.2.1)](#t7) | MDI | - | |
| 36.1.6 | [Traitement (36.3.1)](#t9) [mockup](#ecran-t9) | MDI | 308x56 | |
| 36.1.7 | [Detail (36.3.1.1)](#t10) | MDI | - | |
| 36.1.8 | [Traitement (36.3.2)](#t11) [mockup](#ecran-t11) | MDI | 308x56 | |
| 36.1.9 | [Detail (36.3.2.1)](#t12) | MDI | - | |
| 36.1.10 | [Traitement (36.4.1)](#t14) [mockup](#ecran-t14) | MDI | 308x56 | |
| 36.1.11 | [Detail (36.4.1.1)](#t15) | MDI | - | |
| 36.1.12 | [Traitement (36.4.2)](#t16) [mockup](#ecran-t16) | MDI | 308x56 | |
| 36.1.13 | [Detail (36.4.2.1)](#t17) | MDI | - | |
| 36.1.14 | [Traitement (36.5.1)](#t19) [mockup](#ecran-t19) | MDI | 308x56 | |
| 36.1.15 | [Detail (36.5.1.1)](#t20) | MDI | - | |
| 36.1.16 | [Traitement (36.5.2)](#t21) [mockup](#ecran-t21) | MDI | 308x56 | |
| 36.1.17 | [Detail (36.5.2.1)](#t22) | MDI | - | |
| 36.1.18 | [Traitement (36.6.1)](#t24) [mockup](#ecran-t24) | MDI | 308x56 | |
| 36.1.19 | [Detail (36.6.1.1)](#t25) | MDI | - | |
| 36.1.20 | [Traitement (36.6.2)](#t26) [mockup](#ecran-t26) | MDI | 308x56 | |
| 36.1.21 | [Detail (36.6.2.1)](#t27) | MDI | - | |
| **36.2** | [**Printer 1** (36.2)](#t3) [mockup](#ecran-t3) | MDI | 308x56 | Impression |
| 36.2.1 | [Printer 4 (36.3)](#t8) [mockup](#ecran-t8) | MDI | 308x56 | |
| 36.2.2 | [Printer 6 (36.4)](#t13) [mockup](#ecran-t13) | MDI | 308x56 | |
| 36.2.3 | [Printer 8 (36.5)](#t18) [mockup](#ecran-t18) | MDI | 308x56 | |
| 36.2.4 | [Printer 9 (36.6)](#t23) [mockup](#ecran-t23) | MDI | 308x56 | |

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

### Tables utilisees (4)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 31 | gm-complet_______gmc |  | DB | R |   |   | 1 |
| 40 | comptable________cte |  | DB | R |   |   | 10 |
| 70 | date_comptable___dat |  | DB |   |   | L | 1 |
| 343 | histo_fusionseparation_saisie | Historique / journal | DB | R |   |   | 11 |

### Colonnes par table (3 / 3 tables avec colonnes identifiees)

<details>
<summary>Table 31 - gm-complet_______gmc (R) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | P0 societe | R | Alpha |
| B | P0 code GM | R | Numeric |
| C | P0 filiation | R | Numeric |
| D | P0 masque montant | R | Alpha |
| E | P0 garantie | R | Alpha |
| F | P0 solde | R | Numeric |
| G | P0 date limite solde | R | Date |
| H | P0 nom village | R | Alpha |
| I | P0 Uni/Bilateral | R | Alpha |
| J | P0 n° compteur | R | Numeric |
| K | P0 MERGE/SEPAR | R | Alpha |
| L | P0 SEPAR NNN/ONE | R | Alpha |
| M | P0 chrono F/E | R | Numeric |
| N | W0 nbre filiation | R | Numeric |
| O | W0 date operation | R | Date |
| P | W0 heure operation | R | Time |
| Q | W0 nom/prenom newcpt | R | Alpha |
| R | W0 qualite compte | R | Alpha |
| S | W0 Nbre Record Histo | R | Numeric |

</details>

<details>
<summary>Table 40 - comptable________cte (R) - 10 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 343 - histo_fusionseparation_saisie (R) - 11 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| S | W0 Nbre Record Histo | R | Numeric |

</details>

## 11. VARIABLES

### 11.1 Parametres entrants (13)

Variables recues du programme appelant ([Separation (IDE 27)](ADH-IDE-27.md)).

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | P0 societe | Alpha | 2x parametre entrant |
| B | P0 code GM | Numeric | 1x parametre entrant |
| C | P0 filiation | Numeric | 1x parametre entrant |
| D | P0 masque montant | Alpha | - |
| E | P0 garantie | Alpha | - |
| F | P0 solde | Numeric | - |
| G | P0 date limite solde | Date | - |
| H | P0 nom village | Alpha | - |
| I | P0 Uni/Bilateral | Alpha | - |
| J | P0 n° compteur | Numeric | - |
| K | P0 MERGE/SEPAR | Alpha | - |
| L | P0 SEPAR NNN/ONE | Alpha | - |
| M | P0 chrono F/E | Numeric | - |

### 11.2 Variables de travail (6)

Variables internes au programme.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| N | W0 nbre filiation | Numeric | - |
| O | W0 date operation | Date | - |
| P | W0 heure operation | Time | - |
| Q | W0 nom/prenom newcpt | Alpha | - |
| R | W0 qualite compte | Alpha | - |
| S | W0 Nbre Record Histo | Numeric | - |

<details>
<summary>Toutes les 19 variables (liste complete)</summary>

| Cat | Lettre | Nom Variable | Type |
|-----|--------|--------------|------|
| P0 | **A** | P0 societe | Alpha |
| P0 | **B** | P0 code GM | Numeric |
| P0 | **C** | P0 filiation | Numeric |
| P0 | **D** | P0 masque montant | Alpha |
| P0 | **E** | P0 garantie | Alpha |
| P0 | **F** | P0 solde | Numeric |
| P0 | **G** | P0 date limite solde | Date |
| P0 | **H** | P0 nom village | Alpha |
| P0 | **I** | P0 Uni/Bilateral | Alpha |
| P0 | **J** | P0 n° compteur | Numeric |
| P0 | **K** | P0 MERGE/SEPAR | Alpha |
| P0 | **L** | P0 SEPAR NNN/ONE | Alpha |
| P0 | **M** | P0 chrono F/E | Numeric |
| W0 | **N** | W0 nbre filiation | Numeric |
| W0 | **O** | W0 date operation | Date |
| W0 | **P** | W0 heure operation | Time |
| W0 | **Q** | W0 nom/prenom newcpt | Alpha |
| W0 | **R** | W0 qualite compte | Alpha |
| W0 | **S** | W0 Nbre Record Histo | Numeric |

</details>

## 12. EXPRESSIONS

**15 / 15 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CONSTANTE | 1 | 0 |
| DATE | 1 | 0 |
| CONDITION | 6 | 0 |
| OTHER | 6 | 0 |
| CAST_LOGIQUE | 1 | 0 |

### 12.2 Expressions cles par type

#### CONSTANTE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 2 | `'C'` | - |

#### DATE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| DATE | 4 | `Date ()` | - |

#### CONDITION (6 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 12 | `GetParam ('CURRENTPRINTERNUM')=6` | - |
| CONDITION | 13 | `GetParam ('CURRENTPRINTERNUM')=8` | - |
| CONDITION | 14 | `GetParam ('CURRENTPRINTERNUM')=9` | - |
| CONDITION | 1 | `P0 societe [A]=''` | - |
| CONDITION | 10 | `GetParam ('CURRENTPRINTERNUM')=1` | - |
| ... | | *+1 autres* | |

#### OTHER (6 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 7 | `P0 filiation [C]` | - |
| OTHER | 8 | `SetCrsr (2)` | - |
| OTHER | 9 | `SetCrsr (1)` | - |
| OTHER | 3 | `P0 societe [A]` | - |
| OTHER | 5 | `Time ()` | - |
| ... | | *+1 autres* | |

#### CAST_LOGIQUE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 15 | `'TRUE'LOG` | - |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Separation (IDE 27)](ADH-IDE-27.md) -> **Print Separation ou fusion (IDE 36)**

Main -> ... -> [Fusion (IDE 28)](ADH-IDE-28.md) -> **Print Separation ou fusion (IDE 36)**

```mermaid
graph LR
    T36[36 Print Separation ou...]
    style T36 fill:#58a6ff
    CC1[1 Main Program]
    style CC1 fill:#8b5cf6
    CC163[163 Menu caisse GM - s...]
    style CC163 fill:#f59e0b
    CC37[37 Menu changement compte]
    style CC37 fill:#f59e0b
    CC27[27 Separation]
    style CC27 fill:#3fb950
    CC28[28 Fusion]
    style CC28 fill:#3fb950
    CC37 --> CC27
    CC37 --> CC28
    CC163 --> CC37
    CC1 --> CC163
    CC27 --> T36
    CC28 --> T36
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [27](ADH-IDE-27.md) | Separation | 1 |
| [28](ADH-IDE-28.md) | Fusion | 1 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T36[36 Print Separation ou...]
    style T36 fill:#58a6ff
    C182[182 Raz Current Printer]
    T36 --> C182
    style C182 fill:#3fb950
```

### 13.4 Detail Callees avec contexte

| IDE | Nom Programme | Appels | Contexte |
|-----|---------------|--------|----------|
| [182](ADH-IDE-182.md) | Raz Current Printer | 1 | Impression ticket/document |

## 14. RECOMMANDATIONS MIGRATION

### 14.1 Profil du programme

| Metrique | Valeur | Impact migration |
|----------|--------|-----------------|
| Lignes de logique | 426 | Taille moyenne |
| Expressions | 15 | Peu de logique |
| Tables WRITE | 0 | Impact faible |
| Sous-programmes | 1 | Peu de dependances |
| Ecrans visibles | 1 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 426) | Code sain |
| Regles metier | 0 | Pas de regle identifiee |

### 14.2 Plan de migration par bloc

#### Traitement (22 taches: 11 ecrans, 11 traitements)

- **Strategie** : Orchestrateur avec 11 ecrans (Razor/React) et 11 traitements backend (services).
- Les ecrans deviennent des composants UI, les traitements invisibles deviennent des services injectables.
- 1 sous-programme(s) a migrer ou a reutiliser depuis les services existants.
- Decomposer les taches en services unitaires testables.

#### Impression (5 taches: 5 ecrans, 0 traitement)

- **Strategie** : Templates HTML -> PDF via wkhtmltopdf ou Puppeteer.
- `PrintService` injectable avec choix imprimante

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| [Raz Current Printer (IDE 182)](ADH-IDE-182.md) | Sous-programme | 1x | Normale - Impression ticket/document |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 03:42*
