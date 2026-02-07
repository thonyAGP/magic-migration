# pv_bindingset_dat

| Info | Valeur |
|------|--------|
| Lignes | 17 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `num_order` | int | 10 | non |  | 17 |
| 2 | `weight_range` | nvarchar | 10 | non |  | 14 |
| 3 | `height_range` | nvarchar | 12 | non |  | 7 |
| 4 | `skier_code` | nvarchar | 2 | non |  | 17 |
| 5 | `setting_1` | float | 53 | non |  | 9 |
| 6 | `setting_2` | float | 53 | non |  | 12 |
| 7 | `setting_3` | float | 53 | non |  | 9 |
| 8 | `setting_4` | float | 53 | non |  | 10 |
| 9 | `setting_5` | float | 53 | non |  | 11 |
| 10 | `setting_6` | float | 53 | non |  | 10 |
| 11 | `pv_service` | nvarchar | 4 | non |  | 1 |
| 12 | `RowId_375` | int | 10 | non |  | 17 |

## Valeurs distinctes

### `num_order` (17 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `weight_range` (14 valeurs)

```
, >209, 108 - 125, 126 - 147, 148 - 174, 175 - 209, 22 - 29, 30 - 38, 39 - 47, 47 - 66, 48 - 56, 67 - 78, 79 - 91, 92 - 107
```

### `height_range` (7 valeurs)

```
, <4'11", >6'4", 4'11" - 5'5", 5'11" - 6'4", 5'2" - 5'5", 5'6" - 5'10"
```

### `skier_code` (17 valeurs)

```
A, AA, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P
```

### `setting_1` (9 valeurs)

```
0, 0.5, 0.75, 1, 1.5, 1.75, 2.25, 2.75, 3.5
```

### `setting_2` (12 valeurs)

```
0, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4.5, 5.5
```

### `setting_3` (9 valeurs)

```
0, 1.5, 1.75, 2.25, 2.75, 3, 4, 5, 6
```

### `setting_4` (10 valeurs)

```
0, 1.5, 2, 2.5, 3, 3.5, 4.5, 5.5, 6.5, 8
```

### `setting_5` (11 valeurs)

```
0, 10, 11.5, 2.25, 2.75, 3.5, 4, 5, 6, 7, 8.5
```

### `setting_6` (10 valeurs)

```
0, 11, 2.5, 3, 3.5, 4.5, 5.5, 6.5, 8, 9.5
```

### `pv_service` (1 valeurs)

```
SKIN
```

### `RowId_375` (17 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_bindingset_dat_IDX_1 | NONCLUSTERED | non | pv_service, num_order |
| pv_bindingset_dat_IDX_3 | NONCLUSTERED | non | pv_service, height_range |
| pv_bindingset_dat_IDX_5 | NONCLUSTERED | oui | RowId_375 |
| pv_bindingset_dat_IDX_2 | NONCLUSTERED | non | pv_service, weight_range |
| pv_bindingset_dat_IDX_4 | NONCLUSTERED | non | pv_service, skier_code |

