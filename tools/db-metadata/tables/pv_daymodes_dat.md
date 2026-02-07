# pv_daymodes_dat

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `id` | nvarchar | 10 | non |  | 3 |
| 2 | `increment_date_end` | float | 53 | non |  | 3 |
| 3 | `description` | nvarchar | 100 | non |  | 1 |
| 4 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `id` (3 valeurs)

```
AM, MID-DAY, PM
```

### `increment_date_end` (3 valeurs)

```
0, 0.5, 1
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_daymodes_dat_IDX_1 | NONCLUSTERED | oui | pv_service, id |

