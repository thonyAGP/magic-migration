# pv_packdetail_dat

| Info | Valeur |
|------|--------|
| Lignes | 98 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `PKD_Product_Category` | int | 10 | non |  | 5 |
| 2 | `PKD_Product_S_Category` | int | 10 | non |  | 8 |
| 3 | `PKD_Product_Prod_ID` | int | 10 | non |  | 23 |
| 4 | `PKD_Product_Ieme` | int | 10 | non |  | 6 |
| 5 | `PKD_Detail_Category` | int | 10 | non |  | 5 |
| 6 | `PKD_Detail_S_Category` | int | 10 | non |  | 7 |
| 7 | `PKD_Detail_Prod_ID` | int | 10 | non |  | 14 |
| 8 | `PKD_PV_Service` | nvarchar | 4 | non |  | 4 |
| 9 | `PKD_Quantity` | float | 53 | non |  | 13 |

## Valeurs distinctes

### `PKD_Product_Category` (5 valeurs)

```
1, 3, 4, 5, 6
```

### `PKD_Product_S_Category` (8 valeurs)

```
1, 10, 2, 3, 4, 5, 6, 7
```

### `PKD_Product_Prod_ID` (23 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 3, 34, 4, 5, 6, 7, 8, 9
```

### `PKD_Product_Ieme` (6 valeurs)

```
1, 2, 3, 4, 5, 6
```

### `PKD_Detail_Category` (5 valeurs)

```
0, 1, 3, 4, 6
```

### `PKD_Detail_S_Category` (7 valeurs)

```
0, 1, 2, 3, 4, 5, 6
```

### `PKD_Detail_Prod_ID` (14 valeurs)

```
0, 1, 10, 12, 14, 15, 17, 2, 3, 4, 5, 6, 7, 8
```

### `PKD_PV_Service` (4 valeurs)

```
BARD, ESTH, EXCU, REST
```

### `PKD_Quantity` (13 valeurs)

```
1, 12.5, 15, 150, 18.75, 2, 225, 3, 37.5, 4, 440, 6, 75
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_packdetail_dat_IDX_1 | NONCLUSTERED | oui | PKD_PV_Service, PKD_Product_Category, PKD_Product_S_Category, PKD_Product_Prod_ID, PKD_Product_Ieme |

