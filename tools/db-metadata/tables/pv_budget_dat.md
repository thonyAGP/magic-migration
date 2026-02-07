# pv_budget_dat

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pv_service` | nvarchar | 4 | non |  | 9 |
| 2 | `bdg_update` | float | 53 | non |  | 9 |
| 3 | `bdg_user` | nvarchar | 8 | non |  | 2 |
| 4 | `bdg_season` | int | 10 | non |  | 1 |
| 5 | `bdg_ca_global` | float | 53 | non |  | 9 |
| 6 | `bdg_hd_sold` | int | 10 | non |  | 4 |
| 7 | `bdg_cout_global` | float | 53 | non |  | 5 |

## Valeurs distinctes

### `pv_service` (9 valeurs)

```
BABY, BARD, ESTH, EXCU, GEST, MINI, REST, SPTE, TRAF
```

### `bdg_update` (9 valeurs)

```
7.36906e+010, 7.37074e+010, 7.37249e+010
```

### `bdg_user` (2 valeurs)

```
FAM, JOSE
```

### `bdg_season` (1 valeurs)

```
1
```

### `bdg_ca_global` (9 valeurs)

```
1.01, 172, 2.22, 28.96, 31.89, 352.21, 5.05, 6.06, 631.2
```

### `bdg_hd_sold` (4 valeurs)

```
1000, 104587, 110467, 110507
```

### `bdg_cout_global` (5 valeurs)

```
0, 111.8, 117.51, 53.6, 735.6
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_budget_dat_IDX_1 | NONCLUSTERED | oui | pv_service, bdg_season |

