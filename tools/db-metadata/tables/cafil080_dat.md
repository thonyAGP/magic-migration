# cafil080_dat

| Info | Valeur |
|------|--------|
| Lignes | 139 |
| Colonnes | 16 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lop_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `lop_nom_standard` | nvarchar | 6 | non |  | 139 |
| 3 | `lop_nom_complet` | nvarchar | 19 | non |  | 139 |
| 4 | `lop_attribution` | nvarchar | 1 | non |  | 1 |
| 5 | `lop_batiment` | nvarchar | 2 | non |  | 5 |
| 6 | `lop_etage` | nvarchar | 2 | non |  | 4 |
| 7 | `lop_type_logement` | nvarchar | 6 | non |  | 3 |
| 8 | `lop_ensemble` | nvarchar | 3 | non |  | 5 |
| 9 | `lop_type_occupation` | nvarchar | 2 | non |  | 6 |
| 10 | `lop_standing` | nvarchar | 2 | non |  | 3 |
| 11 | `lop_occup__standard` | int | 10 | non |  | 2 |
| 12 | `lop_occup_surbook` | int | 10 | non |  | 3 |
| 13 | `loc_tel_interieur` | nvarchar | 6 | non |  | 139 |
| 14 | `loc_code_menage` | char | 8 | non |  | 7 |
| 15 | `loc_communicante` | nvarchar | 1 | non |  | 3 |
| 16 | `lop_menage_verifie` | bit |  | non |  | 1 |

## Valeurs distinctes

### `lop_societe` (1 valeurs)

```
C
```

### `lop_attribution` (1 valeurs)

```
P
```

### `lop_batiment` (5 valeurs)

```
MH, ST, W, X, Y
```

### `lop_etage` (4 valeurs)

```
0, 1, 2, CH
```

### `lop_type_logement` (3 valeurs)

```
GE, GO, RM
```

### `lop_ensemble` (5 valeurs)

```
, KGS, KNG, SAL, SGL
```

### `lop_type_occupation` (6 valeurs)

```
CS, CV, EX, GO, PS, RA
```

### `lop_standing` (3 valeurs)

```
1*, 2*, 3*
```

### `lop_occup__standard` (2 valeurs)

```
1, 2
```

### `lop_occup_surbook` (3 valeurs)

```
1, 2, 3
```

### `loc_code_menage` (7 valeurs)

```
00000000, 20181114, 20190602, 20220303, 20220324, 20220502, 20240803
```

### `loc_communicante` (3 valeurs)

```
, N, O
```

### `lop_menage_verifie` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil080_dat_IDX_1 | NONCLUSTERED | oui | lop_societe, lop_nom_standard |

