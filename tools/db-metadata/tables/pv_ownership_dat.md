# pv_ownership_dat

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ownership_id` | int | 10 | non |  | 3 |
| 2 | `ownership_label` | nvarchar | 20 | non |  | 3 |
| 3 | `pv_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `ownership_id` (3 valeurs)

```
1, 2, 3
```

### `ownership_label` (3 valeurs)

```
CLUBMED, LOC INTERSPORT, LOC ROSS
```

### `pv_service` (1 valeurs)

```
SKIN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_ownership_dat_IDX_1 | NONCLUSTERED | oui | pv_service, ownership_id |

