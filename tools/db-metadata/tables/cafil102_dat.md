# cafil102_dat

| Info | Valeur |
|------|--------|
| Lignes | 8 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ttc_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ttc_code` | int | 10 | non |  | 8 |
| 3 | `ttc_utilise__` | nvarchar | 1 | non |  | 2 |
| 4 | `ttc_libelle` | nvarchar | 15 | non |  | 5 |
| 5 | `ttc_modifiable` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `ttc_societe` (1 valeurs)

```
C
```

### `ttc_code` (8 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 8
```

### `ttc_utilise__` (2 valeurs)

```
N, O
```

### `ttc_libelle` (5 valeurs)

```
, CASINO, CLIENT, GESTION, PERSONNEL
```

### `ttc_modifiable` (2 valeurs)

```
N, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil102_dat_IDX_1 | NONCLUSTERED | oui | ttc_societe, ttc_code |
| cafil102_dat_IDX_2 | NONCLUSTERED | oui | ttc_societe, ttc_utilise__, ttc_code |

