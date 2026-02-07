# pv_discountlist_dat

| Info | Valeur |
|------|--------|
| Lignes | 44 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `discount_id` | int | 10 | non |  | 11 |
| 2 | `discount_label` | nvarchar | 20 | non |  | 36 |
| 3 | `pv_service` | nvarchar | 4 | non |  | 8 |
| 4 | `disc_comment_mandatory` | bit |  | non |  | 1 |
| 5 | `disc_active` | bit |  | oui |  | 1 |

## Valeurs distinctes

### `discount_id` (11 valeurs)

```
1, 10, 11, 2, 3, 4, 5, 6, 7, 8, 9
```

### `discount_label` (36 valeurs)

```
 GO Discount,  SPA Discount, CANCELLATION FEE, CDV, CDV VALIDATION, CMA, COMPLAINT, EXPERT, Famille GO  Village, FIRST TIME, GE, Geste commercial, GO, GO autres villages, GO bureaux et siFges, GO DISCOUNT, GO du Village, GO HOLIDAYS, GO/GE, GROUP, GROUPS, HONEYMOON, HONEYMOON&SUITE, Invite CDV, MEETING & EVENTS, MEETING&EVENT, PACKAGE 10%, PACKAGE 20%, PACKAGE 5%, PROMOTION, Remplact. skis Assur, REPEATER, SILVER, GOLD, PLATIN, Special Discount, SPECIAL REQUEST, VIP
```

### `pv_service` (8 valeurs)

```
BARD, BOUT, COMM, ESTH, EXCU, PHOT, REST, SKIN
```

### `disc_comment_mandatory` (1 valeurs)

```
0
```

### `disc_active` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_discountlist_dat_IDX_1 | NONCLUSTERED | oui | pv_service, discount_id |

