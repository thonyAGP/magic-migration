# pv_typeaction_dat

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `action_desc` | nvarchar | 10 | non |  | 9 |
| 2 | `debit` | bit |  | non |  | 2 |
| 3 | `credit` | bit |  | non |  | 2 |
| 4 | `generate_rental` | bit |  | non |  | 2 |
| 5 | `update_rental` | bit |  | non |  | 2 |
| 6 | `update_coef` | int | 10 | non |  | 3 |
| 7 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `action_desc` (9 valeurs)

```
CANCEL, DOWNGRADE, EXCHANGE, EXTEND, RENTAL, RETURN-, RETURN+, SALE, UPGRADE
```

### `debit` (2 valeurs)

```
0, 1
```

### `credit` (2 valeurs)

```
0, 1
```

### `generate_rental` (2 valeurs)

```
0, 1
```

### `update_rental` (2 valeurs)

```
0, 1
```

### `update_coef` (3 valeurs)

```
0, 1, -1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_typeaction_dat_IDX_1 | NONCLUSTERED | oui | pv_service, action_desc |

