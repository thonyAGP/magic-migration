# visa_dat

| Info | Valeur |
|------|--------|
| Lignes | 22895 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vi_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `vi_num_compte` | int | 10 | non |  | 9052 |
| 3 | `vi_filiation` | int | 10 | non |  | 30 |
| 4 | `vi_visa` | bit |  | non |  | 1 |
| 5 | `vi_date_visa` | char | 8 | non |  | 1 |
| 6 | `vi_numero_visa` | nvarchar | 11 | non |  | 1 |
| 7 | `vi_ville_emettrice_visa` | nvarchar | 13 | non |  | 1 |
| 8 | `vi_pays_de_residence` | nvarchar | 2 | non |  | 37 |
| 9 | `vi_chaine` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `vi_societe` (1 valeurs)

```
C
```

### `vi_filiation` (30 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 4, 5, 6, 7, 8, 9
```

### `vi_visa` (1 valeurs)

```
0
```

### `vi_date_visa` (1 valeurs)

```
00000000
```

### `vi_pays_de_residence` (37 valeurs)

```
, @@, AL, AT, AU, BQ, BR, CD, CH, CO, ES, FR, GB, HK, ID, IO, IR, IS, IT, JP, MA, MO, MY, NL, NZ, PI, PL, RU, SA, SG, SN, SU, TH, TR, TW, US, ZA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| visa_dat_IDX_1 | NONCLUSTERED | oui | vi_societe, vi_num_compte, vi_filiation |

