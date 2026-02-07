# supezcard

| Info | Valeur |
|------|--------|
| Lignes | 731 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sez_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `sez_code_gm` | int | 10 | non |  | 342 |
| 3 | `sez_filiation` | int | 10 | non |  | 18 |
| 4 | `sez_card_code` | nvarchar | 10 | non |  | 731 |
| 5 | `sez_status` | nvarchar | 1 | non |  | 3 |
| 6 | `sez_plafond` | float | 53 | non |  | 1 |
| 7 | `sez_type` | nvarchar | 1 | non |  | 1 |
| 8 | `sez_date_activation` | char | 8 | non |  | 73 |
| 9 | `sez_ttime_activation` | char | 6 | non |  | 612 |
| 10 | `sez_user` | nvarchar | 10 | non |  | 19 |
| 11 | `sez_date_suppression` | char | 8 | non |  | 23 |
| 12 | `sez_time_suppression` | char | 6 | non |  | 29 |
| 13 | `sez_user_suppression` | nvarchar | 10 | non |  | 1 |

## Valeurs distinctes

### `sez_societe` (1 valeurs)

```
C
```

### `sez_filiation` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `sez_status` (3 valeurs)

```
I, O, V
```

### `sez_plafond` (1 valeurs)

```
0
```

### `sez_user` (19 valeurs)

```
ARKON, AUNKO, BEAM, CHECHE, DOREEN, ESTELLE, FAM, GIFT, ING, JAA, JAA1, JOLIE, MICKY, MIND, PLANNING, SNOW, SUNNY, TIK, WELCMGR
```

### `sez_date_suppression` (23 valeurs)

```
20220421, 20230102, 20231008, 20231104, 20231128, 20240111, 20240221, 20240303, 20240601, 20241112, 20250401, 20250608, 20250704, 20250821, 20250831, 20251014, 20251024, 20251102, 20251112, 20251117, 20251204, 20251218, 20251223
```

### `sez_time_suppression` (29 valeurs)

```
014634, 014853, 015037, 015122, 015123, 015206, 015403, 015424, 015432, 015439, 015440, 015442, 015457, 015502, 015543, 015544, 015615, 015634, 015635, 015640, 015714, 015715, 015817, 015934, 015946, 020423, 020440, 020539, 020540
```

### `sez_user_suppression` (1 valeurs)

```
D S I O P
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| supezcard_IDX_1 | NONCLUSTERED | oui | sez_societe, sez_code_gm, sez_filiation, sez_card_code |
| supezcard_IDX_2 | NONCLUSTERED | oui | sez_card_code |

