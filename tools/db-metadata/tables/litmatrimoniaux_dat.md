# litmatrimoniaux_dat

| Info | Valeur |
|------|--------|
| Lignes | 14938 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ma_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ma_num_compte` | int | 10 | non |  | 5997 |
| 3 | `ma_filiation` | int | 10 | non |  | 28 |
| 4 | `ma_matrimoniaux` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `ma_societe` (1 valeurs)

```
C
```

### `ma_filiation` (28 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 3, 4, 5, 6, 7, 8, 9
```

### `ma_matrimoniaux` (1 valeurs)

```
S
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| litmatrimoniaux_dat_IDX_1 | NONCLUSTERED | oui | ma_societe, ma_num_compte, ma_filiation |

