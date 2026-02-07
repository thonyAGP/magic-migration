# histo_fus_sep

| Info | Valeur |
|------|--------|
| Lignes | 2762 |
| Colonnes | 23 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 2762 |
| 2 | `done` | bit |  | non |  | 1 |
| 3 | `type` | nvarchar | 1 | non |  | 2 |
| 4 | `date_start` | char | 8 | non |  | 704 |
| 5 | `time_start` | char | 6 | non |  | 2695 |
| 6 | `date_firstupdate` | char | 8 | non |  | 705 |
| 7 | `time_firstupdate` | char | 6 | non |  | 2696 |
| 8 | `date_tablesupdate` | char | 8 | non |  | 667 |
| 9 | `time_tablesupdate` | char | 6 | non |  | 2058 |
| 10 | `date_endupdate` | char | 8 | non |  | 705 |
| 11 | `time_endupdate` | char | 6 | non |  | 2678 |
| 12 | `date_end` | char | 8 | non |  | 705 |
| 13 | `time_end` | char | 6 | non |  | 2679 |
| 14 | `runaftercrash` | bit |  | non |  | 2 |
| 15 | `valide` | bit |  | non |  | 2 |
| 16 | `compte_reference` | int | 10 | non |  | 1834 |
| 17 | `filiation_reference` | int | 10 | non |  | 13 |
| 18 | `qualite_reference` | nvarchar | 2 | non |  | 3 |
| 19 | `etat_reseau` | nvarchar | 1 | non |  | 3 |
| 20 | `separation_n_compte` | bit |  | non |  | 1 |
| 21 | `terminal` | int | 10 | non |  | 20 |
| 22 | `utilisateur` | nvarchar | 8 | non |  | 66 |
| 23 | `hfs_hostname` | nvarchar | 50 | non |  | 2 |

## Valeurs distinctes

### `done` (1 valeurs)

```
1
```

### `type` (2 valeurs)

```
E, F
```

### `runaftercrash` (2 valeurs)

```
0, 1
```

### `valide` (2 valeurs)

```
0, 1
```

### `filiation_reference` (13 valeurs)

```
0, 1, 10, 11, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `qualite_reference` (3 valeurs)

```
, GM, GO
```

### `etat_reseau` (3 valeurs)

```
, R, S
```

### `separation_n_compte` (1 valeurs)

```
0
```

### `terminal` (20 valeurs)

```
0, 300, 430, 431, 432, 433, 500, 520, 540, 551, 570, 770, 80, 801, 810, 90, 91, 960, 980, 990
```

### `hfs_hostname` (2 valeurs)

```
, Odyssey
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| histo_fus_sep_IDX_1 | NONCLUSTERED | oui | chrono |
| histo_fus_sep_IDX_2 | NONCLUSTERED | non | done, type, compte_reference, filiation_reference |

