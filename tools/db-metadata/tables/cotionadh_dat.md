# cotionadh_dat

| Info | Valeur |
|------|--------|
| Lignes | 25 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cau_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `cau_compte_gm` | int | 10 | non |  | 25 |
| 3 | `cau_filiation` | int | 10 | non |  | 4 |
| 4 | `cau_serviette` | bit |  | non |  | 2 |
| 5 | `cau_cle_coffre` | bit |  | non |  | 2 |
| 6 | `cau_cle_television` | bit |  | non |  | 1 |
| 7 | `cau_jeux` | bit |  | non |  | 1 |
| 8 | `cau_divers` | bit |  | non |  | 1 |
| 9 | `RowId_280` | int | 10 | non |  | 25 |

## Valeurs distinctes

### `cau_societe` (1 valeurs)

```
C
```

### `cau_compte_gm` (25 valeurs)

```
103297, 111513, 111833, 112174, 113240, 113966, 113982, 114120, 116769, 117968, 118728, 118842, 122472, 123538, 123641, 123790, 123889, 125109, 125727, 136244, 171284, 173665, 94060, 98178, 99717
```

### `cau_filiation` (4 valeurs)

```
0, 1, 2, 5
```

### `cau_serviette` (2 valeurs)

```
0, 1
```

### `cau_cle_coffre` (2 valeurs)

```
0, 1
```

### `cau_cle_television` (1 valeurs)

```
0
```

### `cau_jeux` (1 valeurs)

```
0
```

### `cau_divers` (1 valeurs)

```
0
```

### `RowId_280` (25 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 3, 4, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cotionadh_dat_IDX_2 | NONCLUSTERED | oui | RowId_280 |
| cotionadh_dat_IDX_1 | NONCLUSTERED | non | cau_societe, cau_compte_gm, cau_filiation |

