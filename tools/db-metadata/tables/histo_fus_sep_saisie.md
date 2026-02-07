# histo_fus_sep_saisie

| Info | Valeur |
|------|--------|
| Lignes | 4083 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono_f_e` | float | 53 | non |  | 2180 |
| 2 | `societe` | nvarchar | 1 | non |  | 1 |
| 3 | `compte_reference` | int | 10 | non |  | 1711 |
| 4 | `filiation_reference` | int | 10 | non |  | 11 |
| 5 | `compte_pointe_old` | int | 10 | non |  | 2527 |
| 6 | `filiation_pointe_old` | int | 10 | non |  | 24 |
| 7 | `compte_pointe_new` | int | 10 | non |  | 2261 |
| 8 | `filiation_pointe_new` | int | 10 | non |  | 43 |
| 9 | `type_f_e` | nvarchar | 1 | non |  | 2 |
| 10 | `nom` | nvarchar | 30 | non |  | 1635 |
| 11 | `prenom` | nvarchar | 8 | non |  | 2744 |
| 12 | `nomprenom` | nvarchar | 20 | non |  | 3290 |
| 13 | `pointage_separation` | bit |  | non |  | 2 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `filiation_reference` (11 valeurs)

```
0, 1, 10, 11, 2, 3, 4, 5, 7, 8, 9
```

### `filiation_pointe_old` (24 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 3, 4, 5, 6, 7, 8, 9
```

### `filiation_pointe_new` (43 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 41, 42, 5, 6, 7, 8, 9
```

### `type_f_e` (2 valeurs)

```
E, F
```

### `pointage_separation` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| histo_fus_sep_saisie_IDX_2 | NONCLUSTERED | oui | chrono_f_e, societe, compte_pointe_new, filiation_pointe_new |
| histo_fus_sep_saisie_IDX_3 | NONCLUSTERED | non | pointage_separation |
| histo_fus_sep_saisie_IDX_1 | NONCLUSTERED | oui | chrono_f_e, societe, compte_reference, filiation_reference, compte_pointe_old, filiation_pointe_old |

