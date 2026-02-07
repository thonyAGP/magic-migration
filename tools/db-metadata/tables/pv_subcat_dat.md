# pv_subcat_dat

| Info | Valeur |
|------|--------|
| Lignes | 241 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cat` | int | 10 | non |  | 20 |
| 2 | `sub_cat` | int | 10 | non |  | 18 |
| 3 | `label` | nvarchar | 20 | non |  | 197 |
| 4 | `classification` | int | 10 | non |  | 27 |
| 5 | `id_aricle__imputation_` | int | 10 | non |  | 57 |
| 6 | `action_type` | nvarchar | 10 | non |  | 2 |
| 7 | `pv_service` | nvarchar | 4 | non |  | 18 |
| 8 | `id_booker` | int | 10 | non |  | 10 |
| 9 | `maximum_age_for_gratuity` | int | 10 | non |  | 1 |
| 10 | `alcooholic_products` | bit |  | non |  | 2 |
| 11 | `active` | bit |  | non |  | 2 |
| 12 | `meetings_event_only` | bit |  | non |  | 2 |
| 13 | `me_discount_percent` | float | 53 | non |  | 2 |

## Valeurs distinctes

### `cat` (20 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 3, 4, 5, 6, 7, 8, 9
```

### `sub_cat` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `classification` (27 valeurs)

```
0, 1, 10, 11, 15, 16, 17, 18, 19, 2, 20, 21, 23, 25, 26, 27, 28, 29, 3, 30, 31, 4, 5, 6, 7, 8, 9
```

### `action_type` (2 valeurs)

```
RENTAL, SALE
```

### `pv_service` (18 valeurs)

```
BABY, BARD, BOUT, CAIS, CMAF, COMM, ESTH, EXCU, GEST, INFI, MINI, PHOT, PLAN, REST, SKIN, SPNA, SPTE, STAN
```

### `id_booker` (10 valeurs)

```
0, 119, 207, 210, 221, 235, 277, 794, 818, 853
```

### `maximum_age_for_gratuity` (1 valeurs)

```
0
```

### `alcooholic_products` (2 valeurs)

```
0, 1
```

### `active` (2 valeurs)

```
0, 1
```

### `meetings_event_only` (2 valeurs)

```
0, 1
```

### `me_discount_percent` (2 valeurs)

```
0, 10
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_subcat_dat_IDX_1 | NONCLUSTERED | oui | pv_service, cat, sub_cat |

