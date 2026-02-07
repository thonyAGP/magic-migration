# req_disp_dat

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `disp_id` | nvarchar | 5 | non |  | 3 |
| 2 | `disp_desc` | nvarchar | 15 | non |  | 3 |

## Valeurs distinctes

### `disp_id` (3 valeurs)

```
HOUSE, MAINT, RECEP
```

### `disp_desc` (3 valeurs)

```
House keeping, Maintenance, Reception
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| req_disp_dat_IDX_1 | NONCLUSTERED | oui | disp_id |

