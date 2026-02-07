# pv_sole_dat

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sole_lenght_range` | int | 10 | non |  | 6 |
| 2 | `sole_code` | nvarchar | 1 | non |  | 6 |
| 3 | `range_desc` | nvarchar | 12 | non |  | 6 |
| 4 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `sole_lenght_range` (6 valeurs)

```
0, 251, 271, 291, 311, 331
```

### `sole_code` (6 valeurs)

```
1, 2, 3, 4, 5, 6
```

### `range_desc` (6 valeurs)

```
000 - 250, 251 - 270, 271 - 290, 291 - 310, 311 - 330, 331
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_sole_dat_IDX_2 | NONCLUSTERED | oui | pv_service, sole_code |
| pv_sole_dat_IDX_1 | NONCLUSTERED | oui | pv_service, sole_lenght_range |

