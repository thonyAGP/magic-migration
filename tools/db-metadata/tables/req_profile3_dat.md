# req_profile3_dat

| Info | Valeur |
|------|--------|
| Lignes | 19 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_group` | nvarchar | 20 | non |  | 13 |
| 2 | `code_type_loc` | nvarchar | 8 | non |  | 2 |
| 3 | `default_filter_` | bit |  | non |  | 2 |

## Valeurs distinctes

### `code_group` (13 valeurs)

```
ANIMATION, CHEF DE VILLAGE, ECONOMAT, INFIRMERIE, INFORMATICIEN, MAINTENANCE, MAITRESSE DE MAISON, MINI CLUB, PLANNING, RECEPTION, SECRETAIRE, SPORT, TRAFIC
```

### `code_type_loc` (2 valeurs)

```
ROOM, SERVICE
```

### `default_filter_` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_profile3_dat_IDX_1 | NONCLUSTERED | oui | code_group, code_type_loc |
| req_profile3_dat_IDX_2 | NONCLUSTERED | oui | code_type_loc, code_group |

