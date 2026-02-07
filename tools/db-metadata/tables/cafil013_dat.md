# cafil013_dat

| Info | Valeur |
|------|--------|
| Lignes | 435 |
| Colonnes | 27 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `go_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `go_compte` | int | 10 | non |  | 314 |
| 3 | `go_filiation` | int | 10 | non |  | 11 |
| 4 | `go_nom` | nvarchar | 15 | non |  | 385 |
| 5 | `go_prenom` | nvarchar | 10 | non |  | 413 |
| 6 | `go_surnom` | nvarchar | 10 | non |  | 1 |
| 7 | `go_sexe` | nvarchar | 1 | non |  | 2 |
| 8 | `go_date_naissance` | char | 8 | non |  | 116 |
| 9 | `go_age` | int | 10 | non |  | 53 |
| 10 | `go_code_service` | nvarchar | 2 | non |  | 8 |
| 11 | `go_service` | nvarchar | 25 | non |  | 8 |
| 12 | `go_fonction` | nvarchar | 25 | non |  | 27 |
| 13 | `go_contrat` | nvarchar | 15 | non |  | 5 |
| 14 | `go_code_vip` | nvarchar | 1 | non |  | 1 |
| 15 | `go_nationalite` | nvarchar | 2 | non |  | 30 |
| 16 | `go_fumeur` | nvarchar | 1 | non |  | 1 |
| 17 | `go_type_personnel` | nvarchar | 1 | non |  | 1 |
| 18 | `go_num_club` | float | 53 | non |  | 314 |
| 19 | `go_lettre_controle` | nvarchar | 1 | non |  | 1 |
| 20 | `go_filiation_club` | int | 10 | non |  | 16 |
| 21 | `go_date_debut` | char | 8 | non |  | 157 |
| 22 | `go_date_fin` | char | 8 | non |  | 90 |
| 23 | `go_facturable` | nvarchar | 1 | non |  | 3 |
| 24 | `go_cat_emploi` | nvarchar | 1 | non |  | 4 |
| 25 | `go_bsi_ok` | bit |  | non |  | 1 |
| 26 | `go_job_code` | nvarchar | 10 | non |  | 84 |
| 27 | `go_matricule_wd` | nvarchar | 30 | non |  | 138 |

## Valeurs distinctes

### `go_societe` (1 valeurs)

```
C
```

### `go_filiation` (11 valeurs)

```
0, 1, 10, 2, 3, 4, 5, 6, 7, 8, 9
```

### `go_sexe` (2 valeurs)

```
F, H
```

### `go_code_service` (8 valeurs)

```
, 01, 02, 03, 04, 05, 07, 99
```

### `go_service` (8 valeurs)

```
, ANIMATION, CONGRES/SEMINAIRE, ECONOMAT, ENFANTS, GESTION, MAINTENANCE, SPORTS
```

### `go_fonction` (27 valeurs)

```
, AIDE-GESTIONNAIRE, BABY CLUB, BARMAN, BOUCHER, CHEF DU PERSONNEL, CUISINIER, DISWASHER, ELECTRICIEN, GESTION HR, GESTIONNAIRE, HOTESSE SPORTS, HOUSEKEEPING, HOUSEKEEPING SUPERVISOR, IMPRO SUPIT-HRM, JARDINIER, KOREAN PR, LAUNDRY ATTENDENT, MAGASINIER, MINI CLUB, PUBLIC AREA ATTENDENT, RECEPTIONNISTE, SONORISTE, SPORTS SECURITY ESAP, STOCKS&PROCURMENT MNG, TEENS CLUB, VILLAGE TRAINER MNG
```

### `go_contrat` (5 valeurs)

```
, AUTRE, DEVISES, F.FRANCAIS, LOCAL
```

### `go_code_vip` (1 valeurs)

```
N
```

### `go_nationalite` (30 valeurs)

```
, AS, AU, BQ, CH, CO, CS, FR, ID, IM, IO, IT, JP, MA, MU, MW, MX, MY, NL, PH, RU, SG, SN, TH, TR, TU, TW, US, ZA, ZI
```

### `go_fumeur` (1 valeurs)

```
N
```

### `go_type_personnel` (1 valeurs)

```
C
```

### `go_lettre_controle` (1 valeurs)

```
U
```

### `go_filiation_club` (16 valeurs)

```
0, 1, 10, 11, 13, 14, 15, 16, 2, 3, 4, 5, 6, 7, 8, 9
```

### `go_facturable` (3 valeurs)

```
, N, O
```

### `go_cat_emploi` (4 valeurs)

```
, 1, 2, 3
```

### `go_bsi_ok` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil013_dat_IDX_2 | NONCLUSTERED | non | go_societe, go_nom, go_prenom |
| cafil013_dat_IDX_5 | NONCLUSTERED | non | go_societe, go_date_debut, go_nom, go_prenom |
| cafil013_dat_IDX_3 | NONCLUSTERED | non | go_societe, go_prenom, go_nom |
| cafil013_dat_IDX_6 | NONCLUSTERED | non | go_societe, go_date_fin, go_nom, go_prenom |
| cafil013_dat_IDX_1 | NONCLUSTERED | oui | go_societe, go_compte, go_filiation |
| cafil013_dat_IDX_4 | NONCLUSTERED | oui | go_societe, go_type_personnel, go_num_club, go_filiation_club |

