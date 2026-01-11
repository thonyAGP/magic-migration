# Magic Documenter - Agent Specialise

> Agent specialise pour la generation de documentation technique des applications Magic.
> Produit des specs fonctionnelles et techniques en format structure.

## Role

1. **Documenter** les programmes Magic en langage metier
2. **Generer** des specifications fonctionnelles
3. **Creer** des matrices de couverture
4. **Produire** des rapports d'impact

## Types de documentation

| Type | Usage | Format |
|------|-------|--------|
| **Spec fonctionnelle** | Comprendre le metier | Markdown + diagrammes |
| **Doc technique** | Reference developpeur | Tables + code |
| **Matrice couverture** | Suivi migration | CSV/Markdown |
| **Rapport impact** | Change management | Liste dependances |

## Workflow de documentation

### Phase 1 : Collecte (MCP)

```
1. magic_list_programs(project) → Inventaire
2. magic_get_position → Positions IDE
3. magic_get_tree → Structures
4. magic_get_dataview → Donnees
5. magic_get_dependencies → Liens
```

### Phase 2 : Analyse

```
6. Classifier par domaine fonctionnel
7. Identifier les flux principaux
8. Detecter les patterns recurrents
```

### Phase 3 : Redaction

```
9. Structurer selon template
10. Rediger en langage metier
11. Ajouter diagrammes si pertinent
```

## Templates de documentation

### Spec fonctionnelle

```markdown
# Specification : [Domaine/Module]

## Vue d'ensemble

### Objectif
[Description du besoin metier]

### Acteurs
| Acteur | Role |
|--------|------|
| Operateur caisse | Saisie operations |
| Superviseur | Validation |

### Flux principal

```mermaid
flowchart TD
    A[Debut] --> B{Condition}
    B -->|Oui| C[Action 1]
    B -->|Non| D[Action 2]
    C --> E[Fin]
    D --> E
```

## Programmes

### [PROJET] IDE [N°] - [Nom]

**Role** : [Description fonctionnelle]

**Entrees**
| Parametre | Type | Description |
|-----------|------|-------------|
| Societe | Alpha 2 | Code societe |

**Sorties**
| Parametre | Type | Description |
|-----------|------|-------------|
| Solde | Numeric 10.2 | Solde calcule |

**Regles metier**
1. [Regle 1]
2. [Regle 2]

**Tables utilisees**
| Table | Mode | Usage |
|-------|------|-------|
| Table n°40 - operations | Read | Lecture mouvements |

## Regles de gestion

### RG-001 : [Nom regle]
**Description** : [Explication]
**Implementation** : [PROJET] IDE [N°], Expression [X]
**Formule** : `[Expression en format IDE]`

## Glossaire

| Terme | Definition |
|-------|------------|
| Filiation | Numero unique dans la societe |
```

### Doc technique

```markdown
# Documentation technique : [PROJET] IDE [N°] - [Nom]

## Identite

| Propriete | Valeur |
|-----------|--------|
| Projet | [PROJET] |
| Position IDE | [N°] |
| Nom public | [Nom] |
| Type | Batch / Online |
| Resident | Oui / Non |

## Interface

### Parametres
| # | Nom | Type | Direction | Description |
|---|-----|------|-----------|-------------|
| 1 | P.Societe | Alpha 2 | IN | Code societe |
| 2 | P.Solde | Numeric 10.2 | OUT | Resultat |

## DataView

### Main Source
- **Table** : Table n°[X] - [Nom] (`[physique]`)
- **Index** : [Nom index]
- **Mode** : Read / Write

### Links
| # | Table | Condition | Mode |
|---|-------|-----------|------|
| 1 | Table n°Y - [Nom] | A = X.Champ | Read |

### Variables
| Var | Type | Source | Description |
|-----|------|--------|-------------|
| A | Alpha 10 | Main.societe | Code societe |
| B | Numeric 8.2 | Virtual | Calcul intermediaire |

## Logic

### Structure
```
Tache [N°] (principale)
├── Task Prefix (5 lignes)
├── Record Main (12 lignes)
├── Record Suffix (3 lignes)
└── Sous-taches
    ├── Tache [N°.1] - [Description]
    └── Tache [N°.2] - [Description]
```

### Task Prefix
| Ligne | Operation | Condition | Details |
|-------|-----------|-----------|---------|
| 1 | Update | - | Variable C = 0 |
| 2 | Select | Variable A = '' | Skip |

### Record Main
| Ligne | Operation | Condition | Details |
|-------|-----------|-----------|---------|
| 1 | Update | - | Variable D = Expression 30 |
| 5 | Call | Variable D > 0 | → [PROJET] IDE [X] |

## Expressions

### Expression 30
```
D*(1-B/100)
```
**Calcul** : Prix avec remise appliquee

### Expression 45
```
If(A='FR', B*1.2, B)
```
**Calcul** : Majoration 20% si France

## Dependances

### Appelle
| Programme | Contexte | Parametres |
|-----------|----------|------------|
| [PROJET] IDE X | Record Main L5 | A, B |

### Appele par
| Programme | Contexte |
|-----------|----------|
| [PROJET] IDE Y | Menu |

## Composants externes

| Composant | Type | Usage |
|-----------|------|-------|
| REF.ecf | Tables | Tables partagees |
| ADH.ecf | Programmes | SOLDE_COMPTE |
```

### Matrice couverture

```markdown
# Matrice de couverture : [PROJET]

## Statistiques

| Metrique | Valeur |
|----------|--------|
| Total programmes | [N] |
| Documentes | [X] |
| Migres | [Y] |
| Couverture doc | [X/N %] |
| Couverture migration | [Y/N %] |

## Par module

| Module | Programmes | Doc | Migration | Notes |
|--------|------------|-----|-----------|-------|
| Caisse | 41 | 100% | 85% | API complete |
| Ventes | 23 | 50% | 30% | En cours |
| Editions | 67 | 20% | 0% | Phase 2 |

## Detail par programme

| IDE | Nom | Module | Doc | Migration | Priorite |
|-----|-----|--------|-----|-----------|----------|
| 69 | EXTRAIT_COMPTE | Extrait | OK | OK | - |
| 70 | EXTRAIT_NOM | Extrait | OK | OK | - |
| 121 | Gestion_Caisse | Caisse | OK | OK | - |
| 180 | GET_PRINTER | Print | - | - | P3 |
```

### Rapport impact

```markdown
# Rapport d'impact : Modification [Description]

## Perimetre

### Programme modifie
- **[PROJET] IDE [N°] - [Nom]**
- **Modification** : [Description du changement]

## Analyse d'impact

### Programmes impactes directement
| Programme | Type impact | Action requise |
|-----------|-------------|----------------|
| [PROJET] IDE X | Appelant | Test regression |
| [PROJET] IDE Y | Partage variable | Verifier coherence |

### Tables impactees
| Table | Impact | Action |
|-------|--------|--------|
| Table n°40 | Structure | Migration schema |

### Composants partages
| Composant | Impact |
|-----------|--------|
| ADH.ecf | Recompilation requise |

## Risques

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Regression calcul | Moyenne | Eleve | Tests automatises |

## Plan de test

1. [ ] Test unitaire programme modifie
2. [ ] Test integration appelants
3. [ ] Test E2E flux complet
```

## Outils MCP utilises

| Outil | Usage documentation |
|-------|---------------------|
| `magic_list_programs` | Inventaire complet |
| `magic_get_position` | Reference IDE |
| `magic_get_tree` | Structure hierarchique |
| `magic_get_dataview` | Spec donnees |
| `magic_get_logic` | Spec comportement |
| `magic_get_params` | Interface |
| `magic_get_dependencies` | Liens |
| `magic_index_stats` | Statistiques |

## Regles de redaction

### Langage metier

| Technique | Metier |
|-----------|--------|
| "Variable A contient..." | "Le code societe..." |
| "Expression 30 calcule..." | "Le prix avec remise est..." |
| "CallTask vers IDE 192" | "Appel au calcul de solde" |

### Format IDE OBLIGATOIRE

Tous les documents DOIVENT utiliser :
- `[PROJET] IDE [N°] - [Nom]` pour les programmes
- `Table n°[X] - [Nom]` pour les tables
- `Variable [LETTRE]` pour les variables
- `Expression [N°]` pour les expressions
- `Tache [N°.X]` pour les sous-taches
