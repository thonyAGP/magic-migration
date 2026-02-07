# cafil015_dat

| Info | Valeur |
|------|--------|
| Lignes | 377 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cmt_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `cmt_code_gm` | int | 10 | non |  | 299 |
| 3 | `cmt_filiation` | int | 10 | non |  | 8 |
| 4 | `cmt_commentaire` | nvarchar | 50 | non |  | 244 |
| 5 | `cmt_user_creation` | nvarchar | 8 | non |  | 17 |
| 6 | `cmt_date_creation` | char | 8 | non |  | 99 |
| 7 | `cmt_time_creation` | char | 6 | non |  | 185 |
| 8 | `cmt_user_modif` | nvarchar | 8 | non |  | 5 |
| 9 | `cmt_date_modif` | char | 8 | non |  | 10 |
| 10 | `cmt_time_modif` | char | 6 | non |  | 11 |

## Valeurs distinctes

### `cmt_societe` (1 valeurs)

```
C
```

### `cmt_filiation` (8 valeurs)

```
0, 1, 2, 3, 4, 5, 6, 7
```

### `cmt_user_creation` (17 valeurs)

```
, DILIA, EMELINE, EMILY, GIFT, HANS, JAA, JULIA, MICKY, MILY, MIND, PATRICIA, PLANNING, REMI, SNOW, TOMOKA, WELCMGR
```

### `cmt_user_modif` (5 valeurs)

```
, DORI, PLANNING, REMI, WELCMGR
```

### `cmt_date_modif` (10 valeurs)

```
00000000, 20240227, 20240306, 20240425, 20240523, 20240605, 20240613, 20240823, 20250119, 20251215
```

### `cmt_time_modif` (11 valeurs)

```
000000, 112224, 132045, 150857, 175040, 181506, 190457, 191811, 215632, 215648, 223030
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil015_dat_IDX_1 | NONCLUSTERED | oui | cmt_societe, cmt_code_gm, cmt_filiation |

