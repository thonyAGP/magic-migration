---
description: Generate migration contracts for an entire batch of programs
arguments:
  - name: batch_id
    description: "Batch identifier (e.g. B1, B2) or 'auto' to detect from live-programs.json"
    required: true
---

# Generation contrats de migration pour un batch

Genere les contrats SPECMAP pour tous les programmes du batch $ARGUMENTS.

## Batches predefinis

| Batch | Domaine SADT | Programmes racine | Description |
|-------|-------------|-------------------|-------------|
| B1 | A1.1 Ouverture session | IDE 122 + callees | **PILOTE** - Ouverture caisse complete |
| B2 | A1.2 Fermeture session | IDE 131 + callees | Fermeture caisse + bilan |
| B3 | A5 Ventes GP/Boutique | IDE 237, 238 + callees | Transactions vente |
| B4 | A2.1 Extrait compte | IDE 69-76 | Extraits de compte |
| B5 | A2.2 Separation/Fusion | IDE 27-37 | Separation et fusion comptes |
| B6 | A1.3 Coffre/Appro | IDE 123-125, 130 | Coffre et approvisionnement |
| B7 | A2.4 Garantie | IDE 111 + callees | Garantie sur compte |
| B8 | A3.2 Factures | IDE 97 + callees | Facturation |
| B9 | A4 Change | IDE 19-25 | Operations de change |
| B10 | Restants | Programmes LIVE non assignes | Restant |

## Workflow

### 1. Identifier les programmes du batch

- Lire `.openspec/migration/live-programs.json`
- Lire `.openspec/migration/dependency-graph.json`
- Identifier les programmes du batch (par domaine ou liste explicite)
- Trier par niveau (leaf-first = niveau 0 d'abord)

### 2. Pour chaque programme (leaf-first)

Executer la logique de `/magic-contract` :
1. EXTRACT : lire la spec
2. MAP : mapper les constructs
3. GAP : scanner le code React
4. CONTRACT : produire le YAML

### 3. Produire le plan de batch

Ecrire `.openspec/migration/batches/B{N}-{domain}.md` :

```markdown
# Batch B{N} - {Domaine}

## Status: IN_PROGRESS | CONTRACTED | ENRICHING | VERIFIED

## Programmes ({count})

| IDE | Nom | Niveau | Complexite | Contract | Status |
|-----|-----|--------|------------|----------|--------|
| ... | ... | 0 | BASSE | generated | contracted |

## Ordre de traitement (leaf-first)

1. Niveau 0 : [liste]
2. Niveau 1 : [liste]
...

## Statistiques

| Metrique | Valeur |
|----------|--------|
| Programmes | N |
| Regles metier | N |
| Callees total | N |
| Coverage moyenne | N% |

## Notes

[Observations, decisions]
```

### 4. Mettre a jour tracker.json

Ajouter le batch dans la liste `batches` du tracker.

## Parallelisation SWARM

Pour generer les contrats en parallele :
- Repartir les programmes par sous-ensembles de 5-6
- Chaque agent utilise `magic-contract-builder`
- Aucun conflit fichier (1 programme = 1 contrat YAML)
- Le lead collecte et produit le plan de batch

## Exemple

```
/magic-batch-contract B1    → 18 contrats pour l'ouverture session
/magic-batch-contract B3    → ~24 contrats pour les ventes
```
