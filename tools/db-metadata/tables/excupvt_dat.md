# excupvt_dat

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pvt_cle` | nvarchar | 1 | non |  | 4 |
| 2 | `pvt_ligne_1` | nvarchar | 55 | non |  | 3 |
| 3 | `pvt_ligne_2` | nvarchar | 55 | non |  | 3 |

## Valeurs distinctes

### `pvt_cle` (4 valeurs)

```
, 1, 3, 4
```

### `pvt_ligne_1` (3 valeurs)

```
CANC FEE 50 % 1 DAY BEFORE, CANC FEE 50% 1 DAY BEFORE, Cancellation Fee
```

### `pvt_ligne_2` (3 valeurs)

```
100 % SAME DAY, 100% SAME DAY, 50 % day before 100 % same day
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excupvt_dat_IDX_1 | NONCLUSTERED | oui | pvt_cle |

