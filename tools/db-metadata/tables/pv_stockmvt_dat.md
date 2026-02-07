# pv_stockmvt_dat

| Info | Valeur |
|------|--------|
| Lignes | 28254 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `SMV_PV_Service` | nvarchar | 4 | non |  | 9 |
| 2 | `SMV_Product` | int | 10 | non |  | 385 |
| 3 | `SMV_Date` | char | 8 | non |  | 1324 |
| 4 | `SMV_Time` | char | 6 | non |  | 15839 |
| 5 | `SMV_Movement` | int | 10 | non |  | 8 |
| 6 | `SMV_In_ou_Out` | nvarchar | 3 | non |  | 2 |
| 7 | `SMV_User` | nvarchar | 8 | non |  | 18 |
| 8 | `SMV_PoS_ID` | float | 53 | non |  | 7600 |
| 9 | `SMV_Package_ID_OUT` | float | 53 | non |  | 16456 |
| 10 | `SMV_Quantity` | float | 53 | non |  | 338 |
| 11 | `SMV_Price_Sell` | float | 53 | non |  | 179 |
| 12 | `SMV_Price_Purchase` | float | 53 | non |  | 164 |
| 13 | `SMV_Sell_Volume` | float | 53 | non |  | 11 |
| 14 | `SMV_Reason` | nvarchar | 10 | non |  | 7 |
| 15 | `SMV_Comment` | nvarchar | 256 | non |  | 205 |

## Valeurs distinctes

### `SMV_PV_Service` (9 valeurs)

```
BARD, COMM, ESTH, EXCU, INFI, PHOT, REST, SPNA, SPTE
```

### `SMV_Movement` (8 valeurs)

```
1, 2, 3, 4, 5, 6, 8, 99
```

### `SMV_In_ou_Out` (2 valeurs)

```
In, Out
```

### `SMV_User` (18 valeurs)

```
ASSTFAM, BAR1, BARMGR, BTQ, CHUDA, EXC, EXC1, EXCMGR, FAM, NURSE, PHOTO, PRAKBAR, REST, RESTMGR, SCUBA, SPA1, SPA2, SPAMGR
```

### `SMV_Sell_Volume` (11 valeurs)

```
0, 1, 100, 150, 20, 33, 35, 4, 50, 70, 75
```

### `SMV_Reason` (7 valeurs)

```
, Broken, Corked, Defective, Expired, Incomplete, Tested
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_stockmvt_dat_IDX_2 | NONCLUSTERED | non | SMV_PV_Service, SMV_Package_ID_OUT, SMV_Product |
| pv_stockmvt_dat_IDX_1 | NONCLUSTERED | oui | SMV_PV_Service, SMV_Product, SMV_Date, SMV_Time, SMV_Package_ID_OUT |
| pv_stockmvt_dat_IDX_3 | NONCLUSTERED | non | SMV_PV_Service, SMV_Movement, SMV_Date, SMV_Time |

