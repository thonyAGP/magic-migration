# total_jour_forfait_ski

**Nom logique Magic** : `total_jour_forfait_ski`

| Info | Valeur |
|------|--------|
| Lignes | 3819 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tjfs_code_saison` | nvarchar | 1 | non |  | 2 |
| 2 | `tjfs_date_retour` | char | 8 | non |  | 2695 |
| 3 | `tjfs_nb_forfait_demi_journee` | smallint | 5 | non |  | 1 |
| 4 | `tjfs_nb_forfait_1jour` | smallint | 5 | non |  | 17 |
| 5 | `tjfs_nb_forfait_2jours` | smallint | 5 | non |  | 55 |
| 6 | `tjfs_nb_forfait_3jours` | smallint | 5 | non |  | 107 |
| 7 | `tjfs_nb_forfait_4jours` | smallint | 5 | non |  | 114 |
| 8 | `tjfs_nb_forfait_5jours` | smallint | 5 | non |  | 84 |
| 9 | `tjfs_nb_forfait_6jours` | smallint | 5 | non |  | 81 |
| 10 | `tjfs_nb_forfait_7jours` | smallint | 5 | non |  | 23 |
| 11 | `tjfs_nb_forfait_8jours` | smallint | 5 | non |  | 32 |
| 12 | `tjfs_nb_forfait_9jours` | smallint | 5 | non |  | 27 |
| 13 | `tjfs_nb_forfait_10jours` | smallint | 5 | non |  | 28 |
| 14 | `tjfs_nb_forfait_11jours` | smallint | 5 | non |  | 15 |
| 15 | `tjfs_nb_forfait_12jours` | smallint | 5 | non |  | 14 |
| 16 | `tjfs_nb_forfait_13jours` | smallint | 5 | non |  | 21 |
| 17 | `tjfs_nb_forfait_14jours` | smallint | 5 | non |  | 5 |
| 18 | `tjfs_nb_forfait_15jours` | smallint | 5 | non |  | 26 |
| 19 | `tjfs_nb_forfait_total_journee` | smallint | 5 | non |  | 231 |
| 20 | `tjfs_nb_forfait_total_JH` | smallint | 5 | non |  | 619 |

## Valeurs distinctes

### `tjfs_code_saison` (2 valeurs)

```
E, H
```

### `tjfs_nb_forfait_demi_journee` (1 valeurs)

```
0
```

### `tjfs_nb_forfait_1jour` (17 valeurs)

```
0, 1, 10, 12, 14, 16, 19, 2, 3, 4, 49, 5, 6, 7, 74, 8, 9
```

### `tjfs_nb_forfait_7jours` (23 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 18, 19, 2, 21, 25, 28, 3, 32, 4, 5, 6, 7, 8, 9
```

### `tjfs_nb_forfait_8jours` (32 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 23, 25, 26, 27, 28, 29, 3, 30, 39, 4, 40, 48, 5, 6, 7, 8, 9
```

### `tjfs_nb_forfait_9jours` (27 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 21, 22, 24, 25, 26, 3, 4, 48, 5, 50, 6, 7, 8, 9
```

### `tjfs_nb_forfait_10jours` (28 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 25, 3, 32, 4, 40, 42, 5, 6, 7, 8, 9
```

### `tjfs_nb_forfait_11jours` (15 valeurs)

```
0, 1, 10, 11, 14, 2, 22, 3, 34, 4, 5, 6, 7, 8, 9
```

### `tjfs_nb_forfait_12jours` (14 valeurs)

```
0, 1, 10, 11, 12, 13, 2, 3, 4, 5, 6, 7, 8, 9
```

### `tjfs_nb_forfait_13jours` (21 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 19, 2, 20, 23, 3, 4, 5, 6, 7, 8, 9
```

### `tjfs_nb_forfait_14jours` (5 valeurs)

```
0, 1, 2, 3, 4
```

### `tjfs_nb_forfait_15jours` (26 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 17, 19, 2, 21, 22, 26, 29, 3, 31, 4, 43, 5, 55, 56, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| total_jour_forfait_ski_IDX1 | NONCLUSTERED | oui | tjfs_code_saison, tjfs_date_retour |

