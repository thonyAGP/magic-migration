# cafil057_dat

| Info | Valeur |
|------|--------|
| Lignes | 19 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gra_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `gra_code` | int | 10 | non |  | 2 |
| 3 | `gra_filiation` | int | 10 | non |  | 1 |
| 4 | `gra_imputation` | float | 53 | non |  | 11 |
| 5 | `gra_sous_imputation` | int | 10 | non |  | 5 |
| 6 | `gra_libelle` | nvarchar | 15 | non |  | 11 |
| 7 | `gra_motif` | nvarchar | 15 | non |  | 4 |
| 8 | `gra_user` | nvarchar | 8 | non |  | 1 |
| 9 | `RowId_79` | int | 10 | non |  | 19 |

## Valeurs distinctes

### `gra_societe` (1 valeurs)

```
C
```

### `gra_code` (2 valeurs)

```
565076, 571787
```

### `gra_filiation` (1 valeurs)

```
0
```

### `gra_imputation` (11 valeurs)

```
7.06415e+008, 7.0641e+008, 7.0761e+008, 7.0762e+008, 7.0763e+008
```

### `gra_sous_imputation` (5 valeurs)

```
101, 102, 17, 7, 8
```

### `gra_libelle` (11 valeurs)

```
Baln?o/ Esth?ti, BAR, Bar Hors BSI, Boutique, BTQ, CIGARS, FINE DINING, GROCERY, NON ALCOHOL BSI, ROOM SERVICE, TOBACCO
```

### `gra_motif` (4 valeurs)

```
CDV, commercial, Commercial, COMMERCIAL
```

### `gra_user` (1 valeurs)

```
FAM
```

### `RowId_79` (19 valeurs)

```
10, 11, 12, 13, 14, 15, 18, 20, 21, 22, 23, 24, 25, 26, 27, 33, 34, 35, 36
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil057_dat_IDX_2 | NONCLUSTERED | oui | RowId_79 |
| cafil057_dat_IDX_1 | NONCLUSTERED | non | gra_societe, gra_code, gra_filiation |

