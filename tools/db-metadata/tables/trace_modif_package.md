# trace_modif_package

**Nom logique Magic** : `trace_modif_package`

| Info | Valeur |
|------|--------|
| Lignes | 50497 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pacm_chrono` | int | 10 | non |  | 50497 |
| 2 | `pacm_type_modif` | nvarchar | 1 | non |  | 3 |
| 3 | `pacm_service` | nvarchar | 4 | non |  | 13 |
| 4 | `pacm_cat` | int | 10 | non |  | 33 |
| 5 | `pacm_sub_cat` | int | 10 | non |  | 20 |
| 6 | `pacm_prod_id` | int | 10 | non |  | 36 |
| 7 | `pacm_date_modif` | char | 8 | non |  | 1387 |
| 8 | `pacm_heure_modif` | char | 8 | non |  | 25328 |
| 9 | `pacm_user` | nvarchar | 8 | non |  | 26 |
| 10 | `pacm_ancien_enreg` | nvarchar | 200 | non |  | 10887 |
| 11 | `pacm_nouvel_enreg` | nvarchar | 200 | non |  | 10882 |

## Valeurs distinctes

### `pacm_type_modif` (3 valeurs)

```
C, M, S
```

### `pacm_service` (13 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, GEST, INFI, MINI, PHOT, REST, SPNA, SPTE
```

### `pacm_cat` (33 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 23, 24, 25, 26, 27, 28, 29, 3, 30, 32, 33, 34, 4, 5, 6, 7, 8, 9
```

### `pacm_sub_cat` (20 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 3, 4, 5, 6, 7, 8, 9
```

### `pacm_prod_id` (36 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 4, 5, 6, 7, 8, 9
```

### `pacm_user` (26 valeurs)

```
ASSTFAM, BAR1, BAR2, BAR3, BARMGR, BTQ, CHUDA, DSIOP, EXC, EXC1, EXCMGR, FAM, FAMILLE, NURSE, PHOTO, PRAKBAR, REST, RESTMGR, SALES, SCUBA, SPA, SPA1, SPA2, SPA3, SPAE, SPAMGR
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| trace_modif_package_IDX_1 | NONCLUSTERED | oui | pacm_chrono |
| trace_modif_package_IDX_2 | NONCLUSTERED | non | pacm_service, pacm_cat, pacm_sub_cat, pacm_prod_id |

