# ADH IDE 121 - Gestion caisse

> **Analyse**: Phases 1-4 2026-01-29 09:26 -> 09:26 (8s) | Assemblage 18:03
> **Pipeline**: V7.0 Deep Analysis
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 121 |
| Nom Programme | Gestion caisse |
| Fichier source | `Prg_121.xml` |
| Domaine metier | Caisse |
| Taches | 32 (2 ecrans visibles) |
| Tables modifiees | 4 |
| Programmes appeles | 18 |

## 2. DESCRIPTION FONCTIONNELLE

**Gestion caisse** assure la gestion complete de ce processus, accessible depuis Menu caisse GM - scroll, Fermeture Sessions.

Le flux de traitement s'organise en **7 blocs fonctionnels** :

- **Traitement** (23 taches) : traitements metier divers
- **Creation** (2 taches) : insertion d'enregistrements en base (mouvements, prestations)
- **Saisie** (2 taches) : ecrans de saisie utilisateur (formulaires, champs, donnees)
- **Validation** (2 taches) : controles et verifications de coherence
- **Initialisation** (1 taches) : reinitialisation d'etats et de variables de travail
- **Impression** (1 taches) : generation de tickets et documents
- **Calcul** (1 taches) : calculs de montants, stocks ou compteurs

Le programme delegue des operations a **18 sous-programmes** couvrant :

- **Calcul de donnees** : Calcul concurrence sessions
- **Impression ticket/document** : Ticket appro remise, Reimpression tickets fermeture
- **Programme fidelite** : Remise en caisse
- **Recuperation donnees** : Recuperation du titre
- **Reinitialisation** : Init apport article session WS, Init devise session WS

**Donnees modifiees** : 4 tables en ecriture (concurrence_sessions, saisie_approvisionnement, histo_sessions_caisse, sessions_coffre2).

## 3. BLOCS FONCTIONNELS

### 3.1 Traitement (23 taches)

- **Gestion de la caisse** (T7, MDI, 939x178)
- **Concurrence sessions for devel** (T32, MDI, 524x236)
- *Internes*: Gestion caisse (T1), Paramètres caisse (T2), Paramètres caisse (T4), Etat de la caisse (T6), Existe histo (T8), Ouverture caisse (T9), Cloture en cours v1 (T10), histo coffre2 (T13), Fermeture caisse (T15), Clôture histo session (T16), Apport coffre (T17), Apport produit (T18), Remise au coffre (T19), Historique (T21), Consultation (T22), Remise au coffre (T24), Open sessions (T25), Pointage (T26), Read Sessions (T27), Remise au coffre (T28), histo coffre2 (T31)
- **Sous-programmes**: Mise à jour detail session WS (IDE 134), Contrôles - Integrite dates (IDE 48), Ouverture caisse (IDE 122), Fermeture caisse (IDE 131), Recuperation du titre (IDE 43), Apport coffre (IDE 123), Apport articles (IDE 124), Remise en caisse (IDE 125), Historique session (IDE 132), Raisons utilisation ADH (IDE 231)

### 3.2 Validation (2 taches)

- *Internes*: Controle COFFRE2 (T3), Controle monnaie/produit (T11)
- **Sous-programmes**: Controle fermeture caisse WS (IDE 155), Verif session caisse ouverte2 (IDE 156)

### 3.3 Calcul (1 taches)

- *Internes*: Date comptable (T5)
- **Sous-programmes**: Calcul concurrence sessions (IDE 116)

### 3.4 Creation (2 taches)

- *Internes*: Creation histo session (T12), Creation histo session (T30)
- **Tables modifiees**: histo_sessions_caisse

### 3.5 Saisie (2 taches)

- *Internes*: init tempo saisie dev (T14), RAZ Saisie devises P/V (T20)

### 3.6 Impression (1 taches)

- *Internes*: reimprimer tickets (T23)
- **Sous-programmes**: Ticket appro remise (IDE 139), Reimpression tickets fermeture (IDE 151)

### 3.7 Initialisation (1 taches)

- *Internes*: Ligne Initiale (T29)
- **Sous-programmes**: Init apport article session WS (IDE 140), Init devise session WS (IDE 141)

## 5. REGLES METIER

*(Aucune regle metier identifiee)*

## 6. CONTEXTE

- **Appele par**: Menu caisse GM - scroll (IDE 163), Fermeture Sessions (IDE 281)
- **Appelle**: 18 programmes | **Tables**: 12 (W:4 R:8 L:5) | **Taches**: 32 | **Expressions**: 7

<!-- TAB:Ecrans -->

## 8. ECRANS

### 8.1 Forms visibles (2 / 32)

| # | Tache | Nom | Type | Largeur | Hauteur |
|---|-------|-----|------|---------|---------|
| 1 | 7 | Gestion de la caisse | MDI | 939 | 178 |
| 2 | 32 | Concurrence sessions for devel | MDI | 524 | 236 |

### 8.2 Mockups Ecrans

```
+=============================================+
| Gestion de la caisse [MDI] 939x178 - Tach... |
+---------------------------------------------+
|  [Phase 2: controles reels]                 |
|                                             |
|                                             |
|                                             |
+=============================================+

+============================+
| Concurrence sessions for... |
+----------------------------+
|  [Phase 2: controles reels]|
|                            |
|                            |
|                            |
|                            |
+============================+

```

## 9. NAVIGATION

### 9.1 Enchainement des ecrans

```mermaid
flowchart TD
    START([Entree])
    style START fill:#3fb950
    F1[Gestion de la caisse]
    START --> F1
    F2[Concurrence sessions f...]
    F1 --> F2
    FIN([Sortie])
    style FIN fill:#f85149
    F2 --> FIN
```

### 9.2 Logique decisionnelle

*(Pas de regles metier pour l'algorigramme)*

### 9.3 Structure hierarchique (32 taches)

- **121.1** Gestion caisse  (MDI) *[Traitement]*
- **121.2** Paramètres caisse  (SDI) *[Traitement]*
- **121.3** Controle COFFRE2  (MDI) *[Validation]*
- **121.4** Paramètres caisse  (MDI) *[Traitement]*
- **121.5** Date comptable  (MDI) *[Calcul]*
- **121.6** Etat de la caisse  (MDI) *[Traitement]*
- **121.7** Gestion de la caisse **[ECRAN]** (MDI) 939x178 *[Traitement]*
- **121.8** Existe histo  (MDI) *[Traitement]*
- **121.9** Ouverture caisse  (MDI) *[Traitement]*
- **121.10** Cloture en cours v1  (MDI) *[Traitement]*
- **121.11** Controle monnaie/produit  (MDI) *[Validation]*
- **121.12** Creation histo session  (MDI) *[Creation]*
- **121.13** histo coffre2  (MDI) *[Traitement]*
- **121.14** init tempo saisie dev  (MDI) *[Saisie]*
- **121.15** Fermeture caisse  (MDI) *[Traitement]*
- **121.16** Clôture histo session  (MDI) *[Traitement]*
- **121.17** Apport coffre  (MDI) *[Traitement]*
- **121.18** Apport produit  (MDI) *[Traitement]*
- **121.19** Remise au coffre  (MDI) *[Traitement]*
- **121.20** RAZ Saisie devises P/V  (MDI) *[Saisie]*
- **121.21** Historique  (MDI) *[Traitement]*
- **121.22** Consultation  (MDI) *[Traitement]*
- **121.23** reimprimer tickets  (MDI) *[Impression]*
- **121.24** Remise au coffre  (MDI) *[Traitement]*
- **121.25** Open sessions  (MDI) *[Traitement]*
- **121.26** Pointage  (MDI) *[Traitement]*
- **121.27** Read Sessions  (MDI) *[Traitement]*
- **121.28** Remise au coffre  (MDI) *[Traitement]*
- **121.29** Ligne Initiale  (MDI) *[Initialisation]*
- **121.30** Creation histo session  (MDI) *[Creation]*
- **121.31** histo coffre2  (MDI) *[Traitement]*
- **121.32** Concurrence sessions for devel **[ECRAN]** (MDI) 524x236 *[Traitement]*

<!-- TAB:Donnees -->

## 10. TABLES

### 10.1 Tables utilisees (12)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 23 | reseau_cloture___rec | Donnees reseau/cloture | DB | R |   |   | 1 |
| 70 | date_comptable___dat |  | DB | R |   |   | 1 |
| 197 | articles_en_stock |  | DB |   |   | L | 1 |
| 198 | coupures_monnaie_locale |  | DB | R |   |   | 1 |
| 227 | concurrence_sessions |  | DB |   | **W** |   | 1 |
| 232 | gestion_devise_session |  | DB | R |   |   | 1 |
| 244 | saisie_approvisionnement |  | DB |   | **W** | L | 2 |
| 246 | histo_sessions_caisse |  | DB | R | **W** | L | 6 |
| 248 | sessions_coffre2 |  | DB |   | **W** | L | 3 |
| 249 | histo_sessions_caisse_detail |  | DB | R |   | L | 4 |
| 697 | droits_applications |  | DB | R |   |   | 2 |
| 740 | pv_stock_movements |  | DB | R |   |   | 2 |

### 10.2 Colonnes par table

*[Phase 2] Analyse des colonnes lues (R) et modifiees (W) par table avec details depliables.*

## 11. VARIABLES

### 11.1 Variables principales (Top 20 par usage / 31)

| Cat | Lettre | Nom Variable | Type | Usages | Ref |
|-----|--------|--------------|------|--------|-----|
| Autre | **N** | Param VIL open sessions | Alpha | 1x | `{0,14}` |
| Autre | **J** | Param Uni/Bi | Alpha | - | `{0,10}` |
| Autre | **H** | Param nom village | Alpha | - | `{0,8}` |
| Autre | **I** | Param masque cumul | Alpha | - | `{0,9}` |
| Autre | **E** | Param nbre decimale | Numeric | - | `{0,5}` |
| Autre | **D** | Param devise locale | Alpha | - | `{0,4}` |
| Autre | **G** | Param code village | Alpha | - | `{0,7}` |
| Autre | **F** | Param masque montant | Alpha | - | `{0,6}` |
| Autre | **P** | p.i.Hostl coffre2 | Unicode | - | `{0,16}` |
| Autre | **Q** | i.Host courant coffre 2 ? | Logical | - | `{0,17}` |
| Autre | **BB** | COFFRE 2 est ouvert | Logical | - | `{0,54}` |
| Autre | **O** | Param FROM_IMS | Alpha | - | `{0,15}` |
| Autre | **K** | Param Village TAI | Alpha | - | `{0,11}` |
| Autre | **L** | Param Mode consultation | Logical | - | `{0,12}` |
| Autre | **M** | p.i.Terminal coffre2 | Numeric | - | `{0,13}` |
| Autre | **C** | Param societe | Alpha | - | `{0,3}` |
| V. | **V** | V Time ouverture | Time | - | `{0,22}` |
| V. | **W** | V Date Fin session | Date | - | `{0,23}` |
| V. | **X** | V Last Chrono | Numeric | - | `{0,24}` |
| V. | **U** | V Date ouverture | Date | - | `{0,21}` |

### 11.2 Toutes les variables (31)

<details>
<summary>Voir les 31 variables</summary>

| Cat | Lettre | Nom Variable | Type | Ref |
|-----|--------|--------------|------|-----|
| Autre | **A** | Param Libelle caisse | Alpha | `{0,1}` |
| Autre | **B** | Param Etat caisse | Alpha | `{0,2}` |
| Autre | **C** | Param societe | Alpha | `{0,3}` |
| Autre | **D** | Param devise locale | Alpha | `{0,4}` |
| Autre | **E** | Param nbre decimale | Numeric | `{0,5}` |
| Autre | **F** | Param masque montant | Alpha | `{0,6}` |
| Autre | **G** | Param code village | Alpha | `{0,7}` |
| Autre | **H** | Param nom village | Alpha | `{0,8}` |
| Autre | **I** | Param masque cumul | Alpha | `{0,9}` |
| Autre | **J** | Param Uni/Bi | Alpha | `{0,10}` |
| Autre | **K** | Param Village TAI | Alpha | `{0,11}` |
| Autre | **L** | Param Mode consultation | Logical | `{0,12}` |
| Autre | **M** | p.i.Terminal coffre2 | Numeric | `{0,13}` |
| Autre | **N** | Param VIL open sessions | Alpha | `{0,14}` |
| Autre | **O** | Param FROM_IMS | Alpha | `{0,15}` |
| Autre | **P** | p.i.Hostl coffre2 | Unicode | `{0,16}` |
| Autre | **Q** | i.Host courant coffre 2 ? | Logical | `{0,17}` |
| Autre | **BB** | COFFRE 2 est ouvert | Logical | `{0,54}` |
| V. | **R** | V Date comptable | Date | `{0,18}` |
| V. | **S** | V session active | Logical | `{0,19}` |
| V. | **T** | V User ouverture | Alpha | `{0,20}` |
| V. | **U** | V Date ouverture | Date | `{0,21}` |
| V. | **V** | V Time ouverture | Time | `{0,22}` |
| V. | **W** | V Date Fin session | Date | `{0,23}` |
| V. | **X** | V Last Chrono | Numeric | `{0,24}` |
| V. | **Y** | V N° caisse reception mini | Numeric | `{0,25}` |
| V. | **Z** | V N° caisse reception maxi | Numeric | `{0,26}` |
| V. | **BA** | V Cloture en cours | Logical | `{0,53}` |
| V. | **BC** | V avec coffre 2 | Alpha | `{0,55}` |
| V. | **BD** | V cloture auto | Alpha | `{0,56}` |
| V. | **BE** | v.fin | Logical | `{0,57}` |

</details>

## 12. EXPRESSIONS

**7 / 7 expressions decodees (100%)**

### 12.1 Repartition par bloc

| Bloc fonctionnel | Expressions | Regles |
|-----------------|-------------|--------|
| Autre | 7 | 0 |

### 12.2 Expressions cles par bloc

#### Autre (7 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANT | 3 | `'D'` | - |
| OTHER | 5 | `'TRUE'LOG` | - |
| OTHER | 6 | `NOT([AE])` | - |
| OTHER | 7 | `VG111` | - |
| OTHER | 1 | `Param VIL open sessions [N]='O'` | - |
| ... | | *+2 autres* | |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> Menu caisse GM - scroll (IDE 163) -> **Gestion caisse (IDE 121)**

Main -> ... -> Fermeture Sessions (IDE 281) -> **Gestion caisse (IDE 121)**

```mermaid
graph LR
    T121[121 Gestion caisse]
    style T121 fill:#58a6ff
    CC1[1 Main Program]
    style CC1 fill:#8b5cf6
    CC163[163 Menu caisse GM - s...]
    style CC163 fill:#3fb950
    CC281[281 Fermeture Sessions]
    style CC281 fill:#3fb950
    CC1 --> CC163
    CC1 --> CC281
    CC163 --> T121
    CC281 --> T121
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| 163 | Menu caisse GM - scroll | 2 |
| 281 | Fermeture Sessions | 1 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T121[121 Gestion caisse]
    style T121 fill:#58a6ff
    C116[116 Calcul concurrence...]
    T121 --> C116
    style C116 fill:#3fb950
    C134[134 Mise à jour detail...]
    T121 --> C134
    style C134 fill:#3fb950
    C139[139 Ticket appro remise]
    T121 --> C139
    style C139 fill:#3fb950
    C48[48 Contrôles - Integri...]
    T121 --> C48
    style C48 fill:#3fb950
    C122[122 Ouverture caisse]
    T121 --> C122
    style C122 fill:#3fb950
    C131[131 Fermeture caisse]
    T121 --> C131
    style C131 fill:#3fb950
    C155[155 Controle fermeture...]
    T121 --> C155
    style C155 fill:#3fb950
    C43[43 Recuperation du titre]
    T121 --> C43
    style C43 fill:#3fb950
    C119[119 Affichage sessions]
    T121 --> C119
    style C119 fill:#3fb950
    C123[123 Apport coffre]
    T121 --> C123
    style C123 fill:#3fb950
    C124[124 Apport articles]
    T121 --> C124
    style C124 fill:#3fb950
    C125[125 Remise en caisse]
    T121 --> C125
    style C125 fill:#3fb950
    C132[132 Historique session]
    T121 --> C132
    style C132 fill:#3fb950
    C140[140 Init apport articl...]
    T121 --> C140
    style C140 fill:#3fb950
    C141[141 Init devise sessio...]
    T121 --> C141
    style C141 fill:#3fb950
    C151[151 Reimpression ticke...]
    T121 --> C151
    style C151 fill:#3fb950
    C156[156 Verif session cais...]
    T121 --> C156
    style C156 fill:#3fb950
    C231[231 Raisons utilisatio...]
    T121 --> C231
    style C231 fill:#3fb950
```

### 13.4 Detail Callees avec contexte

| IDE | Nom Programme | Appels | Contexte |
|-----|---------------|--------|----------|
| 116 | Calcul concurrence sessions | 12 | Calcul de donnees |
| 134 | Mise à jour detail session WS | 3 | [Phase 2] |
| 139 | Ticket appro remise | 3 | Impression ticket/document |
| 48 | Contrôles - Integrite dates | 2 | [Phase 2] |
| 122 | Ouverture caisse | 2 | [Phase 2] |
| 131 | Fermeture caisse | 2 | [Phase 2] |
| 155 | Controle fermeture caisse WS | 2 | [Phase 2] |
| 43 | Recuperation du titre | 1 | Recuperation donnees |
| 119 | Affichage sessions | 1 | [Phase 2] |
| 123 | Apport coffre | 1 | [Phase 2] |
| 124 | Apport articles | 1 | [Phase 2] |
| 125 | Remise en caisse | 1 | Programme fidelite |
| 132 | Historique session | 1 | [Phase 2] |
| 140 | Init apport article session WS | 1 | Reinitialisation |
| 141 | Init devise session WS | 1 | Reinitialisation |
| 151 | Reimpression tickets fermeture | 1 | Impression ticket/document |
| 156 | Verif session caisse ouverte2 | 1 | [Phase 2] |
| 231 | Raisons utilisation ADH | 1 | [Phase 2] |

## 14. RECOMMANDATIONS MIGRATION

### 14.1 Profil du programme

| Metrique | Valeur | Impact migration |
|----------|--------|-----------------|
| Lignes de logique | 678 | Programme volumineux |
| Expressions | 7 | Peu de logique |
| Tables WRITE | 4 | Impact modere |
| Sous-programmes | 18 | Forte dependance - migrer les callees en priorite |
| Ecrans visibles | 2 | Quelques ecrans |
| Code desactive | 0% (0 / 678) | Code sain |
| Regles metier | 0 | Pas de regle identifiee |

**Estimation effort**: ~**15 jours** de developpement

### 14.2 Plan de migration par bloc

#### Traitement (23 taches: 2 ecrans, 21 traitements)

- Traitement standard a migrer

#### Validation (2 taches: 0 ecrans, 2 traitements)

- Transformer les conditions en validators (FluentValidation ou equivalent)

#### Calcul (1 taches: 0 ecrans, 1 traitements)

- Migrer la logique de calcul (stock, compteurs, montants)

#### Creation (2 taches: 0 ecrans, 2 traitements)

- Insertion de donnees via repository pattern

#### Saisie (2 taches: 0 ecrans, 2 traitements)

- Implementer les validations cote client et serveur

#### Impression (1 taches: 0 ecrans, 1 traitements)

- Remplacer par generation PDF/HTML
- Configurer le systeme d'impression

#### Initialisation (1 taches: 0 ecrans, 1 traitements)

- Reinitialisation dans le constructeur ou methode Init()

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| concurrence_sessions | Table WRITE (Database) | 1x | Schema + repository |
| saisie_approvisionnement | Table WRITE (Database) | 1x | Schema + repository |
| histo_sessions_caisse | Table WRITE (Database) | 4x | Schema + repository |
| sessions_coffre2 | Table WRITE (Database) | 2x | Schema + repository |
| IDE 116 - Calcul concurrence sessions | Sous-programme | 12x | **CRITIQUE** - Calcul de donnees |
| IDE 139 - Ticket appro remise | Sous-programme | 3x | **CRITIQUE** - Impression ticket/document |
| IDE 134 - Mise à jour detail session WS | Sous-programme | 3x | **CRITIQUE** - [Phase 2] |
| IDE 131 - Fermeture caisse | Sous-programme | 2x | Haute - [Phase 2] |
| IDE 155 - Controle fermeture caisse WS | Sous-programme | 2x | Haute - [Phase 2] |
| IDE 48 - Contrôles - Integrite dates | Sous-programme | 2x | Haute - [Phase 2] |
| IDE 122 - Ouverture caisse | Sous-programme | 2x | Haute - [Phase 2] |
| IDE 141 - Init devise session WS | Sous-programme | 1x | Normale - Reinitialisation |
| IDE 140 - Init apport article session WS | Sous-programme | 1x | Normale - Reinitialisation |
| IDE 151 - Reimpression tickets fermeture | Sous-programme | 1x | Normale - Impression ticket/document |

---
*Spec DETAILED generee par Pipeline V7.0 - 2026-01-29 18:03*
