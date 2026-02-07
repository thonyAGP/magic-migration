# cccompta

| Info | Valeur |
|------|--------|
| Lignes | 32 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code_gm_8_chiffres` | int | 10 | non |  | 7 |
| 3 | `filiation` | int | 10 | non |  | 1 |
| 4 | `type` | nvarchar | 2 | non |  | 1 |
| 5 | `couleur` | nvarchar | 20 | non |  | 1 |
| 6 | `qty` | int | 10 | non |  | 1 |
| 7 | `montant` | float | 53 | non |  | 23 |
| 8 | `date_comptable` | char | 8 | non |  | 14 |
| 9 | `date_operation` | char | 8 | non |  | 14 |
| 10 | `heure_operation` | char | 6 | non |  | 32 |
| 11 | `utilisateur` | nvarchar | 10 | non |  | 1 |
| 12 | `RowId_266` | int | 10 | non |  | 32 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `code_gm_8_chiffres` (7 valeurs)

```
546059, 546066, 546094, 546110, 546171, 546177, 546329
```

### `filiation` (1 valeurs)

```
0
```

### `type` (1 valeurs)

```
30
```

### `qty` (1 valeurs)

```
0
```

### `montant` (23 valeurs)

```
1000, 1660, 1900, -1935, 2000, -2700, 2775, -2775, 2800, 2867.5, -2867.5, 2870, -2870, -2875, 3430, 3800, 4000, 5000, 5550, 5700, 5735, 790, 933
```

### `date_comptable` (14 valeurs)

```
20220316, 20220406, 20220507, 20220907, 20221008, 20221118, 20230604, 20230701, 20230903, 20231108, 20231217, 20240101, 20240110, 20240713
```

### `date_operation` (14 valeurs)

```
20220316, 20220406, 20220507, 20220907, 20221008, 20221118, 20230604, 20230701, 20230903, 20231108, 20231217, 20240101, 20240110, 20240713
```

### `heure_operation` (32 valeurs)

```
092334, 092406, 092445, 104744, 111135, 111332, 111429, 112859, 113132, 113158, 132032, 150911, 153217, 153344, 153641, 162123, 190451, 190630, 190715, 190750, 190931, 191138, 191203, 191302, 191531, 200005, 200030, 200035, 202057, 202223, 221712, 221753
```

### `utilisateur` (1 valeurs)

```
FAM
```

### `RowId_266` (32 valeurs)

```
100, 105, 106, 110, 112, 113, 114, 124, 132, 133, 135, 139, 142, 144, 147, 148, 15, 17, 2, 21, 23, 30, 35, 38, 43, 46, 48, 6, 85, 87, 92, 96
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cccompta_IDX_2 | NONCLUSTERED | non | type, utilisateur, date_comptable, couleur |
| cccompta_IDX_4 | NONCLUSTERED | oui | RowId_266 |
| cccompta_IDX_1 | NONCLUSTERED | non | societe, code_gm_8_chiffres, filiation |
| cccompta_IDX_3 | NONCLUSTERED | non | societe, date_comptable, type, utilisateur, couleur |

