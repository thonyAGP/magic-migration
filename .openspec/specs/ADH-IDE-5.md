# ADH IDE 5 - Alimentation Combos NATION P

> **Analyse**: Phases 1-4 2026-02-07 03:37 -> 03:38 (33s) | Assemblage 12:42
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 5 |
| Nom Programme | Alimentation Combos NATION P |
| Fichier source | `Prg_5.xml` |
| Dossier IDE | General |
| Taches | 1 (0 ecrans visibles) |
| Tables modifiees | 0 |
| Programmes appeles | 1 |
| Complexite | **BASSE** (score 5/100) |

## 2. DESCRIPTION FONCTIONNELLE

**ADH IDE 5 alimenté les listes déroulantes de nationalité (combos) utilisées par le système de gestion de caisse. Il lit une chaîne brute depuis la table `pms_footer_comment`, la formate en supprimant les espaces inutiles, et ajoute intelligemment des séparateurs (virgules) entre les occurrences multiples. Le programme construit ainsi une liste composée de codes et libellés de nationalité (variables `[C]` et `[D]`) qu'il expose comme paramètre global `NATIONALITEP` à destination du menu appelant (IDE 7 - Menu Data Catching).**

**Avant de finaliser le résultat, ADH IDE 5 appelle le programme IDE 6 (Suppression Carac interdit) pour nettoyer les caractères illégaux—notamment les tirets (`-`) qu'il remplace par des underscores (`_`). Cette normalisation assure que les patterns de nationalité (comme "FRANCE-EU" → "FRANCE_EU") respectent les contraintes de la base de données et de l'interface utilisateur, évitant les problèmes de sérialisation ou de parsing.**

**Ce programme joue un rôle auxiliaire dans le processus de "data catching" : il prépare et valide les données métier avant qu'elles ne soient exploitées par le formulaire de sélection de nationalité affiché en écran modal. Son exécution est rapide et sans risque de régression, étant donné la simplicité logique et l'absence de modifications de données.**

## 3. BLOCS FONCTIONNELS

### 3.1 Traitement (1 tache)

Traitements internes.

---

#### <a id="t1"></a>5 - Sélection Nationalité [[ECRAN]](#ecran-t1)

**Role** : Traitement : Sélection Nationalité.
**Ecran** : 310 x 152 DLU (MDI) | [Voir mockup](#ecran-t1)
**Delegue a** : [    Suppression Carac interdit (IDE 6)](ADH-IDE-6.md)


## 5. REGLES METIER

*(Aucune regle metier identifiee dans les expressions)*

## 6. CONTEXTE

- **Appele par**: [Menu Data Catching (IDE 7)](ADH-IDE-7.md)
- **Appelle**: 1 programmes | **Tables**: 1 (W:0 R:1 L:0) | **Taches**: 1 | **Expressions**: 2

<!-- TAB:Ecrans -->

## 8. ECRANS

*(Programme sans ecran visible)*

## 9. NAVIGATION

### 9.3 Structure hierarchique (1 tache)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **5.1** | [**Sélection Nationalité** (5)](#t1) [mockup](#ecran-t1) | MDI | 310x152 | Traitement |

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

### Tables utilisees (1)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 364 | pms_footer_comment |  | DB | R |   |   | 1 |

### Colonnes par table (0 / 1 tables avec colonnes identifiees)

<details>
<summary>Table 364 - pms_footer_comment (R) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

## 11. VARIABLES

*(Programme sans variables locales mappees)*

## 12. EXPRESSIONS

**2 / 2 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| OTHER | 1 | 0 |
| CONCATENATION | 1 | 0 |

### 12.2 Expressions cles par type

#### OTHER (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 2 | `SetParam ('NATIONALITEP',v.Chaine [A])` | - |

#### CONCATENATION (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONCATENATION | 1 | `Trim (v.Chaine [A])&Trim (IF (Counter (0)=1,'',',')&[D]&' '&[C])` | - |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Menu Data Catching (IDE 7)](ADH-IDE-7.md) -> **Alimentation Combos NATION P (IDE 5)**

```mermaid
graph LR
    T5[5 Alimentation Combos ...]
    style T5 fill:#58a6ff
    CC7[7 Menu Data Catching]
    style CC7 fill:#8b5cf6
    CC7 --> T5
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [7](ADH-IDE-7.md) | Menu Data Catching | 1 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T5[5 Alimentation Combos ...]
    style T5 fill:#58a6ff
    C6[6 Suppression Carac in...]
    T5 --> C6
    style C6 fill:#3fb950
```

### 13.4 Detail Callees avec contexte

| IDE | Nom Programme | Appels | Contexte |
|-----|---------------|--------|----------|
| [6](ADH-IDE-6.md) |     Suppression Carac interdit | 1 | Validation saisie |

## 14. RECOMMANDATIONS MIGRATION

### 14.1 Profil du programme

| Metrique | Valeur | Impact migration |
|----------|--------|-----------------|
| Lignes de logique | 10 | Programme compact |
| Expressions | 2 | Peu de logique |
| Tables WRITE | 0 | Impact faible |
| Sous-programmes | 1 | Peu de dependances |
| Ecrans visibles | 0 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 10) | Code sain |
| Regles metier | 0 | Pas de regle identifiee |

### 14.2 Plan de migration par bloc

#### Traitement (1 tache: 1 ecran, 0 traitement)

- **Strategie** : 1 composant(s) UI (Razor/React) avec formulaires et validation.
- 1 sous-programme(s) a migrer ou a reutiliser depuis les services existants.
- Decomposer les taches en services unitaires testables.

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| [    Suppression Carac interdit (IDE 6)](ADH-IDE-6.md) | Sous-programme | 1x | Normale - Validation saisie |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 12:44*
