# cafil048_dat

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dat_societe` | nvarchar | 1 | non |  | 2 |
| 2 | `dat_date_comptable` | char | 8 | non |  | 2 |

## Valeurs distinctes

### `dat_societe` (2 valeurs)

```
C, G
```

### `dat_date_comptable` (2 valeurs)

```
00000000, 20251225
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil048_dat_IDX_1 | NONCLUSTERED | oui | dat_societe |

