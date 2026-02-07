# cafil042_dat

| Info | Valeur |
|------|--------|
| Lignes | 36 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ta2_nom_table` | nvarchar | 5 | non |  | 4 |
| 2 | `ta2_libelle_30` | nvarchar | 30 | non |  | 1 |
| 3 | `ta2_libelle_20` | nvarchar | 20 | non |  | 36 |
| 4 | `ta2_code_alpha_1` | nvarchar | 1 | non |  | 2 |
| 5 | `ta2_code_alpha_2` | nvarchar | 1 | non |  | 1 |
| 6 | `ta2_code_alpha_3` | nvarchar | 6 | non |  | 36 |
| 7 | `ta2_code_numeric_1` | float | 53 | non |  | 29 |
| 8 | `ta2_code_numeric_2` | int | 10 | non |  | 28 |
| 9 | `ta2_code_numeric_3` | int | 10 | non |  | 28 |
| 10 | `ta2_code_numeric_4` | int | 10 | non |  | 28 |
| 11 | `ta2_code_numeric_5` | int | 10 | non |  | 28 |

## Valeurs distinctes

### `ta2_nom_table` (4 valeurs)

```
CPOVE, CPROG, CSTAT, CTYCA
```

### `ta2_libelle_20` (36 valeurs)

```
AdhÃ©rents, arts appliquÃ©s, autres, balltrap, bar, boutique, caisse, casino, CLUB96.OBJ, coiffure, Ã©quitation, esthÃ©tique, excursion, Fin sÃ©jour, fitness, gestion, golf, hotesse, infirmerie, location voitures, Maintenance, mÃ©daille/inscription, Opposition, parking, PÃ©rimÃ©e, photographe, planning, pressing, ProblÃ¨me, restaurant, Service, ski, standard, trafic, Valide, vÃ©lo
```

### `ta2_code_alpha_1` (2 valeurs)

```
, 0
```

### `ta2_code_alpha_3` (36 valeurs)

```
, ADHERT, ARZA, AUTR, BALL, BAR, BOUT, CAIS, CASI, COIF, D, EQUI, ESTH, EXCU, F, FITN, GEST, GOLF, HOTE, INFI, LOCV, MAINT, MEDA, O, P, PARK, PHOT, PLAN, PRES, REST, SERVIC, SKI, STAN, TRAF, V, VELO
```

### `ta2_code_numeric_1` (29 valeurs)

```
0, 1, 3, 36, 41, 46, 49, 51, 52, 53, 54, 57, 60, 61, 64, 66, 67, 69, 71, 72, 73, 74, 75, 81, 82, 83, 84, 91, 98
```

### `ta2_code_numeric_2` (28 valeurs)

```
0, 35, 40, 45, 48, 50, 51, 52, 53, 56, 59, 60, 63, 65, 66, 68, 70, 71, 72, 73, 74, 80, 81, 82, 83, 90, 97, 98
```

### `ta2_code_numeric_3` (28 valeurs)

```
0, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500, 9900
```

### `ta2_code_numeric_4` (28 valeurs)

```
0, 1099, 1199, 1299, 1399, 1499, 1599, 1699, 1799, 1899, 1999, 2099, 2199, 2299, 2399, 2499, 2599, 2699, 2799, 2899, 2999, 3099, 3199, 3299, 3399, 3499, 3599, 9999
```

### `ta2_code_numeric_5` (28 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 3, 4, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil042_dat_IDX_2 | NONCLUSTERED | non | ta2_nom_table, ta2_code_alpha_3 |
| cafil042_dat_IDX_1 | NONCLUSTERED | oui | ta2_nom_table, ta2_code_alpha_3, ta2_code_numeric_1 |

