# ezimputation

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `libelle` | nvarchar | 20 | non |  | 1 |
| 3 | `article` | int | 10 | non |  | 1 |
| 4 | `tva` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `libelle` (1 valeurs)

```
BAR
```

### `article` (1 valeurs)

```
100
```

### `tva` (1 valeurs)

```
7
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ezimputation_IDX_1 | NONCLUSTERED | oui | societe, libelle |

