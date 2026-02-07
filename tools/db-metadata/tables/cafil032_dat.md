# cafil032_dat

| Info | Valeur |
|------|--------|
| Lignes | 29176 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pks_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `pks_numero_de_piece` | int | 10 | non |  | 29176 |
| 3 | `pks_annulation` | nvarchar | 1 | non |  | 4 |
| 4 | `pks_date_comptable` | char | 8 | non |  | 1564 |
| 5 | `pks_date_operation` | char | 8 | non |  | 1568 |
| 6 | `pks_heure_operation` | char | 6 | non |  | 6466 |
| 7 | `pks_imputation` | float | 53 | non |  | 221 |
| 8 | `pks_recette_depense` | nvarchar | 1 | non |  | 2 |
| 9 | `pks_libelle` | nvarchar | 20 | non |  | 9545 |
| 10 | `pks_montant` | float | 53 | non |  | 14311 |
| 11 | `pks_user` | nvarchar | 8 | non |  | 2 |
| 12 | `pks_operateur` | nvarchar | 8 | non |  | 3 |
| 13 | `pks_autorisation` | bit |  | non |  | 1 |

## Valeurs distinctes

### `pks_societe` (1 valeurs)

```
C
```

### `pks_annulation` (4 valeurs)

```
, A, N, X
```

### `pks_recette_depense` (2 valeurs)

```
D, R
```

### `pks_user` (2 valeurs)

```
, PDC-AUTO
```

### `pks_operateur` (3 valeurs)

```
ASSTFAM, DSIOP, FAM
```

### `pks_autorisation` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil032_dat_IDX_3 | NONCLUSTERED | non | pks_societe, pks_date_comptable, pks_recette_depense, pks_numero_de_piece |
| cafil032_dat_IDX_1 | NONCLUSTERED | oui | pks_societe, pks_numero_de_piece |
| cafil032_dat_IDX_2 | NONCLUSTERED | non | pks_societe, pks_date_comptable, pks_imputation |
| cafil032_dat_IDX_4 | NONCLUSTERED | non | pks_societe, pks_date_comptable, pks_user, pks_recette_depense |

