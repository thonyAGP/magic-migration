# cafil062_dat

| Info | Valeur |
|------|--------|
| Lignes | 415 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mou_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `mou_code_operation` | nvarchar | 4 | non |  | 1 |
| 3 | `mou_date` | char | 8 | non |  | 193 |
| 4 | `mou_num` | int | 10 | non |  | 415 |
| 5 | `mou_nom` | nvarchar | 15 | non |  | 274 |
| 6 | `mou_prenom` | nvarchar | 10 | non |  | 363 |
| 7 | `mou_qualite` | nvarchar | 2 | non |  | 2 |
| 8 | `mou_type_client` | nvarchar | 1 | non |  | 2 |
| 9 | `mou_num_adherent` | float | 53 | non |  | 252 |
| 10 | `mou_lettre_controle` | nvarchar | 1 | non |  | 18 |
| 11 | `mou_filiation` | int | 10 | non |  | 28 |
| 12 | `mou_date_debut` | char | 8 | non |  | 186 |
| 13 | `mou_date_fin` | char | 8 | non |  | 194 |
| 14 | `mou_motif` | nvarchar | 30 | non |  | 35 |
| 15 | `mou_imprime__` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `mou_societe` (1 valeurs)

```
C
```

### `mou_code_operation` (1 valeurs)

```
SUPP
```

### `mou_qualite` (2 valeurs)

```
GM, GO
```

### `mou_type_client` (2 valeurs)

```
, C
```

### `mou_lettre_controle` (18 valeurs)

```
, A, C, D, E, F, H, J, K, L, M, N, Q, T, U, W, Y, Z
```

### `mou_filiation` (28 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 3, 4, 5, 6, 7, 8, 9
```

### `mou_motif` (35 valeurs)

```
, CANCEL BOOKING, CANNOT VALIDATE, CANNOT VALIDATE NAME, CORRECT NAME CREATED, CREATE DOUBLE NAME, CREATE WRONG, CREATE WRONG DEPARTURE DATE, CREATED ALREADY, DEJA CREE, DEJA CREEE, DOUBLE, DOUBLE CREATED, DOUBLE CREATION, DOUBLE IMPORT, DOUBLE NAME, DOUBLON, DUPLICATED, ERROR, HOPITAL, HOSPITAL NO SHOW, MISTAKE, NAME DOESNT APPEAR, NO CLIENT NO., NO NAME/ERROR, NO SHOW / CXL BOOKING, NONAME, NOT ARRIVING, OUT OF NA, TRAINING, WRONG, WRONG CREATE, WRONG CREATION, WRONG INPUT, WRONG TYPE
```

### `mou_imprime__` (1 valeurs)

```
N
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil062_dat_IDX_1 | NONCLUSTERED | oui | mou_societe, mou_code_operation, mou_date, mou_num |
| cafil062_dat_IDX_2 | NONCLUSTERED | non | mou_societe, mou_imprime__ |

