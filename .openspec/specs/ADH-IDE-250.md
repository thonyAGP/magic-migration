# ADH IDE 250 - Lancement Choix Chambre

> **Analyse**: Phases 1-4 2026-02-07 03:54 -> 03:54 (35s) | Assemblage 03:54
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 250 |
| Nom Programme | Lancement Choix Chambre |
| Fichier source | `Prg_250.xml` |
| Dossier IDE | Navigation |
| Taches | 1 (0 ecrans visibles) |
| Tables modifiees | 0 |
| Programmes appeles | 1 |

## 2. DESCRIPTION FONCTIONNELLE

**Lancement Choix Chambre** assure la gestion complete de ce processus, accessible depuis [Print reçu change (IDE 290)](ADH-IDE-290.md), [Transaction Nouv vente PMS-584 (IDE 0)](ADH-IDE-0.md), [Transaction Nouv vente PMS-710 (IDE 0)](ADH-IDE-0.md), [Transaction Nouv vente PMS-721 (IDE 0)](ADH-IDE-0.md).

Le flux de traitement s'organise en **1 blocs fonctionnels** :

- **Consultation** (1 tache) : ecrans de recherche, selection et consultation

**Logique metier** : 1 regles identifiees couvrant conditions metier.

## 3. BLOCS FONCTIONNELS

### 3.1 Consultation (1 tache)

Ecrans de recherche et consultation.

---

#### <a id="t1"></a>250 - Creation/Affichage change [[ECRAN]](#ecran-t1)

**Role** : Reinitialisation : Creation/Affichage change.
**Ecran** : 874 x 210 DLU (MDI) | [Voir mockup](#ecran-t1)
**Delegue a** : [Choix PYR (plusieurs chambres) (IDE 248)](ADH-IDE-248.md)


## 5. REGLES METIER

1 regles identifiees:

### Autres (1 regles)

#### <a id="rm-RM-001"></a>[RM-001] Si Retour [A] alors 'Retour Ok !' sinon 'Retour Non Ok !')

| Element | Detail |
|---------|--------|
| **Condition** | `Retour [A]` |
| **Si vrai** | 'Retour Ok !' |
| **Si faux** | 'Retour Non Ok !') |
| **Variables** | A (Retour) |
| **Expression source** | Expression 4 : `IF(Retour [A],'Retour Ok !','Retour Non Ok !')` |
| **Exemple** | Si Retour [A] â†’ 'Retour Ok !'. Sinon â†’ 'Retour Non Ok !') |

## 6. CONTEXTE

- **Appele par**: [Print reçu change (IDE 290)](ADH-IDE-290.md), [Transaction Nouv vente PMS-584 (IDE 0)](ADH-IDE-0.md), [Transaction Nouv vente PMS-710 (IDE 0)](ADH-IDE-0.md), [Transaction Nouv vente PMS-721 (IDE 0)](ADH-IDE-0.md)
- **Appelle**: 1 programmes | **Tables**: 0 (W:0 R:0 L:0) | **Taches**: 1 | **Expressions**: 4

<!-- TAB:Ecrans -->

## 8. ECRANS

*(Programme sans ecran visible)*

## 9. NAVIGATION

### 9.3 Structure hierarchique (1 tache)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **250.1** | [**Creation/Affichage change** (250)](#t1) [mockup](#ecran-t1) | MDI | 874x210 | Consultation |

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

### Tables utilisees (0)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|

### Colonnes par table (0 / 0 tables avec colonnes identifiees)

## 11. VARIABLES

*(Programme sans variables locales mappees)*

## 12. EXPRESSIONS

**4 / 4 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CONDITION | 1 | 5 |
| CONSTANTE | 3 | 0 |

### 12.2 Expressions cles par type

#### CONDITION (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 4 | `IF(Retour [A],'Retour Ok !','Retour Non Ok !')` | [RM-001](#rm-RM-001) |

#### CONSTANTE (3 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 3 | `3` | - |
| CONSTANTE | 2 | `186707` | - |
| CONSTANTE | 1 | `'C'` | - |

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Print reçu change (IDE 290)](ADH-IDE-290.md) -> **Lancement Choix Chambre (IDE 250)**

Main -> ... -> [Transaction Nouv vente PMS-584 (IDE 0)](ADH-IDE-0.md) -> **Lancement Choix Chambre (IDE 250)**

Main -> ... -> [Transaction Nouv vente PMS-710 (IDE 0)](ADH-IDE-0.md) -> **Lancement Choix Chambre (IDE 250)**

Main -> ... -> [Transaction Nouv vente PMS-721 (IDE 0)](ADH-IDE-0.md) -> **Lancement Choix Chambre (IDE 250)**

```mermaid
graph LR
    T250[250 Lancement Choix Ch...]
    style T250 fill:#58a6ff
    CC295[295 Menu change bilateral]
    style CC295 fill:#8b5cf6
    CC293[293 Bi Change GM Achat]
    style CC293 fill:#f59e0b
    CC290[290 Print reçu change]
    style CC290 fill:#3fb950
    CC293 --> CC290
    CC295 --> CC293
    CC290 --> T250
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [290](ADH-IDE-290.md) | Print reçu change | 7 |
| [0](ADH-IDE-0.md) | Transaction Nouv vente PMS-584 | 3 |
| [0](ADH-IDE-0.md) | Transaction Nouv vente PMS-710 | 3 |
| [0](ADH-IDE-0.md) | Transaction Nouv vente PMS-721 | 3 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T250[250 Lancement Choix Ch...]
    style T250 fill:#58a6ff
    C248[248 Choix PYR plusieur...]
    T250 --> C248
    style C248 fill:#3fb950
```

### 13.4 Detail Callees avec contexte

| IDE | Nom Programme | Appels | Contexte |
|-----|---------------|--------|----------|
| [248](ADH-IDE-248.md) | Choix PYR (plusieurs chambres) | 1 | Selection/consultation |

## 14. RECOMMANDATIONS MIGRATION

### 14.1 Profil du programme

| Metrique | Valeur | Impact migration |
|----------|--------|-----------------|
| Lignes de logique | 5 | Programme compact |
| Expressions | 4 | Peu de logique |
| Tables WRITE | 0 | Impact faible |
| Sous-programmes | 1 | Peu de dependances |
| Ecrans visibles | 0 | Ecran unique ou traitement batch |
| Code desactive | 0% (0 / 5) | Code sain |
| Regles metier | 1 | Quelques regles a preserver |

### 14.2 Plan de migration par bloc

#### Consultation (1 tache: 1 ecran, 0 traitement)

- **Strategie** : Composants de recherche/selection en modales.
- 1 ecran : Creation/Affichage change

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| [Choix PYR (plusieurs chambres) (IDE 248)](ADH-IDE-248.md) | Sous-programme | 1x | Normale - Selection/consultation |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 03:55*
