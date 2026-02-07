# ADH IDE 32 - Write histo_Fus_Sep_Saisie

> **Analyse**: Phases 1-4 2026-02-07 03:42 -> 03:42 (26s) | Assemblage 13:07
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 32 |
| Nom Programme | Write histo_Fus_Sep_Saisie |
| Fichier source | `Prg_32.xml` |
| Dossier IDE | General |
| Taches | 1 (0 ecrans visibles) |
| Tables modifiees | 1 |
| Programmes appeles | 0 |
| Complexite | **BASSE** (score 7/100) |

## 2. DESCRIPTION FONCTIONNELLE

# ADH IDE 32 - Write histo_Fus_Sep_Saisie

**Objectif métier** : Enregistrer l'historique des saisies de fusion/séparation dans la table `histo_fusionseparation_saisie`. Ce programme agit comme un audit trail des modifications effectuées lors des opérations de fusion ou séparation de comptes. Il capture les données saisies par l'utilisateur avant leur intégration aux tables principales, permettant une traçabilité complète des changements.

**Flux technique** : Le programme reçoit les paramètres de fusion/séparation depuis le programme appelant (Fusion IDE 28), les formate et écrit une ligne dans la table historique. Chaque enregistrement contient un timestamp, l'identifiant de l'opération, les données originales et l'utilisateur ayant effectué la saisie. Cette approche assure que même en cas de rollback ou d'annulation, la tentative de modification reste documentée.

**Relation avec le contexte** : Ce programme s'inscrit dans la chaîne de traitement des fusions/séparations de comptes (ADH IDE 27-28), où IDe 28 orchestre l'opération. L'historique devient critique pour les audits réglementaires et la résolution de litiges clients concernant les modifications de compte. La table `histo_fusionseparation_saisie` peut être interrogée pour reconstituer l'historique exact des tentatives de fusion/séparation.

## 3. BLOCS FONCTIONNELS

### 3.1 Traitement (1 tache)

Traitements internes.

---

#### <a id="t1"></a>32 - (sans nom)

**Role** : Traitement interne.


## 5. REGLES METIER

*(Aucune regle metier identifiee dans les expressions)*

## 6. CONTEXTE

- **Appele par**: [Fusion (IDE 28)](ADH-IDE-28.md)
- **Appelle**: 0 programmes | **Tables**: 1 (W:1 R:0 L:0) | **Taches**: 1 | **Expressions**: 12

<!-- TAB:Ecrans -->

## 8. ECRANS

*(Programme sans ecran visible)*

## 9. NAVIGATION

### 9.3 Structure hierarchique (1 tache)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **32.1** | [**(sans nom)** (32)](#t1) | MDI | - | Traitement |

### 9.4 Algorigramme

```mermaid
flowchart TD
    START([START])
    INIT[Init controles]
    SAISIE[Traitement principal]
    UPDATE[MAJ 1 tables]
    ENDOK([END OK])

    START --> INIT --> SAISIE
    SAISIE --> UPDATE --> ENDOK

    style START fill:#3fb950,color:#000
    style ENDOK fill:#3fb950,color:#000
```

> **Legende**: Vert = START/END OK | Rouge = END KO | Bleu = Decisions
> *Algorigramme auto-genere. Utiliser `/algorigramme` pour une synthese metier detaillee.*

<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (1)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 343 | histo_fusionseparation_saisie | Historique / journal | DB |   | **W** |   | 1 |

### Colonnes par table (1 / 1 tables avec colonnes identifiees)

<details>
<summary>Table 343 - histo_fusionseparation_saisie (**W**) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | i chrono E/F | W | Numeric |
| B | i societe | W | Alpha |
| C | i compte reference | W | Numeric |
| D | i filiation reference | W | Numeric |
| E | i compte pointe old | W | Numeric |
| F | i filiation pointe old | W | Numeric |
| G | i compte pointe new | W | Numeric |
| H | i filiation pointe new | W | Numeric |
| I | i type E/F | W | Alpha |
| J | i nom | W | Alpha |
| K | i prenom | W | Alpha |

</details>

## 11. VARIABLES

### 11.1 Autres (11)

Variables diverses.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | i chrono E/F | Numeric | 1x refs |
| B | i societe | Alpha | 1x refs |
| C | i compte reference | Numeric | 1x refs |
| D | i filiation reference | Numeric | 1x refs |
| E | i compte pointe old | Numeric | 1x refs |
| F | i filiation pointe old | Numeric | 1x refs |
| G | i compte pointe new | Numeric | 1x refs |
| H | i filiation pointe new | Numeric | 1x refs |
| I | i type E/F | Alpha | 1x refs |
| J | i nom | Alpha | 2x refs |
| K | i prenom | Alpha | 2x refs |

## 12. EXPRESSIONS

**12 / 12 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| OTHER | 11 | 0 |
| CONCATENATION | 1 | 0 |

### 12.2 Expressions cles par type

#### OTHER (11 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 8 | `i filiation pointe new [H]` | - |
| OTHER | 7 | `i compte pointe new [G]` | - |
| OTHER | 9 | `i type E/F [I]` | - |
| OTHER | 11 | `i prenom [K]` | - |
| OTHER | 10 | `i nom [J]` | - |
| ... | | *+6 autres* | |

#### CONCATENATION (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONCATENATION | 12 | `Trim (i nom [J])&' '&Trim (i prenom [K])` | - |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Fusion (IDE 28)](ADH-IDE-28.md) -> **Write histo_Fus_Sep_Saisie (IDE 32)**

```mermaid
graph LR
    T32[32 Write histo_Fus_Sep...]
    style T32 fill:#58a6ff
    CC1[1 Main Program]
    style CC1 fill:#8b5cf6
    CC163[163 Menu caisse GM - s...]
    style CC163 fill:#f59e0b
    CC37[37 Menu changement compte]
    style CC37 fill:#f59e0b
    CC28[28 Fusion]
    style CC28 fill:#3fb950
    CC37 --> CC28
    CC163 --> CC37
    CC1 --> CC163
    CC28 --> T32
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [28](ADH-IDE-28.md) | Fusion | 4 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T32[32 Write histo_Fus_Sep...]
    style T32 fill:#58a6ff
    NONE[Aucun callee]
    T32 -.-> NONE
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
| Expressions | 12 | Peu de logique |
| Tables WRITE | 1 | Impact faible |
| Sous-programmes | 0 | Peu de dependances |
| Ecrans visibles | 0 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 34) | Code sain |
| Regles metier | 0 | Pas de regle identifiee |

### 14.2 Plan de migration par bloc

#### Traitement (1 tache: 0 ecran, 1 traitement)

- **Strategie** : 1 service(s) backend injectable(s) (Domain Services).
- Decomposer les taches en services unitaires testables.

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| histo_fusionseparation_saisie | Table WRITE (Database) | 1x | Schema + repository |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 13:08*
