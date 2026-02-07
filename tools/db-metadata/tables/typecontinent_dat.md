# typecontinent_dat

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code` | nvarchar | 1 | non |  | 7 |
| 2 | `description` | nvarchar | 30 | non |  | 7 |

## Valeurs distinctes

### `code` (7 valeurs)

```
0, 1, 3, 4, 5, 6, 7
```

### `description` (7 valeurs)

```
AFRICA, AMERICA, ASIA, AUSTRALIA / NEWZEALAND, EUROPE, GREECE, UNKNOWN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| typecontinent_dat_IDX_1 | NONCLUSTERED | oui | code |

