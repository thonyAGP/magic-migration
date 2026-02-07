# pv_cardtype

| Info | Valeur |
|------|--------|
| Lignes | 13126 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `xtrack_cust_id` | float | 53 | non |  | 6278 |
| 2 | `xtrack_package_id` | float | 53 | non |  | 11659 |
| 3 | `cardtype` | nvarchar | 5 | non |  | 7 |
| 4 | `pv_service` | nvarchar | 4 | non |  | 10 |

## Valeurs distinctes

### `cardtype` (7 valeurs)

```
, ALIP, AMEX, CCAU, UNIO, VISA, WECH
```

### `pv_service` (10 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, PHOT, REST, SPNA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_cardtype_IDX_1 | NONCLUSTERED | oui | pv_service, xtrack_cust_id, xtrack_package_id |

