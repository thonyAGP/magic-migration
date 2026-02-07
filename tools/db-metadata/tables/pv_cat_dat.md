# pv_cat_dat

| Info | Valeur |
|------|--------|
| Lignes | 92 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cat` | int | 10 | non |  | 21 |
| 2 | `label` | nvarchar | 20 | non |  | 79 |
| 3 | `pv_service` | nvarchar | 4 | non |  | 23 |
| 4 | `id_booker` | int | 10 | non |  | 8 |
| 5 | `active` | bit |  | non |  | 2 |
| 6 | `forfait_package` | bit |  | non |  | 2 |

## Valeurs distinctes

### `cat` (21 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 3, 4, 5, 6, 7, 8, 9
```

### `pv_service` (23 valeurs)

```
, ARZA, AUT1, BABY, BARD, BOUT, CAIS, CMAF, COMM, ESTH, EXCU, GEST, INFI, MINI, PHOT, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TRAF
```

### `id_booker` (8 valeurs)

```
0, 1, 140, 2, 25, 26, 30, 31
```

### `active` (2 valeurs)

```
0, 1
```

### `forfait_package` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_cat_dat_IDX_1 | NONCLUSTERED | oui | pv_service, cat |

