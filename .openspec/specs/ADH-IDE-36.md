# ADH IDE 36 - Print Separation ou fusion

> **Analyse**: Phases 1-4 2026-02-07 03:42 -> 03:42 (26s) | Assemblage 13:10
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
| Complexite | **BASSE** (score 18/100) |

## 2. DESCRIPTION FONCTIONNELLE

# ADH IDE 36 - Print Separation ou Fusion

ADH IDE 36 gère l'impression des documents lors des opérations de séparation ou fusion de comptes. Ce programme est appelé depuis les modules Séparation (IDE 27) et Fusion (IDE 28), agissant comme gestionnaire d'impression centralisé pour ces deux opérations critiques. Son rôle consiste à préparer et envoyer les données de compte vers l'imprimante configurable pour générer les documents justificatifs nécessaires à l'archivage et à la traçabilité.

Le flux d'exécution suit une séquence logique : affichage d'un message d'attente ("Veuillez patienter..."), récupération du nombre de records historiques à imprimer, initialisation de l'imprimante (Printer 1), puis traitement détaillé ligne par ligne des données. La tâche "Traitement" gère la boucle principale tandis que "Detail" formate chaque ligne pour l'impression.

Le programme intègre un mécanisme de réinitialisation via l'appel à "Raz Current Printer" (IDE 182), garantissant que chaque impression démarre avec une imprimante vierge. Cette architecture modulaire permet de réutiliser la même logique d'impression pour les deux opérations (séparation et fusion) sans duplication de code, respectant le principe DRY de l'architecture Magic.

## 3. BLOCS FONCTIONNELS

### 3.1 Traitement (22 taches)

Traitements internes.

---

#### <a id="t1"></a>T1 - Veuillez patienter... [ECRAN]

**Role** : Tache d'orchestration : point d'entree du programme (22 sous-taches). Coordonne l'enchainement des traitements.
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t1)

<details>
<summary>21 sous-taches directes</summary>

| Tache | Nom | Bloc |
|-------|-----|------|
| [T2](#t2) | Nbre Record Histo | Traitement |
| [T4](#t4) | Traitement **[ECRAN]** | Traitement |
| [T5](#t5) | Detail | Traitement |
| [T6](#t6) | Traitement **[ECRAN]** | Traitement |
| [T7](#t7) | Detail | Traitement |
| [T9](#t9) | Traitement **[ECRAN]** | Traitement |
| [T10](#t10) | Detail | Traitement |
| [T11](#t11) | Traitement **[ECRAN]** | Traitement |
| [T12](#t12) | Detail | Traitement |
| [T14](#t14) | Traitement **[ECRAN]** | Traitement |
| [T15](#t15) | Detail | Traitement |
| [T16](#t16) | Traitement **[ECRAN]** | Traitement |
| [T17](#t17) | Detail | Traitement |
| [T19](#t19) | Traitement **[ECRAN]** | Traitement |
| [T20](#t20) | Detail | Traitement |
| [T21](#t21) | Traitement **[ECRAN]** | Traitement |
| [T22](#t22) | Detail | Traitement |
| [T24](#t24) | Traitement **[ECRAN]** | Traitement |
| [T25](#t25) | Detail | Traitement |
| [T26](#t26) | Traitement **[ECRAN]** | Traitement |
| [T27](#t27) | Detail | Traitement |

</details>

---

#### <a id="t2"></a>T2 - Nbre Record Histo

**Role** : Traitement : Nbre Record Histo.
**Variables liees** : N (W0 nbre filiation), S (W0 Nbre Record Histo)

---

#### <a id="t4"></a>T4 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t4)

---

#### <a id="t5"></a>T5 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t6"></a>T6 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t6)

---

#### <a id="t7"></a>T7 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t9"></a>T9 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t9)

---

#### <a id="t10"></a>T10 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t11"></a>T11 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t11)

---

#### <a id="t12"></a>T12 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t14"></a>T14 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t14)

---

#### <a id="t15"></a>T15 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t16"></a>T16 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t16)

---

#### <a id="t17"></a>T17 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t19"></a>T19 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t19)

---

#### <a id="t20"></a>T20 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t21"></a>T21 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t21)

---

#### <a id="t22"></a>T22 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t24"></a>T24 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t24)

---

#### <a id="t25"></a>T25 - Detail

**Role** : Traitement : Detail.

---

#### <a id="t26"></a>T26 - Traitement [ECRAN]

**Role** : Traitement : Traitement.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t26)

---

#### <a id="t27"></a>T27 - Detail

**Role** : Traitement : Detail.


### 3.2 Impression (5 taches)

Generation des documents et tickets.

---

#### <a id="t3"></a>T3 - Printer 1 [ECRAN]

**Role** : Generation du document : Printer 1.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t3)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

---

#### <a id="t8"></a>T8 - Printer 4 [ECRAN]

**Role** : Generation du document : Printer 4.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t8)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

---

#### <a id="t13"></a>T13 - Printer 6 [ECRAN]

**Role** : Generation du document : Printer 6.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t13)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

---

#### <a id="t18"></a>T18 - Printer 8 [ECRAN]

**Role** : Generation du document : Printer 8.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t18)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)

---

#### <a id="t23"></a>T23 - Printer 9 [ECRAN]

**Role** : Generation du document : Printer 9.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t23)
**Delegue a** : [Raz Current Printer (IDE 182)](ADH-IDE-182.md)


## 5. REGLES METIER

*(Programme d'impression - logique technique sans conditions metier)*

## 6. CONTEXTE

- **Appele par**: [Separation (IDE 27)](ADH-IDE-27.md), [Fusion (IDE 28)](ADH-IDE-28.md)
- **Appelle**: 1 programmes | **Tables**: 4 (W:0 R:3 L:1) | **Taches**: 27 | **Expressions**: 15

<!-- TAB:Ecrans -->

## 8. ECRANS

### 8.1 Forms visibles (1 / 27)

| # | Position | Tache | Nom | Type | Largeur | Hauteur | Bloc |
|---|----------|-------|-----|------|---------|---------|------|
| 1 | 36 | T1 | Veuillez patienter... | MDI | 422 | 56 | Traitement |

### 8.2 Mockups Ecrans

---

#### <a id="ecran-t1"></a>36 - Veuillez patienter...
**Tache** : [T1](#t1) | **Type** : MDI | **Dimensions** : 422 x 56 DLU
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
| **36.1** | [**Veuillez patienter...** (T1)](#t1) [mockup](#ecran-t1) | MDI | 422x56 | Traitement |
| 36.1.1 | [Nbre Record Histo (T2)](#t2) | MDI | - | |
| 36.1.2 | [Traitement (T4)](#t4) [mockup](#ecran-t4) | MDI | 308x56 | |
| 36.1.3 | [Detail (T5)](#t5) | MDI | - | |
| 36.1.4 | [Traitement (T6)](#t6) [mockup](#ecran-t6) | MDI | 308x56 | |
| 36.1.5 | [Detail (T7)](#t7) | MDI | - | |
| 36.1.6 | [Traitement (T9)](#t9) [mockup](#ecran-t9) | MDI | 308x56 | |
| 36.1.7 | [Detail (T10)](#t10) | MDI | - | |
| 36.1.8 | [Traitement (T11)](#t11) [mockup](#ecran-t11) | MDI | 308x56 | |
| 36.1.9 | [Detail (T12)](#t12) | MDI | - | |
| 36.1.10 | [Traitement (T14)](#t14) [mockup](#ecran-t14) | MDI | 308x56 | |
| 36.1.11 | [Detail (T15)](#t15) | MDI | - | |
| 36.1.12 | [Traitement (T16)](#t16) [mockup](#ecran-t16) | MDI | 308x56 | |
| 36.1.13 | [Detail (T17)](#t17) | MDI | - | |
| 36.1.14 | [Traitement (T19)](#t19) [mockup](#ecran-t19) | MDI | 308x56 | |
| 36.1.15 | [Detail (T20)](#t20) | MDI | - | |
| 36.1.16 | [Traitement (T21)](#t21) [mockup](#ecran-t21) | MDI | 308x56 | |
| 36.1.17 | [Detail (T22)](#t22) | MDI | - | |
| 36.1.18 | [Traitement (T24)](#t24) [mockup](#ecran-t24) | MDI | 308x56 | |
| 36.1.19 | [Detail (T25)](#t25) | MDI | - | |
| 36.1.20 | [Traitement (T26)](#t26) [mockup](#ecran-t26) | MDI | 308x56 | |
| 36.1.21 | [Detail (T27)](#t27) | MDI | - | |
| **36.2** | [**Printer 1** (T3)](#t3) [mockup](#ecran-t3) | MDI | 308x56 | Impression |
| 36.2.1 | [Printer 4 (T8)](#t8) [mockup](#ecran-t8) | MDI | 308x56 | |
| 36.2.2 | [Printer 6 (T13)](#t13) [mockup](#ecran-t13) | MDI | 308x56 | |
| 36.2.3 | [Printer 8 (T18)](#t18) [mockup](#ecran-t18) | MDI | 308x56 | |
| 36.2.4 | [Printer 9 (T23)](#t23) [mockup](#ecran-t23) | MDI | 308x56 | |

### 9.4 Algorigramme

```mermaid
flowchart TD
    START([START])
    B1[Traitement (22t)]
    START --> B1
    B2[Impression (5t)]
    B1 --> B2
    ENDOK([END])
    B2 --> ENDOK
    style START fill:#3fb950,color:#000
    style ENDOK fill:#3fb950,color:#000
```

> *Algorigramme simplifie base sur les blocs fonctionnels. Utiliser `/algorigramme` pour une synthese metier detaillee.*

<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (4)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 343 | histo_fusionseparation_saisie | Historique / journal | DB | R |   |   | 11 |
| 40 | comptable________cte |  | DB | R |   |   | 10 |
| 31 | gm-complet_______gmc |  | DB | R |   |   | 1 |
| 70 | date_comptable___dat |  | DB |   |   | L | 1 |

### Colonnes par table (3 / 3 tables avec colonnes identifiees)

<details>
<summary>Table 343 - histo_fusionseparation_saisie (R) - 11 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| S | W0 Nbre Record Histo | R | Numeric |

</details>

<details>
<summary>Table 40 - comptable________cte (R) - 10 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

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
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 13:10*
