# pv_sellersweek_dat

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pv_service` | nvarchar | 4 | non |  | 4 |
| 2 | `sbw_year_week` | int | 10 | non |  | 8 |
| 3 | `sbw_contract` | int | 10 | non |  | 2 |
| 4 | `sbw_sellers_nb` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `pv_service` (4 valeurs)

```
BARD, ESTH, GEST, REST
```

### `sbw_year_week` (8 valeurs)

```
201446, 202210, 202215, 202317, 202318, 202349, 202351, 202404
```

### `sbw_contract` (2 valeurs)

```
1, 2
```

### `sbw_sellers_nb` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_sellersweek_dat_IDX_1 | NONCLUSTERED | oui | pv_service, sbw_year_week, sbw_contract |

