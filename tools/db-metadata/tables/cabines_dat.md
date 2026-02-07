# cabines_dat

| Info | Valeur |
|------|--------|
| Lignes | 613 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `numero` | nvarchar | 6 | non |  | 613 |
| 3 | `abandon` | float | 53 | non |  | 1 |
| 4 | `pont` | nvarchar | 1 | non |  | 1 |
| 5 | `cote` | nvarchar | 3 | non |  | 1 |
| 6 | `zone` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `abandon` (1 valeurs)

```
0
```

### `zone` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cabines_dat_IDX_1 | NONCLUSTERED | oui | societe, numero |

