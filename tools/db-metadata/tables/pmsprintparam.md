# pmsprintparam

| Info | Valeur |
|------|--------|
| Lignes | 4121 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `terminal` | int | 10 | non |  | 151 |
| 2 | `edition` | int | 10 | non |  | 52 |
| 3 | `imprimante` | int | 10 | non |  | 6 |
| 4 | `copies` | int | 10 | non |  | 4 |
| 5 | `hostname` | nvarchar | 50 | non |  | 9 |

## Valeurs distinctes

### `imprimante` (6 valeurs)

```
0, 1, 5, 6, 8, 9
```

### `copies` (4 valeurs)

```
0, 1, 2, 3
```

### `hostname` (9 valeurs)

```
, CMAWSGM0J4QL6, CMAWSGM0J6A9H, CMAWSGM0J6A9V, CMAWSGM0J6A9X, CMAWSGM0J6AA9, CMAWSGM0J6AAE, CMAWSGM0J6AAJ, CMAWSGM0J6AAK
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pmsprintparam_IDX_1 | NONCLUSTERED | oui | terminal, hostname, edition, imprimante |

