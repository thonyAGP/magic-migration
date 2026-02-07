# pv_typemvt_dat

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `MTY_Code` | int | 10 | non |  | 9 |
| 2 | `MTY_Description` | nvarchar | 20 | non |  | 9 |
| 3 | `MTY_PV_Service` | nvarchar | 4 | non |  | 2 |
| 4 | `MTY_In_ou_Out` | nvarchar | 3 | non |  | 2 |
| 5 | `MTY_Reason_Needed` | bit |  | non |  | 2 |

## Valeurs distinctes

### `MTY_Code` (9 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 8, 99
```

### `MTY_Description` (9 valeurs)

```
Initial stock, Out of stock, Reception, Regul. (negative), Regul. (positive), Regul. Balance, Regul. GO Sales, Sales, Sales Cancellation
```

### `MTY_PV_Service` (2 valeurs)

```
, M
```

### `MTY_In_ou_Out` (2 valeurs)

```
In, Out
```

### `MTY_Reason_Needed` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_typemvt_dat_IDX_1 | NONCLUSTERED | oui | MTY_PV_Service, MTY_Code |

