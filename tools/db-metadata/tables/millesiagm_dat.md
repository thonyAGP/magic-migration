# millesiagm_dat

| Info | Valeur |
|------|--------|
| Lignes | 9320 |
| Colonnes | 28 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mil_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `mil_num_compte` | float | 53 | non |  | 3072 |
| 3 | `mil_filiation` | int | 10 | non |  | 13 |
| 4 | `mil_fidelisation` | nvarchar | 1 | non |  | 10 |
| 5 | `mil_gm_donateur` | nvarchar | 1 | oui |  | 3 |
| 6 | `mil_new_fidelisation` | nvarchar | 1 | non |  | 9 |
| 7 | `mil_vip` | nvarchar | 1 | non |  | 4 |
| 8 | `mil_ambassadeur` | nvarchar | 1 | non |  | 2 |
| 9 | `mil_actionnaire` | nvarchar | 1 | non |  | 2 |
| 10 | `mil_report` | nvarchar | 1 | non |  | 3 |
| 11 | `mil_nbpoints` | float | 53 | non |  | 2423 |
| 12 | `mil_montant_score` | float | 53 | non |  | 25 |
| 13 | `mil_devise` | nvarchar | 3 | non |  | 2 |
| 14 | `mil_score` | varchar | 10 | non |  | 7 |
| 15 | `mil_topact` | nvarchar | 1 | non |  | 3 |
| 16 | `mil_regulier` | nvarchar | 1 | non |  | 2 |
| 17 | `mil_date_derniere_arrivee_1` | char | 8 | non |  | 165 |
| 18 | `mil_date_derniere_arrivee_2` | char | 8 | non |  | 180 |
| 19 | `mil_date_derniere_arrivee_3` | char | 8 | non |  | 111 |
| 20 | `mil_date_derniere_arrivee_4` | char | 8 | non |  | 67 |
| 21 | `mil_date_derniere_arrivee_5` | char | 8 | non |  | 47 |
| 22 | `mil_date_derniere_arrivee_6` | char | 8 | non |  | 31 |
| 23 | `mil_date_derniere_arrivee_7` | char | 8 | non |  | 25 |
| 24 | `mil_date_derniere_arrivee_8` | char | 8 | non |  | 17 |
| 25 | `mil_date_derniere_arrivee_9` | char | 8 | non |  | 11 |
| 26 | `mil_date_derniere_arrivee_10` | char | 8 | non |  | 9 |
| 27 | `mil_gm_fliggy` | nvarchar | 1 | oui |  | 2 |
| 28 | `mil_new_gm` | nvarchar | 1 | non |  | 3 |

## Valeurs distinctes

### `mil_societe` (1 valeurs)

```
C
```

### `mil_filiation` (13 valeurs)

```
0, 1, 10, 11, 12, 2, 3, 4, 5, 6, 7, 8, 9
```

### `mil_fidelisation` (10 valeurs)

```
, A, G, H, I, J, N, S, T, V
```

### `mil_gm_donateur` (3 valeurs)

```
, N, O
```

### `mil_new_fidelisation` (9 valeurs)

```
, G, I, L, N, O, P, S, T
```

### `mil_vip` (4 valeurs)

```
, N, T, V
```

### `mil_ambassadeur` (2 valeurs)

```
, N
```

### `mil_actionnaire` (2 valeurs)

```
, N
```

### `mil_report` (3 valeurs)

```
, N, O
```

### `mil_montant_score` (25 valeurs)

```
0, 10112.3, 10120.5, 1018.29, 10685.1, 10872.7, 11496.8, 20609.8, 2102.27, 2463.6, 247.35, 3416.19, 3466.45, 3566.68, 3974.61, 4368.46, 4810.92, 484.18, 5918.22, 610.32, 6704.93, 7160.86, 794.92, 8327.62, 8979
```

### `mil_devise` (2 valeurs)

```
, EUR
```

### `mil_score` (7 valeurs)

```
, HIGH, LOW, MODERATE, NO SCORE, VERY HIGH, VERY LOW
```

### `mil_topact` (3 valeurs)

```
, N, O
```

### `mil_regulier` (2 valeurs)

```
, R
```

### `mil_date_derniere_arrivee_5` (47 valeurs)

```
00000000, 20140929, 20151227, 20151230, 20160218, 20161016, 20161124, 20161223, 20170103, 20170109, 20170126, 20170401, 20171102, 20180103, 20180108, 20180112, 20180407, 20180908, 20181202, 20190104, 20190412, 20191007, 20191228, 20220328, 20220606, 20220701, 20221122, 20221228, 20221231, 20230103, 20230105, 20230215, 20230313, 20230329, 20230411, 20230818, 20230914, 20240305, 20240410, 20240524, 20240623, 20240810, 20240910, 20241218, 20250223, 20250228, 20250522
```

### `mil_date_derniere_arrivee_6` (31 valeurs)

```
00000000, 20140624, 20160108, 20160325, 20161210, 20161231, 20170104, 20170109, 20170810, 20171202, 20171230, 20180103, 20180521, 20181229, 20191023, 20200102, 20220430, 20220810, 20220904, 20221220, 20230103, 20230303, 20230311, 20230919, 20230930, 20231224, 20240217, 20240522, 20240913, 20250222, 20250228
```

### `mil_date_derniere_arrivee_7` (25 valeurs)

```
00000000, 20150108, 20151228, 20151231, 20160105, 20160108, 20160121, 20160206, 20161203, 20170104, 20170109, 20180311, 20180407, 20190102, 20190812, 20220307, 20221103, 20221220, 20230214, 20230411, 20230525, 20230914, 20231123, 20240819, 20240913
```

### `mil_date_derniere_arrivee_8` (17 valeurs)

```
00000000, 20141231, 20150108, 20151202, 20160105, 20160108, 20170109, 20170428, 20170630, 20180108, 20180813, 20200301, 20221031, 20230701, 20231109, 20240531, 20240819
```

### `mil_date_derniere_arrivee_9` (11 valeurs)

```
00000000, 20160108, 20161231, 20170307, 20170521, 20180625, 20191023, 20230628, 20231013, 20240305, 20240531
```

### `mil_date_derniere_arrivee_10` (9 valeurs)

```
00000000, 20151231, 20170306, 20170314, 20180420, 20230303, 20230907, 20231224, 20240305
```

### `mil_gm_fliggy` (2 valeurs)

```
, N
```

### `mil_new_gm` (3 valeurs)

```
, N, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| millesiagm_dat_IDX_1 | NONCLUSTERED | oui | mil_societe, mil_num_compte, mil_filiation |

