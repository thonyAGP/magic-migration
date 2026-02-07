# taiduree

| Info | Valeur |
|------|--------|
| Lignes | 16 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `langue` | nvarchar | 3 | non |  | 2 |
| 2 | `duree` | int | 10 | non |  | 8 |
| 3 | `libelle` | nvarchar | 30 | non |  | 16 |
| 4 | `x` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `langue` (2 valeurs)

```
ANG, FRA
```

### `duree` (8 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 99
```

### `libelle` (16 valeurs)

```
1 night, 1 nuit, 2 nights, 2 nuits, 3 nigths, 3 nuits, 4 nigths, 4 nuits, 5 nigths, 5 nuits, 6 nigths, 6 nuits, 7 nigths, 7 nuits, Above 7 nigths, plus de 7 nuits
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| taiduree_IDX_1 | NONCLUSTERED | oui | langue, duree |

