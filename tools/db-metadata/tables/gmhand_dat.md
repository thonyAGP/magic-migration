# gmhand_dat

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `num_compte` | int | 10 | non |  | 1 |
| 3 | `num_filiation` | int | 10 | non |  | 1 |
| 4 | `code_handicap` | nvarchar | 2 | non |  | 1 |

## Valeurs distinctes

### `code_societe` (1 valeurs)

```
C
```

### `num_compte` (1 valeurs)

```
313620
```

### `num_filiation` (1 valeurs)

```
0
```

### `code_handicap` (1 valeurs)

```
O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| gmhand_dat_IDX_1 | NONCLUSTERED | oui | code_societe, num_compte, num_filiation |

