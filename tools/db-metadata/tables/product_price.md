# product_price

**Nom logique Magic** : `product_price`

| Info | Valeur |
|------|--------|
| Lignes | 53 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `prp_id` | int | 10 | non |  | 53 |
| 2 | `prp_seminar_name` | nvarchar | 20 | non |  | 8 |
| 3 | `prp_service` | nvarchar | 4 | non |  | 3 |
| 4 | `prp_cat` | int | 10 | non |  | 9 |
| 5 | `prp_sub_cat` | int | 10 | non |  | 10 |
| 6 | `prp_product` | int | 10 | non |  | 14 |
| 7 | `prp_unit_price` | float | 53 | non |  | 31 |
| 8 | `prp_reduct_percent` | float | 53 | non |  | 5 |
| 9 | `prp_reduct_price` | float | 53 | non |  | 31 |
| 10 | `prp_prise_en_charge_sem` | bit |  | non |  | 1 |

## Valeurs distinctes

### `prp_seminar_name` (8 valeurs)

```
, AdsHelper, CM CHINA, GLENAIR KOREA, LASNE VOYAGE, Lion TA , LOREAL KOREA, Swifty Consulting
```

### `prp_service` (3 valeurs)

```
BARD, ESTH, EXCU
```

### `prp_cat` (9 valeurs)

```
1, 10, 12, 16, 2, 3, 6, 8, 9
```

### `prp_sub_cat` (10 valeurs)

```
1, 10, 11, 13, 2, 3, 4, 5, 7, 9
```

### `prp_product` (14 valeurs)

```
1, 10, 17, 18, 2, 20, 21, 3, 4, 5, 6, 7, 8, 9
```

### `prp_unit_price` (31 valeurs)

```
1000, 1120, 1400, 1402.5, 1440, 1500, 1572.5, 1600, 1800, 1870, 2000, 20800, 2300, 2500, 2550, 2660, 2745.5, 2800, 4140, 4200, 4500, 5000, 5310, 560, 700, 7000, 810, 8800, 90, 900, 9800
```

### `prp_reduct_percent` (5 valeurs)

```
0, 10, 100, 20, 30
```

### `prp_reduct_price` (31 valeurs)

```
1000, 1120, 1400, 1402.5, 1440, 1500, 1572.5, 1600, 1800, 1870, 2000, 20800, 2300, 2500, 2550, 2660, 2745.5, 2800, 4140, 4200, 4500, 5000, 5310, 560, 700, 7000, 810, 8800, 90, 900, 9800
```

### `prp_prise_en_charge_sem` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| product_price_IDX_1 | NONCLUSTERED | oui | prp_id |

