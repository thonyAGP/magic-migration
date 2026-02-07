# req_type_opt_dat

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `disp_dervice` | nvarchar | 5 | non |  | 3 |
| 2 | `request_type` | nvarchar | 2 | non |  | 3 |
| 3 | `default_priority` | nvarchar | 1 | non |  | 3 |
| 4 | `print_when_capture` | bit |  | non |  | 2 |
| 5 | `force_dispatch_when_capture` | bit |  | non |  | 2 |
| 6 | `delay__days_` | int | 10 | non |  | 2 |
| 7 | `delay__hours_` | int | 10 | non |  | 4 |
| 8 | `default_assignee` | nvarchar | 3 | non |  | 3 |

## Valeurs distinctes

### `disp_dervice` (3 valeurs)

```
HOUSE, MAINT, RECEP
```

### `request_type` (3 valeurs)

```
GM, GO, WO
```

### `default_priority` (3 valeurs)

```
1, 2, 3
```

### `print_when_capture` (2 valeurs)

```
0, 1
```

### `force_dispatch_when_capture` (2 valeurs)

```
0, 1
```

### `delay__days_` (2 valeurs)

```
0, 10
```

### `delay__hours_` (4 valeurs)

```
0, 1, 2, 4
```

### `default_assignee` (3 valeurs)

```
, HK1, ROU
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_type_opt_dat_IDX_1 | NONCLUSTERED | oui | disp_dervice, request_type |

