# cafil087_dat

| Info | Valeur |
|------|--------|
| Lignes | 100 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tut_username` | nvarchar | 10 | non |  | 100 |
| 2 | `tut_societe` | nvarchar | 1 | non |  | 1 |
| 3 | `tut_langue` | nvarchar | 1 | non |  | 1 |
| 4 | `tut_code_beep` | nvarchar | 1 | non |  | 1 |
| 5 | `tut_zone_secteur` | nvarchar | 1 | non |  | 2 |
| 6 | `tut_economiseur` | nvarchar | 1 | non |  | 2 |
| 7 | `reserve` | nvarchar | 1 | non |  | 1 |
| 8 | `reserve2` | nvarchar | 1 | non |  | 1 |
| 9 | `reserve3` | nvarchar | 1 | non |  | 1 |
| 10 | `reserve4` | nvarchar | 1 | non |  | 1 |
| 11 | `tut_repertoire_export` | nvarchar | 260 | non |  | 1 |

## Valeurs distinctes

### `tut_societe` (1 valeurs)

```
C
```

### `tut_langue` (1 valeurs)

```
F
```

### `tut_code_beep` (1 valeurs)

```
O
```

### `tut_zone_secteur` (2 valeurs)

```
S, Z
```

### `tut_economiseur` (2 valeurs)

```
5, c
```

### `reserve` (1 valeurs)

```
N
```

### `reserve2` (1 valeurs)

```
N
```

### `reserve3` (1 valeurs)

```
N
```

### `reserve4` (1 valeurs)

```
N
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil087_dat_IDX_1 | NONCLUSTERED | oui | tut_username |

