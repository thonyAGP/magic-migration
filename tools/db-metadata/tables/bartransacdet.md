# bartransacdet

| Info | Valeur |
|------|--------|
| Lignes | 93384 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `bar_id` | nvarchar | 5 | non |  | 11 |
| 2 | `pos_id` | nvarchar | 3 | non |  | 26 |
| 3 | `ticket_number` | nvarchar | 10 | non |  | 61337 |
| 4 | `label_prod` | nvarchar | 20 | non |  | 908 |
| 5 | `qty` | int | 10 | non |  | 71 |
| 6 | `amount` | float | 53 | non |  | 2914 |
| 7 | `happy` | bit |  | non |  | 1 |
| 8 | `tai_produit` | bit |  | non |  | 1 |
| 9 | `tai_quantite` | int | 10 | non |  | 1 |
| 10 | `tai_selling_price` | float | 53 | non |  | 1 |
| 11 | `tai_buying_price` | float | 53 | non |  | 1 |
| 12 | `RowId_14` | int | 10 | non |  | 93384 |

## Valeurs distinctes

### `bar_id` (11 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, PHOT, REST, SPNA, SPTE
```

### `pos_id` (26 valeurs)

```
001, 002, 004, 005, 006, 021, 022, 023, 024, 080, 500, 550, 551, 770, 775, 801, 810, 920, 940, 941, 942, 960, 961, 970, 980, 990
```

### `happy` (1 valeurs)

```
0
```

### `tai_produit` (1 valeurs)

```
0
```

### `tai_quantite` (1 valeurs)

```
0
```

### `tai_selling_price` (1 valeurs)

```
0
```

### `tai_buying_price` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| bartransacdet_IDX_2 | NONCLUSTERED | oui | RowId_14 |
| bartransacdet_IDX_1 | NONCLUSTERED | non | bar_id, pos_id, ticket_number |

