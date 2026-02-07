# cafil059_dat

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `soc_code` | nvarchar | 1 | non |  | 5 |
| 2 | `soc_libelle` | nvarchar | 20 | non |  | 3 |
| 3 | `soc_code_cntr__acces` | nvarchar | 1 | non |  | 3 |
| 4 | `soc_installation` | nvarchar | 20 | non |  | 2 |
| 5 | `soc_honey_moon_1_2` | nvarchar | 15 | non |  | 2 |
| 6 | `soc_honey_moon_3_4` | nvarchar | 15 | non |  | 2 |
| 7 | `soc_interval__menage` | int | 10 | non |  | 2 |
| 8 | `soc_capacite_midi` | int | 10 | non |  | 2 |
| 9 | `soc_capacite_soir` | int | 10 | non |  | 2 |
| 10 | `soc_nb_lit_comm` | int | 10 | non |  | 2 |
| 11 | `soc_lieu_sejour_defaut` | nvarchar | 1 | non |  | 1 |
| 12 | `soc_etat_eff_par_lieusejour` | nvarchar | 1 | non |  | 1 |
| 13 | `soc_age_max_bas_age` | int | 10 | non |  | 1 |
| 14 | `soc_age_max_enfant` | int | 10 | non |  | 1 |
| 15 | `soc_age_max_adulte` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `soc_code` (5 valeurs)

```
A, B, C, D, G
```

### `soc_libelle` (3 valeurs)

```
, Club MÃ©diterranÃ©e, Contry Club
```

### `soc_code_cntr__acces` (3 valeurs)

```
, 1, 2
```

### `soc_installation` (2 valeurs)

```
, PHUKET
```

### `soc_honey_moon_1_2` (2 valeurs)

```
, PHUHMCPHUHMD
```

### `soc_honey_moon_3_4` (2 valeurs)

```
, PHUHMSHMOONF
```

### `soc_interval__menage` (2 valeurs)

```
0, 7
```

### `soc_capacite_midi` (2 valeurs)

```
0, 8
```

### `soc_capacite_soir` (2 valeurs)

```
0, 8
```

### `soc_nb_lit_comm` (2 valeurs)

```
0, 718
```

### `soc_etat_eff_par_lieusejour` (1 valeurs)

```
N
```

### `soc_age_max_bas_age` (1 valeurs)

```
12
```

### `soc_age_max_enfant` (1 valeurs)

```
17
```

### `soc_age_max_adulte` (1 valeurs)

```
999
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil059_dat_IDX_1 | NONCLUSTERED | oui | soc_code |

