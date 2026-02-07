# cafil029_dat

| Info | Valeur |
|------|--------|
| Lignes | 317 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `fec_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `fec_num_compte_lie` | int | 10 | non |  | 194 |
| 3 | `fec_type_operation` | nvarchar | 1 | non |  | 2 |
| 4 | `fec_nom_cible` | nvarchar | 15 | non |  | 164 |
| 5 | `fec_prenom_cible` | nvarchar | 8 | non |  | 245 |
| 6 | `fec_nom_source` | nvarchar | 15 | non |  | 151 |
| 7 | `fec_prenom_source` | nvarchar | 8 | non |  | 201 |
| 8 | `fec_imputation` | float | 53 | non |  | 1 |
| 9 | `fec_ss_imputation` | int | 10 | non |  | 1 |
| 10 | `fec_date_operation` | char | 8 | non |  | 76 |
| 11 | `fec_heure_operation` | char | 6 | non |  | 235 |
| 12 | `fec_user` | nvarchar | 8 | non |  | 17 |
| 13 | `RowId_51` | int | 10 | non |  | 317 |

## Valeurs distinctes

### `fec_societe` (1 valeurs)

```
C
```

### `fec_type_operation` (2 valeurs)

```
E, F
```

### `fec_imputation` (1 valeurs)

```
0
```

### `fec_ss_imputation` (1 valeurs)

```
0
```

### `fec_user` (17 valeurs)

```
ARKON, ASSTFAM, BEAM, DOREEN, EVE, FAM, GIFT, JAA, JOLIE, JULIA, MICKY, MIMI, MIND, NANA, SNOW, TOMOKA, WELCMGR
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil029_dat_IDX_1 | NONCLUSTERED | non | fec_societe, fec_num_compte_lie, fec_date_operation, fec_heure_operation |
| cafil029_dat_IDX_2 | NONCLUSTERED | oui | RowId_51 |

