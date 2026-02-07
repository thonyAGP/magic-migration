# synthese_forfait_ski

**Nom logique Magic** : `synthese_forfait_ski`

| Info | Valeur |
|------|--------|
| Lignes | 259 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sfs_code_saison` | nvarchar | 1 | non |  | 1 |
| 2 | `sfs_date` | datetime |  | non |  | 259 |
| 3 | `sfs_nb_forfait_demi_journee` | int | 10 | non |  | 1 |
| 4 | `sfs_nb_forfait_1jour` | int | 10 | non |  | 1 |
| 5 | `sfs_nb_forfait_2jours` | int | 10 | non |  | 1 |
| 6 | `sfs_nb_forfait_3jours` | int | 10 | non |  | 19 |
| 7 | `sfs_nb_forfait_4jours` | int | 10 | non |  | 41 |
| 8 | `sfs_nb_forfait_5jours` | int | 10 | non |  | 51 |
| 9 | `sfs_nb_forfait_6jours` | int | 10 | non |  | 41 |
| 10 | `sfs_nb_forfait_7jours` | int | 10 | non |  | 16 |
| 11 | `sfs_nb_forfait_8jours` | int | 10 | non |  | 17 |
| 12 | `sfs_nb_forfait_9jours` | int | 10 | non |  | 13 |
| 13 | `sfs_nb_forfait_10jours` | int | 10 | non |  | 8 |
| 14 | `sfs_nb_forfait_11jours` | int | 10 | non |  | 7 |
| 15 | `sfs_nb_forfait_12jours` | int | 10 | non |  | 9 |
| 16 | `sfs_nb_forfait_13jours` | int | 10 | non |  | 8 |
| 17 | `sfs_nb_forfait_14jours` | int | 10 | non |  | 4 |
| 18 | `sfs_nb_forfait_15jours` | int | 10 | non |  | 15 |
| 19 | `sfs_nb_forfait_total_journee` | int | 10 | non |  | 72 |
| 20 | `sfs_nb_jh` | int | 10 | non |  | 169 |

## Valeurs distinctes

### `sfs_code_saison` (1 valeurs)

```
H
```

### `sfs_nb_forfait_demi_journee` (1 valeurs)

```
0
```

### `sfs_nb_forfait_1jour` (1 valeurs)

```
0
```

### `sfs_nb_forfait_2jours` (1 valeurs)

```
0
```

### `sfs_nb_forfait_3jours` (19 valeurs)

```
0, 1, 10, 11, 144, 15, 17, 19, 2, 3, 39, 4, 44, 48, 5, 6, 7, 8, 9
```

### `sfs_nb_forfait_4jours` (41 valeurs)

```
0, 1, 10, 11, 12, 127, 14, 15, 16, 17, 18, 19, 2, 20, 22, 24, 25, 26, 28, 29, 31, 33, 34, 35, 36, 37, 38, 40, 42, 43, 44, 46, 49, 5, 52, 53, 54, 6, 7, 9, 90
```

### `sfs_nb_forfait_6jours` (41 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 17, 18, 19, 2, 20, 21, 22, 23, 25, 26, 27, 28, 29, 3, 32, 33, 35, 36, 38, 4, 41, 5, 52, 54, 6, 61, 63, 64, 7, 73, 8, 80, 9
```

### `sfs_nb_forfait_7jours` (16 valeurs)

```
0, 1, 10, 11, 13, 14, 15, 18, 2, 3, 32, 4, 5, 6, 7, 8
```

### `sfs_nb_forfait_8jours` (17 valeurs)

```
0, 1, 10, 11, 12, 14, 16, 18, 2, 20, 3, 4, 5, 6, 7, 8, 9
```

### `sfs_nb_forfait_9jours` (13 valeurs)

```
0, 1, 10, 14, 18, 2, 3, 4, 5, 6, 7, 8, 9
```

### `sfs_nb_forfait_10jours` (8 valeurs)

```
0, 1, 2, 3, 4, 5, 6, 8
```

### `sfs_nb_forfait_11jours` (7 valeurs)

```
0, 1, 2, 3, 4, 5, 6
```

### `sfs_nb_forfait_12jours` (9 valeurs)

```
0, 1, 13, 2, 3, 4, 5, 6, 8
```

### `sfs_nb_forfait_13jours` (8 valeurs)

```
0, 1, 15, 2, 3, 4, 5, 7
```

### `sfs_nb_forfait_14jours` (4 valeurs)

```
0, 1, 2, 3
```

### `sfs_nb_forfait_15jours` (15 valeurs)

```
0, 1, 10, 13, 19, 2, 3, 4, 43, 5, 55, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| synthese_forfait_ski_IDX1 | NONCLUSTERED | oui | sfs_code_saison, sfs_date |

