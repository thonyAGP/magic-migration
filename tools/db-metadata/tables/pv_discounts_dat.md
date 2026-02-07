# pv_discounts_dat

| Info | Valeur |
|------|--------|
| Lignes | 40 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dis_code` | int | 10 | non |  | 9 |
| 2 | `dis_description` | nvarchar | 30 | non |  | 21 |
| 3 | `pv_service` | nvarchar | 4 | non |  | 10 |

## Valeurs distinctes

### `dis_code` (9 valeurs)

```
0, 10, 100, 15, 20, 30, 40, 5, 50
```

### `dis_description` (21 valeurs)

```
, 10%, 10% DISCOUNT, 100 % DISCOUNT, 15% DISCOUNT, 20%, 20% DISCOUNT, 30% DISCOUNT, 40%, 5%, 5% DISCOUNT, 50%, 50% DISCOUNT, gest comercial, Gest comercial, GO DISCOUNT, GO DISCOUNT CM COLLECTION, GO HOLIDAY COURSES, GO HOLIDAY DIVING, GREAT MEMBER, M&E, HONEYMOON
```

### `pv_service` (10 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, MINI, PHOT, REST, SPNA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_discounts_dat_IDX_1 | NONCLUSTERED | oui | pv_service, dis_code |

