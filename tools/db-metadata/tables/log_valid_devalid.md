# log_valid_devalid

**Nom logique Magic** : `log_valid_devalid`

| Info | Valeur |
|------|--------|
| Lignes | 1376 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lvd_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `lvd_compte` | int | 10 | non |  | 969 |
| 3 | `lvd_filiation` | smallint | 5 | non |  | 22 |
| 4 | `lvd_date_operation` | char | 8 | non |  | 560 |
| 5 | `lvd_code_operation` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `lvd_societe` (1 valeurs)

```
C
```

### `lvd_filiation` (22 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 23, 24, 3, 4, 5, 6, 7, 8, 9
```

### `lvd_code_operation` (2 valeurs)

```
D, V
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_valid_devalid_IDX_1 | NONCLUSTERED | oui | lvd_societe, lvd_compte, lvd_filiation |

