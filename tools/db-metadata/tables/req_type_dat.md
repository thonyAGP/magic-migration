# req_type_dat

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `request_type` | nvarchar | 2 | non |  | 3 |
| 2 | `type_desc` | nvarchar | 20 | non |  | 3 |
| 3 | `default_priority` | nvarchar | 1 | non |  | 3 |
| 4 | `print_when_capture` | bit |  | non |  | 1 |
| 5 | `force_dispatch_when_capture` | bit |  | non |  | 1 |
| 6 | `delay__days_` | int | 10 | non |  | 1 |
| 7 | `delay__hours_` | int | 10 | non |  | 2 |

## Valeurs distinctes

### `request_type` (3 valeurs)

```
GM, GO, WO
```

### `type_desc` (3 valeurs)

```
GO + HK request, Guest request, Work Order
```

### `default_priority` (3 valeurs)

```
1, 2, 3
```

### `print_when_capture` (1 valeurs)

```
1
```

### `force_dispatch_when_capture` (1 valeurs)

```
1
```

### `delay__days_` (1 valeurs)

```
0
```

### `delay__hours_` (2 valeurs)

```
2, 4
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_type_dat_IDX_1 | NONCLUSTERED | oui | request_type, type_desc |

