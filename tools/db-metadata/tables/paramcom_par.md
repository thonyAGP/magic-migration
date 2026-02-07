# paramcom_par

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `type` | nvarchar | 3 | non |  | 4 |
| 2 | `com` | int | 10 | non |  | 2 |
| 3 | `baud` | nvarchar | 5 | non |  | 2 |
| 4 | `parite` | nvarchar | 1 | non |  | 3 |
| 5 | `data_bit` | int | 10 | non |  | 2 |
| 6 | `stop_bit` | nvarchar | 1 | non |  | 2 |
| 7 | `time_out_lecture` | int | 10 | non |  | 2 |

## Valeurs distinctes

### `type` (4 valeurs)

```
MK3, PME, SWA, TPE
```

### `com` (2 valeurs)

```
0, 1
```

### `baud` (2 valeurs)

```
1200, 9600
```

### `parite` (3 valeurs)

```
E, N, O
```

### `data_bit` (2 valeurs)

```
7, 8
```

### `stop_bit` (2 valeurs)

```
0, 1
```

### `time_out_lecture` (2 valeurs)

```
0, 80
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| paramcom_par_IDX_1 | NONCLUSTERED | oui | type |

