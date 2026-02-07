# code_fidelisation

**Nom logique Magic** : `code_fidelisation`

| Info | Valeur |
|------|--------|
| Lignes | 14 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_langue` | nvarchar | 3 | non |  | 2 |
| 2 | `code` | nvarchar | 1 | non |  | 7 |
| 3 | `libelle` | nvarchar | 25 | non |  | 7 |
| 4 | `couleur` | smallint | 5 | non |  | 5 |
| 5 | `priorite` | smallint | 5 | non |  | 2 |
| 6 | `affichage` | bit |  | non |  | 2 |
| 7 | `ordre_priorite_affichage` | smallint | 5 | non |  | 5 |

## Valeurs distinctes

### `code_langue` (2 valeurs)

```
ANG, FRA
```

### `code` (7 valeurs)

```
A, G, I, O, P, S, T
```

### `libelle` (7 valeurs)

```
AGENT, GO, GOLD, INDIRECT, PLATINUM, SILVER, TURQUOISE
```

### `couleur` (5 valeurs)

```
141, 152, 190, 209, 6
```

### `priorite` (2 valeurs)

```
0, 2
```

### `affichage` (2 valeurs)

```
0, 1
```

### `ordre_priorite_affichage` (5 valeurs)

```
0, 10, 20, 40, 50
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| code_fidelisation_IDX_1 | NONCLUSTERED | oui | code_langue, code |

