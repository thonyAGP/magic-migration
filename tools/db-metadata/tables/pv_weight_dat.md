# pv_weight_dat

| Info | Valeur |
|------|--------|
| Lignes | 13 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `num_order` | int | 10 | non |  | 13 |
| 2 | `weight_range_pound` | nvarchar | 10 | non |  | 13 |
| 3 | `weight_range_kg` | nvarchar | 10 | non |  | 1 |
| 4 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `num_order` (13 valeurs)

```
1, 10, 11, 12, 13, 2, 3, 4, 5, 6, 7, 8, 9
```

### `weight_range_pound` (13 valeurs)

```
>209, 108 - 125, 126 - 147, 148 - 174, 175 - 209, 22 - 29, 30 - 38, 39 - 47, 47 - 66, 48 - 56, 67 - 78, 79 - 91, 92 - 107
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_weight_dat_IDX_1 | NONCLUSTERED | oui | pv_service, num_order |

