# statpooling_dat

| Info | Valeur |
|------|--------|
| Lignes | 1982 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date` | char | 8 | non |  | 1982 |
| 2 | `nbre_check_in` | int | 10 | non |  | 9 |
| 3 | `nbre_check_out` | int | 10 | non |  | 14 |
| 4 | `nbre_check_in_reussi` | int | 10 | non |  | 1 |
| 5 | `nbre_check_out_reussi` | int | 10 | non |  | 1 |
| 6 | `nbre_check_in_errreur` | int | 10 | non |  | 1 |
| 7 | `nbre_check_out_erreur` | int | 10 | non |  | 1 |
| 8 | `nbre_ticket` | int | 10 | non |  | 128 |
| 9 | `date_reception_ticket` | char | 8 | non |  | 810 |
| 10 | `heure_reception_ticket` | char | 6 | non |  | 301 |

## Valeurs distinctes

### `nbre_check_in` (9 valeurs)

```
0, 1, 11, 14, 2, 3, 5, 7, 8
```

### `nbre_check_out` (14 valeurs)

```
0, 1, 10, 1024, 16, 18, 2, 3, 4, 5, 6, 7, 8, 9
```

### `nbre_check_in_reussi` (1 valeurs)

```
0
```

### `nbre_check_out_reussi` (1 valeurs)

```
0
```

### `nbre_check_in_errreur` (1 valeurs)

```
0
```

### `nbre_check_out_erreur` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| statpooling_dat_IDX_1 | NONCLUSTERED | oui | date |

