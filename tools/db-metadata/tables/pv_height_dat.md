# pv_height_dat

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `num_order` | int | 10 | non |  | 6 |
| 2 | `height_range_feet` | nvarchar | 12 | non |  | 6 |
| 3 | `height_range_cm` | nvarchar | 12 | non |  | 1 |
| 4 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `num_order` (6 valeurs)

```
1, 2, 3, 4, 5, 6
```

### `height_range_feet` (6 valeurs)

```
<4'11", >6'4", 4'11" - 5'1", 5'11" - 6'4", 5'2" - 5'5", 5'6" - 5'10"
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_height_dat_IDX_1 | NONCLUSTERED | oui | pv_service, num_order |

