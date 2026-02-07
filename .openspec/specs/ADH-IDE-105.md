# ADH IDE 105 - Maj des lignes saisies V3

> **Analyse**: Phases 1-4 2026-02-07 07:00 -> 07:00 (17s) | Assemblage 07:00
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 105 |
| Nom Programme | Maj des lignes saisies V3 |
| Fichier source | `Prg_105.xml` |
| Dossier IDE | Factures |
| Taches | 1 (0 ecrans visibles) |
| Tables modifiees | 1 |
| Programmes appeles | 0 |
| :warning: Statut | **ORPHELIN_POTENTIEL** |

## 2. DESCRIPTION FONCTIONNELLE

**Maj des lignes saisies V3** assure la gestion complete de ce processus.

**Donnees modifiees** : 1 tables en ecriture (comptable________cte).

**Logique metier** : 2 regles identifiees couvrant conditions metier, valeurs par defaut.

## 3. BLOCS FONCTIONNELS

## 5. REGLES METIER

2 regles identifiees:

### Autres (2 regles)

#### <a id="rm-RM-001"></a>[RM-001] Valeur par defaut si Trim(P.i.TypeReglement [G]) est vide

| Element | Detail |
|---------|--------|
| **Condition** | `Trim(P.i.TypeReglement [G])=''` |
| **Si vrai** | 'TRUE'LOG |
| **Si faux** | IF(Trim(P.i.TypeReglement [G])='I',[AC],[AJ])) |
| **Variables** | G (P.i.TypeReglement) |
| **Expression source** | Expression 17 : `IF(Trim(P.i.TypeReglement [G])='','TRUE'LOG,IF(Trim(P.i.Type` |
| **Exemple** | Si Trim(P.i.TypeReglement [G])='' â†’ 'TRUE'LOG. Sinon â†’ IF(Trim(P.i.TypeReglement [G])='I',[AC],[AJ])) |

#### <a id="rm-RM-002"></a>[RM-002] Si Trim(P.i.TypeReglement [G])='I' alors [AC] sinon [AJ])

| Element | Detail |
|---------|--------|
| **Condition** | `Trim(P.i.TypeReglement [G])='I'` |
| **Si vrai** | [AC] |
| **Si faux** | [AJ]) |
| **Variables** | G (P.i.TypeReglement) |
| **Expression source** | Expression 18 : `IF(Trim(P.i.TypeReglement [G])='I',[AC],[AJ])` |
| **Exemple** | Si Trim(P.i.TypeReglement [G])='I' â†’ [AC]. Sinon â†’ [AJ]) |

## 6. CONTEXTE

- **Appele par**: (aucun)
- **Appelle**: 0 programmes | **Tables**: 4 (W:1 R:0 L:3) | **Taches**: 1 | **Expressions**: 23

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
    DECISION{P.i.TypeReglement}
    PROCESS[Traitement]
    UPDATE[MAJ 1 tables]
    ENDOK([END OK])
    ENDKO([END KO])

    START --> INIT --> SAISIE --> DECISION
    DECISION -->|OUI| PROCESS
    DECISION -->|NON| ENDKO
    PROCESS --> UPDATE --> ENDOK

    style START fill:#3fb950,color:#000
    style ENDOK fill:#3fb950,color:#000
    style ENDKO fill:#f85149,color:#fff
    style DECISION fill:#58a6ff,color:#000
```

> **Legende**: Vert = START/END OK | Rouge = END KO | Bleu = Decisions
> *Algorigramme auto-genere. Utiliser `/algorigramme` pour une synthese metier detaillee.*

<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (4)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 40 | comptable________cte |  | DB |   | **W** |   | 1 |
| 263 | vente | Donnees de ventes | DB |   |   | L | 1 |
| 866 | maj_appli_tpe |  | DB |   |   | L | 1 |
| 870 | Rayons_Boutique |  | DB |   |   | L | 1 |

### Colonnes par table (2 / 1 tables avec colonnes identifiees)

<details>
<summary>Table 40 - comptable________cte (**W**) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | P.i.Societe | W | Unicode |
| B | P.i.Compte | W | Numeric |
| C | P.i.Flague | W | Logical |
| D | P.i.NumFac | W | Numeric |
| E | P.i.NomFacPDF | W | Alpha |
| F | P.i.SelectionManulle | W | Logical |
| G | P.i.TypeReglement | W | Unicode |
| H | P.i.Facture ECO | W | Logical |
| I | V retour Compta | W | Logical |
| J | v Retour Vente | W | Logical |
| K | v Trouvé Compta | W | Logical |
| L | v Trouvé Vente | W | Logical |

</details>

## 11. VARIABLES

### 11.1 Parametres entrants (8)

Variables recues en parametre.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | P.i.Societe | Unicode | 1x parametre entrant |
| B | P.i.Compte | Numeric | 1x parametre entrant |
| C | P.i.Flague | Logical | - |
| D | P.i.NumFac | Numeric | 1x parametre entrant |
| E | P.i.NomFacPDF | Alpha | 1x parametre entrant |
| F | P.i.SelectionManulle | Logical | 2x parametre entrant |
| G | P.i.TypeReglement | Unicode | 5x parametre entrant |
| H | P.i.Facture ECO | Logical | 2x parametre entrant |

### 11.2 Variables de session (4)

Variables persistantes pendant toute la session.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| I | V retour Compta | Logical | - |
| J | v Retour Vente | Logical | - |
| K | v Trouvé Compta | Logical | - |
| L | v Trouvé Vente | Logical | 1x session |

## 12. EXPRESSIONS

**23 / 23 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CAST_LOGIQUE | 2 | 5 |
| CONDITION | 7 | 5 |
| DATE | 2 | 0 |
| OTHER | 12 | 0 |

### 12.2 Expressions cles par type

#### CAST_LOGIQUE (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 17 | `IF(Trim(P.i.TypeReglement [G])='','TRUE'LOG,IF(Trim(P.i.TypeReglement [G])='I',[AC],[AJ]))` | [RM-001](#rm-RM-001) |
| CAST_LOGIQUE | 20 | `'FALSE'LOG` | - |

#### CONDITION (7 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 18 | `IF(Trim(P.i.TypeReglement [G])='I',[AC],[AJ])` | [RM-002](#rm-RM-002) |
| CONDITION | 11 | `[AC] AND Trim(P.i.TypeReglement [G])<>'D'` | - |
| CONDITION | 12 | `[AJ] AND Trim(P.i.TypeReglement [G])<>'I'` | - |
| CONDITION | 21 | `CndRange(Trim(P.i.TypeReglement [G])='',P.i.SelectionManulle [F])` | - |
| CONDITION | 1 | `[AE]=0 AND NOT P.i.Facture ECO [H]` | - |
| ... | | *+2 autres* | |

#### DATE (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| DATE | 9 | `Date()` | - |
| DATE | 4 | `Date()` | - |

#### OTHER (12 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 16 | `P.i.SelectionManulle [F]` | - |
| OTHER | 14 | `[V]` | - |
| OTHER | 13 | `[N]` | - |
| OTHER | 23 | `[AO]` | - |
| OTHER | 22 | `[AI]` | - |
| ... | | *+7 autres* | |

### 12.3 Toutes les expressions (23)

<details>
<summary>Voir les 23 expressions</summary>

#### CAST_LOGIQUE (2)

| IDE | Expression Decodee |
|-----|-------------------|
| 17 | `IF(Trim(P.i.TypeReglement [G])='','TRUE'LOG,IF(Trim(P.i.TypeReglement [G])='I',[AC],[AJ]))` |
| 20 | `'FALSE'LOG` |

#### CONDITION (7)

| IDE | Expression Decodee |
|-----|-------------------|
| 18 | `IF(Trim(P.i.TypeReglement [G])='I',[AC],[AJ])` |
| 1 | `[AE]=0 AND NOT P.i.Facture ECO [H]` |
| 2 | `[AP]=0 AND NOT P.i.Facture ECO [H]` |
| 15 | `[Q] = 0 OR [AE] = 0` |
| 11 | `[AC] AND Trim(P.i.TypeReglement [G])<>'D'` |
| 12 | `[AJ] AND Trim(P.i.TypeReglement [G])<>'I'` |
| 21 | `CndRange(Trim(P.i.TypeReglement [G])='',P.i.SelectionManulle [F])` |

#### DATE (2)

| IDE | Expression Decodee |
|-----|-------------------|
| 4 | `Date()` |
| 9 | `Date()` |

#### OTHER (12)

| IDE | Expression Decodee |
|-----|-------------------|
| 3 | `P.i.NumFac [D]` |
| 5 | `Time()` |
| 6 | `P.i.NomFacPDF [E]` |
| 7 | `P.i.Societe [A]` |
| 8 | `P.i.Compte [B]` |
| 10 | `[N]` |
| 13 | `[N]` |
| 14 | `[V]` |
| 16 | `P.i.SelectionManulle [F]` |
| 19 | `v Trouvé Vente [L]` |
| 22 | `[AI]` |
| 23 | `[AO]` |

</details>

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

**Chemin**: (pas de callers directs)

```mermaid
graph LR
    T105[105 Maj des lignes sai...]
    style T105 fill:#58a6ff
    NONE[Aucun caller]
    NONE -.-> T105
    style NONE fill:#6b7280,stroke-dasharray: 5 5
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| - | (aucun) | - |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T105[105 Maj des lignes sai...]
    style T105 fill:#58a6ff
    NONE[Aucun callee]
    T105 -.-> NONE
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
| Lignes de logique | 81 | Programme compact |
| Expressions | 23 | Peu de logique |
| Tables WRITE | 1 | Impact faible |
| Sous-programmes | 0 | Peu de dependances |
| Ecrans visibles | 0 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 81) | Code sain |
| Regles metier | 2 | Quelques regles a preserver |

### 14.2 Plan de migration par bloc

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| comptable________cte | Table WRITE (Database) | 1x | Schema + repository |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 07:00*
