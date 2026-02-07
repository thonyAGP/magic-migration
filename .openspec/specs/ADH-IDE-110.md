# ADH IDE 110 - Print creation garanti PMS-584

> **Analyse**: Phases 1-4 2026-02-07 03:48 -> 03:49 (28s) | Assemblage 07:02
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 110 |
| Nom Programme | Print creation garanti PMS-584 |
| Fichier source | `Prg_110.xml` |
| Dossier IDE | Garantie |
| Taches | 16 (1 ecrans visibles) |
| Tables modifiees | 0 |
| Programmes appeles | 1 |

## 2. DESCRIPTION FONCTIONNELLE

**Print creation garanti PMS-584** assure la gestion complete de ce processus, accessible depuis [Garantie sur compte (IDE 111)](ADH-IDE-111.md), [Garantie sur compte PMS-584 (IDE 112)](ADH-IDE-112.md), [Garantie sur compte (IDE 288)](ADH-IDE-288.md).

Le flux de traitement s'organise en **2 blocs fonctionnels** :

- **Impression** (11 taches) : generation de tickets et documents
- **Traitement** (5 taches) : traitements metier divers

<details>
<summary>Detail : phases du traitement</summary>

#### Phase 1 : Impression (11 taches)

- **T1** - Print creation garantie TIK V1
- **T2** - Printer 1
- **T3** - edition extrait compte
- **T4** - edition extrait compte
- **T5** - Printer 4
- **T6** - edition extrait compte
- **T7** - edition extrait compte
- **T11** - Printer 8
- **T12** - edition extrait compte
- **T13** - Printer 9
- **T14** - edition extrait compte

Delegue a : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

#### Phase 2 : Traitement (5 taches)

- **T8** - Iteration **[ECRAN]**
- **T9** - Veuillez patienter... **[ECRAN]**
- **T10** - recup nom adherent
- **T15** - recup terminal
- **T16** - recup terminal

</details>

## 3. BLOCS FONCTIONNELS

### 3.1 Impression (11 taches)

Generation des documents et tickets.

---

#### <a id="t1"></a>T1 - Print creation garantie TIK V1

**Role** : Tache d'orchestration : point d'entree du programme (11 sous-taches). Coordonne l'enchainement des traitements.

<details>
<summary>10 sous-taches directes</summary>

| Tache | Nom | Bloc |
|-------|-----|------|
| [T2](#t2) | Printer 1 | Impression |
| [T3](#t3) | edition extrait compte | Impression |
| [T4](#t4) | edition extrait compte | Impression |
| [T5](#t5) | Printer 4 | Impression |
| [T6](#t6) | edition extrait compte | Impression |
| [T7](#t7) | edition extrait compte | Impression |
| [T11](#t11) | Printer 8 | Impression |
| [T12](#t12) | edition extrait compte | Impression |
| [T13](#t13) | Printer 9 | Impression |
| [T14](#t14) | edition extrait compte | Impression |

</details>

---

#### <a id="t2"></a>T2 - Printer 1

**Role** : Generation du document : Printer 1.

---

#### <a id="t3"></a>T3 - edition extrait compte

**Role** : Generation du document : edition extrait compte.

---

#### <a id="t4"></a>T4 - edition extrait compte

**Role** : Generation du document : edition extrait compte.

---

#### <a id="t5"></a>T5 - Printer 4

**Role** : Generation du document : Printer 4.

---

#### <a id="t6"></a>T6 - edition extrait compte

**Role** : Generation du document : edition extrait compte.

---

#### <a id="t7"></a>T7 - edition extrait compte

**Role** : Generation du document : edition extrait compte.

---

#### <a id="t11"></a>T11 - Printer 8

**Role** : Generation du document : Printer 8.

---

#### <a id="t12"></a>T12 - edition extrait compte

**Role** : Generation du document : edition extrait compte.

---

#### <a id="t13"></a>T13 - Printer 9

**Role** : Generation du document : Printer 9.

---

#### <a id="t14"></a>T14 - edition extrait compte

**Role** : Generation du document : edition extrait compte.


### 3.2 Traitement (5 taches)

Traitements internes.

---

#### <a id="t8"></a>T8 - Iteration [ECRAN]

**Role** : Traitement : Iteration.
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t8)

---

#### <a id="t9"></a>T9 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t9)

---

#### <a id="t10"></a>T10 - recup nom adherent

**Role** : Consultation/chargement : recup nom adherent.
**Variables liees** : B (P0 code adherent), L (W0 n° adherent)

---

#### <a id="t15"></a>T15 - recup terminal

**Role** : Consultation/chargement : recup terminal.

---

#### <a id="t16"></a>T16 - recup terminal

**Role** : Consultation/chargement : recup terminal.


## 5. REGLES METIER

*(Aucune regle metier identifiee)*

## 6. CONTEXTE

- **Appele par**: [Garantie sur compte (IDE 111)](ADH-IDE-111.md), [Garantie sur compte PMS-584 (IDE 112)](ADH-IDE-112.md), [Garantie sur compte (IDE 288)](ADH-IDE-288.md)
- **Appelle**: 1 programmes | **Tables**: 8 (W:0 R:4 L:4) | **Taches**: 16 | **Expressions**: 16

<!-- TAB:Ecrans -->

## 8. ECRANS

### 8.1 Forms visibles (1 / 16)

| # | Position | Tache | Nom | Type | Largeur | Hauteur | Bloc |
|---|----------|-------|-----|------|---------|---------|------|
| 1 | 110.3.1 | T9 | Veuillez patienter... | MDI | 422 | 56 | Traitement |

### 8.2 Mockups Ecrans

---

#### <a id="ecran-t9"></a>110.3.1 - Veuillez patienter...
**Tache** : [T9](#t9) | **Type** : MDI | **Dimensions** : 422 x 56 DLU
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
                         "x":  50,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  323,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Edition de la creation de garantie",
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
    "taskId":  "110.3.1",
    "height":  56
}
-->

## 9. NAVIGATION

Ecran unique: **Veuillez patienter...**

### 9.3 Structure hierarchique (16 taches)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **110.1** | [**Print creation garantie TIK V1** (T1)](#t1) | MDI | - | Impression |
| 110.1.1 | [Printer 1 (T2)](#t2) | MDI | - | |
| 110.1.2 | [edition extrait compte (T3)](#t3) | MDI | - | |
| 110.1.3 | [edition extrait compte (T4)](#t4) | MDI | - | |
| 110.1.4 | [Printer 4 (T5)](#t5) | MDI | - | |
| 110.1.5 | [edition extrait compte (T6)](#t6) | MDI | - | |
| 110.1.6 | [edition extrait compte (T7)](#t7) | MDI | - | |
| 110.1.7 | [Printer 8 (T11)](#t11) | MDI | - | |
| 110.1.8 | [edition extrait compte (T12)](#t12) | MDI | - | |
| 110.1.9 | [Printer 9 (T13)](#t13) | MDI | - | |
| 110.1.10 | [edition extrait compte (T14)](#t14) | MDI | - | |
| **110.2** | [**Iteration** (T8)](#t8) [mockup](#ecran-t8) | MDI | 422x56 | Traitement |
| 110.2.1 | [Veuillez patienter... (T9)](#t9) [mockup](#ecran-t9) | MDI | 422x56 | |
| 110.2.2 | [recup nom adherent (T10)](#t10) | MDI | - | |
| 110.2.3 | [recup terminal (T15)](#t15) | - | - | |
| 110.2.4 | [recup terminal (T16)](#t16) | - | - | |

### 9.4 Algorigramme

```mermaid
flowchart TD
    START([START])
    PROCESS[Traitement 16 taches]
    ENDOK([END])
    START --> PROCESS --> ENDOK
    style START fill:#3fb950,color:#000
    style ENDOK fill:#3fb950,color:#000
```

> *algo-data indisponible. Utiliser `/algorigramme` pour generer.*

<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (8)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 30 | gm-recherche_____gmr | Index de recherche | DB | R |   |   | 1 |
| 31 | gm-complet_______gmc |  | DB |   |   | L | 1 |
| 34 | hebergement______heb | Hebergement (chambres) | DB |   |   | L | 1 |
| 39 | depot_garantie___dga | Depots et garanties | DB | R |   |   | 7 |
| 91 | garantie_________gar | Depots et garanties | DB |   |   | L | 7 |
| 368 | pms_village |  | DB | R |   |   | 1 |
| 818 | Circuit supprime |  | DB |   |   | L | 1 |
| 878 | categorie_operation_mw | Operations comptables | DB | R |   |   | 2 |

### Colonnes par table (2 / 4 tables avec colonnes identifiees)

<details>
<summary>Table 30 - gm-recherche_____gmr (R) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 39 - depot_garantie___dga (R) - 7 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W1 config imp | R | Alpha |
| B | W1 large | R | Alpha |
| C | W1 normal | R | Alpha |
| D | W1 condense | R | Alpha |
| E | W1 detecteur papier | R | Alpha |
| F | W1 inhibe panel | R | Alpha |
| G | W1 massicot | R | Alpha |
| H | W1 selection feuille | R | Alpha |
| I | W1 selection rouleau | R | Alpha |

</details>

<details>
<summary>Table 368 - pms_village (R) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | P0 societe | R | Alpha |
| B | P0 code adherent | R | Numeric |
| C | P0 filiation | R | Numeric |
| D | P0 nom village | R | Alpha |
| E | P0 masque montant | R | Alpha |
| F | P0 N° Dossier | R | Alpha |
| G | P0 N° autorisation | R | Alpha |
| H | P0 Fichier édition pdf | R | Alpha |
| I | P0 fichier signature | R | Alpha |
| J | W0 nom | R | Alpha |
| K | W0 prenom | R | Alpha |
| L | W0 n° adherent | R | Numeric |
| M | W0 lettre contrôle | R | Alpha |
| N | W0 filiation | R | Numeric |
| O | W0 Chambre | R | Alpha |
| P | W0 date de debut | R | Date |
| Q | W0 date de fin | R | Date |
| R | W0 TPE ICMP | R | Logical |
| S | v.comment | R | Alpha |

</details>

<details>
<summary>Table 878 - categorie_operation_mw (R) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

## 11. VARIABLES

### 11.1 Parametres entrants (9)

Variables recues du programme appelant ([Garantie sur compte (IDE 111)](ADH-IDE-111.md)).

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | P0 societe | Alpha | - |
| B | P0 code adherent | Numeric | [T10](#t10) |
| C | P0 filiation | Numeric | 1x parametre entrant |
| D | P0 nom village | Alpha | - |
| E | P0 masque montant | Alpha | - |
| F | P0 N° Dossier | Alpha | - |
| G | P0 N° autorisation | Alpha | - |
| H | P0 Fichier édition pdf | Alpha | 1x parametre entrant |
| I | P0 fichier signature | Alpha | - |

### 11.2 Variables de session (1)

Variables persistantes pendant toute la session.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| S | v.comment | Alpha | - |

### 11.3 Variables de travail (9)

Variables internes au programme.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| J | W0 nom | Alpha | - |
| K | W0 prenom | Alpha | - |
| L | W0 n° adherent | Numeric | - |
| M | W0 lettre contrôle | Alpha | - |
| N | W0 filiation | Numeric | - |
| O | W0 Chambre | Alpha | - |
| P | W0 date de debut | Date | - |
| Q | W0 date de fin | Date | - |
| R | W0 TPE ICMP | Logical | - |

<details>
<summary>Toutes les 19 variables (liste complete)</summary>

| Cat | Lettre | Nom Variable | Type |
|-----|--------|--------------|------|
| P0 | **A** | P0 societe | Alpha |
| P0 | **B** | P0 code adherent | Numeric |
| P0 | **C** | P0 filiation | Numeric |
| P0 | **D** | P0 nom village | Alpha |
| P0 | **E** | P0 masque montant | Alpha |
| P0 | **F** | P0 N° Dossier | Alpha |
| P0 | **G** | P0 N° autorisation | Alpha |
| P0 | **H** | P0 Fichier édition pdf | Alpha |
| P0 | **I** | P0 fichier signature | Alpha |
| W0 | **J** | W0 nom | Alpha |
| W0 | **K** | W0 prenom | Alpha |
| W0 | **L** | W0 n° adherent | Numeric |
| W0 | **M** | W0 lettre contrôle | Alpha |
| W0 | **N** | W0 filiation | Numeric |
| W0 | **O** | W0 Chambre | Alpha |
| W0 | **P** | W0 date de debut | Date |
| W0 | **Q** | W0 date de fin | Date |
| W0 | **R** | W0 TPE ICMP | Logical |
| V. | **S** | v.comment | Alpha |

</details>

## 12. EXPRESSIONS

**16 / 16 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CONSTANTE | 2 | 0 |
| FORMAT | 1 | 0 |
| OTHER | 3 | 0 |
| CONDITION | 6 | 0 |
| CAST_LOGIQUE | 1 | 0 |
| REFERENCE_VG | 1 | 0 |
| NEGATION | 1 | 0 |
| CONCATENATION | 1 | 0 |

### 12.2 Expressions cles par type

#### CONSTANTE (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 11 | `'GL2'` | - |
| CONSTANTE | 10 | `'GL1'` | - |

#### FORMAT (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| FORMAT | 13 | `Translate ('%TempDir%ticket_garant_'&Str(P0 code adherent [B],'8P0')&
'_'&Trim(Str(P0 filiation [C],'3P0'))&'_'&DStr(Date(),'YYMMDD')&
TStr(Time(),'HHMMSS')&'.pdf')` | - |

#### OTHER (3 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 4 | `SetCrsr (1)` | - |
| OTHER | 2 | `GetParam ('CURRENTLISTINGNUM')` | - |
| OTHER | 1 | `SetCrsr (2)` | - |

#### CONDITION (6 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 8 | `GetParam ('CURRENTPRINTERNUM')=8` | - |
| CONDITION | 9 | `GetParam ('CURRENTPRINTERNUM')=9` | - |
| CONDITION | 14 | `P0 Fichier édition pdf [H]=''` | - |
| CONDITION | 5 | `GetParam ('CURRENTPRINTERNUM')=1 OR VG82='TB'` | - |
| CONDITION | 6 | `GetParam ('CURRENTPRINTERNUM')=4` | - |
| ... | | *+1 autres* | |

#### CAST_LOGIQUE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 12 | `'TRUE'LOG` | - |

#### REFERENCE_VG (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| REFERENCE_VG | 15 | `VG78` | - |

#### NEGATION (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| NEGATION | 16 | `NOT VG78` | - |

#### CONCATENATION (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONCATENATION | 3 | `Trim ([T])&' '&Trim ([U])&' '&Trim ([V])` | - |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Garantie sur compte (IDE 111)](ADH-IDE-111.md) -> **Print creation garanti PMS-584 (IDE 110)**

Main -> ... -> [Garantie sur compte PMS-584 (IDE 112)](ADH-IDE-112.md) -> **Print creation garanti PMS-584 (IDE 110)**

Main -> ... -> [Garantie sur compte (IDE 288)](ADH-IDE-288.md) -> **Print creation garanti PMS-584 (IDE 110)**

```mermaid
graph LR
    T110[110 Print creation gar...]
    style T110 fill:#58a6ff
    CC1[1 Main Program]
    style CC1 fill:#8b5cf6
    CC163[163 Menu caisse GM - s...]
    style CC163 fill:#f59e0b
    CC111[111 Garantie sur compte]
    style CC111 fill:#3fb950
    CC112[112 Garantie sur compt...]
    style CC112 fill:#3fb950
    CC288[288 Garantie sur compte]
    style CC288 fill:#3fb950
    CC163 --> CC111
    CC163 --> CC112
    CC163 --> CC288
    CC1 --> CC163
    CC111 --> T110
    CC112 --> T110
    CC288 --> T110
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [111](ADH-IDE-111.md) | Garantie sur compte | 1 |
| [112](ADH-IDE-112.md) | Garantie sur compte PMS-584 | 1 |
| [288](ADH-IDE-288.md) | Garantie sur compte | 1 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T110[110 Print creation gar...]
    style T110 fill:#58a6ff
    C182[182 Raz Current Printer]
    T110 --> C182
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
| Lignes de logique | 305 | Taille moyenne |
| Expressions | 16 | Peu de logique |
| Tables WRITE | 0 | Impact faible |
| Sous-programmes | 1 | Peu de dependances |
| Ecrans visibles | 1 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 305) | Code sain |
| Regles metier | 0 | Pas de regle identifiee |

### 14.2 Plan de migration par bloc

#### Impression (11 taches: 0 ecran, 11 traitements)

- **Strategie** : Templates HTML -> PDF via wkhtmltopdf ou Puppeteer.
- `PrintService` injectable avec choix imprimante

#### Traitement (5 taches: 2 ecrans, 3 traitements)

- **Strategie** : Orchestrateur avec 2 ecrans (Razor/React) et 3 traitements backend (services).
- Les ecrans deviennent des composants UI, les traitements invisibles deviennent des services injectables.
- 1 sous-programme(s) a migrer ou a reutiliser depuis les services existants.
- Decomposer les taches en services unitaires testables.

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| [Raz Current Printer (IDE 182)](ADH-IDE-182.md) | Sous-programme | 1x | Normale - Impression ticket/document |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 07:02*
