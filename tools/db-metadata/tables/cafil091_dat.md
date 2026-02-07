# cafil091_dat

| Info | Valeur |
|------|--------|
| Lignes | 109 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `nom_table` | nvarchar | 5 | non |  | 9 |
| 3 | `code_langue` | nvarchar | 1 | non |  | 2 |
| 4 | `code_alpha6` | nvarchar | 6 | non |  | 74 |
| 5 | `libelle_dix` | nvarchar | 10 | non |  | 3 |
| 6 | `libelle_vingt` | nvarchar | 20 | non |  | 75 |
| 7 | `code_numerique` | int | 10 | non |  | 28 |
| 8 | `valeur_un` | int | 10 | non |  | 2 |
| 9 | `valeur_deux` | int | 10 | non |  | 2 |
| 10 | `operateur` | nvarchar | 10 | non |  | 9 |
| 11 | `date_table` | char | 8 | non |  | 23 |
| 12 | `heure_table` | char | 6 | non |  | 44 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `nom_table` (9 valeurs)

```
AERGR, SVPRO, VBATI, VBEBE, VENFA, VENSE, VHDIF, VLOGE, VVUES
```

### `code_langue` (2 valeurs)

```
F, G
```

### `libelle_dix` (3 valeurs)

```
, BABY, ESTH
```

### `code_numerique` (28 valeurs)

```
0, 1, 10, 104, 12, 15, -15, 18, 19, 197, 2, 202, 21, 22, 25, 28, 29, 3, 36, 37, 6, -6, 60, 71, 74, 8, 87, 9
```

### `valeur_un` (2 valeurs)

```
0, 150
```

### `valeur_deux` (2 valeurs)

```
0, 240
```

### `operateur` (9 valeurs)

```
, BCOU, FOM, HENRY, LYS, PLANNING, SAID, SNOW, WELCMGR
```

### `date_table` (23 valeurs)

```
00000000, 19970623, 20010907, 20080703, 20171121, 20180510, 20180517, 20220507, 20220511, 20230630, 20230827, 20231123, 20240127, 20240309, 20240817, 20240824, 20241020, 20241026, 20250111, 20250321, 20250326, 20250407, 20250727
```

### `heure_table` (44 valeurs)

```
000000, 084856, 091426, 091631, 091710, 091854, 092523, 103009, 113600, 114129, 114205, 114208, 114501, 114513, 114727, 114934, 114937, 114938, 114939, 114949, 115158, 115806, 115807, 115809, 115830, 122032, 124624, 133557, 174900, 192700, 192800, 192900, 193000, 193100, 193200, 193956, 202334, 202859, 232753, 232803, 232804, 232817, 233350, 235200
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil091_dat_IDX_1 | NONCLUSTERED | oui | societe, nom_table, code_langue, code_alpha6 |

