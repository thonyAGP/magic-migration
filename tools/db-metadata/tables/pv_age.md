# pv_age

**Nom logique Magic** : `pv_age`

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pvg_id` | int | 10 | non |  | 3 |
| 2 | `pvg_label` | nvarchar | 128 | non |  | 3 |
| 3 | `pvg_service` | nvarchar | 4 | non |  | 1 |
| 4 | `pvg_age_min` | int | 10 | non |  | 3 |
| 5 | `pvg_age_max` | int | 10 | non |  | 3 |

## Valeurs distinctes

### `pvg_id` (3 valeurs)

```
1, 2, 3
```

### `pvg_label` (3 valeurs)

```
10 YEARS AND LESS, 11 TO 49 YEARS, 50 YEARS AND MORE
```

### `pvg_service` (1 valeurs)

```
SKIN
```

### `pvg_age_min` (3 valeurs)

```
0, 11, 50
```

### `pvg_age_max` (3 valeurs)

```
10, 49, 999
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_age_IDX_1 | NONCLUSTERED | oui | pvg_id |

