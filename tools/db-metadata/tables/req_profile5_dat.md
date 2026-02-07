# req_profile5_dat

| Info | Valeur |
|------|--------|
| Lignes | 20 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_group` | nvarchar | 20 | non |  | 9 |
| 2 | `code_dispatch` | nvarchar | 8 | non |  | 3 |
| 3 | `default_filter_` | bit |  | non |  | 2 |

## Valeurs distinctes

### `code_group` (9 valeurs)

```
CHEF DE VILLAGE, ECONOMAT, INFORMATICIEN, MAINTENANCE, MAITRESSE DE MAISON, PLANNING, RECEPTION, SECRETAIRE, TRAFIC
```

### `code_dispatch` (3 valeurs)

```
HOUSE, MAINT, RECEP
```

### `default_filter_` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_profile5_dat_IDX_1 | NONCLUSTERED | oui | code_group, code_dispatch |
| req_profile5_dat_IDX_2 | NONCLUSTERED | oui | code_dispatch, code_group |

