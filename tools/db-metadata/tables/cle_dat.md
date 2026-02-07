# cle_dat

| Info | Valeur |
|------|--------|
| Lignes | 3 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code` | nvarchar | 10 | non |  | 3 |
| 2 | `room` | nvarchar | 10 | non |  | 3 |

## Valeurs distinctes

### `code` (3 valeurs)

```
, .........., CAROI
```

### `room` (3 valeurs)

```
, .........., 2222
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cle_dat_IDX_1 | NONCLUSTERED | oui | code |
| cle_dat_IDX_2 | NONCLUSTERED | oui | room |

