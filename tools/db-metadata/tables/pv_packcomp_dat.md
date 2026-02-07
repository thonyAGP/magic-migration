# pv_packcomp_dat

| Info | Valeur |
|------|--------|
| Lignes | 35 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cat` | int | 10 | non |  | 9 |
| 2 | `sub_cat` | int | 10 | non |  | 9 |
| 3 | `type_matos_id` | int | 10 | non |  | 13 |
| 4 | `classification` | int | 10 | non |  | 28 |
| 5 | `auto_rental_generate` | bit |  | non |  | 2 |
| 6 | `pv_service` | nvarchar | 4 | non |  | 2 |

## Valeurs distinctes

### `cat` (9 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 8, 9
```

### `sub_cat` (9 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 8, 9
```

### `type_matos_id` (13 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 2, 4, 5, 8, 9
```

### `classification` (28 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 23, 24, 25, 26, 27, 28, 3, 4, 5, 6, 7, 8, 9
```

### `auto_rental_generate` (2 valeurs)

```
0, 1
```

### `pv_service` (2 valeurs)

```
INFI, SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_packcomp_dat_IDX_1 | NONCLUSTERED | oui | pv_service, cat, sub_cat, type_matos_id |

