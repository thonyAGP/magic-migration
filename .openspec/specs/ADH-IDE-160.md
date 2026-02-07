# ADH IDE 160 - Liste des GM

> **Analyse**: Phases 1-4 2026-02-07 03:50 -> 03:51 (28s) | Assemblage 07:18
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 160 |
| Nom Programme | Liste des GM |
| Fichier source | `Prg_160.xml` |
| Dossier IDE | Identification |
| Taches | 2 (1 ecrans visibles) |
| Tables modifiees | 1 |
| Programmes appeles | 0 |

## 2. DESCRIPTION FONCTIONNELLE

**Liste des GM** assure la gestion complete de ce processus, accessible depuis [Garantie sur compte PMS-584 (IDE 0)](ADH-IDE-0.md), [VAD validés à imprimer (IDE 0)](ADH-IDE-0.md).

Le flux de traitement s'organise en **1 blocs fonctionnels** :

- **Traitement** (2 taches) : traitements metier divers

**Donnees modifiees** : 1 tables en ecriture (ez_card).

**Logique metier** : 1 regles identifiees couvrant conditions metier.

## 3. BLOCS FONCTIONNELS

### 3.1 Traitement (2 taches)

Traitements internes.

---

#### <a id="t1"></a>T1 - Liste des GM [ECRAN]

**Role** : Traitement : Liste des GM.
**Ecran** : 1440 x 224 DLU (MDI) | [Voir mockup](#ecran-t1)

---

#### <a id="t2"></a>T2 - Update Ezcard

**Role** : Traitement : Update Ezcard.


## 5. REGLES METIER

1 regles identifiees:

### Autres (1 regles)

#### <a id="rm-RM-001"></a>[RM-001] Traitement si Trim([AT]) est renseigne

| Element | Detail |
|---------|--------|
| **Condition** | `Trim([AT])<>'' AND Trim([AT])<>Trim([AH]) AND [AU]=1` |
| **Si vrai** | [AT] |
| **Si faux** | '') |
| **Expression source** | Expression 24 : `IF(Trim([AT])<>'' AND Trim([AT])<>Trim([AH]) AND [AU]=1,[AT]` |
| **Exemple** | Si Trim([AT])<>'' AND Trim([AT])<>Trim([AH]) AND [AU]=1 â†’ [AT]. Sinon â†’ '') |

## 6. CONTEXTE

- **Appele par**: [Garantie sur compte PMS-584 (IDE 0)](ADH-IDE-0.md), [VAD validés à imprimer (IDE 0)](ADH-IDE-0.md)
- **Appelle**: 0 programmes | **Tables**: 5 (W:1 R:1 L:4) | **Taches**: 2 | **Expressions**: 26

<!-- TAB:Ecrans -->

## 8. ECRANS

### 8.1 Forms visibles (1 / 2)

| # | Position | Tache | Nom | Type | Largeur | Hauteur | Bloc |
|---|----------|-------|-----|------|---------|---------|------|
| 1 | 160 | T1 | Liste des GM | MDI | 1440 | 224 | Traitement |

### 8.2 Mockups Ecrans

---

#### <a id="ecran-t1"></a>160 - Liste des GM
**Tache** : [T1](#t1) | **Type** : MDI | **Dimensions** : 1440 x 224 DLU
**Bloc** : Traitement | **Titre IDE** : Liste des GM

<!-- FORM-DATA:
{
    "width":  1440,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  8,
                         "type":  "table",
                         "var":  "",
                         "name":  "",
                         "titleH":  12,
                         "color":  "6",
                         "w":  1424,
                         "y":  5,
                         "fmt":  "",
                         "parent":  null,
                         "text":  "",
                         "rowH":  14,
                         "h":  212,
                         "cols":  [
                                      {
                                          "title":  "Titre",
                                          "layer":  1,
                                          "w":  83
                                      },
                                      {
                                          "title":  "Prénom",
                                          "layer":  2,
                                          "w":  130
                                      },
                                      {
                                          "title":  "Nom",
                                          "layer":  3,
                                          "w":  186
                                      },
                                      {
                                          "title":  "Age",
                                          "layer":  4,
                                          "w":  77
                                      },
                                      {
                                          "title":  "Séminaire",
                                          "layer":  5,
                                          "w":  242
                                      },
                                      {
                                          "title":  "Chambre",
                                          "layer":  6,
                                          "w":  158
                                      },
                                      {
                                          "title":  "Fidelisation",
                                          "layer":  7,
                                          "w":  298
                                      },
                                      {
                                          "title":  "",
                                          "layer":  8,
                                          "w":  82
                                      },
                                      {
                                          "title":  "CMP",
                                          "layer":  9,
                                          "w":  130
                                      }
                                  ],
                         "rows":  9
                     },
                     {
                         "x":  14,
                         "type":  "edit",
                         "var":  "",
                         "y":  20,
                         "w":  29,
                         "fmt":  "",
                         "name":  "eme_sexe",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  98,
                         "type":  "edit",
                         "var":  "",
                         "y":  20,
                         "w":  118,
                         "fmt":  "",
                         "name":  "eme_prenom",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  227,
                         "type":  "edit",
                         "var":  "",
                         "y":  20,
                         "w":  174,
                         "fmt":  "",
                         "name":  "eme_nom",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  413,
                         "type":  "edit",
                         "var":  "",
                         "y":  20,
                         "w":  40,
                         "fmt":  "",
                         "name":  "eme_age",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  491,
                         "type":  "edit",
                         "var":  "",
                         "y":  20,
                         "w":  230,
                         "fmt":  "",
                         "name":  "eme_seminaire",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  733,
                         "type":  "edit",
                         "var":  "",
                         "y":  20,
                         "w":  74,
                         "fmt":  "",
                         "name":  "eme_nom_logement",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  891,
                         "type":  "edit",
                         "var":  "",
                         "y":  20,
                         "w":  286,
                         "fmt":  "",
                         "name":  "libelle",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  1189,
                         "type":  "image",
                         "var":  "",
                         "y":  20,
                         "w":  29,
                         "fmt":  "",
                         "name":  "",
                         "h":  11,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  1229,
                         "type":  "image",
                         "var":  "",
                         "y":  20,
                         "w":  29,
                         "fmt":  "",
                         "name":  "",
                         "h":  11,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  1270,
                         "type":  "edit",
                         "var":  "",
                         "y":  20,
                         "w":  118,
                         "fmt":  "10",
                         "name":  "card_code",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  1
                     }
                 ],
    "taskId":  "160",
    "height":  224
}
-->

<details>
<summary><strong>Champs : 8 champs</strong></summary>

| Pos (x,y) | Nom | Variable | Type |
|-----------|-----|----------|------|
| 14,20 | eme_sexe | - | edit |
| 98,20 | eme_prenom | - | edit |
| 227,20 | eme_nom | - | edit |
| 413,20 | eme_age | - | edit |
| 491,20 | eme_seminaire | - | edit |
| 733,20 | eme_nom_logement | - | edit |
| 891,20 | libelle | - | edit |
| 1270,20 | card_code | - | edit |

</details>

## 9. NAVIGATION

Ecran unique: **Liste des GM**

### 9.3 Structure hierarchique (2 taches)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **160.1** | [**Liste des GM** (T1)](#t1) [mockup](#ecran-t1) | MDI | 1440x224 | Traitement |
| 160.1.1 | [Update Ezcard (T2)](#t2) | - | - | |

### 9.4 Algorigramme

```mermaid
flowchart TD
    START([START])
    PROCESS[Traitement 2 taches]
    ENDOK([END])
    START --> PROCESS --> ENDOK
    style START fill:#3fb950,color:#000
    style ENDOK fill:#3fb950,color:#000
```

> *algo-data indisponible. Utiliser `/algorigramme` pour generer.*

<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (5)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 30 | gm-recherche_____gmr | Index de recherche | DB | R |   |   | 1 |
| 47 | compte_gm________cgm | Comptes GM (generaux) | DB |   |   | L | 1 |
| 312 | ez_card |  | DB |   | **W** | L | 2 |
| 612 | tempo_present_excel | Table temporaire ecran | TMP |   |   | L | 1 |
| 844 | stat_vendeur |  | TMP |   |   | L | 1 |

### Colonnes par table (2 / 2 tables avec colonnes identifiees)

<details>
<summary>Table 30 - gm-recherche_____gmr (R) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | v.num cmp | R | Unicode |
| B | v.retour carte deja attribuee | R | Logical |
| C | v.variable change en cours | R | Logical |
| D | v.last good row | R | Numeric |
| E | CHG_REASON_v.num cmp | R | Numeric |
| F | CHG_PRV_v.num cmp | R | Unicode |
| G | retour confirmation | R | Numeric |

</details>

<details>
<summary>Table 312 - ez_card (**W**/L) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | P.Card Id | W | Unicode |

</details>

## 11. VARIABLES

### 11.1 Variables de session (4)

Variables persistantes pendant toute la session.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | v.num cmp | Unicode | 3x session |
| B | v.retour carte deja attribuee | Logical | - |
| C | v.variable change en cours | Logical | - |
| D | v.last good row | Numeric | - |

### 11.2 Autres (3)

Variables diverses.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| E | CHG_REASON_v.num cmp | Numeric | - |
| F | CHG_PRV_v.num cmp | Unicode | 2x refs |
| G | retour confirmation | Numeric | - |

## 12. EXPRESSIONS

**26 / 26 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CONDITION | 11 | 5 |
| CALCULATION | 1 | 0 |
| CONSTANTE | 1 | 0 |
| OTHER | 7 | 0 |
| REFERENCE_VG | 1 | 0 |
| CAST_LOGIQUE | 2 | 0 |
| STRING | 2 | 0 |
| FORMAT | 1 | 0 |

### 12.2 Expressions cles par type

#### CONDITION (11 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 24 | `IF(Trim([AT])<>'' AND Trim([AT])<>Trim([AH]) AND [AU]=1,[AT],'')` | [RM-001](#rm-RM-001) |
| CONDITION | 17 | `[AU]<>1` | - |
| CONDITION | 16 | `[AU]=1` | - |
| CONDITION | 15 | `Trim([AT])='' AND Trim([AH])<>''` | - |
| CONDITION | 13 | `Trim([AT])<>'' AND Trim([AT])<>Trim([AH])` | - |
| ... | | *+6 autres* | |

#### CALCULATION (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CALCULATION | 7 | `CallProg('{160,-1}'PROG,[Y],[AC],[AD])` | - |

#### CONSTANTE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 14 | `1` | - |

#### OTHER (7 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 19 | `[U]` | - |
| OTHER | 23 | `NOT([AQ])` | - |
| OTHER | 26 | `CurRow(0)` | - |
| OTHER | 12 | `[AT]` | - |
| OTHER | 3 | `v.num cmp [A]` | - |
| ... | | *+2 autres* | |

#### REFERENCE_VG (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| REFERENCE_VG | 18 | `VG11` | - |

#### CAST_LOGIQUE (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 22 | `'FALSE'LOG` | - |
| CAST_LOGIQUE | 21 | `'TRUE'LOG` | - |

#### STRING (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| STRING | 5 | `Val(Left([H],2),'2')` | - |
| STRING | 4 | `Val(MID([H],3,10),'10')` | - |

#### FORMAT (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| FORMAT | 20 | `Str([AU],'#')` | - |

### 12.3 Toutes les expressions (26)

<details>
<summary>Voir les 26 expressions</summary>

#### CONDITION (11)

| IDE | Expression Decodee |
|-----|-------------------|
| 1 | `[I]<>'---' AND Trim(CHG_PRV_v.num cmp [F])<>''` |
| 2 | `[I]='---' OR Trim(CHG_PRV_v.num cmp [F])=''` |
| 11 | `[AI] AND ([AK]*1000+[AL]<>[AC]*1000+[AD] OR [AM]='O')` |
| 25 | `CtrlGoto('card_code',IF(CurRow(0)>[AR],CurRow(0)+1,CurRow(0)-1),0)` |
| 24 | `IF(Trim([AT])<>'' AND Trim([AT])<>Trim([AH]) AND [AU]=1,[AT],'')` |
| 9 | `[AG]='O'` |
| 16 | `[AU]=1` |
| 17 | `[AU]<>1` |
| 10 | `Trim([AH])<>''` |
| 13 | `Trim([AT])<>'' AND Trim([AT])<>Trim([AH])` |
| 15 | `Trim([AT])='' AND Trim([AH])<>''` |

#### CALCULATION (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 7 | `CallProg('{160,-1}'PROG,[Y],[AC],[AD])` |

#### CONSTANTE (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 14 | `1` |

#### OTHER (7)

| IDE | Expression Decodee |
|-----|-------------------|
| 3 | `v.num cmp [A]` |
| 6 | `[AC]` |
| 8 | `[AH]` |
| 12 | `[AT]` |
| 19 | `[U]` |
| 23 | `NOT([AQ])` |
| 26 | `CurRow(0)` |

#### REFERENCE_VG (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 18 | `VG11` |

#### CAST_LOGIQUE (2)

| IDE | Expression Decodee |
|-----|-------------------|
| 21 | `'TRUE'LOG` |
| 22 | `'FALSE'LOG` |

#### STRING (2)

| IDE | Expression Decodee |
|-----|-------------------|
| 4 | `Val(MID([H],3,10),'10')` |
| 5 | `Val(Left([H],2),'2')` |

#### FORMAT (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 20 | `Str([AU],'#')` |

</details>

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Garantie sur compte PMS-584 (IDE 0)](ADH-IDE-0.md) -> **Liste des GM (IDE 160)**

Main -> ... -> [VAD validés à imprimer (IDE 0)](ADH-IDE-0.md) -> **Liste des GM (IDE 160)**

```mermaid
graph LR
    T160[160 Liste des GM]
    style T160 fill:#58a6ff
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [0](ADH-IDE-0.md) | Garantie sur compte PMS-584 | 2 |
| [0](ADH-IDE-0.md) | VAD validés à imprimer | 1 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T160[160 Liste des GM]
    style T160 fill:#58a6ff
    NONE[Aucun callee]
    T160 -.-> NONE
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
| Lignes de logique | 112 | Programme compact |
| Expressions | 26 | Peu de logique |
| Tables WRITE | 1 | Impact faible |
| Sous-programmes | 0 | Peu de dependances |
| Ecrans visibles | 1 | Ecran unique ou traitement batch |
| Code desactive | 0.9% (1 / 112) | Code sain |
| Regles metier | 1 | Quelques regles a preserver |

### 14.2 Plan de migration par bloc

#### Traitement (2 taches: 1 ecran, 1 traitement)

- **Strategie** : Orchestrateur avec 1 ecrans (Razor/React) et 1 traitements backend (services).
- Les ecrans deviennent des composants UI, les traitements invisibles deviennent des services injectables.
- Decomposer les taches en services unitaires testables.

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| ez_card | Table WRITE (Database) | 1x | Schema + repository |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 07:19*
